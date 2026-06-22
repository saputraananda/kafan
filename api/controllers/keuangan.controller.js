import pool from '../db/ambulance.js';

export const listKeuangan = async (req, res) => {
  try {
    // totals
    const [[{ totalMasuk }]] = await pool.query('SELECT COALESCE(SUM(uang_masuk),0) as totalMasuk FROM tr_keuangan');
    const [[{ totalKeluar }]] = await pool.query('SELECT COALESCE(SUM(uang_keluar),0) as totalKeluar FROM tr_keuangan');
    const saldo = Number(totalMasuk) - Number(totalKeluar);

    // all rows
    const [rows] = await pool.query('SELECT * FROM tr_keuangan ORDER BY tanggal ASC, id ASC');
    let runSaldo = 0;
    const grouped = {};
    rows.forEach(r => {
      runSaldo += Number(r.uang_masuk) - Number(r.uang_keluar);
      r.saldo_run = runSaldo;
      const key = r.tanggal;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(r);
    });
    // reverse for latest-first
    const reversed = Object.entries(grouped).reverse();

    res.json({ success: true, totalMasuk: Number(totalMasuk), totalKeluar: Number(totalKeluar), saldo, grouped: reversed });
  } catch (err) {
    console.error('[keuangan.list]', err.message);
    res.status(500).json({ message: 'Gagal memuat data keuangan' });
  }
};

export const addKeuangan = async (req, res) => {
  try {
    const { tanggal, penanggung_jawab, keterangan, uang_masuk, uang_keluar } = req.body;
    if (!tanggal || !penanggung_jawab || !keterangan) {
      return res.status(400).json({ message: 'Tanggal, PJ, dan keterangan wajib diisi' });
    }
    if (!uang_masuk && !uang_keluar) {
      return res.status(400).json({ message: 'Minimal isi uang masuk atau uang keluar' });
    }
    await pool.query(
      'INSERT INTO tr_keuangan (tanggal, keterangan, uang_masuk, uang_keluar, penanggung_jawab) VALUES (?, ?, ?, ?, ?)',
      [tanggal, keterangan, uang_masuk || 0, uang_keluar || 0, penanggung_jawab]
    );
    res.json({ success: true, message: 'Transaksi berhasil ditambahkan' });
  } catch (err) {
    console.error('[keuangan.add]', err.message);
    res.status(500).json({ message: 'Gagal menambah transaksi' });
  }
};

export const updateKeuangan = async (req, res) => {
  try {
    const { id } = req.params;
    const { tanggal, penanggung_jawab, keterangan, uang_masuk, uang_keluar } = req.body;
    await pool.query(
      'UPDATE tr_keuangan SET tanggal=?, keterangan=?, uang_masuk=?, uang_keluar=?, penanggung_jawab=? WHERE id=?',
      [tanggal, keterangan, uang_masuk || 0, uang_keluar || 0, penanggung_jawab, id]
    );
    res.json({ success: true, message: 'Transaksi berhasil diupdate' });
  } catch (err) {
    console.error('[keuangan.update]', err.message);
    res.status(500).json({ message: 'Gagal mengupdate transaksi' });
  }
};

export const deleteKeuangan = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM tr_keuangan WHERE id=?', [id]);
    res.json({ success: true, message: 'Transaksi berhasil dihapus' });
  } catch (err) {
    console.error('[keuangan.delete]', err.message);
    res.status(500).json({ message: 'Gagal menghapus transaksi' });
  }
};
