import { NextRequest, NextResponse } from 'next/server';
import { JWTService } from '@/lib/jwt';
import { JWTPayload } from '@/types';

export interface AuthenticatedRequest extends NextRequest {
  user: JWTPayload;
}

export function withAuth(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>,
  options: { requireAdmin?: boolean } = {}
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      const authHeader = req.headers.get('authorization');
      const token = JWTService.getTokenFromRequest(authHeader || '');

      if (!token) {
        return NextResponse.json(
          { success: false, error: 'Authorization token required' },
          { status: 401 }
        );
      }

      const decoded = JWTService.verifyToken(token);
      if (!decoded) {
        return NextResponse.json(
          { success: false, error: 'Invalid or expired token' },
          { status: 401 }
        );
      }

      // Check admin requirement
      if (options.requireAdmin && decoded.role !== 'admin') {
        return NextResponse.json(
          { success: false, error: 'Admin access required' },
          { status: 403 }
        );
      }

      // Add user info to request
      const authenticatedReq = req as AuthenticatedRequest;
      authenticatedReq.user = decoded;

      return await handler(authenticatedReq);
    } catch (error) {
      console.error('Authentication middleware error:', error);
      return NextResponse.json(
        { success: false, error: 'Authentication failed' },
        { status: 500 }
      );
    }
  };
}

export function withOptionalAuth(
  handler: (req: NextRequest, user?: JWTPayload) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      const authHeader = req.headers.get('authorization');
      const token = JWTService.getTokenFromRequest(authHeader || '');

      let user: JWTPayload | undefined;
      if (token) {
        user = JWTService.verifyToken(token) || undefined;
      }

      return await handler(req, user);
    } catch (error) {
      console.error('Optional auth middleware error:', error);
      return await handler(req);
    }
  };
}