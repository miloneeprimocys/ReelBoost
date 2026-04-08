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

// Demo data templates for new admin sections
const demoAdminTemplates: AdminTabContent[] = [
  {
    id: 'recharge-plan',
    label: "RECHARGE PLAN",
    subtitle: "Monetization & Economy",
    title: "Wallet Recharge Plans",
    description: "Admins can view how many users have purchased each recharge plan and on which date and time. They can easily manage all plans in one place.",
    points: [
      "Track user purchases with date & time",
      "Update pricing and plans instantly",
    ],
    image: "/Admin1.svg",
    order: 1,
    visible: true,
  },
  {
    id: 'user-management',
    label: "USER MANAGEMENT",
    subtitle: "Platform Control",
    title: "User Administration",
    description: "Comprehensive user management tools to monitor, moderate, and manage all platform users effectively.",
    points: [
      "View and manage user accounts",
      "Suspend or ban problematic users",
      "Track user activity and engagement"
    ],
    image: "/Admin2.svg",
    order: 2,
    visible: true,
  },
  {
    id: 'content-moderation',
    label: "CONTENT MODERATION",
    subtitle: "Quality Assurance",
    title: "Content Review System",
    description: "Advanced content moderation tools to ensure platform safety and content quality standards.",
    points: [
      "Review flagged content automatically",
      "Approve or reject user uploads",
      "Manage community guidelines"
    ],
    image: "/Admin3.svg",
    order: 3,
    visible: true,
  }
];

const initialState: AdminState = {
  sections: [], // No default admin sections - they will be created dynamically
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
      const { type, order, id } = action.payload;
      const maxOrder = order || Math.max(...state.sections.map(s => s.order), 0) + 1;
      
      // Rotate through demo templates based on current section count
      const templateIndex = state.sections.length % demoAdminTemplates.length;
      const template = demoAdminTemplates[templateIndex];
      
      const newSection: AdminTabContent = {
        ...template,
        id: id || `admin-${Date.now()}`,
        order: maxOrder,
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
