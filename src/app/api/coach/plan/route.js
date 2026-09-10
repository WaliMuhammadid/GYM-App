import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import WorkoutPlan from '@/models/WorkoutPlan';
import ChatMessage from '@/models/ChatMessage';

export async function POST(request) {
  try {
    await dbConnect();
    const { 
      userId, 
      weight, 
      height, 
      age, 
      goal, 
      experienceLevel, 
      lastTrained, 
      injuries, 
      daysPerWeek 
    } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const daysCount = Number(daysPerWeek) || 4;
    const userGoal = goal || 'Muscle Gain & Hypertrophy';
    const userExp = experienceLevel || 'Beginner (Pehli Baar)';
    const userLastTrained = lastTrained || 'Never';
    const userInjuries = injuries || 'None';
    const userWeight = weight || '75 kg';
    const userHeight = height || '5 ft 9 in';

    const apiKey = process.env.GEMINI_API_KEY;
    let generatedPlanData = null;

    if (apiKey && apiKey !== 'placeholder-add-your-key') {
      try {
        const prompt = `You are FitAI Coach, an elite biomechanics and strength conditioning AI engine for BeastFit.
Create a high-performance, strictly personalized ${daysCount}-Day weekly workout split for this athlete:
- Bodyweight: ${userWeight}
- Height: ${userHeight}
- Age: ${age || '24'}
- Primary Goal: ${userGoal}
- Gym Background / Experience Level: ${userExp}
- Last Time In Gym: ${userLastTrained}
- Past Injuries / Medical Limitations: ${userInjuries}
- Available Training Days: ${daysCount} Days Per Week

CRITICAL WEIGHT CALIBRATION & PROGRESSION RULES:
1. Ground every exercise's weight (targetKg) strictly in the user's experience level (${userExp}) and last training date (${userLastTrained}):
   - If Beginner / Never trained: Starting weights MUST be light to moderate (e.g. 20-30 kg Barbell Bench Press, 10-14 kg Dumbbells, 30-40 kg Lat Pulldowns, 50-60 kg Leg Press). Prioritize 3 sets of 10-12 reps with controlled tempo.
   - If Returning after break (3-12 months): Leverage muscle memory with conservative re-adaptation weights (e.g. 40-50 kg Bench, 45-55 kg Rows, 80 kg Leg Press) across 3-4 sets.
   - If Intermediate / Currently active: Prescribe progressive overload pyramid sets (e.g., Set 1: 50kg x 10, Set 2: 60kg x 8, Set 3: 65kg x 8, Set 4: 70kg x 6).
   - If Advanced (2+ years): Prescribe heavy compound sets (e.g., 70-100 kg Bench, 120-160 kg Leg Press) with pyramid intensity.

2. INJURY & SAFETY PROTOCOL:
   If user reports any injury (${userInjuries}), replace dangerous high-impact exercises with safe biomechanical alternatives (e.g., replace back squats with leg press/split squats for lower back or knee pain; avoid overhead barbell behind neck for shoulders).

OUTPUT IN STRICT RAW JSON ONLY. No markdown backticks, no markdown hashes, no commentary. Just a valid JSON object matching this schema:
{
  "splitName": "${daysCount}-Day ${userExp} ${userGoal} Program",
  "aiNotes": "Concise 1-2 sentence medical caution and starting weight progression advice explaining why these weights were chosen for their background.",
  "days": [
    {
      "dayNumber": 1,
      "dayName": "Day 1: Upper Body Strength & Hypertrophy",
      "shortTitle": "Upper Body",
      "targetMuscles": ["Chest", "Back", "Shoulders"],
      "estimatedDuration": 45,
      "exercises": [
        {
          "name": "Barbell Bench Press",
          "sets": 4,
          "reps": "8-10",
          "startingWeight": "40 kg",
          "restTime": 90,
          "notes": "Keep shoulder blades retracted and elbows tucked at 45 degrees.",
          "detailedSets": [
            { "setNumber": 1, "targetKg": 30, "reps": 12, "setType": "warmup" },
            { "setNumber": 2, "targetKg": 35, "reps": 10, "setType": "working" },
            { "setNumber": 3, "targetKg": 40, "reps": 8, "setType": "working" },
            { "setNumber": 4, "targetKg": 40, "reps": 8, "setType": "peak" }
          ]
        }
      ]
    }
  ]
}
Ensure exactly ${daysCount} days are generated. Each day must contain 4 to 5 exercises, and EVERY exercise MUST contain the 'detailedSets' array with realistic specific integer 'targetKg' and 'reps' numbers!`;

        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              role: 'user',
              parts: [{ text: prompt }]
            }],
            generationConfig: {
              responseMimeType: 'application/json'
            }
          }),
        });

        const data = await res.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          try {
            const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
            generatedPlanData = JSON.parse(cleaned);
          } catch (pe) {
            console.error('Error parsing Gemini JSON plan:', pe, rawText);
          }
        }
      } catch (geminiError) {
        console.error('Gemini API call failed for workout plan:', geminiError);
      }
    }

    // Fallback safe plan if API call fails or offline
    if (!generatedPlanData || !generatedPlanData.days || generatedPlanData.days.length === 0) {
      const isBeginner = userExp.toLowerCase().includes('beginner') || userLastTrained.toLowerCase().includes('never');
      const baseBench = isBeginner ? 30 : 50;
      const baseRow = isBeginner ? 25 : 45;
      const baseLeg = isBeginner ? 60 : 100;

      generatedPlanData = {
        splitName: `${daysCount}-Day ${userExp} Routine`,
        aiNotes: `Weights calibrated for ${userExp} status (Last trained: ${userLastTrained}). Injury focus: ${userInjuries}.`,
        days: Array.from({ length: daysCount }).map((_, i) => ({
          dayNumber: i + 1,
          dayName: i % 2 === 0 ? `Day ${i + 1}: Upper Body Strength` : `Day ${i + 1}: Lower Body & Core`,
          shortTitle: i % 2 === 0 ? 'Upper Body' : 'Lower Body',
          targetMuscles: i % 2 === 0 ? ['Chest', 'Back', 'Shoulders'] : ['Quads', 'Hamstrings', 'Abs'],
          estimatedDuration: 50,
          exercises: [
            { 
              name: i % 2 === 0 ? 'Barbell Bench Press' : 'Leg Press Machine', 
              sets: 4, 
              reps: '8-10', 
              startingWeight: `${i % 2 === 0 ? baseBench : baseLeg} kg`, 
              restTime: 90, 
              notes: 'Focus on strict controlled tempo and mind-muscle connection.',
              detailedSets: [
                { setNumber: 1, targetKg: (i % 2 === 0 ? baseBench - 10 : baseLeg - 20), reps: 12, setType: 'warmup' },
                { setNumber: 2, targetKg: (i % 2 === 0 ? baseBench : baseLeg), reps: 10, setType: 'working' },
                { setNumber: 3, targetKg: (i % 2 === 0 ? baseBench + 5 : baseLeg + 10), reps: 8, setType: 'working' },
                { setNumber: 4, targetKg: (i % 2 === 0 ? baseBench + 5 : baseLeg + 10), reps: 8, setType: 'peak' },
              ]
            },
            { 
              name: i % 2 === 0 ? 'Chest-Supported Row' : 'Romanian Deadlift', 
              sets: 3, 
              reps: '10-12', 
              startingWeight: `${i % 2 === 0 ? baseRow : baseRow + 15} kg`, 
              restTime: 75, 
              notes: 'Keep spine neutral to protect back.',
              detailedSets: [
                { setNumber: 1, targetKg: baseRow, reps: 12, setType: 'working' },
                { setNumber: 2, targetKg: baseRow + 5, reps: 10, setType: 'working' },
                { setNumber: 3, targetKg: baseRow + 5, reps: 10, setType: 'working' },
              ]
            },
            { 
              name: i % 2 === 0 ? 'Dumbbell Lateral Raises' : 'Seated Leg Curls', 
              sets: 3, 
              reps: '12-15', 
              startingWeight: isBeginner ? '6 kg DBs' : '10 kg DBs', 
              restTime: 60, 
              notes: 'Strict form, no swinging.',
              detailedSets: [
                { setNumber: 1, targetKg: isBeginner ? 6 : 8, reps: 15, setType: 'working' },
                { setNumber: 2, targetKg: isBeginner ? 6 : 10, reps: 12, setType: 'working' },
                { setNumber: 3, targetKg: isBeginner ? 8 : 10, reps: 12, setType: 'working' },
              ]
            },
            { 
              name: i % 2 === 0 ? 'Tricep Rope Pushdowns' : 'Hanging Knee Raises', 
              sets: 3, 
              reps: '12-15', 
              startingWeight: '20 kg', 
              restTime: 60, 
              notes: 'Full contraction at bottom.',
              detailedSets: [
                { setNumber: 1, targetKg: 20, reps: 15, setType: 'working' },
                { setNumber: 2, targetKg: 22.5, reps: 12, setType: 'working' },
                { setNumber: 3, targetKg: 25, reps: 10, setType: 'working' },
              ]
            },
          ],
        })),
      };
    }

    // Ensure every exercise has detailedSets if Gemini missed it for any exercise
    generatedPlanData.days.forEach(day => {
      day.exercises.forEach(ex => {
        if (!ex.detailedSets || ex.detailedSets.length === 0) {
          const numSets = Number(ex.sets) || 3;
          const numKg = parseInt(ex.startingWeight) || 20;
          const numReps = parseInt(ex.reps) || 10;
          ex.detailedSets = Array.from({ length: numSets }).map((_, sIdx) => ({
            setNumber: sIdx + 1,
            targetKg: Math.max(5, numKg + (sIdx === 0 ? -5 : sIdx * 2.5)),
            reps: Math.max(6, numReps - sIdx),
            setType: sIdx === 0 ? 'warmup' : 'working',
          }));
        }
      });
    });

    // 1. Mark existing plans inactive
    await WorkoutPlan.updateMany({ userId }, { isActive: false });

    // 2. Save new active plan
    const newPlan = await WorkoutPlan.create({
      userId,
      profile: {
        weight: userWeight,
        height: userHeight,
        age: age || '24',
        goal: userGoal,
        experienceLevel: userExp,
        lastTrained: userLastTrained,
        injuries: userInjuries,
        daysPerWeek: daysCount,
      },
      splitName: generatedPlanData.splitName || `${daysCount}-Day Customized Split`,
      days: generatedPlanData.days,
      aiNotes: generatedPlanData.aiNotes || 'Engineered by FitAI Engine.',
      isActive: true,
    });

    // 3. Post summary message to Coach Chat
    const coachMessage = `Mubarak ho! Aapka personalized **${newPlan.splitName}** ban chuka hai.\n\n` +
      `**Aapki Profile:**\n` +
      `* Experience: ${userExp} | Last Trained: ${userLastTrained}\n` +
      `* Weight: ${userWeight} | Height: ${userHeight}\n` +
      `* Goal: ${userGoal}\n` +
      `* Medical / Injury Focus: ${userInjuries}\n` +
      `* Gym Frequency: ${daysCount} Days / Week\n\n` +
      `**AI Weights Calibration:** ${newPlan.aiNotes}\n\n` +
      `Har exercise ke progressive weights aur sets calculate ho chuke hain aur **Dashboard** par live update hogaye hain!`;

    await ChatMessage.create({
      userId,
      role: 'ai',
      content: coachMessage,
    });

    return NextResponse.json({ success: true, plan: newPlan });
  } catch (error) {
    console.error('Error generating workout plan:', error);
    return NextResponse.json({ error: 'Failed to generate workout plan' }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const plan = await WorkoutPlan.findOne({ userId, isActive: true }).sort({ createdAt: -1 });

    return NextResponse.json({ plan });
  } catch (error) {
    console.error('Error fetching workout plan:', error);
    return NextResponse.json({ error: 'Failed to fetch workout plan' }, { status: 500 });
  }
}
