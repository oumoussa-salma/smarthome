import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { IrrigationZone } from '../../types';
import { Droplets, Clock, Power, PowerOff } from 'lucide-react';

interface IrrigationZoneCardProps {
  zone: IrrigationZone;
  onToggle: (zoneId: string, enabled: boolean) => void;
}

const IrrigationZoneCard: React.FC<IrrigationZoneCardProps> = ({ zone, onToggle }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const formatDate = (date: Date | null) => {
    if (!date) return 'Not scheduled';
    return new Date(date).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = () => {
    switch (zone.status) {
      case 'active':
        return (
          <div className="flex items-center">
            <span className="w-2 h-2 bg-success-500 rounded-full mr-1.5 animate-pulse"></span>
            <span className="bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-300 text-xs font-medium px-2 py-0.5 rounded-full">
              Active
            </span>
          </div>
        );
      case 'scheduled':
        return (
          <div className="flex items-center">
            <span className="w-2 h-2 bg-secondary-500 rounded-full mr-1.5"></span>
            <span className="bg-secondary-100 text-secondary-800 dark:bg-secondary-900 dark:text-secondary-300 text-xs font-medium px-2 py-0.5 rounded-full">
              Scheduled
            </span>
          </div>
        );
      case 'inactive':
        return (
          <div className="flex items-center">
            <span className="w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full mr-1.5"></span>
            <span className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 text-xs font-medium px-2 py-0.5 rounded-full">
              Inactive
            </span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div 
      className="bg-white dark:bg-gray-800 rounded-lg shadow-card overflow-hidden"
      whileHover={{ y: -5 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className={`h-2 ${
        zone.status === 'active' 
          ? 'bg-success-500' 
          : zone.status === 'scheduled' 
            ? 'bg-secondary-500' 
            : 'bg-gray-300 dark:bg-gray-600'
      }`}></div>
      
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{zone.name}</h3>
            <div className="mt-1">{getStatusBadge()}</div>
          </div>
          
          <motion.button
            className={`relative w-12 h-6 rounded-full p-1 transition-colors duration-300 focus:outline-none ${
              zone.automationEnabled 
                ? 'bg-primary-500' 
                : 'bg-gray-300 dark:bg-gray-600'
            }`}
            onClick={() => onToggle(zone.id, !zone.automationEnabled)}
            whileTap={{ scale: 0.95 }}
            initial={false}
            animate={{ backgroundColor: zone.automationEnabled ? '#2D9D78' : '#9ca3af' }}
          >
            <motion.div 
              className="w-4 h-4 bg-white rounded-full shadow-md"
              animate={{ 
                x: zone.automationEnabled ? 24 : 0
              }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </motion.button>
        </div>
        
        <div className="mt-4 space-y-2">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <Droplets className="h-4 w-4 mr-2 text-secondary-500" />
            <span>Moisture Threshold: {zone.moistureThreshold}%</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <Clock className="h-4 w-4 mr-2 text-secondary-500" />
            <span>Duration: {zone.duration} minutes</span>
          </div>
          
          {zone.status === 'active' && (
            <div className="mt-3 py-2 px-3 bg-success-50 dark:bg-success-900/30 rounded-md text-sm text-success-700 dark:text-success-400">
              <div className="flex items-center">
                <Power className="h-4 w-4 mr-1.5 text-success-500" />
                <span>Currently irrigating</span>
              </div>
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Started at {zone.lastActivated ? new Date(zone.lastActivated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
              </div>
            </div>
          )}
          
          {zone.status === 'scheduled' && (
            <div className="mt-3 py-2 px-3 bg-secondary-50 dark:bg-secondary-900/30 rounded-md text-sm text-secondary-700 dark:text-secondary-400">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1.5 text-secondary-500" />
                <span>Next scheduled: {formatDate(zone.nextScheduled)}</span>
              </div>
            </div>
          )}
          
          {zone.status === 'inactive' && zone.automationEnabled && (
            <div className="mt-3 py-2 px-3 bg-gray-50 dark:bg-gray-700/30 rounded-md text-sm text-gray-700 dark:text-gray-400">
              <div className="flex items-center">
                <PowerOff className="h-4 w-4 mr-1.5 text-gray-500" />
                <span>Automated irrigation ready</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
          {zone.cropIds.length > 0 ? (
            <span>Manages {zone.cropIds.length} crop{zone.cropIds.length !== 1 ? 's' : ''}</span>
          ) : (
            <span>No crops assigned</span>
          )}
        </div>
      </div>
      
      {isHovered && (
        <div className="px-5 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
          <button className="w-full py-1.5 px-3 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800">
            Manage Zone
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default IrrigationZoneCard;