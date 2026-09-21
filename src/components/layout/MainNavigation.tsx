import React from 'react';
import { NavigationTab } from '../../types';

interface MainNavigationProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  recordCount: number;
}

export const MainNavigation: React.FC<MainNavigationProps> = ({
  currentTab,
  onSelectTab,
  recordCount
}) => {
  const tabs: { id: NavigationTab; label: string; icon: string }[] = [
    { id: 'home', label: 'Home', icon: '✦' },
    { id: 'journey', label: 'My Journey', icon: '◷' },
    { id: 'track', label: 'Track', icon: '◎' },
    { id: 'learn', label: 'Learn', icon: '📖' },
    { id: 'more', label: 'More', icon: '•••' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2 z-40 pointer-events-none">
      {/* ── FLOATING "MY RECORDS" FOLDER BUTTON (BOTTOM-RIGHT CORNER, ICON ONLY) ── */}
      <div className="flex justify-end pr-1 mb-3 pointer-events-auto">
        <button
          onClick={() => onSelectTab('records')}
          aria-label="Open Medical Records"
          title="My Records"
          className={`group relative w-13 h-13 rounded-full border flex items-center justify-center transition-all duration-300 active:scale-90 hover:scale-108 hover:-translate-y-1 animate-float-vault cursor-pointer ${
            currentTab === 'records'
              ? 'bg-gradient-to-tr from-[#EA81AA] to-[#6FAFED] text-white border-white/60 shadow-[0_12px_28px_rgba(234,129,170,0.45)]'
              : 'bg-white/95 backdrop-blur-2xl border-[#E2ECF7] text-[#192231] shadow-[0_10px_28px_rgba(111,175,237,0.3)] hover:border-[#EA81AA]'
          }`}
        >
          {/* Subtle Ambient Pink & Blue Aura Glow */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#FCE7F3] via-white to-[#E0F2FE] -z-10 opacity-80 blur-md group-hover:opacity-100 transition-opacity" />

          {/* Folder / File Icon */}
          <div className="relative flex items-center justify-center">
            <svg
              className={`w-6 h-6 transition-transform duration-300 group-hover:scale-110 ${
                currentTab === 'records' ? 'text-white' : 'text-[#38BDF8]'
              }`}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z" />
            </svg>

            {/* Pink Status Dot Notification */}
            <span className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full bg-[#EA81AA] border-2 border-white shadow-xs animate-pulse" />
          </div>
        </button>
      </div>

      {/* ── PRIMARY 5-TAB BOTTOM NAVIGATION BAR ── */}
      <nav className="pointer-events-auto bg-white/90 backdrop-blur-2xl border border-white/80 rounded-[32px] p-1.5 flex justify-around items-center shadow-[0_12px_36px_rgba(25,34,49,0.08)]">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-[24px] transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-tr from-[#FDF5F8] via-white to-[#F3F8FE] text-[#192231] border border-[#E2ECF7] shadow-xs'
                  : 'text-[#8F9EB3] hover:text-[#5A677D]'
              }`}
            >
              <span className={`text-base leading-none transition-transform duration-300 ${isActive ? 'scale-110' : 'opacity-70'}`}>
                {tab.icon}
              </span>
              <span className="text-[10px] font-bold tracking-tight mt-1">
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
