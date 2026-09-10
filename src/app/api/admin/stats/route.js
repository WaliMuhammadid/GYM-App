import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Payment from '@/models/Payment';

export async function GET() {
  try {
    await dbConnect();

    const totalMembers = await User.countDocuments({ role: 'member' });
    const activeMembers = await User.countDocuments({ role: 'member', feeStatus: 'paid', isBlocked: false });
    const overdueMembers = await User.countDocuments({ role: 'member', $or: [{ feeStatus: 'overdue' }, { isBlocked: true }] });

    // Calculate revenue from payments
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const monthlyPayments = await Payment.aggregate([
      { $match: { createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const totalRevenue = monthlyPayments.length > 0 ? monthlyPayments[0].total : 0;

    // Total overdue amount
    const overdueUsers = await User.find({ role: 'member', feeStatus: 'overdue' }).select('fee');
    const overdueAmount = overdueUsers.reduce((sum, u) => sum + (u.fee || 0), 0);

    // Recent payments
    const recentPayments = await Payment.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'name plan');

    // Weekly revenue (last 4 weeks)
    const weeklyRevenue = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i + 1) * 7);
      const weekEnd = new Date(now);
      weekEnd.setDate(now.getDate() - i * 7);

      const weekPayments = await Payment.aggregate([
        { $match: { createdAt: { $gte: weekStart, $lt: weekEnd } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]);

      weeklyRevenue.push({
        week: `W${4 - i}`,
        amount: weekPayments.length > 0 ? weekPayments[0].total : 0,
      });
    }

    return NextResponse.json({
      totalRevenue,
      totalMembers,
      activeMembers,
      overdueMembers,
      overdueAmount,
      recentPayments,
      weeklyRevenue,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
