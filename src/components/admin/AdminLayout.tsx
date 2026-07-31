import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Cpu, 
  Settings, 
  GitMerge, 
  Globe,
  BarChart3, 
  LogOut, 
  Lock, 
  Key, 
  Mail, 
  Sparkles,
  Zap,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
  Menu
} from 'lucide-react';
import SimpleScraperAssistant from './SimpleScraperAssistant';
import WebsiteSourcesManager from './WebsiteSourcesManager';
import ScraperConfigEditor from './ScraperConfigEditor';
import MatchReviewQueue from './MatchReviewQueue';
import PortalPriceMatrix from './PortalPriceMatrix';

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

  // Logout Confirmation Modal
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<'assistant' | 'sources' | 'config' | 'queue' | 'matrix'>('assistant');

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
    setShowLogoutModal(false);
    if (onClose) onClose();
  };

  // Navigation Items Definition
  const navItems = [
    { id: 'assistant', label: 'Easy Scraper Assistant', icon: Zap, color: 'text-cyan-400' },
    { id: 'sources', label: 'Manage Website Sources', icon: Globe, color: 'text-amber-400' },
    { id: 'config', label: 'Selector Configs', icon: Settings, color: 'text-purple-400' },
    { id: 'queue', label: 'Review Matches', icon: GitMerge, color: 'text-emerald-400' },
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

  // Theme Styling Rules
  const isDark = theme === 'dark';

  return (
    <div
      className={`min-h-screen font-sans transition-colors duration-300 flex flex-col ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* TOP HEADER BAR */}
      <header
        className={`sticky top-0 z-40 border-b px-6 py-3.5 flex items-center justify-between transition-colors ${
          isDark
            ? 'bg-slate-900/80 backdrop-blur-xl border-slate-800/80 text-white'
            : 'bg-white/90 backdrop-blur-xl border-slate-200 text-slate-900 shadow-sm'
        }`}
      >
        {/* Left Brand + Sidebar Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            className={`p-2 rounded-xl border transition-colors ${
              isDark
                ? 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
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

        {/* Right Actions (Day/Night Theme Toggle + User + Logout/Exit) */}
        <div className="flex items-center gap-3">
          {/* Day / Night Theme Switcher */}
          <button
            onClick={toggleTheme}
            className={`p-2.5 rounded-xl border transition-all flex items-center gap-2 text-xs font-bold ${
              isDark
                ? 'bg-slate-950 border-slate-800 text-amber-400 hover:bg-slate-900'
                : 'bg-slate-100 border-slate-200 text-indigo-600 hover:bg-slate-200'
            }`}
            title={`Switch to ${isDark ? 'Day (Light)' : 'Night (Dark)'} Mode`}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            <span className="hidden sm:inline">{isDark ? 'Day Mode' : 'Night Mode'}</span>
          </button>

          {/* User Email Badge */}
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold">{SUPERADMIN_EMAIL}</p>
            <span className="text-[10px] text-indigo-500 font-medium">Superadmin Privilege</span>
          </div>

          {/* Logout Button */}
          <button
            onClick={() => setShowLogoutModal(true)}
            title="Logout"
            className={`p-2.5 rounded-xl border transition-colors flex items-center gap-2 text-xs font-bold ${
              isDark
                ? 'bg-slate-950 border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/30'
                : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-300'
            }`}
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* BODY WITH LEFT SIDEBAR + MAIN CONTENT */}
      <div className="flex-1 flex overflow-hidden">
        {/* COLLAPSIBLE LEFT-HAND SIDEBAR */}
        <aside
          className={`transition-all duration-300 border-r flex flex-col justify-between p-3 z-30 ${
            isSidebarCollapsed ? 'w-16' : 'w-64'
          } ${
            isDark
              ? 'bg-slate-900/60 border-slate-800/80 backdrop-blur-xl'
              : 'bg-white border-slate-200 text-slate-800 shadow-sm'
          }`}
        >
          {/* Navigation Items */}
          <div className="space-y-1.5">
            {!isSidebarCollapsed && (
              <p className="px-3 pt-2 pb-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Scraper Navigation
              </p>
            )}

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  title={isSidebarCollapsed ? item.label : undefined}
                  className={`w-full p-3 rounded-2xl text-xs font-bold flex items-center gap-3 transition-all ${
                    isActive
                      ? isDark
                        ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-lg shadow-indigo-500/20'
                        : 'bg-indigo-600 text-white shadow-md'
                      : isDark
                      ? 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : item.color}`} />
                  {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </div>

          {/* Sidebar Collapse Footer Toggle */}
          <div className="pt-3 border-t border-slate-800/40">
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className={`w-full p-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition-colors ${
                isDark
                  ? 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              {isSidebarCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <>
                  <ChevronLeft className="w-4 h-4" />
                  <span>Collapse Menu</span>
                </>
              )}
            </button>
          </div>
        </aside>

        {/* MAIN WORKSPACE CONTENT */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'assistant' && <SimpleScraperAssistant isDark={isDark} />}
            {activeTab === 'sources' && <WebsiteSourcesManager isDark={isDark} />}
            {activeTab === 'config' && <ScraperConfigEditor />}
            {activeTab === 'queue' && <MatchReviewQueue />}
            {activeTab === 'matrix' && <PortalPriceMatrix />}
          </div>
        </main>
      </div>

      {/* LOGOUT CONFIRMATION POPUP MODAL */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xl p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 bg-rose-500/20 text-rose-400 rounded-2xl flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">Log Out Superadmin?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Are you sure you want to end your Superadmin session? You will need to re-authenticate with your password.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="w-1/2 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="w-1/2 py-2.5 bg-rose-600 hover:bg-rose-700 rounded-xl text-xs font-bold text-white shadow-lg shadow-rose-600/30 transition-all"
              >
                Confirm Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLayout;
