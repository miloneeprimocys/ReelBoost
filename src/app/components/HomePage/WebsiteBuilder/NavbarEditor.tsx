"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
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
import { Trash2, Upload, X, Plus, GripVertical, Undo, Redo, ChevronDown } from "lucide-react";
import { NavbarLink } from "../../../store/navbarSlice";
import { openImageModal } from "../../../store/modalSlice";
import ImageModal from "./ImageModal";

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

const NavbarEditor: React.FC = () => {
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<'links' | 'style' | 'logo'>('links');
  
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
            activeTab === 'links' 
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' 
              : 'text-black hover:text-black'
          }`}
          onClick={() => setActiveTab('links')}
        >
          Links
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
        {/* Links Tab */}
        {activeTab === 'links' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-2 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-black">Navigation Links</h4>
                <button
                  onClick={addNewLink}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <Plus size={14} />
                  Add Link
                </button>
              </div>
              
              <div className="space-y-3">
                {content.links.map((link: NavbarLink, index: number) => (
                  <div 
                    key={link.id} 
                    className={`border rounded-lg p-3 transition-all ${
                      dragOverIndex === index ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragEnter={() => handleDragEnter(index)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => e.preventDefault()}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="cursor-move">
                        <GripVertical size={16} className="text-black" />
                      </div>
                      <input
                        type="checkbox"
                        checked={link.visible}
                        onChange={(e) => updateLink(link.id, 'visible', e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-black">Visible</span>
                      <button
                        onClick={() => removeLink(link.id)}
                        className="ml-auto p-1 text-red-500 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-black mb-1">Link Label</label>
                        <input
                          type="text"
                          value={link.label}
                          onChange={(e) => updateLink(link.id, 'label', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-gray-400 focus:border-gray-400 text-black"
                          placeholder="Link text"
                        />
                      </div>
                      <div>
                        <CustomSelect
                          value={link.sectionId}
                          onChange={(val) => updateLink(link.id, 'sectionId', val)}
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