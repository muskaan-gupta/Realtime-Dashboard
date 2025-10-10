import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Sales, Order, User } from '@/models';
import { withOptionalAuth } from '@/lib/auth-middleware';

// GET /api/analytics/kpis - Get key performance indicators
async function getKPIs(req: NextRequest, user?: any) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || '30'; // days
    const startDate = new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000);
    const previousStartDate = new Date(startDate.getTime() - parseInt(period) * 24 * 60 * 60 * 1000);

    // Current period aggregations
    const [
      currentSales,
      currentOrders,
      currentUsers,
      previousSales,
      previousOrders,
      previousUsers
    ] = await Promise.all([
      // Current period sales
      Sales.aggregate([
        { $match: { saleDate: { $gte: startDate }, paymentStatus: 'completed' } },
        { 
          $group: { 
            _id: null, 
            totalSales: { $sum: 1 },
            totalRevenue: { $sum: '$totalAmount' }
          } 
        }
      ]),
      
      // Current period orders
      Order.aggregate([
        { $match: { orderDate: { $gte: startDate } } },
        { 
          $group: { 
            _id: null, 
            totalOrders: { $sum: 1 }
          } 
        }
      ]),
      
      // Current period users
      User.countDocuments({ 
        createdAt: { $gte: startDate },
        isActive: true 
      }),
      
      // Previous period sales (for growth calculation)
      Sales.aggregate([
        { 
          $match: { 
            saleDate: { $gte: previousStartDate, $lt: startDate },
            paymentStatus: 'completed'
          } 
        },
        { 
          $group: { 
            _id: null, 
            totalSales: { $sum: 1 },
            totalRevenue: { $sum: '$totalAmount' }
          } 
        }
      ]),
      
      // Previous period orders
      Order.aggregate([
        { $match: { orderDate: { $gte: previousStartDate, $lt: startDate } } },
        { 
          $group: { 
            _id: null, 
            totalOrders: { $sum: 1 }
          } 
        }
      ]),
      
      // Previous period users
      User.countDocuments({ 
        createdAt: { $gte: previousStartDate, $lt: startDate },
        isActive: true 
      })
    ]);

    // Extract values with defaults
    const currentSalesData = currentSales[0] || { totalSales: 0, totalRevenue: 0 };
    const currentOrdersData = currentOrders[0] || { totalOrders: 0 };
    const previousSalesData = previousSales[0] || { totalSales: 0, totalRevenue: 0 };
    const previousOrdersData = previousOrders[0] || { totalOrders: 0 };

    // Calculate growth percentages
    const calculateGrowth = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    const kpiData = {
      totalSales: currentSalesData.totalSales,
      totalOrders: currentOrdersData.totalOrders,
      totalUsers: currentUsers,
      totalRevenue: currentSalesData.totalRevenue,
      salesGrowth: calculateGrowth(currentSalesData.totalSales, previousSalesData.totalSales),
      ordersGrowth: calculateGrowth(currentOrdersData.totalOrders, previousOrdersData.totalOrders),
      usersGrowth: calculateGrowth(currentUsers, previousUsers),
      revenueGrowth: calculateGrowth(currentSalesData.totalRevenue, previousSalesData.totalRevenue)
    };

    return NextResponse.json({
      success: true,
      data: kpiData
    });

  } catch (error) {
    console.error('KPIs fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = withOptionalAuth(getKPIs);