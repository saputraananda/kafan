import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import api from '../utils/api';
import { rupiah, formatDate, currentMonth, statusBadgeClass } from '../utils/helpers';
import Swal from 'sweetalert2';
import { Plus, Pen, Trash2, Eye, Truck, X, Calendar, User, Phone, MapPin, DollarSign, ClipboardList, ToggleRight } from 'lucide-react';

export default function TransaksiPage() {
  const [data, setData] = useState([]);
  const [hargaOpt, setHargaOpt] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterBulan, setFilterBulan] = useState(currentMonth());
  const [filterStatus, setFilterStatus] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [detail, setDetail] = useState(null);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ tanggal: new Date().toISOString().split('T')[0], nama_pasien: '', no_hp: '', pengemudi: '', alamat_penjemputan: '', tujuan: '', harga_id: '', harga_final: 0, status: 'Pending', keterangan: '' });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [res, statsRes, hargaRes] = await Promise.all([api.get('/transaksi'), api.get('/transaksi/stats'), api.get('/transaksi/harga-options')]);
      setData(res.data.data); setStats(statsRes.data); setHargaOpt(hargaRes.data.data);
    } catch { Swal.fire({ icon: 'error', text: 'Gagal memuat data', confirmButtonColor: '#10b981' }); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { loadData(); }, [loadData]);

  const filtered = data.filter(r => (!filterBulan || r.tanggal.startsWith(filterBulan)) && (!filterStatus || r.status === filterStatus));
  const groupedHarga = {};
  hargaOpt.forEach(h => { const w = h.wilayah || 'Lainnya'; if (!groupedHarga[w]) groupedHarga[w] = []; groupedHarga[w].push(h); });

  const autoFillHarga = (hargaId) => { const sel = hargaOpt.find(h => h.id === Number(hargaId)); if (sel) setForm(f => ({ ...f, harga_id: hargaId, harga_final: Number(sel.harga) })); };

  const simpan = async () => {
    const { tanggal, nama_pasien, alamat_penjemputan, tujuan } = form;
    if (!tanggal || !nama_pasien || !alamat_penjemputan || !tujuan) return Swal.fire({ icon: 'warning', title: 'Perhatian', text: 'Field bertanda * wajib diisi!' });
    try {
      editId ? await api.put(`/transaksi/${editId}`, form) : await api.post('/transaksi', form);
      Swal.fire({ icon: 'success', title: 'Berhasil!', timer: 1200, showConfirmButton: false });
      setShowForm(false); loadData();
    } catch (err) { Swal.fire({ icon: 'error', text: err.response?.data?.message || 'Gagal', confirmButtonColor: '#10b981' }); }
  };

  const hapus = (id, nama) => {
    Swal.fire({ title: 'Hapus transaksi?', text: `Pasien: ${nama}`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', confirmButtonText: 'Hapus' })
      .then(async r => { if (r.isConfirmed) { await api.delete(`/transaksi/${id}`); Swal.fire({ icon: 'success', title: 'Dihapus!', timer: 1200, showConfirmButton: false }); loadData(); }});
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

  return (
    <div className="space-y-5 animate-fade-in">
      <div><h2 className="text-xl font-bold text-slate-900">Transaksi Ambulance</h2><p className="text-sm text-slate-400 mt-0.5">Catat dan kelola transaksi ambulance</p></div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Trip Bulan Ini', value: stats?.total ?? '...', color: 'text-sky-600', bg: 'bg-sky-50' },
          { label: 'Selesai', value: stats?.selesai ?? '...', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Omzet Bulan Ini', value: stats ? rupiah(stats.omzet) : '...', color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((c, i) => (
          <div key={i} className="card p-4 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl ${c.bg} flex items-center justify-center shrink-0`}><Truck size={20} className={c.color} /></div>
            <div><p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{c.label}</p><p className={`text-base font-bold ${c.color}`}>{c.value}</p></div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="card">
        <div className="px-5 py-3 flex flex-wrap gap-3 items-center">
          <input type="month" className="input w-44" value={filterBulan} onChange={e => setFilterBulan(e.target.value)} />
          <select className="select w-36" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">Semua Status</option><option>Pending</option><option>Berjalan</option><option>Selesai</option><option>Dibatalkan</option>
          </select>
          <button className="btn btn-ghost btn-sm" onClick={() => { setFilterBulan(''); setFilterStatus(''); }}>Reset</button>
          <div className="ml-auto"><button className="btn btn-primary btn-sm" onClick={() => { setEditId(null); setForm({ tanggal: new Date().toISOString().split('T')[0], nama_pasien: '', no_hp: '', pengemudi: '', alamat_penjemputan: '', tujuan: '', harga_id: '', harga_final: 0, status: 'Pending', keterangan: '' }); setShowForm(true); }}><Plus size={14} />Tambah Transaksi</button></div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-slate-100">
              {['No', 'Tanggal', 'Pasien', 'No HP', 'Penjemputan', 'Tujuan', 'Harga', 'Pengemudi', 'Status', 'Aksi'].map(h => <th key={h} className="table-header px-4 py-3 text-left">{h}</th>)}
            </tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={10} className="text-center py-8 text-sm text-slate-400">Memuat...</td></tr> :
              filtered.length === 0 ? <tr><td colSpan={10} className="text-center py-8 text-sm text-slate-400">Belum ada transaksi</td></tr> :
              filtered.map((r, i) => (
                <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                  <td className="table-cell px-4 py-3 text-slate-400">{i + 1}</td>
                  <td className="table-cell px-4 py-3">{formatDate(r.tanggal)}</td>
                  <td className="table-cell px-4 py-3 font-medium text-slate-800">{r.nama_pasien}</td>
                  <td className="table-cell px-4 py-3 text-slate-500">{r.no_hp || '-'}</td>
                  <td className="table-cell px-4 py-3 max-w-[120px] truncate text-slate-500" title={r.alamat_penjemputan}>{r.alamat_penjemputan}</td>
                  <td className="table-cell px-4 py-3 max-w-[120px] truncate text-slate-500" title={r.tujuan}>{r.tujuan}</td>
                  <td className="table-cell px-4 py-3 font-medium text-emerald-600">{rupiah(r.harga_final)}</td>
                  <td className="table-cell px-4 py-3 text-slate-500">{r.pengemudi || '-'}</td>
                  <td className="px-4 py-3"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusBadgeClass[r.status] || 'bg-slate-50 text-slate-600'}`}>{r.status}</span></td>
                  <td className="px-4 py-3"><div className="flex gap-1">
                    <button className="btn btn-ghost p-1.5 rounded-lg" onClick={() => { setDetail(r); setShowDetail(true); }}><Eye size={14} /></button>
                    <button className="btn btn-ghost p-1.5 rounded-lg" onClick={() => { setEditId(r.id); setForm({ tanggal: r.tanggal, nama_pasien: r.nama_pasien, no_hp: r.no_hp || '', pengemudi: r.pengemudi || '', alamat_penjemputan: r.alamat_penjemputan, tujuan: r.tujuan, harga_id: r.harga_id?.toString() || '', harga_final: Number(r.harga_final), status: r.status, keterangan: r.keterangan || '' }); setShowForm(true); }}><Pen size={14} /></button>
                    <button className="btn btn-ghost p-1.5 rounded-lg text-red-400 hover:text-red-600" onClick={() => hapus(r.id, r.nama_pasien)}><Trash2 size={14} /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal Form Transaksi ── */}
      <Modal open={showForm} onClose={() => setShowForm(false)} size="lg" icon={Truck} iconColor="emerald">
        <>{editId ? 'Edit Transaksi' : 'Tambah Transaksi'}</>
        {<div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field icon={Calendar} label="Tanggal" required>
              <input type="date" className="input pl-12" value={form.tanggal} onChange={e => setForm({ ...form, tanggal: e.target.value })} />
            </Field>
            <Field icon={User} label="Nama Pasien" required>
              <input className="input pl-12" value={form.nama_pasien} onChange={e => setForm({ ...form, nama_pasien: e.target.value })} placeholder="Nama lengkap pasien" />
            </Field>
            <Field icon={Phone} label="No HP Keluarga">
              <input className="input pl-12" value={form.no_hp} onChange={e => setForm({ ...form, no_hp: e.target.value })} placeholder="08xxx" />
            </Field>
            <Field icon={User} label="Pengemudi">
              <input className="input pl-12" value={form.pengemudi} onChange={e => setForm({ ...form, pengemudi: e.target.value })} placeholder="Nama pengemudi" />
            </Field>
          </div>
          <Field icon={MapPin} label="Alamat Penjemputan" required>
            <input className="input pl-12" value={form.alamat_penjemputan} onChange={e => setForm({ ...form, alamat_penjemputan: e.target.value })} placeholder="Alamat lengkap penjemputan" />
          </Field>
          <Field icon={MapPin} label="Tujuan" required>
            <input className="input pl-12" value={form.tujuan} onChange={e => setForm({ ...form, tujuan: e.target.value })} placeholder="Alamat tujuan" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field icon={DollarSign} label="Paket Harga">
              <select className="select pl-12" value={form.harga_id} onChange={e => autoFillHarga(e.target.value)}>
                <option value="">-- Pilih / Isi Manual --</option>
                {Object.entries(groupedHarga).map(([wil, items]) => (
                  <optgroup key={wil} label={wil}>{items.map(h => <option key={h.id} value={h.id}>{h.kota_tujuan} — {rupiah(h.harga)}</option>)}</optgroup>
                ))}
              </select>
            </Field>
            <Field icon={DollarSign} label="Harga Final (Rp)" required>
              <input type="number" className="input pl-12" min="0" value={form.harga_final} onChange={e => setForm({ ...form, harga_final: Number(e.target.value) })} />
            </Field>
            <Field icon={ToggleRight} label="Status">
              <select className="select pl-12" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                <option value="Pending">Pending</option><option value="Berjalan">Berjalan</option><option value="Selesai">Selesai</option><option value="Dibatalkan">Dibatalkan</option>
              </select>
            </Field>
          </div>
          <Field icon={ClipboardList} label="Keterangan">
            <input className="input pl-12" value={form.keterangan} onChange={e => setForm({ ...form, keterangan: e.target.value })} placeholder="Catatan tambahan (opsional)" />
          </Field>
        </div>}
        {<>
          <button className="btn btn-secondary px-4 py-2" onClick={() => setShowForm(false)}>Batal</button>
          <button className="btn btn-primary px-5 py-2 shadow-sm shadow-emerald-200" onClick={simpan}>Simpan</button>
        </>}
        <>{editId ? 'Perbarui data transaksi ambulance' : 'Catat transaksi ambulance baru'}</>
      </Modal>

      {/* ── Modal Detail ── */}
      <Modal open={showDetail && !!detail} onClose={() => setShowDetail(false)} size="sm" icon={Eye} iconColor="blue">
        <>Detail Transaksi</>
        {detail && <div className="space-y-2 text-sm">
          {[
            ['Tanggal', formatDate(detail.tanggal)],
            ['Nama Pasien', detail.nama_pasien],
            ['No HP', detail.no_hp || '-'],
            ['Penjemputan', detail.alamat_penjemputan],
            ['Tujuan', detail.tujuan],
            ['Paket Harga', detail.nama_layanan || '—'],
            ['Harga Final', rupiah(detail.harga_final)],
            ['Pengemudi', detail.pengemudi || '-'],
            ['Status', detail.status],
            ['Keterangan', detail.keterangan || '-'],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between py-1.5 border-b border-slate-50 last:border-0">
              <span className="text-slate-500">{label}</span>
              <span className="font-medium text-slate-800 text-right">{value}</span>
            </div>
          ))}
        </div>}
        {<button className="btn btn-secondary px-4 py-2" onClick={() => setShowDetail(false)}>Tutup</button>}
        <>Informasi lengkap transaksi ambulance</>
      </Modal>
    </div>
  );
}
