'use client';
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function ProfilePerformance() {
  const { data: session } = useSession();
  const router = useRouter();
  const [viewSide, setViewSide] = useState('front'); // 'front' | 'back'

  const userName = session?.user?.name || 'Alex Mercer';
  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  const frontMuscles = [
    { name: 'Chest / Pecs', score: 45, status: 'Recovering', color: '#FF2E54' },
    { name: 'Shoulders', score: 70, status: 'Light Fatigue', color: '#EAB308' },
    { name: 'Quads', score: 92, status: 'Primed', color: '#D0FF00' },
    { name: 'Core / Abs', score: 88, status: 'Primed', color: '#D0FF00' },
    { name: 'Biceps', score: 62, status: 'Moderate', color: '#EAB308' },
  ];

  const backMuscles = [
    { name: 'Lats / Upper Back', score: 85, status: 'Recovered', color: '#D0FF00' },
    { name: 'Lower Back', score: 55, status: 'Fatigued', color: '#FF2E54' },
    { name: 'Hamstrings', score: 68, status: 'Light Fatigue', color: '#EAB308' },
    { name: 'Glutes', score: 90, status: 'Primed', color: '#D0FF00' },
    { name: 'Triceps', score: 50, status: 'Recovering', color: '#FF2E54' },
  ];

  const activeMuscles = viewSide === 'front' ? frontMuscles : backMuscles;

  return (
    <div className="flex flex-col min-h-screen bg-[#050505] text-white pt-safe px-5 pb-32 relative">
      {/* Header */}
      <header className="flex items-center justify-between py-4 sticky top-0 z-40 bg-[#050505]/95 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#121215] border border-[#27272A] flex items-center justify-center text-[#D0FF00] font-montserrat font-bold text-sm">
            {initials}
          </div>
          <div>
            <h1 className="font-montserrat text-lg font-black text-white italic uppercase tracking-wider">
              ATHLETE PROFILE
            </h1>
            <p className="font-mono text-[9px] text-[#A1A1AA] uppercase tracking-widest">
              Performance &amp; Recovery
            </p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="p-2 bg-[#121215] border border-[#27272A] rounded-full text-[#FF2E54] hover:bg-[#FF2E54]/10 transition-colors"
          title="Sign Out"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
        </button>
      </header>

      {/* Level & XP Header Card */}
      <section className="bg-[#121215] border border-[#27272A] rounded-3xl p-5 relative overflow-hidden mb-6 shadow-[0_0_20px_rgba(208,255,0,0.05)]">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#D0FF00]/10 blur-3xl rounded-full pointer-events-none"></div>
        <div className="flex flex-col gap-2 relative z-10">
          <div className="flex justify-between items-baseline">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#D0FF00] uppercase">LVL 18</span>
              <span className="text-[#71717A] text-xs">•</span>
              <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">IRON WARRIOR</span>
            </div>
            <span className="font-mono text-xs text-[#A1A1AA]">3,450 / 4,000 XP</span>
          </div>

          {/* XP Progress Bar */}
          <div className="w-full h-2.5 bg-[#050505] rounded-full overflow-hidden relative border border-[#27272A]">
            <div className="h-full bg-[#D0FF00] rounded-full transition-all duration-500" style={{ width: '86%' }}></div>
          </div>

          <div className="flex justify-between text-[10px] font-mono text-[#71717A] mt-1">
            <span>550 XP to Next Rank</span>
            <span className="text-[#D0FF00] font-bold">+150 XP Today</span>
          </div>
        </div>
      </section>

      {/* 3D Muscle Recovery Heatmap */}
      <section className="bg-[#121215] border border-[#27272A] rounded-3xl p-5 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-montserrat text-sm font-bold uppercase tracking-wider text-white">
              Muscle Recovery Status
            </h3>
            <p className="font-mono text-[9px] text-[#A1A1AA] uppercase">Heatmap Analysis</p>
          </div>

          {/* Front / Back Toggle */}
          <div className="flex bg-[#050505] rounded-full p-1 border border-[#27272A]">
            <button
              onClick={() => setViewSide('front')}
              className={`px-3 py-1 rounded-full font-mono text-[10px] uppercase font-bold transition-all ${
                viewSide === 'front' ? 'bg-[#D0FF00] text-[#050505]' : 'text-[#71717A] hover:text-white'
              }`}
            >
              FRONT
            </button>
            <button
              onClick={() => setViewSide('back')}
              className={`px-3 py-1 rounded-full font-mono text-[10px] uppercase font-bold transition-all ${
                viewSide === 'back' ? 'bg-[#D0FF00] text-[#050505]' : 'text-[#71717A] hover:text-white'
              }`}
            >
              BACK
            </button>
          </div>
        </div>

        {/* Muscle Status List */}
        <div className="flex flex-col gap-2">
          {activeMuscles.map((muscle) => (
            <div
              key={muscle.name}
              className="flex items-center justify-between p-3 bg-[#050505] border border-[#27272A] rounded-xl"
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: muscle.color, boxShadow: `0 0 8px ${muscle.color}` }}
                ></div>
                <div>
                  <h4 className="font-inter text-xs font-semibold text-white">{muscle.name}</h4>
                  <span className="font-mono text-[9px] text-[#71717A] uppercase">{muscle.status}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-montserrat font-bold text-sm" style={{ color: muscle.color }}>
                  {muscle.score}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Biometrics Score Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-[#121215] border border-[#27272A] rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="material-symbols-outlined text-[#D0FF00] text-xl">vital_signs</span>
            <span className="font-mono text-[9px] text-[#D0FF00] bg-[#D0FF00]/10 px-1.5 py-0.5 rounded uppercase font-bold">
              High
            </span>
          </div>
          <div>
            <span className="font-mono text-[9px] text-[#71717A] uppercase tracking-wider block">
              Readiness Score
            </span>
            <h4 className="font-montserrat text-2xl font-black text-white">88/100</h4>
          </div>
        </div>

        <div className="bg-[#121215] border border-[#27272A] rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="material-symbols-outlined text-[#3B82F6] text-xl">ecg_heart</span>
            <span className="font-mono text-[9px] text-[#3B82F6] bg-[#3B82F6]/10 px-1.5 py-0.5 rounded uppercase font-bold">
              +4%
            </span>
          </div>
          <div>
            <span className="font-mono text-[9px] text-[#71717A] uppercase tracking-wider block">
              HRV Average
            </span>
            <h4 className="font-montserrat text-2xl font-black text-white">68 ms</h4>
          </div>
        </div>
      </div>

      {/* FitAI Recovery Protocol */}
      <section className="bg-[#121215] border border-[#D0FF00]/30 rounded-3xl p-5 mb-6 shadow-[0_0_20px_rgba(208,255,0,0.05)]">
        <div className="flex items-center gap-2 mb-3">
          <span className="material-symbols-outlined text-[#D0FF00] text-xl">self_improvement</span>
          <h3 className="font-montserrat text-sm font-bold uppercase tracking-wider text-white">
            FitAI Recovery Protocol
          </h3>
        </div>
        <p className="font-inter text-xs text-[#A1A1AA] leading-relaxed mb-4">
          Based on today&apos;s workout intensity and moderate chest fatigue, complete these recommendations:
        </p>

        <div className="space-y-2">
          <div className="flex items-center gap-3 p-3 bg-[#050505] border border-[#27272A] rounded-xl">
            <span className="material-symbols-outlined text-[#3B82F6] text-lg">ac_unit</span>
            <div className="flex-1">
              <h5 className="font-inter text-xs font-medium text-white">Cold Plunge / Cryo</h5>
              <p className="font-mono text-[9px] text-[#71717A]">3-5 mins at 10°C to reduce inflammation</p>
            </div>
            <span className="font-mono text-[10px] text-[#D0FF00] font-bold">Recommended</span>
          </div>

          <div className="flex items-center gap-3 p-3 bg-[#050505] border border-[#27272A] rounded-xl">
            <span className="material-symbols-outlined text-[#D0FF00] text-lg">water_drop</span>
            <div className="flex-1">
              <h5 className="font-inter text-xs font-medium text-white">Electrolyte Hydration</h5>
              <p className="font-mono text-[9px] text-[#71717A]">750ml with Sodium &amp; Magnesium</p>
            </div>
            <span className="font-mono text-[10px] text-[#D0FF00] font-bold">Immediate</span>
          </div>

          <div className="flex items-center gap-3 p-3 bg-[#050505] border border-[#27272A] rounded-xl">
            <span className="material-symbols-outlined text-[#EAB308] text-lg">hotel</span>
            <div className="flex-1">
              <h5 className="font-inter text-xs font-medium text-white">Sleep Target</h5>
              <p className="font-mono text-[9px] text-[#71717A]">8.5 Hours targeted for deep REM</p>
            </div>
            <span className="font-mono text-[10px] text-[#A1A1AA]">Tonight</span>
          </div>
        </div>
      </section>

      {/* Account Info & Logout */}
      <div className="p-4 bg-[#121215] border border-[#27272A] rounded-2xl flex items-center justify-between">
        <div>
          <p className="font-inter text-xs font-semibold text-white">{session?.user?.email || 'alex@test.com'}</p>
          <span className="font-mono text-[9px] text-[#71717A] uppercase">Plan: Gold Athlete • Active</span>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="bg-[#FF2E54]/10 hover:bg-[#FF2E54]/20 border border-[#FF2E54]/30 text-[#FF2E54] font-mono text-xs font-bold uppercase px-3 py-2 rounded-xl transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
