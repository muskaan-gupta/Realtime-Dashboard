'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSocketContext } from '@/context/SocketContext';
import { useSocketEvent } from '@/hooks/useSocket';
import Header from '@/components/Header';
import KPICards from '@/components/KPICards';
import RevenueChart from '@/components/RevenueChart';
import CategoryChart from '@/components/CategoryChart';
import RecentTransactions from '@/components/RecentTransactions';
import { NotificationCenter } from '@/components/Notifications';
import ProtectedRoute from '@/components/ProtectedRoute';
import { 
  KPIData, 
  RevenueData, 
  CategoryData, 
  RecentTransaction, 
  NotificationData 
} from '@/types';

export default function Dashboard() {
  const { user } = useAuth();
  const { socket, isConnected, onlineUsers, notifications, clearNotifications } = useSocketContext();
  const router = useRouter();
  
  // State for dashboard data
  const [kpiData, setKpiData] = useState<KPIData | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [transactions, setTransactions] = useState<RecentTransaction[]>([]);
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds
  
  // Load initial data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) return;

        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        // Fetch all data in parallel
        const [kpiResponse, revenueResponse, categoryResponse, transactionsResponse] = await Promise.all([
          fetch('/api/analytics/kpis', { headers }),
          fetch('/api/analytics/revenue-trends?period=30&granularity=daily', { headers }),
          fetch('/api/analytics/categories', { headers }),
          fetch('/api/analytics/recent-transactions?limit=10', { headers })
        ]);

        if (kpiResponse.ok) {
          const kpiResult = await kpiResponse.json();
          setKpiData(kpiResult.data);
        }

        if (revenueResponse.ok) {
          const revenueResult = await revenueResponse.json();
          setRevenueData(revenueResult.data);
        }

        if (categoryResponse.ok) {
          const categoryResult = await categoryResponse.json();
          setCategoryData(categoryResult.data);
        }

        if (transactionsResponse.ok) {
          const transactionsResult = await transactionsResponse.json();
          setTransactions(transactionsResult.data);
        }

      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadDashboardData();
    }
  }, [user]);

  // Set up auto-refresh
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      // Refresh KPI data automatically
      const token = localStorage.getItem('token');
      if (token) {
        fetch('/api/analytics/kpis', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(response => response.json())
        .then(result => {
          if (result.success) {
            setKpiData(result.data);
          }
        })
        .catch(console.error);
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [user, refreshInterval]);

  // Socket event handlers for real-time updates
  useSocketEvent(socket, 'new-sale', (saleData: any) => {
    console.log('New sale received:', saleData);
    // Add to recent transactions
    const newTransaction: RecentTransaction = {
      id: saleData._id,
      orderNumber: saleData.orderId,
      customerName: saleData.customerName,
      amount: saleData.totalAmount,
      status: saleData.paymentStatus,
      date: new Date(saleData.saleDate),
      paymentMethod: saleData.paymentMethod
    };
    setTransactions(prev => [newTransaction, ...prev.slice(0, 9)]);
  });

  useSocketEvent(socket, 'new-order', (orderData: any) => {
    console.log('New order received:', orderData);
    // Update relevant data
  });

  useSocketEvent(socket, 'kpi-update', (newKpiData: KPIData) => {
    console.log('KPI update received:', newKpiData);
    setKpiData(newKpiData);
  });

  useSocketEvent(socket, 'chart-update', (chartData: any) => {
    console.log('Chart update received:', chartData);
    // Update chart data based on type
    if (chartData.type === 'revenue') {
      setRevenueData(chartData.data);
    } else if (chartData.type === 'category') {
      setCategoryData(chartData.data);
    }
  });

  // Dark mode handling
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    
    // Apply dark class to both html and body for better compatibility
    const html = document.documentElement;
    const body = document.body;
    
    if (savedDarkMode) {
      html.classList.add('dark');
      body.classList.add('dark');
      console.log('Dark mode loaded from localStorage');
    } else {
      html.classList.remove('dark');
      body.classList.remove('dark');
      console.log('Light mode loaded from localStorage');
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    
    // Apply dark class to both html and body for better compatibility
    const html = document.documentElement;
    const body = document.body;
    
    if (newDarkMode) {
      html.classList.add('dark');
      body.classList.add('dark');
      console.log('Dark mode enabled');
    } else {
      html.classList.remove('dark');
      body.classList.remove('dark');
      console.log('Dark mode disabled');
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header
          isConnected={isConnected}
          onlineUsers={onlineUsers}
          notificationCount={notifications.length}
          onNotificationClick={() => setShowNotifications(!showNotifications)}
          darkMode={darkMode}
          onDarkModeToggle={toggleDarkMode}
        />

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Welcome back, {user?.username}!
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Here's what's happening with your business today.
              </p>
            </div>

            {/* KPI Cards */}
            <div className="mb-8">
              <KPICards data={kpiData} loading={loading} />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <RevenueChart 
                data={revenueData} 
                loading={loading}
                title="Revenue Trends (Last 30 Days)"
              />
              <CategoryChart 
                data={categoryData} 
                loading={loading}
                title="Sales by Category"
              />
            </div>

            {/* Recent Transactions */}
            <div className="mb-8">
              <RecentTransactions 
                transactions={transactions} 
                loading={loading}
                title="Recent Transactions"
              />
            </div>

            {/* Settings Panel (for demonstration) */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Dashboard Settings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Auto-refresh Interval
                  </label>
                  <select
                    value={refreshInterval}
                    onChange={(e) => setRefreshInterval(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={10000}>10 seconds</option>
                    <option value={30000}>30 seconds</option>
                    <option value={60000}>1 minute</option>
                    <option value={300000}>5 minutes</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Connection Status
                  </label>
                  <div className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isConnected 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    User Role
                  </label>
                  <div className="px-3 py-2 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-md text-sm font-medium capitalize">
                    {user?.role}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Notification Center */}
        {showNotifications && (
          <NotificationCenter
            notifications={notifications}
            onClearAll={clearNotifications}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}