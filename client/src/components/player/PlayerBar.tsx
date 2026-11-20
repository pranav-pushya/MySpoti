import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Shuffle, 
  Repeat, 
  Repeat1, 
  Volume2, 
  VolumeX, 
  Volume1, 
  Film, 
  Music, 
  ChevronDown, 
  Maximize2,
  Heart,
  Cast
} from 'lucide-react';
import { usePlayerStore } from '../../store/usePlayerStore';
import { extractDominantColor, ExtractedColor } from '../../utils/colorExtractor';
import { getApiUrl, getMediaUrl } from '../../config/api';
import { useDeviceSync } from '../../hooks/useDeviceSync';
import { DeviceConnectModal } from './DeviceConnectModal';
import { Track } from '../../types';

interface PlayerBarProps {
  tracks?: Track[];
}

const formatTime = (seconds: number): string => {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const PlayerBar: React.FC<PlayerBarProps> = ({ tracks = [] }) => {
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
  const {
    localDevice,
    devices,
    isSyncing,
    refreshDevices,
    transferPlaybackTo,
    transferPlaybackHere
  } = useDeviceSync(tracks);
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffle,
    repeatMode,
    isVideoTheaterOpen,
    isMobilePlayerExpanded,
    togglePlay,
    seek,
    nextTrack,
    prevTrack,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    toggleVideoTheater,
    toggleMobilePlayerExpanded,
    toggleCurrentTrackFavorite
  } = usePlayerStore();

  const [isSeeking, setIsSeeking] = useState(false);
  const [tempSeekTime, setTempSeekTime] = useState(0);
  const [ambientColor, setAmbientColor] = useState<ExtractedColor | null>(null);

  useEffect(() => {
    if (currentTrack?.coverArtUrl) {
      extractDominantColor(getMediaUrl(currentTrack.coverArtUrl)).then(setAmbientColor);
    } else {
      setAmbientColor(null);
    }
  }, [currentTrack?.coverArtUrl]);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentTrack) return;
    toggleCurrentTrackFavorite();
    try {
      await fetch(getApiUrl(`/api/tracks/${currentTrack.id}/like`), { method: 'POST' });
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  if (!currentTrack) return null;

  const isVideo = currentTrack.format === 'mp4' || currentTrack.format === 'webm';
  const effectiveProgress = isSeeking ? tempSeekTime : currentTime;
  const progressPercent = duration > 0 ? (effectiveProgress / duration) * 100 : 0;

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempSeekTime(parseFloat(e.target.value));
  };

  const handleSeekStart = () => {
    setIsSeeking(true);
    setTempSeekTime(currentTime);
  };

  const handleSeekEnd = () => {
    setIsSeeking(false);
    seek(tempSeekTime);
  };

  return (
    <>
      {/* ======================================================== */}
      {/* 1. DESKTOP & TABLET PLAYER BAR (md:flex)                 */}
      {/* ======================================================== */}
      <div 
        className="hidden md:flex h-20 bg-spotify-base/95 backdrop-blur-xl border-t border-white/10 px-4 items-center justify-between text-white select-none z-40 transition-colors duration-700"
        style={{
          background: ambientColor
            ? `linear-gradient(to top, rgba(18, 18, 18, 0.96), ${ambientColor.rgba(0.12)})`
            : undefined
        }}
      >
        {/* Left Column: Track Info */}
        <div className="flex items-center gap-3 w-1/4 min-w-[200px]">
          <div 
            onClick={() => isVideo && toggleVideoTheater()}
            className={`relative h-14 w-14 rounded-md overflow-hidden bg-spotify-card shrink-0 flex items-center justify-center border border-white/10 group ${
              isVideo ? 'cursor-pointer' : ''
            }`}
          >
            {currentTrack.coverArtUrl ? (
              <img src={getMediaUrl(currentTrack.coverArtUrl)} alt={currentTrack.title} className="w-full h-full object-cover" />
            ) : isVideo ? (
              <Film className="h-6 w-6 text-purple-400" />
            ) : (
              <Music className="h-6 w-6 text-spotify-green" />
            )}

            {/* Video Theater Hover Indicator */}
            {isVideo && (
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Maximize2 className="h-4 w-4 text-white" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-white truncate hover:underline cursor-pointer">
                {currentTrack.title}
              </h4>
              <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded shrink-0 ${
                isVideo ? 'bg-purple-600/80 text-white' : 'bg-white/10 text-spotify-muted'
              }`}>
                {isVideo ? 'MP4 Video' : currentTrack.format.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-spotify-muted truncate">{currentTrack.artist}</p>
            {currentTrack.categoryName && (
              <span 
                className="inline-block text-[9px] font-medium mt-0.5"
                style={{ color: currentTrack.categoryColor || '#1db954' }}
              >
                {currentTrack.categoryName}
              </span>
            )}
          </div>

          {/* Heart Button (Desktop) */}
          <button
            onClick={handleLike}
            className={`p-1.5 rounded-full transition-all hover:scale-110 shrink-0 ${
              currentTrack.isFavorite ? 'text-spotify-green' : 'text-spotify-muted hover:text-white'
            }`}
            title={currentTrack.isFavorite ? 'Remove from Liked Songs' : 'Save to Liked Songs'}
          >
            <Heart className={`h-4 w-4 ${currentTrack.isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Center Column: Transport Controls & Scrubber */}
        <div className="flex flex-col items-center gap-1.5 w-2/4 max-w-xl">
          {/* Buttons */}
          <div className="flex items-center gap-5">
            {/* Shuffle */}
            <button
              onClick={toggleShuffle}
              className={`p-1.5 rounded-full transition-colors relative ${
                isShuffle ? 'text-spotify-green' : 'text-spotify-muted hover:text-white'
              }`}
              title="Shuffle"
            >
              <Shuffle className="h-4 w-4" />
              {isShuffle && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-1 bg-spotify-green rounded-full" />}
            </button>

            {/* Previous Track */}
            <button
              onClick={prevTrack}
              className="text-spotify-muted hover:text-white transition-colors p-1"
              title="Previous Track"
            >
              <SkipBack className="h-5 w-5 fill-current" />
            </button>

            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="h-9 w-9 rounded-full bg-white hover:bg-white/90 text-black flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5 fill-black text-black" />
              ) : (
                <Play className="h-5 w-5 fill-black text-black ml-0.5" />
              )}
            </button>

            {/* Next Track */}
            <button
              onClick={nextTrack}
              className="text-spotify-muted hover:text-white transition-colors p-1"
              title="Next Track"
            >
              <SkipForward className="h-5 w-5 fill-current" />
            </button>

            {/* Repeat */}
            <button
              onClick={toggleRepeat}
              className={`p-1.5 rounded-full transition-colors relative ${
                repeatMode !== 'off' ? 'text-spotify-green' : 'text-spotify-muted hover:text-white'
              }`}
              title={`Repeat: ${repeatMode}`}
            >
              {repeatMode === 'one' ? <Repeat1 className="h-4 w-4" /> : <Repeat className="h-4 w-4" />}
              {repeatMode !== 'off' && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-1 bg-spotify-green rounded-full" />
              )}
            </button>
          </div>

          {/* Time Scrubber */}
          <div className="w-full flex items-center gap-2 text-[11px] text-spotify-muted font-mono">
            <span className="w-10 text-right">{formatTime(effectiveProgress)}</span>
            <div className="relative flex-1 flex items-center group">
              <input
                type="range"
                min="0"
                max={duration || 100}
                step="0.1"
                value={effectiveProgress}
                onChange={handleSeekChange}
                onMouseDown={handleSeekStart}
                onMouseUp={handleSeekEnd}
                onTouchStart={handleSeekStart}
                onTouchEnd={handleSeekEnd}
                className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer outline-none group-hover:h-1.5 transition-all"
                style={{
                  background: `linear-gradient(to right, #1db954 ${progressPercent}%, rgba(255,255,255,0.2) ${progressPercent}%)`
                }}
              />
            </div>
            <span className="w-10">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right Column: Video Mode & Volume */}
        <div className="flex items-center justify-end gap-3 w-1/4 min-w-[180px]">
          {/* MP4 Video Theater Mode Toggle */}
          {isVideo && (
            <button
              onClick={toggleVideoTheater}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                isVideoTheaterOpen
                  ? 'bg-purple-600 border-purple-400 text-white shadow-md shadow-purple-600/30'
                  : 'bg-spotify-highlight hover:bg-spotify-elevated border-white/10 text-purple-300 hover:text-white'
              }`}
              title="Toggle MP4 Video Theater"
            >
              <Film className="h-3.5 w-3.5" />
              <span>Video View</span>
            </button>
          )}

          {/* Volume Control */}
          <div className="flex items-center gap-2">
            <button 
              onClick={toggleMute}
              className="text-spotify-muted hover:text-white transition-colors"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="h-4 w-4 text-red-400" />
              ) : volume < 0.5 ? (
                <Volume1 className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-20 lg:w-24 h-1 bg-white/20 rounded-full appearance-none cursor-pointer outline-none hover:h-1.5 transition-all"
              style={{
                background: `linear-gradient(to right, #1db954 ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.2) ${(isMuted ? 0 : volume) * 100}%)`
              }}
            />
          </div>

          {/* Spotify Connect Device Sync Button */}
          <button
            onClick={() => setIsDeviceModalOpen(true)}
            className={`relative p-1.5 rounded-full transition-colors ${
              devices.length > 1
                ? 'text-spotify-green hover:text-white bg-spotify-green/10'
                : 'text-spotify-muted hover:text-white hover:bg-white/5'
            }`}
            title="Connect to a device / Cross-Device Sync"
          >
            <Cast className="h-4 w-4" />
            {devices.length > 1 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-spotify-green ring-2 ring-black" />
            )}
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. MOBILE MINI-PLAYER BAR (< md screens)                 */}
      {/* ======================================================== */}
      <div 
        onClick={toggleMobilePlayerExpanded}
        className="md:hidden fixed bottom-14 left-2 right-2 h-14 bg-spotify-elevated/95 backdrop-blur-xl border border-white/10 rounded-lg flex items-center justify-between px-3 z-30 shadow-2xl cursor-pointer transition-colors duration-700"
        style={{
          background: ambientColor
            ? `linear-gradient(to right, rgba(28, 28, 28, 0.95), ${ambientColor.rgba(0.2)})`
            : undefined
        }}
      >
        {/* Top Progress Line */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/10 rounded-t-lg overflow-hidden">
          <div 
            className="h-full bg-spotify-green transition-all duration-200"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Track thumbnail + title */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="h-10 w-10 rounded bg-spotify-card shrink-0 overflow-hidden flex items-center justify-center">
            {currentTrack.coverArtUrl ? (
              <img src={getMediaUrl(currentTrack.coverArtUrl)} alt={currentTrack.title} className="w-full h-full object-cover" />
            ) : isVideo ? (
              <Film className="h-5 w-5 text-purple-400" />
            ) : (
              <Music className="h-5 w-5 text-spotify-green" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-white truncate">{currentTrack.title}</h4>
            <p className="text-[10px] text-spotify-muted truncate">{currentTrack.artist}</p>
          </div>
        </div>

        {/* Right buttons: Video indicator + Like + Play/Pause */}
        <div className="flex items-center gap-2 shrink-0 ml-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={handleLike}
            className={`p-1.5 transition-colors ${
              currentTrack.isFavorite ? 'text-spotify-green' : 'text-spotify-muted hover:text-white'
            }`}
          >
            <Heart className={`h-4 w-4 ${currentTrack.isFavorite ? 'fill-current' : ''}`} />
          </button>

          {isVideo && (
            <button
              onClick={() => {
                toggleVideoTheater();
              }}
              className="p-1.5 rounded-full text-purple-400 bg-purple-950/40 border border-purple-500/30"
              title="Watch Video"
            >
              <Film className="h-4 w-4" />
            </button>
          )}

          <button
            onClick={togglePlay}
            className="h-9 w-9 rounded-full bg-white text-black flex items-center justify-center shadow-md active:scale-90 transition-transform"
          >
            {isPlaying ? (
              <Pause className="h-4 w-4 fill-black text-black" />
            ) : (
              <Play className="h-4 w-4 fill-black text-black ml-0.5" />
            )}
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. MOBILE FULL-SCREEN NOW-PLAYING SHEET (9:16 portrait)  */}
      {/* ======================================================== */}
      {isMobilePlayerExpanded && (
        <div 
          className="md:hidden fixed inset-0 z-50 bg-gradient-to-b from-spotify-card via-spotify-base to-black flex flex-col p-6 text-white animate-fade-in select-none transition-colors duration-700"
          style={{
            background: ambientColor
              ? `linear-gradient(to bottom, ${ambientColor.rgba(0.45)} 0%, rgba(18, 18, 18, 0.96) 60%, #000000 100%)`
              : undefined
          }}
        >
          {/* Top Collapse Header */}
          <div className="flex items-center justify-between pb-4">
            <button 
              onClick={toggleMobilePlayerExpanded}
              className="p-2 text-spotify-muted hover:text-white"
            >
              <ChevronDown className="h-6 w-6" />
            </button>
            <div className="text-center">
              <p className="text-[10px] uppercase font-bold tracking-widest text-spotify-muted">Playing from Library</p>
              <p className="text-xs font-semibold text-white">{currentTrack.categoryName || 'MySpoti Cloud'}</p>
            </div>
            <div className="w-6" />
          </div>

          {/* Large Media Display */}
          <div className="flex-1 flex items-center justify-center my-4">
            <div className="w-full max-w-[320px] aspect-square rounded-2xl overflow-hidden bg-spotify-elevated shadow-2xl border border-white/10 flex items-center justify-center">
              {currentTrack.coverArtUrl ? (
                <img src={getMediaUrl(currentTrack.coverArtUrl)} alt={currentTrack.title} className="w-full h-full object-cover" />
              ) : isVideo ? (
                <div className="text-center space-y-2">
                  <Film className="h-16 w-16 text-purple-400 mx-auto" />
                  <p className="text-xs text-purple-300 font-semibold">MP4 Music Video</p>
                </div>
              ) : (
                <Music className="h-16 w-16 text-spotify-green" />
              )}
            </div>
          </div>

          {/* Track Details & Action Row */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h3 className="text-xl font-bold text-white truncate">{currentTrack.title}</h3>
                <p className="text-sm text-spotify-muted truncate">{currentTrack.artist}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleLike}
                  className={`p-2 rounded-full transition-transform active:scale-90 ${
                    currentTrack.isFavorite ? 'text-spotify-green' : 'text-spotify-muted'
                  }`}
                >
                  <Heart className={`h-6 w-6 ${currentTrack.isFavorite ? 'fill-current' : ''}`} />
                </button>

                {isVideo && (
                  <button
                    onClick={() => {
                      toggleVideoTheater();
                      toggleMobilePlayerExpanded();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-600/90 text-white text-xs font-bold shadow-lg"
                  >
                    <Film className="h-4 w-4" />
                    <span>Watch</span>
                  </button>
                )}
              </div>
            </div>

            {/* Scrubber */}
            <div className="space-y-1">
              <input
                type="range"
                min="0"
                max={duration || 100}
                step="0.1"
                value={effectiveProgress}
                onChange={handleSeekChange}
                onMouseDown={handleSeekStart}
                onMouseUp={handleSeekEnd}
                onTouchStart={handleSeekStart}
                onTouchEnd={handleSeekEnd}
                className="w-full h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer outline-none"
                style={{
                  background: `linear-gradient(to right, #1db954 ${progressPercent}%, rgba(255,255,255,0.2) ${progressPercent}%)`
                }}
              />
              <div className="flex justify-between text-xs text-spotify-muted font-mono">
                <span>{formatTime(effectiveProgress)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Main Controls */}
            <div className="flex items-center justify-between px-2 pt-2">
              <button
                onClick={toggleShuffle}
                className={`p-2 ${isShuffle ? 'text-spotify-green' : 'text-spotify-muted'}`}
              >
                <Shuffle className="h-5 w-5" />
              </button>

              <button onClick={prevTrack} className="p-2 text-white">
                <SkipBack className="h-7 w-7 fill-current" />
              </button>

              <button
                onClick={togglePlay}
                className="h-16 w-16 rounded-full bg-white text-black flex items-center justify-center shadow-2xl active:scale-95 transition-transform"
              >
                {isPlaying ? (
                  <Pause className="h-8 w-8 fill-black text-black" />
                ) : (
                  <Play className="h-8 w-8 fill-black text-black ml-1" />
                )}
              </button>

              <button onClick={nextTrack} className="p-2 text-white">
                <SkipForward className="h-7 w-7 fill-current" />
              </button>

              <button
                onClick={toggleRepeat}
                className={`p-2 ${repeatMode !== 'off' ? 'text-spotify-green' : 'text-spotify-muted'}`}
              >
                {repeatMode === 'one' ? <Repeat1 className="h-5 w-5" /> : <Repeat className="h-5 w-5" />}
              </button>
            </div>

            {/* Mobile Sheet Device Connect Trigger */}
            <div className="pt-3 flex items-center justify-between border-t border-white/10 text-xs">
              <button
                onClick={() => setIsDeviceModalOpen(true)}
                className="flex items-center gap-2 text-zinc-300 hover:text-white"
              >
                <Cast className={`w-4 h-4 ${devices.length > 1 ? 'text-spotify-green' : 'text-zinc-400'}`} />
                <span className="truncate">
                  {devices.length > 1 ? `Sync with ${localDevice.deviceName}` : 'Connect to a device'}
                </span>
              </button>
              {devices.length > 1 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-spotify-green/20 text-spotify-green font-semibold">
                  {devices.length} Online
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cross-Device Spotify Connect Modal */}
      <DeviceConnectModal
        isOpen={isDeviceModalOpen}
        onClose={() => setIsDeviceModalOpen(false)}
        localDevice={localDevice}
        devices={devices}
        isSyncing={isSyncing}
        onRefresh={refreshDevices}
        onTransferTo={transferPlaybackTo}
        onTransferHere={transferPlaybackHere}
      />
    </>
  );
};
