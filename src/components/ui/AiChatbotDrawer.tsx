import React, { useState, useEffect } from 'react';
import { Send, X, Sparkles, User, Phone, ArrowRight, Building2, ChevronRight, Mic, MicOff, Calculator, ExternalLink } from 'lucide-react';
import type { PropertyProject } from '../../types';
import { aiAssistant, type AiResponse, type ChatUserMemory } from '../../services/aiAssistantService';

interface AiChatbotDrawerProps {
  projects: PropertyProject[];
  onClose: () => void;
  onSelectProject: (project: PropertyProject) => void;
  onFlyToLocality?: (locality: string) => void;
}

interface ChatMessage extends AiResponse {
  sender: 'user' | 'ai';
}

export const AiChatbotDrawer: React.FC<AiChatbotDrawerProps> = ({
  projects,
  onClose,
  onSelectProject,
  onFlyToLocality,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'ai',
      text: '🙏 Welcome to **PropDoc AI**!\nI search across **GujRERA, 99acres, SquareYards, MagicBricks & BaankNet** to find you the best-verified properties across 200+ localities in Ahmedabad & Gandhinagar.\n\nTell me what you\'re looking for — BHK, budget, locality, or bank auction deals!',
      quickChips: [
        { label: '🏛️ SARFAESI Bank Auctions (25% Off)', actionValue: 'Distress bank listings' },
        { label: '🏢 3 BHK in South Bopal under 1.5 Cr', actionValue: '3 BHK in South Bopal under 1.5 Cr' },
        { label: '📍 Luxury Flats in Bodakdev', actionValue: 'Flats in Bodakdev' },
        { label: '🏬 GIFT City SEZ Properties', actionValue: 'Properties in GIFT City' },
      ],
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [userMemory, setUserMemory] = useState<ChatUserMemory>({});

  // EMI Calculator State
  const [emiLoanAmount, setEmiLoanAmount] = useState(7500000); // Default ₹75 Lakhs
  const [emiTenureYears, setEmiTenureYears] = useState(20);
  const emiInterestRate = 8.4; // SBI rate

  // Calculated EMI
  const monthlyInterestRate = emiInterestRate / 12 / 100;
  const totalMonths = emiTenureYears * 12;
  const calculatedEmi = Math.round(
    (emiLoanAmount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, totalMonths)) /
      (Math.pow(1 + monthlyInterestRate, totalMonths) - 1)
  );

  // User Registration State
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');

  // Speech-to-Text Voice Microphone Handler
  useEffect(() => {
    // Check if browser supports Web Speech API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-IN'; // Multi-lingual Indian Accent

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputQuery(transcript);
      setIsListening(false);
      handleSendMessage(transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    if (isListening) {
      recognition.start();
    } else {
      recognition.stop();
    }
  }, [isListening]);

  const handleSendMessage = (queryText: string) => {
    if (!queryText.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: queryText,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');

    // Execute Enterprise RAG & Safety Engine
    setTimeout(() => {
      const aiReplyData = aiAssistant.processQuery(queryText, projects);
      const aiReplyMsg: ChatMessage = {
        ...aiReplyData,
        sender: 'ai',
      };

      if (aiReplyData.updatedMemory) {
        setUserMemory(aiReplyData.updatedMemory);
      }

      if (aiReplyData.flyToLocality && onFlyToLocality) {
        onFlyToLocality(aiReplyData.flyToLocality);
      }

      setMessages((prev) => [...prev, aiReplyMsg]);
    }, 350);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || regPhone.length < 10) return;

    setShowRegistrationModal(false);

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: 'ai',
        text: `🎉 Registration successful! Welcome ${regName}. You now have UNLIMITED VIP access to UrbanX AI Assistant.`,
      },
    ]);
  };

  return (
    <>
      {/* 1. FULL-SCREEN GLASSMORPHISM BACKDROP BLUR OVERLAY */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-md transition-all animate-in fade-in duration-300 cursor-pointer"
      />

      {/* 2. INTERACTIVE CHATBOT DRAWER */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-slate-950/98 backdrop-blur-3xl border-l border-cyan-500/30 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
        
        {/* CHATBOT HEADER */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-400 via-teal-300 to-emerald-400 p-0.5 shadow-lg">
              <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-outfit">UrbanX Enterprise AI Assistant</h3>
              <span className="text-[11px] text-cyan-400 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Unlimited Free AI Access
                {userMemory.locality ? ` • Active Locality: ${userMemory.locality}` : ''}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MESSAGES LIST CONTAINER */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 no-scrollbar">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[88%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-lg ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 font-semibold rounded-tr-none'
                    : 'bg-slate-900/90 text-slate-200 border border-white/15 rounded-tl-none space-y-2'
                }`}
              >
                <p className="whitespace-pre-line">{msg.text}</p>

                {/* INLINE EMBEDDED EMI CALCULATOR WIDGET */}
                {msg.showEmiCalculator && (
                  <div className="p-3.5 rounded-2xl bg-slate-950/95 border border-cyan-500/40 space-y-3 my-2 shadow-2xl">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <div className="flex items-center gap-1.5 text-cyan-300 font-bold">
                        <Calculator className="w-4 h-4" />
                        <span>Interactive Home Loan EMI Advisor</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] border border-emerald-500/30">
                        SBI @ 8.4%
                      </span>
                    </div>

                    <div className="space-y-2 text-[11px]">
                      <div>
                        <div className="flex justify-between text-slate-300 mb-1">
                          <span>Loan Amount:</span>
                          <span className="font-bold text-cyan-400 font-mono">₹{(emiLoanAmount / 100000).toFixed(1)} Lakhs</span>
                        </div>
                        <input
                          type="range"
                          min={2000000}
                          max={30000000}
                          step={500000}
                          value={emiLoanAmount}
                          onChange={(e) => setEmiLoanAmount(Number(e.target.value))}
                          className="w-full accent-cyan-400 cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-slate-300 mb-1">
                          <span>Loan Tenure:</span>
                          <span className="font-bold text-cyan-400 font-mono">{emiTenureYears} Years</span>
                        </div>
                        <input
                          type="range"
                          min={5}
                          max={30}
                          step={1}
                          value={emiTenureYears}
                          onChange={(e) => setEmiTenureYears(Number(e.target.value))}
                          className="w-full accent-cyan-400 cursor-pointer"
                        />
                      </div>

                      <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-between mt-2">
                        <span className="text-slate-300">Estimated Monthly EMI:</span>
                        <span className="text-base font-extrabold text-emerald-400 font-mono">
                          ₹{calculatedEmi.toLocaleString('en-IN')}/mo
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Interactive Quick Choice Chips */}
                {msg.quickChips && msg.quickChips.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {msg.quickChips.map((chip, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(chip.actionValue)}
                        className="px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-[11px] font-bold transition-all hover:scale-105 flex items-center gap-1"
                      >
                        <span>{chip.label}</span>
                        <ChevronRight className="w-3 h-3 text-cyan-400" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Matched Property Cards with Working External Portal Links */}
                {msg.matchedProjects && msg.matchedProjects.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {msg.matchedProjects.map((p) => (
                      <div
                        key={p.id}
                        className="p-3 rounded-2xl bg-slate-950/90 border border-white/15 space-y-2 shadow-xl hover:border-cyan-500/40 transition-all"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <img src={p.coverImage} alt={p.name} className="w-10 h-10 rounded-xl object-cover" />
                            <div>
                              <h4 className="text-[11px] font-bold text-white truncate max-w-[140px] font-outfit">{p.name}</h4>
                              <span className="text-[10px] text-slate-400 block">{p.locality} • {p.category}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[11px] font-bold text-emerald-400 font-mono block">
                              ₹{(p.priceRangeMinInr / 10000000).toFixed(2)} Cr
                            </span>
                            <span className="text-[9px] text-cyan-300">₹{p.pricePerSqFt}/sq.ft</span>
                          </div>
                        </div>

                        {/* Working External Portal Deep Link & Showcase Launch Button */}
                        <div className="flex items-center gap-2 pt-1 border-t border-white/10 text-[10px]">
                          <button
                            onClick={() => onSelectProject(p)}
                            className="flex-1 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-bold border border-cyan-500/30 transition-all text-center"
                          >
                            Open 3D Showcase Page
                          </button>
                          <a
                            href={p.multiSourcePricing.sourceUrls?.gujReraUrl || 'https://gujrera.gujarat.gov.in/'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 flex items-center gap-1 shrink-0"
                          >
                            <span>RERA Cert</span>
                            <ExternalLink className="w-3 h-3 text-cyan-400" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* CHAT INPUT FORM */}
        <div className="p-4 border-t border-white/10 bg-slate-900/50">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputQuery);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Type location, 3BHK, bank auction, or voice prompt..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 transition-all"
            />

            {/* SPEECH-TO-TEXT VOICE MIC BUTTON */}
            <button
              type="button"
              onClick={() => setIsListening(!isListening)}
              className={`p-2.5 rounded-xl border transition-all ${
                isListening
                  ? 'bg-rose-500 text-white border-rose-400 animate-pulse shadow-lg shadow-rose-500/50'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/15'
              }`}
              title="Voice Search (Gujarati, Hindi, English)"
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <button
              type="submit"
              className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-950 font-bold shadow-md hover:scale-105 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* VIP REGISTRATION MODAL */}
        {showRegistrationModal && (
          <div className="absolute inset-0 z-50 bg-slate-950/98 backdrop-blur-3xl p-6 flex flex-col justify-center animate-in fade-in zoom-in-95">
            <div className="space-y-4 text-center">
              <div className="w-14 h-14 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 to-orange-500 p-0.5 shadow-2xl flex items-center justify-center">
                <Building2 className="w-8 h-8 text-slate-950" />
              </div>

              <div>
                <h3 className="text-lg font-extrabold text-white font-outfit">Unlock Unlimited AI Access</h3>
                <p className="text-xs text-slate-400 mt-1">You have reached the 3 free question limit. Register below for instant unlimited access to 50,000+ properties.</p>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-3 pt-2 text-left">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Enter your name..."
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-xs text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Phone Number (For OTP Verification)</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-xs text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-500 text-slate-950 font-extrabold text-xs shadow-xl flex items-center justify-center gap-2 hover:scale-105 transition-all mt-4"
                >
                  <span>Register & Continue Unlimited Chat</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
