import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AdminTabContent {
  id: string;
  label: string;
  subtitle: string;
  title: string;
  description: string;
  points: string[];
  image: string;
  order: number;
  visible: boolean;
}

interface AdminState {
  sections: AdminTabContent[];
  activeSection: string | null;
  isEditorMode: boolean;
}

// Note: Admin content is now managed exclusively by builderSlice
// This slice is kept for backwards compatibility but all data comes from builderSlice
const initialState: AdminState = {
  sections: [],
  activeSection: null,
  isEditorMode: false,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setActiveSection: (state, action: PayloadAction<string | null>) => {
      state.activeSection = action.payload;
    },
    updateAdminContent: (state, action: PayloadAction<{ id: string; content: Partial<AdminTabContent> }>) => {
      const { id, content } = action.payload;
      const sectionIndex = state.sections.findIndex(section => section.id === id);
      if (sectionIndex !== -1) {
        state.sections[sectionIndex] = { ...state.sections[sectionIndex], ...content };
      }
    },
    addAdminSection: (state, action: PayloadAction<{ type: string; order?: number; id?: string }>) => {
      const { order, id } = action.payload;
      const maxOrder = order || Math.max(...state.sections.map(s => s.order), 0) + 1;

      // Default admin section template
      const newSection: AdminTabContent = {
        id: id || `admin-${Date.now()}`,
        label: "NEW TAB",
        subtitle: "Feature Category",
        title: "New Admin Feature",
        description: "Description for this admin feature goes here.",
        points: ["Feature point 1", "Feature point 2"],
        image: "/Admin1.svg",
        order: maxOrder,
        visible: true,
      };

      state.sections.push(newSection);
    },
    deleteAdminSection: (state, action: PayloadAction<string>) => {
      state.sections = state.sections.filter(section => section.id !== action.payload);
      if (state.activeSection === action.payload) {
        state.activeSection = null;
      }
    },
    toggleAdminSectionVisibility: (state, action: PayloadAction<string>) => {
      const section = state.sections.find(s => s.id === action.payload);
      if (section) {
        section.visible = !section.visible;
      }
    },
    reorderAdminSections: (state, action: PayloadAction<{ fromIndex: number; toIndex: number }>) => {
      const { fromIndex, toIndex } = action.payload;
      const [removed] = state.sections.splice(fromIndex, 1);
      state.sections.splice(toIndex, 0, removed);
      
      // Update order values
      state.sections.forEach((section, index) => {
        section.order = index + 1;
      });
    },
    toggleEditorMode: (state) => {
      state.isEditorMode = !state.isEditorMode;
    },
    resetToDefaults: (state) => {
      state.sections = [];
      state.activeSection = null;
      state.isEditorMode = false;
    },
  },
});

export const {
  setActiveSection,
  updateAdminContent,
  addAdminSection,
  deleteAdminSection,
  toggleAdminSectionVisibility,
  reorderAdminSections,
  toggleEditorMode,
  resetToDefaults,
} = adminSlice.actions;

export default adminSlice.reducer;
