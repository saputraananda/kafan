import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Boxes, DollarSign, Truck, Tags, LogOut } from 'lucide-react';
import { clearAuth } from '../utils/api';
import { useNavigate } from 'react-router-dom';

const links = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { divider: 'Inventory' },
  { to: '/barang', icon: Boxes, label: 'Stok Kain Kafan' },
  { to: '/keuangan', icon: DollarSign, label: 'Kas Masuk / Keluar' },
  { divider: 'Ambulance' },
  { to: '/transaksi', icon: Truck, label: 'Transaksi Ambulance' },
  { to: '/harga', icon: Tags, label: 'Daftar Harga' },
];

export default function Sidebar({ open, onClose, isMobile, collapsed = false }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const widthClass = collapsed ? 'w-20' : 'w-64';
  const translateClass = isMobile ? (open ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0';
  const sidebarClass = `fixed top-0 left-0 z-40 h-full ${widthClass} bg-gradient-to-b from-slate-950 to-slate-900 border-r border-white/5 flex flex-col transition-all duration-200 ${translateClass}`;

  return (
    <aside className={sidebarClass}>
      {/* Brand */}
      <div className={`flex items-center border-b border-white/5 py-4 ${collapsed ? 'justify-center px-3' : 'gap-3 px-4'}`}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-900/20">
          <Truck size={16} />
        </div>
        {!collapsed && <div className="min-w-0">
          <p className="text-sm font-bold text-white truncate">Ambulance Pondok Bambu</p>
          <p className="text-[10px] text-slate-400 truncate">Pondok Bambu, Jakarta Timur</p>
        </div>}
      </div>

      {/* Nav */}
      <nav className={`flex-1 overflow-y-auto py-3 space-y-0.5 ${collapsed ? 'px-1' : 'px-2'}`}>
        {links.map((l, i) =>
          l.divider ? (
            collapsed ? (
              <div key={i} className="my-3 mx-2 h-px bg-white/10" />
            ) : (
              <p key={i} className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 px-2 pt-4 pb-1">{l.divider}</p>
            )
          ) : (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={() => isMobile && onClose()}
              title={collapsed ? l.label : undefined}
              className={({ isActive }) => {
                const base = 'flex items-center rounded-lg text-sm font-medium transition-colors';
                const layout = collapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2';
                const state = isActive
                  ? `bg-emerald-400/10 text-emerald-200 ${collapsed ? '' : 'border-l-2 border-emerald-300'}`
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5';
                return `${base} ${layout} ${state}`;
              }}
            >
              <l.icon size={16} className="shrink-0" />
              <span className={collapsed ? 'sr-only' : ''}>{l.label}</span>
            </NavLink>
          )
        )}
      </nav>

      {/* Logout */}
      <div className={`py-3 border-t border-white/5 ${collapsed ? 'px-1' : 'px-2'}`}>
        <button
          onClick={handleLogout}
          title={collapsed ? 'Keluar' : undefined}
          className={`flex items-center w-full rounded-lg text-sm text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors ${collapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2'}`}
        >
          <LogOut size={16} />
          <span className={collapsed ? 'sr-only' : ''}>Keluar</span>
        </button>
      </div>
    </aside>
  );
}
