import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showTagline = false,
  className = ''
}) => {
  const iconDimensions = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16'
  }[size];

  const titleSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl'
  }[size];

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Official Brand Logo Icon */}
      <div className={`relative ${iconDimensions} shrink-0 rounded-2xl overflow-hidden shadow-xs border border-white/80 bg-white`}>
        <img
          src="/logo.png"
          alt="Hi Mumma"
          className="w-full h-full object-contain"
          onError={(e) => {
            // Graceful fallback to styled vector badge if image path changes
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      </div>

      <div>
        <div className="flex items-center gap-1 leading-none">
          <span className={`font-black tracking-tight ${titleSizes} text-[#38BDF8]`}>
            Hi
          </span>
          <span className={`font-black tracking-tight ${titleSizes} text-[#EA81AA]`}>
            Mumma
          </span>
          <span className="text-[9px] font-bold text-[#EA81AA] -mt-2">™</span>
        </div>
        {showTagline ? (
          <p className="text-[10px] font-medium text-[#7A8B9E] tracking-tight mt-0.5 flex items-center gap-1">
            <span>A healthier tomorrow, together</span>
            <span className="text-[#EA81AA] text-[9px]">💗</span>
          </p>
        ) : (
          <p className="text-[10px] font-medium text-[#8F9EB3]">
            Maternal Journey Companion
          </p>
        )}
      </div>
    </div>
  );
};
