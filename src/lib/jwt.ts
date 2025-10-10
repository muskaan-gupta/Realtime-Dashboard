import jwt from 'jsonwebtoken';
import { AuthUser, JWTPayload } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export class JWTService {
  static generateToken(user: AuthUser): string {
    const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    } as jwt.SignOptions);
  }

  static verifyToken(token: string): JWTPayload | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
      return decoded;
    } catch (error) {
      console.error('JWT verification failed:', error);
      return null;
    }
  }

  static refreshToken(token: string): string | null {
    try {
      const decoded = this.verifyToken(token);
      if (!decoded) return null;

      // Check if token is close to expiry (within 1 day)
      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = decoded.exp - now;
      const oneDayInSeconds = 24 * 60 * 60;

      if (timeUntilExpiry < oneDayInSeconds) {
        // Generate new token
        const user: AuthUser = {
          id: decoded.id,
          email: decoded.email,
          role: decoded.role,
          username: '', // Will be filled from database
          isActive: true,
          lastLogin: new Date()
        };
        return this.generateToken(user);
      }

      return token; // Token still valid
    } catch (error) {
      console.error('Token refresh failed:', error);
      return null;
    }
  }

  static getTokenFromRequest(authHeader?: string): string | null {
    if (!authHeader) return null;
    
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
    
    return parts[1];
  }
}