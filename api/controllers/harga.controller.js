import pool from '../db/ambulance.js';

export const listHarga = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM mst_harga_ambulance ORDER BY wilayah, kota_tujuan, tipe_harga');
    // stats
    const [[{ total }]] = await pool.query('SELECT COUNT(*) as total FROM mst_harga_ambulance');
    const [[{ totalBaru }]] = await pool.query("SELECT COUNT(*) as totalBaru FROM mst_harga_ambulance WHERE tipe_harga='Baru'");
    const [[{ totalLama }]] = await pool.query("SELECT COUNT(*) as totalLama FROM mst_harga_ambulance WHERE tipe_harga='Lama'");
    const [[{ totalWil }]] = await pool.query('SELECT COUNT(DISTINCT wilayah) as totalWil FROM mst_harga_ambulance');

    // group by wilayah > kota_tujuan, pivot Baru/Lama
    const grouped = {};
    rows.forEach(r => {
      const w = r.wilayah || 'Lainnya';
      const t = r.kota_tujuan;
      if (!grouped[w]) grouped[w] = {};
      if (!grouped[w][t]) grouped[w][t] = { baru: null, lama: null };
      grouped[w][t][r.tipe_harga === 'Baru' ? 'baru' : 'lama'] = r;
    });

    res.json({
      success: true,
      stats: { total: Number(total), totalBaru: Number(totalBaru), totalLama: Number(totalLama), totalWil: Number(totalWil) },
      grouped,
      wilayahList: Object.keys(grouped),
    });
  } catch (err) {
    console.error('[harga.list]', err.message);
    res.status(500).json({ message: 'Gagal memuat data harga' });
  }
};

export const addHarga = async (req, res) => {
  try {
    const { nama_layanan, wilayah, kota_asal, kota_tujuan, harga, keterangan, status, tipe_harga } = req.body;
    if (!wilayah || !kota_tujuan) return res.status(400).json({ message: 'Wilayah dan kota tujuan wajib diisi' });
    await pool.query(
      'INSERT INTO mst_harga_ambulance (nama_layanan, wilayah, kota_asal, kota_tujuan, harga, keterangan, status, tipe_harga) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [nama_layanan || kota_tujuan, wilayah, kota_asal || 'Tangerang', kota_tujuan, harga || 0, keterangan || null, status || 'Aktif', tipe_harga || 'Baru']
    );
    res.json({ success: true, message: 'Harga berhasil ditambahkan' });
  } catch (err) {
    console.error('[harga.add]', err.message);
    res.status(500).json({ message: 'Gagal menambah harga' });
  }
};

export const updateHarga = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama_layanan, wilayah, kota_asal, kota_tujuan, harga, keterangan, status, tipe_harga } = req.body;
    await pool.query(
      'UPDATE mst_harga_ambulance SET nama_layanan=?, wilayah=?, kota_asal=?, kota_tujuan=?, harga=?, keterangan=?, status=?, tipe_harga=? WHERE id=?',
      [nama_layanan, wilayah, kota_asal || 'Tangerang', kota_tujuan, harga || 0, keterangan || null, status || 'Aktif', tipe_harga || 'Baru', id]
    );
    res.json({ success: true, message: 'Harga berhasil diupdate' });
  } catch (err) {
    console.error('[harga.update]', err.message);
    res.status(500).json({ message: 'Gagal mengupdate harga' });
  }
};

export const deleteHarga = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM mst_harga_ambulance WHERE id=?', [id]);
    res.json({ success: true, message: 'Harga berhasil dihapus' });
  } catch (err) {
    console.error('[harga.delete]', err.message);
    res.status(500).json({ message: 'Gagal menghapus harga' });
  }
};

export const toggleStatus = async (req, res) => {
  try {
    const { id } = req.body;
    const [rows] = await pool.query('SELECT status FROM mst_harga_ambulance WHERE id=?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Data tidak ditemukan' });
    const newStatus = rows[0].status === 'Aktif' ? 'Non-Aktif' : 'Aktif';
    await pool.query('UPDATE mst_harga_ambulance SET status=? WHERE id=?', [newStatus, id]);
    res.json({ success: true, status: newStatus });
  } catch (err) {
    console.error('[harga.toggle]', err.message);
    res.status(500).json({ message: 'Gagal toggle status' });
  }
};
