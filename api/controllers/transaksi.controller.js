import pool from '../db/ambulance.js';

export const listTransaksi = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT t.*, h.nama_layanan
      FROM tr_ambulance t
      LEFT JOIN mst_harga_ambulance h ON h.id = t.harga_id
      ORDER BY t.tanggal DESC, t.id DESC
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('[transaksi.list]', err.message);
    res.status(500).json({ message: 'Gagal memuat data transaksi' });
  }
};

export const getStats = async (req, res) => {
  try {
    const bulan = req.query.bulan || new Date().toISOString().slice(0, 7);
    const [[{ total }]] = await pool.query(
      "SELECT COUNT(*) as total FROM tr_ambulance WHERE DATE_FORMAT(tanggal,'%Y-%m')=?", [bulan]
    );
    const [[{ selesai }]] = await pool.query(
      "SELECT COUNT(*) as selesai FROM tr_ambulance WHERE status='Selesai' AND DATE_FORMAT(tanggal,'%Y-%m')=?", [bulan]
    );
    const [[{ omzet }]] = await pool.query(
      "SELECT COALESCE(SUM(harga_final),0) as omzet FROM tr_ambulance WHERE status='Selesai' AND DATE_FORMAT(tanggal,'%Y-%m')=?", [bulan]
    );
    res.json({ success: true, total: Number(total), selesai: Number(selesai), omzet: Number(omzet) });
  } catch (err) {
    console.error('[transaksi.stats]', err.message);
    res.status(500).json({ message: 'Gagal memuat statistik' });
  }
};

export const getHargaOptions = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM mst_harga_ambulance WHERE status='Aktif' AND tipe_harga='Baru' ORDER BY wilayah, kota_tujuan"
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('[transaksi.hargaOpts]', err.message);
    res.status(500).json({ message: 'Gagal memuat opsi harga' });
  }
};

export const addTransaksi = async (req, res) => {
  try {
    const { tanggal, nama_pasien, no_hp, pengemudi, alamat_penjemputan, tujuan, harga_id, harga_final, status, keterangan } = req.body;
    if (!tanggal || !nama_pasien || !alamat_penjemputan || !tujuan) {
      return res.status(400).json({ message: 'Tanggal, pasien, alamat jemput, dan tujuan wajib diisi' });
    }
    await pool.query(
      `INSERT INTO tr_ambulance (tanggal, nama_pasien, no_hp, pengemudi, alamat_penjemputan, tujuan, harga_id, harga_final, status, keterangan)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [tanggal, nama_pasien, no_hp || null, pengemudi || null, alamat_penjemputan, tujuan, harga_id || null, harga_final || 0, status || 'Pending', keterangan || null]
    );
    res.json({ success: true, message: 'Transaksi berhasil ditambahkan' });
  } catch (err) {
    console.error('[transaksi.add]', err.message);
    res.status(500).json({ message: 'Gagal menambah transaksi' });
  }
};

export const updateTransaksi = async (req, res) => {
  try {
    const { id } = req.params;
    const { tanggal, nama_pasien, no_hp, pengemudi, alamat_penjemputan, tujuan, harga_id, harga_final, status, keterangan } = req.body;
    await pool.query(
      `UPDATE tr_ambulance SET tanggal=?, nama_pasien=?, no_hp=?, pengemudi=?, alamat_penjemputan=?, tujuan=?, harga_id=?, harga_final=?, status=?, keterangan=? WHERE id=?`,
      [tanggal, nama_pasien, no_hp || null, pengemudi || null, alamat_penjemputan, tujuan, harga_id || null, harga_final || 0, status || 'Pending', keterangan || null, id]
    );
    res.json({ success: true, message: 'Transaksi berhasil diupdate' });
  } catch (err) {
    console.error('[transaksi.update]', err.message);
    res.status(500).json({ message: 'Gagal mengupdate transaksi' });
  }
};

export const deleteTransaksi = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM tr_ambulance WHERE id=?', [id]);
    res.json({ success: true, message: 'Transaksi berhasil dihapus' });
  } catch (err) {
    console.error('[transaksi.delete]', err.message);
    res.status(500).json({ message: 'Gagal menghapus transaksi' });
  }
};
