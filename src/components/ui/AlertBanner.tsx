import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Alert } from '../../types';
import { X, AlertTriangle, AlertCircle, CheckCircle, Info } from 'lucide-react';

interface AlertBannerProps {
  alert: Alert;
  onDismiss: (id: string) => void;
}

const AlertBanner: React.FC<AlertBannerProps> = ({ alert, onDismiss }) => {
  const [isDismissing, setIsDismissing] = useState(false);

  const handleDismiss = () => {
    setIsDismissing(true);
    setTimeout(() => {
      onDismiss(alert.id);
    }, 300);
  };

  const getAlertStyles = () => {
    switch (alert.type) {
      case 'warning':
        return 'bg-warning-50 dark:bg-warning-900/20 text-warning-800 dark:text-warning-300 border-warning-200 dark:border-warning-800';
      case 'error':
        return 'bg-error-50 dark:bg-error-900/20 text-error-800 dark:text-error-300 border-error-200 dark:border-error-800';
      case 'success':
        return 'bg-success-50 dark:bg-success-900/20 text-success-800 dark:text-success-300 border-success-200 dark:border-success-800';
      case 'info':
      default:
        return 'bg-secondary-50 dark:bg-secondary-900/20 text-secondary-800 dark:text-secondary-300 border-secondary-200 dark:border-secondary-800';
    }
  };

  const getAlertIcon = () => {
    switch (alert.type) {
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-warning-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-error-500" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-success-500" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-secondary-500" />;
    }
  };

  return (
    <AnimatePresence>
      {!isDismissing && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className={`rounded-lg border px-4 py-3 mb-3 shadow-sm flex items-center justify-between ${getAlertStyles()}`}
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {getAlertIcon()}
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium">{alert.title}</h3>
              <div className="mt-1 text-xs">{alert.message}</div>
              <div className="mt-1">
                <span className="text-xs opacity-75">
                  {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            className="ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 hover:bg-gray-200/20 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
            onClick={handleDismiss}
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AlertBanner;