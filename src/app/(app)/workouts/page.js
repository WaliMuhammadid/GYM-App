'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

function WorkoutSessionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const dayParam = searchParams.get('day') || '1';
  const [voiceCoachActive, setVoiceCoachActive] = useState(true);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [restTimer, setRestTimer] = useState(null);
  const [workoutFinished, setWorkoutFinished] = useState(false);

  const [workoutPlan, setWorkoutPlan] = useState(null);
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);

  const [sets, setSets] = useState([
    { id: 1, prev: '80 kg × 10', kg: 80, reps: 10, completed: true },
    { id: 2, prev: '80 kg × 10', kg: 80, reps: 10, completed: true },
    { id: 3, prev: '80 kg × 8', kg: 85, reps: 8, completed: false, active: true },
    { id: 4, prev: '85 kg × 6', kg: 85, reps: 6, completed: false },
  ]);

  // Fetch user's active AI plan
  useEffect(() => {
    async function fetchPlan() {
      if (!session?.user?.id) return;
      try {
        const res = await fetch(`/api/coach/plan?userId=${session.user.id}`);
        const data = await res.json();
        if (data?.plan) {
          setWorkoutPlan(data.plan);
        }
      } catch (err) {
        console.error('Failed to load workout plan in session:', err);
      }
    }
    fetchPlan();
  }, [session]);

  const currentDay = workoutPlan?.days?.find((d) => d.dayNumber === Number(dayParam)) || workoutPlan?.days?.[0];
  const currentExercise = currentDay?.exercises?.[activeExerciseIndex] || {
    name: 'Barbell Bench Press',
    sets: 4,
    reps: '8-10',
    startingWeight: '80 kg',
    notes: 'Keep shoulder blades pinned back, arch lower back slightly, and explode on the push.',
  };

  // When active exercise changes, re-initialize sets with AI-calibrated progression
  useEffect(() => {
    if (currentExercise) {
      if (currentExercise.detailedSets && currentExercise.detailedSets.length > 0) {
        const newSets = currentExercise.detailedSets.map((ds) => ({
          id: ds.setNumber,
          prev: `${ds.targetKg} kg × ${ds.reps}`,
          kg: ds.targetKg,
          reps: ds.reps,
          setType: ds.setType || 'working',
          completed: false,
          active: ds.setNumber === 1,
        }));
        setSets(newSets);
      } else {
        const numSets = Number(currentExercise.sets) || 3;
        const baseKg = parseInt(currentExercise.startingWeight) || 20;
        const baseReps = parseInt(currentExercise.reps) || 10;
        const newSets = Array.from({ length: numSets }).map((_, i) => {
          const progressiveKg = Math.max(5, baseKg + (i * 2.5));
          const targetReps = Math.max(6, baseReps - (i > 1 ? 2 : 0));
          return {
            id: i + 1,
            prev: `${progressiveKg} kg × ${targetReps}`,
            kg: progressiveKg,
            reps: targetReps,
            setType: i === 0 ? 'warmup' : 'working',
            completed: false,
            active: i === 0,
          };
        });
        setSets(newSets);
      }
    }
  }, [currentExercise?.name, activeExerciseIndex, dayParam]);

  // Rest Timer countdown
  useEffect(() => {
    let interval = null;
    if (restTimer !== null && restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer((prev) => (prev > 1 ? prev - 1 : null));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [restTimer]);

  const toggleSetComplete = (id) => {
    setSets((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const nextCompleted = !s.completed;
          if (nextCompleted) {
            setRestTimer(currentExercise?.restTime || 60);
          }
          return { ...s, completed: nextCompleted, active: false };
        }
        return s;
      })
    );
  };

  const updateSet = (id, field, value) => {
    setSets((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const addSet = () => {
    const nextId = sets.length + 1;
    const lastSet = sets[sets.length - 1] || { kg: 60, reps: 10 };
    setSets((prev) => [
      ...prev,
      {
        id: nextId,
        prev: `${lastSet.kg} kg × ${lastSet.reps}`,
        kg: lastSet.kg,
        reps: lastSet.reps,
        completed: false,
        active: true,
      },
    ]);
  };

  const completedCount = sets.filter((s) => s.completed).length;
  const totalVolume = sets
    .filter((s) => s.completed)
    .reduce((acc, s) => acc + Number(s.kg || 0) * Number(s.reps || 0), 0);

  return (
    <div className="flex flex-col min-h-screen bg-[#050505] text-white pt-safe px-5 pb-32 relative">
      {/* Top Nav */}
      <header className="flex items-center justify-between py-4 sticky top-0 z-40 bg-[#050505]/95 backdrop-blur-md">
        <button
          onClick={() => router.push('/dashboard')}
          className="text-white hover:text-[#D0FF00] transition-colors p-2 rounded-full hover:bg-[#121215]"
          title="Back to Dashboard"
        >
          <span className="material-symbols-outlined">chevron_left</span>
        </button>
        <div className="text-center truncate px-2">
          <span className="font-mono text-[10px] text-[#D0FF00] tracking-widest uppercase font-bold block">
            {currentDay ? `Day ${currentDay.dayNumber} Session` : 'ACTIVE SESSION'}
          </span>
          <h1 className="font-montserrat text-base font-bold uppercase truncate">
            {currentDay?.shortTitle || currentDay?.dayName || 'Chest & Triceps'}
          </h1>
        </div>
        <button
          onClick={() => router.push('/dashboard')}
          className="text-[#71717A] hover:text-[#FF2E54] transition-colors p-2 rounded-full hover:bg-[#121215]"
          title="Exit Workout"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </header>

      {/* Voice Coach Pill */}
      <div className="flex justify-center mb-4">
        <button
          onClick={() => setVoiceCoachActive(!voiceCoachActive)}
          className={`inline-flex items-center gap-2 border rounded-full py-1.5 px-4 transition-all ${
            voiceCoachActive
              ? 'bg-[#121215] border-[#D0FF00]/40 shadow-[0_0_15px_rgba(208,255,0,0.15)] text-white'
              : 'bg-[#121215] border-[#27272A] text-[#71717A]'
          }`}
        >
          <span
            className={`material-symbols-outlined text-[16px] ${
              voiceCoachActive ? 'text-[#D0FF00]' : 'text-[#71717A]'
            }`}
          >
            {voiceCoachActive ? 'mic' : 'mic_off'}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-wider">
            {voiceCoachActive ? 'Hands-Free Coach: Active' : 'Hands-Free Coach: Muted'}
          </span>
          {voiceCoachActive && (
            <div className="flex items-end gap-[2px] h-3 ml-1">
              <div className="w-[2px] h-2 bg-[#D0FF00] rounded-full animate-pulse"></div>
              <div className="w-[2px] h-3 bg-[#D0FF00] rounded-full animate-bounce"></div>
              <div className="w-[2px] h-1.5 bg-[#D0FF00] rounded-full animate-pulse"></div>
            </div>
          )}
        </button>
      </div>

      {/* Day Exercise Switcher Tabs */}
      {currentDay?.exercises && currentDay.exercises.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[10px] text-[#A1A1AA] uppercase">
              Exercise {activeExerciseIndex + 1} of {currentDay.exercises.length}
            </span>
            <span className="font-mono text-[10px] text-[#D0FF00] uppercase font-bold">
              Target: {currentDay.exercises[activeExerciseIndex]?.reps} Reps
            </span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {currentDay.exercises.map((ex, idx) => (
              <button
                key={idx}
                onClick={() => setActiveExerciseIndex(idx)}
                className={`px-3.5 py-1.5 rounded-xl font-mono text-[10px] font-extrabold uppercase transition-all shrink-0 border ${
                  activeExerciseIndex === idx
                    ? 'bg-[#D0FF00] text-[#050505] border-[#D0FF00] shadow-[0_0_15px_rgba(208,255,0,0.3)]'
                    : 'bg-[#121215] border-[#27272A] text-[#A1A1AA] hover:text-white'
                }`}
              >
                {idx + 1}. {ex.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Exercise Video Demonstration Card */}
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-[#27272A] bg-[#121215] group mb-4">
        <img
          alt={currentExercise?.name}
          className={`w-full h-full object-cover transition-all duration-500 ${
            isPlayingVideo ? 'opacity-100 scale-105' : 'opacity-70 mix-blend-luminosity group-hover:mix-blend-normal'
          }`}
          src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/90 via-transparent to-transparent"></div>
        
        <button
          onClick={() => setIsPlayingVideo(!isPlayingVideo)}
          className="absolute inset-0 m-auto w-16 h-16 bg-[#050505]/60 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 hover:border-[#D0FF00] transition-all group-hover:scale-110 shadow-2xl"
        >
          <span
            className="material-symbols-outlined text-[#D0FF00] text-3xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {isPlayingVideo ? 'pause' : 'play_arrow'}
          </span>
        </button>

        <div className="absolute bottom-3 left-4 right-4 flex justify-between items-center z-10">
          <span className="font-mono text-[10px] text-white uppercase bg-[#050505]/70 px-2 py-1 rounded backdrop-blur-md">
            HD Form Demo • 0:45
          </span>
          <span className="font-mono text-[10px] text-[#D0FF00] uppercase font-bold">
            {currentExercise?.detailedSets?.length > 0
              ? `Progression: ${currentExercise.detailedSets[0].targetKg}kg → ${currentExercise.detailedSets[currentExercise.detailedSets.length - 1].targetKg}kg`
              : `Rec: ${currentExercise?.startingWeight}`}
          </span>
        </div>
      </div>

      {/* Exercise Header & Badges */}
      <div className="flex flex-col gap-2 mb-4">
        <h2 className="font-montserrat text-2xl font-black uppercase tracking-tight text-white">
          {currentExercise?.name}
        </h2>
        <div className="flex flex-wrap gap-2">
          {currentDay?.targetMuscles?.map((muscle, mIdx) => (
            <span key={mIdx} className="px-3 py-1 bg-[#121215] border border-[#27272A] rounded-full font-mono text-[10px] text-[#A1A1AA] uppercase">
              {muscle}
            </span>
          )) || (
            <span className="px-3 py-1 bg-[#121215] border border-[#27272A] rounded-full font-mono text-[10px] text-[#A1A1AA] uppercase">
              Compound Movement
            </span>
          )}
        </div>
      </div>

      {/* AI Form Tip */}
      <div className="bg-[#121215] border border-[#D0FF00]/30 rounded-2xl p-4 flex gap-3 items-start relative overflow-hidden backdrop-blur-sm mb-6 shadow-[0_0_20px_rgba(208,255,0,0.05)]">
        <div className="absolute top-0 left-0 w-16 h-16 bg-[#D0FF00]/10 blur-xl rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
        <div className="p-2 bg-[#050505] border border-[#D0FF00]/50 rounded-xl shrink-0 z-10 text-[#D0FF00]">
          <span className="material-symbols-outlined text-[20px]">electric_bolt</span>
        </div>
        <div className="flex flex-col gap-1 z-10">
          <h3 className="font-mono text-[11px] font-bold text-[#D0FF00] uppercase tracking-wider">
            FitAI Coaching Guidance
          </h3>
          <p className="font-inter text-xs text-[#A1A1AA] leading-relaxed">
            {currentExercise?.notes || "Maintain steady tempo, focus on mind-muscle connection, and explode on the concentric phase."}
          </p>
        </div>
      </div>

      {/* Rest Timer Banner */}
      {restTimer !== null && (
        <div className="bg-[#D0FF00]/10 border border-[#D0FF00] rounded-2xl p-4 mb-6 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#D0FF00] text-2xl">timer</span>
            <div>
              <p className="font-mono text-[10px] text-[#A1A1AA] uppercase">Rest Timer</p>
              <h4 className="font-montserrat text-xl font-black text-[#D0FF00]">
                00:{restTimer < 10 ? `0${restTimer}` : restTimer}
              </h4>
            </div>
          </div>
          <button
            onClick={() => setRestTimer(null)}
            className="bg-[#D0FF00] text-[#050505] font-mono text-[10px] uppercase font-bold px-3 py-1.5 rounded-lg"
          >
            Skip Rest
          </button>
        </div>
      )}

      {/* Set Logger Table */}
      <div className="flex flex-col mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-mono text-xs text-white uppercase tracking-widest font-bold">
            Set Logs &amp; Progress
          </h3>
          <span className="font-mono text-[10px] text-[#A1A1AA]">
            {completedCount} of {sets.length} Completed
          </span>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-[36px_1fr_64px_64px_44px] gap-2 px-3 py-2 font-mono text-[10px] text-[#71717A] uppercase tracking-wider border-b border-[#27272A]">
          <div className="text-center">Set</div>
          <div>Target</div>
          <div className="text-center">KG</div>
          <div className="text-center">Reps</div>
          <div className="text-center">Done</div>
        </div>

        {/* Set Rows */}
        <div className="flex flex-col gap-2 mt-2">
          {sets.map((set) => (
            <div
              key={set.id}
              className={`grid grid-cols-[36px_1fr_64px_64px_44px] gap-2 items-center px-3 py-3 rounded-xl border transition-all ${
                set.completed
                  ? 'bg-[#121215]/60 border-[#27272A] opacity-70'
                  : set.active
                  ? 'bg-[#121215] border-[#D0FF00] shadow-[0_0_15px_rgba(208,255,0,0.1)]'
                  : 'bg-[#121215] border-[#27272A]'
              }`}
            >
              <div
                className={`text-center font-mono font-bold text-sm ${
                  set.completed || set.active ? 'text-[#D0FF00]' : 'text-[#71717A]'
                }`}
              >
                {set.id}
                {set.setType === 'warmup' && (
                  <span className="block text-[8px] text-[#EAB308] uppercase leading-none font-bold">Warm</span>
                )}
                {set.setType === 'peak' && (
                  <span className="block text-[8px] text-[#FF2E54] uppercase leading-none font-bold">Peak</span>
                )}
              </div>

              <div className="font-inter text-xs text-[#71717A] truncate">
                {set.prev}
              </div>

              {/* KG Input */}
              <input
                type="number"
                value={set.kg}
                disabled={set.completed}
                onChange={(e) => updateSet(set.id, 'kg', e.target.value)}
                className={`w-full bg-[#050505] border rounded-lg text-center font-montserrat font-bold text-sm py-1.5 outline-none transition-colors ${
                  set.completed
                    ? 'border-transparent text-[#A1A1AA]'
                    : 'border-[#27272A] text-white focus:border-[#D0FF00]'
                }`}
              />

              {/* Reps Input */}
              <input
                type="number"
                value={set.reps}
                disabled={set.completed}
                onChange={(e) => updateSet(set.id, 'reps', e.target.value)}
                className={`w-full bg-[#050505] border rounded-lg text-center font-montserrat font-bold text-sm py-1.5 outline-none transition-colors ${
                  set.completed
                    ? 'border-transparent text-[#A1A1AA]'
                    : 'border-[#27272A] text-white focus:border-[#D0FF00]'
                }`}
              />

              {/* Completion Checkbox Button */}
              <div className="flex justify-center">
                <button
                  onClick={() => toggleSetComplete(set.id)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                    set.completed
                      ? 'bg-[#D0FF00] text-[#050505] shadow-[0_0_10px_rgba(208,255,0,0.4)]'
                      : 'bg-[#050505] border border-[#27272A] text-[#71717A] hover:border-[#D0FF00]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px] font-bold">
                    {set.completed ? 'check' : 'radio_button_unchecked'}
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Set Button */}
        <button
          onClick={addSet}
          className="mt-3 py-3 flex items-center justify-center gap-2 text-[#A1A1AA] hover:text-white transition-colors border border-dashed border-[#27272A] hover:border-[#D0FF00] rounded-xl hover:bg-[#121215]"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span className="font-mono text-xs uppercase tracking-wider">Add Set</span>
        </button>
      </div>

      {/* Bottom Action: Finish Workout */}
      <button
        onClick={() => setWorkoutFinished(true)}
        className="w-full bg-[#D0FF00] text-[#050505] font-montserrat font-black text-base uppercase tracking-wider py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-[#b8d300] transition-transform active:scale-[0.98] shadow-[0_0_25px_rgba(208,255,0,0.25)]"
      >
        FINISH WORKOUT
        <span className="material-symbols-outlined">flag</span>
      </button>

      {/* Workout Completed Modal */}
      {workoutFinished && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-5">
          <div className="w-full max-w-sm bg-[#121215] border border-[#D0FF00]/40 rounded-3xl p-6 text-center relative shadow-[0_0_40px_rgba(208,255,0,0.2)]">
            <div className="w-16 h-16 bg-[#D0FF00]/10 border border-[#D0FF00] rounded-full flex items-center justify-center mx-auto mb-4 text-[#D0FF00]">
              <span className="material-symbols-outlined text-4xl">emoji_events</span>
            </div>
            <span className="font-mono text-xs text-[#D0FF00] uppercase font-bold tracking-widest block mb-1">
              SESSION COMPLETE
            </span>
            <h2 className="font-montserrat text-2xl font-black uppercase text-white mb-2">
              Beast Status Verified
            </h2>
            <p className="font-inter text-xs text-[#A1A1AA] mb-6">
              You completed your {currentDay?.shortTitle || currentDay?.dayName || 'session'} with maximum intensity!
            </p>

            {/* Quick Summary Grid */}
            <div className="grid grid-cols-3 gap-2 bg-[#050505] border border-[#27272A] rounded-2xl p-4 mb-6">
              <div>
                <p className="font-mono text-[9px] text-[#71717A] uppercase">Sets</p>
                <h4 className="font-montserrat text-lg font-bold text-white">{completedCount}</h4>
              </div>
              <div>
                <p className="font-mono text-[9px] text-[#71717A] uppercase">Volume</p>
                <h4 className="font-montserrat text-lg font-bold text-[#D0FF00]">{totalVolume} kg</h4>
              </div>
              <div>
                <p className="font-mono text-[9px] text-[#71717A] uppercase">XP Earned</p>
                <h4 className="font-montserrat text-lg font-bold text-[#FF2E54]">+150 XP</h4>
              </div>
            </div>

            <button
              onClick={() => router.push('/dashboard')}
              className="w-full bg-[#D0FF00] text-[#050505] font-montserrat font-extrabold text-sm uppercase tracking-wider py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-[#b8d300] transition-colors"
            >
              RETURN TO DASHBOARD
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WorkoutsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050505] flex items-center justify-center text-[#D0FF00] font-mono">Loading Workout Session...</div>}>
      <WorkoutSessionContent />
    </Suspense>
  );
}
