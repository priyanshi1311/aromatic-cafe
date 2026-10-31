import { useState, useEffect, useMemo, useCallback } from 'react';
import { customerService } from '../../services';
import { Spinner, EmptyState } from '../../components/UI';
import { StatusBadge } from '../../components/Badge';
import toast from 'react-hot-toast';
import CustomerRow from '../../components/CustomerRow';
import { debounce } from 'lodash';

const CustomerProfileModal = ({ customer, onClose, onSave, saving }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    name: customer.name || '',
    phone: customer.phone || '',
    email: customer.email || '',
    tag: customer.tag || 'Regular',
    notes: customer.notes || '',
  });
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (customer._id) {
      setLoadingHistory(true);
      customerService.getCustomerById(customer._id)
        .then(res => {
          setHistory(res.data.data?.bookings || []);
        })
        .catch(() => {
          setHistory([]);
        })
        .finally(() => {
          setLoadingHistory(false);
        });
    }
  }, [customer._id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-[#f3d7df] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl animate-fade-in overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#fce7ec] flex items-center justify-between bg-gradient-to-r from-[#fdf8f5] to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#fce7ec] border border-[#f3d7df] flex items-center justify-center text-xl">
              {formData.tag === 'VIP' ? '👑' : formData.tag === 'Blacklisted' ? '⛔' : '👤'}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {customer._id ? formData.name || 'Guest Profile' : 'New Guest Registration'}
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                {customer.phone || 'Enter guest contact details'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 text-lg font-bold"
          >
            ×
          </button>
        </div>

        {/* Tab switch (only if existing customer) */}
        {customer._id && (
          <div className="flex border-b border-[#fce7ec] bg-[#fffafc] px-6 pt-2">
            <button
              onClick={() => setActiveTab('profile')}
              className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                activeTab === 'profile'
                  ? 'border-[#d85d85] text-[#b83a65]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              📋 Profile & CRM Info
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'history'
                  ? 'border-[#d85d85] text-[#b83a65]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>📅 Visit History</span>
              <span className="bg-[#fce7ec] text-[#b83a65] text-[10px] px-1.5 py-0.2 rounded-full font-extrabold">
                {history.length}
              </span>
            </button>
          </div>
        )}

        {/* Body content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {activeTab === 'profile' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Quick CRM Metrics (if existing) */}
              {customer._id && (
                <div className="grid grid-cols-3 gap-3 bg-[#fdf8f5] p-3 rounded-xl border border-[#f3d7df]">
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Visits</p>
                    <p className="text-base font-extrabold text-[#b83a65]">{customer.visitCount || 0}</p>
                  </div>
                  <div className="text-center border-x border-[#f3d7df]">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bookings</p>
                    <p className="text-base font-extrabold text-slate-800">{customer.totalBookings || history.length || 0}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cancellations</p>
                    <p className="text-base font-extrabold text-rose-600">{customer.totalCancellations || 0}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priya Sharma"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">Phone Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. +91 9876543210"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="form-input font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Email Address (Optional)</label>
                  <input
                    type="email"
                    placeholder="e.g. priya@gmail.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">Customer CRM Tag</label>
                  <select
                    value={formData.tag}
                    onChange={e => setFormData({ ...formData, tag: e.target.value })}
                    className="form-input font-semibold"
                  >
                    <option value="Regular">🌸 Regular Guest</option>
                    <option value="VIP">👑 VIP Patron</option>
                    <option value="Blacklisted">⛔ Blacklisted</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">CRM Staff Notes & Guest Preferences</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Likes rooftop seating, allergic to mushrooms, celebrates wedding anniversary in Nov..."
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="form-input resize-none text-xs leading-relaxed"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-secondary flex-1 text-xs py-2.5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary flex-1 text-xs py-2.5"
                >
                  {saving ? 'Saving...' : 'Save Guest Profile ✨'}
                </button>
              </div>
            </form>
          ) : (
            <div>
              {loadingHistory ? (
                <div className="flex justify-center py-12"><Spinner size="md" /></div>
              ) : history.length === 0 ? (
                <EmptyState
                  icon="📅"
                  title="No reservations on record"
                  description="When this guest books a table, past reservation logs will automatically show up here."
                />
              ) : (
                <div className="space-y-3">
                  <div className="overflow-x-auto rounded-xl border border-[#f3d7df]">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#fdf8f5] text-slate-500 border-b border-[#f3d7df]">
                        <tr>
                          <th className="py-2.5 px-3">Date & Time</th>
                          <th className="py-2.5 px-3">Table</th>
                          <th className="py-2.5 px-3">Guests</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3">Special Request</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {history.map(b => (
                          <tr key={b._id} className="hover:bg-[#fff9fa]">
                            <td className="py-2.5 px-3">
                              <p className="font-semibold text-slate-900">{b.date}</p>
                              <p className="font-mono text-[11px] text-[#b83a65]">{b.timeSlot}</p>
                            </td>
                            <td className="py-2.5 px-3 font-medium text-slate-700">
                              Table {b.table?.tableNumber || b.tableNumber || '—'}
                            </td>
                            <td className="py-2.5 px-3 text-slate-600">{b.guests}</td>
                            <td className="py-2.5 px-3">
                              <StatusBadge status={b.status} />
                            </td>
                            <td className="py-2.5 px-3 text-[11px] text-slate-500 italic max-w-[160px] truncate">
                              {b.specialRequests || 'None'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

  const fetchCustomers = useCallback(async (query = '', tag = 'all') => {
    setLoading(true);
    try {
      const params = {};
      if (query) params.search = query;
      if (tag !== 'all') params.tag = tag;
      const res = await customerService.getCustomers(params);
      setCustomers(res.data.data || []);
    } catch {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedFetch = useMemo(
    () => debounce((q, t) => fetchCustomers(q, t), 300),
    [fetchCustomers]
  );

  useEffect(() => {
    fetchCustomers(search, selectedTag);
    return () => debouncedFetch.cancel();
  }, [fetchCustomers, selectedTag]);

  const handleSearchChange = (val) => {
    setSearch(val);
    debouncedFetch(val, selectedTag);
  };

  const handleTagChange = (tag) => {
    setSelectedTag(tag);
    fetchCustomers(search, tag);
  };

  const handleSave = async (payload) => {
    setSaving(true);
    try {
      if (selected && selected._id) {
        await customerService.updateCustomer(selected._id, payload);
        toast.success('Guest CRM profile updated ✨');
      } else {
        await customerService.createCustomer(payload);
        toast.success('New guest registered');
      }
      fetchCustomers(search, selectedTag);
      setSelected(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this customer profile from CRM?')) return;
    try {
      await customerService.deleteCustomer(id);
      toast.success('Customer deleted');
      fetchCustomers(search, selectedTag);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const res = await customerService.exportCSV({
        tag: selectedTag === 'all' ? undefined : selectedTag,
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `aromatic-customers-${Date.now()}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Customer CSV exported successfully!');
    } catch {
      toast.error('Failed to export customers');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight font-serif">
            Customer Directory & CRM
          </h1>
          <p className="text-slate-500 text-xs md:text-sm mt-0.5">
            Guest CRM, dining visit history, loyalty tags, and staff notes
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            onClick={handleExportCSV}
            disabled={exporting}
            className="btn-secondary btn-sm flex items-center gap-1.5 cursor-pointer"
          >
            <span>⬇️</span>
            <span>{exporting ? 'Exporting...' : 'Export CSV'}</span>
          </button>
          <button
            onClick={() => setSelected({})}
            className="btn-primary btn-sm flex items-center gap-1.5 cursor-pointer"
          >
            <span>+</span>
            <span>Add Guest</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="card p-3 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search guests by name, phone number, email..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="form-input !py-2.5 text-xs flex-1"
          />
          <div className="flex items-center gap-1 bg-[#fdf8f5] p-1 rounded-xl border border-[#f3d7df]">
            {[
              { id: 'all', label: 'All Guests' },
              { id: 'VIP', label: '👑 VIP' },
              { id: 'Regular', label: '🌸 Regular' },
              { id: 'Blacklisted', label: '⛔ Blacklisted' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTagChange(tab.id)}
                className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  selectedTag === tab.id
                    ? 'bg-[#d85d85] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : customers.length === 0 ? (
          <EmptyState
            icon="👥"
            title="No customers found"
            description="Guests who make reservations will automatically appear in this CRM list."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="pl-6">Guest Profile</th>
                  <th>Phone Number</th>
                  <th>Email</th>
                  <th>CRM Tag</th>
                  <th className="text-center">Total Visits</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map(c => (
                  <CustomerRow
                    key={c._id}
                    customer={c}
                    onEdit={() => setSelected(c)}
                    onDelete={() => handleDelete(c._id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer CRM Profile Modal */}
      {selected && (
        <CustomerProfileModal
          customer={selected}
          onClose={() => setSelected(null)}
          onSave={handleSave}
          saving={saving}
        />
      )}
    </div>
  );
};

export default CustomersPage;
