import { create } from 'zustand';
import { NavTab } from '../types';

interface AppState {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  selectedCategory: string | null;
  setSelectedCategory: (categoryId: string | null) => void;
  
  isUploadModalOpen: boolean;
  setIsUploadModalOpen: (open: boolean) => void;
  
  isAiDrawerOpen: boolean;
  setIsAiDrawerOpen: (open: boolean) => void;
  toggleAiDrawer: () => void;
  
  isMobilePlayerExpanded: boolean;
  setIsMobilePlayerExpanded: (expanded: boolean) => void;
  
  isVideoTheaterOpen: boolean;
  setIsVideoTheaterOpen: (open: boolean) => void;
  toggleVideoTheater: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeTab: 'home',
  setActiveTab: (tab) => set({ activeTab: tab }),
  
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  selectedCategory: null,
  setSelectedCategory: (categoryId) => set({ selectedCategory: categoryId }),
  
  isUploadModalOpen: false,
  setIsUploadModalOpen: (open) => set({ isUploadModalOpen: open }),
  
  isAiDrawerOpen: false,
  setIsAiDrawerOpen: (open) => set({ isAiDrawerOpen: open }),
  toggleAiDrawer: () => set((state) => ({ isAiDrawerOpen: !state.isAiDrawerOpen })),
  
  isMobilePlayerExpanded: false,
  setIsMobilePlayerExpanded: (expanded) => set({ isMobilePlayerExpanded: expanded }),
  
  isVideoTheaterOpen: false,
  setIsVideoTheaterOpen: (open) => set({ isVideoTheaterOpen: open }),
  toggleVideoTheater: () => set((state) => ({ isVideoTheaterOpen: !state.isVideoTheaterOpen })),
}));
