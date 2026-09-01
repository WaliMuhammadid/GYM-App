import { Router, Response } from 'express';
import prisma from '../prisma';
import { authenticate, AuthRequest } from '../middlewares/auth';

const router = Router();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Smart food macro estimator for local NLP
function estimateMacrosFromText(text: string) {
  const lower = text.toLowerCase();
  let calories = 0;
  let protein = 0;
  let carbs = 0;
  let fat = 0;

  // Keyword-based nutritional database
  const foodDatabase: { [key: string]: { cal: number; p: number; c: number; f: number } } = {
    egg: { cal: 75, p: 6.5, c: 0.5, f: 5 },
    chicken: { cal: 220, p: 38, c: 0, f: 5 },
    breast: { cal: 160, p: 32, c: 0, f: 3 },
    steak: { cal: 350, p: 40, c: 0, f: 20 },
    beef: { cal: 300, p: 32, c: 0, f: 18 },
    rice: { cal: 210, p: 4.5, c: 45, f: 0.5 },
    oat: { cal: 160, p: 6, c: 28, f: 3 },
    oatmeal: { cal: 160, p: 6, c: 28, f: 3 },
    toast: { cal: 90, p: 3, c: 15, f: 1.5 },
    bread: { cal: 90, p: 3, c: 15, f: 1.5 },
    avocado: { cal: 160, p: 2, c: 8, f: 15 },
    salmon: { cal: 280, p: 34, c: 0, f: 14 },
    fish: { cal: 200, p: 30, c: 0, f: 6 },
    shake: { cal: 180, p: 30, c: 6, f: 3 },
    protein: { cal: 140, p: 26, c: 3, f: 2 },
    whey: { cal: 130, p: 25, c: 2, f: 1.5 },
    banana: { cal: 105, p: 1.3, c: 27, f: 0.3 },
    apple: { cal: 95, p: 0.5, c: 25, f: 0.3 },
    milk: { cal: 150, p: 8, c: 12, f: 8 },
    almond: { cal: 160, p: 6, c: 6, f: 14 },
    peanut: { cal: 190, p: 8, c: 7, f: 16 },
    pasta: { cal: 240, p: 8, c: 45, f: 1.5 },
    potato: { cal: 160, p: 4, c: 37, f: 0.2 },
    broccoli: { cal: 50, p: 3.5, c: 10, f: 0.5 },
    salad: { cal: 80, p: 2, c: 8, f: 4 },
    burger: { cal: 550, p: 30, c: 40, f: 30 },
    pizza: { cal: 400, p: 16, c: 45, f: 18 },
    tuna: { cal: 150, p: 33, c: 0, f: 1 },
    yogurt: { cal: 130, p: 15, c: 8, f: 2 },
    greek: { cal: 140, p: 17, c: 6, f: 2 },
  };

  let matched = false;

  // Look for multiplier numbers (e.g. "3 eggs", "2 slices")
  for (const [key, val] of Object.entries(foodDatabase)) {
    if (lower.includes(key)) {
      matched = true;
      // Check if preceded by a number (1-9)
      const regex = new RegExp(`(\\d+)\\s*(?:slices?|cups?|pieces?|scoops?|g|grams?)?\\s*(?:of\\s*)?${key}`, 'i');
      const match = lower.match(regex);
      const count = match ? parseInt(match[1], 10) : 1;
      const multiplier = Math.min(Math.max(count, 1), 6);

      calories += val.cal * multiplier;
      protein += val.p * multiplier;
      carbs += val.c * multiplier;
      fat += val.f * multiplier;
    }
  }

  // Fallback defaults if no specific foods matched
  if (!matched || calories === 0) {
    calories = 450;
    protein = 30;
    carbs = 45;
    fat = 15;
  }

  return {
    calories: Math.round(calories),
    protein: Math.round(protein),
    carbs: Math.round(carbs),
    fat: Math.round(fat),
  };
}

// GET /api/nutrition
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const meals = await prisma.mealLog.findMany({
      where: {
        userId,
        loggedAt: { gte: startOfToday },
      },
      orderBy: { loggedAt: 'desc' },
    });

    const totals = meals.reduce((acc, m) => ({
      calories: acc.calories + (m.estimatedCalories || 0),
      protein: acc.protein + (m.estimatedProteinG || 0),
      carbs: acc.carbs + (m.estimatedCarbsG || 0),
      fat: acc.fat + (m.estimatedFatG || 0),
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

    res.json({ meals, totals });
  } catch (error) {
    console.error('Nutrition fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch nutrition data' });
  }
});

// POST /api/nutrition/log
router.post('/log', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { text, calories, protein, carbs, fat } = req.body;

    if (!text && !calories) {
      res.status(400).json({ error: 'Meal description or calories required' });
      return;
    }

    let estCalories = calories ? Number(calories) : 0;
    let estProtein = protein ? Number(protein) : 0;
    let estCarbs = carbs ? Number(carbs) : 0;
    let estFat = fat ? Number(fat) : 0;
    let aiNote: string | null = null;
    let isEstimate = true;

    // If text provided, calculate macros
    if (text && (!calories || !protein)) {
      // Try Gemini first if key is valid
      if (GEMINI_API_KEY && GEMINI_API_KEY.startsWith('AIzaSy')) {
        try {
          const prompt = `Estimate the nutritional content for this meal: "${text}". 
Respond ONLY with a JSON object in this exact format (no markdown, no backticks, just raw json):
{"calories": number, "protein": number, "carbs": number, "fat": number, "note": "brief summary"}`;

          const geminiRes = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.2, maxOutputTokens: 150 }
            })
          });

          const geminiData = await geminiRes.json();
          const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
          if (rawText) {
            const cleanJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(cleanJson);
            estCalories = parsed.calories || 0;
            estProtein = parsed.protein || 0;
            estCarbs = parsed.carbs || 0;
            estFat = parsed.fat || 0;
            aiNote = parsed.note || 'AI estimated';
          }
        } catch (err) {
          console.error('Gemini macro estimation error:', err);
        }
      }

      // If Gemini wasn't available or returned 0, use smart food keyword estimator
      if (!estCalories) {
        const estimated = estimateMacrosFromText(text);
        estCalories = estimated.calories;
        estProtein = estimated.protein;
        estCarbs = estimated.carbs;
        estFat = estimated.fat;
        aiNote = 'AI smart food engine';
      }
    } else {
      isEstimate = false;
    }

    const meal = await prisma.mealLog.create({
      data: {
        userId: userId!,
        rawInputText: text || 'Custom Meal',
        estimatedCalories: estCalories,
        estimatedProteinG: estProtein,
        estimatedCarbsG: estCarbs,
        estimatedFatG: estFat,
        aiConfidenceNote: aiNote,
        isEstimate,
      },
    });

    res.status(201).json(meal);
  } catch (error) {
    console.error('Meal log error:', error);
    res.status(500).json({ error: 'Failed to log meal' });
  }
});

// DELETE /api/nutrition/:id
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    await prisma.mealLog.deleteMany({
      where: { id, userId },
    });

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete meal' });
  }
});

export default router;
