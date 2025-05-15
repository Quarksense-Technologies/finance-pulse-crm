
import React from 'react';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  colorClassName?: string; // Make this optional instead of required
  className?: string;
}

const StatusBadge = ({ status, colorClassName, className }: StatusBadgeProps) => {
  // Use the provided colorClassName or get it from the helper function
  const statusColor = colorClassName || getStatusColor(status);
  
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize",
        statusColor,
        className
      )}
    >
      {status}
    </span>
  );
};

// Helper function to determine color based on status
export const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'completed':
      return 'bg-blue-100 text-blue-800';
    case 'on-hold':
      return 'bg-yellow-100 text-yellow-800';
    case 'pending':
      return 'bg-amber-100 text-amber-800';
    case 'paid':
      return 'bg-green-100 text-green-800';
    case 'overdue':
      return 'bg-red-100 text-red-800';
    case 'materials':
      return 'bg-purple-100 text-purple-800';
    case 'manpower':
      return 'bg-blue-100 text-blue-800';
    case 'services':
      return 'bg-indigo-100 text-indigo-800';
    case 'other':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default StatusBadge;
