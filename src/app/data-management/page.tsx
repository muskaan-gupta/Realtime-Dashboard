'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import AddSaleForm from '@/components/AddSaleForm';
import AddOrderForm from '@/components/AddOrderForm';

export default function DataManagementPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'sales' | 'orders'>('sales');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSuccess = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Access Denied</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Only administrators can access the data management page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Data Management</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Add and manage your business data in real-time
          </p>
        </div>

        {showSuccess && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Data added successfully! Check your dashboard for real-time updates.
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('sales')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'sales'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Add Sales Data
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'orders'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Add Orders Data
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'sales' && (
            <div>
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Add Sales Transaction
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Record individual sales transactions to track your business performance.
                </p>
              </div>
              <AddSaleForm onSuccess={handleSuccess} />
            </div>
          )}
          
          {activeTab === 'orders' && (
            <div>
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Add Customer Order
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Create new customer orders with multiple items and track their status.
                </p>
              </div>
              <AddOrderForm onSuccess={handleSuccess} />
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
            📊 How to Use This Data Management System
          </h3>
          <div className="space-y-2 text-blue-800 dark:text-blue-200">
            <p><strong>Sales Tab:</strong> Add individual product sales with customer information</p>
            <p><strong>Orders Tab:</strong> Create multi-item orders with customer details and status tracking</p>
            <p><strong>Real-time Updates:</strong> Data appears instantly on your dashboard</p>
            <p><strong>Analytics:</strong> All data contributes to your KPIs, charts, and reports</p>
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="mt-6 text-center">
          <a
            href="/dashboard"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}