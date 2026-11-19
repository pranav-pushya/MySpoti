import React from 'react';
import { Category } from '../../types';
import { Film, Music2, Sparkles } from 'lucide-react';

interface CategoryPillsProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
  selectedFormat: string | null;
  onSelectFormat: (format: string | null) => void;
}

export const CategoryPills: React.FC<CategoryPillsProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  selectedFormat,
  onSelectFormat
}) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar select-none">
      {/* "All" Chip */}
      <button
        onClick={() => {
          onSelectCategory(null);
          onSelectFormat(null);
        }}
        className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
          selectedCategoryId === null && selectedFormat === null
            ? 'bg-white text-black shadow-md'
            : 'bg-spotify-highlight hover:bg-spotify-elevated text-white'
        }`}
      >
        All
      </button>

      {/* "MP4 Videos Only" Chip */}
      <button
        onClick={() => {
          onSelectCategory(null);
          onSelectFormat(selectedFormat === 'mp4' ? null : 'mp4');
        }}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
          selectedFormat === 'mp4'
            ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
            : 'bg-spotify-highlight hover:bg-spotify-elevated text-purple-300'
        }`}
      >
        <Film className="h-3.5 w-3.5" />
        <span>Videos (MP4)</span>
      </button>

      {/* Dynamic Category Chips */}
      {categories.map((cat) => {
        const isSelected = selectedCategoryId === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => {
              onSelectFormat(null);
              onSelectCategory(isSelected ? null : cat.id);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
              isSelected
                ? 'bg-white text-black shadow-md'
                : 'bg-spotify-highlight hover:bg-spotify-elevated text-spotify-subtext hover:text-white'
            }`}
          >
            <span 
              className="h-2 w-2 rounded-full shrink-0"
              style={{ backgroundColor: cat.color || '#1db954' }}
            />
            <span>{cat.name}</span>
          </button>
        );
      })}
    </div>
  );
};
