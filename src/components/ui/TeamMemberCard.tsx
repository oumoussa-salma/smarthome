import React from 'react';
import { motion } from 'framer-motion';
import { TeamMember } from '../../types';

interface TeamMemberCardProps {
  member: TeamMember;
}

const TeamMemberCard: React.FC<TeamMemberCardProps> = ({ member }) => {
  const getTimeSince = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  };

  const getStatusBadge = () => {
    switch (member.status) {
      case 'online':
        return (
          <div className="flex items-center">
            <span className="w-2 h-2 bg-success-500 rounded-full mr-1.5 animate-pulse"></span>
            <span className="text-success-700 dark:text-success-400 text-xs font-medium">Online</span>
          </div>
        );
      case 'away':
        return (
          <div className="flex items-center">
            <span className="w-2 h-2 bg-warning-500 rounded-full mr-1.5"></span>
            <span className="text-warning-700 dark:text-warning-400 text-xs font-medium">Away</span>
          </div>
        );
      case 'offline':
        return (
          <div className="flex items-center">
            <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full mr-1.5"></span>
            <span className="text-gray-600 dark:text-gray-400 text-xs font-medium">Offline</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div 
      className="bg-white dark:bg-gray-800 rounded-lg shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
    >
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-t from-primary-600/90 to-primary-400/60"></div>
        <div className="h-32 bg-primary-100 dark:bg-primary-900/30"></div>
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2">
          <motion.div 
            className="relative rounded-full border-4 border-white dark:border-gray-800 overflow-hidden"
            whileHover={{ scale: 1.05 }}
          >
            <img 
              src={member.avatar} 
              alt={member.name} 
              className="w-24 h-24 object-cover"
            />
            <div className="absolute bottom-1 right-1">
              <span className={`block w-3 h-3 rounded-full ${
                member.status === 'online' 
                  ? 'bg-success-500' 
                  : member.status === 'away' 
                    ? 'bg-warning-500' 
                    : 'bg-gray-400'
              } border-2 border-white dark:border-gray-800`}></span>
            </div>
          </motion.div>
        </div>
      </div>
      
      <div className="pt-16 pb-5 px-5">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{member.name}</h3>
          <p className="text-sm text-primary-600 dark:text-primary-400">{member.role}</p>
          <div className="mt-2 flex justify-center">
            {getStatusBadge()}
          </div>
        </div>
        
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
          <p>{member.bio}</p>
        </div>
        
        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
          {member.status === 'online' ? 'Active now' : `Last active ${getTimeSince(member.lastActive)}`}
        </div>
        
        <div className="mt-5 flex space-x-2 justify-center">
          <motion.button 
            className="px-3 py-1.5 bg-secondary-100 text-secondary-700 dark:bg-secondary-900 dark:text-secondary-300 rounded-md text-sm font-medium hover:bg-secondary-200 dark:hover:bg-secondary-800 transition-colors duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Message
          </motion.button>
          <motion.button 
            className="px-3 py-1.5 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-md text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            View Profile
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default TeamMemberCard;