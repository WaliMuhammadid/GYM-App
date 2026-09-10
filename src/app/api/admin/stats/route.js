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

    // Calculate real paid revenue
    const paymentSum = await Payment.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const paidMembers = await User.find({ role: 'member', feeStatus: 'paid' }).select('fee');
    const membersFeeSum = paidMembers.reduce((sum, u) => sum + (u.fee || 0), 0);
    const totalRevenue = (paymentSum.length > 0 && paymentSum[0].total > 0) ? paymentSum[0].total : membersFeeSum;

    // Overdue amount
    const overdueUsers = await User.find({ role: 'member', feeStatus: 'overdue' }).select('fee');
    const overdueAmount = overdueUsers.reduce((sum, u) => sum + (u.fee || 0), 0);

    // Pending amount
    const pendingUsers = await User.find({ role: 'member', feeStatus: 'pending' }).select('fee');
    const pendingAmount = pendingUsers.reduce((sum, u) => sum + (u.fee || 0), 0);

    // Real recent transactions / registrations from MongoDB
    const dbPayments = await Payment.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .populate('userId', 'name plan email');

    let recentTransactions = [];
    if (dbPayments.length > 0) {
      recentTransactions = dbPayments.map(p => ({
        id: p._id.toString(),
        name: p.userId?.name || 'Athlete',
        email: p.userId?.email || '',
        plan: p.plan || p.userId?.plan || 'Standard',
        amount: p.amount,
        date: p.createdAt,
        status: 'paid'
      }));
    } else {
      const recentUsers = await User.find({ role: 'member' })
        .sort({ createdAt: -1 })
        .limit(6)
        .select('name email plan fee feeStatus createdAt');

      recentTransactions = recentUsers.map(u => ({
        id: u._id.toString(),
        name: u.name,
        email: u.email,
        plan: u.plan || 'Standard',
        amount: u.fee || 0,
        date: u.createdAt,
        status: u.feeStatus || 'pending'
      }));
    }

    // Real plan distribution from database
    const planBreakdown = await User.aggregate([
      { $match: { role: 'member' } },
      { $group: { _id: '$plan', count: { $sum: 1 }, revenue: { $sum: '$fee' } } },
      { $sort: { count: -1 } }
    ]);

    return NextResponse.json({
      totalRevenue,
      totalMembers,
      activeMembers,
      overdueMembers,
      overdueAmount,
      pendingAmount,
      recentPayments: recentTransactions,
      planBreakdown,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
