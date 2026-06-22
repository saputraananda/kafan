import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import api from '../utils/api';
import { rupiah } from '../utils/helpers';
import Swal from 'sweetalert2';
import { Plus, Pen, Trash2, Search, ChevronDown, ChevronUp, Tags, X, MapPin, Building2, FileText, DollarSign, ClipboardList } from 'lucide-react';

const WILAYAH_COLORS = {
  'Tarif Ke Bandara': '#0ea5e9', 'Jakarta & Sekitarnya': '#8b5cf6', 'Jawa Barat': '#10b981',
  'Banten': '#f59e0b', 'Jawa Tengah': '#ef4444', 'Jawa Timur & Madura': '#3b82f6', 'DIY Jogjakarta': '#ec4899',
};
const WILAYAH_ICONS = {
  'Tarif Ke Bandara': '🛩️', 'Jakarta & Sekitarnya': '🏙️', 'Jawa Barat': '⛰️',
  'Banten': '🗺️', 'Jawa Tengah': '🧭', 'Jawa Timur & Madura': '⚓', 'DIY Jogjakarta': '🏛️',
};

export default function HargaPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterWil, setFilterWil] = useState('');
  const [filterTipe, setFilterTipe] = useState('');
  const [expanded, setExpanded] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ tipe_harga: 'Baru', wilayah: '', wilayah_custom: '', kota_tujuan: '', kota_asal: 'Tangerang', nama_layanan: '', harga: 0, status: 'Aktif', keterangan: '' });
  const [wilayahCustom, setWilayahCustom] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/harga');
      setData(res.data);
      const exp = {}; res.data.wilayahList.forEach((w, idx) => { exp[w] = idx === 0; });
      setExpanded(exp);
    } catch { Swal.fire({ icon: 'error', text: 'Gagal memuat data harga', confirmButtonColor: '#10b981' }); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { loadData(); }, [loadData]);

  const getWilayahVal = () => form.wilayah === '__custom__' ? form.wilayah_custom : form.wilayah;

  const simpan = async () => {
    const payload = { ...form, wilayah: getWilayahVal(), nama_layanan: form.nama_layanan || form.kota_tujuan };
    if (!payload.wilayah || !payload.kota_tujuan) return Swal.fire({ icon: 'warning', title: 'Perhatian', text: 'Wilayah dan Kota Tujuan wajib diisi' });
    try {
      editId ? await api.put(`/harga/${editId}`, payload) : await api.post('/harga', payload);
      Swal.fire({ icon: 'success', title: 'Berhasil!', timer: 1500, showConfirmButton: false });
      setShowModal(false); loadData();
    } catch (err) { Swal.fire({ icon: 'error', text: err.response?.data?.message || 'Gagal', confirmButtonColor: '#10b981' }); }
  };

  const hapus = (id, label) => {
    Swal.fire({ title: 'Hapus Harga?', html: `<b>${label}</b> akan dihapus permanen.`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', confirmButtonText: 'Hapus' })
      .then(async r => { if (r.isConfirmed) { await api.delete(`/harga/${id}`); Swal.fire({ icon: 'success', title: 'Dihapus!', timer: 1200, showConfirmButton: false }); loadData(); }});
  };

  const toggleStatus = async (id, el) => {
    const prev = el.checked;
    try {
      const res = await api.post('/harga/toggle-status', { id });
      if (!res.data.success) el.checked = !prev;
      else el.title = res.data.status;
    } catch { el.checked = !prev; Swal.fire({ icon: 'error', text: 'Gagal toggle status', confirmButtonColor: '#10b981' }); }
  };

  /* ── reusable form field with icon badge ── */
  const Field = ({ icon: Ic, label, required, children }) => (
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

  /* ── modal shell ── */
  const Modal = ({ open, onClose, children, size = 'md', icon: Icon, iconColor = 'emerald' }) => {
    const sizeClass = size === 'lg' ? 'max-w-2xl' : size === 'sm' ? 'max-w-sm' : 'max-w-md';
    const badgeColor = { emerald: 'bg-emerald-100 text-emerald-600 ring-emerald-200', orange: 'bg-orange-100 text-orange-600 ring-orange-200', blue: 'bg-blue-100 text-blue-600 ring-blue-200' };
    if (!open) return null;
    return createPortal(
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="absolute inset-0 bg-black/40" />
        <div className={`relative bg-white rounded-2xl shadow-2xl shadow-slate-900/10 w-full ${sizeClass} overflow-hidden max-h-[85vh] flex flex-col animate-slide-up ring-1 ring-slate-200/50`}
             onClick={e => e.stopPropagation()}>
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
          <div className="px-6 py-5 overflow-y-auto flex-1">{children[1]}</div>
          <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
            {children[2]}
          </div>
        </div>
      </div>,
      document.body
    );
  };

  const filteredGrouped = data?.grouped
    ? Object.entries(data.grouped).filter(([wil]) => !filterWil || wil === filterWil)
        .map(([wil, tm]) => [wil, Object.entries(tm).filter(([tujuan, pair]) => {
          const q = !search || tujuan.toLowerCase().includes(search.toLowerCase());
          const t = !filterTipe || (filterTipe === 'baru' && pair.baru) || (filterTipe === 'lama' && pair.lama);
          return q && t;
        })]).filter(([, e]) => e.length > 0)
    : [];

  return (
    <div className="space-y-5 animate-fade-in">
      <div><h2 className="text-xl font-bold text-slate-900">Daftar Harga Ambulance</h2><p className="text-sm text-slate-400 mt-0.5">Kelola tarif dan rute ambulance</p></div>

      {/* Stats */}
      {data && <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Rute', value: data.stats.total, color: 'text-slate-900' },
          { label: 'Tarif Baru', value: data.stats.totalBaru, color: 'text-emerald-600' },
          { label: 'Tarif Lama', value: data.stats.totalLama, color: 'text-amber-600' },
          { label: 'Wilayah', value: data.stats.totalWil, color: 'text-violet-600' },
        ].map((s, i) => <div key={i} className="card p-3"><p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{s.label}</p><p className={`text-lg font-bold ${s.color}`}>{s.value}</p></div>)}
      </div>}

      {/* Toolbar */}
      <div className="card">
        <div className="px-5 py-3 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[160px] max-w-xs"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input className="input pl-8" placeholder="Cari kota tujuan..." value={search} onChange={e => setSearch(e.target.value)} /></div>
          <select className="select w-44" value={filterWil} onChange={e => setFilterWil(e.target.value)}>
            <option value="">Semua Wilayah</option>{data?.wilayahList?.map(w => <option key={w} value={w}>{w}</option>)}
          </select>
          <div className="flex rounded-lg overflow-hidden border border-slate-200">
            {[
              { val: '', label: 'Semua', cls: 'bg-emerald-600 text-white' },
              { val: 'baru', label: 'Baru', cls: 'bg-emerald-600 text-white' },
              { val: 'lama', label: 'Lama', cls: 'bg-amber-500 text-white' },
            ].map(b => (
              <button key={b.val} onClick={() => setFilterTipe(b.val)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${filterTipe === b.val ? b.cls : 'bg-white text-slate-500 hover:bg-slate-50'}`}>{b.label}</button>
            ))}
          </div>
          <div className="ml-auto flex gap-2">
            <button className="btn btn-ghost btn-sm" onClick={() => { const e = {}; data?.wilayahList?.forEach(w => { e[w] = true; }); setExpanded(e); }}><ChevronUp size={14} />Buka Semua</button>
            <button className="btn btn-ghost btn-sm" onClick={() => { const e = {}; data?.wilayahList?.forEach(w => { e[w] = false; }); setExpanded(e); }}><ChevronDown size={14} />Tutup Semua</button>
            <button className="btn btn-primary btn-sm" onClick={() => { setEditId(null); setForm({ tipe_harga: 'Baru', wilayah: '', wilayah_custom: '', kota_tujuan: '', kota_asal: 'Tangerang', nama_layanan: '', harga: 0, status: 'Aktif', keterangan: '' }); setWilayahCustom(false); setShowModal(true); }}><Plus size={14} />Tambah</button>
          </div>
        </div>
      </div>

      {/* Accordion */}
      {loading ? <div className="text-center py-10 text-sm text-slate-400">Memuat...</div> :
      filteredGrouped.length === 0 ? <div className="text-center py-10 text-sm text-slate-400">Tidak ada data</div> :
      <div className="space-y-3">{filteredGrouped.map(([wilayah, entries]) => {
        const color = WILAYAH_COLORS[wilayah] || '#059669';
        const icon = WILAYAH_ICONS[wilayah] || '📍';
        const isExpanded = expanded[wilayah] !== false;
        const avg = isExpanded ? Math.round(entries.reduce((s, [, p]) => s + (p.baru ? Number(p.baru.harga) : p.lama ? Number(p.lama.harga) : 0), 0) / entries.length) : null;

        return (
          <div key={wilayah} className="card overflow-hidden" style={{ borderLeftColor: color, borderLeftWidth: 3 }}>
            <button onClick={() => setExpanded(prev => ({ ...prev, [wilayah]: !prev[wilayah] }))}
              className="w-full flex items-center gap-3 px-5 py-3.5 text-left hover:bg-slate-50/50 transition-colors">
              <span className="text-lg">{icon}</span>
              <div className="flex-1"><span className="text-sm font-bold" style={{ color }}>{wilayah}</span><span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium text-white" style={{ background: color }}>{entries.length} tujuan</span></div>
              <div className="hidden md:block text-right text-xs">
                <span className="text-slate-400">Rata-rata </span>
                <span className="font-semibold" style={{ color }}>{avg == null ? '—' : rupiah(avg)}</span>
              </div>
              {isExpanded ? <ChevronUp size={16} className="shrink-0" style={{ color }} /> : <ChevronDown size={16} className="shrink-0" style={{ color }} />}
            </button>

            {isExpanded && <div className="overflow-x-auto border-t border-slate-100">
              <table className="w-full">
                <thead><tr className="border-b border-slate-50">
                  {['No', 'Kota Tujuan', 'Tarif Lama', 'Tarif Baru', 'Selisih', 'Status', 'Aksi'].map(h => <th key={h} className="table-header px-4 py-2.5 text-left">{h}</th>)}
                </tr></thead>
                <tbody>{entries.map(([tujuan, pair], i) => {
                  const selisih = pair.baru && pair.lama ? Number(pair.baru.harga) - Number(pair.lama.harga) : null;
                  const pct = pair.lama && Number(pair.lama.harga) > 0 && selisih !== null ? Math.round(selisih / Number(pair.lama.harga) * 100) : null;
                  const activeRow = pair.baru || pair.lama;
                  return (
                    <tr key={tujuan} className="border-b border-slate-50 hover:bg-slate-50/30">
                      <td className="table-cell px-4 py-2.5 text-slate-400 text-xs">{i + 1}</td>
                      <td className="table-cell px-4 py-2.5 font-medium text-slate-800 text-sm">{tujuan}</td>
                      <td className="px-4 py-2.5">{pair.lama ? <span className="text-slate-500 text-sm">{rupiah(pair.lama.harga)} <button className="btn btn-ghost p-0.5 align-text-bottom" onClick={() => { setEditId(pair.lama.id); const f = data.wilayahList.includes(pair.lama.wilayah); setForm({ tipe_harga: 'Lama', wilayah: f ? pair.lama.wilayah : '__custom__', wilayah_custom: f ? '' : (pair.lama.wilayah || ''), kota_tujuan: pair.lama.kota_tujuan, kota_asal: pair.lama.kota_asal || 'Tangerang', nama_layanan: pair.lama.nama_layanan, harga: Number(pair.lama.harga), status: pair.lama.status || 'Aktif', keterangan: pair.lama.keterangan || '' }); setWilayahCustom(!f && !!pair.lama.wilayah); setShowModal(true); }}><Pen size={11} /></button></span> : <button className="btn btn-secondary btn-sm py-0.5 text-xs" onClick={() => { setEditId(null); setForm({ tipe_harga: 'Lama', wilayah, wilayah_custom: '', kota_tujuan: tujuan, kota_asal: 'Tangerang', nama_layanan: tujuan, harga: 0, status: 'Aktif', keterangan: '' }); setWilayahCustom(false); setShowModal(true); }}><Plus size={10} />Tambah</button>}</td>
                      <td className="px-4 py-2.5">{pair.baru ? <span className="text-emerald-600 font-medium text-sm">{rupiah(pair.baru.harga)} <button className="btn btn-ghost p-0.5 align-text-bottom" onClick={() => { setEditId(pair.baru.id); const f = data.wilayahList.includes(pair.baru.wilayah); setForm({ tipe_harga: 'Baru', wilayah: f ? pair.baru.wilayah : '__custom__', wilayah_custom: f ? '' : (pair.baru.wilayah || ''), kota_tujuan: pair.baru.kota_tujuan, kota_asal: pair.baru.kota_asal || 'Tangerang', nama_layanan: pair.baru.nama_layanan, harga: Number(pair.baru.harga), status: pair.baru.status || 'Aktif', keterangan: pair.baru.keterangan || '' }); setWilayahCustom(!f && !!pair.baru.wilayah); setShowModal(true); }}><Pen size={11} /></button></span> : <button className="btn btn-secondary btn-sm py-0.5 text-xs" onClick={() => { setEditId(null); setForm({ tipe_harga: 'Baru', wilayah, wilayah_custom: '', kota_tujuan: tujuan, kota_asal: 'Tangerang', nama_layanan: tujuan, harga: 0, status: 'Aktif', keterangan: '' }); setWilayahCustom(false); setShowModal(true); }}><Plus size={10} />Tambah</button>}</td>
                      <td className="px-4 py-2.5">{selisih !== null ? <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${selisih > 0 ? 'bg-red-50 text-red-700 ring-1 ring-red-200' : selisih < 0 ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-slate-50 text-slate-500 ring-1 ring-slate-200'}`}>{selisih > 0 ? '+' : ''}{pct}%</span> : <span className="text-slate-300 text-xs">—</span>}</td>
                      <td className="px-4 py-2.5">{activeRow ? <label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" className="sr-only peer" defaultChecked={activeRow.status === 'Aktif'} onChange={e => toggleStatus(activeRow.id, e.target)} /><div className="w-9 h-5 rounded-full bg-slate-200 peer-checked:bg-emerald-500 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4"></div></label> : null}</td>
                      <td className="px-4 py-2.5"><div className="flex gap-1">
                        <button className="btn btn-ghost p-1 rounded-lg" title="Tambah" onClick={() => { setEditId(null); setForm({ tipe_harga: 'Baru', wilayah, wilayah_custom: '', kota_tujuan: tujuan, kota_asal: 'Tangerang', nama_layanan: tujuan, harga: 0, status: 'Aktif', keterangan: '' }); setWilayahCustom(false); setShowModal(true); }}><Plus size={13} /></button>
                        {pair.baru ? <button className="btn btn-ghost p-1 rounded-lg text-red-400 hover:text-red-600" onClick={() => hapus(pair.baru.id, `${tujuan} (Baru)`)}><Trash2 size={13} /></button> : pair.lama ? <button className="btn btn-ghost p-1 rounded-lg text-red-400 hover:text-red-600" onClick={() => hapus(pair.lama.id, `${tujuan} (Lama)`)}><Trash2 size={13} /></button> : null}
                      </div></td>
                    </tr>
                  );
                })}</tbody>
              </table>
            </div>}
          </div>
        );
      })}</div>}

      {/* ── Modal Harga ── */}
      <Modal open={showModal} onClose={() => setShowModal(false)} size="lg" icon={Tags} iconColor="emerald">
        <>{editId ? 'Edit Harga' : 'Tambah Harga'}</>
        {<div className="space-y-4">
          {/* Tipe toggle */}
          <div>
            <label className="label">Tipe Harga <span className="text-red-400 ml-0.5">*</span></label>
            <div className="flex gap-3">
              {['Baru', 'Lama'].map(t => (
                <div key={t} onClick={() => setForm({ ...form, tipe_harga: t })}
                  className={`flex-1 text-center p-3 rounded-xl cursor-pointer border-2 transition-all ${form.tipe_harga === t ? (t === 'Baru' ? 'border-emerald-500 bg-emerald-50' : 'border-amber-400 bg-amber-50') : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                  <p className={`text-sm font-bold ${t === 'Baru' ? 'text-emerald-600' : 'text-amber-600'}`}>{t === 'Baru' ? '✓ Tarif Baru' : '🕐 Tarif Lama'}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{t === 'Baru' ? 'Berlaku sekarang' : 'Harga sebelumnya'}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Field icon={MapPin} label="Wilayah" required>
                <select className="select pl-12" value={form.wilayah} onChange={e => { setForm({ ...form, wilayah: e.target.value }); setWilayahCustom(e.target.value === '__custom__'); }}>
                  <option value="">-- Pilih --</option>{data?.wilayahList?.map(w => <option key={w} value={w}>{w}</option>)}<option value="__custom__">+ Wilayah Baru...</option>
                </select>
              </Field>
              {wilayahCustom && <input className="input mt-2 pl-12" placeholder="Ketik nama wilayah" value={form.wilayah_custom} onChange={e => setForm({ ...form, wilayah_custom: e.target.value })} />}
            </div>
            <Field icon={Building2} label="Kota Tujuan" required>
              <input className="input pl-12" value={form.kota_tujuan} onChange={e => { setForm({ ...form, kota_tujuan: e.target.value }); if (!editId) setForm(f => ({ ...f, kota_tujuan: e.target.value, nama_layanan: e.target.value })); }} />
            </Field>
            <Field icon={MapPin} label="Kota Asal">
              <input className="input pl-12" value={form.kota_asal} onChange={e => setForm({ ...form, kota_asal: e.target.value })} />
            </Field>
            <Field icon={FileText} label="Nama Layanan">
              <input className="input pl-12" value={form.nama_layanan} onChange={e => setForm({ ...form, nama_layanan: e.target.value })} />
            </Field>
            <div>
              <Field icon={DollarSign} label="Harga (Rp)" required>
                <input type="number" className="input pl-12" min="0" value={form.harga} onChange={e => setForm({ ...form, harga: Number(e.target.value) })} />
              </Field>
              <p className="text-[11px] text-slate-400 mt-1">{rupiah(form.harga)}</p>
            </div>
            <Field icon={Tags} label="Status">
              <select className="select pl-12" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}><option value="Aktif">Aktif</option><option value="Non-Aktif">Non-Aktif</option></select>
            </Field>
          </div>
          <Field icon={ClipboardList} label="Keterangan">
            <input className="input pl-12" value={form.keterangan} onChange={e => setForm({ ...form, keterangan: e.target.value })} placeholder="Catatan tambahan (opsional)" />
          </Field>
        </div>}
        {<>
          <button className="btn btn-secondary px-4 py-2" onClick={() => setShowModal(false)}>Batal</button>
          <button className="btn btn-primary px-5 py-2 shadow-sm shadow-emerald-200" onClick={simpan}>Simpan</button>
        </>}
        <>{editId ? 'Perbarui tarif dan rute yang sudah ada' : 'Tambahkan tarif dan rute baru untuk ambulance'}</>
      </Modal>
    </div>
  );
}
