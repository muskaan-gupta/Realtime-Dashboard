import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    console.log('Test endpoint started');
    
    console.log('Connecting to database...');
    await connectDB();
    console.log('Database connected');

    console.log('Testing User model...');
    const userCount = await User.countDocuments();
    console.log('User count:', userCount);

    console.log('Finding admin user...');
    const adminUser = await User.findOne({ email: 'admin@demo.com' });
    console.log('Admin user found:', adminUser ? 'Yes' : 'No');
    
    if (adminUser) {
      console.log('Admin user details:', {
        id: adminUser._id,
        email: adminUser.email,
        role: adminUser.role,
        isActive: adminUser.isActive
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        userCount,
        adminExists: !!adminUser,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Test endpoint error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}