import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface HeroContent {
  title: string;
  description: string;
  primaryButtonText: string;
  secondaryButtonText: string;
  backgroundImage: string;
  layout: 'left' | 'right' | 'center';
  titleColor: string;
  descriptionColor: string;
  primaryButtonColor: string;
  secondaryButtonColor: string;
  animation: 'fade' | 'slide' | 'bounce' | 'none';
  tags: string[];
  activeTag: string;
  appStoreImage: string;
  googlePlayImage: string;
  dotText: string;
  topAccentColor: string;
  bottomAccentColor: string;
}

interface EditorState {
  section: any;
  activeSection: any;
  isEditorOpen: boolean;
  editorSection: any;
  editingOverlay: {
    isOpen: boolean;
    sectionId: string | null;
    sectionType: string | null;
    contentType: 'text' | 'style' | 'image' | 'admin' | null;
  };
}

const initialState: EditorState = {
  activeSection: null,
  isEditorOpen: false,
  editorSection: null,
  editingOverlay: {
    isOpen: false,
    sectionId: null,
    sectionType: null,
    contentType: null,
  },
};

const editorSlice = createSlice({
  name: 'editor',
  initialState,
  reducers: {
    openEditor: (state, action: PayloadAction<{
      section: any;
    }>) => {
      state.activeSection = action.payload.section;
      state.editorSection = action.payload.section;
      state.isEditorOpen = true;
    },
    closeEditor: (state) => {
      state.activeSection = null;
      state.editorSection = null;
      state.isEditorOpen = false;
    },
    updateEditorSection: (state, action: PayloadAction<any>) => {
      state.editorSection = action.payload;
      state.activeSection = action.payload;
    },
    setEditingOverlay: (state, action: PayloadAction<{
      isOpen: boolean;
      sectionId: string | null;
      sectionType: string | null;
      contentType: 'text' | 'style' | 'image' | 'admin' | null;
    }>) => {
      state.editingOverlay = action.payload;
      
      // Also set editorSection if we have a sectionId
      if (action.payload.sectionId) {
        // This is a bit of a hack - we need to access the builder state
        // For now, we'll set a minimal section object and let the editor find the full data
        state.editorSection = {
          id: action.payload.sectionId,
          type: action.payload.sectionType,
          content: null // Will be populated by the editor component
        };
      } else {
        state.editorSection = null;
      }
    },
  }
});

export const {
  openEditor,
  closeEditor,
  updateEditorSection,
  setEditingOverlay,
} = editorSlice.actions;

export default editorSlice.reducer;
