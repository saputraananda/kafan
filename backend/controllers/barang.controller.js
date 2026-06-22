import pool from '../db/ambulance.js';

export const listBarang = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM mst_barang ORDER BY id ASC');
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('[barang.list]', err.message);
    res.status(500).json({ message: 'Gagal memuat data barang' });
  }
};

export const addBarang = async (req, res) => {
  try {
    const { nama_barang, stok, keterangan } = req.body;
    if (!nama_barang) return res.status(400).json({ message: 'Nama barang wajib diisi' });
    await pool.query(
      'INSERT INTO mst_barang (nama_barang, satuan, stok, keterangan) VALUES (?, ?, ?, ?)',
      [nama_barang, 'pcs', stok || 0, keterangan || null]
    );
    res.json({ success: true, message: 'Barang berhasil ditambahkan' });
  } catch (err) {
    console.error('[barang.add]', err.message);
    res.status(500).json({ message: 'Gagal menambah barang' });
  }
};

export const updateBarang = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama_barang, stok, keterangan } = req.body;
    await pool.query(
      'UPDATE mst_barang SET nama_barang=?, stok=?, keterangan=? WHERE id=?',
      [nama_barang, stok, keterangan || null, id]
    );
    res.json({ success: true, message: 'Barang berhasil diupdate' });
  } catch (err) {
    console.error('[barang.update]', err.message);
    res.status(500).json({ message: 'Gagal mengupdate barang' });
  }
};

export const deleteBarang = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM mst_barang WHERE id=?', [id]);
    res.json({ success: true, message: 'Barang berhasil dihapus' });
  } catch (err) {
    console.error('[barang.delete]', err.message);
    res.status(500).json({ message: 'Gagal menghapus barang (mungkin masih dipakai)' });
  }
};

export const listPemakaian = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.*, b.nama_barang,
             DATE_FORMAT(p.tanggal, '%d/%m/%Y') as tanggal_fmt
      FROM tr_pemakaian_barang p
      JOIN mst_barang b ON b.id = p.barang_id
      ORDER BY p.tanggal DESC, p.id DESC
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('[barang.pemakaian]', err.message);
    res.status(500).json({ message: 'Gagal memuat riwayat pemakaian' });
  }
};

export const addPemakaian = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { tanggal, barang_id, jumlah, keterangan } = req.body;
    if (!tanggal || !barang_id || !jumlah) {
      return res.status(400).json({ message: 'Tanggal, barang, dan jumlah wajib diisi' });
    }
    // cek stok
    const [cek] = await conn.query('SELECT stok FROM mst_barang WHERE id=?', [barang_id]);
    if (cek.length === 0) return res.status(404).json({ message: 'Barang tidak ditemukan' });
    if (cek[0].stok < jumlah) return res.status(400).json({ message: `Stok tidak cukup. Tersedia: ${cek[0].stok}` });

    await conn.beginTransaction();
    await conn.query(
      'INSERT INTO tr_pemakaian_barang (tanggal, barang_id, jumlah, keterangan) VALUES (?, ?, ?, ?)',
      [tanggal, barang_id, jumlah, keterangan || null]
    );
    await conn.query('UPDATE mst_barang SET stok = stok - ? WHERE id=?', [jumlah, barang_id]);
    await conn.commit();
    res.json({ success: true, message: 'Pemakaian berhasil dicatat' });
  } catch (err) {
    await conn.rollback();
    console.error('[barang.addPemakaian]', err.message);
    res.status(500).json({ message: 'Gagal mencatat pemakaian' });
  } finally {
    conn.release();
  }
};

export const deletePemakaian = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { id } = req.params;
    const [rows] = await conn.query('SELECT * FROM tr_pemakaian_barang WHERE id=?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Data tidak ditemukan' });

    await conn.beginTransaction();
    await conn.query('UPDATE mst_barang SET stok = stok + ? WHERE id=?', [rows[0].jumlah, rows[0].barang_id]);
    await conn.query('DELETE FROM tr_pemakaian_barang WHERE id=?', [id]);
    await conn.commit();
    res.json({ success: true, message: 'Pemakaian berhasil dibatalkan' });
  } catch (err) {
    await conn.rollback();
    console.error('[barang.deletePemakaian]', err.message);
    res.status(500).json({ message: 'Gagal membatalkan pemakaian' });
  } finally {
    conn.release();
  }
};

export const restockBarang = async (req, res) => {
  try {
    const { id, jumlah } = req.body;
    if (!id || !jumlah || jumlah < 1) return res.status(400).json({ message: 'Data tidak valid' });
    await pool.query('UPDATE mst_barang SET stok = stok + ? WHERE id=?', [jumlah, id]);
    res.json({ success: true, message: 'Stok berhasil ditambahkan' });
  } catch (err) {
    console.error('[barang.restock]', err.message);
    res.status(500).json({ message: 'Gagal menambah stok' });
  }
};
