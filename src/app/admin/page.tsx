'use client';

import { useState, useEffect } from 'react';
import { Plus, Download, Upload, Settings } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/Header';
import { useAuth } from '@/context/AuthContext';
import { useSocketContext } from '@/context/SocketContext';

interface SampleData {
  customerName: string;
  customerEmail: string;
  productName: string;
  productCategory: string;
  quantity: number;
  unitPrice: number;
  paymentMethod: string;
  region: string;
  country: string;
}

const sampleSalesData: SampleData[] = [
  {
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    productName: 'Wireless Headphones',
    productCategory: 'Electronics',
    quantity: 2,
    unitPrice: 99.99,
    paymentMethod: 'credit_card',
    region: 'North America',
    country: 'USA'
  },
  {
    customerName: 'Jane Smith',
    customerEmail: 'jane@example.com',
    productName: 'Running Shoes',
    productCategory: 'Sports',
    quantity: 1,
    unitPrice: 129.99,
    paymentMethod: 'paypal',
    region: 'North America',
    country: 'Canada'
  },
  {
    customerName: 'Bob Wilson',
    customerEmail: 'bob@example.com',
    productName: 'Coffee Maker',
    productCategory: 'Home & Garden',
    quantity: 1,
    unitPrice: 89.99,
    paymentMethod: 'debit_card',
    region: 'Europe',
    country: 'UK'
  }
];

export default function AdminPage() {
  const { user } = useAuth();
  const { isConnected, onlineUsers, notifications, clearNotifications } = useSocketContext();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const generateSampleData = async () => {
    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token');

      const promises = sampleSalesData.map(async (saleData, index) => {
        const response = await fetch('/api/sales', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            orderId: `ORD-${Date.now()}-${index}`,
            ...saleData,
            salesPerson: user?.username || 'Admin',
            paymentStatus: Math.random() > 0.1 ? 'completed' : 'pending'
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create sale');
        }

        return response.json();
      });

      const results = await Promise.all(promises);
      setMessage(`Successfully created ${results.length} sample sales records!`);
      
    } catch (error: any) {
      console.error('Error generating sample data:', error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const exportData = async () => {
    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token');

      // Fetch sales data
      const response = await fetch('/api/sales?limit=1000', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const result = await response.json();
      const salesData = result.data.sales;

      // Convert to CSV
      if (salesData.length === 0) {
        setMessage('No data to export');
        return;
      }

      const headers = Object.keys(salesData[0]);
      const csvContent = [
        headers.join(','),
        ...salesData.map((row: any) => 
          headers.map(header => 
            typeof row[header] === 'string' && row[header].includes(',') 
              ? `"${row[header]}"` 
              : row[header]
          ).join(',')
        )
      ].join('\n');

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sales-data-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setMessage(`Successfully exported ${salesData.length} records to CSV!`);

    } catch (error: any) {
      console.error('Error exporting data:', error);
      setMessage(`Export error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute requireAdmin={true}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header
          isConnected={isConnected}
          onlineUsers={onlineUsers}
          notificationCount={notifications.length}
          onNotificationClick={() => clearNotifications()}
          darkMode={darkMode}
          onDarkModeToggle={toggleDarkMode}
        />

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Admin Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Manage your analytics data and system settings
              </p>
            </div>

            {/* Message Display */}
            {message && (
              <div className={`mb-6 p-4 rounded-lg ${
                message.includes('Error') 
                  ? 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
                  : 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
              }`}>
                {message}
              </div>
            )}

            {/* Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Generate Sample Data */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Plus className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="ml-3 text-lg font-semibold text-gray-900 dark:text-white">
                    Generate Sample Data
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Create sample sales records to test the dashboard functionality.
                </p>
                <button
                  onClick={generateSampleData}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  Generate Data
                </button>
              </div>

              {/* Export Data */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <Download className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="ml-3 text-lg font-semibold text-gray-900 dark:text-white">
                    Export Data
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Download all sales data as a CSV file for external analysis.
                </p>
                <button
                  onClick={exportData}
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  Export CSV
                </button>
              </div>

              {/* System Settings */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <Settings className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="ml-3 text-lg font-semibold text-gray-900 dark:text-white">
                    System Status
                  </h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Socket Connection:</span>
                    <span className={`text-sm font-medium ${
                      isConnected 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {isConnected ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Online Users:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {onlineUsers}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Theme:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                      {darkMode ? 'Dark' : 'Light'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-3">
                Getting Started
              </h3>
              <div className="space-y-2 text-sm text-blue-800 dark:text-blue-400">
                <p>1. <strong>Generate Sample Data:</strong> Click "Generate Data" to create sample sales records for testing.</p>
                <p>2. <strong>View Dashboard:</strong> Navigate to the main dashboard to see your analytics in action.</p>
                <p>3. <strong>Real-time Updates:</strong> Any new data will automatically update the dashboard via WebSocket connection.</p>
                <p>4. <strong>Export Data:</strong> Use the "Export CSV" button to download your data for external analysis.</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}