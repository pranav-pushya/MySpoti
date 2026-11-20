import { useEffect } from 'react';
import { usePlayerStore } from '../store/usePlayerStore';
import { getMediaUrl } from '../config/api';

export const useMediaSession = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    play,
    pause,
    nextTrack,
    prevTrack,
    seek
  } = usePlayerStore();

  // 1. Sync Track Metadata (Title, Artist, Album, Artwork)
  useEffect(() => {
    if (!('mediaSession' in navigator) || !currentTrack) return;

    try {
      const artUrl = currentTrack.coverArtUrl ? getMediaUrl(currentTrack.coverArtUrl) : null;
      const fullArtUrl = artUrl ? (artUrl.startsWith('http') ? artUrl : window.location.origin + artUrl) : null;
      const artwork = fullArtUrl
        ? [
            { src: fullArtUrl, sizes: '96x96', type: 'image/jpeg' },
            { src: fullArtUrl, sizes: '128x128', type: 'image/jpeg' },
            { src: fullArtUrl, sizes: '256x256', type: 'image/jpeg' },
            { src: fullArtUrl, sizes: '512x512', type: 'image/jpeg' }
          ]
        : [];

      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title || 'Unknown Title',
        artist: currentTrack.artist || 'Unknown Artist',
        album: currentTrack.categoryName || 'MySpoti Cloud',
        artwork
      });
    } catch (err) {
      console.warn('Failed to set MediaSession metadata:', err);
    }
  }, [currentTrack]);

  // 2. Sync Playback State (Playing vs Paused)
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;

    try {
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    } catch (err) {
      console.warn('Failed to set MediaSession playbackState:', err);
    }
  }, [isPlaying]);

  // 3. Register Action Handlers (Play, Pause, Prev, Next, Seek)
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;

    const actionHandlers: [MediaSessionAction, MediaSessionActionHandler][] = [
      ['play', () => play()],
      ['pause', () => pause()],
      ['previoustrack', () => prevTrack()],
      ['nexttrack', () => nextTrack()],
      ['stop', () => pause()],
      [
        'seekto',
        (details) => {
          if (details.seekTime !== undefined && !isNaN(details.seekTime)) {
            seek(details.seekTime);
          }
        }
      ],
      [
        'seekforward',
        (details) => {
          const offset = details.seekOffset || 10;
          seek(Math.min(duration, currentTime + offset));
        }
      ],
      [
        'seekbackward',
        (details) => {
          const offset = details.seekOffset || 10;
          seek(Math.max(0, currentTime - offset));
        }
      ]
    ];

    actionHandlers.forEach(([action, handler]) => {
      try {
        navigator.mediaSession.setActionHandler(action, handler);
      } catch (err) {
        // Some actions might not be supported in older browsers
      }
    });

    return () => {
      actionHandlers.forEach(([action]) => {
        try {
          navigator.mediaSession.setActionHandler(action, null);
        } catch {
          // Ignore cleanup errors
        }
      });
    };
  }, [play, pause, nextTrack, prevTrack, seek, duration, currentTime]);

  // 4. Sync Position State for lockscreen timeline / scrubber
  useEffect(() => {
    if (!('mediaSession' in navigator) || !navigator.mediaSession.setPositionState) return;

    try {
      if (duration > 0 && currentTime >= 0 && currentTime <= duration) {
        navigator.mediaSession.setPositionState({
          duration,
          playbackRate: 1,
          position: currentTime
        });
      }
    } catch (err) {
      // Ignore position sync errors when seeking rapidly
    }
  }, [currentTime, duration]);
};
