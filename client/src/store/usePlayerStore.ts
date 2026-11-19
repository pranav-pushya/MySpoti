import { create } from 'zustand';
import { Track } from '../types';

export type RepeatMode = 'off' | 'all' | 'one';

interface PlayerState {
  currentTrack: Track | null;
  queue: Track[];
  queueIndex: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isShuffle: boolean;
  repeatMode: RepeatMode;
  isVideoTheaterOpen: boolean;
  isMobilePlayerExpanded: boolean;

  // Actions
  playTrack: (track: Track, newQueue?: Track[]) => void;
  togglePlay: () => void;
  play: () => void;
  pause: () => void;
  seek: (seconds: number) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  toggleVideoTheater: () => void;
  setIsVideoTheaterOpen: (open: boolean) => void;
  toggleMobilePlayerExpanded: () => void;
  setIsMobilePlayerExpanded: (expanded: boolean) => void;
  addToQueue: (track: Track) => void;
  setQueue: (tracks: Track[]) => void;
  toggleCurrentTrackFavorite: () => void;
}

// Retrieve persisted volume
const getSavedVolume = (): number => {
  try {
    const saved = localStorage.getItem('myspoti_volume');
    return saved !== null ? Math.max(0, Math.min(1, parseFloat(saved))) : 0.8;
  } catch {
    return 0.8;
  }
};

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentTrack: null,
  queue: [],
  queueIndex: -1,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: getSavedVolume(),
  isMuted: false,
  isShuffle: false,
  repeatMode: 'off',
  isVideoTheaterOpen: false,
  isMobilePlayerExpanded: false,

  playTrack: (track, newQueue) => {
    let queue = newQueue || get().queue;
    
    // If track is not in queue, add or set
    let index = queue.findIndex(t => t.id === track.id);
    if (index === -1) {
      queue = [track, ...queue];
      index = 0;
    }

    set({
      currentTrack: track,
      queue,
      queueIndex: index,
      isPlaying: true,
      currentTime: 0,
      duration: track.duration || 0,
      // If it's a video track, optionally keep theater open if it was already open
      isVideoTheaterOpen: get().isVideoTheaterOpen && (track.format === 'mp4' || track.format === 'webm')
    });
  },

  togglePlay: () => {
    if (!get().currentTrack) return;
    set((state) => ({ isPlaying: !state.isPlaying }));
  },

  play: () => {
    if (!get().currentTrack) return;
    set({ isPlaying: true });
  },

  pause: () => {
    set({ isPlaying: false });
  },

  seek: (seconds) => {
    set({ currentTime: Math.max(0, Math.min(seconds, get().duration || seconds)) });
  },

  nextTrack: () => {
    const { queue, queueIndex, isShuffle, repeatMode } = get();
    if (queue.length === 0) return;

    if (repeatMode === 'one') {
      set({ currentTime: 0, isPlaying: true });
      return;
    }

    let nextIndex = queueIndex + 1;

    if (isShuffle && queue.length > 1) {
      do {
        nextIndex = Math.floor(Math.random() * queue.length);
      } while (nextIndex === queueIndex);
    } else if (nextIndex >= queue.length) {
      if (repeatMode === 'all') {
        nextIndex = 0;
      } else {
        set({ isPlaying: false });
        return;
      }
    }

    const nextTrack = queue[nextIndex];
    if (nextTrack) {
      set({
        currentTrack: nextTrack,
        queueIndex: nextIndex,
        isPlaying: true,
        currentTime: 0,
        duration: nextTrack.duration || 0
      });
    }
  },

  prevTrack: () => {
    const { queue, queueIndex, currentTime } = get();
    if (queue.length === 0) return;

    // If more than 3 seconds in, restart current track
    if (currentTime > 3) {
      set({ currentTime: 0 });
      return;
    }

    const prevIndex = queueIndex > 0 ? queueIndex - 1 : queue.length - 1;
    const prevTrack = queue[prevIndex];
    if (prevTrack) {
      set({
        currentTrack: prevTrack,
        queueIndex: prevIndex,
        isPlaying: true,
        currentTime: 0,
        duration: prevTrack.duration || 0
      });
    }
  },

  setVolume: (volume) => {
    const clamped = Math.max(0, Math.min(1, volume));
    try {
      localStorage.setItem('myspoti_volume', clamped.toString());
    } catch {}
    set({ volume: clamped, isMuted: clamped === 0 });
  },

  toggleMute: () => {
    set((state) => ({ isMuted: !state.isMuted }));
  },

  toggleShuffle: () => {
    set((state) => ({ isShuffle: !state.isShuffle }));
  },

  toggleRepeat: () => {
    set((state) => {
      const nextMode: RepeatMode = 
        state.repeatMode === 'off' ? 'all' :
        state.repeatMode === 'all' ? 'one' : 'off';
      return { repeatMode: nextMode };
    });
  },

  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration }),

  toggleVideoTheater: () => {
    const { currentTrack, isVideoTheaterOpen } = get();
    if (!currentTrack) return;
    set({ isVideoTheaterOpen: !isVideoTheaterOpen });
  },

  setIsVideoTheaterOpen: (open) => set({ isVideoTheaterOpen: open }),

  toggleMobilePlayerExpanded: () => {
    set((state) => ({ isMobilePlayerExpanded: !state.isMobilePlayerExpanded }));
  },

  setIsMobilePlayerExpanded: (expanded) => set({ isMobilePlayerExpanded: expanded }),

  addToQueue: (track) => {
    set((state) => ({ queue: [...state.queue, track] }));
  },

  setQueue: (tracks) => {
    set({ queue: tracks });
  },

  toggleCurrentTrackFavorite: () => {
    const { currentTrack } = get();
    if (!currentTrack) return;
    const newStatus = !currentTrack.isFavorite;
    set({
      currentTrack: { ...currentTrack, isFavorite: newStatus }
    });
  }
}));
