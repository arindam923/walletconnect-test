import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { User } from '@/lib/models/User';
import { BurnRecord } from '@/lib/models/BurnRecord';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('walletAddress');

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    let user = await User.findOne({ walletAddress });

    if (!user) {
      const burnRecords = await BurnRecord.find({ walletAddress });
      const totalPoints = burnRecords.reduce(
        (sum, record) => sum + (record.pointsReceived || 0),
        0
      );

      user = await User.create({
        walletAddress,
        points: totalPoints,
      });
    }

    return NextResponse.json({ 
      success: true, 
      data: { 
        walletAddress: user.walletAddress,
        points: user.points 
      } 
    });
  } catch (error) {
    console.error('Error fetching user points:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user points' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const { walletAddress, points, action } = await request.json();

    if (!walletAddress || points === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    let user = await User.findOne({ walletAddress });
    
    if (!user) {
      user = await User.create({
        walletAddress,
        points: 0,
      });
    }

    if (action === 'add') {
      user.points += points;
    } else {
      user.points = points;
    }

    user.updatedAt = new Date();
    await user.save();

    return NextResponse.json({ 
      success: true, 
      data: { 
        walletAddress: user.walletAddress,
        points: user.points 
      } 
    });
  } catch (error) {
    console.error('Error updating user points:', error);
    return NextResponse.json(
      { error: 'Failed to update user points' },
      { status: 500 }
    );
  }
}