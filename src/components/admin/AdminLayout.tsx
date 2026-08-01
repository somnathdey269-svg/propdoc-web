import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Cpu, 
  Settings, 
  Database,
  Zap,
  ChevronLeft,
  Menu,
  Sun,
  Moon,
  LogOut,
  Mail,
  Key,
  Lock,
  Sparkles
} from 'lucide-react';
import SimpleScraperAssistant from './SimpleScraperAssistant';
import ScraperConfigEditor from './ScraperConfigEditor';
import MatchReviewQueue from './MatchReviewQueue';

const SUPERADMIN_EMAIL = 'somnathdey269@gmail.com';
const SUPERADMIN_PASS = 'Deevarsh@190521';

interface AdminLayoutProps {
  onClose?: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ onClose }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('urbanx_superadmin_auth') === 'true';
  });
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('urbanx_admin_theme') as 'dark' | 'light') || 'dark';
  });

  const [activeTab, setActiveTab] = useState<'hub' | 'records' | 'settings'>('hub');

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
      setAuthError('Invalid Superadmin credentials.');
    }
  };

  const confirmLogout = () => {
    localStorage.removeItem('urbanx_superadmin_auth');
    setIsAuthenticated(false);
    if (onClose) onClose();
  };

  const isDark = theme === 'dark';

  const navItems = [
    { id: 'hub', label: 'Data Acquisition Hub', icon: Zap, color: 'text-cyan-400' },
    { id: 'records', label: 'Extracted Data Vault', icon: Database, color: 'text-emerald-400' },
    { id: 'settings', label: 'Target Schema Settings', icon: Settings, color: 'text-purple-400' },
  ] as const;

  if (!isAuthenticated) {
    return (
      <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-colors duration-300 ${isDark ? 'bg-[#030712]' : 'bg-slate-100'}`}>
        <div className={`w-full max-w-md border rounded-3xl p-8 shadow-2xl relative overflow-hidden transition-colors ${isDark ? 'bg-slate-900/90 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-xl'}`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-tr from-indigo-600 via-cyan-500 to-emerald-400 rounded-2xl shadow-lg text-white">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight">Superadmin Login</h2>
              <p className="text-xs text-slate-400">Data Acquisition Engine</p>
            </div>
          </div>

          {authError && (
            <div className="mb-4 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 font-medium">
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-slate-400">Superadmin Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="somnathdey269@gmail.com"
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm font-medium focus:outline-none transition-all ${isDark ? 'bg-slate-950/60 border-slate-800 text-white placeholder-slate-600 focus:border-cyan-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-indigo-500'}`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-slate-400">Password</label>
              <div className="relative">
                <Key className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••••••"
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm font-medium focus:outline-none transition-all ${isDark ? 'bg-slate-950/60 border-slate-800 text-white focus:border-cyan-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-indigo-500'}`}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 mt-2 bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 rounded-xl text-white font-bold text-sm shadow-xl shadow-cyan-500/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" /> Authenticate Access
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 flex flex-col ${isDark ? 'bg-[#030712] text-slate-100' : 'bg-slate-100 text-slate-900'}`}>
      
      {/* TOP HEADER BAR */}
      <header className={`sticky top-0 z-40 border-b px-6 py-3.5 flex items-center justify-between transition-colors shadow-sm ${isDark ? 'bg-slate-950/90 backdrop-blur-xl border-slate-800/80 text-white' : 'bg-white/95 backdrop-blur-xl border-slate-200/80 text-slate-900'}`}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className={`p-2 rounded-xl border transition-all ${isDark ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'}`}
          >
            {isSidebarCollapsed ? <Menu className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-400 via-indigo-500 to-purple-500 flex items-center justify-center text-white font-black text-xs shadow-lg shadow-indigo-500/20">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold tracking-tight">Data Acquisition Hub</h1>
                <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full flex items-center gap-1 border ${isDark ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-emerald-50 border-emerald-300 text-emerald-700'}`}>
                  <Sparkles className="w-3 h-3" /> Ready
                </span>
              </div>
              <span className="text-[10px] text-slate-400 block font-mono">Zero-Code Web Data Platform</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 ${isDark ? 'bg-slate-900 border-slate-800 text-amber-300 hover:bg-slate-800' : 'bg-slate-100 border-slate-300 text-indigo-700 hover:bg-slate-200'}`}
          >
            {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-600" />}
            <span>{isDark ? 'Day Mode' : 'Night Mode'}</span>
          </button>

          <button
            onClick={confirmLogout}
            className="px-4 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-bold text-xs transition-all flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* BODY & SIDEBAR */}
      <div className="flex flex-1 overflow-hidden">
        <aside className={`border-r transition-all duration-300 shrink-0 ${isSidebarCollapsed ? 'w-16' : 'w-60'} ${isDark ? 'bg-slate-950/80 border-slate-800/80' : 'bg-white border-slate-200 shadow-sm'}`}>
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
                      ? isDark
                        ? 'bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 text-white shadow-xl shadow-cyan-500/20'
                        : 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                      : isDark
                        ? 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : item.color}`} />
                  {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </aside>

        <main className={`flex-1 p-6 overflow-y-auto ${isDark ? 'bg-[#030712]' : 'bg-slate-100'}`}>
          {activeTab === 'hub' && <SimpleScraperAssistant theme={theme} />}
          {activeTab === 'records' && <MatchReviewQueue theme={theme} />}
          {activeTab === 'settings' && <ScraperConfigEditor theme={theme} />}
        </main>
      </div>

    </div>
  );
};

export default AdminLayout;
