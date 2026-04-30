"use client";

import React, { useState, useMemo } from "react";
import { useAppSelector, useAppDispatch } from "../../../hooks/reduxHooks";
import { updateSectionContent, toggleBuilderMode, undo, redo, undoSection, redoSection, setEditingSection } from "../../../store/builderSlice";
import { closeEditor } from "../../../store/editorSlice";
import { selectCanUndo, selectCanRedo } from "../../../store/builderSlice";
import { Trash2, Upload, Plus, GripVertical, CheckCircle, AlignLeft, AlignRight, Undo, Redo } from "lucide-react";
import { openImageModal } from "../../../store/modalSlice";
import ImageModal from "./ImageModal";

interface AdminTabContent {
  id: string;
  label: string;
  subtitle: string;
  title: string;
  description: string;
  points: string[];
  image: string;
  imageDescription?: string;
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
  const [activeTab, setActiveTab] = useState<'text' | 'style' | 'image'>('text');

  // Get editor state from editorSlice
  const { editorSection } = useAppSelector(state => state.editor);
  const { editingOverlay } = useAppSelector(state => state.editor);
  const { sections: builderSections } = useAppSelector(state => state.builder);

  // Get undo/redo state
  const canUndo = useAppSelector(selectCanUndo);
  const canRedo = useAppSelector(selectCanRedo);

  // Use section-specific content from editorSection
  const section = useMemo(() => {
    if (!editingOverlay.sectionId) return null;

    // Find section in Redux store
    const foundSection = builderSections.find(s => s.id === editingOverlay.sectionId);

    // Create deep copy to prevent data swapping
    if (foundSection) {
      return JSON.parse(JSON.stringify(foundSection));
    }

    return null;
  }, [editingOverlay.sectionId, builderSections]);

  const handleUndo = React.useCallback(() => {
    if (section) {
      dispatch(undoSection(section.id));
    }
  }, [section, dispatch]);
  
  const handleRedo = React.useCallback(() => {
    if (section) {
      dispatch(redoSection(section.id));
    }
  }, [section, dispatch]);

  // Set editing section ID when component mounts
  React.useEffect(() => {
    if (section) {
      dispatch(setEditingSection({ sectionId: section.id, field: null }));
    }
  }, [section?.id]);

  // Keyboard shortcuts for undo/redo
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl/Cmd + Z (undo)
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) {
          handleUndo();
        }
      }
      // Check for Ctrl/Cmd + Y (redo) or Ctrl/Cmd + Shift + Z (redo)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        if (canRedo) {
          handleRedo();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, handleUndo, handleRedo]);

  // Get tabs from section content (for fifth section) or use empty array
  const getInitialTabs = (): AdminTabContent[] => {
    console.log('AdminEditor getInitialTabs:', {
      sectionId: section?.id,
      sectionContent: section?.content,
      hasTabs: !!section?.content?.tabs,
      tabsLength: section?.content?.tabs?.length
    });

    let loadedTabs: AdminTabContent[] = [];

    if (section?.content?.tabs && Array.isArray(section.content.tabs)) {
      console.log('Loading tabs from section.content.tabs:', section.content.tabs);
      loadedTabs = section.content.tabs;
    } else if (section?.id?.startsWith('fifth-')) {
      // Fallback: try to get from builderSections if it's a fifth section
      const fifthSection = builderSections.find(s => s.id === section.id);
      if (fifthSection?.content?.tabs && Array.isArray(fifthSection.content.tabs)) {
        console.log('Loading tabs from builderSections:', fifthSection.content.tabs);
        loadedTabs = fifthSection.content.tabs;
      }
    }

    // Ensure all tabs have required fields with default values
    if (loadedTabs.length > 0) {
      return loadedTabs.map((tab, index) => ({
        ...tab,
        subtitle: tab.subtitle || (index === 0 ? 'Feature Category' : 'Management'),
        title: tab.title || 'New Admin Feature',
        description: tab.description || 'Description for this admin feature goes here.',
        points: tab.points?.length > 0 ? tab.points : ['Feature point 1', 'Feature point 2'],
      }));
    }

    // Default: return 2 demo tabs
    console.log('Falling back to demoTabTemplates');
    return demoTabTemplates.map((t, i) => ({ ...t, id: `tab-${Date.now()}-${i}`, order: i + 1 }));
  };

  const [tabs, setTabs] = useState<AdminTabContent[]>(() => {
    const initialTabs = getInitialTabs();
    return initialTabs;
  });
  const [activeTabId, setActiveTabId] = useState<string | null>(() => {
    const initialTabs = getInitialTabs();
    return initialTabs[0]?.id || null;
  });
  const [expandedTabs, setExpandedTabs] = useState<Set<string>>(new Set());
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

  const activeTabData = tabs.find(t => t.id === activeTabId) || tabs[0];

  // Track the current section ID to detect when we're loading a new section
  const currentSectionIdRef = React.useRef<string | null>(null);

  // Update tabs when section changes (but preserve user edits during the same session)
  React.useEffect(() => {
    const sectionId = section?.id || null;

    console.log('AdminEditor useEffect triggered:', {
      currentSectionId: currentSectionIdRef.current,
      newSectionId: sectionId,
      isSectionChange: currentSectionIdRef.current !== sectionId
    });

    // Only reset tabs if we're loading a completely different section
    if (currentSectionIdRef.current !== sectionId) {
      console.log('AdminEditor useEffect - new section loaded:', sectionId);
      currentSectionIdRef.current = sectionId;

      if (sectionId) {
        const newTabs = getInitialTabs();
        console.log('AdminEditor useEffect - initializing tabs:', newTabs);
        setTabs(newTabs);
        if (newTabs.length > 0) {
          setActiveTabId(newTabs[0].id);
        }
      }
    } else {
      console.log('AdminEditor useEffect - same section, preserving current tabs');
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
  }, [section?.id]); // Only depend on section ID, not content changes

  // Update local state when section content changes (for undo/redo)
  React.useEffect(() => {
    if (section?.content && currentSectionIdRef.current === section?.id) {
      console.log('AdminEditor - updating local state from section content (undo/redo)');
      
      // Update tabs if they exist in section content
      if (section.content.tabs && Array.isArray(section.content.tabs)) {
        setTabs(section.content.tabs);
        // Maintain active tab if it still exists, otherwise select first
        const currentActiveTab = section.content.tabs.find((t: AdminTabContent) => t.id === activeTabId);
        if (currentActiveTab) {
          setActiveTabId(currentActiveTab.id);
        } else if (section.content.tabs.length > 0) {
          setActiveTabId(section.content.tabs[0].id);
        }
      }
      
      // Update section colors
      setSectionColors({
        labelColor: section.content?.labelColor || '#2b49c5',
        subtitleColor: section.content?.subtitleColor || '#2b49c5',
        titleColor: section.content?.titleColor || '#111827',
        descriptionColor: section.content?.descriptionColor || '#6b7280',
        pointsColor: section.content?.pointsColor || '#374151',
      });
      
      // Update layout
      setLayout(section.content?.layout || 'left');
    }
  }, [section?.content, activeTabId]); // Depend on content changes for undo/redo

  const updateActiveTab = (updates: Partial<AdminTabContent>) => {
    const updatedTabs = tabs.map(tab =>
      tab.id === activeTabId ? { ...tab, ...updates } : tab
    );
    setTabs(updatedTabs);

    // Also update the Redux store to enable undo/redo functionality
    if (section && section.content.tabs) {
      dispatch(updateSectionContent({
        id: section.id,
        content: { ...section.content, tabs: updatedTabs }
      }));
    }
  };

  const handlePointChange = (index: number, value: string) => {
    if (!activeTabData) return;
    const updatedPoints = [...activeTabData.points];
    updatedPoints[index] = value;
    updateActiveTab({ points: updatedPoints });
  };

  const addPoint = () => {
    if (!newPoint.trim() || !activeTabData) return;
    updateActiveTab({ points: [...activeTabData.points, newPoint.trim()] });
    setNewPoint("");
  };

  const removePoint = (index: number) => {
    if (!activeTabData) return;
    const updatedPoints = activeTabData.points.filter((_, i) => i !== index);
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
    const updatedTabs = [...tabs, newTab];
    setTabs(updatedTabs);
    setActiveTabId(newTab.id);

    // Update the Redux store
    if (section && section.content.tabs) {
      dispatch(updateSectionContent({
        id: section.id,
        content: { ...section.content, tabs: updatedTabs }
      }));
    }
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
      setActiveTabId(reorderedTabs[0]?.id || null);
    }

    // Remove from expanded tabs if it was expanded
    setExpandedTabs(prev => {
      const newExpanded = new Set(prev);
      newExpanded.delete(tabId);
      return newExpanded;
    });

    // Update the Redux store
    if (section && section.content.tabs) {
      dispatch(updateSectionContent({
        id: section.id,
        content: { ...section.content, tabs: reorderedTabs }
      }));
    }
  };

  const toggleTabExpansion = (tabId: string) => {
    setExpandedTabs(prev => {
      const newExpanded = new Set<string>();
      // If clicking on already open tab, close it
      // Otherwise, open only this tab
      if (!prev.has(tabId)) {
        newExpanded.add(tabId);
      }
      return newExpanded;
    });
  };

  const handleTabDragStart = (index: number) => {
    setDraggedTabIndex(index);
  };

  const handleTabDragEnter = (index: number) => {
    setDragOverTabIndex(index);
  };

  const handleTabDragEnd = () => {
    console.log('=== handleTabDragEnd called ===');
    console.log('draggedTabIndex:', draggedTabIndex, 'dragOverTabIndex:', dragOverTabIndex);
    console.log('Current tabs before reorder:', tabs.map(t => ({ id: t.id, label: t.label, order: t.order })));

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

      console.log('Tabs after reorder:', updatedTabs.map(t => ({ id: t.id, label: t.label, order: t.order })));
      setTabs(updatedTabs);
      console.log('Tabs reordered and state updated:', updatedTabs.map(t => ({ label: t.label, order: t.order })));

      // Update the Redux store
      if (section && section.content.tabs) {
        dispatch(updateSectionContent({
          id: section.id,
          content: { ...section.content, tabs: updatedTabs }
        }));
      }
    }

    setDraggedTabIndex(-1);
    setDragOverTabIndex(-1);
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

  if (!activeTabData) {
    return (
      <div className="p-6 bg-gray-50 min-h-full">
        <p className="text-gray-500">No tabs available. Click "Add Tab" to create one.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <h3 className="text-lg font-semibold text-gray-900 whitespace-nowrap">
          Admin Panel Editor
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handleUndo}
            disabled={!canUndo}
            className="p-2 rounded-lg border border-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-300"
            title="Undo (Ctrl+Z)"
          >
            <Undo size={16} className="text-gray-600" />
          </button>
          <button
            onClick={handleRedo}
            disabled={!canRedo}
            className="p-2 rounded-lg border border-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-300"
            title="Redo (Ctrl+Y)"
          >
            <Redo size={16} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white">
        <button
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'text'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
              : 'text-gray-600 hover:text-gray-900'
            }`}
          onClick={() => setActiveTab('text')}
        >
          Text Fields
        </button>
        <button
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'style'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
              : 'text-gray-600 hover:text-gray-900'
            }`}
          onClick={() => setActiveTab('style')}
        >
          Style
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Text Fields Tab */}
        {activeTab === 'text' && (
          <div className="space-y-4 p-3">
            {/* Header Section */}
            <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Header Section</h4>

              <div className="space-y-4 ">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Main Title</label>
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
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm"
                    placeholder="e.g., Describing"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Highlighted Title</label>
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
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm"
                    placeholder="e.g., Admin Panel"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Header Subtitle</label>
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
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm"
                    placeholder="e.g., Admin Panel Features"
                  />
                </div>
              </div>
            </div>


            {/* Tab Management - Accordion Style */}
            <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-gray-800">Manage Tabs</h4>
                  {/* Light shade sub-text */}
                  <span className="text-sm text-gray-400 font-normal ">(max 6)</span>
                </div>

                <button
                  onClick={addNewTab}
                  // Disable the button functionality when limit is reached
                  disabled={tabs.length >= 6}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-sm
                    ${tabs.length >= 6
                      ? "bg-green-600/50 text-white/70 cursor-not-allowed" // Faded state
                      : "bg-green-600 text-white hover:bg-green-700 cursor-pointer" // Active state
                    }`}
                >
                  <Plus size={16} />
                  <span>Add Tab</span>
                </button>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto overflow-x-hidden hide-scrollbar">
                {tabs.map((tab, index) => (
                  <div
                    key={tab.id}
                    className={`border rounded-lg transition-all ${expandedTabs.has(tab.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    {/* Tab Header */}
                    <div
                      className="flex items-center justify-between p-3 cursor-pointer"
                      onClick={() => toggleTabExpansion(tab.id)}
                    >
                      <div className="flex items-center gap-3">
                        {/* Drag handle on the left */}
                        <div
                          className="cursor-move text-gray-400 hover:text-gray-600"
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.effectAllowed = 'move';
                            handleTabDragStart(index);
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.dataTransfer.dropEffect = 'move';
                            handleTabDragEnter(index);
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            handleTabDragEnd();
                          }}
                          onDragEnd={handleTabDragEnd}
                        >
                          <GripVertical size={16} />
                        </div>

                        {/* Tab label */}
                        <span className="font-medium text-gray-800">
                          {tab.label || 'Untitled Tab'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Trash icon on the right */}
                        {tabs.length > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeTab(tab.id);
                            }}
                            className="text-red-500 hover:text-red-700 transition-colors p-1"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}

                        {/* Chevron for accordion */}
                        <div className={`transition-transform ${expandedTabs.has(tab.id) ? 'rotate-180' : ''
                          }`}>
                          <svg  width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2">
                            <path d="M6 9l6 6 6-6" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Tab Content - Expanded */}
                    {expandedTabs.has(tab.id) && (
                      <div className="p-2 border-t border-gray-200 bg-white">
                        <div className="space-y-4 p-1">
                          {/* Tab Label */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tab Label</label>
                            <input
                              type="text"
                              value={tab.label || ''}
                              onChange={(e) => {
                                const updatedTabs = tabs.map(t =>
                                  t.id === tab.id ? { ...t, label: e.target.value } : t
                                );
                                setTabs(updatedTabs);
                                if (section && section.content.tabs) {
                                  dispatch(updateSectionContent({
                                    id: section.id,
                                    content: { ...section.content, tabs: updatedTabs }
                                  }));
                                }
                              }}
                              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm"
                              placeholder="e.g., NEW TAB"
                            />
                          </div>

                          {/* Subtitle */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                            <input
                              type="text"
                              value={tab.subtitle || ''}
                              onChange={(e) => {
                                const updatedTabs = tabs.map(t =>
                                  t.id === tab.id ? { ...t, subtitle: e.target.value } : t
                                );
                                setTabs(updatedTabs);
                                if (section && section.content.tabs) {
                                  dispatch(updateSectionContent({
                                    id: section.id,
                                    content: { ...section.content, tabs: updatedTabs }
                                  }));
                                }
                              }}
                              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm"
                              placeholder="e.g., Feature Category"
                            />
                          </div>

                          {/* Title */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                            <input
                              type="text"
                              value={tab.title || ''}
                              onChange={(e) => {
                                const updatedTabs = tabs.map(t =>
                                  t.id === tab.id ? { ...t, title: e.target.value } : t
                                );
                                setTabs(updatedTabs);
                                if (section && section.content.tabs) {
                                  dispatch(updateSectionContent({
                                    id: section.id,
                                    content: { ...section.content, tabs: updatedTabs }
                                  }));
                                }
                              }}
                              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm"
                              placeholder="e.g., New Admin Feature"
                            />
                          </div>

                          {/* Description */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                              value={tab.description || ''}
                              onChange={(e) => {
                                const updatedTabs = tabs.map(t =>
                                  t.id === tab.id ? { ...t, description: e.target.value } : t
                                );
                                setTabs(updatedTabs);
                                if (section && section.content.tabs) {
                                  dispatch(updateSectionContent({
                                    id: section.id,
                                    content: { ...section.content, tabs: updatedTabs }
                                  }));
                                }
                              }}
                              rows={3}
                              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm resize-none"
                              placeholder="Description for this admin feature goes here."
                            />
                          </div>

                          {/* Feature Points */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Feature Points</label>
                            <div className="space-y-2 max-h-32 overflow-y-auto">
                              {tab.points?.map((point: string, pointIndex: number) => (
                                <div key={pointIndex} className="flex gap-2">
                                  <input
                                    type="text"
                                    value={point}
                                    onChange={(e) => {
                                      const updatedPoints = [...tab.points];
                                      updatedPoints[pointIndex] = e.target.value;
                                      const updatedTabs = tabs.map(t =>
                                        t.id === tab.id ? { ...t, points: updatedPoints } : t
                                      );
                                      setTabs(updatedTabs);
                                      if (section && section.content.tabs) {
                                        dispatch(updateSectionContent({
                                          id: section.id,
                                          content: { ...section.content, tabs: updatedTabs }
                                        }));
                                      }
                                    }}
                                    className="flex-1 p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                  />
                                  <button
                                    onClick={() => {
                                      const updatedPoints = tab.points.filter((_, i) => i !== pointIndex);
                                      const updatedTabs = tabs.map(t =>
                                        t.id === tab.id ? { ...t, points: updatedPoints } : t
                                      );
                                      setTabs(updatedTabs);
                                      if (section && section.content.tabs) {
                                        dispatch(updateSectionContent({
                                          id: section.id,
                                          content: { ...section.content, tabs: updatedTabs }
                                        }));
                                      }
                                    }}
                                    className="p-1 text-red-500 hover:bg-red-50 rounded cursor-pointer"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              ))}
                            </div>
                            <div className="flex gap-2 mt-2">
                              <input
                                type="text"
                                value={newPoint}
                                onChange={(e) => setNewPoint(e.target.value)}
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter' && newPoint.trim()) {
                                    const updatedPoints = [...tab.points, newPoint.trim()];
                                    const updatedTabs = tabs.map(t =>
                                      t.id === tab.id ? { ...t, points: updatedPoints } : t
                                    );
                                    setTabs(updatedTabs);
                                    setNewPoint("");
                                    if (section && section.content.tabs) {
                                      dispatch(updateSectionContent({
                                        id: section.id,
                                        content: { ...section.content, tabs: updatedTabs }
                                      }));
                                    }
                                  }
                                }}
                                className="flex-1 p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                placeholder="Add new point..."
                              />
                              <button
                                onClick={() => {
                                  if (newPoint.trim()) {
                                    const updatedPoints = [...tab.points, newPoint.trim()];
                                    const updatedTabs = tabs.map(t =>
                                      t.id === tab.id ? { ...t, points: updatedPoints } : t
                                    );
                                    setTabs(updatedTabs);
                                    setNewPoint("");
                                    if (section && section.content.tabs) {
                                      dispatch(updateSectionContent({
                                        id: section.id,
                                        content: { ...section.content, tabs: updatedTabs }
                                      }));
                                    }
                                  }
                                }}
                                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                              >
                                Add
                              </button>
                            </div>
                          </div>

                          {/* Tab Image Upload */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tab Image</label>
                            <div className="space-y-3">
                              <input
                                  type="text"
                                  value={tab.image || ''}
                                  onChange={(e) => {
                                    const updatedTabs = tabs.map(t =>
                                      t.id === tab.id ? { ...t, image: e.target.value } : t
                                    );
                                    setTabs(updatedTabs);
                                    if (section && section.content.tabs) {
                                      dispatch(updateSectionContent({
                                        id: section.id,
                                        content: { ...section.content, tabs: updatedTabs }
                                      }));
                                    }
                                  }}
                                  placeholder="/Admin1.svg"
                                  className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                />
                          
                                {tab.image && tab.image !== '' && (
                                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border mt-2">
                                    <img 
                                      src={tab.image} 
                                      alt="Tab image" 
                                      className="w-12 h-12 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                                      onClick={() => dispatch(openImageModal({ imageSrc: tab.image, alt: 'Tab Image' }))}
                                    />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm text-gray-700 font-medium truncate">Tab Image</p>
                                      <p className="text-xs text-gray-500 mt-0.5 truncate">{tab.imageDescription || 'No description set'}</p>
                                    </div>
                                    <button
                                      onClick={() => {
                                        const input = document.createElement('input');
                                        input.type = 'file';
                                        input.accept = 'image/*';
                                        input.onchange = (e) => {
                                          const file = (e.target as HTMLInputElement).files?.[0];
                                          if (file) {
                                            const reader = new FileReader();
                                            reader.onload = (e) => {
                                              const result = e.target?.result as string;
                                              const updatedTabs = tabs.map(t =>
                                                t.id === tab.id ? { ...t, image: result } : t
                                              );
                                              setTabs(updatedTabs);
                                              if (section && section.content.tabs) {
                                                dispatch(updateSectionContent({
                                                  id: section.id,
                                                  content: { ...section.content, tabs: updatedTabs }
                                                }));
                                              }
                                            };
                                            reader.readAsDataURL(file);
                                          }
                                        };
                                        input.click();
                                      }}
                                      className="ml-auto text-blue-600 hover:text-blue-700 text-sm hover:underline cursor-pointer"
                                      title="Change image"
                                    >
                                      Change
                                    </button>
                                  </div>
                                )}
                            </div>
                          </div>

                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Style Tab */}
        {activeTab === 'style' && (
          <div className="space-y-4 p-3">
            {/* Header Colors */}
            <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Header Colors</h4>

              <div className="space-y-4 ">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Header Subtitle Color</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Highlighted Title Color</label>
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Highlighted Title Background</label>
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
              </div>
            </div>

            {/* Tab Colors */}
            <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Tab Content Colors</h4>

              <div className="space-y-4 ">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Active Label Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={section?.content?.labelColor || '#2b49c5'}
                      onChange={(e) => {
                        if (section) {
                          dispatch(updateSectionContent({
                            id: section.id,
                            content: { ...section.content, labelColor: e.target.value }
                          }));
                        }
                      }}
                      className="w-10 h-10 rounded cursor-pointer border-0"
                    />
                    <input
                      type="text"
                      value={section?.content?.labelColor || '#2b49c5'}
                      onChange={(e) => {
                        if (section) {
                          dispatch(updateSectionContent({
                            id: section.id,
                            content: { ...section.content, labelColor: e.target.value }
                          }));
                        }
                      }}
                      className="flex-1 p-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                      placeholder="#2b49c5"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={section?.content?.titleColor || '#111827'}
                      onChange={(e) => {
                        if (section) {
                          dispatch(updateSectionContent({
                            id: section.id,
                            content: { ...section.content, titleColor: e.target.value }
                          }));
                        }
                      }}
                      className="w-10 h-10 rounded cursor-pointer border-0"
                    />
                    <input
                      type="text"
                      value={section?.content?.titleColor || '#111827'}
                      onChange={(e) => {
                        if (section) {
                          dispatch(updateSectionContent({
                            id: section.id,
                            content: { ...section.content, titleColor: e.target.value }
                          }));
                        }
                      }}
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
                      value={section?.content?.descriptionColor || '#6b7280'}
                      onChange={(e) => {
                        if (section) {
                          dispatch(updateSectionContent({
                            id: section.id,
                            content: { ...section.content, descriptionColor: e.target.value }
                          }));
                        }
                      }}
                      className="w-10 h-10 rounded cursor-pointer border-0"
                    />
                    <input
                      type="text"
                      value={section?.content?.descriptionColor || '#6b7280'}
                      onChange={(e) => {
                        if (section) {
                          dispatch(updateSectionContent({
                            id: section.id,
                            content: { ...section.content, descriptionColor: e.target.value }
                          }));
                        }
                      }}
                      className="flex-1 p-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                      placeholder="#6b7280"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Points Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={section?.content?.pointsColor || '#374151'}
                    onChange={(e) => {
                      if (section) {
                        dispatch(updateSectionContent({
                          id: section.id,
                          content: { ...section.content, pointsColor: e.target.value }
                        }));
                      }
                    }}
                    className="w-10 h-10 rounded cursor-pointer border-0"
                  />
                  <input
                    type="text"
                    value={section?.content?.pointsColor || '#374151'}
                    onChange={(e) => {
                      if (section) {
                        dispatch(updateSectionContent({
                          id: section.id,
                          content: { ...section.content, pointsColor: e.target.value }
                        }));
                      }
                    }}
                    className="flex-1 p-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                    placeholder="#374151"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Point's Icon Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={section?.content?.subtitleColor || '#2b49c5'}
                    onChange={(e) => {
                      if (section) {
                        dispatch(updateSectionContent({
                          id: section.id,
                          content: { ...section.content, subtitleColor: e.target.value }
                        }));
                      }
                    }}
                    className="w-10 h-10 rounded cursor-pointer border-0"
                  />
                  <input
                    type="text"
                    value={section?.content?.subtitleColor || '#2b49c5'}
                    onChange={(e) => {
                      if (section) {
                        dispatch(updateSectionContent({
                          id: section.id,
                          content: { ...section.content, subtitleColor: e.target.value }
                        }));
                      }
                    }}
                    className="flex-1 p-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                    placeholder="#2b49c5"
                  />
                </div>
              </div>
            </div>


            {/* Layout */}
            <div className="p-4">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Image Layout</h4>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    if (section) {
                      dispatch(updateSectionContent({
                        id: section.id,
                        content: { ...section.content, layout: 'left' }
                      }));
                    }
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 px-2 py-3 rounded-lg border-2 transition-all ${section?.content?.layout === 'left'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                    }`}
                >
                  <AlignLeft size={18} />
                  <span className="text-sm font-medium">Image Left</span>
                </button>
                <button
                  onClick={() => {
                    if (section) {
                      dispatch(updateSectionContent({
                        id: section.id,
                        content: { ...section.content, layout: 'right' }
                      }));
                    }
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 px-2 py-3 rounded-lg border-2 transition-all ${section?.content?.layout === 'right'
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
        )}
      </div>
      
      {/* Image Modal */}
      <ImageModal />
    </div>
  );
};

export default AdminEditor;
