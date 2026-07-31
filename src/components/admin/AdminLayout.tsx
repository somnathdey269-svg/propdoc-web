import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Cpu, 
  Settings, 
  GitMerge, 
  Globe,
  BarChart3, 
  Lock, 
  Key, 
  Mail, 
  Sparkles,
  Zap,
  ChevronLeft,
  Menu,
  Clock,
  Sliders
} from 'lucide-react';
import SimpleScraperAssistant from './SimpleScraperAssistant';
import WebsiteSourcesManager from './WebsiteSourcesManager';
import ScraperConfigEditor from './ScraperConfigEditor';
import MatchReviewQueue from './MatchReviewQueue';
import PortalPriceMatrix from './PortalPriceMatrix';
import { ScraperControlPanel } from './ScraperControlPanel';
import { AdaptivePipelineManager } from './AdaptivePipelineManager';

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

  // Sidebar Collapse State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // Theme State: 'dark' vs 'light'
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('urbanx_admin_theme') as 'dark' | 'light') || 'dark';
  });

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<'assistant' | 'execution' | 'pipelines' | 'sources' | 'config' | 'queue' | 'matrix'>('assistant');

  useEffect(() => {
    localStorage.setItem('urbanx_admin_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

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

  const confirmLogout = () => {
    localStorage.removeItem('urbanx_superadmin_auth');
    setIsAuthenticated(false);
    if (onClose) onClose();
  };

  // Navigation Items Definition
  const navItems = [
    { id: 'assistant', label: 'Easy Scraper Assistant', icon: Zap, color: 'text-cyan-400' },
    { id: 'execution', label: 'Execution Center & Live SSE', icon: Clock, color: 'text-rose-400' },
    { id: 'pipelines', label: 'Adaptive Pipelines & Fallbacks', icon: Sliders, color: 'text-amber-400' },
    { id: 'sources', label: 'Manage Website Sources', icon: Globe, color: 'text-emerald-400' },
    { id: 'config', label: 'Selector Configs', icon: Settings, color: 'text-purple-400' },
    { id: 'queue', label: 'Review Matches', icon: GitMerge, color: 'text-blue-400' },
    { id: 'matrix', label: 'Price Comparison Matrix', icon: BarChart3, color: 'text-indigo-400' },
  ] as const;

  // Unauthenticated Login Screen
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl shadow-indigo-500/10 relative overflow-hidden">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-tr from-indigo-600 to-cyan-500 rounded-2xl shadow-lg shadow-indigo-500/30 text-white">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Superadmin Gateway</h2>
              <p className="text-xs text-slate-400">UrbanX Real Estate Intelligence Dashboard</p>
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
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500"
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
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500"
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
        </div>
      </div>
    );
  }

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 flex flex-col ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* TOP HEADER BAR */}
      <header className={`sticky top-0 z-40 border-b px-6 py-3.5 flex items-center justify-between transition-colors ${isDark ? 'bg-slate-900/80 backdrop-blur-xl border-slate-800/80 text-white' : 'bg-white/90 backdrop-blur-xl border-slate-200 text-slate-900 shadow-sm'}`}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className={`p-2 rounded-xl border transition-colors ${isDark ? 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'}`}
          >
            {isSidebarCollapsed ? <Menu className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-tr from-indigo-500 to-cyan-400 rounded-xl text-white shadow-md">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight">UrbanX Superadmin</h1>
                <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Live Engine Active
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={toggleTheme} className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs">
            {isDark ? '☀️ Day Mode' : '🌙 Night Mode'}
          </button>
          <button onClick={confirmLogout} className="px-4 py-2 rounded-xl bg-rose-500/20 text-rose-300 font-bold text-xs">
            Logout
          </button>
        </div>
      </header>

      {/* BODY & SIDEBAR */}
      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR */}
        <aside className={`border-r transition-all duration-300 ${isSidebarCollapsed ? 'w-16' : 'w-64'} ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
          <nav className="p-3 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-lg shadow-indigo-500/25'
                      : isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800/60' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.color}`} />
                  {!isSidebarCollapsed && <span>{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 p-6 overflow-y-auto">
          {activeTab === 'assistant' && <SimpleScraperAssistant />}
          {activeTab === 'execution' && <ScraperControlPanel />}
          {activeTab === 'pipelines' && <AdaptivePipelineManager />}
          {activeTab === 'sources' && <WebsiteSourcesManager />}
          {activeTab === 'config' && <ScraperConfigEditor />}
          {activeTab === 'queue' && <MatchReviewQueue />}
          {activeTab === 'matrix' && <PortalPriceMatrix />}
        </main>
      </div>
    </div>
  );
};
