import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type LayoutType = 'flex' | 'grid';
export type FlexDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse';
export type JustifyContent = 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
export type AlignItems = 'stretch' | 'flex-start' | 'center' | 'flex-end' | 'baseline';

export interface LayoutConfig {
  columns?: number;
  rows?: number;
  flexDirection?: FlexDirection;
  justifyContent?: JustifyContent;
  alignItems?: AlignItems;
  gap?: number;
  wrap?: boolean;
  template?: string;
}

export interface LayoutComponent {
  id: string;
  type: 'heading' | 'text' | 'image' | 'button' | 'video' | 'divider' | 'spacer' | 'icon' | 'google-maps' | 'optinmonster';
  cellIndex?: number; // Which cell this component belongs to
  content?: Record<string, unknown>;
  styles?: Record<string, string>;
  order: number;
}

export interface LayoutItem {
  id: string;
  type: LayoutType;
  name: string;
  config: LayoutConfig;
  components: LayoutComponent[];
  visible: boolean;
  order: number;
  styles?: {
    backgroundColor?: string;
    padding?: string;
    margin?: string;
    borderRadius?: string;
    minHeight?: string;
  };
}

export interface PageLayouts {
  layouts: LayoutItem[];
}

export interface LayoutState {
  pages: Record<string, PageLayouts>;
}

const initialState: LayoutState = {
  pages: {},
};

// Predefined layout templates
export const FLEX_LAYOUTS = [
  { id: 'flex-1', name: 'Single Column', config: { flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'stretch', gap: 16 } as LayoutConfig },
  { id: 'flex-2', name: 'Two Columns', config: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'stretch', gap: 16, wrap: true } as LayoutConfig },
  { id: 'flex-3', name: 'Three Columns', config: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'stretch', gap: 16, wrap: true } as LayoutConfig },
  { id: 'flex-4', name: 'Centered Content', config: { flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 24 } as LayoutConfig },
  { id: 'flex-5', name: 'Sidebar + Content', config: { flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'stretch', gap: 24 } as LayoutConfig },
  { id: 'flex-6', name: 'Hero Layout', config: { flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 32 } as LayoutConfig },
];

export const GRID_LAYOUTS = [
  { id: 'grid-1', name: '2x2 Grid', config: { columns: 2, rows: 2, gap: 16, template: '1fr 1fr / 1fr 1fr' } as LayoutConfig },
  { id: 'grid-2', name: '3x2 Grid', config: { columns: 3, rows: 2, gap: 16, template: '1fr 1fr 1fr / 1fr 1fr' } as LayoutConfig },
  { id: 'grid-3', name: '4x1 Grid', config: { columns: 4, rows: 1, gap: 16, template: '1fr 1fr 1fr 1fr / 1fr' } as LayoutConfig },
  { id: 'grid-4', name: 'Masonry 2 Col', config: { columns: 2, gap: 16, template: '1fr 1fr / auto' } as LayoutConfig },
  { id: 'grid-5', name: 'Featured + Grid', config: { columns: 3, rows: 2, gap: 16, template: '2fr 1fr 1fr / 1fr 1fr' } as LayoutConfig },
  { id: 'grid-6', name: 'Asymmetric', config: { columns: 3, rows: 2, gap: 16, template: '1fr 2fr / 1fr 2fr' } as LayoutConfig },
];

const layoutSlice = createSlice({
  name: 'layout',
  initialState,
  reducers: {
    addLayout: (state, action: PayloadAction<{
      pageId: string;
      layout: Omit<LayoutItem, 'id' | 'order'> & { id?: string; order?: number };
    }>) => {
      const { pageId, layout } = action.payload;
      if (!state.pages[pageId]) {
        state.pages[pageId] = { layouts: [] };
      }
      
      const newLayout: LayoutItem = {
        ...layout,
        id: layout.id || `layout-${Date.now()}`,
        order: layout.order ?? state.pages[pageId].layouts.length,
        components: layout.components || [],
        visible: layout.visible ?? true,
      };
      
      state.pages[pageId].layouts.push(newLayout);
      state.pages[pageId].layouts.sort((a, b) => a.order - b.order);
    },

    removeLayout: (state, action: PayloadAction<{ pageId: string; layoutId: string }>) => {
      const { pageId, layoutId } = action.payload;
      if (state.pages[pageId]) {
        state.pages[pageId].layouts = state.pages[pageId].layouts.filter(l => l.id !== layoutId);
        // Reorder remaining layouts
        state.pages[pageId].layouts.forEach((layout, index) => {
          layout.order = index;
        });
      }
    },

    updateLayout: (state, action: PayloadAction<{
      pageId: string;
      layoutId: string;
      updates: Partial<LayoutItem>;
    }>) => {
      const { pageId, layoutId, updates } = action.payload;
      if (state.pages[pageId]) {
        const layout = state.pages[pageId].layouts.find(l => l.id === layoutId);
        if (layout) {
          Object.assign(layout, updates);
        }
      }
    },

    reorderLayouts: (state, action: PayloadAction<{
      pageId: string;
      fromIndex: number;
      toIndex: number;
    }>) => {
      const { pageId, fromIndex, toIndex } = action.payload;
      if (state.pages[pageId]) {
        const layouts = state.pages[pageId].layouts;
        const [movedLayout] = layouts.splice(fromIndex, 1);
        layouts.splice(toIndex, 0, movedLayout);
        // Update orders
        layouts.forEach((layout, index) => {
          layout.order = index;
        });
      }
    },

    toggleLayoutVisibility: (state, action: PayloadAction<{ pageId: string; layoutId: string }>) => {
      const { pageId, layoutId } = action.payload;
      if (state.pages[pageId]) {
        const layout = state.pages[pageId].layouts.find(l => l.id === layoutId);
        if (layout) {
          layout.visible = !layout.visible;
        }
      }
    },

    addComponentToLayout: (state, action: PayloadAction<{
      pageId: string;
      layoutId: string;
      component: Omit<LayoutComponent, 'id' | 'order'> & { id?: string; order?: number };
    }>) => {
      const { pageId, layoutId, component } = action.payload;
      if (state.pages[pageId]) {
        const layout = state.pages[pageId].layouts.find(l => l.id === layoutId);
        if (layout) {
          const newComponent: LayoutComponent = {
            ...component,
            id: component.id || `comp-${Date.now()}`,
            order: component.order ?? layout.components.length,
          };
          layout.components.push(newComponent);
          layout.components.sort((a, b) => a.order - b.order);
        }
      }
    },

    removeComponentFromLayout: (state, action: PayloadAction<{
      pageId: string;
      layoutId: string;
      componentId: string;
    }>) => {
      const { pageId, layoutId, componentId } = action.payload;
      if (state.pages[pageId]) {
        const layout = state.pages[pageId].layouts.find(l => l.id === layoutId);
        if (layout) {
          layout.components = layout.components.filter(c => c.id !== componentId);
          layout.components.forEach((comp, index) => {
            comp.order = index;
          });
        }
      }
    },

    updateComponentInLayout: (state, action: PayloadAction<{
      pageId: string;
      layoutId: string;
      componentId: string;
      updates: Partial<LayoutComponent>;
    }>) => {
      const { pageId, layoutId, componentId, updates } = action.payload;
      if (state.pages[pageId]) {
        const layout = state.pages[pageId].layouts.find(l => l.id === layoutId);
        if (layout) {
          const component = layout.components.find(c => c.id === componentId);
          if (component) {
            Object.assign(component, updates);
          }
        }
      }
    },

    reorderComponentsInLayout: (state, action: PayloadAction<{
      pageId: string;
      layoutId: string;
      fromIndex: number;
      toIndex: number;
    }>) => {
      const { pageId, layoutId, fromIndex, toIndex } = action.payload;
      if (state.pages[pageId]) {
        const layout = state.pages[pageId].layouts.find(l => l.id === layoutId);
        if (layout) {
          const components = layout.components;
          const [movedComponent] = components.splice(fromIndex, 1);
          components.splice(toIndex, 0, movedComponent);
          components.forEach((comp, index) => {
            comp.order = index;
          });
        }
      }
    },

    setPageLayouts: (state, action: PayloadAction<{ pageId: string; layouts: LayoutItem[] }>) => {
      const { pageId, layouts } = action.payload;
      state.pages[pageId] = { layouts };
    },

    syncLayoutState: (state, action: PayloadAction<LayoutState>) => {
      return action.payload;
    },

    clearPageLayouts: (state, action: PayloadAction<string>) => {
      const pageId = action.payload;
      if (state.pages[pageId]) {
        state.pages[pageId].layouts = [];
      }
    },
  },
});

export const {
  addLayout,
  removeLayout,
  updateLayout,
  reorderLayouts,
  toggleLayoutVisibility,
  addComponentToLayout,
  removeComponentFromLayout,
  updateComponentInLayout,
  reorderComponentsInLayout,
  setPageLayouts,
  syncLayoutState,
  clearPageLayouts,
} = layoutSlice.actions;

// Selectors
export const selectPageLayouts = (state: { layout: LayoutState }, pageId: string) => 
  state.layout.pages[pageId]?.layouts || [];

export const selectLayoutById = (state: { layout: LayoutState }, pageId: string, layoutId: string) =>
  state.layout.pages[pageId]?.layouts.find(l => l.id === layoutId);

export const selectVisibleLayouts = (state: { layout: LayoutState }, pageId: string) =>
  state.layout.pages[pageId]?.layouts.filter(l => l.visible).sort((a, b) => a.order - b.order) || [];

export default layoutSlice.reducer;
