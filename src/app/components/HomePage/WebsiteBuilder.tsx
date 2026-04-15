"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { X, Edit3, ChevronLeft, Undo, Redo, Facebook, Twitter, Linkedin, Instagram, Phone, Mail } from "lucide-react";
import { useAppSelector, useAppDispatch } from "../../hooks/reduxHooks";
import { store } from "../../store";
import { 
  toggleBuilderMode, 
  setActiveSection, 
  toggleSectionVisibility, 
  deleteSection, 
  addSectionAndSetActive, 
  reorderSections, 
  updateSectionContent,
  undo,
  redo,
  undoSections,
  redoSections,
  updateSectionsHistory,
  selectCanUndo,
  selectCanRedo,
  selectSectionsCanUndo,
  selectSectionsCanRedo,
  selectPendingBannerSections
} from "../../store/builderSlice";
import { 
  setActiveBannerSection, 
  updateBannerContent,
  addBannerSection,
  deleteBannerSection,
  toggleBannerSectionVisibility,
  setBannerSectionOrder,
  reorderBannerSections,
  setAllBannerSections,
  undoBanner,
  redoBanner,
  selectBannerCanUndo,
  selectBannerCanRedo
} from "../../store/bannerSlice";
import { 
  setActiveSection as setActiveAdminSection,
  updateAdminContent,
  addAdminSection,
  deleteAdminSection,
  toggleAdminSectionVisibility,
  reorderAdminSections
} from "../../store/adminSlice";
import { openEditor, setEditingOverlay } from "../../store/editorSlice";
import { setActiveNavbar } from "../../store/navbarSlice";
import HeroEditor from "./WebsiteBuilder/HeroEditor";
import BannerEditor from "./WebsiteBuilder/BannerEditor";
import FeaturesEditor from "./WebsiteBuilder/FeaturesEditor";
import AdminEditor from "./WebsiteBuilder/AdminEditor";
import BenefitsEditor from "./WebsiteBuilder/BenefitsEditor";
import NavbarEditor from "./WebsiteBuilder/NavbarEditor";
import FooterEditor from "./WebsiteBuilder/FooterEditor";
import SectionList from "./WebsiteBuilder/SectionList";

// Import homepage section components for preview
import Hero from "../../Pages/Home/Hero";
import SecondSection from "../../Pages/Home/SecondSection";
import ThirdSection from "../../Pages/Home/ThirdSection";
import FourthSection from "../../Pages/Home/FourthSection";
import FifthSection from "../../Pages/Home/FifthSection";
import SixthSection from "../../Pages/Home/SixthSection";
import DynamicBanner from "../../sections/Home/DynamicBanner";
import DynamicBenefits from "../../sections/Home/DynamicBenefits";
import DynamicFeatures from "../../sections/Home/DynamicFeatures";
import DynamicFooter from "../../sections/Home/DynamicFooter";
import DynamicNavbar from "../../sections/Home/DynamicNavbar";

const WebsiteBuilder: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isBuilderMode, sections, activeSection, isInlineEditMode } = useAppSelector(state => state.builder);
  const canUndo = useAppSelector(selectCanUndo);
  const canRedo = useAppSelector(selectCanRedo);
  const sectionsCanUndo = useAppSelector(selectSectionsCanUndo);
  const sectionsCanRedo = useAppSelector(selectSectionsCanRedo);
  const { sections: bannerSections, activeSection: activeBannerSection } = useAppSelector(state => state.banner);
  const bannerCanUndo = useAppSelector(selectBannerCanUndo);
  const bannerCanRedo = useAppSelector(selectBannerCanRedo);
  const { sections: adminSections, activeSection: activeAdminSection } = useAppSelector(state => state.admin);
  const { editorSection } = useAppSelector(state => state.editor);
  const { isActive: isNavbarActive } = useAppSelector(state => state.navbar);
  
  // Create a ref for the preview container
  const previewRef = useRef<HTMLDivElement>(null);
  
  // Sections-level undo/redo handlers for SectionList
  const handleSectionsUndo = () => {
    console.log('handleSectionsUndo called - sectionsCanUndo:', sectionsCanUndo);
    if (sectionsCanUndo) {
      console.log('Using sections undo');
      dispatch(undoSections());
    } else {
      console.log('No sections undo available');
    }
  };

  const handleSectionsRedo = () => {
    console.log('handleSectionsRedo called - sectionsCanRedo:', sectionsCanRedo);
    if (sectionsCanRedo) {
      console.log('Using sections redo');
      dispatch(redoSections());
    } else {
      console.log('No sections redo available');
    }
  };

  // Get pending banner sections for restoration
  const pendingBannerSections = useAppSelector(selectPendingBannerSections);

  // Restore banner sections after undo/redo
  useEffect(() => {
    if (pendingBannerSections && Array.isArray(pendingBannerSections) && pendingBannerSections.length > 0) {
      console.log('Restoring banner sections after undo/redo:', pendingBannerSections.length, 'sections');
      // Restore all banner sections at once
      dispatch(setAllBannerSections(pendingBannerSections));
    }
  }, [pendingBannerSections, dispatch]);

  // Wrapper functions for banner operations
  const handleAddBannerSection = () => {
    const allOrders = [
      ...sections.map(s => s.order || 0),
      ...bannerSections.map(s => s.order || 0),
      ...adminSections.map(s => s.order || 0)
    ];
    const maxOrder = Math.max(...allOrders, 0);
    
    console.log('Before adding banner - banner sections count:', bannerSections.length);
    
    // FIRST: Save current state to history BEFORE adding (this captures state with 0 banners)
    // This ensures undo will restore to this state (0 banners)
    dispatch(updateSectionsHistory({ bannerSections }));
    console.log('History saved with', bannerSections.length, 'banner sections');
    
    // THEN: Add the banner section
    dispatch(addBannerSection({ type: 'banner', maxOrder }));
    
    console.log('Banner section added');
  };

  const handleDeleteBannerSection = (id: string) => {
    console.log('Before deleting banner - banner sections count:', bannerSections.length);
    
    // Delete banner section - the useEffect will automatically track the change
    dispatch(deleteBannerSection(id));
    
    console.log('Banner section deleted');
  };

  const handleDeleteAdminSection = (id: string) => {
    console.log('Before deleting admin - admin sections count:', adminSections.length);
    
    // Delete admin section - the useEffect will automatically track the change
    dispatch(deleteAdminSection(id));
    
    console.log('Admin section deleted');
  };

  const handleSetActiveNavbar = () => {
    console.log('=== Navbar section clicked ===');
    // Scroll to the top of the preview container where navbar is located
    const previewContainer = document.getElementById('preview-container');
    if (previewContainer) {
      previewContainer.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };
  
  const handleSetActiveFooter = () => {
    console.log('=== Footer section clicked ===');
    dispatch(setActiveSection(null));
    dispatch(setActiveBannerSection(null));
    dispatch(setActiveAdminSection(null));
    // Open footer editor using setEditingOverlay
    console.log('About to call setEditingOverlay for footer');
    dispatch(setEditingOverlay({
      isOpen: true,
      sectionId: 'footer-1',
      sectionType: 'footer',
      contentType: 'footer'
    }));
    console.log('Called setEditingOverlay for footer');
  };
  
  // Note: We no longer auto-update history when banner sections change
  // History is now manually managed in handleAddBannerSection and handleDeleteBannerSection
  // This ensures proper undo/redo behavior

  // Add keyboard shortcuts for sections-level undo/redo
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if the event target is within the footer editor
      const target = event.target as HTMLElement;
      const footerEditorElement = document.getElementById('footer-editor');
      
      // If within footer editor, don't handle sections undo/redo
      if (footerEditorElement && footerEditorElement.contains(target)) {
        return;
      }
      
      // Check for Ctrl/Cmd + Z (undo) or Ctrl/Cmd + Y (redo)
      if ((event.ctrlKey || event.metaKey) && !event.shiftKey && !event.altKey) {
        if (event.key === 'z') {
          event.preventDefault();
          console.log('Keyboard shortcut: Sections Undo');
          handleSectionsUndo();
        } else if (event.key === 'y') {
          event.preventDefault();
          console.log('Keyboard shortcut: Sections Redo');
          handleSectionsRedo();
        }
      }
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyDown);
    
    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleSectionsUndo, handleSectionsRedo]);

  // Update editorSection when activeSection changes
  useEffect(() => {
    console.log('WebsiteBuilder useEffect:', { activeSection, activeBannerSection });
    
    if (activeSection) {
      const section = sections.find(s => s.id === activeSection);
      console.log('Found section:', section);
      
      if (section) {
        if (section.type === 'features') {
          // Don't auto-open features editor - only open on manual click
          console.log('Features section activated:', section.id);
        } else if (section.type === 'benefits') {
          // Don't auto-open benefits editor - only open on manual click
          console.log('Benefits section activated:', section.id);
        } 
      }
    } else if (activeBannerSection) {
      // Look for banner section in both builder and banner slices
      const section = bannerSections.find(s => s.id === activeBannerSection) || 
                   sections.find(s => s.id === activeBannerSection && s.type === 'banner');
      if (section) {
        dispatch(openEditor({ section }));
      }
    }
  }, [activeSection, activeBannerSection, sections, bannerSections, dispatch]);

  // Handle hash scroll on page load
  useEffect(() => {
    // Always scroll to top on page load
    window.scrollTo(0, 0);
    
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      console.log('Page load - Found hash:', hash);
      setTimeout(() => {
        const element = document.getElementById(hash);
        console.log('Page load - Found element:', element);
        if (element) {
          console.log('Page load - Scrolling to element:', element);
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 500);
    }
  }, []);

  // Debug active sections
  useEffect(() => {
    console.log('Active sections changed:', {
      activeSection,
      activeBannerSection,
      activeAdminSection
    });
  }, [activeSection, activeBannerSection, activeAdminSection]);
  
  // Memoize banner sections to prevent infinite re-renders
  const builderBannerSections = useMemo(() => 
    sections.filter(s => s.type === 'banner'), 
    [sections]
  );
  
  // Combine ALL sections (including fifth, hero, etc.) with banner sections - MUST MATCH SECTIONLIST
  const allSections = useMemo(() => {
    const sectionsMap = new Map();
    
    // Add all sections first (excluding banner sections to avoid duplicates)
    sections.forEach(section => {
      if (section.type !== 'banner') {
        sectionsMap.set(section.id, { ...section, source: 'builder' });
      }
    });
    
    // Add banner sections (only from banner slice)
    bannerSections.forEach(section => {
      sectionsMap.set(section.id, { ...section, source: 'banner' });
    });
    
    // Convert to array and sort by order
    return Array.from(sectionsMap.values()).sort((a, b) => a.order - b.order);
  }, [sections, bannerSections]);
  
  // Keep allBannerSections for backward compatibility but use allSections for drag/drop
  const allBannerSections = useMemo(() => 
    [...builderBannerSections, ...bannerSections], 
    [builderBannerSections, bannerSections]
  );
  
  const [dragItem, setDragItem] = useState<number>(-1);
  const [dragOverItem, setDragOverItem] = useState<number>(-1);
  const [imageUploadType, setImageUploadType] = useState<string>('');
  const [showEditorOnMobile, setShowEditorOnMobile] = useState(false);
  const [showSectionSelection, setShowSectionSelection] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const editingOverlay = useAppSelector(state => state.editor.editingOverlay);
  
  // Mobile navigation state
  const [mobileView, setMobileView] = useState<'list' | 'preview'>('list');
  


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
  console.log('=== handleDragEnd START ===');
  console.log('dragItem:', dragItem, 'dragOverItem:', dragOverItem);
  
  if (dragItem === dragOverItem || dragItem === -1 || dragOverItem === -1) {
    console.log('No drag operation needed');
    setDragItem(-1);
    setDragOverItem(-1);
    return;
  }

  const fromIndex = dragItem;
  const toIndex = dragOverItem;
  
  console.log('Attempting reorder from', fromIndex, 'to', toIndex);
  
  // Create the same sections logic as SectionList for drag and drop
  const sectionsMap = new Map();
  
  // Add all sections first (these include hero, fourth, features, etc. and also second-1, third-1)
  sections.forEach(section => {
    sectionsMap.set(section.id, { ...section, source: 'builder' });
  });
  
  // Add banner sections, but don't overwrite existing builder sections with the same ID
  bannerSections.forEach(section => {
    if (!sectionsMap.has(section.id)) {
      sectionsMap.set(section.id, { ...section, source: 'banner' });
    }
  });
  
  // Convert Map to array and sort by order (same as SectionList)
  const dragSections = Array.from(sectionsMap.values()).sort((a, b) => a.order - b.order);
  
  // Get the dragged and target sections from dragSections
  const draggedSection = dragSections[fromIndex];
  const targetSection = dragSections[toIndex];
  
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
    // Use the indices directly from dragSections since that's what's displayed
    // Create a filtered array of builder sections from dragSections to get correct indices
    const builderSectionsInDragSections = dragSections.filter(s => s.source === 'builder');
    const builderDragIndex = builderSectionsInDragSections.findIndex(s => s.id === draggedSection.id);
    const builderTargetIndex = builderSectionsInDragSections.findIndex(s => s.id === targetSection.id);
    
    console.log('builderDragIndex:', builderDragIndex, 'builderTargetIndex:', builderTargetIndex);
    console.log('Builder sections in dragSections:', builderSectionsInDragSections.map(s => s.id));
    
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
  if (showSectionSelection) {
    setShowSectionSelection(false);
  } else {
    setShowEditorOnMobile(false);
  }
  // Don't clear active sections - just hide mobile views;
};

// Robust scroll function that works for both mobile and desktop
const scrollToSection = (sectionId: string) => {
  console.log('=== scrollToSection START ===');
  console.log('Target section ID:', sectionId);
  
  // Try multiple times with increasing delays to ensure element is rendered
  const attempts = [100, 300, 500, 1000];
  let hasScrolled = false;
  
  const attemptScroll = (delay: number, index: number) => {
    setTimeout(() => {
      if (hasScrolled) return; // Stop if already scrolled successfully
      
      const previewContainer = document.getElementById('preview-container');
      const element = document.getElementById(sectionId);
      
      console.log(`scrollToSection Attempt ${index + 1} (${delay}ms):`, {
        sectionId,
        previewContainer: !!previewContainer,
        element: !!element,
        elementId: element?.id,
        elementTagName: element?.tagName,
        elementPosition: element ? element.getBoundingClientRect().top : 'N/A',
        previewContainerScrollTop: previewContainer?.scrollTop,
        previewContainerHeight: previewContainer?.scrollHeight
      });
      
      if (element) {
        // Element found, now scroll to it
        hasScrolled = true;
        
        // Add visual feedback first
        element.style.transition = 'background-color 0.3s ease';
        element.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
        setTimeout(() => {
          element.style.backgroundColor = '';
        }, 1000);
        
        if (previewContainer) {
          // Use element's offsetTop relative to the container for more accurate positioning
          const elementOffsetTop = element.offsetTop;
          const offset = 100; // Header offset
          const targetScrollTop = elementOffsetTop - offset;
          
          // Set scroll-margin-top on the element for better scroll positioning
          element.style.scrollMarginTop = `${offset}px`;
          
          console.log('Scrolling within preview container:', {
            elementId: element.id,
            elementOffsetTop: elementOffsetTop,
            currentScrollTop: previewContainer.scrollTop,
            targetScrollTop: targetScrollTop,
            containerScrollHeight: previewContainer.scrollHeight,
            containerClientHeight: previewContainer.clientHeight
          });
          
          // Ensure we don't scroll beyond bounds
          const maxScroll = previewContainer.scrollHeight - previewContainer.clientHeight;
          const finalScrollTop = Math.max(0, Math.min(targetScrollTop, maxScroll));
          
          // Try scrollTo first, if it doesn't work well, fallback to scrollIntoView
          previewContainer.scrollTo({
            top: finalScrollTop,
            behavior: 'smooth'
          });
          
          // Fallback: if scrollTo doesn't work properly, use scrollIntoView with the element
          setTimeout(() => {
            const newScrollTop = previewContainer.scrollTop;
            const tolerance = 50; // 50px tolerance
            const expectedScrollTop = finalScrollTop;
            
            if (Math.abs(newScrollTop - expectedScrollTop) > tolerance) {
              console.log('ScrollTo was not accurate, using scrollIntoView fallback');
              element.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start',
                inline: 'nearest'
              });
            }
          }, 500);
          
        } else {
          // Fallback to window scrollIntoView
          console.log('Fallback: Using window scrollIntoView');
          // Set scroll-margin-top for better positioning
          element.style.scrollMarginTop = '100px';
          element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start',
            inline: 'nearest'
          });
        }
        
        console.log('=== scrollToSection SUCCESS ===');
        return;
      }
      
      // List all available elements for debugging on last attempt
      if (index === attempts.length - 1) {
        const allElements = document.querySelectorAll('[id]');
        const sectionElements = Array.from(allElements).filter(el => 
          el.id.includes('hero') || 
          el.id.includes('second') || 
          el.id.includes('third') || 
          el.id.includes('fourth') || 
          el.id.includes('fifth') || 
          el.id.includes('sixth') ||
          el.id.includes('banner')
        );
        
        console.log('All section elements found:', sectionElements.map(el => ({
          id: el.id,
          tagName: el.tagName,
          isVisible: (el as HTMLElement).offsetParent !== null,
          position: el.getBoundingClientRect().top
        })));
        
        console.error('=== scrollToSection FAILED - Element not found ===');
        console.error('Looking for sectionId:', sectionId);
      }
    }, delay);
  };
  
  attempts.forEach((delay, index) => {
    attemptScroll(delay, index);
  });
};

useEffect(() => {
  if (activeBannerSection && activeSection) {
    dispatch(setActiveSection(null));
  }
}, [activeBannerSection]);

useEffect(() => {
  // Only handle editor opening, not scrolling
  if (!showEditorOnMobile) return;

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

  const renderHomepagePreview = () => {
    // Create the same sections logic as SectionList for consistency
    const sectionsMap = new Map();
    
    // Add all sections first (these include hero, fourth, features, etc. and also second-1, third-1)
    sections.forEach(section => {
      sectionsMap.set(section.id, { ...section, source: 'builder' });
    });
    
    // Add banner sections, but don't overwrite existing builder sections with the same ID
    bannerSections.forEach(section => {
      if (!sectionsMap.has(section.id)) {
        sectionsMap.set(section.id, { ...section, source: 'banner' });
      }
    });
    
    // Convert Map to array and sort by order (same as SectionList)
    const allSections = Array.from(sectionsMap.values()).sort((a, b) => a.order - b.order);
    
        
    return (
      <div ref={previewRef} className="flex-1 bg-white overflow-y-auto" id="preview-container">
        <div className="min-h-full flex flex-col lg:flex-col md:flex-col">
          {/* Dynamic Navbar */}
          <DynamicNavbar />
          {allSections.map((section) => {
            // Only render section if it's visible
            if (!section.visible) return null;
            
            switch (section.type) {
              case 'hero':
                return <Hero key={section.id} sectionId={section.id} onEdit={(sectionId, contentType, elementId) => {
                  console.log('Hero section clicked:', { sectionId, contentType, elementId });
                  // On mobile, switch to preview view first, then open editor
                  if (isMobile) {
                    setMobileView('preview');
                  }
                  dispatch(setEditingOverlay({
                    isOpen: true,
                    sectionId,
                    sectionType: 'hero',
                    contentType
                  }));
                }} />;
              case 'second':
                return <SecondSection key={section.id} sectionId={section.id} />;
              case 'third':
                return <ThirdSection key={section.id} sectionId={section.id} />;
              case 'fourth':
                return <FourthSection key={section.id} sectionId={section.id} onEdit={(sectionId, contentType, elementId) => {
                  console.log('Fourth section clicked:', { sectionId, contentType, elementId });
                  // On mobile, switch to preview view first, then open editor
                  if (isMobile) {
                    setMobileView('preview');
                  }
                  dispatch(setEditingOverlay({
                    isOpen: true,
                    sectionId,
                    sectionType: 'features',
                    contentType
                  }));
                }} />;
              case 'banner':
                return <DynamicBanner key={section.id} sectionId={section.id} onEdit={(sectionId, contentType, elementId) => {
                  // On mobile, switch to preview view first, then open editor
                  if (isMobile) {
                    setMobileView('preview');
                  }
                  dispatch(setEditingOverlay({
                    isOpen: true,
                    sectionId,
                    sectionType: 'banner',
                    contentType
                  }));
                }} />;
              case 'text':
              case 'image':
                return <Hero key={section.id} sectionId={section.id} onEdit={(sectionId, contentType, elementId) => {
                  console.log('Hero section clicked:', { sectionId, contentType, elementId });
                  // On mobile, switch to preview view first, then open editor
                  if (isMobile) {
                    setMobileView('preview');
                  }
                  dispatch(setEditingOverlay({
                    isOpen: true,
                    sectionType: 'hero',
                    sectionId,
                    contentType
                  }));
                }} />;
              case 'features':
                return <DynamicFeatures 
                  key={section.id} 
                  section={section} 
                  onEdit={(sectionId, contentType, elementId) => {
                    console.log('Features section clicked:', { sectionId, contentType, elementId });
                    // On mobile, switch to preview view first, then open editor
                    if (isMobile) {
                      setMobileView('preview');
                    }
                    dispatch(setEditingOverlay({
                      isOpen: true,
                      sectionType: 'features',
                      sectionId,
                      contentType
                    }));
                  }} 
                />;
              case 'fifth':
                return <FifthSection key={section.id} sectionId={section.id} onEdit={(sectionId, contentType) => {
                  console.log('Fifth section clicked:', { sectionId, contentType });
                  // On mobile, switch to preview view first, then open editor
                  if (isMobile) {
                    dispatch(toggleBuilderMode());
                  }
                  dispatch(setEditingOverlay({
                    isOpen: true,
                    sectionType: 'admin',
                    sectionId,
                    contentType
                  }));
                }} />;
              case 'sixth':
                return <SixthSection key={section.id} sectionId={section.id} onEdit={(sectionId, contentType, elementId) => {
                  console.log('Sixth section clicked:', { sectionId, contentType, elementId });
                  // On mobile, switch to preview view first, then open editor
                  if (isMobile) {
                    setMobileView('preview');
                  }
                  dispatch(setEditingOverlay({
                    isOpen: true,
                    sectionType: 'admin',
                    sectionId,
                    contentType
                  }));
                }} />;
              case 'benefits':
                return <DynamicBenefits key={section.id} sectionId={section.id} onEdit={(sectionId, contentType, elementId) => {
                  // On mobile, switch to preview view first, then open editor
                  if (isMobile) {
                    setMobileView('preview');
                  }
                  dispatch(setEditingOverlay({
                    isOpen: true,
                    sectionType: 'benefits',
                    sectionId,
                    contentType
                  }));
                }} />;
              default:
                return null;
            }
          })}
          
          {/* Add New Section Options */}
          <div className="border-t-2 border-dashed border-gray-300 p-8 bg-gray-50" data-add-section-options>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Add New Section</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-5xl mx-auto">
              <button
                onClick={() => {
                  dispatch(addSectionAndSetActive({ type: 'hero', name: 'Hero Section' }));
                }}
                className="p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-center"
              >
                <div className="font-medium text-gray-900">Text and Image</div>
                <div className="text-sm text-gray-500">Hero section</div>
              </button>
              
              <button
                onClick={handleAddBannerSection}
                className="p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-center"
              >
                <div className="font-medium text-gray-900">Banner</div>
                <div className="text-sm text-gray-500">Promotional</div>
              </button>
              
              <button
                onClick={() => {
                  dispatch(addSectionAndSetActive({ type: 'features', name: 'Features Section' }));
                }}
                className="p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-center"
              >
                <div className="font-medium text-gray-900">Features</div>
                <div className="text-sm text-gray-500">Showcase</div>
              </button>
              
              <button
                onClick={() => {
                  dispatch(addSectionAndSetActive({ type: 'fifth', name: 'Admin Panel Section' }));
                }}
                className="p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-center"
              >
                <div className="font-medium text-gray-900">Admin Panel</div>
                <div className="text-sm text-gray-500">Dashboard</div>
              </button>
              
              <button
                onClick={() => {
                  dispatch(addSectionAndSetActive({ type: 'benefits', name: 'Benefits Section' }));
                }}
                className="p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-center"
              >
                <div className="font-medium text-gray-900">Benefits</div>
                <div className="text-sm text-gray-500">Highlight advantages</div>
              </button>
            </div>
          </div>
          
          {/* Footer Section */}
          <DynamicFooter 
            sectionId="footer-1" 
            onEdit={(sectionId, contentType, elementId) => {
              console.log('Footer section clicked:', { sectionId, contentType, elementId });
              // On mobile, switch to preview view first, then open editor
              if (isMobile) {
                setMobileView('preview');
              }
              dispatch(setEditingOverlay({
                isOpen: true,
                sectionId,
                sectionType: 'footer',
                contentType: 'footer'
              }));
            }} 
          />
        </div>
      </div>
    );
  };

  const renderEditingOverlay = () => {
    console.log('=== renderEditingOverlay called ===');
    console.log('editingOverlay:', editingOverlay);
    
    if (!editingOverlay.isOpen) {
      console.log('editingOverlay.isOpen is false, returning null');
      return null;
    }

    console.log('renderEditingOverlay - sectionType:', editingOverlay.sectionType, 'sectionId:', editingOverlay.sectionId);

    return (
      <div className="fixed top-0 right-0 bottom-0 w-96 bg-white shadow-2xl z-50 border-l overflow-y-auto hide-scrollbar">
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Edit {editingOverlay.sectionType} - {editingOverlay.contentType}
          </h3>
          <button
            onClick={() => dispatch(setEditingOverlay({
              isOpen: false,
              sectionId: null,
              sectionType: null,
              contentType: null
            }))}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 h-full overflow-hidden">
          {editingOverlay.sectionType === 'navbar' ? <NavbarEditor /> :
           editingOverlay.sectionType === 'banner' ? <BannerEditor /> : 
           editingOverlay.sectionType === 'hero' ? <HeroEditor /> : 
           editingOverlay.sectionType === 'features' ? <FeaturesEditor /> : 
           editingOverlay.sectionType === 'benefits' ? <BenefitsEditor /> :
           editingOverlay.sectionType === 'footer' ? <FooterEditor /> :
           editingOverlay.sectionType === 'admin' && editingOverlay.sectionId?.startsWith('sixth') ? <BenefitsEditor /> : 
           editingOverlay.sectionType === 'admin' ? <AdminEditor /> : null}
        </div>
        
        {/* Action Buttons */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 mt-auto">
          <div className="flex gap-3">
            <button
              onClick={() => dispatch(setEditingOverlay({
                isOpen: false,
                sectionId: null,
                sectionType: null,
                contentType: null
              }))}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                // Save logic here
                dispatch(setEditingOverlay({
                  isOpen: false,
                  sectionId: null,
                  sectionType: null,
                  contentType: null
                }));
              }}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    console.log('=== renderContent START ===', { editorSection, activeSection, activeBannerSection, isMobile });
    
    // Mobile View (max-width: 768px)
    if (isMobile) {
      // Section List View
      if (mobileView === 'list') {
        return (
          <div className="w-full h-full flex flex-col bg-gray-50">
            <div className="bg-white border-b p-4 flex items-center justify-between -mt-1" >
              <h2 className="text-lg font-bold text-gray-900">Sections</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSectionsUndo}
                  disabled={!sectionsCanUndo}
                  className="p-2 rounded-lg border border-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-300"
                  title="Undo"
                >
                  <Undo size={16} className="text-gray-600" />
                </button>
                <button
                  onClick={handleSectionsRedo}
                  disabled={!sectionsCanRedo}
                  className="p-2 rounded-lg border border-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-300"
                  title="Redo"
                >
                  <Redo size={16} className="text-gray-600" />
                </button>
                <button
                  onClick={() => dispatch(toggleBuilderMode())}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-700 cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
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
                  console.log('*** onSetActive called with id:', id);
                  dispatch(setActiveSection(id));
                  dispatch(setActiveBannerSection(null));
                  dispatch(setActiveAdminSection(null));
                  // Only switch to preview view on mobile
                  if (isMobile) {
                    setMobileView('preview');
                  }
                  // Manual scroll to ensure it works
                  setTimeout(() => {
                    scrollToSection(id);
                  }, 200);
                }}
                onSetActiveBanner={(id) => {
                  console.log('*** onSetActiveBanner called with id:', id);
                  dispatch(setActiveBannerSection(id));
                  dispatch(setActiveSection(null));
                  dispatch(setActiveAdminSection(null));
                  // Only switch to preview view on mobile
                  if (isMobile) {
                    setMobileView('preview');
                  }
                  // Manual scroll to ensure it works
                  setTimeout(() => {
                    scrollToSection(id);
                  }, 200);
                }}
                onSetActiveAdmin={(id) => {
                  console.log('*** onSetActiveAdmin called with id:', id);
                  dispatch(setActiveAdminSection(id));
                  dispatch(setActiveSection(null));
                  dispatch(setActiveBannerSection(null));
                  // Only switch to preview view on mobile
                  if (isMobile) {
                    setMobileView('preview');
                  }
                  // Manual scroll to ensure it works
                  setTimeout(() => {
                    scrollToSection(id);
                  }, 200);
                }}
                onSetActiveNavbar={handleSetActiveNavbar}
                onSetActiveFooter={handleSetActiveFooter}
                onDelete={(id) => dispatch(deleteSection(id))}
                onDeleteBanner={handleDeleteBannerSection}
                onDeleteAdmin={handleDeleteAdminSection}
                onUndo={handleSectionsUndo}
                onRedo={handleSectionsRedo}
                canUndo={sectionsCanUndo}
                canRedo={sectionsCanRedo}
                dragOverItem={dragOverItem}
                onSwitchToPreview={() => {
                  console.log('Switching to preview view on mobile');
                  setMobileView('preview');
                }}
              />
            </div>
          </div>
        );
      }
      
      // Preview View
      return (
        <div className="w-full h-full flex flex-col bg-gray-50">
          <div className="bg-white border-b p-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Preview</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setMobileView('list')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-700 cursor-pointer"
                title="Back to Section List"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7 7" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5l-7 7 7 7" />
                </svg>
              </button>
              <button
                onClick={() => dispatch(toggleBuilderMode())}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-700 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
          </div>
          {renderHomepagePreview()}
        </div>
      );
    }
    
    // Desktop/Tablet View (min-width: 768px)
    return (
      <>
        {/* Section List Panel - Reduced width on md screens */}
        <div className="w-full md:w-70  xl:w-96 bg-white  flex flex-col">
          <div className="flex items-center justify-between p-4 xl:px-6  xl:py-[13px] border-b border-r ">
            <h2 className="text-xl font-bold text-gray-900">Components</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSectionsUndo}
                disabled={!sectionsCanUndo}
                className="p-2 rounded-lg border border-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-300"
                title="Undo"
              >
                <Undo size={16} className="text-gray-600" />
              </button>
              <button
                onClick={handleSectionsRedo}
                disabled={!sectionsCanRedo}
                className="p-2 rounded-lg border border-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-300"
                title="Redo"
              >
                <Redo size={16} className="text-gray-600" />
              </button>
              <button
                onClick={() => dispatch(toggleBuilderMode())}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-700 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 xl:p-6 hide-scrollbar border-r border-gray-300">
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
                console.log('*** onSetActive called with id:', id);
                dispatch(setActiveSection(id));
                dispatch(setActiveBannerSection(null));
                dispatch(setActiveAdminSection(null));
                console.log('activeSection set to:', id, 'activeBannerSection cleared');
                // Manual scroll to ensure it works
                setTimeout(() => {
                  scrollToSection(id);
                }, 200);
              }}
              onSetActiveBanner={(id) => {
                console.log('=== onSetActiveBanner called ===', id);
                dispatch(setActiveSection(null)); // Clear hero
                dispatch(setActiveAdminSection(null)); // Clear admin
                dispatch(setActiveBannerSection(id));
                console.log('activeBannerSection set to:', id, 'activeSection cleared to null');
                // Manual scroll to ensure it works
                setTimeout(() => {
                  scrollToSection(id);
                }, 200);
              }}
              onSetActiveAdmin={(id) => {
                console.log('=== onSetActiveAdmin called ===', id);
                dispatch(setActiveSection(null)); // Clear hero
                dispatch(setActiveBannerSection(null)); // Clear banner
                dispatch(setActiveAdminSection(id));
                console.log('activeAdminSection set to:', id, 'other sections cleared');
                // Manual scroll to ensure it works
                setTimeout(() => {
                  scrollToSection(id);
                }, 200);
              }}
              onSetActiveNavbar={handleSetActiveNavbar}
              onSetActiveFooter={handleSetActiveFooter}
              onDelete={(id) => dispatch(deleteSection(id))}
              onDeleteBanner={handleDeleteBannerSection}
              onDeleteAdmin={handleDeleteAdminSection}
              onUndo={handleSectionsUndo}
              onRedo={handleSectionsRedo}
              canUndo={sectionsCanUndo}
              canRedo={sectionsCanRedo}
              dragOverItem={dragOverItem}
            />
          </div>
        </div>

        {renderHomepagePreview()}
      </>
    );
  };

  return (
    <div className="fixed top-[70px] left-0 right-0 bottom-0 z-50 bg-black/50 flex">
      {renderContent()}
      {renderEditingOverlay()}
      {/* Backdrop to close overlay */}
      {editingOverlay.isOpen && (
        <div 
          className="absolute inset-0 bg-black/20 z-40"
          onClick={() => dispatch(setEditingOverlay({
            isOpen: false,
            sectionId: null,
            sectionType: null,
            contentType: null
          }))}
        />
      )}
    </div>
  );
};

export default WebsiteBuilder;