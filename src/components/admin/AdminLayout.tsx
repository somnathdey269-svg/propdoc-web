import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Cpu, 
  Settings, 
  GitMerge, 
  GitBranch,
  BarChart3, 
  LogOut, 
  Lock, 
  Key, 
  Mail, 
  Sparkles
} from 'lucide-react';
import ScraperControlPanel from './ScraperControlPanel';
import ScraperConfigEditor from './ScraperConfigEditor';
import MatchReviewQueue from './MatchReviewQueue';
import PortalPriceMatrix from './PortalPriceMatrix';
import AdaptivePipelineManager from './AdaptivePipelineManager';

const SUPERADMIN_EMAIL = 'somnathdey269@gmail.com';
const SUPERADMIN_PASS = 'Deevarsh@190521';

interface AdminLayoutProps {
  onClose?: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ onClose }) => {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('urbanx_superadmin_auth') === 'true';
  });
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Active Tab
  const [activeTab, setActiveTab] = useState<'control' | 'pipeline' | 'config' | 'queue' | 'matrix'>('control');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim().toLowerCase() === SUPERADMIN_EMAIL && passwordInput === SUPERADMIN_PASS) {
      localStorage.setItem('urbanx_superadmin_auth', 'true');
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Invalid Superadmin credentials. Access strictly restricted to somnathdey269@gmail.com.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('urbanx_superadmin_auth');
    setIsAuthenticated(false);
  };

  // If Not Authenticated -> Show Ultra-Sleek Superadmin Login Modal
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xl p-4">
        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl shadow-indigo-500/10 relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl" />

          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-tr from-indigo-600 to-cyan-500 rounded-2xl shadow-lg shadow-indigo-500/30 text-white">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Superadmin Gateway</h2>
              <p className="text-xs text-slate-400">UrbanX Ahmedabad & Gandhinagar Intelligence</p>
            </div>
          </div>

          {authError && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400 font-medium">
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Superadmin Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="somnathdey269@gmail.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Master Password</label>
              <div className="relative">
                <Key className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 mt-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 rounded-xl text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 hover:opacity-95 transition-all flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" /> Authenticate Superadmin Access
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
            <span>Restricted Access</span>
            {onClose && (
              <button onClick={onClose} className="hover:text-slate-300 transition-colors">
                Back to Platform
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Authenticated Layout
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans relative overflow-x-hidden">
      {/* Background Subtle Gradient Nets */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Navigation Header */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/80 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-indigo-500 to-cyan-400 rounded-xl text-white shadow-md shadow-indigo-500/20">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-tight">UrbanX Superadmin</h1>
              <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Live Engine Active
              </span>
            </div>
            <p className="text-xs text-slate-400">GujRERA + 4-Portal Real Estate Scraper & Intelligence Suite</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <nav className="flex items-center gap-1 bg-slate-950/80 border border-slate-800 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('control')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'control'
                ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" /> Scraper Control Panel
          </button>

          <button
            onClick={() => setActiveTab('pipeline')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'pipeline'
                ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" /> Adaptive Pipeline
          </button>

          <button
            onClick={() => setActiveTab('config')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'config'
                ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Settings className="w-3.5 h-3.5" /> Dynamic Configs
          </button>

          <button
            onClick={() => setActiveTab('queue')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'queue'
                ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitMerge className="w-3.5 h-3.5" /> Match Queue
          </button>

          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'matrix'
                ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" /> Pricing Matrix
          </button>
        </nav>

        {/* User Info & Actions */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-slate-200">{SUPERADMIN_EMAIL}</p>
            <span className="text-[10px] text-indigo-400 font-medium">Superadmin Privilege</span>
          </div>

          <button
            onClick={handleLogout}
            title="Logout"
            className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-400 hover:text-rose-400 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="px-3 py-2 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-xs font-semibold text-indigo-300 hover:bg-indigo-600/30 transition-colors"
            >
              Exit Admin
            </button>
          )}
        </div>
      </header>

      {/* Main Content Body */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'control' && <ScraperControlPanel />}
        {activeTab === 'pipeline' && <AdaptivePipelineManager />}
        {activeTab === 'config' && <ScraperConfigEditor />}
        {activeTab === 'queue' && <MatchReviewQueue />}
        {activeTab === 'matrix' && <PortalPriceMatrix />}
      </main>
    </div>
  );
};

export default AdminLayout;
