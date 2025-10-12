'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/context/AuthContext';
import { KPIData, NotificationData, RecentTransaction } from '@/types';

interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: number;
  notifications: NotificationData[];
  clearNotifications: () => void;
}

interface SocketEvents {
  connected: (data: { message: string; userId: string; role: string }) => void;
  'new-sale': (saleData: any) => void;
  'new-order': (orderData: any) => void;
  'kpi-update': (kpiData: KPIData) => void;
  'chart-update': (chartData: any) => void;
  'notification': (notification: NotificationData) => void;
  'user-count-update': (count: number) => void;
  'admin-message': (message: any) => void;
}

export function useSocket(): UseSocketReturn {
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  useEffect(() => {
    if (!user) {
      // Disconnect if user is not authenticated
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    // Initialize socket connection
    const socket = io({
      auth: {
        token: token
      },
      transports: ['websocket', 'polling']
    });

    socketRef.current = socket;

   
    socket.on('connect', () => {
      setIsConnected(true);
      console.log(' Connected to Socket.io server');
      
      // Join dashboard room
      socket.emit('join-dashboard');
    });

    socket.on('disconnect', (reason) => {
      setIsConnected(false);
      console.log('Disconnected from Socket.io server:', reason);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });

    // Dashboard event handlers
    socket.on('connected', (data) => {
      console.log(' Server confirmed connection:', data);
    });

    socket.on('user-count-update', (count: number) => {
      setOnlineUsers(count);
    });

    socket.on('notification', (notification: NotificationData) => {
      setNotifications(prev => [notification, ...prev.slice(0, 9)]); // Keep last 10
    });

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.emit('leave-dashboard');
        socket.disconnect();
      }
    };
  }, [user]);

  const clearNotifications = () => {
    setNotifications([]);
  };

  return {
    socket: socketRef.current,
    isConnected,
    onlineUsers,
    notifications,
    clearNotifications
  };
}

export function useSocketEvent<T = any>(
  socket: Socket | null,
  eventName: keyof SocketEvents,
  handler?: (data: T) => void
) {
  useEffect(() => {
    if (!socket || !handler) return;

    socket.on(eventName as string, handler);

    return () => {
      socket.off(eventName as string, handler);
    };
  }, [socket, eventName, handler]);
}

export function useSocketEmit(socket: Socket | null) {
  const emit = (eventName: string, data?: any) => {
    if (socket && socket.connected) {
      socket.emit(eventName, data);
    }
  };

  return { emit, isConnected: socket?.connected || false };
}