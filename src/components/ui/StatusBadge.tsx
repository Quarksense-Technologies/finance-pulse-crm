
import React from 'react';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  colorClassName: string;
  className?: string;
}

const StatusBadge = ({ status, colorClassName, className }: StatusBadgeProps) => {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize",
        colorClassName,
        className
      )}
    >
      {status}
    </span>
  );
};

export default StatusBadge;
