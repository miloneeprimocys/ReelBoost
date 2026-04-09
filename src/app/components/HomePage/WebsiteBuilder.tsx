"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, Edit3, ChevronLeft } from "lucide-react";
import { useAppSelector, useAppDispatch } from "../../hooks/reduxHooks";
import { 
  toggleBuilderMode, 
  setActiveSection, 
  toggleSectionVisibility, 
  deleteSection, 
  addSectionAndSetActive, 
  reorderSections, 
  updateSectionContent
} from "../../store/builderSlice";
import { 
  setActiveBannerSection, 
  updateBannerContent,
  addBannerSection,
  deleteBannerSection,
  toggleBannerSectionVisibility,
  setBannerSectionOrder,
  reorderBannerSections
} from "../../store/bannerSlice";
import { 
  setActiveSection as setActiveAdminSection,
  updateAdminContent,
  addAdminSection,
  deleteAdminSection,
  toggleAdminSectionVisibility,
  reorderAdminSections
} from "../../store/adminSlice";
import { openEditor } from "../../store/editorSlice";
import HeroEditor from "./WebsiteBuilder/HeroEditor";
import BannerEditor from "./WebsiteBuilder/BannerEditor";
import FeaturesEditor from "./WebsiteBuilder/FeaturesEditor";
import AdminEditor from "./WebsiteBuilder/AdminEditor";
import BenefitsEditor from "./WebsiteBuilder/BenefitsEditor";
import SectionList from "./WebsiteBuilder/SectionList";

const WebsiteBuilder: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isBuilderMode, sections, activeSection } = useAppSelector(state => state.builder);
  const { sections: bannerSections, activeSection: activeBannerSection } = useAppSelector(state => state.banner);
  const { sections: adminSections, activeSection: activeAdminSection } = useAppSelector(state => state.admin);
  const { editorSection } = useAppSelector(state => state.editor);
  
  // Update editorSection when activeSection changes
  React.useEffect(() => {
    console.log('WebsiteBuilder useEffect:', { activeSection, activeBannerSection });
    
    if (activeSection) {
      const section = sections.find(s => s.id === activeSection);
      console.log('Found section:', section);
      
      if (section && (section.type === 'hero' || section.type === 'fourth' || section.type === 'features' || section.type === 'sixth' || section.type === 'benefits')) {
        console.log('Opening editor for section type:', section.type);
        dispatch(openEditor({ section }));
      }
    } else if (activeBannerSection) {
      const section = bannerSections.find(s => s.id === activeBannerSection);
      if (section) {
        dispatch(openEditor({ section }));
      }
    }
  }, [activeSection, activeBannerSection, sections, bannerSections, dispatch]);
  
  // Memoize banner sections to prevent infinite re-renders
  const builderBannerSections = React.useMemo(() => 
    sections.filter(s => s.type === 'banner'), 
    [sections]
  );
  
  // Combine ALL sections (including fifth, hero, etc.) with banner sections - MUST MATCH SECTIONLIST
  const allSections = React.useMemo(() => {
    const sectionsMap = new Map();
    
    // Add all sections first (including fifth, hero, fourth, etc.)
    sections.forEach(section => {
      sectionsMap.set(section.id, { ...section, source: 'builder' });
    });
    
    // Add banner sections
    bannerSections.forEach(section => {
      sectionsMap.set(section.id, { ...section, source: 'banner' });
    });
    
    // Convert to array and sort by order
    return Array.from(sectionsMap.values()).sort((a, b) => a.order - b.order);
  }, [sections, bannerSections]);
  
  // Keep allBannerSections for backward compatibility but use allSections for drag/drop
  const allBannerSections = React.useMemo(() => 
    [...builderBannerSections, ...bannerSections], 
    [builderBannerSections, bannerSections]
  );
  
  const [dragItem, setDragItem] = useState<number>(-1);
  const [dragOverItem, setDragOverItem] = useState<number>(-1);
  const [imageUploadType, setImageUploadType] = useState<string>('');
  const [showEditorOnMobile, setShowEditorOnMobile] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
   


  // Handle active banner section change
  useEffect(() => {
    if (activeBannerSection) {
      setShowEditorOnMobile(true);
      console.log('Banner section activated:', activeBannerSection);
    }
  }, [activeBannerSection]);

  // Handle active section change for fifth sections (open mobile editor)
  useEffect(() => {
    if (activeSection) {
      const section = sections.find(s => s.id === activeSection);
      if (section?.type === 'fifth' && isMobile) {
        setShowEditorOnMobile(true);
        console.log('Fifth section activated - opening mobile editor:', activeSection);
      }
    }
  }, [activeSection, sections, isMobile]);

  // Handle responsive detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Debug: Log when activeBannerSection changes
  useEffect(() => {
    console.log('=== WebsiteBuilder activeBannerSection changed ===');
    console.log('activeBannerSection:', activeBannerSection);
    console.log('showEditorOnMobile:', showEditorOnMobile);
    console.log('isMobile:', isMobile);
    console.log('bannerSections:', bannerSections);
    console.log('isBuilderMode:', isBuilderMode);
  }, [activeBannerSection, showEditorOnMobile, isMobile, bannerSections, isBuilderMode]);
useEffect(() => {
  // Only set default hero if we're in builder mode, no sections are active,
  // AND we haven't recently worked with banner sections
  if (isBuilderMode && !activeSection && !activeBannerSection && !activeAdminSection) {
    const defaultHeroSection = sections.find(s => s.id === 'hero-1');
    if (defaultHeroSection) {
      console.log('Setting default hero section:', defaultHeroSection.id);
      dispatch(setActiveSection(defaultHeroSection.id));
    }
  } else {
    console.log('NOT setting default hero - isBuilderMode:', isBuilderMode, 'activeSection:', activeSection, 'activeBannerSection:', activeBannerSection);
  }
}, [isBuilderMode, activeSection, activeBannerSection, activeAdminSection, sections, dispatch]);



  const handleDragStart = (index: number) => {
    setDragItem(index);
  };

  const handleDragEnter = (index: number) => {
    setDragOverItem(index);
  };

 const handleDragEnd = () => {
  console.log('=== handleDragEnd called ===');
  console.log('dragItem:', dragItem, 'dragOverItem:', dragOverItem);
  console.log('allSections.length:', allSections.length);
  console.log('allSections:', allSections.map(s => ({ id: s.id, type: s.type, order: s.order })));
  
  if (dragItem === -1 || dragOverItem === -1) {
    console.log('One of the indices is -1, returning early');
    setDragItem(-1);
    setDragOverItem(-1);
    return;
  }

  const fromIndex = dragItem;
  const toIndex = dragOverItem;
  
  console.log('Attempting reorder from', fromIndex, 'to', toIndex);
  
  // Get the dragged and target sections from allSections
  const draggedSection = allSections[fromIndex];
  const targetSection = allSections[toIndex];
  
  console.log('Dragged section at index', fromIndex, ':', draggedSection);
  console.log('Target section at index', toIndex, ':', targetSection);
  
  if (!draggedSection || !targetSection) {
    console.error('Sections not found');
    console.error('draggedSection:', draggedSection);
    console.error('targetSection:', targetSection);
    setDragItem(-1);
    setDragOverItem(-1);
    return;
  }
  
  console.log('Dragged section:', draggedSection.id, 'Type:', draggedSection.type);
  console.log('Target section:', targetSection.id, 'Type:', targetSection.type);
  
  // Check if dragged section is a banner (type is 'banner' from bannerSlice)
  const isDraggedBanner = draggedSection.type === 'banner' && bannerSections.some(s => s.id === draggedSection.id);
  const isTargetBanner = targetSection.type === 'banner' && bannerSections.some(s => s.id === targetSection.id);
  
  console.log('isDraggedBanner:', isDraggedBanner, 'isTargetBanner:', isTargetBanner);
  
  // Case 1: Both are builder sections (not banners)
  if (!isDraggedBanner && !isTargetBanner) {
    console.log('Reordering builder sections');
    // Use the indices directly from allSections since that's what's displayed
    // Create a filtered array of builder sections from allSections to get correct indices
    const builderSectionsInAllSections = allSections.filter(s => s.source === 'builder');
    const builderDragIndex = builderSectionsInAllSections.findIndex(s => s.id === draggedSection.id);
    const builderTargetIndex = builderSectionsInAllSections.findIndex(s => s.id === targetSection.id);
    
    console.log('builderDragIndex:', builderDragIndex, 'builderTargetIndex:', builderTargetIndex);
    console.log('Builder sections in allSections:', builderSectionsInAllSections.map(s => s.id));
    
    if (builderDragIndex !== -1 && builderTargetIndex !== -1) {
      dispatch(reorderSections({ fromIndex: builderDragIndex, toIndex: builderTargetIndex }));
    }
  } 
  // Case 2: Both are banner sections
  else if (isDraggedBanner && isTargetBanner) {
    console.log('Reordering banner sections');
    // Find indices in the original bannerSections array
    const bannerDragIndex = bannerSections.findIndex((s: any) => s.id === draggedSection.id);
    const bannerTargetIndex = bannerSections.findIndex((s: any) => s.id === targetSection.id);
    
    console.log('bannerDragIndex:', bannerDragIndex, 'bannerTargetIndex:', bannerTargetIndex);
    
    if (bannerDragIndex !== -1 && bannerTargetIndex !== -1) {
      dispatch(reorderBannerSections({ fromIndex: bannerDragIndex, toIndex: bannerTargetIndex }));
    }
  }
  // Case 3: Mixed reordering (builder to banner or banner to builder)
  else {
    console.log('Mixed reordering - moving between different section types');
    console.warn('Moving sections between builder and banner is not supported');
  }
  
  setDragItem(-1);
  setDragOverItem(-1);
  console.log('=== handleDragEnd complete ===');
};

const handleBackToList = () => {
  setShowEditorOnMobile(false);
  // Don't clear active sections - just hide mobile editor
};

useEffect(() => {
  if (activeBannerSection && activeSection) {
    dispatch(setActiveSection(null));
  }
}, [activeBannerSection]);
useEffect(() => {
  // Only run if we have an active section and we're in desktop view (not mobile editor)
  if (!showEditorOnMobile && !activeSection && !activeBannerSection) return;

  // HERO
  if (activeSection) {
    const section = sections.find(s => s.id === activeSection);
    if (section && section.type === 'hero') {
      const heroSections = sections.filter(s => s.type === 'hero');
      const isFirstHero = heroSections[0]?.id === section.id;

      let heroContent = section.content;

      if (isFirstHero) {
        const staticContent = getHeroContentFromStaticHero();
        heroContent = { ...staticContent, ...section.content };
      }

      dispatch(openEditor({ section: { ...section, content: heroContent } }));
      return;
    }
    
    // FIFTH (Admin Panel)
    if (section && section.type === 'fifth') {
      console.log('Opening editor for fifth section:', section);
      dispatch(openEditor({ section }));
      return;
    }
  }

  // BANNER - Only run if we have a valid activeBannerSection
  if (activeBannerSection) {
    console.log('=== useEffect BANNER ===', { activeBannerSection, builderBannerSections, bannerSections });
    
    const builderBannerSection = builderBannerSections.find(
      (s: any) => s.id === activeBannerSection
    );

    console.log('builderBannerSection found:', builderBannerSection);

    if (builderBannerSection) {
      console.log('Opening builder banner section:', builderBannerSection);
      dispatch(openEditor({ section: builderBannerSection }));
      return;
    }

    const newBannerSection = bannerSections.find(
      (s: any) => s.id === activeBannerSection
    );

    console.log('newBannerSection found:', newBannerSection);

    if (newBannerSection) {
      console.log('Opening new banner section:', newBannerSection);
      dispatch(openEditor({ section: newBannerSection }));
      return;
    }
  }
}, [
  activeSection,
  activeBannerSection,
  sections,
  bannerSections,
  builderBannerSections,
  showEditorOnMobile,
  dispatch
]);
  // Function to get current Hero.tsx content
  const getHeroContentFromStaticHero = () => {
    return {
      title: 'Reelboost - Tiktok Clone App',
      subtitle: '',
      description: 'ReelBoost is a modern short-video and live-streaming app inspired by TikTok. It lets users create, edit, and share engaging short videos with a smooth discovery feed. Creators can go live, interact with audiences in real time, and build loyal communities. Designed for performance and scale, ReelBoost supports engagement, growth, and monetization.',
      primaryButtonText: 'Get Started',
      secondaryButtonText: 'Learn More',
      backgroundImage: '/hero.png',
      layout: 'left' as const,
      titleColor: '#2D3134',
      subtitleColor: '#2D3134',
      descriptionColor: '#6B7280',
      primaryButtonColor: '#4A72FF',
      secondaryButtonColor: '#6B7280',
      animation: 'fade' as const,
      tags: ["Live Streaming", "PK Battle", "Multiple Payment Gateway", "Video Trimming", "Add Music", "Wallet", "Gits", "Earn Coins"],
      activeTag: "Live Streaming",
      appStoreImage: '/Button1.png',
      googlePlayImage: '/Button2.png',
      dotText: ''
    };
  };

  const handleImageUpload = (sectionId: string, imageType: string) => {
    setImageUploadType(`${sectionId}-${imageType}`);
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          dispatch(updateSectionContent({ 
            id: sectionId, 
            content: { [imageType]: result } 
          }));
        };
        reader.readAsDataURL(file);
      }
      setImageUploadType('');
    };
    input.click();
  };

  if (!isBuilderMode) {
    return (
      <button
        // onClick={() => dispatch(toggleBuilderMode())}
        className="hidden max-md:flex fixed bottom-6 right-6 z-50  text-white p-4 "
      >
        
      </button>
    );
  }

  const renderContent = () => {
    console.log('=== renderContent START ===', { editorSection, activeSection, activeBannerSection, isMobile });
    
    // Mobile View (max-width: 768px)
    if (isMobile) {
      // Show editor only for hero or banner sections
     const hasEditableSection = activeBannerSection || activeSection || activeAdminSection;
       console.log('Mobile hasEditableSection:', hasEditableSection);
      
     if (showEditorOnMobile && hasEditableSection) {
      // 🔥 ALWAYS PRIORITIZE BANNER FIRST
      console.log('Mobile: showEditorOnMobile && hasEditableSection', { showEditorOnMobile, hasEditableSection });
      console.log('Mobile checking banner section, activeBannerSection:', activeBannerSection);

  if (activeBannerSection) {
    const builderBannerSection = builderBannerSections.find(
      (s: any) => s.id === activeBannerSection
    );

    if (builderBannerSection) {
      return (
        <div className="w-full bg-gray-50 flex flex-col">
          {/* header */}
          <div className="sticky top-0 z-10 bg-white border-b p-4 flex items-center ">
            <button onClick={handleBackToList} className="p-2 hover:bg-gray-100 rounded-lg text-black">
              <ChevronLeft size={20} />
            </button>
            <h3 className="font-semibold text-black">Edit {builderBannerSection.name}</h3>
          </div>

          <div className="flex-1 overflow-y-auto">
            <BannerEditor />
          </div>
        </div>
      );
    }

    const newBannerSection = bannerSections.find(
      (s: any) => s.id === activeBannerSection
    );

    if (newBannerSection) {
      return (
        <div className="w-full bg-gray-50 flex flex-col">
          <div className="sticky top-0 z-10 bg-white border-b p-4 flex items-center ">
            <button onClick={handleBackToList} className="p-2 hover:bg-gray-100 rounded-lg text-black">
              <ChevronLeft size={20} />
            </button>
            <h3 className="font-semibold text-black">Edit {newBannerSection.name}</h3>
          </div>

          <div className="flex-1 overflow-y-auto">
            <BannerEditor />
          </div>
        </div>
      );
    }

    // Handle regular sections (hero, fourth, features, fifth, sixth, benefits)
    if (activeSection) {
      console.log('Mobile: activeSection ===', activeSection);
      console.log('Mobile: sections array ===', sections.map(s => ({ id: s.id, type: s.type, name: s.name })));
      const section = sections.find(s => s.id === activeSection);
      console.log('Mobile checking regular section:', section);
      console.log('Mobile: section.type ===', section?.type);
      console.log('Mobile: checking benefits condition:', section?.type === 'sixth' || section?.type === 'benefits');
      
      if (section && (section.type === 'hero' || section.type === 'fourth' || section.type === 'features' || section.type === 'fifth' || section.type === 'sixth' || section.type === 'benefits')) {
        console.log('Mobile: returning section editor for type:', section?.type);
        return (
          <div className="w-full bg-gray-50 flex flex-col">
            {/* header */}
            <div className="sticky top-0 z-10 bg-white border-b p-4 flex items-center ">
              <button onClick={handleBackToList} className="p-2 hover:bg-gray-100 rounded-lg text-black">
                <ChevronLeft size={20} />
              </button>
              <h3 className="font-semibold text-black">Edit {section?.name || 'Section'}</h3>
            </div>

            <div className="flex-1 overflow-y-auto">
              {section.type === 'hero' && <HeroEditor />}
              {(section.type === 'fourth' || section.type === 'features') && <FeaturesEditor />}
              {section.type === 'fifth' && <AdminEditor />}
              {(section.type === 'sixth' || section.type === 'benefits') && <BenefitsEditor />}
            </div>
          </div>
        );
      } else {
        console.log('Mobile: section condition failed, section.type:', section?.type);
      }
    }
  }

  // ✅ THEN HERO
  if (activeSection) {
    const section = sections.find(s => s.id === activeSection);
    console.log('Mobile checking hero section:', section);

    if (section && section.type === 'hero') {
      const heroSections = sections.filter(s => s.type === 'hero');
      const isFirstHero = heroSections[0]?.id === section.id;

      let heroContent;
      if (isFirstHero) {
        const staticContent = getHeroContentFromStaticHero();
        heroContent = { ...staticContent, ...section.content };
      } else {
        heroContent = section.content;
      }

      return (
        <div className="w-full bg-gray-50 flex flex-col">
          <div className="sticky top-0 z-10 bg-white border-b p-4 flex items-center ">
            <button
              onClick={handleBackToList}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-black"
            >
              <ChevronLeft size={20} />
            </button>
            <h3 className="font-semibold text-gray-900">Edit {section.name}</h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            <HeroEditor />
          </div>
        </div>
      );
    }
  }

  // ✅ THEN FOURTH (FEATURES)
  if (activeSection) {
    const section = sections.find(s => s.id === activeSection);
    console.log('Mobile checking features section:', section);
    
    if (section && (section.type === 'fourth' || section.type === 'features')) {
      return (
        <div className="w-full bg-gray-50 flex flex-col">
          {/* header */}
          <div className="sticky top-0 z-10 bg-white border-b p-4 flex items-center ">
            <button onClick={handleBackToList} className="p-2 hover:bg-gray-100 rounded-lg text-black">
              <ChevronLeft size={20} />
            </button>
            <h3 className="font-semibold text-black">Edit {section?.name || 'Section'}</h3>
          </div>

          <div className="flex-1 overflow-y-auto">
            <FeaturesEditor />
          </div>
        </div>
      );
    }

    // ✅ THEN SIXTH/BENEFITS SECTION
    if (section && (section.type === 'sixth' || section.type === 'benefits')) {
      return (
        <div className="w-full bg-gray-50 flex flex-col">
          {/* header */}
          <div className="sticky top-0 z-10 bg-white border-b p-4 flex items-center ">
            <button onClick={handleBackToList} className="p-2 hover:bg-gray-100 rounded-lg text-black">
              <ChevronLeft size={20} />
            </button>
            <h3 className="font-semibold text-black">Edit {section?.name || 'Benefits Section'}</h3>
          </div>

          <div className="flex-1 overflow-y-auto">
            <BenefitsEditor />
          </div>
        </div>
      );
    }

    // ✅ THEN ADMIN PANEL
    if (activeAdminSection) {
      const section = adminSections.find(s => s.id === activeAdminSection);
      console.log('Mobile checking admin section:', section);
      
      if (section) {
        return (
          <div className="w-full bg-gray-50 flex flex-col">
            {/* header */}
            <div className="sticky top-0 z-10 bg-white border-b p-4 flex items-center">
              <button onClick={handleBackToList} className="p-2 hover:bg-gray-100 rounded-lg text-black">
                <ChevronLeft size={20} />
              </button>
              <h3 className="font-semibold text-black">Edit {section?.label || 'Admin Section'}</h3>
            </div>

            <div className="flex-1 overflow-y-auto">
              <AdminEditor />
            </div>
          </div>
        );
      }
    }
    
    // THEN FIFTH SECTION (Admin Panel) - Check by looking up in sections using activeSection
    if (activeSection) {
      const section = sections.find(s => s.id === activeSection);
      if (section && section.type === 'fifth') {
        console.log('Mobile opening AdminEditor for fifth section via activeSection');
        return (
          <div className="w-full bg-gray-50 flex flex-col">
            {/* header */}
            <div className="sticky top-0 z-10 bg-white border-b p-4 flex items-center ">
              <button onClick={handleBackToList} className="p-2 hover:bg-gray-100 rounded-lg text-black">
                <ChevronLeft size={20} />
              </button>
              <h3 className="font-semibold text-black">Edit {section?.name || 'Section'}</h3>
            </div>

            <div className="flex-1 overflow-y-auto">
              <AdminEditor />
            </div>
          </div>
        );
      }
      if (section && (section.type === 'sixth' || section.type === 'benefits')) {
        console.log('Mobile opening BenefitsEditor for', section.type, 'section via activeSection');
        return (
          <div className="w-full bg-gray-50 flex flex-col">
            {/* header */}
            <div className="sticky top-0 z-10 bg-white border-b p-4 flex items-center ">
              <button onClick={handleBackToList} className="p-2 hover:bg-gray-100 rounded-lg text-black">
                <ChevronLeft size={20} />
              </button>
              <h3 className="font-semibold text-black">Edit {section?.name || 'Benefits Section'}</h3>
            </div>

            <div className="flex-1 overflow-y-auto">
              <BenefitsEditor />
            </div>
          </div>
        );
      }
    }
  }
}
      
      return (
        <div className="w-full bg-white shadow-xl flex flex-col">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">Website Builder</h2>
            <button
              onClick={() => dispatch(toggleBuilderMode())}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-700 cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto hide-scrollbar p-6">
          <SectionList
  sections={sections}  // ← Only builder sections (hero, fourth, features, etc.)
  bannerSections={bannerSections}  // ← Only banner sections (live streaming, pk battle)
  adminSections={adminSections}  // ← Admin sections
  activeSection={activeSection}
  activeBannerSection={activeBannerSection}
  activeAdminSection={activeAdminSection}
  onDragStart={handleDragStart}
  onDragEnter={handleDragEnter}
  onDragEnd={handleDragEnd}
  onToggleVisibility={(id) => dispatch(toggleSectionVisibility(id))}
  onToggleBannerVisibility={(id) => dispatch(toggleBannerSectionVisibility(id))}
  onToggleAdminVisibility={(id) => dispatch(toggleAdminSectionVisibility(id))}
  onSetActive={(id) => {
    console.log('=== MOBILE onSetActive ===', id);
    console.log('Available sections:', sections);
    dispatch(setActiveBannerSection(null)); // Clear banner
    dispatch(setActiveAdminSection(null)); // Clear admin
    dispatch(setActiveSection(id));
    // Show editor for hero, fourth, and features sections
    const section = sections.find(s => s.id === id);
    console.log('Found section:', section);
    console.log('Section type:', section?.type);
    if (section?.type === 'hero' || section?.type === 'fourth' || section?.type === 'features' || section?.type === 'fifth' || section?.type === 'admin-panel' || section?.type === 'sixth' || section?.type === 'benefits') {
      console.log('Opening mobile editor for section type:', section?.type);
      setShowEditorOnMobile(true);
    } else {
      console.log('Not opening mobile editor for section type:', section?.type);
    }
  }}
  onSetActiveBanner={(id) => {
    console.log('=== MOBILE onSetActiveBanner ===', id);
    dispatch(setActiveSection(null)); // Clear hero
    dispatch(setActiveAdminSection(null)); // Clear admin
    dispatch(setActiveBannerSection(id));
    setShowEditorOnMobile(true); // Always show editor for banner sections
  }}
  onSetActiveAdmin={(id) => {
    console.log('=== MOBILE onSetActiveAdmin ===', id);
    dispatch(setActiveSection(null)); // Clear hero
    dispatch(setActiveBannerSection(null)); // Clear banner
    dispatch(setActiveAdminSection(id));
    setShowEditorOnMobile(true); // Always show editor for admin sections
  }}
  onDelete={(id) => dispatch(deleteSection(id))}
  onDeleteBanner={(id) => dispatch(deleteBannerSection(id))}
  onDeleteAdmin={(id) => dispatch(deleteAdminSection(id))}
  onAddSection={(type) => {
    if (type === 'banner') {
      // Calculate the maximum order from all sections (both builder and banner)
      const allOrders = [
        ...sections.map(s => s.order || 0),
        ...bannerSections.map(s => s.order || 0),
        ...adminSections.map(s => s.order || 0)
      ];
      const maxOrder = Math.max(...allOrders, 0);
      
      // Add banner section with correct order
      const result = dispatch(addBannerSection({ type, maxOrder }));
      
      // Set as active banner section using the returned ID
      if (result.payload?.id) {
        dispatch(setActiveBannerSection(result.payload.id));
      }
    } else if (type === 'admin-panel') {
      // Add a new fifth type section (Admin Panel with tabs inside)
      dispatch(addSectionAndSetActive({ type: 'fifth', name: 'Admin Panel Section' }));
    } else {
      dispatch(addSectionAndSetActive({ type: type as any }));
    }
  }}
  dragOverItem={dragOverItem}
/>
          </div>
        </div>
      );
    }
    
    // Desktop/Tablet View (min-width: 768px)
    return (
      <>
        {/* Section List Panel - Reduced width on md screens */}
        <div className="w-full md:w-80 lg:w-96 bg-white shadow-xl flex flex-col">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">Website Builder</h2>
            <button
              onClick={() => dispatch(toggleBuilderMode())}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-700 cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <SectionList
              sections={sections}
              bannerSections={allBannerSections}
              adminSections={adminSections}
              activeSection={activeSection}
              activeBannerSection={activeBannerSection}
              activeAdminSection={activeAdminSection}
              onDragStart={handleDragStart}
              onDragEnter={handleDragEnter}
              onDragEnd={handleDragEnd}
              onToggleVisibility={(id) => dispatch(toggleSectionVisibility(id))}
              onToggleBannerVisibility={(id) => dispatch(toggleBannerSectionVisibility(id))}
              onToggleAdminVisibility={(id) => dispatch(toggleAdminSectionVisibility(id))}
              onSetActive={(id) => {
                console.log('=== onSetActive called ===', id);
                dispatch(setActiveBannerSection(null)); // Clear banner
                dispatch(setActiveAdminSection(null)); // Clear admin
                dispatch(setActiveSection(id));
                console.log('activeSection set to:', id, 'activeBannerSection cleared');
              }}
              onSetActiveBanner={(id) => {
                console.log('=== onSetActiveBanner called ===', id);
                dispatch(setActiveSection(null)); // Clear hero
                dispatch(setActiveAdminSection(null)); // Clear admin
                dispatch(setActiveBannerSection(id));
                console.log('activeBannerSection set to:', id, 'activeSection cleared to null');
              }}
              onSetActiveAdmin={(id) => {
                console.log('=== onSetActiveAdmin called ===', id);
                dispatch(setActiveSection(null)); // Clear hero
                dispatch(setActiveBannerSection(null)); // Clear banner
                dispatch(setActiveAdminSection(id));
                console.log('activeAdminSection set to:', id, 'other sections cleared');
              }}
              onDelete={(id) => dispatch(deleteSection(id))}
              onDeleteBanner={(id) => dispatch(deleteBannerSection(id))}
              onDeleteAdmin={(id) => dispatch(deleteAdminSection(id))}
              onAddSection={(type) => {
                if (type === 'banner') {
                  // Calculate the maximum order from all sections (both builder and banner)
                  const allOrders = [
                    ...sections.map(s => s.order || 0),
                    ...bannerSections.map(s => s.order || 0),
                    ...adminSections.map(s => s.order || 0)
                  ];
                  const maxOrder = Math.max(...allOrders, 0);
                  
                  // Add banner section with correct order
                  const result = dispatch(addBannerSection({ type, maxOrder }));
                  
                  // Set as active banner section using the returned ID
                  if (result.payload?.id) {
                    dispatch(setActiveBannerSection(result.payload.id));
                  }
                } else if (type === 'admin-panel') {
                  // Add a new fifth type section (Admin Panel with tabs inside)
                  dispatch(addSectionAndSetActive({ type: 'fifth', name: 'Admin Panel Section' }));
                } else {
                  dispatch(addSectionAndSetActive({ type: type as any }));
                }
              }}
            dragOverItem={dragOverItem}
            />
          </div>
        </div>

        {/* Section Editor Panel - Only show for hero, fourth, features, admin, or banner sections */}
        {((activeSection && (sections.find(s => s.id === activeSection)?.type === 'hero' || sections.find(s => s.id === activeSection)?.type === 'fourth' || sections.find(s => s.id === activeSection)?.type === 'features' || sections.find(s => s.id === activeSection)?.type === 'fifth' || sections.find(s => s.id === activeSection)?.type === 'sixth' || sections.find(s => s.id === activeSection)?.type === 'benefits')) || activeBannerSection || activeAdminSection) && (
          <div className="flex-1 bg-gray-50 border-l overflow-y-auto">
            {(() => {
              console.log('=== Desktop render ===', { activeSection, activeBannerSection });
              // Handle hero section
              if (activeSection && !activeBannerSection) {
                const section = sections.find(s => s.id === activeSection);
                console.log('Desktop checking section:', { activeSection, section, sectionType: section?.type });
                if (section && section.type === 'hero') {
                  const heroSections = sections.filter(s => s.type === 'hero');
                  const isFirstHero = heroSections[0]?.id === section.id;
                  let heroContent;
                  if (isFirstHero) {
                    const staticContent = getHeroContentFromStaticHero();
                    heroContent = { ...staticContent, ...section.content };
                  } else {
                    heroContent = section.content;
                  }
                  
                  return <HeroEditor />;
                }
                if (section && (section.type === 'fourth' || section.type === 'features')) {
                  console.log('Desktop opening FeaturesEditor for', section.type, 'section');
                  return <FeaturesEditor />;
                }
                if (section && section.type === 'fifth') {
                  console.log('Desktop opening AdminEditor for fifth section');
                  return <AdminEditor />;
                }
                if (section && (section.type === 'sixth' || section.type === 'benefits')) {
                  console.log('Desktop opening BenefitsEditor for', section.type, 'section');
                  return <BenefitsEditor />;
                }
              }
              
              // Handle admin section (including fifth sections that were set via activeAdminSection)
              if (activeAdminSection) {
                console.log('Desktop opening AdminEditor for admin section:', activeAdminSection);
                return <AdminEditor />;
              }
              
              // Handle banner section (Live Streaming, PK Battle, new banners)
              console.log('Desktop checking banner, activeBannerSection:', activeBannerSection);
             // FIRST: Banner (priority)
if (activeBannerSection) {
  const builderBannerSection = builderBannerSections.find(
    (s: any) => s.id === activeBannerSection
  );

  if (builderBannerSection) return <BannerEditor />;

  const newBannerSection = bannerSections.find(
    (s: any) => s.id === activeBannerSection
  );

  if (newBannerSection) return <BannerEditor />;
}

// SECOND: Hero
if (editorSection) {
  const section = editorSection;
  console.log('Checking section:', { editorSection, section, sectionType: section?.type });
  
  if (section?.type === 'hero') {
    console.log('Returning HeroEditor');
    return <HeroEditor />;
  }
  if (section?.type === 'fourth' || section?.type === 'features') {
    console.log('Opening FeaturesEditor for', section?.type, 'section');
    return <FeaturesEditor />;
  }
  if (section?.type === 'fifth') {
    console.log('Opening AdminEditor for fifth section');
    return <AdminEditor />;
  }
  if (section?.type === 'sixth' || section?.type === 'benefits') {
    console.log('Opening BenefitsEditor for', section?.type, 'section');
    console.log('Section details:', { id: section?.id, name: section?.name, content: section?.content });
    console.log('About to return BenefitsEditor');
    return <BenefitsEditor />;
  }
  console.log('No matching section type, returning null');
}
              
              return null;
            })()}
          </div>
        )}
      </>
    );
  };

  return (
    <div className="fixed top-[70px] left-0 right-0 bottom-0 z-50 bg-black/50 flex">
      {renderContent()}
    </div>
  );
};

export default WebsiteBuilder;