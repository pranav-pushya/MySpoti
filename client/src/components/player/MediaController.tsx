import React, { useEffect, useRef } from 'react';
import { usePlayerStore } from '../../store/usePlayerStore';
import { useMediaSession } from '../../hooks/useMediaSession';
import { getApiUrl } from '../../config/api';

export const MediaController: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Activate native lockscreen & notification media controls
  useMediaSession();

  const {
    currentTrack,
    isPlaying,
    currentTime,
    volume,
    isMuted,
    repeatMode,
    isVideoTheaterOpen,
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
      const streamUrl = getApiUrl(`/api/stream/${currentTrack.id}`);
      const resolvedTarget = streamUrl.startsWith('http') ? streamUrl : window.location.origin + streamUrl;
      if (audio.src !== resolvedTarget) {
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

  // Sync Volume & Mute (Mute background audio element if Video Theater is actively playing an MP4 video)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const isVideo = currentTrack?.format === 'mp4' || currentTrack?.format === 'webm';
    const shouldMute = isMuted || (isVideoTheaterOpen && isVideo);
    audio.volume = shouldMute ? 0 : volume;
  }, [volume, isMuted, isVideoTheaterOpen, currentTrack]);

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
