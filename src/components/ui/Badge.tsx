import React from 'react';
import { cn } from '../../lib/utils';

export function Badge({ children, variant = 'info', className }: { 
  children: React.ReactNode; 
  variant?: 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}) {
  const variants = {
    success: 'bg-emerald-900/40 text-emerald-400 border-emerald-800',
    warning: 'bg-yellow-900/40 text-yellow-400 border-yellow-800',
    danger: 'bg-red-900/40 text-red-400 border-red-800',
    info: 'bg-blue-900/40 text-blue-400 border-blue-800',
  };

  return (
    <span className={cn(
      "px-2 py-0.5 rounded-full text-xs font-semibold border", 
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
}
