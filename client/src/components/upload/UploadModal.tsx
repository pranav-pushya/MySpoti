import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Upload, 
  Music, 
  Film, 
  CheckCircle, 
  AlertCircle, 
  Plus, 
  Sparkles, 
  Tag,
  Loader2
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { Category, Track } from '../../types';

interface UploadModalProps {
  categories: Category[];
  onUploadSuccess: (track: Track) => void;
  onCategoryCreated: (category: Category) => void;
}

const PRESET_MOODS = [
  'Energetic',
  'Relaxed',
  'Lo-Fi',
  'Workout',
  'Late Night',
  'Focus',
  'Party',
  'Melancholic',
  'Cozy',
  'Uplifting'
];

export const UploadModal: React.FC<UploadModalProps> = ({
  categories,
  onUploadSuccess,
  onCategoryCreated
}) => {
  const { isUploadModalOpen, setIsUploadModalOpen } = useAppStore();

  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [isCreatingNewCategory, setIsCreatingNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [customMood, setCustomMood] = useState('');
  
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (categories.length > 0 && !selectedCategoryId && !isCreatingNewCategory) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [categories, selectedCategoryId, isCreatingNewCategory]);

  if (!isUploadModalOpen) return null;

  const handleFileSelection = (selectedFile: File) => {
    setErrorMessage('');
    const ext = selectedFile.name.split('.').pop()?.toLowerCase();
    const allowed = ['mp4', 'mp3', 'wav', 'ogg', 'flac', 'm4a', 'webm'];
    
    if (!ext || !allowed.includes(ext)) {
      setErrorMessage(`Unsupported format (.${ext}). Please select an MP4, MP3, WAV, FLAC, or OGG file.`);
      return;
    }

    setFile(selectedFile);
    // Auto-fill clean title from filename if empty
    if (!title) {
      const baseName = selectedFile.name.substring(0, selectedFile.name.lastIndexOf('.')) || selectedFile.name;
      const cleanName = baseName.replace(/[_-]+/g, ' ').trim();
      setTitle(cleanName);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const toggleMood = (mood: string) => {
    if (selectedMoods.includes(mood)) {
      setSelectedMoods(selectedMoods.filter(m => m !== mood));
    } else {
      setSelectedMoods([...selectedMoods, mood]);
    }
  };

  const addCustomMood = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && customMood.trim()) {
      e.preventDefault();
      const trimmed = customMood.trim();
      if (!selectedMoods.includes(trimmed)) {
        setSelectedMoods([...selectedMoods, trimmed]);
      }
      setCustomMood('');
    }
  };

  const resetForm = () => {
    setFile(null);
    setTitle('');
    setArtist('');
    setIsCreatingNewCategory(false);
    setNewCategoryName('');
    setSelectedMoods([]);
    setCustomMood('');
    setUploadProgress(0);
    setErrorMessage('');
  };

  const closeModal = () => {
    if (isUploading) return;
    resetForm();
    setIsUploadModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setErrorMessage('Please select a media file to upload.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(20);
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('media', file);
      formData.append('title', title.trim() || file.name);
      formData.append('artist', artist.trim() || 'Unknown Artist');
      
      if (isCreatingNewCategory && newCategoryName.trim()) {
        formData.append('newCategoryName', newCategoryName.trim());
      } else if (selectedCategoryId) {
        formData.append('categoryId', selectedCategoryId);
      }

      formData.append('moodTags', JSON.stringify(selectedMoods));

      setUploadProgress(50);

      const response = await fetch('/api/tracks/upload', {
        method: 'POST',
        body: formData
      });

      setUploadProgress(85);

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Upload failed');
      }

      setUploadProgress(100);
      onUploadSuccess(data.track);

      // If a new category was created on the fly, notify parent
      if (data.track.categoryId && isCreatingNewCategory) {
        onCategoryCreated({
          id: data.track.categoryId,
          name: data.track.categoryName || newCategoryName,
          slug: (data.track.categoryName || newCategoryName).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          color: data.track.categoryColor || '#1db954',
          createdAt: new Date().toISOString()
        });
      }

      setTimeout(() => {
        setIsUploading(false);
        closeModal();
      }, 500);

    } catch (err: any) {
      console.error('Upload error:', err);
      setErrorMessage(err.message || 'Failed to upload media. Please try again.');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const isVideo = file?.type.startsWith('video/') || file?.name.toLowerCase().endsWith('.mp4');

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full sm:max-w-xl max-h-[92vh] sm:max-h-[85vh] bg-spotify-card border border-white/10 rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden text-white transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-spotify-base/80">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-spotify-green flex items-center justify-center text-black">
              <Upload className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">Upload Song or Video</h2>
              <p className="text-[11px] text-spotify-muted">MP4 video, MP3, WAV, FLAC, M4A</p>
            </div>
          </div>
          <button
            onClick={closeModal}
            disabled={isUploading}
            className="h-8 w-8 rounded-full bg-spotify-highlight hover:bg-spotify-elevated flex items-center justify-center text-spotify-muted hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-4">
          {errorMessage && (
            <div className="flex items-center gap-2.5 p-3 rounded-lg bg-red-900/30 border border-red-500/30 text-red-200 text-xs">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Drag & Drop Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
              isDragging 
                ? 'border-spotify-green bg-spotify-green/10' 
                : file 
                  ? 'border-spotify-green/50 bg-spotify-highlight/40' 
                  : 'border-white/15 hover:border-white/30 bg-spotify-highlight/20'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".mp4,.mp3,.wav,.ogg,.flac,.m4a,.webm,audio/*,video/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileSelection(e.target.files[0])}
            />

            {file ? (
              <div className="flex items-center justify-between text-left">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-spotify-elevated flex items-center justify-center text-spotify-green">
                    {isVideo ? <Film className="h-5 w-5" /> : <Music className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white truncate max-w-[200px] sm:max-w-xs">{file.name}</p>
                    <p className="text-[11px] text-spotify-muted">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB • {isVideo ? 'MP4 Video' : 'Audio Track'}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-spotify-green px-2.5 py-1 rounded-full bg-spotify-green/15">
                  Selected
                </span>
              </div>
            ) : (
              <div className="space-y-1.5 py-2">
                <div className="mx-auto h-10 w-10 rounded-full bg-spotify-highlight flex items-center justify-center text-spotify-muted">
                  <Upload className="h-5 w-5 text-spotify-green" />
                </div>
                <p className="text-xs font-semibold text-white">Click or drag media file to upload</p>
                <p className="text-[11px] text-spotify-muted">Supports MP4 music videos and audio files (up to 250MB)</p>
              </div>
            )}
          </div>

          {/* Title & Artist Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-spotify-subtext mb-1">Track Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Blinding Lights"
                className="w-full h-9 px-3 rounded-lg bg-spotify-highlight border border-white/10 focus:border-spotify-green text-xs text-white placeholder-spotify-muted outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-spotify-subtext mb-1">Artist / Creator</label>
              <input
                type="text"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="e.g. The Weeknd (optional)"
                className="w-full h-9 px-3 rounded-lg bg-spotify-highlight border border-white/10 focus:border-spotify-green text-xs text-white placeholder-spotify-muted outline-none transition-all"
              />
            </div>
          </div>

          {/* Category Selection / Creation */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-spotify-subtext">Category / Genre</label>
              <button
                type="button"
                onClick={() => setIsCreatingNewCategory(!isCreatingNewCategory)}
                className="text-[11px] font-semibold text-spotify-green hover:underline flex items-center gap-1"
              >
                {isCreatingNewCategory ? 'Select Existing Category' : '➕ Create New Category'}
              </button>
            </div>

            {isCreatingNewCategory ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Enter new category name (e.g. Synthwave)"
                  className="flex-1 h-9 px-3 rounded-lg bg-spotify-highlight border border-spotify-green/50 text-xs text-white placeholder-spotify-muted outline-none"
                  autoFocus
                />
              </div>
            ) : (
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="w-full h-9 px-3 rounded-lg bg-spotify-highlight border border-white/10 text-xs text-white outline-none cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Mood Tags for Gemini AI DJ */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-purple-400" />
              <label className="text-xs font-semibold text-spotify-subtext">
                Mood & Vibe Tags <span className="text-[10px] text-spotify-muted">(Helps your AI DJ)</span>
              </label>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_MOODS.map((mood) => {
                const isSelected = selectedMoods.includes(mood);
                return (
                  <button
                    key={mood}
                    type="button"
                    onClick={() => toggleMood(mood)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                      isSelected
                        ? 'bg-spotify-green text-black font-semibold shadow-sm'
                        : 'bg-spotify-highlight hover:bg-spotify-elevated text-spotify-subtext'
                    }`}
                  >
                    {mood}
                  </button>
                );
              })}
            </div>
            <div className="pt-1">
              <input
                type="text"
                value={customMood}
                onChange={(e) => setCustomMood(e.target.value)}
                onKeyDown={addCustomMood}
                placeholder="Type a custom mood tag & press Enter..."
                className="w-full h-8 px-3 rounded-lg bg-spotify-highlight/60 border border-white/5 text-[11px] text-white placeholder-spotify-muted outline-none"
              />
            </div>
          </div>

          {/* Upload Progress Bar */}
          {isUploading && (
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-[11px] font-medium text-spotify-muted">
                <span>Uploading and extracting metadata...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-1.5 bg-spotify-highlight rounded-full overflow-hidden">
                <div 
                  className="h-full bg-spotify-green transition-all duration-300 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Footer Submit */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-white/10">
            <button
              type="button"
              onClick={closeModal}
              disabled={isUploading}
              className="px-4 py-2 rounded-full text-xs font-semibold text-spotify-subtext hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading || !file}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
                isUploading || !file
                  ? 'bg-spotify-elevated text-spotify-muted cursor-not-allowed'
                  : 'bg-spotify-green hover:bg-spotify-greenHover text-black shadow-lg shadow-spotify-green/20 active:scale-95'
              }`}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="h-3.5 w-3.5 stroke-[2.5]" />
                  <span>Upload Now</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
