import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Order } from '@/models';
import { withAuth, withOptionalAuth } from '@/lib/auth-middleware';

// GET /api/orders - Get all orders with pagination and filters
async function getOrders(req: NextRequest, user?: any) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'orderDate';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const status = searchParams.get('status');
    const paymentStatus = searchParams.get('paymentStatus');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const searchTerm = searchParams.get('searchTerm');

    // Build filter object
    const filter: any = {};
    
    if (status) filter.orderStatus = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (startDate && endDate) {
      filter.orderDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    if (searchTerm) {
      filter.$or = [
        { customerName: { $regex: searchTerm, $options: 'i' } },
        { customerEmail: { $regex: searchTerm, $options: 'i' } },
        { orderNumber: { $regex: searchTerm, $options: 'i' } },
        { trackingNumber: { $regex: searchTerm, $options: 'i' } }
      ];
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get orders with pagination
    const [orders, totalCount] = await Promise.all([
      Order.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      data: {
        orders,
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
    console.error('Orders fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/orders - Create new order (Admin only)
async function createOrder(req: NextRequest & { user: any }) {
  try {
    await connectDB();

    const body = await req.json();
    
    // Generate order number if not provided
    if (!body.orderNumber) {
      body.orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // Generate customer ID if not provided
    if (!body.customerId) {
      body.customerId = `CUST-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    const order = new Order(body);
    await order.save();

    return NextResponse.json({
      success: true,
      data: order,
      message: 'Order created successfully'
    }, { status: 201 });

  } catch (error: any) {
    console.error('Order creation error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { success: false, error: validationErrors.join(', ') },
        { status: 400 }
      );
    }

    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'Order number already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = withOptionalAuth(getOrders);
export const POST = withAuth(createOrder, { requireAdmin: true });