
import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
}

const StatCard = ({
  title,
  value,
  icon,
  description,
  trend,
  trendValue,
  className
}: StatCardProps) => {
  return (
    <div className={cn(
      "bg-white rounded-lg shadow-sm p-6 border border-gray-100",
      className
    )}>
      <div className="flex justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
          
          {trend && (
            <div className="flex items-center mt-2">
              <span
                className={cn(
                  "text-xs font-medium px-2 py-0.5 rounded-full",
                  trend === 'up' ? 'bg-green-100 text-green-800' : 
                  trend === 'down' ? 'bg-red-100 text-red-800' : 
                  'bg-gray-100 text-gray-800'
                )}
              >
                {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '•'} {trendValue}
              </span>
            </div>
          )}
          
          {description && (
            <p className="text-xs text-gray-500 mt-2">{description}</p>
          )}
        </div>
        
        {icon && (
          <div className="p-2 bg-primary/10 rounded-lg">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
