import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    console.log('🌱 Seeding demo users...');
    
    await connectDB();
    console.log('Database connected');

    const demoUsers = [
      {
        username: 'admin',
        email: 'admin@demo.com',
        password: 'admin123',
        role: 'admin',
        isActive: true
      },
      {
        username: 'viewer', 
        email: 'viewer@demo.com',
        password: 'viewer123',
        role: 'viewer',
        isActive: true
      }
    ];

    const results = [];

    for (const userData of demoUsers) {
      console.log(`👤 Processing user: ${userData.email}`);
      
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      
      if (existingUser) {
        console.log(`User ${userData.email} already exists`);
        results.push({ email: userData.email, status: 'exists' });
      } else {
        console.log(`Creating user: ${userData.email}`);
        const newUser = new User(userData);
        await newUser.save();
        console.log(`Created user: ${userData.email}`);
        results.push({ email: userData.email, status: 'created' });
      }
    }

    console.log('Demo users setup completed');

    return NextResponse.json({
      success: true,
      message: 'Demo users setup completed',
      results,
      credentials: {
        admin: 'admin@demo.com / admin123',
        viewer: 'viewer@demo.com / viewer123'
      }
    });

  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Seeding failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return NextResponse.json({
    message: 'Use POST to seed demo users',
    usage: 'POST /api/seed to create demo users'
  });
}