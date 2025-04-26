import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SensorCard from '../components/ui/SensorCard';
import DataChart from '../components/ui/DataChart';
import AlertBanner from '../components/ui/AlertBanner';
import { 
  sensorData, 
  alerts, 
  temperatureHistory, 
  humidityHistory, 
  dazHistory, 
  soilHistory 
} from '../utils/mockData';
import { Alert } from '../types';

const Dashboard: React.FC = () => {
  const [activeAlerts, setActiveAlerts] = useState<Alert[]>(alerts);
  const [timeRange, setTimeRange] = useState<'1d' | '7d' | '30d'>('7d');
  
  const dismissAlert = (id: string) => {
    setActiveAlerts(prev => prev.filter(alert => alert.id !== id));
  };
  
  const temperatureSensors = sensorData.filter(sensor => sensor.type === 'temperature');
  const humiditySensors = sensorData.filter(sensor => sensor.type === 'humidity');
  const dazSensors = sensorData.filter(sensor => sensor.type === 'daz');
  const soilSensors = sensorData.filter(sensor => sensor.type === 'soil');
  
  return (
    <div className="p-4 sm:p-6 md:p-8">
      {/* Time Range Selector */}
      <div className="mb-6 flex justify-end">
        <div className="inline-flex items-center rounded-md shadow-sm">
          <button
            type="button"
            className={`py-2 px-4 text-sm font-medium rounded-l-md transition-colors ${
              timeRange === '1d' 
                ? 'bg-primary-500 text-white' 
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
            }`}
            onClick={() => setTimeRange('1d')}
          >
            Day
          </button>
          <button
            type="button"
            className={`py-2 px-4 text-sm font-medium transition-colors ${
              timeRange === '7d' 
                ? 'bg-primary-500 text-white' 
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
            }`}
            onClick={() => setTimeRange('7d')}
          >
            Week
          </button>
          <button
            type="button"
            className={`py-2 px-4 text-sm font-medium rounded-r-md transition-colors ${
              timeRange === '30d' 
                ? 'bg-primary-500 text-white' 
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
            }`}
            onClick={() => setTimeRange('30d')}
          >
            Month
          </button>
        </div>
      </div>
      
      {/* Alerts Section */}
      {activeAlerts.length > 0 && (
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Active Alerts</h2>
          {activeAlerts.map(alert => (
            <AlertBanner 
              key={alert.id} 
              alert={alert} 
              onDismiss={dismissAlert} 
            />
          ))}
        </motion.div>
      )}
      
      {/* Sensor Cards Grid */}
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sensor Readings</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {sensorData.map(sensor => (
          <SensorCard key={sensor.id} sensor={sensor} />
        ))}
      </div>
      
      {/* Charts Grid */}
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Historical Data</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DataChart 
          title="Temperature" 
          data={temperatureHistory} 
          color="#3b82f6" 
          unit="°C" 
          timeRange={timeRange} 
        />
        <DataChart 
          title="Humidity" 
          data={humidityHistory} 
          color="#2D9D78" 
          unit="%" 
          timeRange={timeRange} 
        />
        <DataChart 
          title="DAZ Levels" 
          data={dazHistory} 
          color="#f59e0b" 
          unit=" ppm" 
          timeRange={timeRange} 
        />
        <DataChart 
          title="Soil Moisture" 
          data={soilHistory} 
          color="#ef4444" 
          unit="%" 
          timeRange={timeRange} 
        />
      </div>
      
      {/* Summary Section */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          className="bg-white dark:bg-gray-800 rounded-lg shadow-card p-5"
          whileHover={{ y: -5 }}
        >
          <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">Temperature Summary</h3>
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Average: {(temperatureSensors.reduce((sum, sensor) => sum + sensor.value, 0) / temperatureSensors.length).toFixed(1)}°C
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Max: {Math.max(...temperatureSensors.map(sensor => sensor.value))}°C
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Min: {Math.min(...temperatureSensors.map(sensor => sensor.value))}°C
            </p>
          </div>
        </motion.div>
        
        <motion.div 
          className="bg-white dark:bg-gray-800 rounded-lg shadow-card p-5"
          whileHover={{ y: -5 }}
        >
          <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">Humidity Summary</h3>
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Average: {(humiditySensors.reduce((sum, sensor) => sum + sensor.value, 0) / humiditySensors.length).toFixed(1)}%
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Max: {Math.max(...humiditySensors.map(sensor => sensor.value))}%
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Min: {Math.min(...humiditySensors.map(sensor => sensor.value))}%
            </p>
          </div>
        </motion.div>
        
        <motion.div 
          className="bg-white dark:bg-gray-800 rounded-lg shadow-card p-5"
          whileHover={{ y: -5 }}
        >
          <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">System Status</h3>
          <div className="space-y-2">
            <div className="flex items-center">
              <span className="w-2 h-2 bg-success-500 rounded-full mr-2"></span>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Sensors: All operational
              </p>
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-warning-500 rounded-full mr-2"></span>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Irrigation: 1 zone active
              </p>
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-error-500 rounded-full mr-2"></span>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Alerts: {activeAlerts.length} active
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;