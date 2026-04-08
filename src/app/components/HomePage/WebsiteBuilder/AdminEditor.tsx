"use client";

import React, { useState } from "react";
import { useAppSelector, useAppDispatch } from "../../../hooks/reduxHooks";
import { updateAdminContent, setActiveSection as setActiveAdminSection } from "../../../store/adminSlice";
import { updateSectionContent, toggleBuilderMode } from "../../../store/builderSlice";
import { closeEditor } from "../../../store/editorSlice";
import { Trash2, Upload, Plus, GripVertical, CheckCircle, AlignLeft, AlignRight } from "lucide-react";

interface AdminTabContent {
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

// Section-level color settings (applies to all tabs)
interface SectionColors {
  labelColor: string;
  subtitleColor: string;
  titleColor: string;
  descriptionColor: string;
  pointsColor: string;
}

// Demo templates for new tabs
const demoTabTemplates: AdminTabContent[] = [
  {
    id: 'new-tab-1',
    label: "NEW TAB",
    subtitle: "Feature Category",
    title: "New Admin Feature",
    description: "Description for this admin feature goes here.",
    points: ["Feature point 1", "Feature point 2"],
    image: "/Admin1.svg",
    order: 1,
    visible: true,
  },
  {
    id: 'new-tab-2',
    label: "ANOTHER TAB",
    subtitle: "Management",
    title: "Management Tool",
    description: "Manage and configure this feature from the admin dashboard.",
    points: ["Management capability 1", "Management capability 2"],
    image: "/Admin2.svg",
    order: 2,
    visible: true,
  }
];

const AdminEditor = () => {
  const dispatch = useAppDispatch();
  
  // Get editor state from editorSlice
  const { editorSection } = useAppSelector(state => state.editor);
  
  // Get builder sections for fifth section support
  const { sections: builderSections } = useAppSelector(state => state.builder);
  
  // Use section-specific content from editorSection
  const section = editorSection;
  
  // Get tabs from section content (for fifth section) or use empty array
  const getInitialTabs = (): AdminTabContent[] => {
    console.log('AdminEditor getInitialTabs:', { 
      sectionId: section?.id, 
      sectionContent: section?.content,
      hasTabs: !!section?.content?.tabs,
      tabsLength: section?.content?.tabs?.length 
    });
    
    if (section?.content?.tabs && Array.isArray(section.content.tabs)) {
      console.log('Loading tabs from section.content.tabs:', section.content.tabs);
      return section.content.tabs;
    }
    // Fallback: try to get from builderSections if it's a fifth section
    if (section?.id?.startsWith('fifth-')) {
      const fifthSection = builderSections.find(s => s.id === section.id);
      if (fifthSection?.content?.tabs && Array.isArray(fifthSection.content.tabs)) {
        console.log('Loading tabs from builderSections:', fifthSection.content.tabs);
        return fifthSection.content.tabs;
      }
    }
    // Default: return 2 demo tabs
    console.log('Falling back to demoTabTemplates');
    return demoTabTemplates.map((t, i) => ({ ...t, id: `tab-${Date.now()}-${i}`, order: i + 1 }));
  };

  const [tabs, setTabs] = useState<AdminTabContent[]>(getInitialTabs);
  const [activeTabId, setActiveTabId] = useState<string>(tabs[0]?.id || '');
  const [newPoint, setNewPoint] = useState("");
  
  // Drag and drop state for tabs
  const [draggedTabIndex, setDraggedTabIndex] = useState<number>(-1);
  const [dragOverTabIndex, setDragOverTabIndex] = useState<number>(-1);
  
  // Section-level colors (apply to all tabs)
  const [sectionColors, setSectionColors] = useState<SectionColors>(() => {
    // Try to get colors from section content, or use defaults
    const content = section?.content;
    return {
      labelColor: content?.labelColor || '#2b49c5',
      subtitleColor: content?.subtitleColor || '#2b49c5',
      titleColor: content?.titleColor || '#111827',
      descriptionColor: content?.descriptionColor || '#6b7280',
      pointsColor: content?.pointsColor || '#374151',
    };
  });

  // Layout state for content with image
  const [layout, setLayout] = useState<'left' | 'right'>(() => {
    return section?.content?.layout || 'left';
  });

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];

  // Update tabs when section changes or content changes
  React.useEffect(() => {
    const newTabs = getInitialTabs();
    console.log('AdminEditor useEffect - newTabs:', newTabs);
    setTabs(newTabs);
    if (newTabs.length > 0 && !newTabs.find(t => t.id === activeTabId)) {
      setActiveTabId(newTabs[0].id);
    }
    
    // Update section colors from section content
    const content = section?.content;
    if (content) {
      setSectionColors({
        labelColor: content?.labelColor || '#2b49c5',
        subtitleColor: content?.subtitleColor || '#2b49c5',
        titleColor: content?.titleColor || '#111827',
        descriptionColor: content?.descriptionColor || '#6b7280',
        pointsColor: content?.pointsColor || '#374151',
      });
    }
  }, [section?.id, JSON.stringify(section?.content)]);

  const updateActiveTab = (updates: Partial<AdminTabContent>) => {
    setTabs(prev => prev.map(tab => 
      tab.id === activeTabId ? { ...tab, ...updates } : tab
    ));
  };

  const handlePointChange = (index: number, value: string) => {
    if (!activeTab) return;
    const updatedPoints = [...activeTab.points];
    updatedPoints[index] = value;
    updateActiveTab({ points: updatedPoints });
  };

  const addPoint = () => {
    if (!newPoint.trim() || !activeTab) return;
    updateActiveTab({ points: [...activeTab.points, newPoint.trim()] });
    setNewPoint("");
  };

  const removePoint = (index: number) => {
    if (!activeTab) return;
    const updatedPoints = activeTab.points.filter((_, i) => i !== index);
    updateActiveTab({ points: updatedPoints });
  };

  const addNewTab = () => {
    if (tabs.length >= 6) {
      console.warn('Maximum 6 tabs allowed');
      return;
    }
    const newTab: AdminTabContent = {
      id: `tab-${Date.now()}`,
      label: `FEATURE ${tabs.length + 1}`,
      subtitle: 'Feature Description',
      title: 'New Feature Title',
      description: 'Add a compelling description for this feature.',
      points: ['Benefit 1', 'Benefit 2'],
      image: '/Admin1.svg',
      visible: true,
      order: tabs.length + 1
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTab.id);
  };

  const removeTab = (tabId: string) => {
    if (tabs.length <= 2) {
      alert("Minimum 2 tabs required");
      return;
    }
    const newTabs = tabs.filter(t => t.id !== tabId);
    // Reorder remaining tabs
    const reorderedTabs = newTabs.map((t, i) => ({ ...t, order: i + 1 }));
    setTabs(reorderedTabs);
    if (activeTabId === tabId) {
      setActiveTabId(reorderedTabs[0]?.id || '');
    }
  };

  const handleTabDragStart = (index: number) => {
    setDraggedTabIndex(index);
  };

  const handleTabDragEnter = (index: number) => {
    setDragOverTabIndex(index);
  };

  const handleTabDragEnd = () => {
    if (draggedTabIndex === -1 || dragOverTabIndex === -1) {
      setDraggedTabIndex(-1);
      setDragOverTabIndex(-1);
      return;
    }

    const fromIndex = draggedTabIndex;
    const toIndex = dragOverTabIndex;

    if (fromIndex !== toIndex) {
      const reorderedTabs = [...tabs];
      const [removed] = reorderedTabs.splice(fromIndex, 1);
      reorderedTabs.splice(toIndex, 0, removed);
      
      // Update order property
      const updatedTabs = reorderedTabs.map((tab, index) => ({
        ...tab,
        order: index + 1
      }));
      
      setTabs(updatedTabs);
      console.log('Tabs reordered:', updatedTabs.map(t => ({ label: t.label, order: t.order })));
    }

    setDraggedTabIndex(-1);
    setDragOverTabIndex(-1);
  };

  const handleDone = () => {
    if (section) {
      // Reorder tabs before saving
      const reorderedTabs = tabs.map((t, i) => ({ ...t, order: i + 1 }));
      
      console.log('AdminEditor handleDone - saving data:', {
        sectionId: section.id,
        sectionType: section.type,
        reorderedTabs,
        sectionColors,
        layout
      });
      
      // Save to appropriate slice based on section type
      if (section.type === 'fifth' || section.id?.startsWith('fifth-') || section.name?.includes('Admin Panel')) {
        // For fifth sections in builderSlice, save complete section content
        const contentToSave = {
          // Save all tabs with their complete data
          tabs: reorderedTabs,
          // Include section-level colors
          labelColor: sectionColors.labelColor,
          subtitleColor: sectionColors.subtitleColor,
          titleColor: sectionColors.titleColor,
          descriptionColor: sectionColors.descriptionColor,
          pointsColor: sectionColors.pointsColor,
          // Include layout
          layout: layout,
        };
        
        console.log('AdminEditor - dispatching updateSectionContent with:', contentToSave);
        dispatch(updateSectionContent({
          id: section.id,
          content: contentToSave
        }));
      } else {
        // For admin sections in adminSlice, save the first active tab's data
        // Admin sections from adminSlice store individual tabs, not an array
        const activeTabData = reorderedTabs[0];
        if (activeTabData) {
          console.log('AdminEditor - dispatching updateAdminContent with:', activeTabData);
          dispatch(updateAdminContent({ 
            id: section.id, 
            content: activeTabData
          }));
        }
      }
    }
    
    // Close editor and builder via Redux
    dispatch(closeEditor());
    dispatch(setActiveAdminSection(null));
    dispatch(toggleBuilderMode());
    
    // Scroll to section after closing
    setTimeout(() => {
      // Try to find the section by its ID first
      const sectionId = section?.id;
      let sectionElement = null;
      
      // Try to find by section ID (for new sections)
      if (sectionId) {
        sectionElement = document.getElementById(sectionId);
        console.log('Trying to scroll to section ID:', sectionId, 'Found:', !!sectionElement);
      }
      
      // Fallback to admin-panel (for default fifth-1 section)
      if (!sectionElement) {
        sectionElement = document.getElementById('admin-panel');
        console.log('Fallback to admin-panel element, Found:', !!sectionElement);
      }
      
      if (sectionElement) {
        sectionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        console.warn('No section element found to scroll to');
      }
    }, 300);
  };

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
          updateActiveTab({ image: result });
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  if (!activeTab) {
    return (
      <div className="p-6 bg-gray-50 min-h-full">
        <p className="text-gray-500">No tabs available. Click "Add Tab" to create one.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Header with Done button */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900">Admin Panel Editor</h3>
        <button
          onClick={handleDone}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm hover:shadow-md"
        >
          Done
        </button>
      </div>

      {/* Tabs List */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-800">Admin Tabs ({tabs.length}/6)</h4>
          <button
            onClick={addNewTab}
            disabled={tabs.length >= 6}
            className={`px-3 py-2 rounded-lg transition-colors text-sm flex items-center gap-1 cursor-pointer ${
              tabs.length >= 6 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
            title={tabs.length >= 6 ? 'Maximum 6 tabs allowed' : 'Add new tab'}
          >
            <Plus size={16} />
            Add Tab
          </button>
        </div>
        
        <div className="space-y-2">
          {tabs.map((tab, index) => (
            <div
              key={tab.id}
              draggable
              onDragStart={() => handleTabDragStart(index)}
              onDragEnter={() => handleTabDragEnter(index)}
              onDragEnd={handleTabDragEnd}
              onClick={() => setActiveTabId(tab.id)}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all touch-none ${
                tab.id === activeTabId 
                  ? 'bg-blue-50 border-2 border-blue-500' 
                  : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
              } ${
                dragOverTabIndex === index ? 'border-blue-400 bg-blue-50' : ''
              }`}
            >
              <GripVertical size={18} className="text-gray-400 cursor-move" />
              <span className="text-sm font-medium text-gray-500 w-6">{index + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">{tab.label}</div>
                <div className="text-xs text-gray-500 truncate">{tab.title}</div>
              </div>
              <div className="flex items-center gap-2">
                {!tab.visible && <span className="text-xs text-gray-400">(hidden)</span>}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeTab(tab.id);
                  }}
                  disabled={tabs.length <= 2}
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  title={tabs.length <= 2 ? "Minimum 2 tabs required" : "Delete tab"}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-3">Minimum 2 tabs required. Click a tab to edit it.</p>
      </div>

      {/* Header Section Editor */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 mb-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Header Section</h4>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Main Title (Large Text)</label>
            <input
              type="text"
              value={section?.content?.mainTitle || 'Describing'}
              onChange={(e) => {
                if (section) {
                  dispatch(updateSectionContent({
                    id: section.id,
                    content: { ...section.content, mainTitle: e.target.value }
                  }));
                }
              }}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
              placeholder="e.g., Describing"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Highlighted Title (Blue Background)</label>
            <input
              type="text"
              value={section?.content?.highlightedTitle || 'Admin Panel'}
              onChange={(e) => {
                if (section) {
                  dispatch(updateSectionContent({
                    id: section.id,
                    content: { ...section.content, highlightedTitle: e.target.value }
                  }));
                }
              }}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
              placeholder="e.g., Admin Panel"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle (Small Text Above)</label>
            <input
              type="text"
              value={section?.content?.headerSubtitle || 'Admin Panel Features'}
              onChange={(e) => {
                if (section) {
                  dispatch(updateSectionContent({
                    id: section.id,
                    content: { ...section.content, headerSubtitle: e.target.value }
                  }));
                }
              }}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
              placeholder="e.g., Admin Panel Features"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Main Title Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={section?.content?.mainTitleColor || '#111827'}
                  onChange={(e) => {
                    if (section) {
                      dispatch(updateSectionContent({
                        id: section.id,
                        content: { ...section.content, mainTitleColor: e.target.value }
                      }));
                    }
                  }}
                  className="w-10 h-10 rounded cursor-pointer border-0"
                />
                <input
                  type="text"
                  value={section?.content?.mainTitleColor || '#111827'}
                  onChange={(e) => {
                    if (section) {
                      dispatch(updateSectionContent({
                        id: section.id,
                        content: { ...section.content, mainTitleColor: e.target.value }
                      }));
                    }
                  }}
                  className="flex-1 p-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                  placeholder="#111827"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={section?.content?.headerSubtitleColor || '#2b49c5'}
                  onChange={(e) => {
                    if (section) {
                      dispatch(updateSectionContent({
                        id: section.id,
                        content: { ...section.content, headerSubtitleColor: e.target.value }
                      }));
                    }
                  }}
                  className="w-10 h-10 rounded cursor-pointer border-0"
                />
                <input
                  type="text"
                  value={section?.content?.headerSubtitleColor || '#2b49c5'}
                  onChange={(e) => {
                    if (section) {
                      dispatch(updateSectionContent({
                        id: section.id,
                        content: { ...section.content, headerSubtitleColor: e.target.value }
                      }));
                    }
                  }}
                  className="flex-1 p-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                  placeholder="#2b49c5"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Highlighted Title Background Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={section?.content?.highlightedTitleBgColor || '#EEF2FF'}
                onChange={(e) => {
                  if (section) {
                    dispatch(updateSectionContent({
                      id: section.id,
                      content: { ...section.content, highlightedTitleBgColor: e.target.value }
                    }));
                  }
                }}
                className="w-10 h-10 rounded cursor-pointer border-0"
              />
              <input
                type="text"
                value={section?.content?.highlightedTitleBgColor || '#EEF2FF'}
                onChange={(e) => {
                  if (section) {
                    dispatch(updateSectionContent({
                      id: section.id,
                      content: { ...section.content, highlightedTitleBgColor: e.target.value }
                    }));
                  }
                }}
                className="flex-1 p-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                placeholder="#EEF2FF"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Highlighted Title Text Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={section?.content?.highlightedTitleColor || '#2b49c5'}
                onChange={(e) => {
                  if (section) {
                    dispatch(updateSectionContent({
                      id: section.id,
                      content: { ...section.content, highlightedTitleColor: e.target.value }
                    }));
                  }
                }}
                className="w-10 h-10 rounded cursor-pointer border-0"
              />
              <input
                type="text"
                value={section?.content?.highlightedTitleColor || '#2b49c5'}
                onChange={(e) => {
                  if (section) {
                    dispatch(updateSectionContent({
                      id: section.id,
                      content: { ...section.content, highlightedTitleColor: e.target.value }
                    }));
                  }
                }}
                className="flex-1 p-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                placeholder="#2b49c5"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Active Tab Editor */}
      <div className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Edit: {activeTab.label}</h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Label (Tab Title)</label>
              <input
                type="text"
                value={activeTab.label}
                onChange={(e) => updateActiveTab({ label: e.target.value })}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
                placeholder="e.g., RECHARGE PLAN"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
              <input
                type="text"
                value={activeTab.subtitle}
                onChange={(e) => updateActiveTab({ subtitle: e.target.value })}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
                placeholder="e.g., Monetization & Economy"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={activeTab.title}
                onChange={(e) => updateActiveTab({ title: e.target.value })}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
                placeholder="e.g., Wallet Recharge Plans"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={activeTab.description}
                onChange={(e) => updateActiveTab({ description: e.target.value })}
                rows={4}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                placeholder="Describe this admin feature..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={activeTab.image}
                  onChange={(e) => updateActiveTab({ image: e.target.value })}
                  className="flex-1 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="/Admin1.svg"
                />
                <button
                  onClick={handleImageUpload}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm shrink-0 cursor-pointer"
                >
                  <Upload size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Points */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Feature Points</h4>
          
          <div className="space-y-3">
            {activeTab.points.map((point, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={point}
                  onChange={(e) => handlePointChange(index, e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder={`Feature point ${index + 1}`}
                />
                <button
                  onClick={() => removePoint(index)}
                  className="p-2 text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2 mt-3">
            <input
              type="text"
              value={newPoint}
              onChange={(e) => setNewPoint(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addPoint()}
              className="flex-1 p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              placeholder="Add new feature point..."
            />
            <button
              onClick={addPoint}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-1 cursor-pointer"
            >
              <Plus size={16} />
              Add
            </button>
          </div>
        </div>

        {/* Layout Settings */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 mb-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Layout Settings</h4>
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">Content Layout</label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setLayout('left')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                  layout === 'left' 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                <AlignLeft size={18} />
                <span className="text-sm font-medium">Image Left</span>
              </button>
              <button
                onClick={() => setLayout('right')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                  layout === 'right' 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                <AlignRight size={18} />
                <span className="text-sm font-medium">Image Right</span>
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Choose how the image and content are arranged in the section
            </p>
          </div>
        </div>

        {/* Color Styling */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Color Styling</h4>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tab Label Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={sectionColors.labelColor}
                    onChange={(e) => setSectionColors(prev => ({ ...prev, labelColor: e.target.value }))}
                    className="w-10 h-10 rounded cursor-pointer border-0"
                  />
                  <input
                    type="text"
                    value={sectionColors.labelColor}
                    onChange={(e) => setSectionColors(prev => ({ ...prev, labelColor: e.target.value }))}
                    className="flex-1 p-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                    placeholder="#2b49c5"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={sectionColors.subtitleColor}
                    onChange={(e) => setSectionColors(prev => ({ ...prev, subtitleColor: e.target.value }))}
                    className="w-10 h-10 rounded cursor-pointer border-0"
                  />
                  <input
                    type="text"
                    value={sectionColors.subtitleColor}
                    onChange={(e) => setSectionColors(prev => ({ ...prev, subtitleColor: e.target.value }))}
                    className="flex-1 p-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                    placeholder="#2b49c5"
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={sectionColors.titleColor}
                    onChange={(e) => setSectionColors(prev => ({ ...prev, titleColor: e.target.value }))}
                    className="w-10 h-10 rounded cursor-pointer border-0"
                  />
                  <input
                    type="text"
                    value={sectionColors.titleColor}
                    onChange={(e) => setSectionColors(prev => ({ ...prev, titleColor: e.target.value }))}
                    className="flex-1 p-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                    placeholder="#111827"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={sectionColors.descriptionColor}
                    onChange={(e) => setSectionColors(prev => ({ ...prev, descriptionColor: e.target.value }))}
                    className="w-10 h-10 rounded cursor-pointer border-0"
                  />
                  <input
                    type="text"
                    value={sectionColors.descriptionColor}
                    onChange={(e) => setSectionColors(prev => ({ ...prev, descriptionColor: e.target.value }))}
                    className="flex-1 p-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                    placeholder="#6b7280"
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Points Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={sectionColors.pointsColor}
                  onChange={(e) => setSectionColors(prev => ({ ...prev, pointsColor: e.target.value }))}
                  className="w-10 h-10 rounded cursor-pointer border-0"
                />
                <input
                  type="text"
                  value={sectionColors.pointsColor}
                  onChange={(e) => setSectionColors(prev => ({ ...prev, pointsColor: e.target.value }))}
                  className="flex-1 p-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                  placeholder="#374151"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminEditor;
