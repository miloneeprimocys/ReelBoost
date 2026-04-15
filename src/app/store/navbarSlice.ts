import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface NavbarLink {
  id: string;
  label: string;
  sectionId: string;
  visible: boolean;
}

interface NavbarContent {
  logo: string;
  backgroundColor: string;
  textColor: string;
  hoverColor: string;
  buttonColor: string;
  buttonHoverColor: string;
  liveDemoButton: {
    label: string;
    backgroundColor: string;
    textColor: string;
    hoverBackgroundColor: string;
  };
  links: NavbarLink[];
}

interface NavbarState {
  content: NavbarContent;
  isActive: boolean;
  history: {
    past: NavbarContent[];
    future: NavbarContent[];
  };
}

const initialState: NavbarState = {
  content: {
    logo: '/logo.svg',
    backgroundColor: '#ffffff',
    textColor: '#2b49c5',
    hoverColor: '#000000',
    buttonColor: '#2b49c5',
    buttonHoverColor: '#000000',
    liveDemoButton: {
      label: 'live demo',
      backgroundColor: '#2b49c5',
      textColor: '#ffffff',
      hoverBackgroundColor: '#000000'
    },
    links: [
      {
        id: 'nav-live-streaming',
        label: 'Live Streaming',
        sectionId: 'second-1',
        visible: true
      },
      {
        id: 'nav-pk-battle',
        label: 'Pk Battle',
        sectionId: 'third-1',
        visible: true
      },
      {
        id: 'nav-features',
        label: 'Features',
        sectionId: 'fourth-1',
        visible: true
      },
      {
        id: 'nav-admin-panel',
        label: 'Admin Panel',
        sectionId: 'fifth-1',
        visible: true
      },
      {
        id: 'nav-benefits',
        label: 'Benefits',
        sectionId: 'sixth-1',
        visible: true
      }
    ]
  },
  isActive: false,
  history: {
    past: [],
    future: []
  }
};

const navbarSlice = createSlice({
  name: 'navbar',
  initialState,
  reducers: {
    setActiveNavbar: (state, action: PayloadAction<boolean>) => {
      state.isActive = action.payload;
    },
    updateNavbarContent: (state, action: PayloadAction<Partial<NavbarContent>>) => {
      // Save to history before updating
      state.history.past.push(JSON.parse(JSON.stringify(state.content)));
      state.history.future = []; // Clear future on new action
      state.content = { ...state.content, ...action.payload };
    },
    updateNavbarLogo: (state, action: PayloadAction<string>) => {
      state.history.past.push(JSON.parse(JSON.stringify(state.content)));
      state.history.future = [];
      state.content.logo = action.payload;
    },
    updateNavbarColors: (state, action: PayloadAction<{
      backgroundColor?: string;
      textColor?: string;
      hoverColor?: string;
      buttonColor?: string;
      buttonHoverColor?: string;
    }>) => {
      state.history.past.push(JSON.parse(JSON.stringify(state.content)));
      state.history.future = [];
      state.content = { ...state.content, ...action.payload };
    },
    updateNavbarLink: (state, action: PayloadAction<{
      id: string;
      label?: string;
      sectionId?: string;
      visible?: boolean;
    }>) => {
      const { id, ...updates } = action.payload;
      const linkIndex = state.content.links.findIndex(link => link.id === id);
      if (linkIndex !== -1) {
        state.history.past.push(JSON.parse(JSON.stringify(state.content)));
        state.history.future = [];
        state.content.links[linkIndex] = { ...state.content.links[linkIndex], ...updates };
      }
    },
    addNavbarLink: (state, action: PayloadAction<{
      label: string;
      sectionId: string;
    }>) => {
      const newLink: NavbarLink = {
        id: `nav-${Date.now()}`,
        label: action.payload.label,
        sectionId: action.payload.sectionId,
        visible: true
      };
      state.history.past.push(JSON.parse(JSON.stringify(state.content)));
      state.history.future = [];
      state.content.links.push(newLink);
    },
    removeNavbarLink: (state, action: PayloadAction<string>) => {
      state.history.past.push(JSON.parse(JSON.stringify(state.content)));
      state.history.future = [];
      state.content.links = state.content.links.filter(link => link.id !== action.payload);
    },
    reorderNavbarLinks: (state, action: PayloadAction<{
      fromIndex: number;
      toIndex: number;
    }>) => {
      const { fromIndex, toIndex } = action.payload;
      state.history.past.push(JSON.parse(JSON.stringify(state.content)));
      state.history.future = [];
      const [removed] = state.content.links.splice(fromIndex, 1);
      state.content.links.splice(toIndex, 0, removed);
    },
    updateLiveDemoButton: (state, action: PayloadAction<{
      label?: string;
      backgroundColor?: string;
      textColor?: string;
      hoverBackgroundColor?: string;
    }>) => {
      state.history.past.push(JSON.parse(JSON.stringify(state.content)));
      state.history.future = [];
      state.content.liveDemoButton = { ...state.content.liveDemoButton, ...action.payload };
    },
    undoNavbar: (state) => {
      if (state.history.past.length > 0) {
        const previous = state.history.past.pop()!;
        state.history.future.push(JSON.parse(JSON.stringify(state.content)));
        state.content = previous;
      }
    },
    redoNavbar: (state) => {
      if (state.history.future.length > 0) {
        const next = state.history.future.pop()!;
        state.history.past.push(JSON.parse(JSON.stringify(state.content)));
        state.content = next;
      }
    },
    loadPublishedData: (state, action: PayloadAction<NavbarContent>) => {
      state.content = action.payload;
      // Clear history when loading published data
      state.history = {
        past: [],
        future: []
      };
    }
  }
});

export const {
  setActiveNavbar,
  updateNavbarContent,
  updateNavbarLogo,
  updateNavbarColors,
  updateNavbarLink,
  addNavbarLink,
  removeNavbarLink,
  reorderNavbarLinks,
  updateLiveDemoButton,
  undoNavbar,
  redoNavbar,
  loadPublishedData
} = navbarSlice.actions;

// Selectors for undo/redo
export const selectNavbarCanUndo = (state: { navbar: NavbarState }) => {
  return state.navbar.history.past.length > 0;
};

export const selectNavbarCanRedo = (state: { navbar: NavbarState }) => {
  return state.navbar.history.future.length > 0;
};

export default navbarSlice.reducer;
export type { NavbarContent, NavbarLink, NavbarState };
