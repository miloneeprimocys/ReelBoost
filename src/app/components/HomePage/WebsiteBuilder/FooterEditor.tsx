"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";

// Simple debounce function
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T & { cancel: () => void } {
  let timeout: NodeJS.Timeout;
  const debounced = ((...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T & { cancel: () => void };
  
  debounced.cancel = () => {
    clearTimeout(timeout);
  };
  
  return debounced;
}
import { Plus, Trash2, Undo, Redo, GripVertical, ChevronDown, Facebook, Twitter, Linkedin, Instagram, Phone, Mail, Upload } from "lucide-react";
import { useAppSelector, useAppDispatch } from "../../../hooks/reduxHooks";
import { useAppSelector as useBuilderSelector } from "../../../hooks/reduxHooks";
import { 
  selectFooterContent, 
  updateFooterContent,
  updateFooterStyles,
  selectCanUndoFooter,
  selectCanRedoFooter,
  undo as undoFooter,
  redo as redoFooter
} from "../../../store/footerSlice";
import { closeEditor } from "../../../store/editorSlice";

interface FooterContent {
  // Brand section
  brandDescription: string;
  logoUrl: string;
  
  // Social links
  socialLinks: Array<{
    id: string;
    name: string;
    url: string;
    enabled: boolean;
    icon?: string;
    customIconUrl?: string;
  }>;
  
  // Useful links
  usefulLinks: Array<{
    id: string;
    text: string;
    sectionId: string;
    enabled: boolean;
  }>;
  
  // Contact information
  contactInfo: {
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
  };
  
  // Bottom bar
  copyright: string;
  bottomLinks: Array<{
    id: string;
    text: string;
    url: string;
    enabled: boolean;
  }>;
  
  // Styles
  styles: {
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
  };
}

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
      {label && <label className="block text-xs font-medium text-gray-900 mb-1">{label}</label>}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-2 border border-gray-300 rounded text-sm text-left text-gray-900 bg-white flex justify-between items-center gap-2 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-blue-400 hover:border-blue-400 transition-colors"
      >
        <span className={selectedOption ? 'text-gray-900 truncate flex-1' : 'text-gray-400 truncate flex-1'}>
          {selectedOption?.name || 'Select a section'}
        </span>
        <ChevronDown size={16} className={`text-gray-500 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute z-[80] w-full mt-1 bg-white hide-scrollbar border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
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

const FooterEditor = () => {
  const dispatch = useAppDispatch();
  const footerContent = useAppSelector(selectFooterContent);
  const canUndo = useAppSelector(selectCanUndoFooter);
  const canRedo = useAppSelector(selectCanRedoFooter);
  
  const [localContent, setLocalContent] = useState<FooterContent>(footerContent);
  const [activeTab, setActiveTab] = useState<'brand' | 'links' | 'info' | 'style'>('brand');
  const [expandedSocialLinkId, setExpandedSocialLinkId] = useState<string | null>(null);
  const [expandedContactSection, setExpandedContactSection] = useState<boolean>(false);
  const [draggedContactItem, setDraggedContactItem] = useState<'phone' | 'email' | null>(null);
  const [contactOrder, setContactOrder] = useState<('phone' | 'email')[]>(['phone', 'email']);
  
  // Track if localContent update came from Redux to prevent save loop
  const isUpdatingFromRedux = useRef(false);
  const previousFooterContent = useRef(footerContent);
  const pendingSaveContent = useRef<FooterContent | null>(null);
  
  // Update contactOrder when localContent changes
  useEffect(() => {
    const order: ('phone' | 'email')[] = [];
    if (localContent.contactInfo.phoneOrder < localContent.contactInfo.emailOrder) {
      order.push('phone', 'email');
    } else {
      order.push('email', 'phone');
    }
    setContactOrder(order);
  }, [localContent.contactInfo.phoneOrder, localContent.contactInfo.emailOrder]);
  
  // Icon mappings
  const socialIconMap = {
    facebook: Facebook,
    twitter: Twitter,
    linkedin: Linkedin,
    instagram: Instagram
  };
  
  const contactIconMap = {
    phone: Phone,
    mail: Mail
  };
  
  const availableSocialIcons = Object.keys(socialIconMap);
  const availableContactIcons = Object.keys(contactIconMap);
  
  // Upload functions
  const handleSocialIconUpload = (linkId: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          const updatedLinks = localContent.socialLinks.map(l => 
            l.id === linkId ? { ...l, customIconUrl: result } : l
          );
          updateContent('socialLinks', updatedLinks);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };
  
  const handleContactIconUpload = (type: 'phone' | 'email') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          const field = type === 'phone' ? 'phoneCustomIconUrl' : 'emailCustomIconUrl';
          updateContent(`contactInfo.${field}`, result);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };
  
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

  // Update local content when Redux content changes
  useEffect(() => {
    // Only update if footerContent actually changed from previous value
    if (JSON.stringify(footerContent) !== JSON.stringify(previousFooterContent.current)) {
      isUpdatingFromRedux.current = true;
      setLocalContent(footerContent);
      previousFooterContent.current = footerContent;
      
      // Reset the flag after a brief delay to allow useEffect to complete
      setTimeout(() => {
        isUpdatingFromRedux.current = false;
      }, 10);
    }
  }, [footerContent]);

  // Save function with immediate history tracking
  const saveToRedux = useCallback((content: FooterContent) => {
    console.log('FooterEditor: saveToRedux called, isUpdatingFromRedux:', isUpdatingFromRedux.current);
    if (!isUpdatingFromRedux.current) {
      pendingSaveContent.current = content;
    }
  }, []);

  // Handle pending save after render
  useEffect(() => {
    if (pendingSaveContent.current && !isUpdatingFromRedux.current) {
      console.log('FooterEditor: Saving to Redux:', pendingSaveContent.current);
      dispatch(updateFooterContent(pendingSaveContent.current));
      pendingSaveContent.current = null;
    }
  });

  
  // Keyboard shortcuts for undo/redo - only when focused on footer editor
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if the event target is within the footer editor
      const target = event.target as HTMLElement;
      const footerEditorElement = document.getElementById('footer-editor');
      
      // Debug: Log keyboard events
      console.log('FooterEditor keydown:', {
        key: event.key,
        ctrlKey: event.ctrlKey,
        metaKey: event.metaKey,
        target: target.tagName,
        inFooterEditor: footerEditorElement?.contains(target)
      });
      
      if (!footerEditorElement || !footerEditorElement.contains(target)) {
        return;
      }
      
      // Check for Ctrl/Cmd + Z (undo) or Ctrl/Cmd + Y (redo)
      if ((event.ctrlKey || event.metaKey) && !event.shiftKey && !event.altKey) {
        if (event.key === 'z') {
          console.log('FooterEditor: Undo triggered, canUndo:', canUndo);
          event.preventDefault();
          event.stopPropagation();
          if (canUndo) {
            dispatch(undoFooter());
          }
        } else if (event.key === 'y') {
          console.log('FooterEditor: Redo triggered, canRedo:', canRedo);
          event.preventDefault();
          event.stopPropagation();
          if (canRedo) {
            dispatch(redoFooter());
          }
        }
      }
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyDown, true); // Use capture phase
    
    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [dispatch]);

  const handleUndo = () => {
    dispatch(undoFooter());
  };

  const handleRedo = () => {
    dispatch(redoFooter());
  };

  const updateContent = useCallback((path: string, value: any) => {
    setLocalContent(prev => {
      const updated = { ...prev };
      const keys = path.split('.');
      
      // Navigate to the nested property
      let current: any = updated;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      // Set the final value
      current[keys[keys.length - 1]] = value;
      
      // Save to Redux immediately for proper undo/redo history
      saveToRedux(updated);
      
      return updated;
    });
  }, [saveToRedux]);

  const updateStyle = (styleKey: string, value: string) => {
    dispatch(updateFooterStyles({ [styleKey]: value }));
    setLocalContent(prev => ({
      ...prev,
      styles: {
        ...prev.styles,
        [styleKey]: value
      }
    }));
  };

  const addSocialLink = () => {
    const newLink = {
      id: `social-${Date.now()}`,
      name: 'New Social',
      url: '#',
      enabled: true
    };
    updateContent('socialLinks', [...localContent.socialLinks, newLink]);
  };

  const removeSocialLink = (id: string) => {
    updateContent('socialLinks', localContent.socialLinks.filter(link => link.id !== id));
  };

  const addUsefulLink = () => {
    const newLink = {
      id: `useful-${Date.now()}`,
      text: 'New Link',
      sectionId: '',
      enabled: true
    };
    updateContent('usefulLinks', [...localContent.usefulLinks, newLink]);
  };

  const removeUsefulLink = (id: string) => {
    updateContent('usefulLinks', localContent.usefulLinks.filter(link => link.id !== id));
  };

  const addBottomLink = () => {
    const newLink = {
      id: `bottom-${Date.now()}`,
      text: 'New Link',
      url: '#',
      enabled: true
    };
    updateContent('bottomLinks', [...localContent.bottomLinks, newLink]);
  };

  const removeBottomLink = (id: string) => {
    updateContent('bottomLinks', localContent.bottomLinks.filter(link => link.id !== id));
  };

  // Drag and drop functionality
  const [dragOverSection, setDragOverSection] = useState<string | null>(null);
  const [draggedLinkType, setDraggedLinkType] = useState<'social' | 'useful' | 'bottom' | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (linkType: 'social' | 'useful' | 'bottom', index: number) => {
    setDraggedLinkType(linkType);
    setDraggedIndex(index);
  };

  const handleDragEnter = (linkType: 'social' | 'useful' | 'bottom', index: number) => {
    setDragOverSection(`${linkType}-${index}`);
  };

  const handleDragEnd = () => {
    if (draggedLinkType && draggedIndex !== null && dragOverSection) {
      const [targetType, targetIndexStr] = dragOverSection.split('-');
      const targetIndex = parseInt(targetIndexStr);
      
      if (draggedLinkType === targetType && draggedIndex !== targetIndex) {
        const links = localContent[`${draggedLinkType}Links` as keyof FooterContent] as any[];
        const reorderedLinks = [...links];
        const [draggedLink] = reorderedLinks.splice(draggedIndex, 1);
        reorderedLinks.splice(targetIndex, 0, draggedLink);
        updateContent(`${draggedLinkType}Links`, reorderedLinks);
      }
    }
    setDraggedLinkType(null);
    setDraggedIndex(null);
    setDragOverSection(null);
  };

  // Contact drag and drop handlers
  const handleContactDragStart = (item: 'phone' | 'email') => {
    setDraggedContactItem(item);
  };

  const handleContactDragEnter = (item: 'phone' | 'email') => {
    if (draggedContactItem && draggedContactItem !== item) {
      const newOrder = [...contactOrder];
      const draggedIndex = newOrder.indexOf(draggedContactItem);
      const targetIndex = newOrder.indexOf(item);
      
      if (draggedIndex !== -1 && targetIndex !== -1) {
        newOrder.splice(draggedIndex, 1);
        newOrder.splice(targetIndex, 0, draggedContactItem);
        setContactOrder(newOrder);
      }
    }
  };

  const handleContactDragEnd = () => {
    // Update order fields based on the new contactOrder
    const newContactInfo = { ...localContent.contactInfo };
    
    // Update order fields
    contactOrder.forEach((item, index) => {
      if (item === 'phone') {
        newContactInfo.phoneOrder = index;
      } else if (item === 'email') {
        newContactInfo.emailOrder = index;
      }
    });
    
    updateContent('contactInfo', newContactInfo);
    setDraggedContactItem(null);
  };

  return (
    <div 
      id="footer-editor" 
      className="h-full flex flex-col bg-white max-w-full" 
      tabIndex={0}
      onClick={() => {
        const element = document.getElementById('footer-editor');
        if (element) element.focus();
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 bg-white shrink-0">
        <h3 className="text-lg font-semibold text-gray-900 truncate">Footer Editor</h3>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleUndo}
            disabled={!canUndo}
            className="p-2 rounded-lg border border-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-300"
            title="Undo"
          >
            <Undo size={16} className="text-gray-600" />
          </button>
          <button
            onClick={handleRedo}
            disabled={!canRedo}
            className="p-2 rounded-lg border border-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-300"
            title="Redo"
          >
            <Redo size={16} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white">
        <button
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'brand' 
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' 
              : 'text-gray-900 hover:text-gray-900'
          }`}
          onClick={() => setActiveTab('brand')}
        >
          Brand
        </button>
        <button
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'links' 
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' 
              : 'text-gray-900 hover:text-gray-900'
          }`}
          onClick={() => setActiveTab('links')}
        >
          Links
        </button>
        <button
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'info' 
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' 
              : 'text-gray-900 hover:text-gray-900'
          }`}
          onClick={() => setActiveTab('info')}
        >
          Info
        </button>
        <button
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'style' 
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' 
              : 'text-gray-900 hover:text-gray-900'
          }`}
          onClick={() => setActiveTab('style')}
        >
          Style
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4">
        {/* Brand Tab */}
        {activeTab === 'brand' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Brand Information</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-900 mb-2">Logo URL</label>
                  <input
                    type="text"
                    value={localContent.logoUrl}
                    onChange={(e) => updateContent('logoUrl', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-900 mb-2">Brand Description</label>
                  <textarea
                    value={localContent.brandDescription}
                    onChange={(e) => updateContent('brandDescription', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 resize-none"
                  />
                </div>
              </div>
            </div>
            
            {/* Social Links */}
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-gray-900">Social Links</h4>
                <button
                  onClick={addSocialLink}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <Plus size={14} />
                  Add Link
                </button>
              </div>
              <div className="space-y-3">
                {localContent.socialLinks.map((link, index) => (
                  <div 
                    key={link.id} 
                    className={`border rounded-lg p-3 transition-all ${
                      dragOverSection === `social-${index}` ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                    draggable
                    onDragStart={() => handleDragStart('social', index)}
                    onDragEnter={() => handleDragEnter('social', index)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => e.preventDefault()}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="cursor-move">
                        <GripVertical size={16} className="text-gray-500" />
                      </div>
                      <button
                        onClick={() => setExpandedSocialLinkId(expandedSocialLinkId === link.id ? null : link.id)}
                        className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
                      >
                        <ChevronDown 
                          size={16} 
                          className={`transition-transform ${expandedSocialLinkId === link.id ? 'rotate-180' : ''}`} 
                        />
                      </button>
                      <input
                        type="checkbox"
                        checked={link.enabled}
                        onChange={(e) => {
                          const updatedLinks = localContent.socialLinks.map(l => 
                            l.id === link.id ? { ...l, enabled: e.target.checked } : l
                          );
                          updateContent('socialLinks', updatedLinks);
                        }}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm font-medium text-gray-900">{link.name}</span>
                      <button
                        onClick={() => removeSocialLink(link.id)}
                        className="ml-auto p-1 text-red-500 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    
                    {expandedSocialLinkId === link.id && (
                      <div className="grid grid-cols-1 gap-3 border-t pt-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-900 mb-1">Platform Name</label>
                          <input
                            type="text"
                            value={link.name}
                            onChange={(e) => {
                              const updatedLinks = localContent.socialLinks.map(l => 
                                l.id === link.id ? { ...l, name: e.target.value } : l
                              );
                              updateContent('socialLinks', updatedLinks);
                            }}
                            placeholder="e.g., Facebook, Twitter"
                            className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-900 mb-1">Profile URL</label>
                          <input
                            type="text"
                            value={link.url}
                            onChange={(e) => {
                              const updatedLinks = localContent.socialLinks.map(l => 
                                l.id === link.id ? { ...l, url: e.target.value } : l
                              );
                              updateContent('socialLinks', updatedLinks);
                            }}
                            placeholder="https://facebook.com/yourpage"
                            className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-900 mb-1">Icon</label>
                          <div className="flex gap-2">
                            <select
                              value={link.icon || ''}
                              onChange={(e) => {
                                const updatedLinks = localContent.socialLinks.map(l => 
                                  l.id === link.id ? { ...l, icon: e.target.value, customIconUrl: undefined } : l
                                );
                                updateContent('socialLinks', updatedLinks);
                              }}
                              className="flex-1 p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                            >
                              <option value="">Select Icon</option>
                              {availableSocialIcons.map(iconName => (
                                <option key={iconName} value={iconName}>
                                  {iconName.charAt(0).toUpperCase() + iconName.slice(1)}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => handleSocialIconUpload(link.id)}
                              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                              title="Upload custom icon image"
                            >
                              <Upload className="h-4 w-4"/>
                            </button>
                          </div>
                          {link.icon && !link.customIconUrl && (
                            <div className="mt-2 flex items-center gap-2 p-3 border rounded-lg bg-gray-50">
                              <div className="w-10 h-10 rounded-lg border-2 border-gray-200 flex items-center justify-center bg-white">
                                {(() => {
                                  const IconComponent = availableSocialIcons.find(icon => icon === link.icon) ? 
                                    socialIconMap[link.icon as keyof typeof socialIconMap] : null;
                                  return IconComponent ? <IconComponent className="w-6 h-6 text-blue-600" /> : null;
                                })()}
                              </div>
                              <div className="flex-1">
                                <p className="text-xs text-gray-600">Default {link.name} Icon</p>
                                <p className="text-xs text-gray-400">{link.icon}</p>
                              </div>
                            </div>
                          )}
                          {link.customIconUrl && (
                            <div className="mt-2 flex items-center gap-2 p-3 border rounded-lg bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors">
                              <img 
                                src={link.customIconUrl} 
                                alt="Custom icon" 
                                className="w-8 h-8 object-contain border rounded"
                              />
                              <div className="flex-1">
                                <p className="text-xs text-gray-600">Custom {link.name} Icon</p>
                                <p className="text-xs text-gray-400">Uploaded image</p>
                              </div>
                              <button
                                onClick={() => {
                                  const updatedLinks = localContent.socialLinks.map(l => 
                                    l.id === link.id ? { ...l, customIconUrl: undefined } : l
                                  );
                                  updateContent('socialLinks', updatedLinks);
                                }}
                                className="text-xs text-red-600 hover:text-red-700 ml-auto"
                              >
                                Remove 
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Links Tab */}
        {activeTab === 'links' && (
          <div className="space-y-4">
            {/* Useful Links */}
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-gray-900">Useful Links</h4>
                <button
                  onClick={addUsefulLink}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <Plus size={14} />
                  Add Link
                </button>
              </div>
              <div className="space-y-3">
                {localContent.usefulLinks.map((link, index) => (
                  <div 
                    key={link.id} 
                    className={`border rounded-lg p-3 transition-all ${
                      dragOverSection === `useful-${index}` ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                    draggable
                    onDragStart={() => handleDragStart('useful', index)}
                    onDragEnter={() => handleDragEnter('useful', index)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => e.preventDefault()}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="cursor-move">
                        <GripVertical size={16} className="text-gray-500" />
                      </div>
                      <input
                        type="checkbox"
                        checked={link.enabled}
                        onChange={(e) => {
                          const updatedLinks = localContent.usefulLinks.map(l => 
                            l.id === link.id ? { ...l, enabled: e.target.checked } : l
                          );
                          updateContent('usefulLinks', updatedLinks);
                        }}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-900">Enabled</span>
                      <button
                        onClick={() => removeUsefulLink(link.id)}
                        className="ml-auto p-1 text-red-500 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-900 mb-1">Link Text</label>
                        <input
                          type="text"
                          value={link.text}
                          onChange={(e) => {
                            const updatedLinks = localContent.usefulLinks.map(l => 
                              l.id === link.id ? { ...l, text: e.target.value } : l
                            );
                            updateContent('usefulLinks', updatedLinks);
                          }}
                          placeholder="e.g., Features, About"
                          className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                        />
                      </div>
                      <div>
                        <CustomSelect
                          value={link.sectionId}
                          onChange={(val) => {
                            const updatedLinks = localContent.usefulLinks.map(l => 
                              l.id === link.id ? { ...l, sectionId: val } : l
                            );
                            updateContent('usefulLinks', updatedLinks);
                          }}
                          options={allSections}
                          label="Target Section"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Info Tab - Combined Contact and Bottom Bar */}
        {activeTab === 'info' && (
          <div className="space-y-4">
            {/* Contact Information */}
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-gray-900">Contact Information</h4>
                <button
                  onClick={() => setExpandedContactSection(!expandedContactSection)}
                  className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
                >
                  <ChevronDown 
                    size={16} 
                    className={`transition-transform ${expandedContactSection ? 'rotate-180' : ''}`} 
                  />
                </button>
              </div>
              {expandedContactSection && (
                <div className="space-y-4 border-t pt-4">
                  {contactOrder.map((item) => (
                    <div
                      key={item}
                      className={`border rounded-lg p-3 transition-all ${
                        draggedContactItem === item ? 'opacity-50' : 'border-gray-200'
                      }`}
                      draggable
                      onDragStart={() => handleContactDragStart(item)}
                      onDragEnter={() => handleContactDragEnter(item)}
                      onDragEnd={handleContactDragEnd}
                      onDragOver={(e) => e.preventDefault()}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <div className="cursor-move">
                          <GripVertical size={16} className="text-gray-500" />
                        </div>
                        <input
                          type="checkbox"
                          checked={item === 'phone' ? localContent.contactInfo.phoneEnabled : localContent.contactInfo.emailEnabled}
                          onChange={(e) => updateContent(`contactInfo.${item}Enabled`, e.target.checked)}
                          className="rounded border-gray-300"
                        />
                        <label className="text-sm font-medium text-gray-900">
                          Enable {item === 'phone' ? 'Phone' : 'Email'}
                        </label>
                      </div>
                      <input
                        type={item === 'phone' ? 'text' : 'email'}
                        value={item === 'phone' ? localContent.contactInfo.phone : localContent.contactInfo.email}
                        onChange={(e) => updateContent(`contactInfo.${item}`, e.target.value)}
                        placeholder={item === 'phone' ? 'Phone Number' : 'Email Address'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 mb-2"
                      />
                      <div className="mt-2">
                        <label className="block text-xs font-medium text-gray-900 mb-1">
                          {item === 'phone' ? 'Phone' : 'Email'} Icon
                        </label>
                        <div className="flex gap-2">
                          <select
                            value={item === 'phone' ? (localContent.contactInfo.phoneIcon || '') : (localContent.contactInfo.emailIcon || '')}
                            onChange={(e) => updateContent(`contactInfo.${item}Icon`, e.target.value)}
                            className="flex-1 p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                          >
                            <option value="">Select Icon</option>
                            {availableContactIcons.map(iconName => (
                              <option key={iconName} value={iconName}>
                                {iconName.charAt(0).toUpperCase() + iconName.slice(1)}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleContactIconUpload(item)}
                            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                            title="Upload custom icon image"
                          >
                            <Upload className="h-4 w-4"/>
                          </button>
                        </div>
                        {((item === 'phone' ? localContent.contactInfo.phoneIcon : localContent.contactInfo.emailIcon) && 
                          !(item === 'phone' ? localContent.contactInfo.phoneCustomIconUrl : localContent.contactInfo.emailCustomIconUrl)) && (
                          <div className="mt-2 flex items-center gap-2 p-3 border rounded-lg bg-gray-50">
                            <div className="w-10 h-10 rounded-lg border-2 border-gray-200 flex items-center justify-center bg-white">
                              {(() => {
                                const iconName = item === 'phone' ? localContent.contactInfo.phoneIcon : localContent.contactInfo.emailIcon;
                                const IconComponent = iconName ? contactIconMap[iconName as keyof typeof contactIconMap] : null;
                                return IconComponent ? <IconComponent className="w-6 h-6 text-blue-600" /> : null;
                              })()}
                            </div>
                            <div className="flex-1">
                              <p className="text-xs text-gray-600">Default {item === 'phone' ? 'Phone' : 'Email'} Icon</p>
                              <p className="text-xs text-gray-400">
                                {item === 'phone' ? localContent.contactInfo.phoneIcon : localContent.contactInfo.emailIcon}
                              </p>
                            </div>
                          </div>
                        )}
                        {(item === 'phone' ? localContent.contactInfo.phoneCustomIconUrl : localContent.contactInfo.emailCustomIconUrl) && (
                          <div className="mt-2 flex items-center gap-2 p-3 border rounded-lg bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors">
                            <img 
                              src={item === 'phone' ? localContent.contactInfo.phoneCustomIconUrl : localContent.contactInfo.emailCustomIconUrl} 
                              alt={`Custom ${item} icon`} 
                              className="w-8 h-8 object-contain border rounded"
                            />
                            <div className="flex-1">
                              <p className="text-xs text-gray-600">Custom {item === 'phone' ? 'Phone' : 'Email'} Icon</p>
                              <p className="text-xs text-gray-400">Uploaded image</p>
                            </div>
                            <button
                              onClick={() => updateContent(`contactInfo.${item}CustomIconUrl`, undefined)}
                              className="text-xs text-red-600 hover:text-red-700 ml-auto"
                            >
                              Remove 
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Bar Settings */}
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Bottom Bar Settings</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-900 mb-2">Copyright Text</label>
                  <input
                    type="text"
                    value={localContent.copyright}
                    onChange={(e) => updateContent('copyright', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="text-sm font-medium text-gray-900">Bottom Links</h5>
                    <button
                      onClick={addBottomLink}
                      className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      <Plus size={14} />
                      Add Link
                    </button>
                  </div>
                  <div className="space-y-3">
                    {localContent.bottomLinks.map((link, index) => (
                      <div 
                        key={link.id} 
                        className={`border rounded-lg p-3 transition-all ${
                          dragOverSection === `bottom-${index}` ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                        }`}
                        draggable
                        onDragStart={() => handleDragStart('bottom', index)}
                        onDragEnter={() => handleDragEnter('bottom', index)}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => e.preventDefault()}
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <div className="cursor-move">
                            <GripVertical size={16} className="text-gray-500" />
                          </div>
                          <input
                            type="checkbox"
                            checked={link.enabled}
                            onChange={(e) => {
                              const updatedLinks = localContent.bottomLinks.map(l => 
                                l.id === link.id ? { ...l, enabled: e.target.checked } : l
                              );
                              updateContent('bottomLinks', updatedLinks);
                            }}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm text-gray-900">Enabled</span>
                          <button
                            onClick={() => removeBottomLink(link.id)}
                            className="ml-auto p-1 text-red-500 hover:bg-red-50 rounded"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-900 mb-1">Link Text</label>
                            <input
                              type="text"
                              value={link.text}
                              onChange={(e) => {
                                const updatedLinks = localContent.bottomLinks.map(l => 
                                  l.id === link.id ? { ...l, text: e.target.value } : l
                                );
                                updateContent('bottomLinks', updatedLinks);
                              }}
                              placeholder="e.g., Privacy Policy"
                              className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-900 mb-1">URL</label>
                            <input
                              type="text"
                              value={link.url}
                              onChange={(e) => {
                                const updatedLinks = localContent.bottomLinks.map(l => 
                                  l.id === link.id ? { ...l, url: e.target.value } : l
                                );
                                updateContent('bottomLinks', updatedLinks);
                              }}
                              placeholder="e.g., /privacy, https://example.com"
                              className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Style Tab */}
        {activeTab === 'style' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Footer Style Settings</h4>
              <div className="space-y-6">
                {/* Footer Background */}
                <div>
                  <label className="block text-xs font-medium text-gray-900 mb-2">Footer Background Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={localContent.styles.backgroundColor}
                      onChange={(e) => updateStyle('backgroundColor', e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer border-0"
                    />
                    <input
                      type="text"
                      value={localContent.styles.backgroundColor}
                      onChange={(e) => updateStyle('backgroundColor', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-mono"
                    />
                  </div>
                </div>

                {/* Text Colors */}
                <div className="border-t border-gray-200 pt-4">
                  <h5 className="text-sm font-medium text-gray-900 mb-4">Text Colors</h5>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-900 mb-2">Brand Text Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={localContent.styles.brandTextColor}
                          onChange={(e) => updateStyle('brandTextColor', e.target.value)}
                          className="w-10 h-10 rounded cursor-pointer border-0"
                        />
                        <input
                          type="text"
                          value={localContent.styles.brandTextColor}
                          onChange={(e) => updateStyle('brandTextColor', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-900 mb-2">Link Text Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={localContent.styles.linkTextColor}
                          onChange={(e) => updateStyle('linkTextColor', e.target.value)}
                          className="w-10 h-10 rounded cursor-pointer border-0"
                        />
                        <input
                          type="text"
                          value={localContent.styles.linkTextColor}
                          onChange={(e) => updateStyle('linkTextColor', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-900 mb-2">Link Hover Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={localContent.styles.linkHoverColor}
                          onChange={(e) => updateStyle('linkHoverColor', e.target.value)}
                          className="w-10 h-10 rounded cursor-pointer border-0"
                        />
                        <input
                          type="text"
                          value={localContent.styles.linkHoverColor}
                          onChange={(e) => updateStyle('linkHoverColor', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Social Icons */}
                <div className="border-t border-gray-200 pt-4">
                  <h5 className="text-sm font-medium text-gray-900 mb-4">Social Icons</h5>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-900 mb-2">Icon Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={localContent.styles.socialIconColor}
                          onChange={(e) => updateStyle('socialIconColor', e.target.value)}
                          className="w-10 h-10 rounded cursor-pointer border-0"
                        />
                        <input
                          type="text"
                          value={localContent.styles.socialIconColor}
                          onChange={(e) => updateStyle('socialIconColor', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-900 mb-2">Icon Background Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={localContent.styles.socialIconBackground}
                          onChange={(e) => updateStyle('socialIconBackground', e.target.value)}
                          className="w-10 h-10 rounded cursor-pointer border-0"
                        />
                        <input
                          type="text"
                          value={localContent.styles.socialIconBackground}
                          onChange={(e) => updateStyle('socialIconBackground', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-900 mb-2">Icon Hover Background</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={localContent.styles.socialIconHoverBackground}
                          onChange={(e) => updateStyle('socialIconHoverBackground', e.target.value)}
                          className="w-10 h-10 rounded cursor-pointer border-0"
                        />
                        <input
                          type="text"
                          value={localContent.styles.socialIconHoverBackground}
                          onChange={(e) => updateStyle('socialIconHoverBackground', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Icons */}
                <div className="border-t border-gray-200 pt-4">
                  <h5 className="text-sm font-medium text-gray-900 mb-4">Contact Icons</h5>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-900 mb-2">Icon Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={localContent.styles.contactIconColor}
                          onChange={(e) => updateStyle('contactIconColor', e.target.value)}
                          className="w-10 h-10 rounded cursor-pointer border-0"
                        />
                        <input
                          type="text"
                          value={localContent.styles.contactIconColor}
                          onChange={(e) => updateStyle('contactIconColor', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-900 mb-2">Icon Background Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={localContent.styles.contactIconBackground}
                          onChange={(e) => updateStyle('contactIconBackground', e.target.value)}
                          className="w-10 h-10 rounded cursor-pointer border-0"
                        />
                        <input
                          type="text"
                          value={localContent.styles.contactIconBackground}
                          onChange={(e) => updateStyle('contactIconBackground', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-900 mb-2">Icon Hover Background</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={localContent.styles.contactIconHoverBackground}
                          onChange={(e) => updateStyle('contactIconHoverBackground', e.target.value)}
                          className="w-10 h-10 rounded cursor-pointer border-0"
                        />
                        <input
                          type="text"
                          value={localContent.styles.contactIconHoverBackground}
                          onChange={(e) => updateStyle('contactIconHoverBackground', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-200 pt-4">
                  <h5 className="text-sm font-medium text-gray-900 mb-4">Bottom Bar</h5>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-900 mb-2">Border Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={localContent.styles.bottomBarBorderColor}
                          onChange={(e) => updateStyle('bottomBarBorderColor', e.target.value)}
                          className="w-10 h-10 rounded cursor-pointer border-0"
                        />
                        <input
                          type="text"
                          value={localContent.styles.bottomBarBorderColor}
                          onChange={(e) => updateStyle('bottomBarBorderColor', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-900 mb-2">Text Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={localContent.styles.bottomBarTextColor}
                          onChange={(e) => updateStyle('bottomBarTextColor', e.target.value)}
                          className="w-10 h-10 rounded cursor-pointer border-0"
                        />
                        <input
                          type="text"
                          value={localContent.styles.bottomBarTextColor}
                          onChange={(e) => updateStyle('bottomBarTextColor', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-900 mb-2">Link Hover Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={localContent.styles.bottomBarLinkHoverColor}
                          onChange={(e) => updateStyle('bottomBarLinkHoverColor', e.target.value)}
                          className="w-10 h-10 rounded cursor-pointer border-0"
                        />
                        <input
                          type="text"
                          value={localContent.styles.bottomBarLinkHoverColor}
                          onChange={(e) => updateStyle('bottomBarLinkHoverColor', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FooterEditor;
