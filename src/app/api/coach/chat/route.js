import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ChatMessage from '@/models/ChatMessage';

// Fallback demo responses if API key is not set
const demoResponses = [
  "Based on your training data, I recommend focusing on progressive overload this week. Try increasing your bench press by **+2.5 kg** for optimal stimulus. 💪",
  "Your recovery looks good! Muscle protein synthesis peaks 24-48 hours after training. Aim for **1.6-2.2g protein per kg** bodyweight daily. 🥩",
  "Great question! For fat loss while maintaining muscle, aim for a **300-500 calorie deficit**. Prioritize compound movements like squats and deadlifts. 🔥",
];

export async function POST(request) {
  try {
    await dbConnect();
    const { userId, message } = await request.json();

    if (!userId || !message) {
      return NextResponse.json({ error: 'userId and message required' }, { status: 400 });
    }

    // 1. Fetch previous conversation history for this user (up to last 16 turns)
    const pastMessages = await ChatMessage.find({ userId })
      .sort({ createdAt: -1 })
      .limit(16);
    
    // Reverse to chronological order (oldest to newest)
    pastMessages.reverse();

    // 2. Build multi-turn context for Gemini ensuring alternating 'user' and 'model'
    const contents = [];

    for (const msg of pastMessages) {
      const role = msg.role === 'ai' ? 'model' : 'user';
      if (!msg.content || !msg.content.trim()) continue;

      if (contents.length > 0 && contents[contents.length - 1].role === role) {
        // Consolidate consecutive turns with the same role
        contents[contents.length - 1].parts[0].text += '\n' + msg.content;
      } else {
        contents.push({
          role,
          parts: [{ text: msg.content }]
        });
      }
    }

    // Add current user prompt
    if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
      contents[contents.length - 1].parts[0].text += '\n' + message;
    } else {
      contents.push({
        role: 'user',
        parts: [{ text: message }]
      });
    }

    // Save current user message to database
    await ChatMessage.create({
      userId,
      role: 'user',
      content: message,
    });

    let aiResponse;
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && apiKey !== 'placeholder-add-your-key') {
      try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{
                text: 'You are FitAI Coach, an elite high-performance strength, combat fitness, and sports nutrition AI engine for BeastFit. You have access to the user\'s ongoing chat history. Always remember and ground your answers in what the user previously told you (e.g. their name, weight, height, sport/goals, past workout feedback). CRITICAL RULE: NEVER use markdown hash symbols (#, ##, ###, ####) anywhere in your response. Instead, write clean clear section titles (e.g. "Day 1: Push Day (Chest & Triceps)", "Workout Routine", "Actionable Rules"). List exercises in clean format: "Exercise Name: 3 Sets x 10-12 Reps". Use bullet points (*) and bold (**) for key metrics. Always provide an encouraging, professional experience. Respond warmly in Roman Urdu if the user writes in Roman Urdu or Urdu.'
              }]
            },
            contents: contents,
          }),
        });

        const data = await res.json();
        
        if (data.candidates && data.candidates.length > 0) {
          aiResponse = data.candidates[0].content.parts[0].text;
        } else {
          console.error('Gemini API Error in Coach:', data);
          aiResponse = demoResponses[Math.floor(Math.random() * demoResponses.length)];
        }
      } catch (e) {
        console.error('Fetch error:', e);
        aiResponse = demoResponses[Math.floor(Math.random() * demoResponses.length)];
      }
    } else {
      aiResponse = demoResponses[Math.floor(Math.random() * demoResponses.length)];
    }

    // Save AI response to database
    const aiMessage = await ChatMessage.create({
      userId,
      role: 'ai',
      content: aiResponse,
    });

    return NextResponse.json({ response: aiResponse, message: aiMessage });
  } catch (error) {
    console.error('Coach chat error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET - Fetch chat history
export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    const messages = await ChatMessage.find({ userId })
      .sort({ createdAt: 1 })
      .limit(50);

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Clear conversation history for user
export async function DELETE(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    await ChatMessage.deleteMany({ userId });
    return NextResponse.json({ message: 'Chat history cleared successfully' });
  } catch (error) {
    console.error('Error clearing chat history:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
