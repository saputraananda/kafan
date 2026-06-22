import { Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated } from './utils/api';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import BarangPage from './pages/BarangPage';
import KeuanganPage from './pages/KeuanganPage';
import TransaksiPage from './pages/TransaksiPage';
import HargaPage from './pages/HargaPage';

function PrivateRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  return !isAuthenticated() ? children : <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/barang" element={<BarangPage />} />
        <Route path="/keuangan" element={<KeuanganPage />} />
        <Route path="/transaksi" element={<TransaksiPage />} />
        <Route path="/harga" element={<HargaPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
