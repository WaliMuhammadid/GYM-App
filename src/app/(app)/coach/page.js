'use client';
import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import FormattedMessage from '@/components/FormattedMessage';

export default function CoachChat() {
  const router = useRouter();
  const { data: session } = useSession();
  const [messages, setMessages] = useState([
    { role: 'ai', content: "Hey! I'm FitAI Coach. How's the body feeling today? Ready to crush it?", timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // AI Workout Plan Builder State
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [planLoading, setPlanLoading] = useState(false);
  const [activePlan, setActivePlan] = useState(null);
  const [planForm, setPlanForm] = useState({
    weight: '75 kg',
    height: '5 ft 9 in',
    age: '24',
    goal: 'Muscle Gain & Hypertrophy',
    experienceLevel: 'Complete Beginner (Pehli Baar)',
    lastTrained: 'Never (Pehle kabhi nahi gaya)',
    injuries: 'None',
    daysPerWeek: 4,
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchHistory = async () => {
    if (!session?.user?.id) return;
    try {
      const res = await fetch(`/api/coach/chat?userId=${session.user.id}`);
      const data = await res.json();
      if (data.messages && data.messages.length > 0) {
        setMessages(data.messages);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchActivePlan = async () => {
    if (!session?.user?.id) return;
    try {
      const res = await fetch(`/api/coach/plan?userId=${session.user.id}`);
      const data = await res.json();
      if (data.plan) {
        setActivePlan(data.plan);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchHistory();
    fetchActivePlan();
  }, [session]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || !session?.user?.id) return;

    const query = input.trim();
    const userMessage = { role: 'user', content: query, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // If user explicitly asks for schedule/plan, suggest opening wizard
    if (/schedule|workout plan|mera plan|plan banao|routine|kitna weight/i.test(query)) {
      setShowWizard(true);
      setWizardStep(1);
    }

    setLoading(true);

    try {
      const res = await fetch('/api/coach/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: session.user.id, message: userMessage.content }),
      });
      const data = await res.json();
      
      setMessages(prev => [...prev, { role: 'ai', content: data.response, timestamp: new Date() }]);
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: 'ai', content: "Network error. Connect to the Beast network and try again.", timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = async () => {
    if (!session?.user?.id) return;
    if (!window.confirm("Kiya aap chat history clear karna chahte hain?")) return;
    try {
      await fetch(`/api/coach/chat?userId=${session.user.id}`, { method: 'DELETE' });
      setMessages([
        { role: 'ai', content: "Chat history cleared! Main aapka FitAI Coach hoon. Aaj kis cheez par focus karna hai?", timestamp: new Date() }
      ]);
    } catch (e) {
      console.error(e);
    }
  };

  const handleGeneratePlan = async () => {
    if (!session?.user?.id) return;
    setPlanLoading(true);

    try {
      const res = await fetch('/api/coach/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.user.id,
          weight: planForm.weight,
          height: planForm.height,
          age: planForm.age,
          goal: planForm.goal,
          experienceLevel: planForm.experienceLevel,
          lastTrained: planForm.lastTrained,
          injuries: planForm.injuries,
          daysPerWeek: planForm.daysPerWeek,
        }),
      });

      const data = await res.json();
      if (data.success && data.plan) {
        setActivePlan(data.plan);
        setWizardStep(5); // Success step
        fetchHistory(); // Reload chat history so new plan message shows up
      } else {
        alert("Error generating plan: " + (data.error || 'Server issue'));
      }
    } catch (err) {
      console.error(err);
      alert("Failed to connect to AI engine. Please check internet connection.");
    } finally {
      setPlanLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen pt-safe bg-[#050505]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#27272A] glassmorphism sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center text-white hover:text-[#D0FF00] transition-colors rounded-full hover:bg-[#121215]">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-[#121215] border border-[#27272A] flex items-center justify-center">
                <span className="material-symbols-outlined text-[#D0FF00] text-xl">smart_toy</span>
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#D0FF00] rounded-full border-2 border-[#050505]"></div>
            </div>
            <div>
              <h1 className="font-montserrat text-base font-bold text-[#D0FF00] italic leading-tight uppercase">FITAI COACH</h1>
              <p className="font-mono text-[9px] text-[#A1A1AA] uppercase tracking-wider">Elite Strength Engine • Online</p>
            </div>
          </div>
        </div>
        <button 
          onClick={handleClearChat}
          title="Clear Chat History"
          className="w-10 h-10 flex items-center justify-center text-[#71717A] hover:text-[#FF2E54] transition-colors rounded-full hover:bg-[#121215]"
        >
          <span className="material-symbols-outlined text-xl">delete_sweep</span>
        </button>
      </div>

      {/* AI Schedule Generator Banner */}
      <div className="px-4 py-2.5 bg-[#121215] border-b border-[#27272A] flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <span className="material-symbols-outlined text-[#D0FF00] text-lg shrink-0">fitness_center</span>
          <div className="truncate">
            <p className="font-montserrat text-xs font-bold text-white uppercase tracking-wider truncate">
              {activePlan ? activePlan.splitName : 'Personalized Workout Split'}
            </p>
            <p className="font-mono text-[9px] text-[#71717A] truncate">
              {activePlan ? `${activePlan.days?.length} Days • Synced with Dashboard` : 'Weights & sets calibrated by AI'}
            </p>
          </div>
        </div>
        <button 
          onClick={() => { setShowWizard(true); setWizardStep(1); }}
          className="shrink-0 ml-3 bg-[#D0FF00] hover:bg-[#b8d300] text-[#050505] font-montserrat text-[11px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-[0_0_15px_rgba(208,255,0,0.2)] transition-all active:scale-95"
        >
          <span>{activePlan ? 'Rebuild' : 'Build Plan'}</span>
          <span className="material-symbols-outlined text-sm font-bold">bolt</span>
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-44">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[92%] rounded-2xl p-4 ${msg.role === 'user' ? 'bg-[#27272A] rounded-tr-sm' : 'bg-[#121215] border border-[#27272A] rounded-tl-sm border-l-4 border-l-[#D0FF00] shadow-[0_0_20px_rgba(0,0,0,0.6)]'}`}>
              <FormattedMessage content={msg.content} isAi={msg.role === 'ai'} />
              <div className={`mt-3 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <span className="font-mono text-[10px] text-[#71717A]">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-[#121215] border border-[#27272A] rounded-2xl p-4 rounded-tl-sm border-l-4 border-l-[#D0FF00]">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-[#D0FF00] rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-[#D0FF00] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-[#D0FF00] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="fixed bottom-[80px] left-1/2 -translate-x-1/2 w-full max-w-md p-4 bg-gradient-to-t from-[#050505] via-[#050505] to-transparent z-40">
        {/* Suggestion Chips */}
        <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
          <button 
            onClick={() => { setShowWizard(true); setWizardStep(1); }} 
            className="shrink-0 bg-[#D0FF00]/10 border border-[#D0FF00]/30 rounded-full px-4 py-2 flex items-center gap-2"
          >
            <span className="text-[#D0FF00] text-sm">⚡</span>
            <span className="font-inter text-xs text-[#D0FF00] font-semibold">Make My Workout Schedule</span>
          </button>
          <button onClick={() => setInput('High-Protein Shake Recipe')} className="shrink-0 bg-[#121215] border border-[#27272A] rounded-full px-4 py-2 flex items-center gap-2">
            <span className="text-[#3B82F6] text-sm">🥦</span>
            <span className="font-inter text-xs text-[#A1A1AA]">High-Protein Shake</span>
          </button>
          <button onClick={() => setInput('Fix my squat form')} className="shrink-0 bg-[#121215] border border-[#27272A] rounded-full px-4 py-2 flex items-center gap-2">
            <span className="text-[#FF2E54] text-sm">🏋️</span>
            <span className="font-inter text-xs text-[#A1A1AA]">Fix Squat Form</span>
          </button>
        </div>

        <form onSubmit={handleSend} className="relative flex items-center bg-[#121215] border border-[#27272A] rounded-[30px] p-1.5 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
          <button type="button" className="w-12 h-12 flex items-center justify-center shrink-0 text-[#71717A]">
            <span className="material-symbols-outlined">mic</span>
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask FitAI Coach or 'make my schedule'..."
            className="flex-1 bg-transparent border-none outline-none text-white font-inter placeholder:text-[#52525B] px-2"
          />
          <button type="submit" disabled={!input.trim() || loading} className="w-12 h-12 rounded-full bg-[#D0FF00] text-[#050505] flex items-center justify-center shrink-0 disabled:opacity-50">
            <span className="material-symbols-outlined font-bold">arrow_upward</span>
          </button>
        </form>
      </div>

      {/* AI Schedule Onboarding Wizard Modal */}
      {showWizard && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#121215] border border-[#27272A] w-full max-w-md rounded-3xl p-6 relative overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#D0FF00]/10 rounded-full blur-3xl pointer-events-none"></div>

            {/* Header */}
            <div className="flex items-center justify-between mb-4 border-b border-[#27272A] pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#D0FF00]">tune</span>
                <h3 className="font-montserrat font-bold text-white text-base uppercase tracking-wider">
                  AI Schedule & Weight Calibrator
                </h3>
              </div>
              <button 
                onClick={() => setShowWizard(false)}
                className="w-8 h-8 rounded-full bg-[#18181B] text-[#71717A] hover:text-white flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Step Progress Pills (4 Steps) */}
            <div className="flex items-center gap-2 mb-6">
              {[1, 2, 3, 4].map((s) => (
                <div 
                  key={s} 
                  className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
                    wizardStep >= s ? 'bg-[#D0FF00]' : 'bg-[#27272A]'
                  }`}
                />
              ))}
            </div>

            {/* STEP 1: Biometrics & Goal */}
            {wizardStep === 1 && (
              <div className="space-y-4">
                <div>
                  <span className="font-mono text-[10px] text-[#D0FF00] uppercase tracking-widest block mb-1">Step 1 of 4</span>
                  <h4 className="font-montserrat text-lg font-extrabold text-white">Body Stats & Fitness Goal</h4>
                  <p className="font-inter text-xs text-[#A1A1AA]">AI will calculate starting volume and calorie thresholds.</p>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="font-mono text-[9px] text-[#71717A] uppercase block mb-1">Weight</label>
                    <input 
                      type="text"
                      value={planForm.weight}
                      onChange={(e) => setPlanForm({ ...planForm, weight: e.target.value })}
                      placeholder="e.g. 75 kg"
                      className="w-full bg-[#18181B] border border-[#27272A] rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-[#D0FF00]"
                    />
                  </div>
                  <div>
                    <label className="font-mono text-[9px] text-[#71717A] uppercase block mb-1">Height</label>
                    <input 
                      type="text"
                      value={planForm.height}
                      onChange={(e) => setPlanForm({ ...planForm, height: e.target.value })}
                      placeholder="e.g. 5 ft 10 in"
                      className="w-full bg-[#18181B] border border-[#27272A] rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-[#D0FF00]"
                    />
                  </div>
                  <div>
                    <label className="font-mono text-[9px] text-[#71717A] uppercase block mb-1">Age</label>
                    <input 
                      type="text"
                      value={planForm.age}
                      onChange={(e) => setPlanForm({ ...planForm, age: e.target.value })}
                      placeholder="e.g. 24"
                      className="w-full bg-[#18181B] border border-[#27272A] rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-[#D0FF00]"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-mono text-[9px] text-[#71717A] uppercase block mb-1.5">Primary Fitness Goal</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      'Muscle Building & Hypertrophy',
                      'Fat Loss & Lean Definition',
                      'Explosive Power & Strength',
                      'Combat / MMA Athleticism'
                    ].map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setPlanForm({ ...planForm, goal: g })}
                        className={`text-left p-2.5 rounded-xl border text-xs font-inter transition-all ${
                          planForm.goal === g 
                            ? 'bg-[#D0FF00]/10 border-[#D0FF00] text-white font-bold' 
                            : 'bg-[#18181B] border-[#27272A] text-[#A1A1AA] hover:border-[#3F3F46]'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setWizardStep(2)}
                    className="w-full bg-[#D0FF00] text-[#050505] font-montserrat font-extrabold text-xs uppercase tracking-wider py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-[#b8d300] transition-colors"
                  >
                    <span>Next: Gym Background & Experience</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Gym Background & Last Training History (NEW) */}
            {wizardStep === 2 && (
              <div className="space-y-4">
                <div>
                  <span className="font-mono text-[10px] text-[#D0FF00] uppercase tracking-widest block mb-1">Step 2 of 4 (Crucial)</span>
                  <h4 className="font-montserrat text-lg font-extrabold text-white">Gym Background & Experience</h4>
                  <p className="font-inter text-xs text-[#A1A1AA]">
                    Pehle gym gaye ho? Is se AI ko pata chalega kitna starting weight aur sets prescribe karne hain!
                  </p>
                </div>

                {/* Question A: Experience level */}
                <div>
                  <label className="font-mono text-[9px] text-[#71717A] uppercase block mb-1.5">
                    Aapka Training Level:
                  </label>
                  <div className="space-y-2">
                    {[
                      {
                        title: '🐣 Complete Beginner (Pehli Baar)',
                        desc: 'Pehle kabhi gym nahi gaye. Safe light weights & form motor learning chahiye.',
                        value: 'Complete Beginner (Pehli Baar)',
                      },
                      {
                        title: '🔄 Returning Lifter (Break ke baad)',
                        desc: 'Pehle gym kiya tha lekin kafi time se chhor diya hai. Muscle memory re-activation.',
                        value: 'Returning Lifter (Break ke baad)',
                      },
                      {
                        title: '💪 Intermediate (Regular Gym Goer)',
                        desc: 'Consistent 6-12 months se gym ja rahe hain. Progressive overload weights chahiye.',
                        value: 'Intermediate (Regular Gym Goer)',
                      },
                      {
                        title: '🏆 Advanced Athlete (2+ Years)',
                        desc: 'Heavy compound lifts aur specialized intensity schemes ki aadat hai.',
                        value: 'Advanced Athlete (2+ Years)',
                      },
                    ].map((lvl) => (
                      <button
                        key={lvl.value}
                        type="button"
                        onClick={() => setPlanForm({ ...planForm, experienceLevel: lvl.value })}
                        className={`w-full p-3 rounded-2xl border text-left transition-all ${
                          planForm.experienceLevel === lvl.value
                            ? 'bg-[#D0FF00]/10 border-[#D0FF00] shadow-[0_0_15px_rgba(208,255,0,0.15)]'
                            : 'bg-[#18181B] border-[#27272A] hover:border-[#3F3F46]'
                        }`}
                      >
                        <span className={`font-montserrat text-xs font-bold block mb-0.5 ${
                          planForm.experienceLevel === lvl.value ? 'text-[#D0FF00]' : 'text-white'
                        }`}>
                          {lvl.title}
                        </span>
                        <span className="font-inter text-[11px] text-[#71717A] leading-relaxed block">
                          {lvl.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question B: Last trained */}
                <div>
                  <label className="font-mono text-[9px] text-[#71717A] uppercase block mb-1.5">
                    Aakhri dafa gym kab gaye thay?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      'Never (Pehle kabhi nahi gaya)',
                      'Recent (1-2 haftay pehle)',
                      '1-3 Mahine pehle',
                      '6-12 Mahine pehle',
                      '1+ Saal se nahi gaya',
                    ].map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setPlanForm({ ...planForm, lastTrained: time })}
                        className={`text-left p-2.5 rounded-xl border text-xs font-inter transition-all ${
                          planForm.lastTrained === time 
                            ? 'bg-[#D0FF00]/10 border-[#D0FF00] text-white font-bold' 
                            : 'bg-[#18181B] border-[#27272A] text-[#A1A1AA] hover:border-[#3F3F46]'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setWizardStep(1)}
                    className="w-1/3 bg-[#18181B] text-white font-montserrat font-bold text-xs uppercase py-3.5 rounded-xl"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setWizardStep(3)}
                    className="flex-1 bg-[#D0FF00] text-[#050505] font-montserrat font-extrabold text-xs uppercase tracking-wider py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-[#b8d300] transition-colors"
                  >
                    <span>Next: Injuries & Limits</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Past Injuries & Medical Issues */}
            {wizardStep === 3 && (
              <div className="space-y-4">
                <div>
                  <span className="font-mono text-[10px] text-[#FF2E54] uppercase tracking-widest block mb-1">Step 3 of 4 (Important)</span>
                  <h4 className="font-montserrat text-lg font-extrabold text-white">Injuries & Medical Limits</h4>
                  <p className="font-inter text-xs text-[#A1A1AA]">AI dangerous exercises ko drop karke safe alternative exercises aur weights dega.</p>
                </div>

                <div className="space-y-2">
                  <label className="font-mono text-[9px] text-[#71717A] uppercase block">Select Any That Apply:</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      'None - 100% Fit & Healthy',
                      'Lower Back Pain / Disc',
                      'Knee Pain / Discomfort',
                      'Shoulder Impingement',
                      'Neck / Cervical Strain',
                      'Asthma / Cardiorespiratory'
                    ].map((inj) => (
                      <button
                        key={inj}
                        type="button"
                        onClick={() => setPlanForm({ ...planForm, injuries: inj })}
                        className={`text-left p-2.5 rounded-xl border text-xs font-inter transition-all ${
                          planForm.injuries === inj 
                            ? 'bg-[#FF2E54]/10 border-[#FF2E54] text-white font-bold' 
                            : 'bg-[#18181B] border-[#27272A] text-[#A1A1AA] hover:border-[#3F3F46]'
                        }`}
                      >
                        {inj}
                      </button>
                    ))}
                  </div>

                  <div className="mt-3">
                    <label className="font-mono text-[9px] text-[#71717A] uppercase block mb-1">Or write specific details:</label>
                    <input 
                      type="text"
                      value={planForm.injuries}
                      onChange={(e) => setPlanForm({ ...planForm, injuries: e.target.value })}
                      placeholder="e.g. Left wrist sprain, avoid heavy barbell cleans"
                      className="w-full bg-[#18181B] border border-[#27272A] rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-[#FF2E54]"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setWizardStep(2)}
                    className="w-1/3 bg-[#18181B] text-white font-montserrat font-bold text-xs uppercase py-3.5 rounded-xl"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setWizardStep(4)}
                    className="flex-1 bg-[#D0FF00] text-[#050505] font-montserrat font-extrabold text-xs uppercase tracking-wider py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-[#b8d300] transition-colors"
                  >
                    <span>Next: Gym Availability</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Weekly Gym Availability & Final Submission */}
            {wizardStep === 4 && (
              <div className="space-y-4">
                <div>
                  <span className="font-mono text-[10px] text-[#3B82F6] uppercase tracking-widest block mb-1">Step 4 of 4</span>
                  <h4 className="font-montserrat text-lg font-extrabold text-white">Weekly Gym Availability</h4>
                  <p className="font-inter text-xs text-[#A1A1AA]">Hafte (week) mein kitne din gym training kar sakte hain?</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { days: 3, label: '3 Days / Week', desc: 'Full Body or Push-Pull-Legs' },
                    { days: 4, label: '4 Days / Week', desc: 'Upper / Lower Split (Optimal)' },
                    { days: 5, label: '5 Days / Week', desc: 'Push-Pull-Legs + Upper/Lower' },
                    { days: 6, label: '6 Days / Week', desc: 'High Frequency PPL 2x' },
                  ].map((item) => (
                    <button
                      key={item.days}
                      type="button"
                      onClick={() => setPlanForm({ ...planForm, daysPerWeek: item.days })}
                      className={`p-3.5 rounded-2xl border text-left transition-all ${
                        planForm.daysPerWeek === item.days
                          ? 'bg-[#3B82F6]/10 border-[#3B82F6] shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                          : 'bg-[#18181B] border-[#27272A] hover:border-[#3F3F46]'
                      }`}
                    >
                      <span className={`font-montserrat text-sm font-extrabold block mb-0.5 ${
                        planForm.daysPerWeek === item.days ? 'text-[#3B82F6]' : 'text-white'
                      }`}>
                        {item.label}
                      </span>
                      <span className="font-inter text-[11px] text-[#71717A] leading-snug block">
                        {item.desc}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Summary Box */}
                <div className="bg-[#18181B] border border-[#27272A] rounded-xl p-3 text-xs space-y-1">
                  <p className="text-[#A1A1AA]">🏋️ <strong className="text-white">Experience:</strong> {planForm.experienceLevel}</p>
                  <p className="text-[#A1A1AA]">⏱️ <strong className="text-white">Last Trained:</strong> {planForm.lastTrained}</p>
                  <p className="text-[#A1A1AA]">🎯 <strong className="text-white">Goal:</strong> {planForm.goal}</p>
                  <p className="text-[#A1A1AA]">⚠️ <strong className="text-white">Medical/Injury:</strong> {planForm.injuries}</p>
                  <p className="text-[#A1A1AA]">📅 <strong className="text-white">Frequency:</strong> {planForm.daysPerWeek} Days/Week</p>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    disabled={planLoading}
                    onClick={() => setWizardStep(3)}
                    className="w-1/3 bg-[#18181B] text-white font-montserrat font-bold text-xs uppercase py-3.5 rounded-xl disabled:opacity-50"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={planLoading}
                    onClick={handleGeneratePlan}
                    className="flex-1 bg-[#D0FF00] text-[#050505] font-montserrat font-black text-xs uppercase tracking-wider py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-[#b8d300] transition-colors shadow-[0_0_20px_rgba(208,255,0,0.3)] disabled:opacity-50"
                  >
                    {planLoading ? (
                      <>
                        <div className="w-3 h-3 border-2 border-[#050505] border-t-transparent rounded-full animate-spin"></div>
                        <span>Calibrating Weights & Sets...</span>
                      </>
                    ) : (
                      <>
                        <span>CALCULATE WEIGHTS & PLAN</span>
                        <span className="material-symbols-outlined text-base font-bold">bolt</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: Success Celebration */}
            {wizardStep === 5 && activePlan && (
              <div className="space-y-4 text-center py-2">
                <div className="w-16 h-16 bg-[#D0FF00]/10 border border-[#D0FF00]/30 rounded-full flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(208,255,0,0.3)]">
                  <span className="material-symbols-outlined text-3xl text-[#D0FF00]">verified</span>
                </div>

                <div>
                  <span className="font-mono text-[10px] text-[#D0FF00] uppercase tracking-widest block mb-1">
                    Weights & Sets Calibrated
                  </span>
                  <h4 className="font-montserrat text-lg font-black text-white uppercase italic">
                    {activePlan.splitName}
                  </h4>
                  <p className="font-inter text-xs text-[#A1A1AA] mt-1 px-2">
                    {activePlan.aiNotes}
                  </p>
                </div>

                {/* Day Previews with Progressive Weights */}
                <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-3 text-left max-h-48 overflow-y-auto space-y-3">
                  {activePlan.days?.map((d) => (
                    <div key={d.dayNumber} className="border-b border-[#27272A] pb-2 last:border-none last:pb-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-montserrat text-xs font-bold text-white">{d.dayName}</span>
                        <span className="font-mono text-[9px] bg-[#27272A] text-[#D0FF00] px-2 py-0.5 rounded">
                          Day {d.dayNumber}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {d.exercises?.slice(0, 2).map((ex, exIdx) => (
                          <div key={exIdx} className="text-[11px] text-[#A1A1AA] flex justify-between">
                            <span className="truncate">{ex.name}</span>
                            <span className="font-mono text-[#D0FF00] shrink-0">
                              {ex.detailedSets?.[0] ? `${ex.detailedSets[0].targetKg}kg` : ex.startingWeight} • {ex.sets} Sets
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <Link
                    href="/dashboard"
                    onClick={() => setShowWizard(false)}
                    className="w-full bg-[#D0FF00] text-[#050505] font-montserrat font-black text-xs uppercase tracking-wider py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-[#b8d300] shadow-[0_0_20px_rgba(208,255,0,0.3)]"
                  >
                    <span>View On Dashboard</span>
                    <span className="material-symbols-outlined text-base">dashboard</span>
                  </Link>
                  <Link
                    href="/workouts"
                    onClick={() => setShowWizard(false)}
                    className="w-full bg-[#18181B] border border-[#27272A] text-white font-montserrat font-bold text-xs uppercase tracking-wider py-3 rounded-xl flex items-center justify-center gap-2 hover:border-[#D0FF00]"
                  >
                    <span>Start Day 1 Workout</span>
                    <span className="material-symbols-outlined text-base text-[#D0FF00]">play_arrow</span>
                  </Link>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
