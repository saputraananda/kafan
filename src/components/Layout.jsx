import { useState, useEffect, useMemo } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function Layout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(() => {
    try { return localStorage.getItem('amb_sb_collapsed') === '1'; } catch { return false; }
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth < 992;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (!isMobile) return;
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobile, sidebarOpen]);

  const toggle = () => {
    if (isMobile) setSidebarOpen(v => !v);
    else setDesktopCollapsed(v => {
      const next = !v;
      try { localStorage.setItem('amb_sb_collapsed', next ? '1' : '0'); } catch {}
      return next;
    });
  };

  const pageTitle = useMemo(() => {
    const p = location.pathname;
    if (p.startsWith('/dashboard')) return 'Dashboard';
    if (p.startsWith('/barang')) return 'Stok Kain Kafan';
    if (p.startsWith('/keuangan')) return 'Kas Masuk / Keluar';
    if (p.startsWith('/transaksi')) return 'Transaksi Ambulance';
    if (p.startsWith('/harga')) return 'Daftar Harga';
    return 'Ambulance Pondok Bambu';
  }, [location.pathname]);

  const collapsed = !isMobile && desktopCollapsed;
  const layoutOffsetClass = isMobile ? 'ml-0' : collapsed ? 'ml-20' : 'ml-64';

  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar
        open={isMobile ? sidebarOpen : true}
        onClose={() => setSidebarOpen(false)}
        isMobile={isMobile}
        collapsed={collapsed}
      />
      <Topbar onToggle={toggle} title={pageTitle} isMobile={isMobile} collapsed={collapsed} offsetClass={layoutOffsetClass} />
      <main className={`pt-14 transition-all duration-200 ${layoutOffsetClass}`}>
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </div>
      </main>
      {isMobile && sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
}
