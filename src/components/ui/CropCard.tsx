import React from 'react';
import { motion } from 'framer-motion';
import { Crop } from '../../types';
import { Droplets, Calendar, AlertCircle } from 'lucide-react';

interface CropCardProps {
  crop: Crop;
  onClick?: () => void;
}

const CropCard: React.FC<CropCardProps> = ({ crop, onClick }) => {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric'
    });
  };

  const getHealthStatusBadge = () => {
    switch (crop.healthStatus) {
      case 'healthy':
        return <span className="bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-300 text-xs font-medium px-2.5 py-0.5 rounded-full">Healthy</span>;
      case 'at-risk':
        return <span className="bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-300 text-xs font-medium px-2.5 py-0.5 rounded-full">At Risk</span>;
      case 'diseased':
        return <span className="bg-error-100 text-error-800 dark:bg-error-900 dark:text-error-300 text-xs font-medium px-2.5 py-0.5 rounded-full">Diseased</span>;
      default:
        return null;
    }
  };

  const getNextIrrigationText = () => {
    if (!crop.nextScheduledIrrigation) {
      return 'No irrigation scheduled';
    }
    
    const now = new Date();
    const next = new Date(crop.nextScheduledIrrigation);
    const diffTime = Math.abs(next.getTime() - now.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays > 0) {
      return `in ${diffDays} day${diffDays !== 1 ? 's' : ''}`;
    } else {
      return `in ${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
    }
  };

  return (
    <motion.div 
      className="bg-white dark:bg-gray-800 rounded-lg shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden cursor-pointer"
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
    >
      <div className="relative h-40 overflow-hidden">
        <img 
          src={crop.imageUrl} 
          alt={crop.name} 
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
        <div className="absolute top-3 right-3">
          {getHealthStatusBadge()}
        </div>
        {crop.healthStatus === 'diseased' && (
          <motion.div 
            className="absolute top-3 left-3 bg-error-500 text-white p-1 rounded-full"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              repeat: Infinity, 
              repeatType: "reverse", 
              duration: 1
            }}
          >
            <AlertCircle size={16} />
          </motion.div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{crop.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{crop.type} • {crop.location}</p>
          </div>
          <span className="px-2 py-1 bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-xs rounded-md">
            {crop.growthStage}
          </span>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <Droplets className="h-4 w-4 mr-1 text-secondary-500" />
            <span>Last: {formatDate(crop.lastIrrigation)}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <Calendar className="h-4 w-4 mr-1 text-secondary-500" />
            <span>Next: {getNextIrrigationText()}</span>
          </div>
        </div>
      </div>
      
      <div className={`h-1 w-full ${
        crop.healthStatus === 'healthy' 
          ? 'bg-success-500' 
          : crop.healthStatus === 'at-risk' 
            ? 'bg-warning-500' 
            : 'bg-error-500'
      }`}></div>
    </motion.div>
  );
};

export default CropCard;