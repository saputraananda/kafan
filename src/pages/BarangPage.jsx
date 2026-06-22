import { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import api from '../utils/api';
import { formatDate, todayStr } from '../utils/helpers';
import Swal from 'sweetalert2';
import { Plus, MinusCircle, Pen, Trash2, Boxes, PlusCircle, X, Package, Tag, Archive, FileText, Calendar, Hash, ClipboardList } from 'lucide-react';

export default function BarangPage() {
  const [barangList, setBarangList] = useState([]);
  const [pemakaian, setPemakaian] = useState([]);
  const [tab, setTab] = useState('stok');
  const [loading, setLoading] = useState(true);
  const [loadingPakai, setLoadingPakai] = useState(false);

  const [qStok, setQStok] = useState('');
  const [pageSizeStok, setPageSizeStok] = useState(10);
  const [pageStok, setPageStok] = useState(1);

  const [qPakai, setQPakai] = useState('');
  const [pageSizePakai, setPageSizePakai] = useState(10);
  const [pagePakai, setPagePakai] = useState(1);

  const [showBarang, setShowBarang] = useState(false);
  const [showPakai, setShowPakai] = useState(false);
  const [showRestock, setShowRestock] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ nama_barang: '', stok: 0, keterangan: '' });
  const [pakai, setPakai] = useState({ tanggal: todayStr(), barang_id: '', jumlah: 1, keterangan: '' });
  const [restock, setRestock] = useState({ id: '', nama: '', jumlah: 1 });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/barang');
      setBarangList(res.data.data);
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Gagal', text: 'Gagal memuat data barang', confirmButtonColor: '#10b981' });
    } finally { setLoading(false); }
  }, []);

  const loadPemakaian = useCallback(async () => {
    setLoadingPakai(true);
    try {
      const res = await api.get('/barang/pemakaian');
      setPemakaian(res.data.data);
    } catch { Swal.fire({ icon: 'error', title: 'Gagal', text: 'Gagal memuat riwayat', confirmButtonColor: '#10b981' }); }
    finally { setLoadingPakai(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { if (tab === 'pemakaian' && pemakaian.length === 0) loadPemakaian(); }, [tab, pemakaian.length, loadPemakaian]);

  const filteredBarang = useMemo(() => {
    const q = qStok.trim().toLowerCase();
    if (!q) return barangList;
    return barangList.filter(b =>
      String(b.nama_barang || '').toLowerCase().includes(q) ||
      String(b.keterangan || '').toLowerCase().includes(q)
    );
  }, [barangList, qStok]);

  const stokTotalPages = Math.max(1, Math.ceil(filteredBarang.length / Number(pageSizeStok || 10)));
  const stokPage = Math.min(pageStok, stokTotalPages);
  const stokStart = (stokPage - 1) * Number(pageSizeStok || 10);
  const pagedBarang = filteredBarang.slice(stokStart, stokStart + Number(pageSizeStok || 10));

  useEffect(() => { setPageStok(1); }, [qStok, pageSizeStok]);

  const filteredPakai = useMemo(() => {
    const q = qPakai.trim().toLowerCase();
    if (!q) return pemakaian;
    return pemakaian.filter(p =>
      String(p.nama_barang || '').toLowerCase().includes(q) ||
      String(p.keterangan || '').toLowerCase().includes(q) ||
      String(p.tanggal || '').toLowerCase().includes(q)
    );
  }, [pemakaian, qPakai]);

  const pakaiTotalPages = Math.max(1, Math.ceil(filteredPakai.length / Number(pageSizePakai || 10)));
  const pakaiPage = Math.min(pagePakai, pakaiTotalPages);
  const pakaiStart = (pakaiPage - 1) * Number(pageSizePakai || 10);
  const pagedPakai = filteredPakai.slice(pakaiStart, pakaiStart + Number(pageSizePakai || 10));

  useEffect(() => { setPagePakai(1); }, [qPakai, pageSizePakai]);

  const simpanBarang = async () => {
    if (!form.nama_barang) return Swal.fire({ icon: 'warning', title: 'Perhatian', text: 'Nama barang wajib diisi' });
    try {
      editId ? await api.put(`/barang/${editId}`, form) : await api.post('/barang', form);
      Swal.fire({ icon: 'success', title: 'Berhasil', timer: 1200, showConfirmButton: false });
      setShowBarang(false); loadData();
    } catch (err) { Swal.fire({ icon: 'error', title: 'Gagal', text: err.response?.data?.message || 'Error', confirmButtonColor: '#10b981' }); }
  };

  const hapusBarang = (id, nama) => {
    Swal.fire({ title: 'Hapus Barang?', text: `"${nama}" akan dihapus permanen.`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', confirmButtonText: 'Hapus' })
      .then(async r => { if (r.isConfirmed) { await api.delete(`/barang/${id}`); Swal.fire({ icon: 'success', title: 'Dihapus!', timer: 1200, showConfirmButton: false }); loadData(); }});
  };

  const catatPemakaian = async () => {
    if (!pakai.tanggal || !pakai.barang_id || !pakai.jumlah) return Swal.fire({ icon: 'warning', title: 'Perhatian', text: 'Semua field wajib diisi' });
    const sel = barangList.find(b => b.id === Number(pakai.barang_id));
    if (sel && pakai.jumlah > sel.stok) return Swal.fire({ icon: 'error', title: 'Stok Tidak Cukup', text: `Stok tersisa ${sel.stok}` });
    try {
      await api.post('/barang/pemakaian', pakai);
      Swal.fire({ icon: 'success', title: 'Tercatat!', timer: 1200, showConfirmButton: false });
      setShowPakai(false); setPakai({ tanggal: todayStr(), barang_id: '', jumlah: 1, keterangan: '' }); loadData();
    } catch (err) { Swal.fire({ icon: 'error', title: 'Gagal', text: err.response?.data?.message, confirmButtonColor: '#10b981' }); }
  };

  const hapusPemakaian = async (id) => {
    Swal.fire({ title: 'Batalkan pemakaian?', text: 'Stok akan dikembalikan.', icon: 'question', showCancelButton: true, confirmButtonText: 'Ya, Batalkan' })
      .then(async r => { if (r.isConfirmed) { await api.delete(`/barang/pemakaian/${id}`); Swal.fire({ icon: 'success', title: 'Dibatalkan!', timer: 1200, showConfirmButton: false }); loadPemakaian(); loadData(); }});
  };

  const simpanRestock = async () => {
    try { await api.post('/barang/restock', restock); Swal.fire({ icon: 'success', title: 'Stok ditambahkan', timer: 1200, showConfirmButton: false }); setShowRestock(false); loadData(); }
    catch (err) { Swal.fire({ icon: 'error', title: 'Gagal', text: err.response?.data?.message, confirmButtonColor: '#10b981' }); }
  };

  const stokBadge = (s) => s <= 3 ? 'bg-red-50 text-red-700 ring-1 ring-red-200' : s <= 10 ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200';

  const barangOptions = useMemo(() => {
    if (!showPakai) return null;
    return barangList.map(b => (
      <option key={b.id} value={b.id}>
        {b.nama_barang} (Stok: {b.stok})
      </option>
    ));
  }, [showPakai, barangList]);

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
        {/* overlay */}
        <div className="absolute inset-0 bg-black/40" />
        {/* panel */}
        <div className={`relative bg-white rounded-2xl shadow-2xl shadow-slate-900/10 w-full ${sizeClass} overflow-hidden max-h-[85vh] flex flex-col animate-slide-up ring-1 ring-slate-200/50`}
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
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div><h2 className="text-xl font-bold text-slate-900">Manajemen Stok Kain Kafan</h2><p className="text-sm text-slate-400 mt-0.5">Kelola stok dan catat pemakaian barang</p></div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-slate-200">
        {['stok', 'pemakaian'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
            {t === 'stok' ? <><Boxes size={14} className="inline mr-1.5" />Data Stok Barang</> : <><MinusCircle size={14} className="inline mr-1.5" />Riwayat Pemakaian</>}
          </button>
        ))}
      </div>

      {/* Tab Stok */}
      {tab === 'stok' && <div className="card overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between gap-3 flex-wrap">
          <span className="text-sm font-semibold text-slate-800"><Package size={16} className="inline mr-2 text-emerald-600" />Daftar Barang & Stok</span>
          <div className="flex gap-2">
            <button className="btn btn-primary btn-sm" onClick={() => { setEditId(null); setForm({ nama_barang: '', stok: 0, keterangan: '' }); setShowBarang(true); }}><Plus size={14} />Tambah Barang</button>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowPakai(true)}><MinusCircle size={14} />Catat Pemakaian</button>
          </div>
        </div>
        <div className="px-5 py-3 border-b border-slate-100 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Show</span>
            <select className="select w-24" value={pageSizeStok} onChange={e => setPageSizeStok(Number(e.target.value))}>
              {[5, 10, 25, 50].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <span>entries</span>
          </div>
          <div className="ml-auto flex items-center gap-2 text-xs text-slate-500">
            <span>Search:</span>
            <input className="input w-56" value={qStok} onChange={e => setQStok(e.target.value)} placeholder="Cari barang..." />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-slate-100">
              {['No', 'Jenis Barang', 'Jumlah', 'Keterangan', 'Aksi'].map(h => <th key={h} className="table-header px-4 py-3 text-left">{h}</th>)}
            </tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={5} className="text-center py-8 text-sm text-slate-400">Memuat...</td></tr> :
              pagedBarang.length === 0 ? <tr><td colSpan={5} className="text-center py-8 text-sm text-slate-400">Tidak ada data</td></tr> :
              pagedBarang.map((b, i) => (
                <tr key={b.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="table-cell px-4 py-3 text-slate-400">{stokStart + i + 1}</td>
                  <td className="table-cell px-4 py-3 font-medium text-slate-800">{b.nama_barang}</td>
                  <td className="px-4 py-3"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${stokBadge(b.stok)}`}>{b.stok}</span></td>
                  <td className="table-cell px-4 py-3 text-slate-400">{b.keterangan || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button className="btn btn-ghost p-1.5 rounded-lg" title="Tambah Stok" onClick={() => { setRestock({ id: b.id, nama: b.nama_barang, jumlah: 1 }); setShowRestock(true); }}><PlusCircle size={14} /></button>
                      <button className="btn btn-ghost p-1.5 rounded-lg" title="Edit" onClick={() => { setEditId(b.id); setForm({ nama_barang: b.nama_barang, stok: b.stok, keterangan: b.keterangan || '' }); setShowBarang(true); }}><Pen size={14} /></button>
                      <button className="btn btn-ghost p-1.5 rounded-lg text-red-400 hover:text-red-600" title="Hapus" onClick={() => hapusBarang(b.id, b.nama_barang)}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 flex items-center justify-between text-xs text-slate-500 bg-slate-50 border-t border-slate-100">
          <span>
            Showing {filteredBarang.length === 0 ? 0 : stokStart + 1} to {Math.min(stokStart + Number(pageSizeStok || 10), filteredBarang.length)} of {filteredBarang.length} entries
          </span>
          <div className="flex items-center gap-2">
            <button className="btn btn-secondary btn-sm" disabled={stokPage <= 1} onClick={() => setPageStok(p => Math.max(1, p - 1))}>Prev</button>
            <span className="text-slate-500">Page {stokPage} / {stokTotalPages}</span>
            <button className="btn btn-secondary btn-sm" disabled={stokPage >= stokTotalPages} onClick={() => setPageStok(p => Math.min(stokTotalPages, p + 1))}>Next</button>
          </div>
        </div>
      </div>}

      {/* Tab Pemakaian */}
      {tab === 'pemakaian' && <div className="card overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100"><span className="text-sm font-semibold text-slate-800"><MinusCircle size={16} className="inline mr-2 text-orange-500" />Riwayat Pemakaian Barang</span></div>
        <div className="px-5 py-3 border-b border-slate-100 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Show</span>
            <select className="select w-24" value={pageSizePakai} onChange={e => setPageSizePakai(Number(e.target.value))}>
              {[5, 10, 25, 50].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <span>entries</span>
          </div>
          <div className="ml-auto flex items-center gap-2 text-xs text-slate-500">
            <span>Search:</span>
            <input className="input w-56" value={qPakai} onChange={e => setQPakai(e.target.value)} placeholder="Cari riwayat..." />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-slate-100">
              {['No', 'Tanggal', 'Jenis Barang', 'Jumlah', 'Keterangan', 'Aksi'].map(h => <th key={h} className="table-header px-4 py-3 text-left">{h}</th>)}
            </tr></thead>
            <tbody>
              {loadingPakai ? <tr><td colSpan={6} className="text-center py-8 text-sm text-slate-400">Memuat...</td></tr> :
              pagedPakai.length === 0 ? <tr><td colSpan={6} className="text-center py-8 text-sm text-slate-400">Belum ada riwayat pemakaian</td></tr> :
              pagedPakai.map((p, i) => (
                <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                  <td className="table-cell px-4 py-3 text-slate-400">{pakaiStart + i + 1}</td>
                  <td className="table-cell px-4 py-3">{formatDate(p.tanggal)}</td>
                  <td className="table-cell px-4 py-3 font-medium text-slate-800">{p.nama_barang}</td>
                  <td className="px-4 py-3"><span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 ring-1 ring-amber-200">{p.jumlah}</span></td>
                  <td className="table-cell px-4 py-3 text-slate-400">{p.keterangan || '-'}</td>
                  <td className="px-4 py-3"><button className="btn btn-ghost p-1.5 rounded-lg text-red-400 hover:text-red-600" onClick={() => hapusPemakaian(p.id)}><Trash2 size={14} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 flex items-center justify-between text-xs text-slate-500 bg-slate-50 border-t border-slate-100">
          <span>
            Showing {filteredPakai.length === 0 ? 0 : pakaiStart + 1} to {Math.min(pakaiStart + Number(pageSizePakai || 10), filteredPakai.length)} of {filteredPakai.length} entries
          </span>
          <div className="flex items-center gap-2">
            <button className="btn btn-secondary btn-sm" disabled={pakaiPage <= 1} onClick={() => setPagePakai(p => Math.max(1, p - 1))}>Prev</button>
            <span className="text-slate-500">Page {pakaiPage} / {pakaiTotalPages}</span>
            <button className="btn btn-secondary btn-sm" disabled={pakaiPage >= pakaiTotalPages} onClick={() => setPagePakai(p => Math.min(pakaiTotalPages, p + 1))}>Next</button>
          </div>
        </div>
      </div>}

      {/* ── Modal Barang ── */}
      <Modal open={showBarang} onClose={() => setShowBarang(false)} icon={Package} iconColor="emerald">
        <>{editId ? 'Edit Barang' : 'Tambah Barang Baru'}</>
        {<div className="space-y-4">
          <Field icon={Tag} label="Nama / Jenis Barang" required>
            <input className="input pl-12" value={form.nama_barang} onChange={e => setForm({ ...form, nama_barang: e.target.value })} placeholder="Contoh: Kain Kafan Putih" />
          </Field>
          <Field icon={Archive} label="Stok Awal">
            <input type="number" className="input pl-12" min="0" value={form.stok} onChange={e => setForm({ ...form, stok: Number(e.target.value) })} />
          </Field>
          <Field icon={FileText} label="Keterangan">
            <input className="input pl-12" value={form.keterangan} onChange={e => setForm({ ...form, keterangan: e.target.value })} placeholder="Catatan tambahan (opsional)" />
          </Field>
        </div>}
        {<>
          <button className="btn btn-secondary px-4 py-2" onClick={() => setShowBarang(false)}>Batal</button>
          <button className="btn btn-primary px-5 py-2 shadow-sm shadow-emerald-200" onClick={simpanBarang}>
            {editId ? 'Perbarui' : 'Simpan'}
          </button>
        </>}
        <>{editId ? 'Perbarui informasi barang yang sudah ada' : 'Tambahkan barang baru ke dalam daftar stok'}</>
      </Modal>

      {/* ── Modal Pemakaian ── */}
      <Modal open={showPakai} onClose={() => setShowPakai(false)} icon={MinusCircle} iconColor="orange">
        <>Catat Pemakaian Barang</>
        {<div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field icon={Calendar} label="Tanggal" required>
              <input type="date" className="input pl-12" value={pakai.tanggal} onChange={e => setPakai({ ...pakai, tanggal: e.target.value })} />
            </Field>
            <Field icon={Hash} label="Jumlah Dipakai" required>
              <input type="number" className="input pl-12" min="1" value={pakai.jumlah} onChange={e => setPakai({ ...pakai, jumlah: Number(e.target.value) })} />
            </Field>
          </div>
          <Field icon={Package} label="Jenis Barang" required>
            <select className="select pl-12" value={pakai.barang_id} onChange={e => setPakai({ ...pakai, barang_id: e.target.value })}>
              <option value="">-- Pilih Barang --</option>
              {barangOptions}
            </select>
          </Field>
          <Field icon={ClipboardList} label="Keterangan">
            <input className="input pl-12" value={pakai.keterangan} onChange={e => setPakai({ ...pakai, keterangan: e.target.value })} placeholder="Catatan pemakaian (opsional)" />
          </Field>
        </div>}
        {<>
          <button className="btn btn-secondary px-4 py-2" onClick={() => setShowPakai(false)}>Batal</button>
          <button className="btn btn-primary px-5 py-2 shadow-sm shadow-emerald-200" onClick={catatPemakaian}>Catat</button>
        </>}
        <>Catat pemakaian barang dari stok yang tersedia</>
      </Modal>

      {/* ── Modal Restock ── */}
      <Modal open={showRestock} onClose={() => setShowRestock(false)} size="sm" icon={PlusCircle} iconColor="blue">
        <>Tambah Stok Barang</>
        {<div className="space-y-4">
          <div className="bg-slate-50 rounded-xl p-3 ring-1 ring-slate-100">
            <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-0.5">Barang</p>
            <p className="text-sm font-bold text-slate-800">{restock.nama}</p>
          </div>
          <Field icon={PlusCircle} label="Jumlah Ditambahkan">
            <input type="number" className="input pl-12 text-base font-semibold" min="1" value={restock.jumlah} onChange={e => setRestock({ ...restock, jumlah: Number(e.target.value) })} />
          </Field>
        </div>}
        {<>
          <button className="btn btn-secondary px-4 py-2" onClick={() => setShowRestock(false)}>Batal</button>
          <button className="btn btn-primary px-5 py-2 shadow-sm shadow-emerald-200" onClick={simpanRestock}>Tambah Stok</button>
        </>}
        <>Tambahkan stok untuk barang yang dipilih</>
      </Modal>
    </div>
  );
}
