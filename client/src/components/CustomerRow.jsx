const CustomerRow = ({ customer, onEdit, onDelete }) => {
  const isVip = customer.tag === 'VIP';
  const isBlacklisted = customer.tag === 'Blacklisted';

  return (
    <tr
      onClick={onEdit}
      className="hover:bg-[#fff9fa] cursor-pointer transition-colors"
    >
      <td className="pl-6">
        <p className="font-semibold text-slate-900">{customer.name}</p>
        {customer.notes && (
          <p className="text-[11px] text-slate-400 truncate max-w-[200px]">
            📝 {customer.notes}
          </p>
        )}
      </td>
      <td className="font-mono font-medium text-xs" style={{ color: '#b83a65' }}>
        {customer.phone}
      </td>
      <td className="text-slate-600 text-xs">{customer.email || '—'}</td>
      <td>
        <span
          style={{
            background: isVip ? '#fef3c7' : isBlacklisted ? '#fee2e2' : '#fce7ec',
            color: isVip ? '#92400e' : isBlacklisted ? '#991b1b' : '#b83a65',
            border: `1px solid ${isVip ? '#fde68a' : isBlacklisted ? '#fecaca' : '#f3d7df'}`,
            borderRadius: '9999px',
            padding: '3px 10px',
            fontSize: '11px',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          {isVip ? '👑 VIP' : isBlacklisted ? '⛔ Blacklisted' : '🌸 Regular'}
        </span>
      </td>
      <td className="text-center">
        <span
          style={{
            background: '#fdf8f5',
            color: '#1e293b',
            border: '1px solid #f3d7df',
            borderRadius: '8px',
            padding: '2px 8px',
            fontSize: '11px',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
          }}
        >
          {customer.visitCount || customer.totalBookings || 0} visits
        </span>
      </td>
      <td>
        <div className="flex items-center gap-3">
          <button
            onClick={e => { e.stopPropagation(); onEdit(); }}
            className="text-slate-700 hover:text-slate-900 font-semibold text-xs cursor-pointer flex items-center gap-1"
          >
            👤 CRM Profile
          </button>
          <button
            onClick={e => { e.stopPropagation(); onDelete(); }}
            className="text-rose-600 hover:text-rose-700 font-semibold text-xs cursor-pointer"
          >
            🗑️
          </button>
        </div>
      </td>
    </tr>
  );
};

export default CustomerRow;