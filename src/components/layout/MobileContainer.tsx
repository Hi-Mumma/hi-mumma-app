import React, { useState } from 'react';

interface MobileContainerProps {
  children: React.ReactNode;
}

export const MobileContainer: React.FC<MobileContainerProps> = ({ children }) => {
  const [isFramedView, setIsFramedView] = useState(true);

  return (
    <div className="min-h-screen w-full bg-[#EEF3F9] relative flex flex-col items-center justify-center p-0 md:p-6 overflow-x-hidden selection:bg-[#FBE8F0] selection:text-[#192231]">
      {/* MedTech Ambient Background Glows (Desktop view ambient light) */}
      <div className="fixed top-[-10%] left-[-10%] w-[540px] h-[540px] rounded-full bg-[#FBE8F0] filter blur-[140px] opacity-75 pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[540px] h-[540px] rounded-full bg-[#E4EFFC] filter blur-[140px] opacity-80 pointer-events-none" />

      {/* Desktop Mode Toggle Bar */}
      <header className="hidden md:flex items-center justify-between w-full max-w-[430px] mb-3 px-4 py-2.5 bg-white/80 backdrop-blur-xl rounded-full border border-white/80 shadow-[0_8px_20px_rgba(25,34,49,0.04)] z-50">
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EA81AA]" />
            <span className="w-2.5 h-2.5 -ml-1 rounded-full bg-[#6FAFED] opacity-90" />
          </div>
          <span className="text-[11px] font-bold tracking-wider text-[#5A677D] uppercase">
            HI MUMMA • Mobile Studio
          </span>
        </div>
        <button
          onClick={() => setIsFramedView(!isFramedView)}
          className="text-[11px] font-semibold text-[#5A677D] hover:text-[#192231] transition-colors"
        >
          {isFramedView ? 'Full Canvas' : 'Phone Simulator'}
        </button>
      </header>

      {/* Primary Application Shell */}
      <main
        className={`w-full bg-[#F8FAFC] flex flex-col relative transition-all duration-500 ease-out overflow-hidden ${
          isFramedView
            ? 'md:max-w-[430px] md:h-[900px] md:rounded-[44px] md:shadow-[0_24px_70px_rgba(25,34,49,0.12)] md:border-[8px] md:border-white'
            : 'max-w-2xl min-h-screen shadow-lg'
        }`}
      >
        {/* Scrollable Viewport */}
        <div className="flex-1 overflow-y-auto px-4 pb-32 pt-2 no-scrollbar">
          {children}
        </div>
      </main>
    </div>
  );
};
