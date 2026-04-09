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
}

const initialState: EditorState = {
  activeSection: null,
  isEditorOpen: false,
  editorSection: null,
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
  }
});

export const {
  openEditor,
  closeEditor,
  updateEditorSection,
} = editorSlice.actions;

export default editorSlice.reducer;
