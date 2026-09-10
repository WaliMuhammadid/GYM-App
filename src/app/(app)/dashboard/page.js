'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';

export default function Dashboard() {
  const { data: session } = useSession();
  const userName = session?.user?.name || 'Athlete';
  const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

  const [fuelData, setFuelData] = useState({
    calories: 1080,
    calorieTarget: 2400,
    protein: 48,
    proteinTarget: 180,
  });

  const [workoutPlan, setWorkoutPlan] = useState(null);
  const [activeDayIndex, setActiveDayIndex] = useState(0);

  useEffect(() => {
    async function fetchTodayNutrition() {
      if (!session?.user?.id) return;
      try {
        const res = await fetch(`/api/nutrition/log?userId=${session.user.id}`);
        const data = await res.json();
        if (data?.log?.dailyTotals) {
          const { calories, protein } = data.log.dailyTotals;
          if (calories > 0 || protein > 0) {
            setFuelData({
              calories: Math.round(calories),
              calorieTarget: 2400,
              protein: Math.round(protein),
              proteinTarget: 180,
            });
          }
        }
      } catch (err) {
        console.error('Failed to load daily fuel data:', err);
      }
    }

    async function fetchWorkoutPlan() {
      if (!session?.user?.id) return;
      try {
        const res = await fetch(`/api/coach/plan?userId=${session.user.id}`);
        const data = await res.json();
        if (data?.plan) {
          setWorkoutPlan(data.plan);
        }
      } catch (err) {
        console.error('Failed to load workout plan:', err);
      }
    }

    fetchTodayNutrition();
    fetchWorkoutPlan();
  }, [session]);

  const currentDay = workoutPlan?.days?.[activeDayIndex] || workoutPlan?.days?.[0];

  return (
    <div className="pt-safe pb-24 px-5">
      {/* Top Bar */}
      <div className="flex items-center justify-between mt-6 mb-8">
        <Link href="/profile" className="flex items-center gap-4 hover:opacity-90 transition-opacity">
          <div className="relative">
            <div className="w-14 h-14 rounded-full border-2 border-[#D0FF00] flex items-center justify-center bg-[#121215] text-[#D0FF00] font-montserrat font-bold text-xl">
              {initials}
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#D0FF00] rounded-full flex items-center justify-center border-2 border-[#050505]">
              <span className="material-symbols-outlined text-[#050505] text-[10px] font-bold">bolt</span>
            </div>
          </div>
          <div>
            <p className="font-mono text-[10px] text-[#A1A1AA] tracking-[0.2em] uppercase">Good Morning</p>
            <h1 className="font-montserrat text-xl font-bold text-white">{userName}</h1>
            <div className="flex items-center gap-1 mt-1">
              <span className="material-symbols-outlined text-[#D0FF00] text-[12px]">bolt</span>
              <p className="font-mono text-[10px] text-[#D0FF00] font-bold uppercase tracking-wider">
                {workoutPlan ? 'AI Routine Active' : 'Beast Mode Active'}
              </p>
            </div>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <button className="w-10 h-10 rounded-full bg-[#121215] border border-[#27272A] flex items-center justify-center relative">
            <span className="material-symbols-outlined text-white text-[20px]">notifications</span>
            <div className="absolute top-2 right-2 w-2 h-2 bg-[#FF2E54] rounded-full"></div>
          </button>
          <div className="flex flex-col items-center justify-center bg-[#121215] border border-[#27272A] rounded-2xl px-4 py-2">
            <span className="font-montserrat text-lg font-bold text-[#FF2E54]">14</span>
            <span className="font-mono text-[8px] text-white tracking-[0.1em] uppercase">Days Streak</span>
          </div>
        </div>
      </div>

      {/* Daily Fuel Tracker (Top Priority) */}
      <Link href="/nutrition" className="block mb-8 group">
        <div className="flex justify-between items-end mb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#D0FF00] text-base">restaurant</span>
            <h2 className="font-montserrat text-lg font-bold text-white group-hover:text-[#D0FF00] transition-colors">Daily Fuel Tracker</h2>
            <span className="material-symbols-outlined text-sm text-[#71717A] group-hover:text-[#D0FF00] transition-colors">arrow_forward</span>
          </div>
          <span className="font-mono text-[10px] text-[#A1A1AA] uppercase">Today's Intake</span>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#121215] border border-[#27272A] rounded-2xl p-4 group-hover:border-[#D0FF00]/40 transition-colors">
            <h3 className="font-mono text-[9px] text-[#71717A] tracking-[0.2em] uppercase mb-1">Calories</h3>
            <div className="flex items-baseline gap-1 mb-3">
              <span className="font-montserrat text-2xl font-bold text-white">{fuelData.calories.toLocaleString()}</span>
              <span className="font-inter text-[11px] text-[#A1A1AA]">/ {fuelData.calorieTarget.toLocaleString()} kcal</span>
            </div>
            <div className="flex justify-between text-[11px] mb-1.5">
              <span className="font-inter font-bold text-[#D0FF00]">
                {Math.min(100, Math.round((fuelData.calories / fuelData.calorieTarget) * 100))}%
              </span>
              <span className="font-inter text-[#A1A1AA]">
                {Math.max(0, fuelData.calorieTarget - fuelData.calories)} left
              </span>
            </div>
            <div className="w-full h-1.5 bg-[#27272A] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#D0FF00] rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.round((fuelData.calories / fuelData.calorieTarget) * 100))}%` }}
              ></div>
            </div>
          </div>
          
          <div className="bg-[#121215] border border-[#27272A] rounded-2xl p-4 group-hover:border-[#FF2E54]/40 transition-colors">
            <h3 className="font-mono text-[9px] text-[#71717A] tracking-[0.2em] uppercase mb-1">Protein</h3>
            <div className="flex items-baseline gap-1 mb-3">
              <span className="font-montserrat text-2xl font-bold text-white">{fuelData.protein}g</span>
              <span className="font-inter text-[11px] text-[#A1A1AA]">/ {fuelData.proteinTarget}g Target</span>
            </div>
            <div className="flex justify-between text-[11px] mb-1.5">
              <span className="font-inter font-bold text-[#FF2E54]">
                {Math.min(100, Math.round((fuelData.protein / fuelData.proteinTarget) * 100))}%
              </span>
              <span className="font-inter text-[#A1A1AA]">
                {Math.max(0, fuelData.proteinTarget - fuelData.protein)}g left
              </span>
            </div>
            <div className="w-full h-1.5 bg-[#27272A] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#FF2E54] rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.round((fuelData.protein / fuelData.proteinTarget) * 100))}%` }}
              ></div>
            </div>
          </div>
        </div>
      </Link>

      {/* Workout Hero (Dynamic AI Schedule) */}
      <div className="mb-8">
        {workoutPlan ? (
          <div>
            {/* Day Selector Tabs */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#D0FF00] text-sm">event_repeat</span>
                <span className="font-mono text-[10px] text-[#A1A1AA] uppercase tracking-wider">
                  {workoutPlan.days?.length}-Day Schedule:
                </span>
              </div>
              <Link 
                href="/coach"
                className="font-mono text-[10px] text-[#D0FF00] hover:underline flex items-center gap-0.5"
              >
                <span>Edit with AI</span>
                <span className="material-symbols-outlined text-xs">edit</span>
              </Link>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar mb-3">
              {workoutPlan.days?.map((day, idx) => (
                <button
                  key={day.dayNumber}
                  onClick={() => setActiveDayIndex(idx)}
                  className={`px-3.5 py-1.5 rounded-xl font-mono text-[10px] font-extrabold uppercase transition-all shrink-0 border ${
                    activeDayIndex === idx
                      ? 'bg-[#D0FF00] text-[#050505] border-[#D0FF00] shadow-[0_0_15px_rgba(208,255,0,0.3)] scale-[1.02]'
                      : 'bg-[#121215] border-[#27272A] text-[#A1A1AA] hover:border-[#3F3F46]'
                  }`}
                >
                  Day {day.dayNumber}: {day.shortTitle || `Day ${day.dayNumber}`}
                </button>
              ))}
            </div>

            {/* Selected Day Workout Card */}
            <div className="relative rounded-3xl overflow-hidden border border-[#27272A] bg-[#121215]">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#D0FF00]/10 rounded-full blur-[80px] pointer-events-none"></div>

              <div className="p-6 relative z-10">
                <div className="flex flex-wrap justify-between items-start gap-2 mb-4">
                  <div className="bg-[#FF2E54]/20 border border-[#FF2E54]/30 px-2.5 py-1 rounded-full backdrop-blur-md shrink-0">
                    <span className="font-mono text-[9px] text-[#FF2E54] uppercase tracking-wider font-bold">
                      Day {currentDay?.dayNumber} Target
                    </span>
                  </div>
                  <div className="font-mono text-[9px] text-white uppercase tracking-wider text-right">
                    {currentDay?.estimatedDuration || 45} Mins • {currentDay?.exercises?.length || 5} Exercises
                  </div>
                </div>

                <h2 className="font-montserrat text-2xl font-black italic uppercase leading-tight mb-1 text-white">
                  {currentDay?.shortTitle || currentDay?.dayName}
                </h2>
                <p className="font-inter text-xs text-[#A1A1AA] mb-4">
                  {currentDay?.targetMuscles?.length > 0 
                    ? `Target: ${currentDay.targetMuscles.join(' • ')}`
                    : currentDay?.dayName}
                </p>

                {/* Exercise Preview List */}
                <div className="space-y-1.5 mb-6">
                  {currentDay?.exercises?.slice(0, 3).map((ex, exIdx) => (
                    <div key={exIdx} className="bg-[#18181B] border border-[#27272A] rounded-xl px-3 py-2 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#D0FF00]"></span>
                        <span className="text-white font-medium truncate">{ex.name}</span>
                      </div>
                      <span className="font-mono text-[10px] text-[#D0FF00] shrink-0 ml-2">
                        {ex.sets} Sets × {ex.reps}
                      </span>
                    </div>
                  ))}
                  {(currentDay?.exercises?.length || 0) > 3 && (
                    <p className="font-mono text-[10px] text-[#71717A] text-center pt-1">
                      +{(currentDay?.exercises?.length || 0) - 3} more tailored exercises
                    </p>
                  )}
                </div>

                <Link
                  href={`/workouts?day=${currentDay?.dayNumber || 1}`}
                  className="w-full bg-[#D0FF00] text-[#050505] font-montserrat font-extrabold text-base uppercase tracking-wider py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-[#b8d300] transition-colors active:scale-[0.98] shadow-[0_0_20px_rgba(208,255,0,0.2)]"
                >
                  START WORKOUT
                  <span className="material-symbols-outlined text-xl">play_arrow</span>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* Empty State - Prompt user to generate AI schedule */
          <div className="relative rounded-3xl overflow-hidden border border-[#27272A] bg-[#121215] p-6 shadow-xl">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#D0FF00]/10 rounded-full blur-[60px] pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#D0FF00]/10 border border-[#D0FF00]/30 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[#D0FF00] text-3xl">smart_toy</span>
              </div>
              <span className="font-mono text-[10px] text-[#D0FF00] uppercase tracking-widest block mb-1">
                Personalized Training Engine
              </span>
              <h2 className="font-montserrat text-2xl font-black text-white uppercase italic mb-2">
                NO AI SCHEDULE YET
              </h2>
              <p className="font-inter text-xs text-[#A1A1AA] mb-6 max-w-xs">
                FitAI Coach se apna custom gym routine banwayein. Apni injuries, weight aur gym availability ke mutabiq safe plan banayein.
              </p>
              <Link
                href="/coach"
                className="w-full bg-[#D0FF00] text-[#050505] font-montserrat font-extrabold text-sm uppercase tracking-wider py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-[#b8d300] shadow-[0_0_20px_rgba(208,255,0,0.2)]"
              >
                <span>BUILD WORKOUT SCHEDULE</span>
                <span className="material-symbols-outlined text-lg">bolt</span>
              </Link>
            </div>
          </div>
        )}
      </div>


      {/* AI Coach Insight */}
      <Link href="/coach" className="block bg-[#121215] border border-[#27272A] hover:border-[#D0FF00]/50 transition-colors rounded-2xl p-5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#D0FF00]/5 rounded-full blur-[40px]"></div>
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#D0FF00]/10 border border-[#D0FF00]/20 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[#D0FF00]">smart_toy</span>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-montserrat text-base font-bold text-white group-hover:text-[#D0FF00] transition-colors mb-1">FitAI Coach Insight</h3>
              <span className="material-symbols-outlined text-sm text-[#71717A] group-hover:text-[#D0FF00] transition-colors">arrow_forward</span>
            </div>
            <p className="font-inter text-sm text-[#A1A1AA] leading-relaxed mb-3">
              {workoutPlan?.aiNotes || "Your sleep and recovery are calibrated. Ready for your tailored routine?"}
            </p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#D0FF00] animate-pulse"></div>
              <span className="font-mono text-[10px] text-[#71717A] uppercase">
                {workoutPlan ? `Synced with ${workoutPlan.splitName}` : 'Personalized • Tap to chat with Coach'}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
