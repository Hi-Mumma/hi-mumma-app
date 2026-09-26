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
    <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto px-4 pb-3 pt-1 z-40 pointer-events-none">
      {/* ── FLOATING "MY RECORDS" FOLDER BUTTON (BOTTOM-RIGHT CORNER) ── */}
      <div className="flex justify-end pr-1 mb-2 pointer-events-auto">
        <button
          onClick={() => onSelectTab('records')}
          aria-label="Open Medical Records"
          title="My Records"
          className={`group relative w-11 h-11 rounded-full border flex items-center justify-center transition-all duration-200 active:scale-95 hover:scale-105 cursor-pointer shadow-md ${
            currentTab === 'records'
              ? 'bg-gradient-to-tr from-[#EA81AA] to-[#6FAFED] text-white border-white'
              : 'bg-white/95 backdrop-blur-xl border-[#E2ECF7] text-[#192231] hover:border-[#EA81AA]'
          }`}
        >
          {/* Folder Icon */}
          <div className="relative flex items-center justify-center">
            <svg
              className={`w-5 h-5 transition-transform duration-200 ${
                currentTab === 'records' ? 'text-white' : 'text-[#38BDF8]'
              }`}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z" />
            </svg>

            {/* Pink Status Dot Notification */}
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#EA81AA] border-2 border-white shadow-xs" />
          </div>
        </button>
      </div>

      {/* ── PRIMARY 5-TAB BOTTOM NAVIGATION BAR ── */}
      <nav className="pointer-events-auto bg-white/95 backdrop-blur-xl border border-white/80 rounded-full p-1.5 flex justify-around items-center shadow-[0_8px_30px_rgba(25,34,49,0.08)]">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-full transition-all duration-200 ${
                isActive
                  ? 'bg-[#192231] text-white shadow-xs'
                  : 'text-[#8F9EB3] hover:text-[#5A677D]'
              }`}
            >
              <span className={`text-base leading-none transition-transform duration-200 ${isActive ? 'scale-110 text-white' : 'opacity-80'}`}>
                {tab.icon}
              </span>
              <span className="text-[10px] font-bold tracking-tight mt-0.5">
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
