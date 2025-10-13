// Toast notification component for user feedback

'use client';

import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

const toastConfig = {
  success: {
    icon: CheckCircle,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-800',
    iconColor: 'text-green-600',
  },
  error: {
    icon: XCircle,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-800',
    iconColor: 'text-red-600',
  },
  warning: {
    icon: AlertCircle,
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    textColor: 'text-yellow-800',
    iconColor: 'text-yellow-600',
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-800',
    iconColor: 'text-blue-600',
  },
};

export default function Toast({ 
  message, 
  type = 'info', 
  duration = 5000,
  onClose 
}: ToastProps) {
  const config = toastConfig[type];
  const Icon = config.icon;

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <div
      className={`
        ${config.bgColor} ${config.borderColor} ${config.textColor}
        fixed bottom-6 right-6 max-w-md w-full
        flex items-center gap-3 p-4 rounded-xl border shadow-xl
        animate-slideInRight z-50
      `}
      role="alert"
      aria-live="assertive"
    >
      <Icon className={`w-5 h-5 flex-shrink-0 ${config.iconColor}`} />
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        onClick={onClose}
        className={`flex-shrink-0 ${config.iconColor} hover:opacity-70 transition-opacity`}
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// Toast Container for managing multiple toasts
interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50 space-y-3">
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          style={{ 
            animationDelay: `${index * 0.1}s`,
            marginTop: index > 0 ? '0.75rem' : '0'
          }}
        >
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => onRemove(toast.id)}
          />
        </div>
      ))}
    </div>
  );
}

