export default function Field({ icon: Ic, label, required, children }) {
  return (
    <div>
      <label className="label">{label}{required && <span className="text-red-400 ml-0.5">*</span>}</label>
      <div className="relative flex items-center">
        {Ic && (
          <span className="absolute left-1.5 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-500 pointer-events-none z-10">
            <Ic size={15} />
          </span>
        )}
        {children}
      </div>
    </div>
  );
}
