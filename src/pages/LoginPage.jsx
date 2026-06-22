import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { setAuth } from '../utils/api';
import { Truck, Eye, EyeOff, LogIn } from 'lucide-react';
import Swal from 'sweetalert2';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      Swal.fire({ icon: 'warning', title: 'Perhatian', text: 'Username dan password wajib diisi', confirmButtonColor: '#10b981' });
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { username, password });
      if (res.data.success) {
        setAuth(res.data.token, res.data.user);
        navigate('/dashboard');
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Login Gagal', text: err.response?.data?.message || 'Terjadi kesalahan', confirmButtonColor: '#10b981' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm animate-slide-up">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-200 mb-4">
              <Truck size={28} />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Ambulance Pondok Bambu</h2>
            <p className="text-sm text-slate-400 mt-0.5">Masuk ke sistem manajemen</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label" htmlFor="username">Username</label>
              <input id="username" type="text" className="input" placeholder="Masukkan username"
                value={username} onChange={e => setUsername(e.target.value)} autoFocus />
            </div>
            <div>
              <label className="label" htmlFor="password">Password</label>
              <div className="relative">
                <input id="password" type={showPw ? 'text' : 'password'} className="input pr-10"
                  placeholder="Masukkan password" value={password} onChange={e => setPassword(e.target.value)} />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full">
              {loading ? (
                <span className="flex items-center gap-2"><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Memproses...</span>
              ) : (
                <span className="flex items-center gap-2"><LogIn size={16} />Masuk</span>
              )}
            </button>
          </form>
        </div>
        <p className="text-center text-xs text-slate-400 mt-6">&copy; {new Date().getFullYear()} Ambulance Pondok Bambu</p>
      </div>
    </div>
  );
}
