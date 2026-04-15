import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ModalState {
  isOpen: boolean;
  imageSrc: string;
  alt: string;
}

const initialState: ModalState = {
  isOpen: false,
  imageSrc: '',
  alt: 'Image preview'
};

const modalSlice = createSlice({
  name: 'modal',
  initialState,
  reducers: {
    openImageModal: (state, action: PayloadAction<{ imageSrc: string; alt?: string }>) => {
      state.isOpen = true;
      state.imageSrc = action.payload.imageSrc;
      state.alt = action.payload.alt || 'Image preview';
    },
    closeImageModal: (state) => {
      state.isOpen = false;
      state.imageSrc = '';
      state.alt = 'Image preview';
    }
  }
});

export const { openImageModal, closeImageModal } = modalSlice.actions;
export default modalSlice.reducer;
export type { ModalState };
