import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { User } from '@/lib/models/User';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const { walletAddress, email, termsAgreed } = await request.json();

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    let user = await User.findOne({ walletAddress });
    
    if (!user) {
      user = await User.create({
        walletAddress,
        points: 0,
        email: email || null,
        termsAgreed: termsAgreed || false,
        termsAgreedAt: termsAgreed ? new Date() : null,
      });
    } else {
      if (email !== undefined) {
        user.email = email;
      }
      
      if (termsAgreed !== undefined) {
        user.termsAgreed = termsAgreed;
        if (termsAgreed) {
          user.termsAgreedAt = new Date();
        }
      }

      user.updatedAt = new Date();
      await user.save();
    }
    return NextResponse.json({ 
      success: true, 
      data: { 
        walletAddress: user.walletAddress,
        email: user.email,
        termsAgreed: user.termsAgreed,
        termsAgreedAt: user.termsAgreedAt,
        points: user.points 
      } 
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user information' },
      { status: 500 }
    );
  }
}

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
    const user = await User.findOne({ walletAddress });

    if (!user) {
      return NextResponse.json(
        { success: false, data: null, termsAgreed: false },
        { status: 404 }
      );
    }
    return NextResponse.json({ 
      success: true, 
      data: { 
        walletAddress: user.walletAddress,
        email: user.email,
        termsAgreed: user.termsAgreed,
        termsAgreedAt: user.termsAgreedAt,
        points: user.points 
      } 
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user information' },
      { status: 500 }
    );
  }
}