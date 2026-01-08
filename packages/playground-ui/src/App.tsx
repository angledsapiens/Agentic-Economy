import { useState } from 'react';
import { LayoutDashboard, ShoppingCart, Settings, FileText } from 'lucide-react';
import Marketplace from './components/Marketplace';
import Config from './components/Config';
import Audit from './components/Audit';

function App() {
  const [activeTab, setActiveTab] = useState<'marketplace' | 'config' | 'audit'>('marketplace');

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-800 p-6 flex flex-col gap-6 border-r border-slate-700">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <LayoutDashboard className="w-6 h-6 text-blue-400" />
          <span>LIS Dashboard</span>
        </h1>

        <nav className="flex flex-col gap-2">
          <button
            onClick={() => setActiveTab('marketplace')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'marketplace' ? 'bg-blue-600 text-white' : 'hover:bg-slate-700 text-slate-400'}`}
          >
            <ShoppingCart className="w-5 h-5" />
            Marketplace
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'config' ? 'bg-blue-600 text-white' : 'hover:bg-slate-700 text-slate-400'}`}
          >
            <Settings className="w-5 h-5" />
            Configuration
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'audit' ? 'bg-blue-600 text-white' : 'hover:bg-slate-700 text-slate-400'}`}
          >
            <FileText className="w-5 h-5" />
            Audit Log
          </button>
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-700 text-xs text-slate-500">
          <p>Liquidity Intents SDK v0</p>
          <p>Env: {import.meta.env.MODE}</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {activeTab === 'marketplace' && <Marketplace />}
        {activeTab === 'config' && <Config />}
        {activeTab === 'audit' && <Audit />}
      </main>
    </div>
  );
}

export default App;
