import React from 'react';
import { motion } from 'framer-motion';
import TeamMemberCard from '../components/ui/TeamMemberCard';
import { teamMembers } from '../utils/mockData';
import { Users, MessageSquare, CalendarClock } from 'lucide-react';

const Team: React.FC = () => {
  // Animation variants for staggered animations
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 25 } }
  };
  
  const onlineMembers = teamMembers.filter(member => member.status === 'online').length;
  
  return (
    <div className="p-4 sm:p-6 md:p-8">
      {/* Team Header */}
      <div className="mb-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-primary-500 text-white rounded-lg shadow-lg overflow-hidden"
        >
          <div className="max-w-7xl mx-auto px-6 py-8 sm:px-8 sm:py-12 flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Our Smart Agriculture Team</h1>
              <p className="mt-2 text-primary-100">
                Meet the experts keeping your crops healthy and thriving
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 flex items-center">
                <Users className="h-5 w-5 mr-2 text-primary-200" />
                <div>
                  <div className="text-sm text-primary-100">Team Members</div>
                  <div className="text-xl font-semibold">{teamMembers.length}</div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 flex items-center">
                <div className="relative mr-2">
                  <Users className="h-5 w-5 text-primary-200" />
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-success-500"></span>
                  </span>
                </div>
                <div>
                  <div className="text-sm text-primary-100">Online Now</div>
                  <div className="text-xl font-semibold">{onlineMembers}</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Team Grid */}
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {teamMembers.map(member => (
          <motion.div key={member.id} variants={item}>
            <TeamMemberCard member={member} />
          </motion.div>
        ))}
      </motion.div>
      
      {/* Team Collaboration Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          className="bg-white dark:bg-gray-800 rounded-lg shadow-card p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          whileHover={{ y: -5 }}
        >
          <div className="bg-primary-50 dark:bg-primary-900/30 p-3 rounded-full inline-block mb-3">
            <MessageSquare className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Team Chat</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Connect with team members to discuss crop health, irrigation plans, and more in real-time.
          </p>
          <button className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-md font-medium transition-colors duration-200">
            Open Chat
          </button>
        </motion.div>
        
        <motion.div 
          className="bg-white dark:bg-gray-800 rounded-lg shadow-card p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          whileHover={{ y: -5 }}
        >
          <div className="bg-secondary-50 dark:bg-secondary-900/30 p-3 rounded-full inline-block mb-3">
            <CalendarClock className="h-6 w-6 text-secondary-600 dark:text-secondary-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Team Schedule</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            View upcoming tasks, maintenance schedules, and team availability all in one place.
          </p>
          <button className="px-4 py-2 bg-secondary-500 hover:bg-secondary-600 text-white rounded-md font-medium transition-colors duration-200">
            View Schedule
          </button>
        </motion.div>
        
        <motion.div 
          className="bg-white dark:bg-gray-800 rounded-lg shadow-card p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          whileHover={{ y: -5 }}
        >
          <div className="bg-accent-50 dark:bg-accent-900/30 p-3 rounded-full inline-block mb-3">
            <Users className="h-6 w-6 text-accent-600 dark:text-accent-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Task Assignments</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Manage and delegate tasks to team members based on their expertise and availability.
          </p>
          <button className="px-4 py-2 bg-accent-500 hover:bg-accent-600 text-white rounded-md font-medium transition-colors duration-200">
            Manage Tasks
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Team;