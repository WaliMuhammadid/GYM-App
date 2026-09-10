'use client';
import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function NutritionChatTracker() {
  const router = useRouter();
  const { data: session } = useSession();
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: "Hey! Main tumhara FitAI Nutritionist hoon. 🥩🍲\n\nBolo aaj kya khaya? Plain language ma likho jaise:\n👉 **\"ek plate nihari with 2 naan\"**\n👉 **\"2 anda paratha with chai\"**\n👉 **\"chicken biryani 1 plate with raita\"**\n\nMain exact calories aur macros calculate kar ke tumhare dashboard ma update kar doon ga!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [dailyTotals, setDailyTotals] = useState({ calories: 0, protein: 0, carbs: 0, fats: 0 });
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Load today's existing daily totals from DB
  const loadDailyLogs = async () => {
    if (!session?.user?.id) return;
    try {
      const res = await fetch(`/api/nutrition/log?userId=${session.user.id}`);
      const data = await res.json();
      if (data?.log?.dailyTotals) {
        setDailyTotals(data.log.dailyTotals);
      }
    } catch (e) {
      console.error('Error fetching logs:', e);
    }
  };

  useEffect(() => {
    loadDailyLogs();
  }, [session]);

  const handleSendMessage = async (textToSend = null) => {
    const queryText = (textToSend || input).trim();
    if (!queryText || loading) return;

    const userMsg = { role: 'user', text: queryText, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/nutrition/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: queryText,
          userId: session?.user?.id,
          autoLog: true, // Automatically logs to MongoDB database
        }),
      });

      const data = await res.json();

      if (data && data.found) {
        const aiMsg = {
          role: 'ai',
          text: data.description || `Calculated macros for ${data.dishName}.`,
          timestamp: new Date(),
          macroData: {
            dishName: data.dishName,
            calories: data.calories,
            protein: data.protein,
            carbs: data.carbs,
            fats: data.fats,
            breakdown: data.breakdown || [],
            logged: true,
          },
        };
        // Guarantee storage in MongoDB via /api/nutrition/log
        if (session?.user?.id) {
          try {
            await fetch('/api/nutrition/log', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: session.user.id,
                dishName: data.dishName,
                amount: 1,
                unit: 'meal',
                calories: data.calories,
                protein: data.protein,
                carbs: data.carbs,
                fats: data.fats,
              }),
            });
          } catch (e) {
            console.error('Failed to log meal to DB:', e);
          }
        }

        setMessages((prev) => [...prev, aiMsg]);
        // Update local daily total
        setDailyTotals((prev) => ({
          calories: prev.calories + data.calories,
          protein: prev.protein + data.protein,
          carbs: prev.carbs + data.carbs,
          fats: prev.fats + data.fats,
        }));
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'ai',
            text: "Could not calculate macros for that query. Please try phrasing it like '1 plate chicken karahi with 2 roti'.",
            timestamp: new Date(),
          },
        ]);
      }
    } catch (err) {
      console.error('Error querying nutrition AI:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          text: "Connection error. Please check your network and try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen pt-safe bg-[#050505] text-white relative overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-[#27272A] glassmorphism sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="w-10 h-10 flex items-center justify-center text-white hover:text-[#D0FF00] transition-colors rounded-full hover:bg-[#121215]"
            title="Back to Dashboard"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-[#121215] border border-[#D0FF00]/40 flex items-center justify-center shadow-[0_0_12px_rgba(208,255,0,0.2)]">
              <span className="material-symbols-outlined text-[#D0FF00] text-xl">restaurant</span>
            </div>
            <div>
              <h1 className="font-montserrat text-sm font-black text-[#D0FF00] uppercase italic leading-tight">
                AI Macro Chat
              </h1>
              <p className="font-mono text-[9px] text-[#A1A1AA] uppercase tracking-wider">
                Natural Meal Logger • Online
              </p>
            </div>
          </div>
        </div>

        {/* Live Daily Calories Pill */}
        <div
          onClick={() => router.push('/dashboard')}
          className="bg-[#121215] border border-[#27272A] hover:border-[#D0FF00] px-3 py-1.5 rounded-2xl flex flex-col items-end cursor-pointer transition-colors"
          title="View on Dashboard"
        >
          <span className="font-mono text-[8px] text-[#A1A1AA] uppercase tracking-widest">Today's Fuel</span>
          <span className="font-montserrat text-xs font-black text-[#D0FF00]">
            {dailyTotals.calories} / 2,400 <span className="text-[9px] text-white">kcal</span>
          </span>
        </div>
      </header>

      {/* Chat Conversation Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 pb-48">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[90%] rounded-2xl p-4 ${
                msg.role === 'user'
                  ? 'bg-[#27272A] text-white rounded-tr-sm'
                  : 'bg-[#121215] border border-[#27272A] rounded-tl-sm border-l-4 border-l-[#D0FF00] shadow-[0_0_20px_rgba(0,0,0,0.6)]'
              }`}
            >
              {/* Text Body */}
              <p className="font-inter text-[14px] leading-relaxed whitespace-pre-wrap">
                {msg.text.split('**').map((part, i) =>
                  i % 2 === 1 ? (
                    <strong key={i} className={msg.role === 'ai' ? 'text-[#D0FF00]' : 'text-white'}>
                      {part}
                    </strong>
                  ) : (
                    part
                  )
                )}
              </p>

              {/* Macro Card if available */}
              {msg.macroData && (
                <div className="mt-4 bg-[#050505] border border-[#27272A] rounded-2xl p-4 shadow-inner">
                  <div className="flex justify-between items-start mb-3 border-b border-[#27272A] pb-2">
                    <div>
                      <span className="font-mono text-[9px] text-[#A1A1AA] uppercase tracking-widest block">
                        Estimated Food
                      </span>
                      <h3 className="font-montserrat text-base font-bold text-white">
                        {msg.macroData.dishName}
                      </h3>
                    </div>
                    <div className="text-right">
                      <span className="font-montserrat text-2xl font-black text-[#D0FF00]">
                        {msg.macroData.calories}
                      </span>
                      <span className="font-mono text-[9px] text-[#A1A1AA] block uppercase">Calories</span>
                    </div>
                  </div>

                  {/* 3 Macro Pillars */}
                  <div className="grid grid-cols-3 gap-2 text-center mb-3">
                    <div className="bg-[#121215] border border-[#27272A] p-2 rounded-xl">
                      <span className="font-mono text-[8px] text-[#71717A] uppercase block">Protein</span>
                      <span className="font-montserrat text-base font-bold text-[#D0FF00]">
                        {msg.macroData.protein}g
                      </span>
                    </div>
                    <div className="bg-[#121215] border border-[#27272A] p-2 rounded-xl">
                      <span className="font-mono text-[8px] text-[#71717A] uppercase block">Carbs</span>
                      <span className="font-montserrat text-base font-bold text-white">
                        {msg.macroData.carbs}g
                      </span>
                    </div>
                    <div className="bg-[#121215] border border-[#27272A] p-2 rounded-xl">
                      <span className="font-mono text-[8px] text-[#71717A] uppercase block">Fats</span>
                      <span className="font-montserrat text-base font-bold text-[#FF2E54]">
                        {msg.macroData.fats}g
                      </span>
                    </div>
                  </div>

                  {/* Itemized breakdown if provided */}
                  {msg.macroData.breakdown && msg.macroData.breakdown.length > 0 && (
                    <div className="space-y-1 mb-3 pt-2 border-t border-[#27272A]/60">
                      {msg.macroData.breakdown.map((item, itemIdx) => (
                        <div key={itemIdx} className="flex items-center gap-1.5 text-xs text-[#A1A1AA]">
                          <span className="text-[#D0FF00] text-[10px]">•</span>
                          <span className="font-inter text-[11px]">{item}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Dashboard Auto-Logged Status Badge */}
                  <div className="flex items-center justify-between bg-[#D0FF00]/10 border border-[#D0FF00]/30 rounded-xl px-3 py-2">
                    <div className="flex items-center gap-1.5 text-[#D0FF00]">
                      <span className="material-symbols-outlined text-[16px]">check_circle</span>
                      <span className="font-mono text-[10px] uppercase font-bold tracking-wider">
                        Logged to Dashboard
                      </span>
                    </div>
                    <button
                      onClick={() => router.push('/dashboard')}
                      className="font-mono text-[9px] text-[#A1A1AA] hover:text-white underline uppercase"
                    >
                      View Fuel
                    </button>
                  </div>
                </div>
              )}

              {/* Timestamp */}
              <div className={`mt-2 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <span className="font-mono text-[9px] text-[#71717A]">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>
        ))}

        {/* AI Thinking Animation */}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-[#121215] border border-[#27272A] rounded-2xl p-4 rounded-tl-sm border-l-4 border-l-[#D0FF00] flex items-center gap-3">
              <span className="font-mono text-xs text-[#A1A1AA] uppercase">
                Calculating Nutrition with Gemini...
              </span>
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-[#D0FF00] rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-[#D0FF00] rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                <div className="w-2 h-2 bg-[#D0FF00] rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Sticky Input Container */}
      <div className="fixed bottom-[75px] left-1/2 -translate-x-1/2 w-full max-w-md p-4 bg-gradient-to-t from-[#050505] via-[#050505] to-transparent z-40">
        {/* Suggestion Chips */}
        <div className="flex gap-2 overflow-x-auto pb-3 no-scrollbar">
          <button
            type="button"
            onClick={() => handleSendMessage('ek plate nihari with 2 naan')}
            className="shrink-0 bg-[#121215] border border-[#27272A] hover:border-[#D0FF00] rounded-full px-3.5 py-1.5 flex items-center gap-1.5 transition-colors"
          >
            <span className="text-sm">🍲</span>
            <span className="font-inter text-xs text-[#A1A1AA]">Nihari + 2 Naan</span>
          </button>
          <button
            type="button"
            onClick={() => handleSendMessage('chicken biryani 1 plate with raita')}
            className="shrink-0 bg-[#121215] border border-[#27272A] hover:border-[#D0FF00] rounded-full px-3.5 py-1.5 flex items-center gap-1.5 transition-colors"
          >
            <span className="text-sm">🍗</span>
            <span className="font-inter text-xs text-[#A1A1AA]">Chicken Biryani</span>
          </button>
          <button
            type="button"
            onClick={() => handleSendMessage('2 anda paratha with chai')}
            className="shrink-0 bg-[#121215] border border-[#27272A] hover:border-[#D0FF00] rounded-full px-3.5 py-1.5 flex items-center gap-1.5 transition-colors"
          >
            <span className="text-sm">🍳</span>
            <span className="font-inter text-xs text-[#A1A1AA]">2 Anda Paratha</span>
          </button>
          <button
            type="button"
            onClick={() => handleSendMessage('3 boiled eggs and 1 banana')}
            className="shrink-0 bg-[#121215] border border-[#27272A] hover:border-[#D0FF00] rounded-full px-3.5 py-1.5 flex items-center gap-1.5 transition-colors"
          >
            <span className="text-sm">🥚</span>
            <span className="font-inter text-xs text-[#A1A1AA]">Eggs &amp; Banana</span>
          </button>
        </div>

        {/* Form Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="relative flex items-center bg-[#121215] border border-[#27272A] focus-within:border-[#D0FF00] rounded-[30px] p-1.5 shadow-[0_0_25px_rgba(0,0,0,0.7)] transition-colors"
        >
          <span className="material-symbols-outlined text-[#71717A] ml-3 text-xl">
            search
          </span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. ek plate nihari with 2 naan..."
            className="flex-1 bg-transparent border-none outline-none text-white font-inter placeholder:text-[#52525B] px-3 text-sm"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="w-11 h-11 rounded-full bg-[#D0FF00] text-[#050505] flex items-center justify-center shrink-0 hover:bg-[#b8d300] transition-colors disabled:opacity-40"
          >
            <span className="material-symbols-outlined font-black text-xl">arrow_upward</span>
          </button>
        </form>
      </div>
    </div>
  );
}
