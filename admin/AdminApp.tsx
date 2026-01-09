import React, { useState } from 'react';
import { AdminAuthGuard } from './components/AuthGuard';
import { MaterialsManager } from './components/Materials';
import { FormulasManager } from './components/Formulas';
import { OrdersManager } from './components/Orders';
import { EmailStyleEditor } from './components/EmailStyleEditor';
import { Dashboard } from './components/Dashboard';
import { supabase } from './utils/supabaseClient';

type TabKey = 'dashboard' | 'materials' | 'formulas' | 'orders' | 'email-styles';

export const AdminApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const adminPublicUrl =
    (import.meta as any).env?.VITE_ADMIN_PUBLIC_URL ||
    (typeof window !== 'undefined' ? `${window.location.origin}/admin` : '/admin');

  const copyAdminUrl = async () => {
    try {
      await navigator.clipboard.writeText(adminPublicUrl);
    } catch (error) {
      return;
    }
  };

  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-gray-50 p-6">
        <header className="max-w-6xl mx-auto mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/image/logo-placeholder.jpg.png" alt="Logo EGEA" className="h-8 object-contain" />
            <div>
              <h1 className="text-xl font-bold text-gray-800">Backoffice EGEA</h1>
              <p className="text-sm text-gray-500">Acceso restringido</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col items-end text-xs text-gray-500">
              <span>Acceso externo</span>
              <button
                type="button"
                onClick={copyAdminUrl}
                className="text-orange-600 hover:text-orange-700"
                title="Copiar enlace de admin"
              >
                Copiar enlace
              </button>
            </div>
            <button
              type="button"
              onClick={copyAdminUrl}
              className="md:hidden px-3 py-2 text-xs font-medium border border-gray-300 rounded-lg text-gray-700"
            >
              Copiar URL
            </button>
            <button
              onClick={() => supabase.auth.signOut()}
              className="px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg"
            >
              Salir
            </button>
          </div>
        </header>

        <nav className="max-w-6xl mx-auto flex gap-2 mb-6">
          <button
            className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'dashboard' ? 'bg-orange-500 text-white' : 'bg-white border border-gray-200 text-gray-700'}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button
            className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'materials' ? 'bg-orange-500 text-white' : 'bg-white border border-gray-200 text-gray-700'}`}
            onClick={() => setActiveTab('materials')}
          >
            Materiales
          </button>
          <button
            className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'formulas' ? 'bg-orange-500 text-white' : 'bg-white border border-gray-200 text-gray-700'}`}
            onClick={() => setActiveTab('formulas')}
          >
            Formulas
          </button>
          <button
            className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'orders' ? 'bg-orange-500 text-white' : 'bg-white border border-gray-200 text-gray-700'}`}
            onClick={() => setActiveTab('orders')}
          >
            Pedidos
          </button>
          <button
            className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'email-styles' ? 'bg-orange-500 text-white' : 'bg-white border border-gray-200 text-gray-700'}`}
            onClick={() => setActiveTab('email-styles')}
          >
            Estilos de Correos
          </button>
        </nav>

        <main className="max-w-6xl mx-auto">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'materials' && <MaterialsManager />}
          {activeTab === 'formulas' && <FormulasManager />}
          {activeTab === 'orders' && <OrdersManager />}
          {activeTab === 'email-styles' && <EmailStyleEditor />}
        </main>
      </div>
    </AdminAuthGuard>
  );
};
