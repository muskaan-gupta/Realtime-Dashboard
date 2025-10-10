import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Sales } from '@/models';
import { withAuth, withOptionalAuth } from '@/lib/auth-middleware';

// GET /api/sales - Get all sales with pagination and filters
async function getSales(req: NextRequest, user?: any) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'saleDate';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const searchTerm = searchParams.get('searchTerm');

    // Build filter object
    const filter: any = {};
    
    if (category) filter.productCategory = category;
    if (status) filter.paymentStatus = status;
    if (startDate && endDate) {
      filter.saleDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    if (searchTerm) {
      filter.$or = [
        { customerName: { $regex: searchTerm, $options: 'i' } },
        { productName: { $regex: searchTerm, $options: 'i' } },
        { orderId: { $regex: searchTerm, $options: 'i' } }
      ];
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get sales with pagination
    const [sales, totalCount] = await Promise.all([
      Sales.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Sales.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      data: {
        sales,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Sales fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/sales - Create new sale (Admin only)
async function createSale(req: NextRequest & { user: any }) {
  try {
    await connectDB();

    const body = await req.json();
    
    // Generate order ID if not provided
    if (!body.orderId) {
      body.orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    const sale = new Sales(body);
    await sale.save();

    // Emit socket event for real-time update (if socket server is available)
    try {
      // In a production app, you would get the socket server instance here
      // For now, we'll skip the socket emission as it requires the server setup
      console.log('New sale created:', sale._id);
      
      // You could also trigger a webhook or message queue here
      // to notify other services about the new sale
    } catch (socketError) {
      console.warn('Could not emit socket event:', socketError);
    }

    return NextResponse.json({
      success: true,
      data: sale,
      message: 'Sale created successfully'
    }, { status: 201 });

  } catch (error: any) {
    console.error('Sale creation error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { success: false, error: validationErrors.join(', ') },
        { status: 400 }
      );
    }

    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'Order ID already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = withOptionalAuth(getSales);
export const POST = withAuth(createSale, { requireAdmin: true });