const TableRow = ({ table, onEdit, onDelete, onShowQR }) => (
  <tr className="hover:bg-[#fff9fa] cursor-pointer transition-colors">
    <td className="pl-6 font-mono font-bold text-slate-900">Table {table.tableNumber}</td>
    <td className="text-slate-700 font-medium">{table.capacity} guests</td>
    <td>
      <span
        style={{
          background: '#fdf8f5',
          color: '#475569',
          border: '1px solid #f3d7df',
          borderRadius: '8px',
          padding: '2px 8px',
          fontSize: '11px',
          fontWeight: 600,
        }}
      >
        {table.location || 'Salon Rose'}
      </span>
    </td>
    <td>
      <button
        onClick={e => {
          e.stopPropagation();
          onShowQR(table);
        }}
        style={{ color: '#b83a65', fontWeight: 700, fontSize: '12px' }}
        className="hover:underline inline-flex items-center gap-1 cursor-pointer"
      >
        <span>📱</span>
        <span>View QR</span>
      </button>
    </td>
    <td>
      <div className="flex items-center gap-3">
        <button
          onClick={e => {
            e.stopPropagation();
            onEdit();
          }}
          className="text-slate-600 hover:text-slate-900 font-semibold text-xs cursor-pointer"
        >
          ✏️ Edit
        </button>
        <button
          onClick={e => {
            e.stopPropagation();
            onDelete();
          }}
          className="text-rose-600 hover:text-rose-700 font-semibold text-xs cursor-pointer"
        >
          🗑️ Delete
        </button>
      </div>
    </td>
  </tr>
);

export default TableRow;