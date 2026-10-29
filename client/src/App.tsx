import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { StoreProvider, useStore } from './contexts/StoreContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ToastContainer } from './components/ToastContainer';
import { QuickScannerModal } from './components/QuickScannerModal';

import { Dashboard } from './pages/Dashboard';
import { PickingTerminal } from './pages/PickingTerminal';
import { InventoryList } from './pages/InventoryList';
import { InwardingGRN } from './pages/InwardingGRN';
import { StoreMap } from './pages/StoreMap';
import { ExpiryTracker } from './pages/ExpiryTracker';
import { OrdersDispatch } from './pages/OrdersDispatch';
import { StockAudit } from './pages/StockAudit';
import { UsersManagement } from './pages/UsersManagement';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

const MainLayout: React.FC = () => {
  const { user, isLoading } = useAuth();
  const { openScanner } = useStore();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [authView, setAuthView] = useState<'login' | 'register'>('login');

  // Global keyboard shortcut to open barcode scanner ('/' or 'Ctrl+K')
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === '/' || (e.ctrlKey && e.key === 'k') || (e.metaKey && e.key === 'k')) && !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as any)?.tagName)) {
        e.preventDefault();
        openScanner();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openScanner]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono text-emerald-400">Loading Ganesh Dark Store OS...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return authView === 'login' ? (
      <Login onSwitchToRegister={() => setAuthView('register')} />
    ) : (
      <Register onSwitchToLogin={() => setAuthView('login')} />
    );
  }

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard setActiveTab={setActiveTab} />;
      case 'picking':
        return <PickingTerminal setActiveTab={setActiveTab} />;
      case 'inventory':
        return <InventoryList />;
      case 'inwarding':
        return <InwardingGRN />;
      case 'store-map':
        return <StoreMap />;
      case 'expiry':
        return <ExpiryTracker />;
      case 'orders':
        return <OrdersDispatch />;
      case 'audit':
        return <StockAudit />;
      case 'staff':
        return <UsersManagement />;
      default:
        return <Dashboard setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-pink-500 selection:text-white">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 bg-slate-950">
          <div className="max-w-7xl mx-auto">
            {renderActivePage()}
          </div>
        </main>
      </div>

      <QuickScannerModal />
      <ToastContainer />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <MainLayout />
      </StoreProvider>
    </AuthProvider>
  );
}

export default App;

