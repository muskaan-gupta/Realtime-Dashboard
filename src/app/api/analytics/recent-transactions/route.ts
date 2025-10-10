import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Sales, Order } from '@/models';
import { withOptionalAuth } from '@/lib/auth-middleware';

// GET /api/analytics/recent-transactions - Get recent transactions
async function getRecentTransactions(req: NextRequest, user?: any) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    // Get recent sales (treating them as transactions)
    const recentTransactions = await Sales.find({})
      .sort({ saleDate: -1 })
      .limit(limit)
      .select('orderId customerName totalAmount paymentStatus saleDate paymentMethod')
      .lean();

    // Transform the data to match the expected format
    const formattedTransactions = recentTransactions.map(transaction => ({
      id: (transaction._id as string | number | { toString(): string }).toString(),
      orderNumber: transaction.orderId,
      customerName: transaction.customerName,
      amount: transaction.totalAmount,
      status: transaction.paymentStatus,
      date: transaction.saleDate,
      paymentMethod: transaction.paymentMethod
    }));

    return NextResponse.json({
      success: true,
      data: formattedTransactions
    });

  } catch (error) {
    console.error('Recent transactions fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = withOptionalAuth(getRecentTransactions);