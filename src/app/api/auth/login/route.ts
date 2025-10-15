import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { JWTService } from '@/lib/jwt';
import { LoginCredentials } from '@/types';

export async function POST(req: NextRequest) {
  try {
    console.log('Login attempt started');
    
    // Add timeout for database connection
    const connectTimeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Database connection timeout')), 10000)
    );
    
    console.log('Connecting to database...');
    await Promise.race([connectDB(), connectTimeout]);
    console.log('Database connected');

    console.log('Parsing request body...');
    const body: LoginCredentials = await req.json();
    const { email, password } = body;
    console.log('Login attempt for email:', email);

    if (!email || !password) {
      console.log('Missing email or password');
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    console.log('Searching for user...');

    const user = await User.findOne({ email }).select('+password');
    console.log('👤 User found:', user ? 'Yes' : 'No');
    
    if (!user || !user.isActive) {
      console.log('User not found or inactive');
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    console.log('Checking password...');

    const isPasswordValid = await user.comparePassword(password);
    console.log('Password valid:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('Invalid password');
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    await User.updateOne(
      { _id: user._id }, 
      { $set: { lastLogin: new Date() } }
    );

    const token = JWTService.generateToken({
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      lastLogin: user.lastLogin
    });

    const userData = {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      lastLogin: user.lastLogin
    };

    return NextResponse.json({
      success: true,
      data: {
        user: userData,
        token
      },
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Login error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      name: error instanceof Error ? error.name : 'Unknown error type'
    });
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}