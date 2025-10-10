import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { User } from '@/models';
import { JWTService } from '@/lib/jwt';
import { RegisterData } from '@/types';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body: RegisterData = await req.json();
    const { username, email, password, role = 'viewer' } = body;

    // Validate input
    if (!username || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Username, email, and password are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      const field = existingUser.email === email ? 'email' : 'username';
      return NextResponse.json(
        { success: false, error: `User with this ${field} already exists` },
        { status: 409 }
      );
    }

    // Create new user
    const user = new User({
      username,
      email,
      password, // Will be hashed by the pre-save middleware
      role
    });

    await user.save();

    // Generate JWT token
    const token = JWTService.generateToken({
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      lastLogin: user.lastLogin
    });

    // Return user data (without password)
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
      message: 'Registration successful'
    }, { status: 201 });

  } catch (error: any) {
    console.error('Registration error:', error);
    
    // Handle MongoDB validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { success: false, error: validationErrors.join(', ') },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}