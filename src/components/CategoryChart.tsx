'use client';

import { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { CategoryData } from '@/types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface CategoryChartProps {
  data: CategoryData[];
  loading?: boolean;
  title?: string;
}

export default function CategoryChart({ 
  data, 
  loading = false, 
  title = "Sales by Category" 
}: CategoryChartProps) {
  const chartRef = useRef<ChartJS<'bar', number[], string>>(null);

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.update();
    }
  }, [data]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40 animate-pulse"></div>
        </div>
        <div className="h-80 bg-gray-100 dark:bg-gray-700 rounded animate-pulse flex items-center justify-center">
          <div className="text-gray-400 dark:text-gray-500">Loading chart...</div>
        </div>
      </div>
    );
  }

  
  const colors = [
    'rgba(59, 130, 246, 0.8)',  
    'rgba(16, 185, 129, 0.8)',   
    'rgba(245, 101, 101, 0.8)',  
    'rgba(251, 191, 36, 0.8)',   
    'rgba(139, 92, 246, 0.8)',   
    'rgba(236, 72, 153, 0.8)',   
    'rgba(20, 184, 166, 0.8)',   
    'rgba(249, 115, 22, 0.8)',   
    'rgba(156, 163, 175, 0.8)',  
  ];

  const borderColors = [
    'rgb(59, 130, 246)',
    'rgb(16, 185, 129)',
    'rgb(245, 101, 101)',
    'rgb(251, 191, 36)',
    'rgb(139, 92, 246)',
    'rgb(236, 72, 153)',
    'rgb(20, 184, 166)',
    'rgb(249, 115, 22)',
    'rgb(156, 163, 175)',
  ];

  const chartData = {
    labels: data.map(item => item.category),
    datasets: [
      {
        label: 'Sales Count',
        data: data.map(item => item.sales),
        backgroundColor: colors.slice(0, data.length),
        borderColor: borderColors.slice(0, data.length),
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
      }
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context: any) {
            const dataIndex = context.dataIndex;
            const categoryData = data[dataIndex];
            return [
              `Sales: ${context.parsed.y.toLocaleString()}`,
              `Revenue: $${categoryData.revenue.toLocaleString()}`,
              `Percentage: ${categoryData.percentage.toFixed(1)}%`
            ];
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 45,
          minRotation: 0,
          font: {
            size: 11,
          },
        },
      },
      y: {
        display: true,
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
    },
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {data.length} categories
        </div>
      </div>
      
      {data.length === 0 ? (
        <div className="h-80 flex items-center justify-center text-gray-500 dark:text-gray-400">
          No category data available
        </div>
      ) : (
        <div className="h-80">
          <Bar ref={chartRef} data={chartData} options={options} />
        </div>
      )}
      
   
      <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
        {data.slice(0, 6).map((item, index) => (
          <div key={item.category} className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-sm" 
              style={{ backgroundColor: colors[index] }}
            ></div>
            <span className="text-xs text-gray-600 dark:text-gray-400 truncate">
              {item.category} ({item.percentage.toFixed(1)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}