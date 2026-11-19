import React, { useState } from 'react';
import { X, ListMusic, Plus } from 'lucide-react';
import { Playlist } from '../../types';

interface PlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlaylistCreated: (newPlaylist: Playlist) => void;
}

export const PlaylistModal: React.FC<PlaylistModalProps> = ({
  isOpen,
  onClose,
  onPlaylistCreated
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a playlist name');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const res = await fetch('/api/playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), description: description.trim() })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create playlist');
      }

      const data = await res.json();
      onPlaylistCreated(data.playlist);
      setName('');
      setDescription('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error creating playlist');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-md bg-spotify-elevated rounded-xl shadow-2xl border border-white/10 p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-md bg-spotify-green/20 text-spotify-green flex items-center justify-center">
              <ListMusic className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-white">New Playlist</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-spotify-muted hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 text-xs bg-red-900/30 border border-red-500/50 rounded-lg text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-spotify-muted mb-1 uppercase tracking-wider">
              Playlist Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Late Night Vibes, Gym B文化的angers"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-spotify-highlight border border-white/10 text-white text-sm focus:outline-none focus:border-spotify-green transition-colors"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-spotify-muted mb-1 uppercase tracking-wider">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Give your playlist a description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-spotify-highlight border border-white/10 text-white text-sm focus:outline-none focus:border-spotify-green transition-colors resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full text-sm font-semibold text-spotify-muted hover:text-white hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="flex items-center gap-2 px-5 py-2 rounded-full bg-spotify-green hover:bg-spotify-greenHover disabled:opacity-50 text-black font-bold text-sm transition-all shadow-lg shadow-spotify-green/20"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span>{isSubmitting ? 'Creating...' : 'Create'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
