import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { useAppStore } from '../../store/useAppStore';

interface ShellProps {
  children: React.ReactNode;
  categories?: { id: string; name: string; color: string }[];
  playerSlot?: React.ReactNode;
  aiDrawerSlot?: React.ReactNode;
  uploadModalSlot?: React.ReactNode;
}

export const Shell: React.FC<ShellProps> = ({
  children,
  categories = [],
  playerSlot,
  aiDrawerSlot,
  uploadModalSlot
}) => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-black text-white font-sans">
      {/* Left Sidebar (Desktop & Tablet) */}
      <Sidebar categories={categories} />

      {/* Main Container Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full p-2 pl-0 md:pl-0">
        <div className="flex-1 flex flex-col bg-spotify-base rounded-lg overflow-hidden relative border border-white/5 shadow-2xl">
          {/* Header */}
          <Header />

          {/* Main Scrollable View */}
          <main className="flex-1 overflow-y-auto custom-scrollbar pb-24 md:pb-24">
            {children}
          </main>

          {/* AI Drawer Slot (Slide-over / responsive drawer) */}
          {aiDrawerSlot}
        </div>
      </div>

      {/* Upload Modal Slot */}
      {uploadModalSlot}

      {/* Persistent Bottom Player Bar Slot */}
      <div className="fixed bottom-12 md:bottom-0 left-0 right-0 z-30 pointer-events-auto">
        {playerSlot}
      </div>

      {/* Mobile Bottom Navigation (Only visible on screens < 768px) */}
      <MobileNav />
    </div>
  );
};
