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
import TestimonialsEditor from "./WebsiteBuilder/TestimonialsEditor";
import FaqEditor from "./WebsiteBuilder/FaqEditor";
import SubscriptionPlanEditor from "./WebsiteBuilder/SubscriptionPlanEditor";
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
import DynamicTestimonials from "../../sections/Home/DynamicTestimonials";
import DynamicFaq from "../../sections/Home/DynamicFaq";
import DynamicSubscriptionPlan from "../../sections/Home/DynamicSubscriptionPlan";
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
  
  // Ref to track if banner section selection came from sidebar (not preview click)
  const bannerSelectionFromSidebar = useRef(false);
  
  // Ref to track if regular section selection came from sidebar (not preview click)
  const sectionSelectionFromSidebar = useRef(false);
  
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

  // Track if this is the initial render to prevent auto-opening editors
  const isInitialRender = useRef(true);
  
  useEffect(() => {
    isInitialRender.current = false;
  }, []);

  // Update editorSection when activeSection changes
  useEffect(() => {
    // Skip on initial render to prevent auto-opening editors
    if (isInitialRender.current) {
      return;
    }
    
    // Only update if editingOverlay is not already set
    // This prevents overriding when user clicks on a section
    if (editingOverlay?.isOpen && editingOverlay?.sectionId) {
      return;
    }
    
    if (activeSection) {
      // Skip opening editor if section was selected from sidebar (not preview click)
      if (sectionSelectionFromSidebar.current) {
        sectionSelectionFromSidebar.current = false; // Reset flag
        return;
      }
      
      const section = sections.find(s => s.id === activeSection);
      
      if (section) {
        // Only open editor for specific existing sections
        if ((section.id === 'fourth-1' && section.type === 'fourth') || section.type === 'features') {
          dispatch(setEditingOverlay({
            isOpen: true,
            sectionId: section.id,
            sectionType: 'features',
            contentType: 'text'
          }));
        } else if (section.id === 'faq-1' && section.type === 'faq') {
          dispatch(setEditingOverlay({
            isOpen: true,
            sectionId: section.id,
            sectionType: 'faq',
            contentType: 'text'
          }));
        } else if (section.type === 'hero') {
          dispatch(setEditingOverlay({
            isOpen: true,
            sectionId: section.id,
            sectionType: 'hero',
            contentType: 'text'
          }));
        } else if (section.type === 'fifth') {
          dispatch(setEditingOverlay({
            isOpen: true,
            sectionId: section.id,
            sectionType: 'admin',
            contentType: 'admin'
          }));
        } else if (section.type === 'sixth') {
          dispatch(setEditingOverlay({
            isOpen: true,
            sectionId: section.id,
            sectionType: 'benefits',
            contentType: 'text'
          }));
        } 
        else if (section.type === 'testimonials') {
          dispatch(setEditingOverlay({
            isOpen: true,
            sectionId: section.id,
            sectionType: 'testimonials',
            contentType: 'text'
          }));
        }
      }
    } else if (activeBannerSection) {
      // Skip opening editor if section was selected from sidebar (not preview click)
      if (bannerSelectionFromSidebar.current) {
        bannerSelectionFromSidebar.current = false; // Reset flag
        return;
      }
      // Open BannerEditor for all banner sections (second-1, third-1, and new banner sections)
      const section = bannerSections.find(s => s.id === activeBannerSection) ||
                   sections.find(s => s.id === activeBannerSection);
      if (section) {
        dispatch(openEditor({ section }));
        // Use the actual section type instead of always 'banner'
        // This ensures second-1 gets type 'second', third-1 gets type 'third', etc.
        const sectionType = section.type || 'banner';
        dispatch(setEditingOverlay({
          isOpen: true,
          sectionId: section.id,
          sectionType: sectionType,
          contentType: 'text'
        }));
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
  
  // Drag and drop state for preview
  const [isDragOver, setIsDragOver] = useState(false);
  const [draggedSectionType, setDraggedSectionType] = useState<string | null>(null);
  


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
    
    // Check if dragged section is live streaming or pk battle that should be converted to banner
    const isLiveStreamingSection = draggedSection.id === 'second-1' || draggedSection.name?.includes('Live Streaming');
    const isPKBattleSection = draggedSection.id === 'third-1' || draggedSection.name?.includes('PK Battle');
    
    if (isLiveStreamingSection || isPKBattleSection) {
      console.log('Converting live streaming or pk battle section to banner section');
      
      // Add a new banner section with appropriate content
      const allOrders = [
        ...sections.map(s => s.order || 0),
        ...bannerSections.map(s => s.order || 0),
        ...adminSections.map(s => s.order || 0)
      ];
      const maxOrder = Math.max(...allOrders, 0);
      
      // Save current state to history before adding
      dispatch(updateSectionsHistory({ bannerSections }));
      
      // Add the appropriate banner section type
      if (isLiveStreamingSection) {
        dispatch(addBannerSection({ type: 'live-streaming', maxOrder }));
      } else if (isPKBattleSection) {
        dispatch(addBannerSection({ type: 'pk-battle', maxOrder }));
      }
      
      console.log(`${isLiveStreamingSection ? 'Live Streaming' : 'PK Battle'} section converted to banner`);
    } else {
      // Regular builder section reordering
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
          el.id.includes('banner') ||
          el.id.includes('testimonials')
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
    
    console.log('Rendering sections in preview:', allSections.map(s => ({ id: s.id, name: s.name, type: s.type, source: s.source })));
    
    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(true);
    };
    
    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
    };
    
    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      
      const sectionData = e.dataTransfer.getData('text/plain');
      if (sectionData) {
        try {
          const section = JSON.parse(sectionData);
          console.log('Dropped section:', section);
          console.log('Section ID:', section.id, 'Section name:', section.name, 'Section type:', section.type);
          
          // Check if it's a banner section (Live Streaming or PK Battle should both create new banner)
          const isBannerTypeSection = section.id === 'second-1' || section.id === 'third-1' || 
                                     section.name?.includes('Live Streaming') || 
                                     section.name?.includes('PK Battle') ||
                                     section.type === 'banner';
          
          console.log('Is Banner Section:', isBannerTypeSection, 'Section:', section.id, section.name);
          
          // Calculate the max order for new section
          const allOrders = [
            ...sections.map(s => s.order || 0),
            ...bannerSections.map(s => s.order || 0),
            ...adminSections.map(s => s.order || 0)
          ];
          const maxOrder = Math.max(...allOrders, 0);
          
          // Map section types to their add section equivalents (like the tab buttons)
          let sectionTypeToAdd: string;
          let sectionName: string;
          
          if (isBannerTypeSection) {
            console.log(`🎯 Detected Banner section - creating NEW banner section in builderSlice`);
            console.log(`   Original: ${section.id} (${section.name})`);
            
            // Determine if it's Live Streaming or PK Battle based on name
            const isLiveStreaming = section.name?.includes('Live Streaming') || section.id === 'second-1';
            const isPKBattle = section.name?.includes('PK Battle') || section.id === 'third-1';
            const bannerType = isLiveStreaming ? 'live-streaming' : isPKBattle ? 'pk-battle' : 'banner';
            const bannerName = isLiveStreaming ? 'Live Streaming Section' : isPKBattle ? 'PK Battle Section' : 'Banner Section';
            
            // Add new banner section to builderSlice (not bannerSlice) for consistency
            dispatch(addSectionAndSetActive({ 
              type: bannerType as any, 
              name: bannerName
            }));
            
            console.log(`✅ New banner section dispatched to builderSlice with type: ${bannerType}`);
          } else {
            // Map other section types
            switch (section.type) {
              case 'hero':
                sectionTypeToAdd = 'hero';
                sectionName = 'Text and Image';
                break;
              case 'fifth':
                sectionTypeToAdd = 'fifth';
                sectionName = 'Admin Panel';
                break;
              case 'sixth':
              case 'benefits':
                sectionTypeToAdd = 'benefits';
                sectionName = 'Benefits';
                break;
              case 'testimonials':
                sectionTypeToAdd = 'testimonials';
                sectionName = 'Testimonials';
                break;
              case 'faq':
                sectionTypeToAdd = 'faq';
                sectionName = 'FAQ';
                break;
              case 'features':
              case 'fourth':
                sectionTypeToAdd = 'features';
                sectionName = 'Features';
                console.log('📋 Features section will use getDefaultContent - checking backgroundColor...');
                break;
              default:
                sectionTypeToAdd = section.type;
                sectionName = section.name || `${section.type} Section`;
            }
            
            console.log(`🎯 Creating NEW ${sectionName} section (${sectionTypeToAdd}) from drag`);
            console.log(`   Original: ${section.id} (${section.type})`);
            console.log(`   Will create: NEW ${sectionTypeToAdd} with fresh demo content via getDefaultContent()`);
            
            // Add new section WITHOUT passing content - forces use of getDefaultContent()
            dispatch(addSectionAndSetActive({ 
              type: sectionTypeToAdd as any, 
              name: sectionName
              // Intentionally NOT passing content - this ensures getDefaultContent() is called
            }));
            
            console.log(`✅ New ${sectionName} section dispatched`);
          }
        } catch (error) {
          console.error('Error parsing dropped section data:', error);
        }
      }
      
      setDraggedSectionType(null);
    };
    
    return (
      <div ref={previewRef} className="flex-1 bg-white overflow-y-auto" id="preview-container">
        <div className="min-h-full flex flex-col lg:flex-col md:flex-col">
          {/* Dynamic Navbar */}
          <DynamicNavbar />
          
          {/* Render existing sections */}
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
              case 'banner':
                return <DynamicBanner key={section.id} sectionId={section.id} onEdit={(sectionId, contentType: 'text' | 'style' | 'image', elementId) => {
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
              case 'fourth':
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
              case 'testimonials':
                return <DynamicTestimonials key={section.id} section={section} onEdit={(sectionId, contentType, elementId) => {
                  // On mobile, switch to preview view first, then open editor
                  if (isMobile) {
                    setMobileView('preview');
                  }
                  dispatch(setEditingOverlay({
                    isOpen: true,
                    sectionType: 'testimonials',
                    sectionId,
                    contentType
                  }));
                }} />;
              case 'faq':
                return <DynamicFaq key={section.id} section={section} onEdit={(sectionId, contentType, elementId) => {
                  // On mobile, switch to preview view first, then open editor
                  if (isMobile) {
                    setMobileView('preview');
                  }
                  dispatch(setEditingOverlay({
                    isOpen: true,
                    sectionType: 'faq',
                    sectionId,
                    contentType
                  }));
                }} />;
              case 'subscription-plan':
                return <DynamicSubscriptionPlan key={section.id} section={section} onEdit={(sectionId, contentType, elementId) => {
                  // On mobile, switch to preview view first, then open editor
                  if (isMobile) {
                    setMobileView('preview');
                  }
                  dispatch(setEditingOverlay({
                    isOpen: true,
                    sectionType: 'subscription-plan',
                    sectionId,
                    contentType
                  }));
                }} />;
              default:
                return null;
            }
          })}
          
          {/* Add New Section Drop Zone - Drag from section list to add */}
          <div 
            className={`border-t-2 border-dashed p-12 bg-gray-50 transition-colors min-h-50 flex items-center justify-center ${
              isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`} 
            data-add-section-options
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {isDragOver ? 'Drop section here' : 'Add New Section'}
              </h3>
              <p className="text-gray-500">
                {isDragOver ? 'Release to add this section' : 'Drag a section from the left panel(Section List) and drop it here'}
              </p>
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
          {(() => {
            console.log('=== Editor Conditional Rendering ===');
            console.log('editingOverlay:', editingOverlay);
            console.log('sectionType:', editingOverlay.sectionType);
            console.log('sectionId:', editingOverlay.sectionId);
            
            if (editingOverlay.sectionType === 'navbar') {
              console.log('Rendering NavbarEditor');
              return <NavbarEditor />;
            } else if (editingOverlay.sectionType === 'banner' || editingOverlay.sectionType === 'second' || editingOverlay.sectionType === 'third') {
              console.log('Rendering BannerEditor for type:', editingOverlay.sectionType);
              return <BannerEditor />;
            } else if (editingOverlay.sectionType === 'hero') {
              console.log('Rendering HeroEditor');
              return <HeroEditor />;
            } else if (editingOverlay.sectionType === 'features') {
              console.log('Rendering FeaturesEditor');
              return <FeaturesEditor />;
            } else if (editingOverlay.sectionType === 'benefits') {
              console.log('Rendering BenefitsEditor');
              return <BenefitsEditor />;
            } else if (editingOverlay.sectionType === 'footer') {
              console.log('Rendering FooterEditor');
              return <FooterEditor />;
            } else if (editingOverlay.sectionType === 'testimonials') {
              console.log('Rendering TestimonialsEditor');
              return <TestimonialsEditor />;
            } else if (editingOverlay.sectionType === 'faq') {
              console.log('Rendering FaqEditor');
              return <FaqEditor />;
            } else if (editingOverlay.sectionType === 'subscription-plan') {
              console.log('Rendering SubscriptionPlanEditor');
              return <SubscriptionPlanEditor />;
            } else if (editingOverlay.sectionType === 'admin' && editingOverlay.sectionId?.startsWith('sixth')) {
              console.log('Rendering BenefitsEditor (for sixth section)');
              return <BenefitsEditor />;
            } else if (editingOverlay.sectionType === 'admin') {
              console.log('Rendering AdminEditor');
              return <AdminEditor />;
            } else {
              console.log('No editor matched, returning null');
              return null;
            }
          })()}
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
                onScrollToSection={scrollToSection}
                onSetActive={(id) => {
                  console.log('*** onSetActive called with id:', id);
                  // Mark that selection came from sidebar (not preview click)
                  sectionSelectionFromSidebar.current = true;
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
                  // Mark that selection came from sidebar (not preview click)
                  bannerSelectionFromSidebar.current = true;
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
              onScrollToSection={scrollToSection}
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
    <div className="fixed top-0 left-0 right-0 bottom-0 z-50 bg-black/50 flex">
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