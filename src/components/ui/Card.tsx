import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
  key?: any;
  onClick?: () => void;
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div 
      className={cn(
        "bg-[#111827] border border-gray-800 rounded-lg p-6 shadow-xl", 
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
}

export function StatCard({ title, value, icon: Icon, trend, colorClass }: { 
  title: string; 
  value: string | number; 
  icon: any; 
  trend?: string;
  colorClass?: string;
  key?: any;
}) {
  return (
    <Card className="flex items-center space-x-4">
      <div className={cn("p-3 rounded-md bg-gray-900/50", colorClass || "text-emerald-500")}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">{title}</p>
        <h3 className="text-2xl font-bold mt-1 text-white">{value}</h3>
        {trend && <p className="text-xs text-gray-500 mt-1">{trend}</p>}
      </div>
    </Card>
  );
}
