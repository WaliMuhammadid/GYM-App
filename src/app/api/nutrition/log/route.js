import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/mongodb';
import NutritionLog from '@/models/NutritionLog';

// POST - Log a meal
export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { userId, dishName, amount, unit, calories, protein, carbs, fats } = body;

    if (!userId || !dishName) {
      return NextResponse.json({ error: 'userId and dishName required' }, { status: 400 });
    }

    const today = new Date().toISOString().split('T')[0];

    let log = await NutritionLog.findOne({ userId, date: today });

    const meal = { dishName, amount, unit, calories, protein, carbs, fats, loggedAt: new Date() };

    if (log) {
      log.meals.push(meal);
      log.dailyTotals.calories += calories;
      log.dailyTotals.protein += protein;
      log.dailyTotals.carbs += carbs;
      log.dailyTotals.fats += fats;
      await log.save();
    } else {
      log = await NutritionLog.create({
        userId,
        date: today,
        meals: [meal],
        dailyTotals: { calories, protein, carbs, fats },
      });
    }

    return NextResponse.json({ message: 'Meal logged successfully', log });
  } catch (error) {
    console.error('Error logging meal:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET - Get nutrition logs
export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    const log = await NutritionLog.findOne({ userId, date });

    return NextResponse.json({
      log: log || { meals: [], dailyTotals: { calories: 0, protein: 0, carbs: 0, fats: 0 } },
    });
  } catch (error) {
    console.error('Error fetching logs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
