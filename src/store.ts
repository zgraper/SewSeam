import { create } from 'zustand';

export interface Pattern {
  id: string;
  name: string;
  type: 'svg' | 'image';
  svgText?: string;
  imageUrl?: string;
  convertedPathData?: string; // SVG path extracted from raster images
  width?: number;
  height?: number;
  viewBox?: string;
}

export interface Fabric {
  id: string;
  name: string;
  imageUrl: string;
  width?: number;
  height?: number;
}

export interface FabricTransform {
  x: number;
  y: number;
  scale: number;
  rotation: number;
  flipX: boolean;
  flipY: boolean;
}

export interface Region {
  id: string;
  name: string;
  pathData: string;
  transform: string;
  fabricTransform: FabricTransform;
  fabricId: string | null;
}

export type DrawerType = 'tools' | 'regions' | 'properties' | null;

interface AppState {
  patterns: Pattern[];
  fabrics: Fabric[];
  selectedPatternId: string | null;
  selectedFabricId: string | null;
  regions: Region[];
  selectedRegionId: string | null;
  ui: {
    activeDrawer: DrawerType;
  };

  // Actions
  addPattern: (pattern: Pattern) => void;
  removePattern: (id: string) => void;
  addFabric: (fabric: Fabric) => void;
  removeFabric: (id: string) => void;
  setSelectedPatternId: (id: string | null) => void;
  setSelectedFabricId: (id: string | null) => void;
  addRegion: (region: Region) => void;
  updateRegion: (id: string, updates: Partial<Region>) => void;
  removeRegion: (id: string) => void;
  setSelectedRegionId: (id: string | null) => void;
  setActiveDrawer: (drawer: DrawerType) => void;
  reset: () => void;
}

const initialState = {
  patterns: [],
  fabrics: [],
  selectedPatternId: null,
  selectedFabricId: null,
  regions: [],
  selectedRegionId: null,
  ui: {
    activeDrawer: null as DrawerType,
  },
};

export const useStore = create<AppState>((set) => ({
  ...initialState,

  addPattern: (pattern) => set((state) => ({ patterns: [...state.patterns, pattern] })),
  removePattern: (id) =>
    set((state) => ({
      patterns: state.patterns.filter((p) => p.id !== id),
      selectedPatternId: state.selectedPatternId === id ? null : state.selectedPatternId,
    })),
  addFabric: (fabric) => set((state) => ({ fabrics: [...state.fabrics, fabric] })),
  removeFabric: (id) =>
    set((state) => ({
      fabrics: state.fabrics.filter((f) => f.id !== id),
      selectedFabricId: state.selectedFabricId === id ? null : state.selectedFabricId,
      regions: state.regions.map((region) =>
        region.fabricId === id ? { ...region, fabricId: null } : region
      ),
    })),
  setSelectedPatternId: (id) => set({ selectedPatternId: id }),
  setSelectedFabricId: (id) => set({ selectedFabricId: id }),
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
