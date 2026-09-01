import { Router, Response } from 'express';
import prisma from '../prisma';
import { authenticate, AuthRequest } from '../middlewares/auth';

const router = Router();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent';

// Smart contextual fitness response generator for fallback
function generateSmartFitnessResponse(query: string, user: any): string {
  const q = query.toLowerCase();
  const name = user?.name || 'Athlete';
  const proteinTarget = user?.dailyProteinTarget || 180;
  const calTarget = user?.dailyCalorieTarget || 2400;

  const hasWord = (words: string[]) => words.some(w => new RegExp(`\\b${w}\\b`, 'i').test(q));

  if (hasWord(['chest', 'bench', 'push', 'pecs'])) {
    return `For **Chest hypertrophy & strength**, focus on 3 key movements: Flat Barbell/Dumbbell Bench (heavy 6-8 reps), Incline Dumbbell Press (8-10 reps for upper pec shelf), and Cable Flyes (12-15 reps with 2s squeeze).`;
  }
  if (hasWord(['back', 'pull', 'deadlift', 'row', 'lats'])) {
    return `To build a **dense, V-taper back**, prioritize Barbell Rows (pulling to belly button for lats), Weighted Pull-ups/Lat Pulldowns (full stretch at top), and Chest-Supported Rows.`;
  }
  if (hasWord(['leg', 'legs', 'squat', 'quad', 'hamstring', 'calves'])) {
    return `For optimal **Leg Development**, combine heavy compound squats (depth below parallel) with Romanian Deadlifts for posterior chain. Add Bulgarian Split Squats and seated calf raises.`;
  }
  if (hasWord(['hi', 'hello', 'hey', 'help'])) {
    return `Hey ${name}! I'm your FitAI Coach. I can build custom workout routines, guide exercise form, calculate exact meal macros, or create recovery plans. What's your main fitness goal right now?`;
  }

  return `Great question, ${name}! Maintain progressive overload and hit your daily goal of **${proteinTarget}g protein**. What specific routine or exercise are you focusing on today?`;
}

// POST /api/coach/chat
router.post('/chat', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { message } = req.body;

    if (!message) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    // Save user message to DB
    await prisma.coachMessage.create({
      data: { userId: userId!, role: 'user', content: message }
    });

    // Fetch user context
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    let aiText = '';

    if (GEMINI_API_KEY) {
      try {
        const history = await prisma.coachMessage.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 6,
        });
        history.reverse();

        // Fetch user's existing routines for context
        const userRoutines = await prisma.routine.findMany({
          where: { userId },
          include: { exercises: { include: { exercise: true }, orderBy: { order: 'asc' } } }
        });

        const routineContext = userRoutines.map(r => 
          `Routine: "${r.name}"\nExercises: ${r.exercises.map(e => `${e.exercise.name} (${e.targetSets} sets x ${e.targetReps} reps)`).join(', ')}`
        ).join('\n\n');

        const now = new Date();
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const currentDayName = days[now.getDay()];
        const currentDate = now.toLocaleDateString();

        const systemText = `You are FitAI Coach in BEAST-FIT AI. Keep answers punchy, expert, motivating.
User Name: ${user?.name || 'Athlete'}
Current Date: ${currentDate}
Current Day of Week: ${currentDayName}
User's Current Workout Routines:
${routineContext || 'No routines setup yet.'}

INSTRUCTIONS:
1. Creating a workout plan is a sensitive and critical task. NEVER guess or assume the user's details. If the user asks for a new workout plan, you MUST strictly ask ALL of the following details before creating it:
   - Current weight and fitness goal (e.g., muscle gain, fat loss).
   - How many days per week they can exercise.
   - Any injuries or physical limitations.
   If the user misses any of these details in their reply, specifically ask the missing questions again. DO NOT generate the plan until you have explicit answers to all of these.
2. Once you have all the required context, design a personalized workout plan and MUST CALL the 'save_workout_plan' tool to save it. Name the routines clearly with the day (e.g. "Monday - Chest", "Tuesday - Back").
3. If the user asks what their exercise is for today, look at the Current Day of Week and their Current Workout Routines. If they have a routine with today's name, tell them exactly what exercises are in it.
4. Keep standard responses to max 3-4 sentences.`;

        const contents: any[] = [
          { role: 'user', parts: [{ text: systemText }] },
          { role: 'model', parts: [{ text: 'Ready! Let\'s train hard and fuel right.' }] }
        ];

        history.forEach(m => {
          contents.push({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }]
          });
        });

        const tools = [{
          functionDeclarations: [{
            name: "save_workout_plan",
            description: "Saves a new workout plan for the user. Overwrites all existing routines.",
            parameters: {
              type: "OBJECT",
              properties: {
                routines: {
                  type: "ARRAY",
                  items: {
                    type: "OBJECT",
                    properties: {
                      name: { type: "STRING", description: "Name of routine (e.g. 'Monday - Upper Body')" },
                      exercises: {
                        type: "ARRAY",
                        items: {
                          type: "OBJECT",
                          properties: {
                            name: { type: "STRING" },
                            muscleGroup: { type: "STRING" },
                            sets: { type: "INTEGER" },
                            reps: { type: "INTEGER" }
                          },
                          required: ["name", "muscleGroup", "sets", "reps"]
                        }
                      }
                    },
                    required: ["name", "exercises"]
                  }
                }
              },
              required: ["routines"]
            }
          }]
        }];

        const requestBody = {
          contents,
          tools,
          generationConfig: { temperature: 0.7, maxOutputTokens: 4096 }
        };

        const geminiRes = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        });

        const geminiData = await geminiRes.json();
        
        console.log('--- GEMINI RESPONSE ---');
        console.log(JSON.stringify(geminiData, null, 2));
        console.log('-----------------------');

        if (geminiData?.error) {
          console.error('Gemini API Response Error:', geminiData.error);
        }

        // Check for function call across all parts
        const parts = geminiData?.candidates?.[0]?.content?.parts || [];
        const functionCallPart = parts.find((p: any) => p.functionCall);
        const functionCall = functionCallPart?.functionCall;
        
        if (functionCall && functionCall.name === 'save_workout_plan') {
          console.log('Function call triggered:', functionCall.name);
          const planRoutines = functionCall.args.routines;
          
          // Delete old routines to replace them
          const oldRoutines = await prisma.routine.findMany({ where: { userId } });
          const oldIds = oldRoutines.map(r => r.id);
          
          if (oldIds.length > 0) {
            await prisma.workoutSession.updateMany({
              where: { routineId: { in: oldIds } },
              data: { routineId: null }
            });
            await prisma.routineExercise.deleteMany({
              where: { routineId: { in: oldIds } }
            });
            await prisma.routine.deleteMany({
              where: { id: { in: oldIds } }
            });
          }

          // Create new routines
          for (const r of planRoutines) {
            const createdRoutine = await prisma.routine.create({
              data: { userId: userId!, name: r.name }
            });
            let order = 1;
            for (const ex of r.exercises) {
              let dbEx = await prisma.exercise.findUnique({ where: { name: ex.name } });
              if (!dbEx) {
                dbEx = await prisma.exercise.create({
                  data: { name: ex.name, muscleGroup: ex.muscleGroup || 'General' }
                });
              }
              await prisma.routineExercise.create({
                data: {
                  routineId: createdRoutine.id,
                  exerciseId: dbEx.id,
                  targetSets: ex.sets,
                  targetReps: ex.reps,
                  order: order++
                }
              });
            }
          }

          // Trigger a second API call to get a conversational response
          contents.push(geminiData.candidates[0].content); // model's functionCall
          contents.push({
            role: 'user',
            parts: [{
              functionResponse: {
                name: "save_workout_plan",
                response: { success: true, message: "Routines successfully saved to the database!" }
              }
            }]
          });

          const secondRes = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents, tools, generationConfig: { temperature: 0.7 } })
          });
          const secondData = await secondRes.json();
          const secondParts = secondData?.candidates?.[0]?.content?.parts || [];
          const secondTextPart = secondParts.find((p: any) => p.text);
          aiText = secondTextPart?.text?.trim() || 'Your custom workout plan is ready and saved to your profile!';
        } else {
          // Normal text response
          const textPart = parts.find((p: any) => p.text);
          aiText = textPart?.text?.trim() || '';
        }
      } catch (geminiErr) {
        console.error('Gemini call failed:', geminiErr);
      }
    }

    if (!aiText) {
      aiText = generateSmartFitnessResponse(message, user);
    }

    // Save AI response to DB
    const aiMessage = await prisma.coachMessage.create({
      data: { userId: userId!, role: 'assistant', content: aiText }
    });

    res.json({
      message: {
        id: aiMessage.id,
        role: 'assistant',
        content: aiText,
        createdAt: aiMessage.createdAt,
      }
    });
  } catch (error) {
    console.error('Coach chat error:', error);
    res.status(500).json({ error: 'Failed to process coach message' });
  }
});

// GET /api/coach/history
router.get('/history', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const messages = await prisma.coachMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      take: 50,
    });
    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

export default router;
