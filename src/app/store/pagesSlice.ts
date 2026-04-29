import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface PageSection {
  id: string;
  name: string;
  visible: boolean;
  sectionId: string;
  order: number;
}

export interface PageLink {
  id: string;
  label: string;
  sectionId: string;
  visible: boolean;
}

export interface Page {
  id: string;
  title: string;
  slug: string; // URL path like '/contact-us'
  visible: boolean;
  hasDropdown: boolean; // true = show dropdown with sections, false = direct link
  sections: PageSection[];
  links: PageLink[]; // Page-specific navigation links
  createdAt: number;
}

export interface PagesState {
  pages: Page[];
  isAddPageModalOpen: boolean;
}

const initialState: PagesState = {
  pages: [
    {
      id: 'home',
      title: 'Home Page',
      slug: '/',
      visible: true,
      hasDropdown: true,
      sections: [
        { id: 'hero-1', name: 'Hero Section', visible: true, sectionId: 'hero-1', order: 1 },
        { id: 'second-1', name: 'Live Streaming', visible: true, sectionId: 'second-1', order: 2 },
        { id: 'third-1', name: 'PK Battle', visible: true, sectionId: 'third-1', order: 3 },
        { id: 'features-1', name: 'Features', visible: true, sectionId: 'features-1', order: 4 },
        { id: 'admin-panel-1', name: 'Admin Panel', visible: true, sectionId: 'admin-panel-1', order: 5 },
        { id: 'benefits-1', name: 'Benefits', visible: true, sectionId: 'benefits-1', order: 6 },
      ],
      links: [
        { id: 'link-second-1', label: 'Live Streaming', sectionId: 'second-1', visible: true },
        { id: 'link-third-1', label: 'PK Battle', sectionId: 'third-1', visible: true },
        { id: 'link-features-1', label: 'Features', sectionId: 'fourth-1', visible: true },
        { id: 'link-admin-1', label: 'Admin Panel', sectionId: 'fifth-1', visible: true },
        { id: 'link-benefits-1', label: 'Benefits', sectionId: 'sixth-1', visible: true },
      ],
      createdAt: Date.now(),
    },
    {
      id: 'contact',
      title: 'Contact Us',
      slug: '/ContactUs',
      visible: true,
      hasDropdown: false,
      sections: [
        { id: 'contact-hero-1', name: 'Contact Hero', visible: true, sectionId: 'contact-hero-1', order: 0 },
      ],
      links: [
        { id: 'link-contact-hero', label: 'Contact', sectionId: 'contact-hero-1', visible: true },
      ],
      createdAt: Date.now(),
    },
  ],
  isAddPageModalOpen: false,
};

const pagesSlice = createSlice({
  name: 'pages',
  initialState,
  reducers: {
    // Modal control
    openAddPageModal: (state) => {
      state.isAddPageModalOpen = true;
    },
    closeAddPageModal: (state) => {
      state.isAddPageModalOpen = false;
    },

    // Page CRUD
    addPage: (state, action: PayloadAction<{ title: string; slug: string }>) => {
      const { title, slug } = action.payload;
      const id = `page-${Date.now()}`;
      const formattedSlug = slug.startsWith('/') ? slug : `/${slug}`;

      const newPage: Page = {
        id,
        title,
        slug: formattedSlug,
        visible: true,
        hasDropdown: false,
        sections: [],
        links: [],
        createdAt: Date.now(),
      };

      state.pages.push(newPage);
      state.isAddPageModalOpen = false;
    },

    updatePage: (state, action: PayloadAction<{ id: string; title?: string; slug?: string }>) => {
      const { id, title, slug } = action.payload;
      const page = state.pages.find((p) => p.id === id);
      if (page) {
        if (title) page.title = title;
        if (slug) page.slug = slug.startsWith('/') ? slug : `/${slug}`;
      }
    },

    deletePage: (state, action: PayloadAction<string>) => {
      // Prevent deleting default pages (home and contact)
      const id = action.payload;
      if (id === 'home' || id === 'contact') return;
      state.pages = state.pages.filter((p) => p.id !== id);
    },

    togglePageVisibility: (state, action: PayloadAction<string>) => {
      const page = state.pages.find((p) => p.id === action.payload);
      if (page) {
        page.visible = !page.visible;
      }
    },

    setPageDropdownMode: (state, action: PayloadAction<{ id: string; hasDropdown: boolean }>) => {
      const { id, hasDropdown } = action.payload;
      const page = state.pages.find((p) => p.id === id);
      if (page) {
        page.hasDropdown = hasDropdown;
      }
    },

    // Section management within pages - also auto-creates a link
    addSectionToPage: (state, action: PayloadAction<{ pageId: string; sectionId: string; sectionName: string }>) => {
      const { pageId, sectionId, sectionName } = action.payload;
      const page = state.pages.find((p) => p.id === pageId);
      if (page) {
        // Add section
        page.sections.push({
          id: sectionId,
          name: sectionName,
          visible: true,
          sectionId: sectionId,
          order: page.sections.length,
        });
        // Auto-create a link for this section
        page.links.push({
          id: `link-${sectionId}`,
          label: sectionName,
          sectionId: sectionId,
          visible: true,
        });
      }
    },

    removeSectionFromPage: (state, action: PayloadAction<{ pageId: string; sectionId: string }>) => {
      const { pageId, sectionId } = action.payload;
      const page = state.pages.find((p) => p.id === pageId);
      if (page) {
        page.sections = page.sections.filter((s) => s.id !== sectionId);
        // Also remove the associated link
        page.links = page.links.filter((l) => l.sectionId !== sectionId);
      }
    },

    toggleSectionVisibility: (state, action: PayloadAction<{ pageId: string; sectionId: string }>) => {
      const { pageId, sectionId } = action.payload;
      const page = state.pages.find((p) => p.id === pageId);
      if (page) {
        const section = page.sections.find((s) => s.id === sectionId);
        if (section) {
          section.visible = !section.visible;
        }
      }
    },

    // Update sections array for a page (for reordering)
    updatePageSections: (state, action: PayloadAction<{ pageId: string; sections: PageSection[] }>) => {
      const { pageId, sections } = action.payload;
      const page = state.pages.find((p) => p.id === pageId);
      if (page) {
        page.sections = sections;
      }
    },

    // Page-specific link management
    addPageLink: (state, action: PayloadAction<{ pageId: string; link: PageLink }>) => {
      const { pageId, link } = action.payload;
      const page = state.pages.find((p) => p.id === pageId);
      if (page) {
        page.links.push(link);
      }
    },

    removePageLink: (state, action: PayloadAction<{ pageId: string; linkId: string }>) => {
      const { pageId, linkId } = action.payload;
      const page = state.pages.find((p) => p.id === pageId);
      if (page) {
        page.links = page.links.filter((l) => l.id !== linkId);
      }
    },

    updatePageLink: (state, action: PayloadAction<{ pageId: string; linkId: string; label?: string; sectionId?: string; visible?: boolean }>) => {
      const { pageId, linkId, label, sectionId, visible } = action.payload;
      const page = state.pages.find((p) => p.id === pageId);
      if (page) {
        const link = page.links.find((l) => l.id === linkId);
        if (link) {
          if (label !== undefined) link.label = label;
          if (sectionId !== undefined) link.sectionId = sectionId;
          if (visible !== undefined) link.visible = visible;
        }
      }
    },

    togglePageLinkVisibility: (state, action: PayloadAction<{ pageId: string; linkId: string }>) => {
      const { pageId, linkId } = action.payload;
      const page = state.pages.find((p) => p.id === pageId);
      if (page) {
        const link = page.links.find((l) => l.id === linkId);
        if (link) {
          link.visible = !link.visible;
        }
      }
    },
    reorderPageSections: (state, action: PayloadAction<{ pageId: string; fromSectionId: string; toSectionId: string }>) => {
      const { pageId, fromSectionId, toSectionId } = action.payload;
      const page = state.pages.find(p => p.id === pageId);
      if (page) {
        const fromIndex = page.sections.findIndex(s => s.id === fromSectionId);
        const toIndex = page.sections.findIndex(s => s.id === toSectionId);
        if (fromIndex !== -1 && toIndex !== -1) {
          const [movedSection] = page.sections.splice(fromIndex, 1);
          page.sections.splice(toIndex, 0, movedSection);
        }
      }
    },
    reorderPageLinks: (state, action: PayloadAction<{ pageId: string; fromLinkId: string; toLinkId: string }>) => {
      const { pageId, fromLinkId, toLinkId } = action.payload;
      const page = state.pages.find(p => p.id === pageId);
      if (page && page.links) {
        const fromIndex = page.links.findIndex(l => l.id === fromLinkId);
        const toIndex = page.links.findIndex(l => l.id === toLinkId);
        if (fromIndex !== -1 && toIndex !== -1) {
          const [movedLink] = page.links.splice(fromIndex, 1);
          page.links.splice(toIndex, 0, movedLink);
        }
      }
    },
    syncPagesState: (state, action: PayloadAction<Partial<PagesState>>) => {
      // Sync state from parent window (for iframe preview)
      const newState = action.payload;
      if (newState.pages) state.pages = newState.pages;
      if (newState.isAddPageModalOpen !== undefined) state.isAddPageModalOpen = newState.isAddPageModalOpen;
    },
  },
});

export const {
  openAddPageModal,
  closeAddPageModal,
  addPage,
  updatePage,
  deletePage,
  togglePageVisibility,
  setPageDropdownMode,
  addSectionToPage,
  removeSectionFromPage,
  toggleSectionVisibility,
  updatePageSections,
  addPageLink,
  removePageLink,
  updatePageLink,
  togglePageLinkVisibility,
  reorderPageSections,
  reorderPageLinks,
  syncPagesState,
} = pagesSlice.actions;

export default pagesSlice.reducer;
