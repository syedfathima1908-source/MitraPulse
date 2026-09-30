import React from 'react';

interface MitraLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
}

export const MitraLogo: React.FC<MitraLogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = true,
}) => {
  const sizeClasses = {
    sm: { title: 'text-lg', subtitle: 'text-[8px]', icon: 'h-6' },
    md: { title: 'text-2xl', subtitle: 'text-[10px]', icon: 'h-8' },
    lg: { title: 'text-4xl', subtitle: 'text-xs', icon: 'h-12' },
    xl: { title: 'text-5xl', subtitle: 'text-sm', icon: 'h-16' },
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={`flex flex-col items-center justify-center select-none ${className}`}>
      {/* MITRA Stylized Geometric Vector Emblem + Text */}
      <div className="flex items-center gap-3">
        <svg
          viewBox="0 0 200 45"
          className={`${currentSize.icon} w-auto fill-current text-white`}
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* M */}
          <path d="M 5 40 L 5 5 L 18 25 L 31 5 L 31 40 L 22 40 L 22 18 L 18 24 L 14 18 L 14 40 Z" />
          {/* I */}
          <path d="M 42 5 L 50 5 L 50 40 L 42 40 Z" />
          {/* T */}
          <path d="M 60 5 L 90 5 L 90 13 L 79 13 L 79 40 L 71 40 L 71 13 L 60 13 Z" />
          {/* R */}
          <path d="M 100 5 L 120 5 C 128 5 133 9 133 17 C 133 23 129 27 122 28 L 134 40 L 123 40 L 112 28 L 109 28 L 109 40 L 100 40 Z M 109 13 L 119 13 C 123 13 125 14 125 17 C 125 20 123 21 119 21 L 109 21 Z" />
          {/* A */}
          <path d="M 152 40 L 165 5 L 175 5 L 188 40 L 178 40 L 174 29 L 166 29 L 162 40 Z M 168 22 L 172 22 L 170 14 Z" />
        </svg>
      </div>

      {showSubtitle && (
        <span
          className={`${currentSize.subtitle} tracking-[0.25em] text-zinc-400 font-semibold uppercase mt-1 text-center`}
        >
          Vishnu Institute of Technology
        </span>
      )}
    </div>
  );
};
