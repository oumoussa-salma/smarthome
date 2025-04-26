import React, { useState } from 'react';
import { motion } from 'framer-motion';
import IrrigationZoneCard from '../components/ui/IrrigationZoneCard';
import { irrigationZones, crops } from '../utils/mockData';
import { Droplets, Settings, BarChart, Clock } from 'lucide-react';

const Irrigation: React.FC = () => {
  const [zones, setZones] = useState(irrigationZones);
  
  const handleToggleAutomation = (zoneId: string, enabled: boolean) => {
    setZones(prevZones => 
      prevZones.map(zone => 
        zone.id === zoneId ? { ...zone, automationEnabled: enabled } : zone
      )
    );
  };
  
  const activateAllZones = () => {
    setZones(prevZones => 
      prevZones.map(zone => ({ ...zone, status: 'active', lastActivated: new Date() }))
    );
  };
  
  const deactivateAllZones = () => {
    setZones(prevZones => 
      prevZones.map(zone => ({ ...zone, status: 'inactive' }))
    );
  };
  
  // Calculate water usage statistics
  const totalWaterUsage = zones.reduce((total, zone) => {
    // Simple calculation based on duration and status
    const multiplier = zone.status === 'active' ? 1 : 0;
    return total + (zone.duration * 2.5 * multiplier); // 2.5 liters per minute as an example
  }, 0);
  
  const scheduledWaterUsage = zones.reduce((total, zone) => {
    if (zone.status === 'scheduled' && zone.nextScheduled) {
      return total + (zone.duration * 2.5);
    }
    return total;
  }, 0);
  
  return (
    <div className="p-4 sm:p-6 md:p-8">
      {/* System Controls */}
      <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-card p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Irrigation System Controls</h2>
          <div className="flex space-x-3">
            <button
              className="bg-error-500 hover:bg-error-600 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-error-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors duration-200"
              onClick={deactivateAllZones}
            >
              Stop All Zones
            </button>
            <button
              className="bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors duration-200"
              onClick={activateAllZones}
            >
              Activate All Zones
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div 
            className="bg-secondary-50 dark:bg-secondary-900/30 rounded-md p-4 flex items-center"
            whileHover={{ y: -5 }}
          >
            <div className="bg-secondary-100 dark:bg-secondary-800 p-3 rounded-full">
              <Droplets className="h-6 w-6 text-secondary-600 dark:text-secondary-400" />
            </div>
            <div className="ml-4">
              <div className="text-sm text-gray-600 dark:text-gray-300">Current Water Usage</div>
              <div className="text-xl font-semibold text-gray-900 dark:text-white">{totalWaterUsage.toFixed(1)} L/min</div>
            </div>
          </motion.div>
          
          <motion.div 
            className="bg-primary-50 dark:bg-primary-900/30 rounded-md p-4 flex items-center"
            whileHover={{ y: -5 }}
          >
            <div className="bg-primary-100 dark:bg-primary-800 p-3 rounded-full">
              <Clock className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="ml-4">
              <div className="text-sm text-gray-600 dark:text-gray-300">Scheduled Usage</div>
              <div className="text-xl font-semibold text-gray-900 dark:text-white">{scheduledWaterUsage.toFixed(1)} L</div>
            </div>
          </motion.div>
          
          <motion.div 
            className="bg-gray-50 dark:bg-gray-700/30 rounded-md p-4 flex items-center"
            whileHover={{ y: -5 }}
          >
            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-full">
              <BarChart className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            </div>
            <div className="ml-4">
              <div className="text-sm text-gray-600 dark:text-gray-300">Active Zones</div>
              <div className="text-xl font-semibold text-gray-900 dark:text-white">
                {zones.filter(zone => zone.status === 'active').length} / {zones.length}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Zone Controls */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Irrigation Zones</h2>
          <button
            className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-md p-1.5"
          >
            <Settings className="h-5 w-5 mr-1.5" />
            <span className="text-sm font-medium">Configure Zones</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {zones.map(zone => (
            <IrrigationZoneCard 
              key={zone.id}
              zone={zone}
              onToggle={handleToggleAutomation}
            />
          ))}
        </div>
      </div>
      
      {/* Schedule Viewer */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Irrigation Schedule</h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Zone</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Next Scheduled</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Duration</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Crops</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {zones.map(zone => {
                  const zoneCrops = crops.filter(crop => zone.cropIds.includes(crop.id));
                  
                  return (
                    <tr key={zone.id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900 dark:text-white">{zone.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {zone.nextScheduled ? (
                          <div className="text-gray-600 dark:text-gray-300">
                            {new Date(zone.nextScheduled).toLocaleString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        ) : (
                          <div className="text-gray-500 dark:text-gray-400 italic">Not scheduled</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-600 dark:text-gray-300">{zone.duration} minutes</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {zoneCrops.length > 0 ? (
                            zoneCrops.map(crop => (
                              <span key={crop.id} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-300">
                                {crop.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-500 dark:text-gray-400 italic">None assigned</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${
                          zone.status === 'active' 
                            ? 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-300' 
                            : zone.status === 'scheduled' 
                              ? 'bg-secondary-100 text-secondary-800 dark:bg-secondary-900 dark:text-secondary-300' 
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {zone.status.charAt(0).toUpperCase() + zone.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Irrigation;