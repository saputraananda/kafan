import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { rupiah, formatDate, statusBadgeClass } from '../utils/helpers';
import { Boxes, Truck, Wallet, AlertTriangle, ArrowRight, CircleDollarSign } from 'lucide-react';
import Swal from 'sweetalert2';

export default function DashboardPage() {
  const [data, setData] = useState({ loading: true, transaksiStats: null, keuangan: null, barang: [], transaksi: [] });

  useEffect(() => {
    const fetch = async () => {
      setData(prev => ({ ...prev, loading: true }));
      try {
        const [tStats, k, b, tr] = await Promise.all([
          api.get('/transaksi/stats').catch(() => null),
          api.get('/keuangan').catch(() => null),
          api.get('/barang').catch(() => null),
          api.get('/transaksi').catch(() => null),
        ]);
        setData({
          loading: false,
          transaksiStats: tStats?.data || {},
          keuangan: k?.data || {},
          barang: b?.data?.data || [],
          transaksi: tr?.data?.data || [],
        });
      } catch { Swal.fire({ icon: 'error', title: 'Gagal', text: 'Gagal memuat dashboard', confirmButtonColor: '#10b981' }); }
    };
    fetch();
  }, []);

  const stokBadge = (s) => s <= 0 ? 'bg-red-100 text-red-700' : s <= 3 ? 'bg-red-50 text-red-700 ring-1 ring-red-200' : s <= 5 ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200';

  const computed = useMemo(() => {
    const barang = data.barang || [];
    const low = barang.filter(b => Number(b.stok) <= 5).sort((a, b) => Number(a.stok) - Number(b.stok));
    const latest = (data.transaksi || []).slice(0, 5);
    return {
      jenisBarang: barang.length,
      stokMenipis: low.length,
      lowList: low.slice(0, 5),
      latest,
    };
  }, [data.barang, data.transaksi]);

  const cards = [
    { icon: Boxes, label: 'Jenis Barang', value: computed.jenisBarang, tone: 'emerald' },
    { icon: AlertTriangle, label: 'Stok Menipis (≤5)', value: computed.stokMenipis, tone: 'amber' },
    { icon: Truck, label: 'Trip Bulan Ini', value: data.transaksiStats?.total ?? '—', tone: 'sky' },
    { icon: CircleDollarSign, label: 'Omzet Bulan Ini', value: data.transaksiStats?.omzet != null ? rupiah(data.transaksiStats.omzet) : '—', tone: 'violet' },
    { icon: Wallet, label: 'Saldo Kas', value: data.keuangan?.saldo != null ? rupiah(data.keuangan.saldo) : '—', tone: data.keuangan?.saldo >= 0 ? 'emerald' : 'red' },
  ];

  const toneMap = {
    emerald: { text: 'text-emerald-700', iconBg: 'bg-emerald-50', iconText: 'text-emerald-600' },
    amber: { text: 'text-amber-700', iconBg: 'bg-amber-50', iconText: 'text-amber-600' },
    sky: { text: 'text-sky-700', iconBg: 'bg-sky-50', iconText: 'text-sky-600' },
    violet: { text: 'text-violet-700', iconBg: 'bg-violet-50', iconText: 'text-violet-600' },
    red: { text: 'text-red-700', iconBg: 'bg-red-50', iconText: 'text-red-600' },
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Dashboard</h2>
          <p className="text-xs text-slate-500 mt-0.5">Ringkasan data Ambulance Pondok Bambu</p>
        </div>
        <div className="hidden sm:flex gap-2">
          <Link to="/transaksi" className="btn btn-secondary btn-sm">Lihat Transaksi <ArrowRight size={14} /></Link>
          <Link to="/barang" className="btn btn-secondary btn-sm">Kelola Stok <ArrowRight size={14} /></Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {cards.map((c) => {
          const tone = toneMap[c.tone] || toneMap.emerald;
          return (
            <div key={c.label} className="card p-4 flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl ${tone.iconBg} flex items-center justify-center shrink-0`}>
                <c.icon size={20} className={tone.iconText} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{c.label}</p>
                <p className={`text-lg font-bold ${tone.text} truncate`}>{c.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="card overflow-hidden lg:col-span-2">
          <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck size={16} className="text-emerald-600" />
              <span className="text-sm font-semibold text-slate-800">Trip Ambulance Terbaru</span>
            </div>
            <Link to="/transaksi" className="btn btn-secondary btn-sm">Lihat Semua</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Tanggal', 'Pasien', 'Tujuan', 'Harga', 'Status'].map(h => (
                    <th key={h} className="table-header px-4 py-3 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.loading ? (
                  <tr><td colSpan={5} className="text-center py-8 text-sm text-slate-400">Memuat...</td></tr>
                ) : computed.latest.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-8 text-sm text-slate-400">Belum ada data</td></tr>
                ) : computed.latest.map((r) => (
                  <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="table-cell px-4 py-3 text-slate-500">{formatDate(r.tanggal)}</td>
                    <td className="table-cell px-4 py-3 font-medium text-slate-800">{r.nama_pasien}</td>
                    <td className="table-cell px-4 py-3 max-w-[220px] truncate text-slate-500" title={r.tujuan}>{r.tujuan}</td>
                    <td className="table-cell px-4 py-3 font-semibold text-emerald-600">{rupiah(r.harga_final)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusBadgeClass[r.status] || 'bg-slate-50 text-slate-600 ring-1 ring-slate-200'}`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-600" />
              <span className="text-sm font-semibold text-slate-800">Stok Menipis</span>
            </div>
            <Link to="/barang" className="btn btn-secondary btn-sm">Kelola Stok</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Barang', 'Stok'].map(h => <th key={h} className="table-header px-4 py-3 text-left">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {data.loading ? (
                  <tr><td colSpan={2} className="text-center py-8 text-sm text-slate-400">Memuat...</td></tr>
                ) : computed.lowList.length === 0 ? (
                  <tr><td colSpan={2} className="text-center py-8 text-sm text-slate-400">Aman, tidak ada stok menipis</td></tr>
                ) : computed.lowList.map((b) => (
                  <tr key={b.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="table-cell px-4 py-3 font-medium text-slate-800">{b.nama_barang}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${stokBadge(Number(b.stok))}`}>
                        {b.stok}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
