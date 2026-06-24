import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { rupiah, formatDateShort, currentMonth } from '../utils/helpers';
import Swal from 'sweetalert2';
import { Plus, Pen, Trash2, TrendingUp, TrendingDown, Wallet, Calendar, User, FileText, DollarSign } from 'lucide-react';
import Modal from '../components/Modal';
import Field from '../components/Field';

const formatRupiahInput = (value) => {
  if (value === null || value === undefined) return '';
  const clean = String(value).replace(/\D/g, '');
  if (!clean) return '';
  return Number(clean).toLocaleString('id-ID');
};

export default function KeuanganPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterBulan, setFilterBulan] = useState(currentMonth());
  const [filterPJ, setFilterPJ] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ tanggal: new Date().toISOString().split('T')[0], penanggung_jawab: '', keterangan: '', uang_masuk: '', uang_keluar: '' });

  const loadData = useCallback(async () => {
    setLoading(true);
    try { const res = await api.get('/keuangan'); setData(res.data); }
    catch { Swal.fire({ icon: 'error', title: 'Gagal', text: 'Gagal memuat data', confirmButtonColor: '#10b981' }); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { loadData(); }, [loadData]);

  const filteredGrouped = data?.grouped
    ? data.grouped.filter(([tgl]) => !filterBulan || tgl.startsWith(filterBulan))
        .map(([tgl, rows]) => [tgl, rows.filter(r => !filterPJ || r.penanggung_jawab === filterPJ)])
        .filter(([, rows]) => rows.length > 0)
    : [];

  const displayRows = filteredGrouped.flatMap(([tgl, rows]) => rows.map((r, idxInDay) => ({ tgl, r, idxInDay })));

  const simpan = async () => {
    if (!form.tanggal || !form.penanggung_jawab || !form.keterangan) return Swal.fire({ icon: 'warning', title: 'Perhatian', text: 'Tanggal, PJ, dan keterangan wajib diisi' });
    const cleanUangMasuk = typeof form.uang_masuk === 'string' ? Number(form.uang_masuk.replace(/\./g, '')) : Number(form.uang_masuk);
    const cleanUangKeluar = typeof form.uang_keluar === 'string' ? Number(form.uang_keluar.replace(/\./g, '')) : Number(form.uang_keluar);
    if (!cleanUangMasuk && !cleanUangKeluar) return Swal.fire({ icon: 'warning', title: 'Perhatian', text: 'Minimal isi uang masuk atau uang keluar' });
    const payload = { ...form, uang_masuk: cleanUangMasuk, uang_keluar: cleanUangKeluar };
    try {
      editId ? await api.put(`/keuangan/${editId}`, payload) : await api.post('/keuangan', payload);
      Swal.fire({ icon: 'success', title: 'Berhasil!', timer: 1200, showConfirmButton: false });
      setShowModal(false); loadData();
    } catch (err) { Swal.fire({ icon: 'error', title: 'Gagal', text: err.response?.data?.message || 'Error', confirmButtonColor: '#10b981' }); }
  };

  const hapus = (id) => {
    Swal.fire({ title: 'Hapus transaksi ini?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', confirmButtonText: 'Hapus' })
      .then(async r => { if (r.isConfirmed) { await api.delete(`/keuangan/${id}`); Swal.fire({ icon: 'success', title: 'Dihapus!', timer: 1200, showConfirmButton: false }); loadData(); }});
  };



  return (
    <div className="space-y-5 animate-fade-in">
      <div><h2 className="text-xl font-bold text-slate-900">Pemasukan & Pengeluaran Kas</h2><p className="text-sm text-slate-400 mt-0.5">Manajemen keuangan Ambulance Pondok Bambu</p></div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: TrendingUp, label: 'Total Pemasukan', value: data ? rupiah(data.totalMasuk) : '...', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { icon: TrendingDown, label: 'Total Pengeluaran', value: data ? rupiah(data.totalKeluar) : '...', color: 'text-red-600', bg: 'bg-red-50' },
          { icon: Wallet, label: 'Saldo Akhir', value: data ? rupiah(Math.abs(data.saldo)) : '...', color: data?.saldo >= 0 ? 'text-emerald-600' : 'text-red-600', bg: data?.saldo >= 0 ? 'bg-emerald-50' : 'bg-red-50', suffix: data?.saldo < 0 ? ' (Minus)' : '' },
        ].map((c, i) => (
          <div key={i} className="card p-4 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl ${c.bg} flex items-center justify-center shrink-0`}><c.icon size={20} className={c.color} /></div>
            <div><p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{c.label}</p><p className={`text-base font-bold ${c.color}`}>{c.value}{c.suffix || ''}</p></div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="card">
        <div className="px-5 py-3 flex flex-wrap gap-3 items-center">
          <input type="month" className="input w-44" value={filterBulan} onChange={e => setFilterBulan(e.target.value)} />
          <select className="select w-36" value={filterPJ} onChange={e => setFilterPJ(e.target.value)}>
            <option value="">Semua PJ</option><option value="Papah">Papah</option><option value="Mamah">Mamah</option>
          </select>
          <button className="btn btn-ghost btn-sm" onClick={() => { setFilterBulan(''); setFilterPJ(''); }}>Reset</button>
          <div className="ml-auto"><button className="btn btn-primary btn-sm" onClick={() => { setEditId(null); setForm({ tanggal: new Date().toISOString().split('T')[0], penanggung_jawab: '', keterangan: '', uang_masuk: '', uang_keluar: '' }); setShowModal(true); }}><Plus size={14} />Tambah Transaksi</button></div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-slate-100">
              {['No', 'Tanggal', 'Keterangan', 'Uang Masuk', 'Uang Keluar', 'PJ', 'Saldo', 'Aksi'].map(h => <th key={h} className="table-header px-4 py-3 text-left">{h}</th>)}
            </tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={8} className="text-center py-8 text-sm text-slate-400">Memuat...</td></tr> :
              filteredGrouped.length === 0 ? <tr><td colSpan={8} className="text-center py-8 text-sm text-slate-400">Belum ada data</td></tr> :
              displayRows.map(({ tgl, r, idxInDay }, idx) => (
                <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                  <td className="table-cell px-4 py-3 text-slate-400">{idx + 1}</td>
                  <td className={`px-4 py-3 text-sm ${idxInDay === 0 ? 'font-semibold text-emerald-700' : 'text-slate-400'}`}>{formatDateShort(tgl)}</td>
                  <td className="table-cell px-4 py-3">{r.keterangan}</td>
                  <td className="table-cell px-4 py-3 font-medium text-emerald-600">{Number(r.uang_masuk) > 0 ? rupiah(r.uang_masuk) : <span className="text-slate-300">—</span>}</td>
                  <td className="table-cell px-4 py-3 font-medium text-red-600">{Number(r.uang_keluar) > 0 ? rupiah(r.uang_keluar) : <span className="text-slate-300">—</span>}</td>
                  <td className="px-4 py-3"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${r.penanggung_jawab === 'Papah' ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200' : 'bg-red-50 text-red-700 ring-1 ring-red-200'}`}>{r.penanggung_jawab}</span></td>
                  <td className={`table-cell px-4 py-3 font-semibold ${r.saldo_run >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{rupiah(Math.abs(r.saldo_run))}</td>
                  <td className="px-4 py-3"><div className="flex gap-1">
                    <button className="btn btn-ghost p-1.5 rounded-lg" onClick={() => { setEditId(r.id); setForm({ tanggal: r.tanggal, penanggung_jawab: r.penanggung_jawab, keterangan: r.keterangan, uang_masuk: formatRupiahInput(r.uang_masuk), uang_keluar: formatRupiahInput(r.uang_keluar) }); setShowModal(true); }}><Pen size={14} /></button>
                    <button className="btn btn-ghost p-1.5 rounded-lg text-red-400 hover:text-red-600" onClick={() => hapus(r.id)}><Trash2 size={14} /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal Keuangan ── */}
      <Modal open={showModal} onClose={() => setShowModal(false)} icon={Wallet} iconColor="emerald">
        <>{editId ? 'Edit Transaksi' : 'Tambah Transaksi'}</>
        {<div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field icon={Calendar} label="Tanggal" required>
              <input type="date" className="input pl-12" value={form.tanggal} onChange={e => setForm({ ...form, tanggal: e.target.value })} />
            </Field>
            <Field icon={User} label="Penanggung Jawab" required>
              <select className="select pl-12" value={form.penanggung_jawab} onChange={e => setForm({ ...form, penanggung_jawab: e.target.value })}>
                <option value="">-- Pilih --</option><option value="Papah">Papah</option><option value="Mamah">Mamah</option>
              </select>
            </Field>
          </div>
          <Field icon={FileText} label="Keterangan" required>
            <input className="input pl-12" value={form.keterangan} onChange={e => setForm({ ...form, keterangan: e.target.value })} placeholder="Deskripsi transaksi" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field icon={TrendingUp} label="Uang Masuk">
              <input type="text" className="input pl-12" placeholder="0" value={form.uang_masuk} onChange={e => setForm({ ...form, uang_masuk: formatRupiahInput(e.target.value) })} />
            </Field>
            <Field icon={TrendingDown} label="Uang Keluar">
              <input type="text" className="input pl-12" placeholder="0" value={form.uang_keluar} onChange={e => setForm({ ...form, uang_keluar: formatRupiahInput(e.target.value) })} />
            </Field>
          </div>
          <div className="rounded-lg bg-sky-50 border border-sky-100 px-3 py-2 text-xs text-sky-700">Isi Uang Masuk <strong>atau</strong> Uang Keluar.</div>
        </div>}
        {<>
          <button className="btn btn-secondary px-4 py-2" onClick={() => setShowModal(false)}>Batal</button>
          <button className="btn btn-primary px-5 py-2 shadow-sm shadow-emerald-200" onClick={simpan}>Simpan</button>
        </>}
        <>{editId ? 'Perbarui transaksi keuangan yang sudah ada' : 'Catat transaksi kas masuk atau keluar baru'}</>
      </Modal>
    </div>
  );
}
