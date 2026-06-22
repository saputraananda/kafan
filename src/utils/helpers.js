export function rupiah(n) {
  return 'Rp ' + Number(n).toLocaleString('id-ID');
}

export function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
}

export function formatDateShort(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function todayStr() {
  return new Date().toISOString().split('T')[0];
}

export function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

export const statusBadgeClass = {
  Pending: 'badge-pending',
  Berjalan: 'badge-berjalan',
  Selesai: 'badge-selesai',
  Dibatalkan: 'badge-dibatalkan',
};
