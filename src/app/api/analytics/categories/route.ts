import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Sales } from '@/models';
import { withOptionalAuth } from '@/lib/auth-middleware';

// GET /api/analytics/categories - Get sales data by product category
async function getCategoryAnalytics(req: NextRequest, user?: any) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || '30'; // days
    const startDate = new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000);

    const categoryData = await Sales.aggregate([
      {
        $match: {
          saleDate: { $gte: startDate },
          paymentStatus: 'completed'
        }
      },
      {
        $group: {
          _id: '$productCategory',
          sales: { $sum: 1 },
          revenue: { $sum: '$totalAmount' },
          quantity: { $sum: '$quantity' }
        }
      },
      {
        $project: {
          _id: 0,
          category: '$_id',
          sales: 1,
          revenue: 1,
          quantity: 1
        }
      },
      {
        $sort: { revenue: -1 }
      }
    ]);

    // Calculate total revenue for percentage calculation
    const totalRevenue = categoryData.reduce((sum, item) => sum + item.revenue, 0);

    // Add percentage to each category
    const categoryDataWithPercentage = categoryData.map(item => ({
      ...item,
      percentage: totalRevenue > 0 ? (item.revenue / totalRevenue) * 100 : 0
    }));

    return NextResponse.json({
      success: true,
      data: categoryDataWithPercentage
    });

  } catch (error) {
    console.error('Category analytics fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = withOptionalAuth(getCategoryAnalytics);