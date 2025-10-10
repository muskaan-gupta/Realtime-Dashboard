'use client';

import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package } from 'lucide-react';
import { KPIData } from '@/types';

interface KPICardProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  prefix?: string;
  suffix?: string;
}

function KPICard({ title, value, change, icon, prefix = '', suffix = '' }: KPICardProps) {
  const isPositive = change >= 0;
  const changeColor = isPositive ? 'text-green-600' : 'text-red-600';
  const changeBg = isPositive ? 'bg-green-50' : 'bg-red-50';
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  const formatValue = (val: string | number): string => {
    if (typeof val === 'number') {
      if (prefix === '$') {
        return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      }
      return val.toLocaleString();
    }
    return val;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-all duration-200 hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {prefix}{formatValue(value)}{suffix}
          </p>
        </div>
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="text-blue-600 dark:text-blue-400">
            {icon}
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex items-center">
        <div className={`flex items-center ${changeBg} dark:${isPositive ? 'bg-green-900/20' : 'bg-red-900/20'} rounded-full px-2.5 py-0.5`}>
          <TrendIcon className={`w-4 h-4 ${changeColor} mr-1`} />
          <span className={`text-sm font-medium ${changeColor}`}>
            {Math.abs(change).toFixed(1)}%
          </span>
        </div>
        <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
          vs last period
        </span>
      </div>
    </div>
  );
}

interface KPICardsProps {
  data: KPIData | null;
  loading?: boolean;
}

export default function KPICards({ data, loading = false }: KPICardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
              </div>
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </div>
            <div className="mt-4">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
          No data available
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <KPICard
        title="Total Revenue"
        value={data.totalRevenue}
        change={data.revenueGrowth}
        icon={<DollarSign className="w-6 h-6" />}
        prefix="$"
      />
      
      <KPICard
        title="Total Sales"
        value={data.totalSales}
        change={data.salesGrowth}
        icon={<Package className="w-6 h-6" />}
      />
      
      <KPICard
        title="Total Orders"
        value={data.totalOrders}
        change={data.ordersGrowth}
        icon={<ShoppingCart className="w-6 h-6" />}
      />
      
      <KPICard
        title="Total Users"
        value={data.totalUsers}
        change={data.usersGrowth}
        icon={<Users className="w-6 h-6" />}
      />
    </div>
  );
}