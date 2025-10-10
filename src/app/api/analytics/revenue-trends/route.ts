import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Sales, Order } from '@/models';
import { withOptionalAuth } from '@/lib/auth-middleware';

// GET /api/analytics/revenue-trends - Get revenue trends over time
async function getRevenueTrends(req: NextRequest, user?: any) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || '30'; // days
    const granularity = searchParams.get('granularity') || 'daily'; // daily, weekly, monthly
    
    const days = parseInt(period);
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    let groupBy: any;
    let dateFormat: string;

    // Set up grouping based on granularity
    switch (granularity) {
      case 'weekly':
        groupBy = {
          year: { $year: '$saleDate' },
          week: { $week: '$saleDate' }
        };
        dateFormat = 'Week %U %Y';
        break;
      case 'monthly':
        groupBy = {
          year: { $year: '$saleDate' },
          month: { $month: '$saleDate' }
        };
        dateFormat = '%Y-%m';
        break;
      default: // daily
        groupBy = {
          year: { $year: '$saleDate' },
          month: { $month: '$saleDate' },
          day: { $dayOfMonth: '$saleDate' }
        };
        dateFormat = '%Y-%m-%d';
    }

    const revenueData = await Sales.aggregate([
      {
        $match: {
          saleDate: { $gte: startDate },
          paymentStatus: 'completed'
        }
      },
      {
        $group: {
          _id: groupBy,
          revenue: { $sum: '$totalAmount' },
          sales: { $sum: 1 },
          orders: { $sum: 1 } // For this example, treating each sale as an order
        }
      },
      {
        $addFields: {
          date: {
            $dateFromParts: {
              year: '$_id.year',
              month: '$_id.month',
              day: '$_id.day'
            }
          }
        }
      },
      {
        $sort: { date: 1 }
      },
      {
        $project: {
          _id: 0,
          date: { $dateToString: { format: dateFormat, date: '$date' } },
          revenue: 1,
          sales: 1,
          orders: 1
        }
      }
    ]);

    // Fill in missing dates with zero values
    const filledData = fillMissingDates(revenueData, startDate, new Date(), granularity);

    return NextResponse.json({
      success: true,
      data: filledData
    });

  } catch (error) {
    console.error('Revenue trends fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function fillMissingDates(data: any[], startDate: Date, endDate: Date, granularity: string) {
  const filledData = [];
  const dataMap = new Map(data.map(item => [item.date, item]));
  
  let currentDate = new Date(startDate);
  const end = new Date(endDate);

  while (currentDate <= end) {
    let dateKey: string;
    
    switch (granularity) {
      case 'weekly':
        const year = currentDate.getFullYear();
        const week = getWeekNumber(currentDate);
        dateKey = `Week ${week.toString().padStart(2, '0')} ${year}`;
        currentDate.setDate(currentDate.getDate() + 7);
        break;
      case 'monthly':
        dateKey = currentDate.toISOString().slice(0, 7); // YYYY-MM
        currentDate.setMonth(currentDate.getMonth() + 1);
        break;
      default: // daily
        dateKey = currentDate.toISOString().slice(0, 10); // YYYY-MM-DD
        currentDate.setDate(currentDate.getDate() + 1);
    }

    const existingData = dataMap.get(dateKey);
    filledData.push({
      date: dateKey,
      revenue: existingData?.revenue || 0,
      sales: existingData?.sales || 0,
      orders: existingData?.orders || 0
    });
  }

  return filledData;
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

export const GET = withOptionalAuth(getRevenueTrends);