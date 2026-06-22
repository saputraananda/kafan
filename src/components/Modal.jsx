import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const sizeClass = { lg: 'max-w-2xl', sm: 'max-w-sm', md: 'max-w-md' };
const badgeColor = {
  emerald: 'bg-emerald-100 text-emerald-600 ring-emerald-200',
  orange: 'bg-orange-100 text-orange-600 ring-orange-200',
  blue: 'bg-blue-100 text-blue-600 ring-blue-200',
};

export default function Modal({ open, onClose, children, size = 'md', icon: Icon, iconColor = 'emerald' }) {
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      {/* overlay */}
      <div className="absolute inset-0 bg-black/40" />
      {/* panel */}
      <div className={`relative bg-white rounded-2xl shadow-2xl shadow-slate-900/10 w-full ${sizeClass[size] || sizeClass.md} overflow-hidden max-h-[85vh] flex flex-col animate-slide-up ring-1 ring-slate-200/50`}
           onClick={e => e.stopPropagation()}>
        {/* header */}
        <div className="px-6 py-4 flex items-center gap-3 border-b border-slate-100">
          {Icon && (
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ring-1 ${badgeColor[iconColor] || badgeColor.emerald}`}>
              <Icon size={16} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-slate-900">{children[0]}</h3>
            {children[3] && <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">{children[3]}</p>}
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <X size={14} />
          </button>
        </div>
        {/* body */}
        <div className="px-6 py-5 overflow-y-auto flex-1">{children[1]}</div>
        {/* footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
          {children[2]}
        </div>
      </div>
    </div>,
    document.body
  );
}
