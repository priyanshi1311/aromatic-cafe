const STATUS_CONFIG = {
  Pending:   { cls: 'badge-pending',   label: 'Pending' },
  Confirmed: { cls: 'badge-confirmed', label: 'Confirmed' },
  Seated:    { cls: 'badge-seated',    label: 'Seated' },
  Completed: { cls: 'badge-completed', label: 'Completed' },
  Cancelled: { cls: 'badge-cancelled', label: 'Cancelled' },
  'No-show': { cls: 'badge-no-show',   label: 'No-show' },
};

const TAG_CONFIG = {
  VIP:         { cls: 'badge-vip',         label: '⭐ VIP' },
  Regular:     { cls: 'badge-regular',     label: 'Regular' },
  Blacklisted: { cls: 'badge-blacklisted', label: 'Blacklisted' },
};

export const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || { cls: 'badge-regular', label: status };
  return <span className={`badge ${config.cls}`}>{config.label}</span>;
};

export const TagBadge = ({ tag }) => {
  const config = TAG_CONFIG[tag] || TAG_CONFIG.Regular;
  return <span className={`badge ${config.cls}`}>{config.label}</span>;
};

export const Badge = ({ children }) => (
  <span className="badge badge-regular">{children}</span>
);

export default Badge;

