"use client";

import React, { useState } from "react";
import { GripVertical, Edit3, Eye, EyeOff, Trash2 } from "lucide-react";

type SectionType = 'hero' | 'banner' | 'features' | 'admin-panel' | 'benefits' | 'second' | 'third' | 'fourth' | 'fifth' | 'sixth';

interface SectionListProps {
  sections: any[];
  bannerSections: any[];
  adminSections: any[];
  activeSection: string | null;
  activeBannerSection: string | null;
  activeAdminSection: string | null;
  onDragStart: (index: number) => void;
  onDragEnter: (index: number) => void;
  onDragEnd: () => void;
  onToggleVisibility: (id: string) => void;
  onToggleBannerVisibility: (id: string) => void;
  onToggleAdminVisibility: (id: string) => void;
  onSetActive: (id: string) => void;
  onSetActiveBanner: (id: string) => void;
  onSetActiveAdmin: (id: string) => void;
  onDelete: (id: string) => void;
  onDeleteBanner: (id: string) => void;
  onDeleteAdmin: (id: string) => void;
  onAddSection: (type: string) => void;
  dragOverItem: number;
}

const SectionList: React.FC<SectionListProps> = ({
  sections,
  bannerSections,
  adminSections,
  activeSection,
  activeBannerSection,
  activeAdminSection,
  onDragStart,
  onDragEnter,
  onDragEnd,
  onToggleVisibility,
  onToggleBannerVisibility,
  onToggleAdminVisibility,
  onSetActive,
  onSetActiveBanner,
  onSetActiveAdmin,
  onDelete,
  onDeleteBanner,
  onDeleteAdmin,
  onAddSection,
  dragOverItem,
}) => {
  // Touch event handling for mobile drag and drop
  const [touchItem, setTouchItem] = useState<number | null>(null);
  const [touchPosition, setTouchPosition] = useState({ x: 0, y: 0 });

  const handleTouchStart = (e: React.TouchEvent, index: number) => {
    setTouchItem(index);
    setTouchPosition({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    onDragStart(index);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchItem === null) return;
    
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    const dragElement = element?.closest('[data-draggable]');
    
    if (dragElement) {
      const index = parseInt(dragElement.getAttribute('data-index') || '0');
      if (index !== touchItem) {
        onDragEnter(index);
      }
    }
  };

  const handleTouchEnd = () => {
    if (touchItem !== null) {
      onDragEnd();
      setTouchItem(null);
    }
  };
  // Create a Map to ensure unique sections by id
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
  
  // Note: adminSections are not displayed here anymore
  // Fifth type sections contain admin tabs internally in their content.tabs
  
  // Convert Map to array and sort by order
  const allSections = Array.from(sectionsMap.values()).sort((a, b) => a.order - b.order);
  
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-900">Page Sections</h3>
      
      {/* Existing Sections */}
      <div className="space-y-3 mb-6">
        {allSections.map((section, index) => {
                              
          // Check section types
          const isBannerSection = section.source === 'banner' || section.type === 'banner';
          const isAdminSection = section.source === 'admin';
          const isActive = section.id === activeSection || section.id === activeBannerSection || section.id === activeAdminSection;
          
          // Get display name for different section types
          const getDisplayName = () => {
            if (section.id === 'second-1') return 'Live Streaming';
            if (section.id === 'third-1') return 'PK Battle';
            if (section.type === 'banner' && section.name) return section.name;
            if (isAdminSection && section.label) return section.label;
            return section.name || section.label;
          };
          
          // Get display type for different section types
          const getDisplayType = () => {
            if (section.id === 'second-1') return 'Live Streaming';
            if (section.id === 'third-1') return 'PK Battle';
            if (section.type === 'banner') return 'Banner';
            if (isAdminSection) return 'Admin Panel';
            return section.type;
          };
          
          return (
            <div
              key={section.id}
              draggable
              onDragStart={() => onDragStart(index)}
              onDragEnter={() => onDragEnter(index)}
              onDragEnd={onDragEnd}
              onTouchStart={(e) => handleTouchStart(e, index)}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              data-draggable
              data-index={index}
              onClick={() => {
                if (isBannerSection) {
                  onSetActiveBanner(section.id);
                } else if (section.type === 'fifth') {
                  onSetActive(section.id);
                } else {
                  onSetActive(section.id);
                }
              }}
              className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all touch-none ${
                isActive ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm bg-white'
              } ${touchItem === index ? 'opacity-50 scale-105 shadow-lg' : ''} ${
                dragOverItem === index ? 'border-blue-400 bg-blue-50 scale-102' : ''
              }`}
            >
              <GripVertical size={18} className="text-gray-500" />
              
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">{getDisplayName()}</div>
                <div className="text-sm text-gray-500 capitalize">{getDisplayType()}</div>
              </div>
              
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isBannerSection) {
                      onSetActiveBanner(section.id);
                    } else if (section.type === 'fifth') {
                      onSetActive(section.id);
                    } else {
                      onSetActive(section.id);
                    }
                  }}
                  className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600 hover:text-blue-700"
                  title="Edit Section"
                >
                  <Edit3 size={18} />
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Simplified logic: Always use onToggleVisibility for builder sections
                    if (section.source === 'builder' || (!section.source && section.type !== 'banner')) {
                      onToggleVisibility(section.id);
                    } else if (section.source === 'banner') {
                      onToggleBannerVisibility(section.id);
                    } else if (isAdminSection) {
                      onToggleAdminVisibility(section.id);
                    } else {
                      onToggleVisibility(section.id);
                    }
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-700 hover:text-gray-900"
                  title={section.visible ? "Hide Section" : "Show Section"}
                >
                  {section.visible ? <Eye size={18} className="text-gray-700" /> : <EyeOff size={18} className="text-gray-500" />}
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle delete for different section types
                    if (section.type === 'banner' && section.source === 'builder') {
                      onDelete(section.id);
                    } else if (section.source === 'banner') {
                      onDeleteBanner(section.id);
                    } else if (isAdminSection) {
                      onDeleteAdmin(section.id);
                    } else {
                      onDelete(section.id);
                    }
                  }}
                  className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600 hover:text-red-700"
                  title="Delete Section"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add New Section */}
      <div className="border-t border-gray-200 pt-4">
        <h4 className="font-medium mb-3 text-gray-800">Add New Section</h4>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onAddSection('hero')}
            className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all text-sm font-medium text-gray-700 hover:text-gray-900 bg-white"
          >
            Text and Image
          </button>
          <button
            onClick={() => onAddSection('banner')}
            className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all text-sm font-medium text-gray-700 hover:text-gray-900 bg-white"
          >
            Banner
          </button>
          <button
            onClick={() => onAddSection('features')}
            className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all text-sm font-medium text-gray-700 hover:text-gray-900 bg-white"
          >
            Features
          </button>
          <button
            onClick={() => onAddSection('admin-panel')}
            className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all text-sm font-medium text-gray-700 hover:text-gray-900 bg-white"
          >
            Admin Panel
          </button>
          <button
            onClick={() => onAddSection('benefits')}
            className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all text-sm font-medium text-gray-700 hover:text-gray-900 bg-white"
          >
            Benefits
          </button>
        </div>
      </div>
    </div>
  );
};

export default SectionList;