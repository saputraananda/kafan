import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const SECRET = process.env.SESSION_SECRET || 'fallback-secret';

// Hardcoded users — sesuai index.php original
const USERS = [
  { username: 'admin',  password: 'admin',  displayName: 'Admin',  role: 'admin' },
  { username: 'Admin',  password: 'Admin',  displayName: 'Admin',  role: 'admin' },
  { username: 'papah',  password: 'papah',  displayName: 'Papah',  role: 'admin' },
  { username: 'Papah',  password: 'Papah',  displayName: 'Papah',  role: 'admin' },
  { username: 'mamah',  password: 'mamah',  displayName: 'Mamah',  role: 'admin' },
  { username: 'Mamah',  password: 'Mamah',  displayName: 'Mamah',  role: 'admin' },
];

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username dan password wajib diisi' });
    }

    const user = USERS.find((u) => u.username === username && u.password === password);
    if (!user) {
      return res.status(401).json({ message: 'Username atau password salah.' });
    }

    const token = jwt.sign(
      { username: user.displayName, role: user.role },
      SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: { username: user.displayName, role: user.role },
    });
  } catch (err) {
    console.error('[auth.login]', err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

export const me = async (req, res) => {
  res.json({ success: true, user: req.user });
};

export const logout = async (req, res) => {
  res.json({ success: true, message: 'Logout berhasil' });
};
