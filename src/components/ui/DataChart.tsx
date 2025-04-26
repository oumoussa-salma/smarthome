import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { HistoricalData } from '../../types';
import { useTheme } from '../../context/ThemeContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface DataChartProps {
  title: string;
  data: HistoricalData[];
  color: string;
  unit: string;
  timeRange?: '1d' | '7d' | '30d';
}

const DataChart: React.FC<DataChartProps> = ({ 
  title, 
  data, 
  color, 
  unit, 
  timeRange = '7d' 
}) => {
  const { theme } = useTheme();
  
  // Filter data based on time range
  const filteredData = React.useMemo(() => {
    const now = new Date();
    const filterDate = new Date();
    
    switch (timeRange) {
      case '1d':
        filterDate.setDate(now.getDate() - 1);
        break;
      case '7d':
        filterDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        filterDate.setDate(now.getDate() - 30);
        break;
      default:
        filterDate.setDate(now.getDate() - 7);
    }
    
    return data.filter(item => new Date(item.timestamp) >= filterDate);
  }, [data, timeRange]);
  
  const labels = filteredData.map(item => {
    const date = new Date(item.timestamp);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  });
  
  const values = filteredData.map(item => item.value);
  
  const chartData = {
    labels,
    datasets: [
      {
        label: title,
        data: values,
        borderColor: color,
        backgroundColor: `${color}33`, // 20% opacity
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor: color,
      },
    ],
  };
  
  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
        titleColor: theme === 'dark' ? '#ffffff' : '#111827',
        bodyColor: theme === 'dark' ? '#d1d5db' : '#4b5563',
        borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
        borderWidth: 1,
        padding: 10,
        displayColors: false,
        callbacks: {
          label: function(context) {
            return `${context.parsed.y}${unit}`;
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          color: theme === 'dark' ? '#9ca3af' : '#6b7280',
        },
      },
      y: {
        grid: {
          color: theme === 'dark' ? '#374151' : '#f3f4f6',
          drawBorder: false,
        },
        ticks: {
          color: theme === 'dark' ? '#9ca3af' : '#6b7280',
          callback: function(value) {
            return `${value}${unit}`;
          }
        },
        beginAtZero: false,
      },
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
    elements: {
      point: {
        radius: 0,
        hoverRadius: 5,
      },
    },
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-card p-5 h-80">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-medium text-gray-900 dark:text-white">{title}</h3>
        <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
          Last {timeRange === '1d' ? 'day' : timeRange === '7d' ? 'week' : 'month'}
        </div>
      </div>
      <div className="h-64">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default DataChart;