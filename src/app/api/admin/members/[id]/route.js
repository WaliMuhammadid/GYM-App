import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

// GET - Get single member
export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const member = await User.findById(id).select('-password');

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    return NextResponse.json({ member });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update member
export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    const updateData = { ...body };

    // If password is being updated, hash it
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 12);
    } else {
      delete updateData.password;
    }

    // Don't allow role change through this endpoint
    delete updateData.role;

    const member = await User.findByIdAndUpdate(id, updateData, { new: true }).select('-password');

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Member updated successfully', member });
  } catch (error) {
    console.error('Error updating member:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete member
export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;

    const member = await User.findByIdAndDelete(id);

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Member deleted successfully' });
  } catch (error) {
    console.error('Error deleting member:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Toggle block status
export async function PATCH(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;

    const member = await User.findById(id);
    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    member.isBlocked = !member.isBlocked;
    await member.save();

    return NextResponse.json({
      message: member.isBlocked ? 'Member blocked' : 'Member unblocked',
      isBlocked: member.isBlocked,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
