import { NextResponse } from 'next/server';
import { calculateNutrition } from '@/data/foodDatabase';
import dbConnect from '@/lib/mongodb';
import NutritionLog from '@/models/NutritionLog';

export async function POST(request) {
  try {
    const body = await request.json();
    const { query, message, dishName, amount, unit, userId, autoLog } = body;

    const naturalQuery = query || message;

    const apiKey = process.env.GEMINI_API_KEY;

    // CASE 1: Natural language query (e.g. "ek plate nihari with 2 naan")
    if (naturalQuery) {
      if (!apiKey || apiKey === 'placeholder-add-your-key') {
        return NextResponse.json({
          found: false,
          error: 'Gemini API key is not configured.',
        }, { status: 500 });
      }

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{
              text: 'You are an elite fitness nutritionist AI for the BeastFit gym app. Analyze the meal described in English, Urdu, or Roman Urdu (e.g. "ek plate nihari with 2 naan", "2 anda paratha", "chicken biryani with raita"). Provide accurate, realistic estimations for calories, protein, carbs, and fats. Respond ONLY with a single valid JSON object (no markdown formatting, no backticks) with these exact keys: "mealName" (clean capitalized string), "description" (1-2 sentences helpful fitness advice on this meal), "calories" (integer), "protein" (integer grams), "carbs" (integer grams), "fats" (integer grams), "breakdown" (array of strings showing each item with its approximate macros).'
            }]
          },
          contents: [{ role: 'user', parts: [{ text: naturalQuery }] }]
        })
      });

      const data = await res.json();
      console.log('Gemini Meal Response Status:', res.status, JSON.stringify(data));

      if (data.candidates && data.candidates.length > 0) {
        let aiText = data.candidates[0].content.parts[0].text.trim();
        if (aiText.startsWith('```json')) {
          aiText = aiText.substring(7, aiText.length - 3).trim();
        } else if (aiText.startsWith('```')) {
          aiText = aiText.substring(3, aiText.length - 3).trim();
        }

        const aiResult = JSON.parse(aiText);

        const calculated = {
          found: true,
          dishName: aiResult.mealName || naturalQuery,
          description: aiResult.description || 'Nutritional breakdown computed with AI.',
          calories: Math.round(Number(aiResult.calories) || 0),
          protein: Math.round(Number(aiResult.protein) || 0),
          carbs: Math.round(Number(aiResult.carbs) || 0),
          fats: Math.round(Number(aiResult.fats) || 0),
          breakdown: aiResult.breakdown || [],
          amount: 1,
          unit: 'meal',
          message: `FitAI calculated macros for "${aiResult.mealName}".`
        };

        // If autoLog is requested and userId provided, automatically save to DB
        if (autoLog && userId) {
          try {
            await dbConnect();
            const today = new Date().toISOString().split('T')[0];
            let log = await NutritionLog.findOne({ userId, date: today });
            const mealItem = {
              dishName: calculated.dishName,
              amount: 1,
              unit: 'meal',
              calories: calculated.calories,
              protein: calculated.protein,
              carbs: calculated.carbs,
              fats: calculated.fats,
              loggedAt: new Date()
            };

            if (log) {
              log.meals.push(mealItem);
              log.dailyTotals.calories += calculated.calories;
              log.dailyTotals.protein += calculated.protein;
              log.dailyTotals.carbs += calculated.carbs;
              log.dailyTotals.fats += calculated.fats;
              await log.save();
            } else {
              log = await NutritionLog.create({
                userId,
                date: today,
                meals: [mealItem],
                dailyTotals: {
                  calories: calculated.calories,
                  protein: calculated.protein,
                  carbs: calculated.carbs,
                  fats: calculated.fats
                }
              });
            }
            calculated.isLogged = true;
          } catch (dbErr) {
            console.error('Error auto-logging meal:', dbErr);
          }
        }

        return NextResponse.json(calculated);
      } else {
        return NextResponse.json({ error: 'AI failed to process meal query' }, { status: 500 });
      }
    }

    // CASE 2: Single dish name + amount (from barcode scanner or form)
    if (!dishName) {
      return NextResponse.json({ error: 'Query or dishName required' }, { status: 400 });
    }

    let amountInGrams = parseFloat(amount || 100);
    const unitLower = (unit || 'g').toLowerCase();

    const unitConversions = {
      'g': 1,
      'gram': 1,
      'grams': 1,
      'kg': 1000,
      'oz': 28.35,
      'lb': 453.6,
      'cup': 240,
      'plate': 350,
      'bowl': 300,
      'piece': 100,
      'slice': 60,
      'serving': 200,
      'glass': 250,
      'ml': 1,
      'liter': 1000,
      'litre': 1000,
      'tablespoon': 15,
      'teaspoon': 5,
    };

    const conversionFactor = unitConversions[unitLower] || 1;
    amountInGrams = amountInGrams * conversionFactor;

    let result = calculateNutrition(dishName, amountInGrams);

    if (!result && apiKey && apiKey !== 'placeholder-add-your-key') {
      try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: 'You are a nutrition expert API. Respond ONLY with a valid JSON object (no markdown, no backticks) with keys: "calories" (number), "protein" (number), "carbs" (number), "fats" (number). Estimate for the given food and grams.' }]
            },
            contents: [{ role: 'user', parts: [{ text: `Analyze nutrition for ${amountInGrams}g of ${dishName}` }] }]
          })
        });

        const data = await res.json();
        if (data.candidates && data.candidates.length > 0) {
          let aiText = data.candidates[0].content.parts[0].text.trim();
          if (aiText.startsWith('```json')) {
            aiText = aiText.substring(7, aiText.length - 3).trim();
          } else if (aiText.startsWith('```')) {
            aiText = aiText.substring(3, aiText.length - 3).trim();
          }
          const aiResult = JSON.parse(aiText);

          return NextResponse.json({
            found: true,
            dishName: dishName,
            amount: amountInGrams,
            unit: 'g',
            calories: Math.round(aiResult.calories),
            protein: Math.round(aiResult.protein),
            carbs: Math.round(aiResult.carbs),
            fats: Math.round(aiResult.fats),
            message: `AI estimated nutrition for "${dishName}" (${amountInGrams}g).`,
          });
        }
      } catch (e) {
        console.error('Gemini API Error in nutrition calculator:', e);
      }
    }

    if (result) {
      return NextResponse.json({
        found: true,
        ...result,
        message: `Nutrition calculated for ${result.dishName} (${amountInGrams}g)`,
      });
    }

    const estimatedCals = Math.round(amountInGrams * 1.5);
    return NextResponse.json({
      found: false,
      dishName: dishName,
      amount: amountInGrams,
      unit: 'g',
      calories: estimatedCals,
      protein: Math.round(estimatedCals * 0.15 / 4),
      carbs: Math.round(estimatedCals * 0.5 / 4),
      fats: Math.round(estimatedCals * 0.35 / 9),
      message: `Rough mathematical estimate for "${dishName}".`,
    });
  } catch (error) {
    console.error('Nutrition analysis error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
