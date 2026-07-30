import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, X, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';

interface BuilderClaimModalProps {
  onClose: () => void;
  onSuccessClaim: (projectName: string, reraReg: string) => void;
}

export const BuilderClaimModal: React.FC<BuilderClaimModalProps> = ({ onClose, onSuccessClaim }) => {
  const [projectName, setProjectName] = useState('GIFT Diamond Towers');
  const [reraRegNumber, setReraRegNumber] = useState('PR/GJ/GANDHINAGAR/GIFT CITY/AUDA/RAA07890/100121');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'details' | 'otp' | 'claimed'>('details');

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !reraRegNumber) return;
    setStep('otp');
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('claimed');
    onSuccessClaim(projectName, reraRegNumber);

    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.5 }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-2xl overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-white/15 p-6 md:p-8 shadow-2xl space-y-6 my-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white font-outfit">Claim Your Project</h2>
            <p className="text-xs text-slate-400">Verify GujRERA ownership & unlock your 3D microsite</p>
          </div>
        </div>

        {/* STEP 1: Details */}
        {step === 'details' && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="text-xs text-slate-300 block mb-1">Ahmedabad Project Name</label>
              <input
                type="text"
                required
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">GujRERA Registration Number</label>
              <input
                type="text"
                required
                value={reraRegNumber}
                onChange={(e) => setReraRegNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-xs font-mono text-amber-300 placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Authorized Contact Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikram Goyal"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Registered Phone (RERA OTP)</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98250 XXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>Send Statutory GujRERA OTP</span>
            </button>
          </form>
        )}

        {/* STEP 2: OTP Verification */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 text-center">
              Enter 6-digit OTP sent to authorized RERA phone ending in **{phone.slice(-4)}
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">Enter OTP Code</label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-center text-lg font-mono tracking-widest text-amber-300 focus:outline-none focus:border-amber-400"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 hover:scale-[1.02] transition-all"
            >
              Verify & Complete Claim
            </button>
          </form>
        )}

        {/* STEP 3: Success Claimed */}
        {step === 'claimed' && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Project Successfully Claimed!</h3>
              <p className="text-xs text-slate-300 mt-1">
                Your official 3D project microsite is now active at <strong className="text-cyan-400">gift-diamond.urbanx.in</strong>
              </p>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs shadow-lg hover:bg-cyan-400 transition-all"
            >
              Open Builder Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
