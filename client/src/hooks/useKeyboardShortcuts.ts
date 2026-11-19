import { useEffect } from 'react';
import { usePlayerStore } from '../store/usePlayerStore';
import { useAppStore } from '../store/useAppStore';

export const useKeyboardShortcuts = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    seek,
    toggleMute,
    setIsVideoTheaterOpen,
    setIsMobilePlayerExpanded
  } = usePlayerStore();

  const {
    isUploadModalOpen,
    setIsUploadModalOpen,
    isAiDrawerOpen,
    setIsAiDrawerOpen
  } = useAppStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input, textarea, or select
      const activeElement = document.activeElement;
      const isInput = 
        activeElement instanceof HTMLInputElement || 
        activeElement instanceof HTMLTextAreaElement || 
        activeElement instanceof HTMLSelectElement ||
        (activeElement as HTMLElement)?.isContentEditable;

      if (isInput) {
        if (e.key === 'Escape') {
          (activeElement as HTMLElement).blur();
        }
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          if (currentTrack) togglePlay();
          break;

        case 'ArrowRight':
          e.preventDefault();
          if (currentTrack) seek(currentTime + 5);
          break;

        case 'ArrowLeft':
          e.preventDefault();
          if (currentTrack) seek(currentTime - 5);
          break;

        case 'KeyM':
          e.preventDefault();
          toggleMute();
          break;

        case 'Escape':
          if (isUploadModalOpen) setIsUploadModalOpen(false);
          if (isAiDrawerOpen) setIsAiDrawerOpen(false);
          setIsVideoTheaterOpen(false);
          setIsMobilePlayerExpanded(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    isUploadModalOpen,
    isAiDrawerOpen,
    togglePlay,
    seek,
    toggleMute,
    setIsUploadModalOpen,
    setIsAiDrawerOpen,
    setIsVideoTheaterOpen,
    setIsMobilePlayerExpanded
  ]);
};
