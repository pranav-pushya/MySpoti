import React, { useEffect, useRef } from 'react';
import { usePlayerStore } from '../../store/usePlayerStore';

export const MediaController: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const {
    currentTrack,
    isPlaying,
    currentTime,
    volume,
    isMuted,
    repeatMode,
    setCurrentTime,
    setDuration,
    nextTrack,
    pause
  } = usePlayerStore();

  // Sync stream source when currentTrack changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (currentTrack) {
      const streamUrl = `/api/stream/${currentTrack.id}`;
      if (audio.src !== window.location.origin + streamUrl) {
        audio.src = streamUrl;
        audio.load();
        if (isPlaying) {
          audio.play().catch((err) => {
            console.warn('Playback autoplay prevented:', err);
            pause();
          });
        }
      }
    } else {
      audio.pause();
      audio.src = '';
    }
  }, [currentTrack]);

  // Sync Play / Pause state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    if (isPlaying) {
      if (audio.paused) {
        audio.play().catch((err) => {
          console.warn('Playback failed:', err);
          pause();
        });
      }
    } else {
      if (!audio.paused) {
        audio.pause();
      }
    }
  }, [isPlaying]);

  // Sync Volume & Mute
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  // Handle external seek
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Only update if difference is noticeable (> 1s) to prevent jitter during normal timeupdate
    if (Math.abs(audio.currentTime - currentTime) > 1.2) {
      audio.currentTime = currentTime;
    }
  }, [currentTime]);

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setCurrentTime(audio.currentTime);
  };

  const handleLoadedMetadata = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.duration && !isNaN(audio.duration)) {
      setDuration(audio.duration);
    }
  };

  const handleEnded = () => {
    if (repeatMode === 'one') {
      const audio = audioRef.current;
      if (audio) {
        audio.currentTime = 0;
        audio.play().catch(console.warn);
      }
    } else {
      nextTrack();
    }
  };

  return (
    <audio
      ref={audioRef}
      onTimeUpdate={handleTimeUpdate}
      onLoadedMetadata={handleLoadedMetadata}
      onEnded={handleEnded}
      preload="metadata"
      className="hidden"
    />
  );
};
