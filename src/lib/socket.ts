import { createServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { JWTService } from '@/lib/jwt';
import connectDB from '@/lib/mongodb';

export interface SocketWithAuth extends Socket {
  userId?: string;
  userRole?: 'admin' | 'viewer';
}

class SocketService {
  private static instance: SocketService;
  private io: SocketIOServer | null = null;
  private connectedUsers = new Map<string, { socketId: string; userId: string; role: string }>();

  static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  initialize(httpServer: any) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.NODE_ENV === 'production' 
          ? process.env.NEXTAUTH_URL 
          : ["http://localhost:3000", "http://localhost:3001"],
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    this.setupMiddleware();
    this.setupEventHandlers();
    
    console.log('✅ Socket.io server initialized');
  }

  private setupMiddleware() {
    if (!this.io) return;

    // Authentication middleware
    this.io.use((socket: any, next) => {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = JWTService.verifyToken(token);
      if (!decoded) {
        return next(new Error('Invalid token'));
      }

      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      next();
    });
  }

  private setupEventHandlers() {
    if (!this.io) return;

    this.io.on('connection', (socket: any) => {
      console.log(`🔗 User connected: ${socket.userId} (${socket.userRole})`);
      
      // Store user connection
      this.connectedUsers.set(socket.id, {
        socketId: socket.id,
        userId: socket.userId,
        role: socket.userRole
      });

      // Join dashboard room
      socket.on('join-dashboard', () => {
        socket.join('dashboard');
        console.log(`📊 User ${socket.userId} joined dashboard`);
        
        // Send current user count
        this.emitUserCount();
      });

      // Leave dashboard room
      socket.on('leave-dashboard', () => {
        socket.leave('dashboard');
        console.log(`🚪 User ${socket.userId} left dashboard`);
      });

      // Handle disconnection
      socket.on('disconnect', (reason: string) => {
        console.log(`❌ User disconnected: ${socket.userId} (${reason})`);
        this.connectedUsers.delete(socket.id);
        this.emitUserCount();
      });

      // Send welcome message
      socket.emit('connected', {
        message: 'Connected to real-time analytics',
        userId: socket.userId,
        role: socket.userRole
      });
    });
  }

  // Emit new sale to all dashboard users
  emitNewSale(saleData: any) {
    if (this.io) {
      this.io.to('dashboard').emit('new-sale', saleData);
      console.log('📈 New sale broadcasted to dashboard users');
    }
  }

  // Emit new order to all dashboard users
  emitNewOrder(orderData: any) {
    if (this.io) {
      this.io.to('dashboard').emit('new-order', orderData);
      console.log('🛒 New order broadcasted to dashboard users');
    }
  }

  // Emit KPI updates
  emitKPIUpdate(kpiData: any) {
    if (this.io) {
      this.io.to('dashboard').emit('kpi-update', kpiData);
      console.log('📊 KPI update broadcasted to dashboard users');
    }
  }

  // Emit chart updates
  emitChartUpdate(chartData: any) {
    if (this.io) {
      this.io.to('dashboard').emit('chart-update', chartData);
      console.log('📈 Chart update broadcasted to dashboard users');
    }
  }

  // Emit notifications
  emitNotification(notification: any, userId?: string) {
    if (this.io) {
      if (userId) {
        // Send to specific user
        const userConnection = Array.from(this.connectedUsers.values())
          .find(conn => conn.userId === userId);
        if (userConnection) {
          this.io.to(userConnection.socketId).emit('notification', notification);
        }
      } else {
        // Send to all dashboard users
        this.io.to('dashboard').emit('notification', notification);
      }
      console.log('🔔 Notification sent');
    }
  }

  // Emit user count update
  private emitUserCount() {
    if (this.io) {
      const dashboardUsers = this.io.sockets.adapter.rooms.get('dashboard')?.size || 0;
      this.io.to('dashboard').emit('user-count-update', dashboardUsers);
    }
  }

  // Get connected users count
  getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  // Get dashboard users count
  getDashboardUsersCount(): number {
    return this.io?.sockets.adapter.rooms.get('dashboard')?.size || 0;
  }

  // Broadcast system message to admins only
  emitAdminMessage(message: any) {
    if (this.io) {
      this.connectedUsers.forEach((conn, socketId) => {
        if (conn.role === 'admin') {
          this.io?.to(socketId).emit('admin-message', message);
        }
      });
      console.log('👑 Admin message broadcasted');
    }
  }
}

export default SocketService;