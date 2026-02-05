import { create } from 'zustand';

export interface Pattern {
  name: string;
  type: 'svg' | 'image';
  svgText?: string;
  imageUrl?: string;
}

export interface Fabric {
  name: string;
  imageUrl: string;
}

export interface FabricTransform {
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

export interface Region {
  id: string;
  name: string;
  pathData: string;
  transform: string;
  fabricTransform: FabricTransform;
}

export type DrawerType = 'tools' | 'regions' | 'properties' | null;

interface AppState {
  pattern: Pattern | null;
  fabric: Fabric | null;
  regions: Region[];
  selectedRegionId: string | null;
  ui: {
    activeDrawer: DrawerType;
  };

  // Actions
  setPattern: (pattern: Pattern | null) => void;
  setFabric: (fabric: Fabric | null) => void;
  addRegion: (region: Region) => void;
  updateRegion: (id: string, updates: Partial<Region>) => void;
  removeRegion: (id: string) => void;
  setSelectedRegionId: (id: string | null) => void;
  setActiveDrawer: (drawer: DrawerType) => void;
  reset: () => void;
}

const initialState = {
  pattern: null,
  fabric: null,
  regions: [],
  selectedRegionId: null,
  ui: {
    activeDrawer: null as DrawerType,
  },
};

export const useStore = create<AppState>((set) => ({
  ...initialState,

  setPattern: (pattern) => set({ pattern }),
  setFabric: (fabric) => set({ fabric }),
  addRegion: (region) => set((state) => ({ regions: [...state.regions, region] })),
  updateRegion: (id, updates) =>
    set((state) => ({
      regions: state.regions.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    })),
  removeRegion: (id) =>
    set((state) => ({
      regions: state.regions.filter((r) => r.id !== id),
      selectedRegionId: state.selectedRegionId === id ? null : state.selectedRegionId,
    })),
  setSelectedRegionId: (id) => set({ selectedRegionId: id }),
  setActiveDrawer: (drawer) => set((state) => ({ ui: { ...state.ui, activeDrawer: drawer } })),
  reset: () => set(initialState),
}));
