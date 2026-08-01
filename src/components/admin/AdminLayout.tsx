import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Cpu, 
  LogOut,
  Mail,
  Key,
  Lock,
  Sparkles
} from 'lucide-react';
import SimpleScraperAssistant from './SimpleScraperAssistant';

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

  const [theme] = useState<'light'>('light');

  useEffect(() => {
    localStorage.setItem('urbanx_admin_theme', 'light');
  }, []);

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

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 via-slate-50 to-cyan-50 font-sans">
        <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-3xl p-8 shadow-2xl relative overflow-hidden text-slate-900">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-tr from-indigo-600 via-cyan-500 to-emerald-400 rounded-2xl shadow-lg text-white">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900">Superadmin Login</h2>
              <p className="text-xs text-indigo-600 font-bold">Data Acquisition Engine</p>
            </div>
          </div>

          {authError && (
            <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600 font-bold">
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-slate-700">Superadmin Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="somnathdey269@gmail.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-600 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-slate-700">Password</label>
              <div className="relative">
                <Key className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-indigo-600 focus:outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 mt-2 bg-gradient-to-r from-indigo-600 via-cyan-600 to-purple-600 rounded-xl text-white font-black text-sm shadow-xl shadow-indigo-500/25 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" /> Authenticate Access
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans bg-slate-50/80 text-slate-900 flex flex-col">
      
      {/* CLEAN MINIMAL TOP HEADER BAR */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl px-6 py-3.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-cyan-500 to-emerald-400 flex items-center justify-center text-white font-black text-xs shadow-md shadow-indigo-500/20">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black tracking-tight text-slate-900">Data Acquisition Hub</h1>
              <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-full flex items-center gap-1 border bg-indigo-50 border-indigo-200 text-indigo-700">
                <Sparkles className="w-3 h-3 text-indigo-600" /> Platform Active
              </span>
            </div>
            <span className="text-[10px] text-slate-500 block font-bold">Universal Web Data Platform</span>
          </div>
        </div>

        <button
          onClick={confirmLogout}
          className="px-4 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 font-extrabold text-xs transition-all flex items-center gap-1.5"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Logout</span>
        </button>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-6 overflow-y-auto bg-slate-50/80">
        <SimpleScraperAssistant theme={theme} />
      </main>

    </div>
  );
};

export default AdminLayout;
