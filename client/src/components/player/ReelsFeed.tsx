import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Heart, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  ChevronDown, 
  ChevronUp, 
  ListPlus, 
  Sparkles,
  Music,
  Film
} from 'lucide-react';
import { Track, Playlist } from '../../types';
import { usePlayerStore } from '../../store/usePlayerStore';
import { AddToPlaylistMenu } from '../library/AddToPlaylistMenu';
import { getApiUrl } from '../../config/api';

interface ReelsFeedProps {
  tracks: Track[];
  playlists: Playlist[];
  initialTrackId?: string;
  onClose: () => void;
  onToggleLike: (e: React.MouseEvent, trackId: string) => void;
  onAddToPlaylist: (playlistId: string, trackId: string) => Promise<boolean | void>;
  onOpenCreatePlaylist?: () => void;
}

export const ReelsFeed: React.FC<ReelsFeedProps> = ({
  tracks,
  playlists,
  initialTrackId,
  onClose,
  onToggleLike,
  onAddToPlaylist,
  onOpenCreatePlaylist
}) => {
  // Filter for video tracks only
  const videoTracks = tracks.filter(t => t.format === 'mp4' || t.format === 'webm');

  const [currentIndex, setCurrentIndex] = useState(() => {
    if (initialTrackId) {
      const idx = videoTracks.findIndex(t => t.id === initialTrackId);
      return idx >= 0 ? idx : 0;
    }
    return 0;
  });

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const currentTrack = videoTracks[currentIndex];

  // Pause background player when reels feed is active
  const { pause: pauseBackgroundPlayer } = usePlayerStore();
  useEffect(() => {
    pauseBackgroundPlayer();
  }, [pauseBackgroundPlayer]);

  // Load and play video when index changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !currentTrack) return;

    video.src = getApiUrl(`/api/stream/${currentTrack.id}`);
    video.currentTime = 0;
    if (isPlaying) {
      video.play().catch(console.warn);
    }
  }, [currentIndex, currentTrack]);

  const handleTogglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < videoTracks.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCurrentIndex(0); // Loop to start
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      handleNext();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      handlePrev();
    } else if (e.key === ' ' || e.key === 'k') {
      e.preventDefault();
      handleTogglePlay();
    } else if (e.key === 'm') {
      e.preventDefault();
      setIsMuted(prev => !prev);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, isPlaying, isMuted, videoTracks.length]);

  if (videoTracks.length === 0) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-6 text-white text-center">
        <Film className="h-16 w-16 text-purple-400 mb-4 opacity-50" />
        <h2 className="text-xl font-bold mb-2">No Video Tracks Found</h2>
        <p className="text-sm text-spotify-muted max-w-sm mb-6">
          Upload MP4 or WebM music videos to explore them in the vertical Reels Feed!
        </p>
        <button
          onClick={onClose}
          className="px-6 py-2.5 rounded-full bg-white text-black font-bold text-sm shadow-xl"
        >
          Back to Library
        </button>
      </div>
    );
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center select-none overflow-hidden animate-fadeIn">
      {/* Top Header Bar */}
      <div className="absolute top-0 left-0 right-0 z-40 p-4 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md transition-all border border-white/10"
            title="Exit Reels"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm sm:text-base tracking-tight text-white flex items-center gap-1.5">
              <span>Reels</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-600/80 text-white font-bold uppercase">
                {currentIndex + 1} / {videoTracks.length}
              </span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMuted(prev => !prev)}
            className="p-2 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md transition-all border border-white/10"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="h-5 w-5 text-red-400" /> : <Volume2 className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Main Video Viewport (Responsive: 9:16 aspect on desktop or full on mobile) */}
      <div 
        ref={containerRef}
        onClick={handleTogglePlay}
        className="relative h-full w-full max-w-md md:max-w-lg aspect-[9/16] bg-black flex items-center justify-center cursor-pointer shadow-2xl"
      >
        <video
          ref={videoRef}
          muted={isMuted}
          playsInline
          loop
          onTimeUpdate={() => {
            if (videoRef.current) {
              setCurrentTime(videoRef.current.currentTime);
            }
          }}
          onLoadedMetadata={() => {
            if (videoRef.current) {
              setDuration(videoRef.current.duration);
            }
          }}
          className="h-full w-full object-contain"
        />

        {/* Play/Pause Overlay Indicator on click */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
            <div className="h-16 w-16 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white shadow-2xl">
              <Play className="h-8 w-8 fill-white ml-1" />
            </div>
          </div>
        )}

        {/* Floating Right Actions Bar */}
        <div 
          className="absolute right-3 bottom-24 flex flex-col items-center gap-4 z-30"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Heart / Like */}
          <button
            onClick={(e) => onToggleLike(e, currentTrack.id)}
            className="flex flex-col items-center gap-1 group"
          >
            <div className={`p-3 rounded-full backdrop-blur-md transition-transform active:scale-75 ${
              currentTrack.isFavorite 
                ? 'bg-spotify-green text-black shadow-lg shadow-spotify-green/30' 
                : 'bg-black/40 hover:bg-black/60 text-white border border-white/10'
            }`}>
              <Heart className={`h-6 w-6 ${currentTrack.isFavorite ? 'fill-black' : ''}`} />
            </div>
            <span className="text-[10px] font-bold text-white drop-shadow-md">
              {currentTrack.isFavorite ? 'Liked' : 'Like'}
            </span>
          </button>

          {/* Add to Playlist */}
          <div className="flex flex-col items-center gap-1">
            <div className="p-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
              <AddToPlaylistMenu
                trackId={currentTrack.id}
                playlists={playlists}
                onAddToPlaylist={onAddToPlaylist}
                onOpenCreatePlaylist={onOpenCreatePlaylist}
              />
            </div>
            <span className="text-[10px] font-bold text-white drop-shadow-md">Save</span>
          </div>

          {/* Next Video Button */}
          <button
            onClick={handleNext}
            className="p-3 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-all border border-white/10"
            title="Next Video"
          >
            <ChevronDown className="h-6 w-6" />
          </button>
        </div>

        {/* Bottom Metadata & Controls Overlay */}
        <div 
          className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/95 via-black/70 to-transparent z-20 space-y-2 pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Title & Artist */}
          <div className="pr-16 space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-purple-600/90 text-white shadow-md">
                MP4 Video
              </span>
              {currentTrack.categoryName && (
                <span 
                  className="px-2 py-0.5 rounded text-[9px] font-semibold"
                  style={{ backgroundColor: `${currentTrack.categoryColor || '#1db954'}30`, color: currentTrack.categoryColor || '#1db954' }}
                >
                  {currentTrack.categoryName}
                </span>
              )}
            </div>

            <h3 className="text-base sm:text-lg font-bold text-white truncate drop-shadow-md">
              {currentTrack.title}
            </h3>
            <p className="text-xs text-spotify-muted truncate drop-shadow">
              {currentTrack.artist}
            </p>
          </div>

          {/* Scrubber Progress Bar */}
          <div className="pt-2">
            <div 
              className="h-1 w-full bg-white/20 rounded-full overflow-hidden cursor-pointer relative"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const ratio = clickX / rect.width;
                if (videoRef.current && duration > 0) {
                  videoRef.current.currentTime = ratio * duration;
                }
              }}
            >
              <div 
                className="h-full bg-spotify-green transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
