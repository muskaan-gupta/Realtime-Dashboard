import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Sales } from '@/models';
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware';

// GET /api/sales/[id] - Get sale by ID
async function getSale(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;

    const sale = await Sales.findById(id);
    if (!sale) {
      return NextResponse.json(
        { success: false, error: 'Sale not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: sale
    });

  } catch (error) {
    console.error('Sale fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/sales/[id] - Update sale (Admin only)
async function updateSale(req: AuthenticatedRequest) {
  try {
    await connectDB();
    // Extract ID from URL pathname
    const pathname = req.nextUrl.pathname;
    const id = pathname.split('/').pop();
    const body = await req.json();

    const sale = await Sales.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true
    });

    if (!sale) {
      return NextResponse.json(
        { success: false, error: 'Sale not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: sale,
      message: 'Sale updated successfully'
    });

  } catch (error: any) {
    console.error('Sale update error:', error);
    
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

// DELETE /api/sales/[id] - Delete sale (Admin only)
async function deleteSale(req: AuthenticatedRequest) {
  try {
    await connectDB();
    // Extract ID from URL pathname
    const pathname = req.nextUrl.pathname;
    const id = pathname.split('/').pop();

    const sale = await Sales.findByIdAndDelete(id);
    if (!sale) {
      return NextResponse.json(
        { success: false, error: 'Sale not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Sale deleted successfully'
    });

  } catch (error) {
    console.error('Sale deletion error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = getSale;
export const PUT = withAuth(updateSale, { requireAdmin: true });
export const DELETE = withAuth(deleteSale, { requireAdmin: true });