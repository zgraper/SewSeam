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
  needsVectorization?: boolean; // Flag for PNG/JPG patterns that haven't been vectorized yet
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
export type EditorState = 'empty' | 'pattern_loaded' | 'fabric_loaded' | 'ready';

interface AppState {
  patterns: Pattern[];
  fabrics: Fabric[];
  selectedPatternId: string | null;
  selectedFabricId: string | null;
  regions: Region[];
  selectedRegionId: string | null;
  ui: {
    activeDrawer: DrawerType;
    showVectorizeModal: boolean;
    vectorizingPatternId: string | null;
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
  setShowVectorizeModal: (show: boolean) => void;
  setVectorizingPatternId: (id: string | null) => void;
  updatePattern: (id: string, updates: Partial<Pattern>) => void;
  reset: () => void;
}

// Derived selector for editor state
export const getEditorState = (state: AppState): EditorState => {
  const hasPattern = state.patterns.length > 0;
  const hasFabric = state.fabrics.length > 0;
  const hasRegionsWithFabric = state.regions.some(r => r.fabricId !== null);
  
  if (!hasPattern) {
    return 'empty';
  }
  if (hasPattern && !hasFabric) {
    return 'pattern_loaded';
  }
  if (hasPattern && hasFabric && !hasRegionsWithFabric) {
    return 'fabric_loaded';
  }
  return 'ready';
};

// Selector for status message
export const getStatusMessage = (state: AppState): string => {
  const editorState = getEditorState(state);
  switch (editorState) {
    case 'empty':
      return 'No project loaded';
    case 'pattern_loaded':
      return 'Pattern loaded';
    case 'fabric_loaded':
      return 'Fabric loaded';
    case 'ready':
      return 'Ready';
    default:
      return 'No project loaded';
  }
};

const initialState = {
  patterns: [],
  fabrics: [],
  selectedPatternId: null,
  selectedFabricId: null,
  regions: [],
  selectedRegionId: null,
  ui: {
    activeDrawer: null as DrawerType,
    showVectorizeModal: false,
    vectorizingPatternId: null,
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
  setShowVectorizeModal: (show) => set((state) => ({ ui: { ...state.ui, showVectorizeModal: show } })),
  setVectorizingPatternId: (id) => set((state) => ({ ui: { ...state.ui, vectorizingPatternId: id } })),
  updatePattern: (id, updates) =>
    set((state) => ({
      patterns: state.patterns.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    })),
  reset: () => set(initialState),
}));
