import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

// Seed script - creates admin user and sample members
export async function GET() {
  try {
    await dbConnect();

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      return NextResponse.json({ message: 'Seed already completed. Admin exists.', adminEmail: existingAdmin.email });
    }

    const hashedPassword = await bcrypt.hash('admin123', 12);

    // Create admin
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@beastfit.com',
      password: hashedPassword,
      role: 'admin',
      phone: '03001234567',
    });

    // Create sample members
    const memberPassword = await bcrypt.hash('member123', 12);
    const now = new Date();

    const sampleMembers = [
      {
        name: 'Alex Mercer', email: 'alex@test.com', password: memberPassword,
        phone: '03111111111', plan: 'Gold', fee: 3000, feeStatus: 'paid',
        membershipExpiry: new Date(now.getTime() + 24 * 24 * 60 * 60 * 1000),
        stats: { heartRate: 72, steps: 6240, sleep: 7.5, streak: 14 },
        level: 18, xp: 3450, rank: 'Iron Warrior',
        calorieTarget: 2400, proteinTarget: 180,
      },
      {
        name: 'Sarah Malik', email: 'sarah@test.com', password: memberPassword,
        phone: '03222222222', plan: 'Gold', fee: 3000, feeStatus: 'pending',
        feeDueDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000),
        membershipExpiry: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000),
        stats: { heartRate: 68, steps: 8100, sleep: 8, streak: 7 },
        level: 12, xp: 2100, rank: 'Silver Warrior',
      },
      {
        name: 'John Doe', email: 'john@test.com', password: memberPassword,
        phone: '03333333333', plan: 'Basic', fee: 2000, feeStatus: 'overdue',
        isBlocked: true,
        membershipExpiry: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
        stats: { heartRate: 78, steps: 3200, sleep: 6, streak: 0 },
        level: 5, xp: 800, rank: 'Beginner',
      },
      {
        name: 'Mike Ross', email: 'mike@test.com', password: memberPassword,
        phone: '03444444444', plan: 'Platinum', fee: 5000, feeStatus: 'paid',
        membershipExpiry: new Date(now.getTime() + 18 * 24 * 60 * 60 * 1000),
        stats: { heartRate: 65, steps: 10200, sleep: 8.5, streak: 30 },
        level: 25, xp: 5200, rank: 'Beast Mode',
      },
    ];

    await User.insertMany(sampleMembers);

    return NextResponse.json({
      message: 'Database seeded successfully!',
      admin: { email: 'admin@beastfit.com', password: 'admin123' },
      sampleMember: { email: 'alex@test.com', password: 'member123' },
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
