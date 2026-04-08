"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Types
interface SectionConfig {
  id: string;
  type: 'hero' | 'banner' | 'features' | 'admin-panel' | 'benefits';
  name: string;
  visible: boolean;
  content: any;
}

interface HeroContent {
  title: string;
  subtitle: string;
  description: string;
  primaryButtonText: string;
  secondaryButtonText: string;
  backgroundImage: string;
  layout: 'left' | 'right' | 'center';
  titleColor: string;
  subtitleColor: string;
  descriptionColor: string;
  primaryButtonColor: string;
  secondaryButtonColor: string;
  animation: 'fade' | 'slide' | 'bounce' | 'none';
}

interface BuilderContextType {
  isBuilderMode: boolean;
  setIsBuilderMode: (value: boolean) => void;
  sections: SectionConfig[];
  updateSection: (id: string, content: any) => void;
  toggleSectionVisibility: (id: string) => void;
  deleteSection: (id: string) => void;
  addSection: (type: SectionConfig['type']) => void;
  reorderSections: (fromIndex: number, toIndex: number) => void;
  getHeroContent: () => HeroContent | null;
}

const BuilderContext = createContext<BuilderContextType | undefined>(undefined);

export const useBuilder = () => {
  const context = useContext(BuilderContext);
  if (!context) {
    throw new Error('useBuilder must be used within a BuilderProvider');
  }
  return context;
};

interface BuilderProviderProps {
  children: ReactNode;
}

export const BuilderProvider: React.FC<BuilderProviderProps> = ({ children }) => {
  const [isBuilderMode, setIsBuilderMode] = useState(false);
  const [sections, setSections] = useState<SectionConfig[]>([
    {
      id: 'hero-1',
      type: 'hero',
      name: 'Hero Section',
      visible: true,
      content: {
        title: 'Reelboost - Tiktok Clone App',
        subtitle: '',
        description: 'ReelBoost is a modern short-video and live-streaming app inspired by TikTok. It lets users create, edit, and share engaging short videos with a smooth discovery feed.',
        primaryButtonText: 'Get Started',
        secondaryButtonText: 'Learn More',
        backgroundImage: '/hero.png',
        layout: 'left',
        titleColor: '#111827',
        subtitleColor: '#2b49c5',
        descriptionColor: '#6b7280',
        primaryButtonColor: '#2b49c5',
        secondaryButtonColor: '#6b7280',
        animation: 'fade'
      } as HeroContent
    }
  ]);

  const updateSection = (id: string, content: any) => {
    setSections(prev => prev.map(section => 
      section.id === id ? { ...section, content } : section
    ));
  };

  const toggleSectionVisibility = (id: string) => {
    setSections(prev => prev.map(section => 
      section.id === id ? { ...section, visible: !section.visible } : section
    ));
  };

  const deleteSection = (id: string) => {
    setSections(prev => prev.filter(section => section.id !== id));
  };

  const addSection = (type: SectionConfig['type']) => {
    const defaultContent = getDefaultContent(type);
    const newSection: SectionConfig = {
      id: `${type}-${Date.now()}`,
      type,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Section`,
      visible: true,
      content: defaultContent
    };
    setSections(prev => [...prev, newSection]);
  };

  const reorderSections = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    
    const newSections = [...sections];
    const [movedSection] = newSections.splice(fromIndex, 1);
    newSections.splice(toIndex, 0, movedSection);
    setSections(newSections);
  };

  const getHeroContent = (): HeroContent | null => {
    const heroSection = sections.find(section => section.type === 'hero');
    return heroSection ? heroSection.content as HeroContent : null;
  };

  return (
    <BuilderContext.Provider value={{
      isBuilderMode,
      setIsBuilderMode,
      sections,
      updateSection,
      toggleSectionVisibility,
      deleteSection,
      addSection,
      reorderSections,
      getHeroContent
    }}>
      {children}
    </BuilderContext.Provider>
  );
};

// Helper function to get default content for different section types
const getDefaultContent = (type: SectionConfig['type']) => {
  switch (type) {
    case 'hero':
      return {
        title: 'New Section',
        subtitle: 'Subtitle',
        description: 'Description text goes here.',
        primaryButtonText: 'Get Started',
        secondaryButtonText: 'Learn More',
        backgroundImage: '/hero.png',
        layout: 'left' as const,
        titleColor: '#111827',
        subtitleColor: '#2b49c5',
        descriptionColor: '#6b7280',
        primaryButtonColor: '#2b49c5',
        secondaryButtonColor: '#6b7280',
        animation: 'fade' as const
      };
    case 'banner':
      return {
        title: 'Banner Title',
        subtitle: 'Banner Subtitle',
        description: 'Banner description.',
        buttonText: 'Click Here',
        backgroundColor: '#f3f4f6',
        textColor: '#111827',
        layout: 'center' as const
      };
    case 'features':
      return {
        title: 'Our Features',
        subtitle: 'What we offer',
        features: [
          { title: 'Feature 1', description: 'Description for feature 1' },
          { title: 'Feature 2', description: 'Description for feature 2' },
          { title: 'Feature 3', description: 'Description for feature 3' }
        ],
        backgroundColor: '#ffffff',
        textColor: '#111827'
      };
    case 'admin-panel':
      return {
        title: 'Admin Panel',
        subtitle: 'Management Features',
        description: 'Comprehensive admin tools.',
        features: [
          'User Management',
          'Content Control',
          'Analytics Dashboard'
        ],
        backgroundColor: '#f9fafb',
        textColor: '#111827'
      };
    case 'benefits':
      return {
        title: 'Benefits',
        subtitle: 'Why Choose Us',
        benefits: [
          { title: 'Benefit 1', description: 'Description for benefit 1' },
          { title: 'Benefit 2', description: 'Description for benefit 2' }
        ],
        backgroundColor: '#ffffff',
        textColor: '#111827'
      };
    default:
      return {};
  }
};
