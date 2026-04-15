"use client";

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from "../../../hooks/reduxHooks";
import { 
  updateNavbarContent, 
  updateNavbarLogo, 
  updateNavbarColors, 
  updateNavbarLink, 
  addNavbarLink, 
  removeNavbarLink, 
  reorderNavbarLinks,
  updateLiveDemoButton,
  setActiveNavbar,
  undoNavbar,
  redoNavbar,
  selectNavbarCanUndo,
  selectNavbarCanRedo
} from "../../../store/navbarSlice";
import { closeEditor } from "../../../store/editorSlice";
import { useAppSelector as useBuilderSelector } from "../../../hooks/reduxHooks";
import { Trash2, Upload, X, Plus, GripVertical, Undo, Redo, ChevronDown, Eye, EyeOff, ChevronRight } from "lucide-react";
import { NavbarLink } from "../../../store/navbarSlice";
import { openImageModal } from "../../../store/modalSlice";
import ImageModal from "./ImageModal";
import {
  Page,
  PageLink,
  togglePageVisibility,
  deletePage,
  setPageDropdownMode,
  openAddPageModal,
  toggleSectionVisibility,
  reorderPageSections,
  reorderPageLinks,
  addPageLink,
  removePageLink,
  updatePageLink,
  togglePageLinkVisibility,
} from "../../../store/pagesSlice";

// Custom Select Component
const CustomSelect = ({ value, onChange, options, label }: { value: string; onChange: (val: string) => void; options: any[]; label?: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const selectedOption = options.find(opt => opt.id === value);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  return (
    <div className="relative" ref={dropdownRef}>
      {label && <label className="block text-xs font-medium text-black mb-1">{label}</label>}
 <button
  type="button"
  onClick={() => setIsOpen(!isOpen)}
  className="w-full p-2 border border-gray-300 rounded text-sm text-left text-black bg-white flex justify-between items-center gap-2 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-blue-400 hover:border-blue-400 transition-colors"
>
  <span className={selectedOption ? 'text-black truncate flex-1' : 'text-gray-400 truncate flex-1'}>
    {selectedOption?.name || 'Select a section'}
  </span>
  <ChevronDown size={16} className={`text-gray-500 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
</button>
      
      {isOpen && (
  <div className="absolute z-[70] w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto hide-scrollbar">
    <div className="py-1">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => {
            onChange(option.id);
            setIsOpen(false);
          }}
          className={`w-full px-1.5 py-2 text-sm text-left transition-colors cursor-pointer ${
            value === option.id 
              ? 'bg-blue-50 text-blue-600 font-medium' 
              : 'text-gray-700 hover:bg-blue-50'
          }`}
        >
          {option.name}
        </button>
      ))}
    </div>
  </div>
)}
    </div>
  );
};

// Pages & Links Accordion Component
const PagesLinksAccordion: React.FC = () => {
  const dispatch = useAppDispatch();
  const { pages } = useAppSelector((state) => state.pages);
  const [expandedPage, setExpandedPage] = useState<string | null>('home');

  const toggleExpand = (pageId: string) => {
    setExpandedPage(expandedPage === pageId ? null : pageId);
  };

  const handleToggleVisibility = (pageId: string) => {
    dispatch(togglePageVisibility(pageId));
  };

  const handleToggleDropdown = (pageId: string) => {
    const page = pages.find(p => p.id === pageId);
    if (page) {
      dispatch(setPageDropdownMode({ id: pageId, hasDropdown: !page.hasDropdown }));
    }
  };

  const handleDeletePage = (pageId: string) => {
    if (window.confirm('Are you sure you want to delete this page?')) {
      dispatch(deletePage(pageId));
    }
  };

  // State for expanded link accordion
  const [expandedLink, setExpandedLink] = useState<string | null>(null);

  const toggleLinkExpand = (linkId: string) => {
    setExpandedLink(expandedLink === linkId ? null : linkId);
  };

  // Drag and drop state for links
  const [draggingLinkId, setDraggingLinkId] = useState<string | null>(null);
  const [dragOverLinkId, setDragOverLinkId] = useState<string | null>(null);

  const handleDragStart = (linkId: string) => {
    setDraggingLinkId(linkId);
  };

  const handleDragOver = (e: React.DragEvent, linkId: string) => {
    e.preventDefault();
    if (linkId !== draggingLinkId) {
      setDragOverLinkId(linkId);
    }
  };

  const handleDrop = (e: React.DragEvent, pageId: string, targetLinkId: string) => {
    e.preventDefault();
    if (draggingLinkId && draggingLinkId !== targetLinkId) {
      // Reorder links in the page
      dispatch(reorderPageLinks({
        pageId,
        fromLinkId: draggingLinkId,
        toLinkId: targetLinkId
      }));
    }
    setDraggingLinkId(null);
    setDragOverLinkId(null);
  };

  const handleDragEnd = () => {
    setDraggingLinkId(null);
    setDragOverLinkId(null);
  };

  // Page-specific link handlers
  const handleAddLink = (pageId: string) => {
    const newLink = {
      id: `link-${Date.now()}`,
      label: 'New Link',
      sectionId: '',
      visible: true,
    };
    dispatch(addPageLink({ pageId, link: newLink }));
  };

  const handleRemoveLink = (pageId: string, linkId: string) => {
    dispatch(removePageLink({ pageId, linkId }));
  };

  const handleUpdateLink = (pageId: string, linkId: string, field: string, value: string | boolean) => {
    dispatch(updatePageLink({ pageId, linkId, [field]: value }));
  };

  const handleToggleLinkVisibility = (pageId: string, linkId: string) => {
    dispatch(togglePageLinkVisibility({ pageId, linkId }));
  };

  const { sections: builderSections } = useAppSelector(state => state.builder);
  const { sections: bannerSections } = useAppSelector(state => state.banner);

  // Get all sections for reference
  const allSections = useMemo(() => {
    const sectionsMap = new Map();
    builderSections.forEach((section: { id: string; name: string; type: string }) => {
      sectionsMap.set(section.id, { ...section, source: 'builder' });
    });
    bannerSections.forEach((section: { id: string; name: string; type: string }) => {
      if (!sectionsMap.has(section.id)) {
        sectionsMap.set(section.id, { ...section, source: 'banner' });
      }
    });
    return Array.from(sectionsMap.values()).map((s: { id: string; name: string; type: string }) => ({
      id: s.id,
      name: s.name || s.type,
      type: s.type,
    }));
  }, [builderSections, bannerSections]);

  // Helper function to get sections for a specific page
  const getPageSections = (pageId: string) => {
    const page = pages.find(p => p.id === pageId);
    if (!page) return [];

    // For home page, show all sections
    if (pageId === 'home') {
      return allSections;
    }

    // For other pages, filter to show only sections belonging to this page
    const pageSectionIds = page.sections.map((s: {id: string}) => s.id);
    return allSections.filter((s: {id: string}) => pageSectionIds.includes(s.id));
  };

  return (
    <div className="space-y-4">
      {/* Add Page Button */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-black">Pages</h4>
        <button
          onClick={() => dispatch(openAddPageModal())}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          <Plus size={14} />
          Add Page
        </button>
      </div>

      {/* Pages Accordion */}
      <div className="space-y-2">
        {pages.map((page) => (
          <div key={page.id} className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Page Header */}
            <div
              className="flex items-center gap-3 p-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => toggleExpand(page.id)}
            >
              {expandedPage === page.id ? (
                <ChevronDown size={18} className="text-gray-600 shrink-0" />
              ) : (
                <ChevronRight size={18} className="text-gray-600 shrink-0" />
              )}

              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-black truncate">{page.title}</div>
                <div className="text-xs text-gray-500 truncate">{page.slug}</div>
              </div>

              {/* Visibility Toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleVisibility(page.id);
                }}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  page.visible ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'
                }`}
              >
                {page.visible ? <Eye size={16} className='cursor-pointer' /> : <EyeOff size={16} className='cursor-pointer' />}
              </button>

              {/* Delete Button */}
              {page.id !== 'home' && page.id !== 'contact' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeletePage(page.id);
                  }}
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>

            {/* Expanded Content */}
            {expandedPage === page.id && (
              <div className="p-3 border-t border-gray-200 space-y-4">
                {/* Dropdown Toggle */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-black">Show dropdown with sections</span>
                  <button
                    onClick={() => handleToggleDropdown(page.id)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      page.hasDropdown ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                        page.hasDropdown ? 'translate-x-5' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Links Accordion (if dropdown enabled) */}
                {page.hasDropdown && (
                  <div className="space-y-2">
                    <h5 className="text-xs font-medium text-gray-500">Dropdown Links (Drag to reorder)</h5>
                    {(!page.links || page.links.length === 0) ? (
                      <p className="text-xs text-gray-400 italic">No links in this page yet.</p>
                    ) : (
                      <div className="space-y-1">
                        {page.links.map((link: PageLink) => {
                          return (
                            <div
                              key={link.id}
                              draggable
                              onDragStart={() => handleDragStart(link.id)}
                              onDragOver={(e) => handleDragOver(e, link.id)}
                              onDrop={(e) => handleDrop(e, page.id, link.id)}
                              onDragEnd={handleDragEnd}
                              className={`border rounded-lg overflow-hidden transition-all ${
                                dragOverLinkId === link.id ? 'border-blue-400 bg-blue-50' : 'border-gray-200'
                              } ${draggingLinkId === link.id ? 'opacity-50' : 'opacity-100'}`}
                            >
                              {/* Link Header - Clickable to expand */}
                              <div
                                className="flex items-center gap-2 p-2 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => toggleLinkExpand(link.id)}
                              >
                                {/* Drag Handle */}
                                <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600">
                                  <GripVertical size={14} />
                                </div>

                               

                                {/* Link Label */}
                                <span className="text-sm text-gray-700 flex-1">{link.label}</span>

                               {/* Expand/Collapse Icon */}
                                {expandedLink === link.id ? (
                                  <ChevronDown size={14} className="text-gray-500 shrink-0" />
                                ) : (
                                  <ChevronRight size={14} className="text-gray-500 shrink-0" />
                                )}
                              </div>

                              {/* Expanded Link Configuration */}
                              {expandedLink === link.id && (
                                <div className="p-3 bg-white border-t border-gray-200 space-y-3">
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      checked={link.visible}
                                      onChange={() => handleToggleLinkVisibility(page.id, link.id)}
                                      className="rounded border-gray-300"
                                      id={`link-visible-${link.id}`}
                                    />
                                    <label htmlFor={`link-visible-${link.id}`} className="text-sm text-gray-700">
                                      Show in dropdown
                                    </label>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500 w-16">Label:</span>
                                    <input
                                      type="text"
                                      value={link.label}
                                      onChange={(e) => handleUpdateLink(page.id, link.id, 'label', e.target.value)}
                                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-gray-400 text-black"
                                      placeholder="Link text"
                                    />
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500 w-16">Target:</span>
                                    <select
                                      value={link.sectionId || ''}
                                      onChange={(e) => handleUpdateLink(page.id, link.id, 'sectionId', e.target.value)}
                                      className="flex-1 px-1 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-gray-400 bg-white text-black"
                                    >
                                      <option value="">Select section...</option>
                                      {getPageSections(page.id).map((s: {id: string; name: string}) => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                      ))}
                                    </select>
                                  </div>
                                  <button
                                    onClick={() => handleRemoveLink(page.id, link.id)}
                                    className="flex items-center gap-1 py-1 text-xs text-red-500 hover:underline rounded cursor-pointer transition-colors"
                                  >
                                    <Trash2 size={12} />
                                    Remove Link
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Add Custom Link Button */}
                    <button
                      onClick={() => handleAddLink(page.id)}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors border border-dashed border-blue-200"
                    >
                      <Plus size={14} />
                      Add Custom Link
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const NavbarEditor: React.FC = () => {
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<'logo' | 'pages-links' | 'style'>('pages-links');

  // Get navbar state from Redux
  const navbar = useAppSelector(state => state.navbar);
  const { content } = navbar;
  
  // Get undo/redo state
  const canUndo = useAppSelector(selectNavbarCanUndo);
  const canRedo = useAppSelector(selectNavbarCanRedo);
  
  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl/Cmd + Z (undo)
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) {
          dispatch(undoNavbar());
        }
      }
      // Check for Ctrl/Cmd + Y (redo) or Ctrl/Cmd + Shift + Z (redo)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        if (canRedo) {
          dispatch(redoNavbar());
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, dispatch]);
  
  // Get all sections from builder to populate dropdown
  const sections = useBuilderSelector(state => state.builder.sections);
  const bannerSections = useBuilderSelector(state => state.banner.sections);
  const adminSections = useBuilderSelector(state => state.admin.sections);
  
  // Combine all sections for dropdown options
  const allSections = useMemo(() => {
    const sectionsMap = new Map();
    
    sections.forEach(section => {
      sectionsMap.set(section.id, { 
        id: section.id, 
        name: section.name || section.type,
        type: section.type 
      });
    });
    
    bannerSections.forEach(section => {
      if (!sectionsMap.has(section.id)) {
        sectionsMap.set(section.id, { 
          id: section.id, 
          name: section.name || section.type,
          type: section.type 
        });
      }
    });
    
    adminSections.forEach(section => {
      if (!sectionsMap.has(section.id)) {
        sectionsMap.set(section.id, { 
          id: section.id, 
          name: section.label || section.id,
          type: 'admin'
        });
      }
    });
    
    return Array.from(sectionsMap.values());
  }, [sections, bannerSections, adminSections]);

  const handleImageUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          dispatch(updateNavbarLogo(result));
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const updateLink = (linkId: string, field: string, value: any) => {
    console.log('NavbarEditor updateLink:', { linkId, field, value });
    
    if (field === 'label' || field === 'sectionId' || field === 'visible') {
      dispatch(updateNavbarLink({ id: linkId, [field]: value }));
    }
  };

  const addNewLink = () => {
    // Get the first available section that's not already in navbar
    const usedSectionIds = content.links.map(link => link.sectionId);
    const availableSections = allSections.filter(section => !usedSectionIds.includes(section.id));
    const firstAvailableSection = availableSections[0];
    
    const newLink: NavbarLink = {
      id: `nav-${Date.now()}`,
      label: 'New Link',
      sectionId: firstAvailableSection?.id || 'hero-1',
      visible: true
    };
    
    dispatch(addNavbarLink(newLink));
  };

  const removeLink = (linkId: string) => {
    dispatch(removeNavbarLink(linkId));
  };

  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    (window as any).navbarDragIndex = index;
  };

  const handleDragEnter = (index: number) => {
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    const dragIndex = (window as any).navbarDragIndex;
    if (dragIndex !== undefined && dragOverIndex !== null && dragIndex !== dragOverIndex) {
      dispatch(reorderNavbarLinks({ fromIndex: dragIndex, toIndex: dragOverIndex }));
    }
    setDragOverIndex(null);
    delete (window as any).navbarDragIndex;
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 relative">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <h3 className="text-lg font-semibold text-black">Navbar Editor</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => dispatch(undoNavbar())}
            disabled={!canUndo}
            className="p-2 rounded-lg border border-gray-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-300"
            title="Undo"
          >
            <Undo size={16} className="text-black" />
          </button>
          <button
            onClick={() => dispatch(redoNavbar())}
            disabled={!canRedo}
            className="p-2 rounded-lg border border-gray-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-300"
            title="Redo"
          >
            <Redo size={16} className="text-black" />
          </button>
      
        </div>
      </div>

      {/* Tabs */}

      <div className="flex border-b border-gray-200 bg-white">
         <button
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'logo'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
              : 'text-black hover:text-black'
          }`}
          onClick={() => setActiveTab('logo')}
        >
          Logo
        </button>
        <button
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'pages-links'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
              : 'text-black hover:text-black'
          }`}
          onClick={() => setActiveTab('pages-links')}
        >
          Page & Links
        </button>
        <button
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'style'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
              : 'text-black hover:text-black'
          }`}
          onClick={() => setActiveTab('style')}
        >
           Style
        </button>

      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {/* Page & Links Tab */}
        {activeTab === 'pages-links' && <PagesLinksAccordion />}

        {/* Style Tab */}
        {activeTab === 'style' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-2 shadow-sm border border-gray-100">
              <h4 className="text-sm font-semibold text-black mb-4">Color Settings</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-black mb-2">Background Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={content.backgroundColor}
                      onChange={(e) => dispatch(updateNavbarColors({ backgroundColor: e.target.value }))}
                      className="w-10 h-10 rounded cursor-pointer border-0"
                    />
                    <input
                      type="text"
                      value={content.backgroundColor}
                      onChange={(e) => dispatch(updateNavbarColors({ backgroundColor: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-gray-400 focus:border-gray-400 text-black font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-black mb-2">Text Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={content.textColor}
                      onChange={(e) => dispatch(updateNavbarColors({ textColor: e.target.value }))}
                      className="w-10 h-10 rounded cursor-pointer border-0"
                    />
                    <input
                      type="text"
                      value={content.textColor}
                      onChange={(e) => dispatch(updateNavbarColors({ textColor: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-gray-400 focus:border-gray-400 text-black font-mono"
                    />
                  </div>
                </div>

                
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <h4 className="text-sm font-semibold text-black mb-4">Live Demo Button</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-black mb-2">Button Label</label>
                      <input
                        type="text"
                        value={content.liveDemoButton?.label || 'live demo'}
                        onChange={(e) => dispatch(updateLiveDemoButton({ label: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-gray-400 focus:border-gray-400 text-black"
                        placeholder="Button text"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-black mb-2">Button Background Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={content.liveDemoButton?.backgroundColor || '#2b49c5'}
                          onChange={(e) => dispatch(updateLiveDemoButton({ backgroundColor: e.target.value }))}
                          className="w-10 h-10 rounded cursor-pointer border-0"
                        />
                        <input
                          type="text"
                          value={content.liveDemoButton?.backgroundColor || '#2b49c5'}
                          onChange={(e) => dispatch(updateLiveDemoButton({ backgroundColor: e.target.value }))}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-gray-400 focus:border-gray-400 text-black font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-black mb-2">Button Text Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={content.liveDemoButton?.textColor || '#ffffff'}
                          onChange={(e) => dispatch(updateLiveDemoButton({ textColor: e.target.value }))}
                          className="w-10 h-10 rounded cursor-pointer border-0"
                        />
                        <input
                          type="text"
                          value={content.liveDemoButton?.textColor || '#ffffff'}
                          onChange={(e) => dispatch(updateLiveDemoButton({ textColor: e.target.value }))}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-gray-400 focus:border-gray-400 text-black font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-black mb-2">Button Hover Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={content.liveDemoButton?.hoverBackgroundColor || '#000000'}
                          onChange={(e) => dispatch(updateLiveDemoButton({ hoverBackgroundColor: e.target.value }))}
                          className="w-10 h-10 rounded cursor-pointer border-0"
                        />
                        <input
                          type="text"
                          value={content.liveDemoButton?.hoverBackgroundColor || '#000000'}
                          onChange={(e) => dispatch(updateLiveDemoButton({ hoverBackgroundColor: e.target.value }))}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-gray-400 focus:border-gray-400 text-black font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dropdown Styling */}
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <h4 className="text-sm font-semibold text-black mb-4">Dropdown Menu Styling</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-black mb-2">Background Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={content.dropdownBackgroundColor || '#ffffff'}
                          onChange={(e) => dispatch(updateNavbarColors({ dropdownBackgroundColor: e.target.value }))}
                          className="w-10 h-10 rounded cursor-pointer border-0"
                        />
                        <input
                          type="text"
                          value={content.dropdownBackgroundColor || '#ffffff'}
                          onChange={(e) => dispatch(updateNavbarColors({ dropdownBackgroundColor: e.target.value }))}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-gray-400 focus:border-gray-400 text-black font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-black mb-2">Text Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={content.dropdownTextColor || '#374151'}
                          onChange={(e) => dispatch(updateNavbarColors({ dropdownTextColor: e.target.value }))}
                          className="w-10 h-10 rounded cursor-pointer border-0"
                        />
                        <input
                          type="text"
                          value={content.dropdownTextColor || '#374151'}
                          onChange={(e) => dispatch(updateNavbarColors({ dropdownTextColor: e.target.value }))}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-gray-400 focus:border-gray-400 text-black font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-black mb-2">Hover Background Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={content.dropdownHoverColor || '#f3f4f6'}
                          onChange={(e) => dispatch(updateNavbarColors({ dropdownHoverColor: e.target.value }))}
                          className="w-10 h-10 rounded cursor-pointer border-0"
                        />
                        <input
                          type="text"
                          value={content.dropdownHoverColor || '#f3f4f6'}
                          onChange={(e) => dispatch(updateNavbarColors({ dropdownHoverColor: e.target.value }))}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-gray-400 focus:border-gray-400 text-black font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Logo Tab */}
        {activeTab === 'logo' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-2 shadow-sm border border-gray-100">
              <h4 className="text-sm font-semibold text-black mb-4">Logo Settings</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-black mb-2">Logo Image URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={content.logo}
                      onChange={(e) => dispatch(updateNavbarLogo(e.target.value))}
                      placeholder="/logo.png"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-gray-400 focus:border-gray-400 text-black"
                    />
                    <button
                      onClick={handleImageUpload}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <Upload size={16} />
                      Upload
                    </button>
                  </div>
                </div>

                {content.logo && content.logo !== '' && (
                  <div className="flex items-center gap-4 p-3 bg-gray-50 rounded border">
                    <img 
                      src={content.logo} 
                      alt="Logo preview" 
                      className="w-16 h-16 object-contain rounded border bg-white p-2 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => dispatch(openImageModal({ imageSrc: content.logo, alt: 'Navbar Logo' }))}
                    />
                    <div className="flex-1">
                      <p className="text-sm text-black">Logo Preview</p>
                      <p className="text-xs text-black mt-1">{content.logo}</p>
                    </div>
                    <button
                      onClick={handleImageUpload}
                      className="ml-auto text-blue-600 hover:text-blue-700 text-sm hover:underline cursor-pointer"
                    >
                      Change
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Image Modal */}
      <ImageModal />
    </div>
  );
};

export default NavbarEditor;