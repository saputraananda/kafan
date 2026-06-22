import { Menu } from 'lucide-react';
import { getUser } from '../utils/api';

export default function Topbar({ onToggle, title, isMobile, collapsed, offsetClass }) {
  const user = getUser();
  const name = user?.username || 'Admin';
  const initial = String(name).trim().slice(0, 1).toUpperCase() || 'A';

  return (
    <header className={`fixed top-0 left-0 right-0 z-20 h-14 bg-white border-b border-slate-200 flex items-center px-4 gap-3 shadow-sm shadow-slate-200/40 transition-all duration-200 ${offsetClass || ''}`}>
      <button onClick={onToggle} className="btn btn-ghost p-1.5 rounded-lg -ml-1" aria-label={isMobile ? 'Buka sidebar' : collapsed ? 'Buka sidebar' : 'Ciutkan sidebar'}>
        <Menu size={20} />
      </button>
      <h1 className="text-sm font-semibold text-slate-900 flex-1 truncate">
        {title || 'Ambulance Pondok Bambu'}
      </h1>
      <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full py-1 pl-2.5 pr-3">
        <span className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">
          {initial}
        </span>
        <span className="text-xs font-medium text-slate-600 hidden sm:inline">{name}</span>
      </div>
    </header>
  );
}
