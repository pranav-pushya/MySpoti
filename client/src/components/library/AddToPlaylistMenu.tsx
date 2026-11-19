import React, { useState, useRef, useEffect } from 'react';
import { ListPlus, Plus, Check } from 'lucide-react';
import { Playlist } from '../../types';

interface AddToPlaylistMenuProps {
  trackId: string;
  playlists: Playlist[];
  onAddToPlaylist: (playlistId: string, trackId: string) => Promise<boolean | void>;
  onOpenCreatePlaylist?: () => void;
}

export const AddToPlaylistMenu: React.FC<AddToPlaylistMenuProps> = ({
  trackId,
  playlists,
  onAddToPlaylist,
  onOpenCreatePlaylist
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [addedPlaylistIds, setAddedPlaylistIds] = useState<string[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = async (e: React.MouseEvent, playlistId: string) => {
    e.stopPropagation();
    await onAddToPlaylist(playlistId, trackId);
    setAddedPlaylistIds(prev => [...prev, playlistId]);
    setTimeout(() => {
      setIsOpen(false);
    }, 600);
  };

  return (
    <div className="relative inline-block" ref={menuRef} onClick={(e) => e.stopPropagation()}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        title="Add to Playlist"
        className="p-1.5 rounded-full text-spotify-muted hover:text-white transition-colors hover:bg-white/10"
      >
        <ListPlus className="h-4 w-4" />
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 top-full mt-1.5 w-48 bg-spotify-elevated border border-white/15 rounded-lg shadow-2xl py-1.5 z-40 text-xs animate-fadeIn"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3 py-1 text-[10px] uppercase font-bold text-spotify-muted tracking-wider border-b border-white/5">
            Add to Playlist
          </div>

          <div className="max-h-44 overflow-y-auto custom-scrollbar divide-y divide-white/5">
            {playlists.length === 0 ? (
              <div className="px-3 py-2 text-spotify-muted text-[11px] text-center italic">
                No playlists created yet
              </div>
            ) : (
              playlists.map((pl) => {
                const isAdded = addedPlaylistIds.includes(pl.id);
                return (
                  <button
                    key={pl.id}
                    onClick={(e) => handleSelect(e, pl.id)}
                    className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-white/10 text-white transition-colors"
                  >
                    <span className="truncate pr-2 font-medium">{pl.name}</span>
                    {isAdded ? (
                      <Check className="h-3.5 w-3.5 text-spotify-green shrink-0" />
                    ) : (
                      <Plus className="h-3.5 w-3.5 text-spotify-muted shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>

          {onOpenCreatePlaylist && (
            <div className="border-t border-white/10 pt-1 mt-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  onOpenCreatePlaylist();
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-spotify-green hover:bg-spotify-green/10 font-semibold transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>New playlist</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
