import React from 'react';

interface StatusBadgeProps {
  status: 'present' | 'absent' | 'pending' | 'approved' | 'rejected' | 'active' | 'inactive';
  label?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, size = 'sm' }) => {
  const styles: Record<string, string> = {
    present: 'bg-green-950/80 text-green-400 border-green-800/80',
    approved: 'bg-green-950/80 text-green-400 border-green-800/80',
    active: 'bg-green-950/80 text-green-400 border-green-800/80',
    
    absent: 'bg-red-950/80 text-red-400 border-red-800/80',
    rejected: 'bg-red-950/80 text-red-400 border-red-800/80',
    inactive: 'bg-zinc-900 text-zinc-500 border-zinc-700',
    
    pending: 'bg-amber-950/80 text-amber-400 border-amber-800/80',
  };

  const currentStyle = styles[status] || 'bg-zinc-800 text-zinc-300 border-zinc-700';
  const displayLabel = label || status.toUpperCase();

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center font-mono font-semibold tracking-wide border rounded ${sizeClasses} ${currentStyle}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-80" />
      {displayLabel}
    </span>
  );
};
