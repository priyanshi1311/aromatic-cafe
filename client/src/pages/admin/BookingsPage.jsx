import { useState, useEffect, useCallback } from 'react';
import { bookingService, tableService } from '../../services';
import { Spinner, EmptyState } from '../../components/UI';
import { StatusBadge } from '../../components/Badge';
import toast from 'react-hot-toast';

const STATUSES = ['Pending', 'Confirmed', 'Seated', 'Completed', 'Cancelled', 'No-show'];

const BookingRow = ({ booking, onStatusChange, onSelect }) => (
  <tr className="cursor-pointer hover:bg-[#fff9fa] transition-colors" onClick={() => onSelect(booking)}>
    <td className="pl-6 font-mono font-bold text-xs" style={{ color: '#b83a65' }}>{booking.bookingId}</td>
    <td>
      <p className="font-semibold text-slate-900">{booking.customerName}</p>
      <p className="text-slate-400 text-xs">{booking.customerPhone}</p>
    </td>
    <td>
      <p className="text-slate-800 font-medium">{booking.date}</p>
      <p className="text-slate-400 text-xs">{booking.timeSlot}</p>
    </td>
    <td className="text-slate-700 font-medium">Table {booking.tableNumber}</td>
    <td className="text-slate-600">{booking.guests}</td>
    <td><StatusBadge status={booking.status} /></td>
    <td onClick={e => e.stopPropagation()}>
      <select
        value={booking.status}
        onChange={e => onStatusChange(booking._id, e.target.value)}
        className="bg-white text-slate-700 text-xs border border-[#f3d7df] rounded-lg px-2.5 py-1.5 shadow-xs focus:ring-1 focus:ring-[#d85d85] font-medium"
      >
        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
      </select>
    </td>
  </tr>
);

const BookingModal = ({ booking, onClose, onUpdate }) => {
  const [form, setForm] = useState({
    status: booking.status, adminNotes: booking.adminNotes || '',
    date: booking.date, timeSlot: booking.timeSlot, guests: booking.guests,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await bookingService.updateBooking(booking._id, form);
      toast.success('Reservation updated');
      onUpdate();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md shadow-xl animate-fade-in">
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">Edit Reservation</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-xl font-bold">×</button>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/70 space-y-2.5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-slate-400 text-xs mb-0.5">Booking Reference</p>
                <p className="font-mono font-bold text-sm" style={{ color: '#b83a65' }}>{booking.bookingId}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs mb-0.5">Assigned Table</p>
                <p className="text-slate-800 text-xs font-bold">Table {booking.tableNumber}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200/60 text-xs">
              <div>
                <p className="text-slate-400 text-[11px] mb-0.5">Guest Contact</p>
                <p className="text-slate-900 font-semibold">{booking.customerName}</p>
                <p className="text-slate-500 font-mono text-[11px]">{booking.customerPhone}</p>
              </div>
              <div>
                <p className="text-slate-400 text-[11px] mb-0.5">Email Address</p>
                <p className="text-slate-700 truncate text-[11px]">{booking.customerEmail || '—'}</p>
              </div>
            </div>
            {booking.specialRequests && (
              <div className="pt-2 border-t border-slate-200/60">
                <p className="text-slate-400 text-[11px] font-semibold mb-1">Guest Request / Package Inquiry:</p>
                <p className="text-xs text-rose-800 bg-rose-50/80 p-2.5 rounded-lg border border-rose-100 font-medium leading-relaxed">
                  {booking.specialRequests}
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">Date</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="form-input" />
            </div>
            <div>
              <label className="form-label">Time Slot</label>
              <input type="time" value={form.timeSlot} onChange={e => setForm(f => ({ ...f, timeSlot: e.target.value }))} className="form-input" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">Guests</label>
              <input type="number" min={1} max={20} value={form.guests} onChange={e => setForm(f => ({ ...f, guests: parseInt(e.target.value) }))} className="form-input" />
            </div>
            <div>
              <label className="form-label">Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="form-input">
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="form-label">Staff Internal Notes</label>
            <textarea
              value={form.adminNotes}
              onChange={e => setForm(f => ({ ...f, adminNotes: e.target.value }))}
              rows={2}
              className="form-input resize-none"
              placeholder="e.g. VIP guest, requested quiet corner table..."
            />
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                const rawPhone = (booking.customerPhone || '').replace(/[^\d]/g, '');
                const phone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
                const msg = `*Aromatic Cafe & Restaurant Confirmation*\n\nHello ${booking.customerName},\nYour reservation is confirmed! 🌸\n\n📅 Date: ${booking.date}\n🕐 Time: ${booking.timeSlot}\n🪑 Table: Table ${booking.tableNumber}\n👥 Guests: ${booking.guests}\n🎫 Booking ID: ${booking.bookingId}\n\n📍 NH 58, Haridwar Road, Roorkee\n📞 Contact: +91 8077049464\nWe look forward to hosting you!`;
                window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
              }}
              className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold py-2 px-3 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <span>💬</span>
              <span>Send WhatsApp Confirmation</span>
            </button>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="btn-secondary flex-1 text-sm py-2.5">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 text-sm py-2.5">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const BookingCalendarView = ({ onSelectBooking }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [monthBookings, setMonthBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const fetchMonthBookings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await bookingService.getBookings({ limit: 500 });
      setMonthBookings(res.data.data || []);
    } catch {
      toast.error('Failed to load calendar events');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMonthBookings();
  }, [fetchMonthBookings, currentMonth]);

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const bookingsByDate = useMemo(() => {
    const map = {};
    monthBookings.forEach(b => {
      if (!map[b.date]) map[b.date] = [];
      map[b.date].push(b);
    });
    return map;
  }, [monthBookings]);

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));
  const goToday = () => {
    const now = new Date();
    setCurrentMonth(now);
    setSelectedDate(now.toISOString().split('T')[0]);
  };

  const selectedDayBookings = bookingsByDate[selectedDate] || [];

  return (
    <div className="space-y-6">
      {/* Calendar Controls */}
      <div className="card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="font-serif text-xl font-extrabold text-slate-900 tracking-tight">
            {monthName}
          </h2>
          <button
            onClick={goToday}
            className="text-xs font-bold text-[#b83a65] bg-[#fce7ec] hover:bg-[#fad5df] px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
          >
            Today
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="btn-secondary btn-sm !px-3 !py-1.5 cursor-pointer font-bold"
          >
            ← Prev
          </button>
          <button
            onClick={nextMonth}
            className="btn-secondary btn-sm !px-3 !py-1.5 cursor-pointer font-bold"
          >
            Next →
          </button>
        </div>
      </div>

      {/* Monthly Grid */}
      <div className="card p-4 overflow-hidden">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1.5 text-center mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-xs font-bold text-slate-400 py-1 uppercase tracking-wider">
              {d}
            </div>
          ))}
        </div>

        {/* Day Cells */}
        <div className="grid grid-cols-7 gap-1.5">
          {/* Leading empty days */}
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[75px] sm:min-h-[90px] rounded-xl bg-slate-50/50 border border-transparent" />
          ))}

          {/* Month Days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const dayList = bookingsByDate[dateStr] || [];
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedDate;

            return (
              <div
                key={dateStr}
                onClick={() => setSelectedDate(dateStr)}
                className={`min-h-[75px] sm:min-h-[90px] p-2 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#d85d85] bg-[#fff5f8] shadow-sm ring-2 ring-[#d85d85]/30'
                    : isToday
                    ? 'border-[#d85d85]/50 bg-[#fffafc]'
                    : 'border-slate-100 hover:border-[#f3d7df] hover:bg-[#fff9fa] bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold rounded-md w-6 h-6 flex items-center justify-center ${
                      isToday
                        ? 'bg-[#d85d85] text-white'
                        : isSelected
                        ? 'text-[#b83a65]'
                        : 'text-slate-700'
                    }`}
                  >
                    {dayNum}
                  </span>
                  {dayList.length > 0 && (
                    <span className="w-2 h-2 rounded-full bg-[#d85d85]" />
                  )}
                </div>

                {dayList.length > 0 ? (
                  <div className="mt-1">
                    <span
                      style={{
                        background: '#fce7ec',
                        color: '#b83a65',
                        border: '1px solid #f3d7df',
                        borderRadius: '6px',
                        padding: '1px 5px',
                        fontSize: '10px',
                        fontWeight: 700,
                        display: 'inline-block',
                      }}
                      className="truncate max-w-full"
                    >
                      🌸 {dayList.length} {dayList.length === 1 ? 'booking' : 'bookings'}
                    </span>
                  </div>
                ) : (
                  <div className="text-[10px] text-slate-300 hidden sm:block">Open</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Agenda */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#fce7ec]">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-serif">
              Reservations for {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </h3>
            <p className="text-xs text-slate-500">
              {selectedDayBookings.length} total scheduled reservations
            </p>
          </div>
        </div>

        {selectedDayBookings.length === 0 ? (
          <EmptyState
            icon="📅"
            title="No reservations on this date"
            description="There are currently no dining bookings scheduled for this date."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {selectedDayBookings.map(b => (
              <div
                key={b._id}
                onClick={() => onSelectBooking(b)}
                className="p-3.5 rounded-xl border border-[#f3d7df] bg-[#fffafc] hover:bg-white hover:shadow-md transition-all cursor-pointer flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono font-bold text-xs" style={{ color: '#b83a65' }}>
                      {b.timeSlot}
                    </span>
                    <StatusBadge status={b.status} />
                  </div>
                  <p className="text-sm font-bold text-slate-900">{b.customerName}</p>
                  <p className="text-xs text-slate-500 font-mono">{b.customerPhone}</p>
                  <p className="text-xs text-slate-700 mt-1 font-semibold">
                    🪑 Table {b.tableNumber} · 👥 {b.guests} guests
                  </p>
                  {b.specialRequests && (
                    <p className="text-[11px] text-rose-700 bg-rose-50/70 p-1.5 rounded-md border border-rose-100 mt-2 italic truncate">
                      "{b.specialRequests}"
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[#fce7ec] text-xs">
                  <span className="font-mono text-slate-400 text-[10px]">{b.bookingId}</span>
                  <span className="text-[#b83a65] font-bold">Edit Details →</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const BookingsPage = () => {
  const [viewMode, setViewMode] = useState('table');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filters, setFilters] = useState({ date: '', status: '', search: '', page: 1 });
  const [total, setTotal] = useState(0);
  const [tables, setTables] = useState([]);
  const [exporting, setExporting] = useState(false);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters };
      if (!params.date) delete params.date;
      if (!params.status) delete params.status;
      if (!params.search) delete params.search;
      const res = await bookingService.getBookings(params);
      setBookings(res.data.data);
      setTotal(res.data.total);
    } catch {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);
  useEffect(() => { tableService.getTables().then(r => setTables(r.data.data)).catch(() => {}); }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await bookingService.updateBooking(id, { status });
      toast.success(`Status updated to ${status}`);
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await bookingService.exportCSV({ date: filters.date, status: filters.status });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `bookings-${Date.now()}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(f => ({ ...f, [key]: value, page: 1 }));
  };

  return (
    <div className="space-y-6 animate-fade-in w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight font-serif">
            Bookings Manager
          </h1>
          <p className="text-slate-500 text-xs md:text-sm mt-0.5">{total} total reservations on record</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-[#fdf8f5] p-1 rounded-xl border border-[#f3d7df]">
            <button
              onClick={() => setViewMode('table')}
              className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'table'
                  ? 'bg-[#d85d85] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>📋</span>
              <span>Table View</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'calendar'
                  ? 'bg-[#d85d85] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>📅</span>
              <span>Calendar View</span>
            </button>
          </div>

          <button
            onClick={handleExport}
            disabled={exporting}
            className="btn-secondary btn-sm flex items-center gap-1.5 cursor-pointer"
          >
            <span>⬇️</span>
            <span>{exporting ? 'Exporting...' : 'Export CSV'}</span>
          </button>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <BookingCalendarView onSelectBooking={setSelected} />
      ) : (
        <>
          {/* Filter Bar */}
          <div className="card p-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Search guest, phone, booking ID..."
                value={filters.search}
                onChange={e => handleFilterChange('search', e.target.value)}
                className="form-input !py-2.5 text-xs"
              />
              <input
                type="date"
                value={filters.date}
                onChange={e => handleFilterChange('date', e.target.value)}
                className="form-input !py-2.5 text-xs"
              />
              <select
                value={filters.status}
                onChange={e => handleFilterChange('status', e.target.value)}
                className="form-input !py-2.5 text-xs"
              >
                <option value="">All Reservation Statuses</option>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            {(filters.date || filters.status || filters.search) && (
              <button
                onClick={() => setFilters({ date: '', status: '', search: '', page: 1 })}
                style={{ color: '#b83a65' }}
                className="text-xs mt-2.5 font-semibold hover:underline block cursor-pointer"
              >
                × Clear all filters
              </button>
            )}
          </div>

          {/* Table Card */}
          <div className="card p-0 overflow-hidden">
            {loading ? (
              <div className="flex justify-center py-20"><Spinner size="lg" /></div>
            ) : bookings.length === 0 ? (
              <EmptyState icon="📋" title="No bookings found" description="Try selecting a different date range or adjusting filters." />
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th className="pl-6">Booking ID</th>
                      <th>Customer</th>
                      <th>Date & Time</th>
                      <th>Table</th>
                      <th>Guests</th>
                      <th>Status</th>
                      <th>Quick Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {bookings.map(b => (
                      <BookingRow
                        key={b._id}
                        booking={b}
                        onStatusChange={handleStatusChange}
                        onSelect={setSelected}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination */}
          {total > 20 && (
            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
              <p>Page {filters.page} of {Math.ceil(total / 20)}</p>
              <div className="flex gap-2">
                <button
                  disabled={filters.page <= 1}
                  onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}
                  className="btn-secondary btn-sm disabled:opacity-40"
                >
                  ← Prev
                </button>
                <button
                  disabled={bookings.length < 20}
                  onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}
                  className="btn-secondary btn-sm disabled:opacity-40"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {selected && (
        <BookingModal
          booking={selected}
          onClose={() => setSelected(null)}
          onUpdate={fetchBookings}
        />
      )}
    </div>
  );
};

export default BookingsPage;
