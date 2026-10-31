import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { to: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
  { to: '/admin/bookings', icon: '📋', label: 'Bookings' },
  { to: '/admin/tables', icon: '🪑', label: 'Tables' },
  { to: '/admin/customers', icon: '👥', label: 'Customers' },
  { to: '/admin/qr', icon: '📱', label: 'QR Codes' },
  { to: '/admin/settings', icon: '⚙️', label: 'Settings' },
];

const Sidebar = ({ onClose }) => {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-[#f3d7df] w-64 shadow-xs">
      {/* Brand Logo */}
      <div className="px-6 py-5 border-b border-[#fce7ec]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-[#d85d85] to-[#b83a65] rounded-xl flex items-center justify-center text-white font-extrabold text-lg shadow-sm shadow-[#d85d85]/30">
            🌸
          </div>
          <div>
            <p className="text-slate-900 font-bold text-sm tracking-tight leading-tight">Aromatic</p>
            <p className="text-slate-400 text-xs font-medium">Cafe & Restaurant Admin</p>
          </div>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) =>
              `sidebar-item ${isActive ? 'active' : ''}`
            }
          >
            <span className="text-base">{item.icon}</span>
            <span className="text-sm font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Admin Profile & Logout */}
      <div className="p-3 border-t border-[#fce7ec]">
        <div className="p-3 rounded-xl bg-[#fdf8f5] border border-[#f3d7df] mb-2">
          <p className="text-slate-800 text-xs font-bold truncate">{admin?.name || 'Cafe Manager'}</p>
          <p className="text-slate-400 text-[11px] truncate">{admin?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors text-xs font-semibold cursor-pointer"
        >
          <span>🚪</span>
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
