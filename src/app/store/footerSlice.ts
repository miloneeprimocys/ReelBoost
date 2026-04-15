import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SocialLink {
  id: string;
  name: string;
  url: string;
  enabled: boolean;
  icon?: string;
  customIconUrl?: string;
}

export interface UsefulLink {
  id: string;
  text: string;
  sectionId: string;
  enabled: boolean;
}

export interface BottomLink {
  id: string;
  text: string;
  url: string;
  enabled: boolean;
}

export interface ContactInfo {
  phone: string;
  email: string;
  phoneEnabled: boolean;
  emailEnabled: boolean;
  phoneIcon: string;
  emailIcon: string;
  phoneCustomIconUrl?: string;
  emailCustomIconUrl?: string;
  phoneOrder: number;
  emailOrder: number;
}

export interface FooterStyles {
  backgroundColor: string;
  brandTextColor: string;
  linkTextColor: string;
  linkHoverColor: string;
  socialIconColor: string;
  socialIconBackground: string;
  socialIconHoverBackground: string;
  contactIconColor: string;
  contactIconBackground: string;
  contactIconHoverBackground: string;
  bottomBarBorderColor: string;
  bottomBarTextColor: string;
  bottomBarLinkHoverColor: string;
}

export interface FooterContent {
  brandDescription: string;
  logoUrl: string;
  socialLinks: SocialLink[];
  usefulLinks: UsefulLink[];
  contactInfo: ContactInfo;
  copyright: string;
  bottomLinks: BottomLink[];
  styles: FooterStyles;
}

interface FooterState {
  content: FooterContent;
  history: {
    past: FooterContent[];
    future: FooterContent[];
  };
}

const initialState: FooterState = {
  content: {
    brandDescription: "Grow your business with an affordable, customizable AppGUE solution that enhances communication effortlessly. Our Software provides businesses with a script that allows for seamless interaction.",
    logoUrl: "/logo.svg",
    socialLinks: [
      { id: 'facebook', name: 'Facebook', url: '#', enabled: true, icon: 'facebook', customIconUrl: undefined },
      { id: 'twitter', name: 'Twitter', url: '#', enabled: true, icon: 'twitter', customIconUrl: undefined },
      { id: 'linkedin', name: 'Linkedin', url: '#', enabled: true, icon: 'linkedin', customIconUrl: undefined },
      { id: 'instagram', name: 'Instagram', url: '#', enabled: true, icon: 'instagram', customIconUrl: undefined }
    ],
    usefulLinks: [
      { id: 'live-streaming', text: 'Live Streaming', sectionId: 'second-1', enabled: true },
      { id: 'pk-battle', text: 'Pk Battle', sectionId: 'third-1', enabled: true },
      { id: 'features', text: 'Features', sectionId: 'fourth-1', enabled: true },
      { id: 'admin-panel', text: 'Admin Panel', sectionId: 'fifth-1', enabled: true },
      { id: 'benefits', text: 'Benefits', sectionId: 'sixth-1', enabled: true }
    ],
    contactInfo: {
      phone: "+91-9033160895",
      email: "info@primocys.com",
      phoneEnabled: true,
      emailEnabled: true,
      phoneIcon: 'phone',
      emailIcon: 'mail',
      phoneCustomIconUrl: undefined,
      emailCustomIconUrl: undefined,
      phoneOrder: 0,
      emailOrder: 1
    },
    copyright: "© Primocys 2024 All Rights Reserved",
    bottomLinks: [
      { id: 'security', text: 'Security', url: '#', enabled: true },
      { id: 'privacy', text: 'Privacy & Policy', url: '#', enabled: true },
      { id: 'terms', text: 'Terms & Services', url: '#', enabled: true }
    ],
    styles: {
      backgroundColor: '#050533',
      brandTextColor: '#ffffff',
      linkTextColor: '#9ca3af',
      linkHoverColor: '#3b82f6',
      socialIconColor: '#ffffff',
      socialIconBackground: '#ffffff20',
      socialIconHoverBackground: '#1d4ed8',
      contactIconColor: '#3b82f6',
      contactIconBackground: '#dbeafe',
      contactIconHoverBackground: '#1e3a8a',
      bottomBarBorderColor: '#ffffff10',
      bottomBarTextColor: '#9ca3af',
      bottomBarLinkHoverColor: '#3b82f6'
    }
  },
  history: {
    past: [],
    future: []
  }
};

const footerSlice = createSlice({
  name: 'footer',
  initialState,
  reducers: {
    updateFooterContent: (state, action: PayloadAction<Partial<FooterContent>>) => {
      // Save current state to history before updating
      state.history.past.push({ ...state.content });
      state.history.future = []; // Clear future history when making new changes
      
      // Update the content
      state.content = { ...state.content, ...action.payload };
    },
    
    updateSocialLinks: (state, action: PayloadAction<SocialLink[]>) => {
      state.history.past.push({ ...state.content });
      state.history.future = [];
      state.content.socialLinks = action.payload;
    },
    
    updateUsefulLinks: (state, action: PayloadAction<UsefulLink[]>) => {
      state.history.past.push({ ...state.content });
      state.history.future = [];
      state.content.usefulLinks = action.payload;
    },
    
    updateContactInfo: (state, action: PayloadAction<Partial<ContactInfo>>) => {
      state.history.past.push({ ...state.content });
      state.history.future = [];
      state.content.contactInfo = { ...state.content.contactInfo, ...action.payload };
    },
    
    updateBottomLinks: (state, action: PayloadAction<BottomLink[]>) => {
      state.history.past.push({ ...state.content });
      state.history.future = [];
      state.content.bottomLinks = action.payload;
    },
    
    updateFooterStyles: (state, action: PayloadAction<Partial<FooterStyles>>) => {
      state.history.past.push({ ...state.content });
      state.history.future = [];
      state.content.styles = { ...state.content.styles, ...action.payload };
    },
    
    undo: (state) => {
      if (state.history.past.length > 0) {
        const previous = state.history.past.pop();
        if (previous) {
          state.history.future.push({ ...state.content });
          state.content = previous;
        }
      }
    },
    
    redo: (state) => {
      if (state.history.future.length > 0) {
        const next = state.history.future.pop();
        if (next) {
          state.history.past.push({ ...state.content });
          state.content = next;
        }
      }
    },
    
    resetFooter: (state) => {
      state.history.past.push({ ...state.content });
      state.history.future = [];
      state.content = initialState.content;
    },
    loadPublishedData: (state, action: PayloadAction<FooterContent>) => {
      state.content = action.payload;
      // Clear history when loading published data
      state.history = {
        past: [],
        future: []
      };
    }
  }
});

// Selectors
export const selectFooterContent = (state: { footer: FooterState }) => state.footer.content;
export const selectFooterHistory = (state: { footer: FooterState }) => state.footer.history;
export const selectCanUndoFooter = (state: { footer: FooterState }) => state.footer.history.past.length > 0;
export const selectCanRedoFooter = (state: { footer: FooterState }) => state.footer.history.future.length > 0;

export const {
  updateFooterContent,
  updateSocialLinks,
  updateUsefulLinks,
  updateContactInfo,
  updateBottomLinks,
  updateFooterStyles,
  undo,
  redo,
  resetFooter,
  loadPublishedData
} = footerSlice.actions;

export default footerSlice.reducer;
