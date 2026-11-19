import React, { useRef, useEffect } from 'react';
import { 
  X, 
  Minimize2, 
  Maximize, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Sparkles,
  Pipette
} from 'lucide-react';
import { usePlayerStore } from '../../store/usePlayerStore';

export const VideoTheater: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const {
    currentTrack,
    isPlaying,
    currentTime,
    volume,
    isMuted,
    isVideoTheaterOpen,
    togglePlay,
    toggleVideoTheater,
    seek,
    setVolume,
    toggleMute,
    setCurrentTime
  } = usePlayerStore();

  const isVideo = currentTrack && (currentTrack.format === 'mp4' || currentTrack.format === 'webm');

  // Synchronize video element playback time with global store
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isVideo || !isVideoTheaterOpen || !currentTrack) return;

    const streamUrl = `/api/stream/${currentTrack.id}`;
    if (video.src !== window.location.origin + streamUrl) {
      video.src = streamUrl;
      video.currentTime = currentTime;
      if (isPlaying) {
        video.play().catch(console.warn);
      }
    }
  }, [currentTrack, isVideoTheaterOpen]);

  // Synchronize play/pause
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isVideoTheaterOpen) return;

    if (isPlaying) {
      if (video.paused) {
        video.play().catch(console.warn);
      }
    } else {
      if (!video.paused) {
        video.pause();
      }
    }
  }, [isPlaying, isVideoTheaterOpen]);

  // Synchronize seek time
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isVideoTheaterOpen) return;

    if (Math.abs(video.currentTime - currentTime) > 1.2) {
      video.currentTime = currentTime;
    }
  }, [currentTime, isVideoTheaterOpen]);

  // Sync volume
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  if (!isVideoTheaterOpen || !isVideo || !currentTrack) {
    return null;
  }

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    setCurrentTime(video.currentTime);
  };

  const handleTogglePiP = async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await video.requestPictureInPicture();
      }
    } catch (err) {
      console.warn('Picture-in-Picture error:', err);
    }
  };

  const handleToggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;
    if (!document.fullscreenElement) {
      video.requestFullscreen().catch(console.warn);
    } else {
      document.exitFullscreen().catch(console.warn);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col p-3 sm:p-6 animate-fade-in select-none">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between pb-3 text-white border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-600 text-white">
            MP4 Video Theater
          </span>
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-bold text-white truncate max-w-xs sm:max-w-md">
              {currentTrack.title}
            </h3>
            <p className="text-xs text-spotify-muted truncate">{currentTrack.artist}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* PiP Button */}
          {'pictureInPictureEnabled' in document && (
            <button
              onClick={handleTogglePiP}
              className="p-2 rounded-full bg-spotify-highlight hover:bg-spotify-elevated text-spotify-muted hover:text-white transition-colors"
              title="Picture in Picture"
            >
              <Minimize2 className="h-4 w-4" />
            </button>
          )}

          {/* Fullscreen Button */}
          <button
            onClick={handleToggleFullscreen}
            className="p-2 rounded-full bg-spotify-highlight hover:bg-spotify-elevated text-spotify-muted hover:text-white transition-colors"
            title="Full Screen"
          >
            <Maximize className="h-4 w-4" />
          </button>

          {/* Close / Minimize to Audio */}
          <button
            onClick={toggleVideoTheater}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-black font-bold text-xs hover:bg-white/90 transition-transform active:scale-95 shadow-md"
            title="Minimize to Audio Mode"
          >
            <X className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>Audio Mode</span>
          </button>
        </div>
      </div>

      {/* Main Video Viewport (Preserves 16:9 or 9:16 aspect ratio) */}
      <div className="flex-1 flex items-center justify-center my-3 relative overflow-hidden rounded-xl bg-black/60 border border-white/5 shadow-2xl">
        <video
          ref={videoRef}
          onTimeUpdate={handleTimeUpdate}
          playsInline
          className="max-h-full max-w-full object-contain rounded-lg shadow-2xl"
          onClick={togglePlay}
        />

        {/* Video Overlay Play Button if paused */}
        {!isPlaying && (
          <div 
            onClick={togglePlay}
            className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer"
          >
            <div className="h-16 w-16 rounded-full bg-spotify-green text-black flex items-center justify-center shadow-2xl hover:scale-105 transition-transform">
              <Play className="h-8 w-8 fill-black text-black ml-1" />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Hint */}
      <div className="flex items-center justify-between text-[11px] text-spotify-muted px-2 shrink-0">
        <span>💡 Clicking <b>Audio Mode</b> keeps the music playing in the background while you browse.</span>
        <span>Aspect Ratio Preserved (16:9 / 9:16)</span>
      </div>
    </div>
  );
};
