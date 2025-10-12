// Common types and interfaces used across the application

export interface KPIData {
  totalSales: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
  salesGrowth: number;
  ordersGrowth: number;
  usersGrowth: number;
  revenueGrowth: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    fill?: boolean;
  }[];
}

export interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
  sales: number;
}

export interface CategoryData {
  category: string;
  sales: number;
  revenue: number;
  percentage: number;
}

export interface RecentTransaction {
  id: string;
  orderNumber: string;
  customerName: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  date: Date;
  paymentMethod: string;
}

export interface NotificationData {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

export interface UserRole {
  role: 'admin' | 'viewer';
  permissions: string[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterParams {
  startDate?: string;
  endDate?: string;
  category?: string;
  status?: string;
  region?: string;
  searchTerm?: string;
}

// Socket.io event types
export interface SocketEvents {
  // Client to server events
  'join-dashboard': () => void;
  'leave-dashboard': () => void;
  
  'new-sale': (sale: any) => void;
  'new-order': (order: any) => void;
  'kpi-update': (kpiData: KPIData) => void;
  'chart-update': (chartData: ChartData) => void;
  'notification': (notification: NotificationData) => void;
  'user-count-update': (count: number) => void;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  role?: 'admin' | 'viewer';
}

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'viewer';
  isActive: boolean;
  lastLogin: Date;
}

export interface JWTPayload {
  id: string;
  email: string;
  role: 'admin' | 'viewer';
  iat: number;
  exp: number;
}

export interface DashboardSettings {
  theme: 'light' | 'dark';
  refreshInterval: number; // in seconds
  showNotifications: boolean;
  autoRefresh: boolean;
  defaultDateRange: '24h' | '7d' | '30d' | '90d' | '1y';
}


export interface ExportOptions {
  format: 'csv' | 'xlsx' | 'pdf';
  dateRange: {
    start: Date;
    end: Date;
  };
  includeCharts: boolean;
  sections: string[];
}

// Threshold settings for notifications
export interface ThresholdSettings {
  lowStock: number;
  highRevenue: number;
  lowSales: number;
  failedPayments: number;
}

export default {};