import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingService } from '../../services';
import { Spinner, EmptyState } from '../../components/UI';
import { StatusBadge } from '../../components/Badge';
import toast from 'react-hot-toast';

const StatCard = ({ icon, label, value, iconBg = '#fce7ec', valueColor = '#b83a65' }) => (
  <div
    style={{
      background: '#ffffff',
      border: '1.5px solid #f3d7df',
      borderRadius: '20px',
      padding: '18px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      boxShadow: '0 4px 16px rgba(216, 93, 133, 0.04)',
      minWidth: 0,
      width: '100%',
      transition: 'all 0.2s ease',
    }}
    className="hover:translate-y-[-2px] hover:shadow-md transition-all animate-fade-in"
  >
    <div
      style={{
        width: '46px',
        height: '46px',
        borderRadius: '14px',
        background: iconBg,
        border: '1px solid #f3d7df',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '22px',
        flexShrink: 0,
      }}
    >
      {icon}
    </div>
    <div style={{ minWidth: 0, flex: 1 }}>
      <p style={{ color: '#64748b', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }} className="truncate">
        {label}
      </p>
      <p style={{ color: valueColor, fontSize: '26px', fontWeight: 800, lineHeight: 1 }}>
        {value ?? '–'}
      </p>
    </div>
  </div>
);

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    try {
      const res = await bookingService.getDashboardStats();
      setData(res.data.data);
    } catch {
      toast.error('Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!data) return null;

  const { todayBookings, upcomingBookings, totalCustomers, totalCancellations, statusCounts, totalBookingsToday } = data;

  return (
    <div className="space-y-6 animate-fade-in w-full max-w-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-1">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-extrabold text-slate-900 tracking-tight">Admin Overview</h1>
          <p className="text-slate-500 text-xs md:text-sm mt-0.5">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button
          onClick={fetch}
          style={{
            background: '#ffffff',
            border: '1.5px solid #f3d7df',
            color: '#b83a65',
            borderRadius: '12px',
            padding: '8px 16px',
            fontSize: '12px',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            transition: 'all 0.15s ease',
          }}
          className="shrink-0"
          onMouseEnter={e => {
            e.currentTarget.style.background = '#fce7ec';
            e.currentTarget.style.borderColor = '#d85d85';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = '#ffffff';
            e.currentTarget.style.borderColor = '#f3d7df';
          }}
        >
          <span>🔄</span>
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Stats grid - responsive: 1 col on mobile, 2 on tablet/laptop, 4 on large screens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 w-full">
        <StatCard
          icon="🌸"
          label="Today's Bookings"
          value={totalBookingsToday}
          iconBg="#fce7ec"
          valueColor="#b83a65"
        />
        <StatCard
          icon="👥"
          label="Total Guests"
          value={totalCustomers}
          iconBg="#fff8e6"
          valueColor="#c59b27"
        />
        <StatCard
          icon="✨"
          label="Completed"
          value={statusCounts?.Completed || 0}
          iconBg="#ecfdf5"
          valueColor="#059669"
        />
        <StatCard
          icon="✕"
          label="Cancellations"
          value={totalCancellations}
          iconBg="#fff1f2"
          valueColor="#e11d48"
        />
      </div>

      {/* Status breakdown & Analytics */}
      <div
        style={{
          background: '#ffffff',
          border: '1.5px solid #f3d7df',
          borderRadius: '20px',
          padding: '20px 22px',
          boxShadow: '0 4px 16px rgba(216, 93, 133, 0.04)',
        }}
      >
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h2 style={{ fontSize: '11px', fontWeight: 800, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Reservation Analytics & Pipeline
          </h2>
          <span className="text-[11px] font-semibold text-slate-400">
            {Object.values(statusCounts || {}).reduce((a, b) => a + b, 0)} Total Reservations Processed
          </span>
        </div>

        {/* Visual Distribution Progress Bar */}
        {(() => {
          const totalAll = Object.values(statusCounts || {}).reduce((a, b) => a + b, 0) || 1;
          const colors = {
            Pending: '#f59e0b',
            Confirmed: '#10b981',
            Seated: '#d85d85',
            Completed: '#059669',
            Cancelled: '#ef4444',
            'No-show': '#64748b',
          };
          return (
            <div className="space-y-3 mb-4">
              <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                {['Completed', 'Confirmed', 'Seated', 'Pending', 'Cancelled', 'No-show'].map(s => {
                  const cnt = statusCounts?.[s] || 0;
                  const pct = Math.round((cnt / totalAll) * 100);
                  if (pct === 0) return null;
                  return (
                    <div
                      key={s}
                      title={`${s}: ${cnt} (${pct}%)`}
                      style={{
                        width: `${pct}%`,
                        backgroundColor: colors[s],
                        transition: 'width 0.4s ease',
                      }}
                    />
                  );
                })}
              </div>
            </div>
          );
        })()}

        <div className="flex flex-wrap gap-2.5">
          {['Pending', 'Confirmed', 'Seated', 'Completed', 'Cancelled', 'No-show'].map(s => (
            <div
              key={s}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                borderRadius: '12px',
                background: '#fdf8f5',
                border: '1px solid #f3d7df',
              }}
            >
              <StatusBadge status={s} />
              <span style={{ color: '#1e293b', fontWeight: 800, fontSize: '12px' }}>
                {statusCounts?.[s] || 0}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Today's bookings */}
      <div
        style={{
          background: '#ffffff',
          border: '1.5px solid #f3d7df',
          borderRadius: '20px',
          padding: '22px',
          boxShadow: '0 4px 16px rgba(216, 93, 133, 0.04)',
        }}
      >
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h2 className="font-serif text-lg font-bold text-slate-900">Today's Schedule</h2>
            <p className="text-xs text-slate-400">All reservations booked for today</p>
          </div>
          <Link
            to="/admin/bookings"
            style={{ color: '#b83a65', fontSize: '12px', fontWeight: 700, textDecoration: 'none' }}
            className="hover:underline"
          >
            View All Bookings →
          </Link>
        </div>
        {todayBookings.length === 0 ? (
          <EmptyState icon="🌸" title="No bookings today" description="No dining reservations scheduled for today yet." />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[#f3d7df]">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Guest</th>
                  <th>Table</th>
                  <th>Guests</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {todayBookings.map(b => (
                  <tr key={b._id}>
                    <td className="font-mono font-bold" style={{ color: '#b83a65' }}>{b.timeSlot}</td>
                    <td>
                      <p className="font-semibold text-slate-900">{b.customerName}</p>
                      <p className="text-slate-400 text-xs">{b.customerPhone}</p>
                    </td>
                    <td className="font-medium text-slate-800">Table {b.tableNumber}</td>
                    <td className="text-slate-600">{b.guests}</td>
                    <td><StatusBadge status={b.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upcoming bookings */}
      {upcomingBookings.length > 0 && (
        <div
          style={{
            background: '#ffffff',
            border: '1.5px solid #f3d7df',
            borderRadius: '20px',
            padding: '22px',
            boxShadow: '0 4px 16px rgba(216, 93, 133, 0.04)',
          }}
        >
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <h2 className="font-serif text-lg font-bold text-slate-900">Upcoming Reservations</h2>
              <p className="text-xs text-slate-400">Next scheduled bookings</p>
            </div>
            <Link
              to="/admin/bookings"
              style={{ color: '#b83a65', fontSize: '12px', fontWeight: 700, textDecoration: 'none' }}
              className="hover:underline"
            >
              View All →
            </Link>
          </div>
          <div className="divide-y divide-[#fce7ec]">
            {upcomingBookings.map(b => (
              <div key={b._id} className="flex items-center justify-between py-3 flex-wrap gap-2">
                <div>
                  <p className="text-slate-900 font-semibold text-sm">{b.customerName}</p>
                  <p className="text-slate-400 text-xs">
                    📅 {b.date} at <strong style={{ color: '#b83a65' }}>{b.timeSlot}</strong> · Table {b.tableNumber}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-500 text-xs font-medium">{b.guests} guests</span>
                  <StatusBadge status={b.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;