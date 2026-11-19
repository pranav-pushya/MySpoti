import React from 'react';
import { Track } from '../../types';
import { Play, Pause, Clock, Trash2, Film, Music } from 'lucide-react';
import { usePlayerStore } from '../../store/usePlayerStore';

interface TrackTableProps {
  tracks: Track[];
  onDeleteTrack: (e: React.MouseEvent, trackId: string) => void;
}

const formatDuration = (seconds: number): string => {
  if (isNaN(seconds) || seconds <= 0) return '--:--';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const TrackTable: React.FC<TrackTableProps> = ({ tracks, onDeleteTrack }) => {
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayerStore();

  return (
    <div className="w-full select-none">
      {/* Table Header */}
      <div className="hidden sm:grid grid-cols-12 gap-3 px-4 py-2 text-xs font-semibold text-spotify-muted border-b border-white/10 uppercase tracking-wider">
        <div className="col-span-1 text-center">#</div>
        <div className="col-span-5">Title</div>
        <div className="col-span-3">Category</div>
        <div className="col-span-1 text-center">Format</div>
        <div className="col-span-2 text-right pr-4">Duration</div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-white/5">
        {tracks.map((track, index) => {
          const isCurrent = currentTrack?.id === track.id;
          const isVideo = track.format === 'mp4' || track.format === 'webm';

          return (
            <div
              key={track.id}
              onClick={() => playTrack(track, tracks)}
              className={`group grid grid-cols-12 gap-3 px-4 py-2.5 rounded-lg items-center text-xs transition-colors cursor-pointer hover:bg-white/10 ${
                isCurrent ? 'bg-white/10 text-spotify-green' : 'text-white'
              }`}
            >
              {/* Col 1: Index or Play icon */}
              <div className="col-span-1 flex items-center justify-center">
                <span className={`group-hover:hidden ${isCurrent ? 'text-spotify-green font-bold' : 'text-spotify-muted'}`}>
                  {index + 1}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isCurrent) {
                      togglePlay();
                    } else {
                      playTrack(track, tracks);
                    }
                  }}
                  className="hidden group-hover:flex items-center justify-center text-white"
                >
                  {isCurrent && isPlaying ? (
                    <Pause className="h-4 w-4 fill-current" />
                  ) : (
                    <Play className="h-4 w-4 fill-current ml-0.5" />
                  )}
                </button>
              </div>

              {/* Col 2: Thumbnail, Title & Artist */}
              <div className="col-span-10 sm:col-span-5 flex items-center gap-3 min-w-0">
                <div className="h-10 w-10 rounded bg-spotify-elevated shrink-0 overflow-hidden flex items-center justify-center">
                  {track.coverArtUrl ? (
                    <img src={track.coverArtUrl} alt={track.title} className="w-full h-full object-cover" />
                  ) : isVideo ? (
                    <Film className="h-5 w-5 text-purple-400" />
                  ) : (
                    <Music className="h-5 w-5 text-spotify-green" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`font-semibold truncate ${isCurrent ? 'text-spotify-green' : 'text-white'}`}>
                    {track.title}
                  </p>
                  <p className="text-[11px] text-spotify-muted truncate">{track.artist}</p>
                </div>
              </div>

              {/* Col 3: Category */}
              <div className="hidden sm:flex col-span-3 items-center">
                {track.categoryName ? (
                  <span
                    className="px-2 py-0.5 rounded-full text-[10px] font-semibold truncate max-w-[150px]"
                    style={{
                      backgroundColor: `${track.categoryColor || '#1db954'}25`,
                      color: track.categoryColor || '#1db954'
                    }}
                  >
                    {track.categoryName}
                  </span>
                ) : (
                  <span className="text-spotify-muted text-[11px]">—</span>
                )}
              </div>

              {/* Col 4: Format Badge */}
              <div className="hidden sm:flex col-span-1 justify-center">
                <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                  isVideo ? 'bg-purple-600/80 text-white' : 'bg-white/10 text-spotify-subtext'
                }`}>
                  {track.format.toUpperCase()}
                </span>
              </div>

              {/* Col 5: Duration & Delete Action */}
              <div className="col-span-1 sm:col-span-2 flex items-center justify-end gap-3 pr-2 text-spotify-muted font-mono">
                <span className="text-[11px]">{formatDuration(track.duration)}</span>
                <button
                  onClick={(e) => onDeleteTrack(e, track.id)}
                  title="Delete track"
                  className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity p-1"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
