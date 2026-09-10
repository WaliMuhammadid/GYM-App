import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

// GET - List all members
export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all';
    const search = searchParams.get('search') || '';

    let query = { role: 'member' };

    if (filter === 'active') {
      query.feeStatus = 'paid';
      query.isBlocked = false;
    } else if (filter === 'overdue') {
      query.$or = [{ feeStatus: 'overdue' }, { isBlocked: true }];
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const members = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });

    const totalMembers = await User.countDocuments({ role: 'member' });
    const activeMembers = await User.countDocuments({ role: 'member', feeStatus: 'paid', isBlocked: false });
    const overdueMembers = await User.countDocuments({ role: 'member', $or: [{ feeStatus: 'overdue' }, { isBlocked: true }] });

    return NextResponse.json({
      members,
      stats: { total: totalMembers, active: activeMembers, overdue: overdueMembers },
    });
  } catch (error) {
    console.error('Error fetching members:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Add new member
export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { name, email, password, phone, plan, fee, durationMonths } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email and password are required' }, { status: 400 });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists with this email' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const now = new Date();
    const expiry = new Date(now);
    expiry.setMonth(expiry.getMonth() + (durationMonths || 1));

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone: phone || '',
      role: 'member',
      plan: plan || 'Basic',
      fee: fee || 0,
      feeStatus: 'paid',
      feeDueDate: expiry,
      membershipExpiry: expiry,
    });

    return NextResponse.json({
      message: 'Member added successfully',
      member: {
        id: user._id,
        name: user.name,
        email: user.email,
        plan: user.plan,
        membershipExpiry: user.membershipExpiry,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Error adding member:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
