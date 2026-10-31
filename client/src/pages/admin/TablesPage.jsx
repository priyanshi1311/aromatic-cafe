import { useState, useEffect } from 'react';
import { tableService } from '../../services';
import { Spinner, EmptyState } from '../../components/UI';
import TableRow from '../../components/TableRow';
import toast from 'react-hot-toast';
import { QRCode } from 'react-qrcode-logo';

const TablesPage = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showQR, setShowQR] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchTables = async () => {
    setLoading(true);
    try {
      const res = await tableService.getTables();
      setTables(res.data.data);
    } catch {
      toast.error('Failed to load restaurant tables');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const handleSave = async (payload) => {
    setSaving(true);
    try {
      if (selected && selected._id) {
        await tableService.updateTable(selected._id, payload);
        toast.success('Table updated');
      } else {
        await tableService.createTable(payload);
        toast.success('New table created');
      }
      fetchTables();
      setSelected(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this table?')) return;
    try {
      await tableService.deleteTable(id);
      toast.success('Table deleted');
      fetchTables();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Tables & Seating</h1>
          <p className="text-slate-500 text-xs md:text-sm mt-0.5">
            Manage restaurant dining layout, capacity, and direct table QR tokens
          </p>
        </div>
        <button
          onClick={() => setSelected({ tableNumber: tables.length + 1, capacity: 4, location: 'Main Hall' })}
          className="btn-primary btn-sm self-start sm:self-auto flex items-center gap-1.5"
        >
          <span>+</span>
          <span>Add New Table</span>
        </button>
      </div>

      {/* Table List Card */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : tables.length === 0 ? (
          <EmptyState icon="🪑" title="No tables created yet" description="Add your first table to start receiving reservations." />
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="pl-6">Table #</th>
                  <th>Guest Capacity</th>
                  <th>Location</th>
                  <th>QR Code</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tables.map(t => (
                  <TableRow
                    key={t._id}
                    table={t}
                    onEdit={() => setSelected(t)}
                    onDelete={() => handleDelete(t._id)}
                    onShowQR={() => setShowQR(t)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit / Create Modal */}
      {selected && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md shadow-xl animate-fade-in">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {selected._id ? `Edit Table ${selected.tableNumber}` : 'Add New Table'}
              </h3>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-700 text-xl font-bold">×</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="form-label">Table Number</label>
                <input
                  type="number"
                  min={1}
                  value={selected.tableNumber ?? ''}
                  onChange={e => setSelected({ ...selected, tableNumber: parseInt(e.target.value) })}
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">Max Guest Capacity</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={selected.capacity ?? ''}
                  onChange={e => setSelected({ ...selected, capacity: parseInt(e.target.value) })}
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">Location / Section</label>
                <select
                  value={selected.location || 'Main Hall'}
                  onChange={e => setSelected({ ...selected, location: e.target.value })}
                  className="form-input"
                >
                  <option value="Main Hall">Main Hall</option>
                  <option value="Window">Window</option>
                  <option value="Outdoor">Outdoor / Patio</option>
                  <option value="Private">Private Dining</option>
                  <option value="Event Hall">Event Hall</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-5">
              <button onClick={() => setSelected(null)} className="btn-secondary flex-1 text-sm py-2.5">Cancel</button>
              <button onClick={() => handleSave(selected)} disabled={saving} className="btn-primary flex-1 text-sm py-2.5">
                {saving ? 'Saving...' : 'Save Table'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Preview Modal (Light Theme & Scannable) */}
      {showQR && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-sm shadow-xl animate-fade-in flex flex-col items-center text-center">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Table {showQR.tableNumber} QR Code</h3>
            <p className="text-xs text-slate-500 mb-5">
              Customers can scan this to pre-select Table {showQR.tableNumber} ({showQR.location || 'Main Hall'}).
            </p>

            <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
              <QRCode
                value={`${window.location.origin}/book?table=${showQR._id}&token=${showQR.qrToken}`}
                size={180}
                bgColor="#ffffff"
                fgColor="#0f172a"
              />
            </div>

            <div className="flex gap-3 w-full mt-6">
              <button
                onClick={() => setShowQR(null)}
                className="btn-secondary flex-1 text-xs py-2.5"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="btn-primary flex-1 text-xs py-2.5"
              >
                Print QR 🖨️
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TablesPage;
