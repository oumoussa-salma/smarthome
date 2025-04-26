import React from 'react';
import { Thermometer, Droplets, Wind, Sprout } from 'lucide-react';
import { SensorData } from '../../types';
import { motion } from 'framer-motion';

interface SensorCardProps {
  sensor: SensorData;
}

const SensorCard: React.FC<SensorCardProps> = ({ sensor }) => {
  const getIcon = () => {
    switch (sensor.type) {
      case 'temperature':
        return <Thermometer className="h-6 w-6 text-secondary-500" />;
      case 'humidity':
        return <Droplets className="h-6 w-6 text-secondary-500" />;
      case 'daz':
        return <Wind className="h-6 w-6 text-secondary-500" />;
      case 'soil':
        return <Sprout className="h-6 w-6 text-secondary-500" />;
      default:
        return <Thermometer className="h-6 w-6 text-secondary-500" />;
    }
  };

  const getStatusColor = () => {
    switch (sensor.status) {
      case 'normal':
        return 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-300';
      case 'warning':
        return 'bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-300';
      case 'critical':
        return 'bg-error-100 text-error-800 dark:bg-error-900 dark:text-error-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getTitle = () => {
    switch (sensor.type) {
      case 'temperature':
        return 'Temperature';
      case 'humidity':
        return 'Humidity';
      case 'daz':
        return 'DAZ Level';
      case 'soil':
        return 'Soil Moisture';
      default:
        return 'Sensor';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-card hover:shadow-card-hover transition-shadow duration-300 overflow-hidden"
    >
      <div className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-secondary-50 dark:bg-secondary-900 p-2 rounded-lg">
              {getIcon()}
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">{getTitle()}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">{sensor.location}</p>
            </div>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
            {sensor.status.charAt(0).toUpperCase() + sensor.status.slice(1)}
          </span>
        </div>
        <div className="mt-4">
          <div className="flex items-end justify-between">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {sensor.value}{sensor.unit}
            </div>
            <motion.div 
              className="text-xs text-gray-500 dark:text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Updated {new Date(sensor.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </motion.div>
          </div>
        </div>
      </div>
      <div className={`h-1 w-full ${
        sensor.status === 'normal' 
          ? 'bg-success-500' 
          : sensor.status === 'warning' 
            ? 'bg-warning-500' 
            : 'bg-error-500'
      }`}></div>
    </motion.div>
  );
};

export default SensorCard;