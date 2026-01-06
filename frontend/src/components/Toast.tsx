import React, { useEffect } from 'react';
import { TOAST_TYPES } from '../constants/appConstants';

export type ToastType = typeof TOAST_TYPES[keyof typeof TOAST_TYPES];

interface ToastProps {
  message: string;
  type: ToastType;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type, isVisible, onClose, duration = 3000 }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);
  
  const getIcon = () => {
    switch (type) {
      case TOAST_TYPES.SUCCESS:
        return '✓';
      case TOAST_TYPES.ERROR:
        return '✗';
      case TOAST_TYPES.WARNING:
        return '⚠';
      case TOAST_TYPES.INFO:
        return 'ℹ';
      default:
        return 'ℹ';
    }
  };
  
  const getTypeStyles = () => {
    switch (type) {
      case TOAST_TYPES.SUCCESS:
        return { 
          backgroundColor: 'var(--toast-success-bg)', 
          borderLeft: '4px solid var(--toast-success-border)' 
        };
      case TOAST_TYPES.ERROR:
        return { 
          backgroundColor: 'var(--toast-error-bg)', 
          borderLeft: '4px solid var(--toast-error-border)' 
        };
      case TOAST_TYPES.WARNING:
        return { 
          backgroundColor: 'var(--toast-warning-bg)', 
          borderLeft: '4px solid var(--toast-warning-border)' 
        };
      case TOAST_TYPES.INFO:
        return { 
          backgroundColor: 'var(--toast-info-bg)', 
          borderLeft: '4px solid var(--toast-info-border)' 
        };
      default:
        return { 
          backgroundColor: '#6B7280', 
          borderLeft: '4px solid #4B5563' 
        };
    }
  };
  
  return (
    <div 
      className="toast" 
      style={{ 
        ...getTypeStyles(), 
        display: isVisible ? 'block' : 'none',
        animation: 'slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }} 
      onClick={onClose}
    >
      <div className="toast-content">
        <span className="toast-icon">{getIcon()}</span>
        <span className="toast-message">{message}</span>
      </div>
    </div>
  );
};

export default Toast;