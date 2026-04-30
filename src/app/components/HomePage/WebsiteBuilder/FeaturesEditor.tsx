"use client";

import React, { useState, useRef, useMemo, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../../../hooks/reduxHooks";
import { 
  updateSectionContent,
  toggleBuilderMode,
  undoSection,
  redoSection,
  setEditingSection,
  selectSectionCanUndo,
  selectSectionCanRedo
} from "../../../store/builderSlice";
import { closeEditor } from "../../../store/editorSlice";
import { Plus, Trash2, Upload, GripVertical, Undo, Redo, ChevronUp, ChevronDown } from "lucide-react";
import { openImageModal } from "../../../store/modalSlice";
import ImageModal from "./ImageModal";
import Image from "next/image";

// Helper function to get default icons for features
const getDefaultFeatureIcon = (featureTitle: string) => {
  const title = featureTitle.toLowerCase();
  if (title.includes('video') || title.includes('short')) return '/video.svg';
  if (title.includes('notification')) return '/notification.svg';
  if (title.includes('chat') || title.includes('message')) return '/message.svg';
  if (title.includes('user') || title.includes('explore')) return '/user.svg';
  if (title.includes('live') || title.includes('streaming')) return '/liveB.svg';
  if (title.includes('battle') || title.includes('pk')) return '/Battle.svg';
  if (title.includes('upload')) return '/upload.svg';
  if (title.includes('share') || title.includes('social')) return '/share.svg';
  if (title.includes('comment')) return '/message.svg';
  if (title.includes('analytics') || title.includes('chart')) return '/chart.svg';
  if (title.includes('setting')) return '/settings.svg';
  return '/video.svg'; // Default fallback
};

interface Feature {
  id: string;
  title: string;
  description?: string;
  icon: string;
  backgroundImage: string;
}

interface Card {
  id: string;
  title: string;
  image: string;
  description: string;
  backgroundColor?: string;
}

const FeaturesEditor: React.FC = () => {
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<'features' | 'style' | 'cards'>('features');
  const [draggedItem, setDraggedItem] = useState<{ type: 'feature' | 'card', index: number } | null>(null);
  const [expandedFeatureId, setExpandedFeatureId] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Get editor state and section data directly from builderSlice only
  const { editingOverlay } = useAppSelector(state => state.editor);
  const builderSections = useAppSelector(state => state.builder?.sections || []);
  
  // Get section directly from builderSlice using editingOverlay.sectionId
  const section = useMemo(() => {
    if (!editingOverlay.sectionId) return null;
    
    // Find section in builderSlice only (featuresSlice is deprecated)
    const foundSection = builderSections.find(s => s.id === editingOverlay.sectionId);
    
    // Create deep copy to prevent data swapping
    if (foundSection) {
      return JSON.parse(JSON.stringify(foundSection));
    }
    
    return null;
  }, [editingOverlay.sectionId, builderSections]);
  
  // Get undo/redo state from builderSlice section history
  const canUndo = useAppSelector(selectSectionCanUndo(section?.id || ''));
  const canRedo = useAppSelector(selectSectionCanRedo(section?.id || ''));
  
  // Set editing section ID when component mounts
  useEffect(() => {
    if (section?.id) {
      dispatch(setEditingSection({ sectionId: section.id, field: null }));
    }
    
    return () => {
      // Clear editing section when unmounting
      dispatch(setEditingSection({ sectionId: null, field: null }));
    };
  }, [section?.id, dispatch]);
  
  const handleUndo = React.useCallback(() => {
    if (section?.id) {
      dispatch(undoSection(section.id));
    }
  }, [section, dispatch]);
  
  const handleRedo = React.useCallback(() => {
    if (section?.id) {
      dispatch(redoSection(section.id));
    }
  }, [section, dispatch]);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle keyboard events when FeaturesEditor is active and has a section
      if (!section?.id) return;

      // Check for Ctrl/Cmd + Z (undo)
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
        if (canUndo) handleUndo();
        return;
      }
      // Check for Ctrl/Cmd + Y (redo) or Ctrl/Cmd + Shift + Z (redo)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        e.stopPropagation();
        if (canRedo) handleRedo();
        return;
      }
    };
    
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [canUndo, canRedo, handleUndo, handleRedo, section?.id]);
  
  // Default content for Features section
  const defaultContent = {
    dotText: 'Main Features',
    title: 'Achieving More Through Digital Excellence',
    features: [],
    cards: [],
    backgroundColor: '#000000',
    textColor: '#ffffff',
    titleColor: '#ffffff',
    descriptionColor: '#ffffff',
    dotTextColor: '#ffffff',
    dotColor: '#a8aff5',
    cardTitleColor: '#000000',
    cardDescriptionColor: '#6B7280'
  };
  
  // Use section content from builderSlice
  const content = section?.content || defaultContent;
  
  // Local state for editing
  const [localContent, setLocalContent] = useState(() => ({
    ...defaultContent,
    ...content
  }));
  
  // Update local content when section changes
  useEffect(() => {
    if (section) {
      const newContent = { ...defaultContent, ...section.content };
      setLocalContent(newContent);
    }
  }, [section?.id, section?.content]);
  
  // Sync local content with Redux state changes (for undo/redo)
  useEffect(() => {
    if (section && section.content) {
      const newContent = { ...defaultContent, ...section.content };
      setLocalContent(newContent);
    }
  }, [section?.content]);

  // Set first feature as expanded when features change or component loads
  React.useEffect(() => {
    console.log('Expanded feature useEffect:', { 
      featuresLength: localContent.features.length, 
      expandedFeatureId,
      firstFeatureId: localContent.features[0]?.id 
    });
    
    if (localContent.features.length > 0 && !expandedFeatureId) {
      console.log('Setting expanded feature to:', localContent.features[0].id);
      setExpandedFeatureId(localContent.features[0].id);
    }
  }, [JSON.stringify(localContent.features.map((f: Feature) => f.id))]);

  const updateField = (field: string, value: any) => {
    const updatedContent = { ...localContent, [field]: value };
    
    // Update local state immediately for responsive UI
    setLocalContent(updatedContent);
    
    // Clear existing debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Debounce Redux dispatch - only send the changed field to builderSlice
    debounceTimerRef.current = setTimeout(() => {
      if (section?.id) {
        // Only dispatch the changed field to builderSlice
        const updatePayload = { [field]: value };
        dispatch(updateSectionContent({ id: section.id, content: updatePayload }));
      }
    }, 300);
  };
  
  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleImageUpload = (field: string, featureId?: string, cardId?: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          
          if (featureId) {
            // Update feature icon/background
            const featureIndex = localContent.features.findIndex((f: Feature) => f.id === featureId);
            if (featureIndex !== -1) {
              const updatedFeatures = [...localContent.features];
              updatedFeatures[featureIndex] = { 
                ...updatedFeatures[featureIndex], 
                [field]: result 
              };
              updateField('features', updatedFeatures);
            }
          } else if (cardId) {
            // Update card image
            const cardIndex = localContent.cards.findIndex((c: Card) => c.id === cardId);
            if (cardIndex !== -1) {
              const updatedCards = [...localContent.cards];
              updatedCards[cardIndex] = { 
                ...updatedCards[cardIndex], 
                image: result 
              };
              updateField('cards', updatedCards);
            }
          } else {
            // Update general field
            updateField(field, result);
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  
  const addNewFeature = () => {
    if (localContent.features.length < 6) {
      const demoFeatures = [
        { title: 'Video Upload', icon: '/upload.svg', backgroundImage: '/laptop.svg' },
        { title: 'Social Share', icon: '/share.svg', backgroundImage: '/laptop.svg' },
        { title: 'User Profile', icon: '/user.svg', backgroundImage: '/laptop.svg' },
        { title: 'Comments', icon: '/message.svg', backgroundImage: '/laptop.svg' },
        { title: 'Analytics', icon: '/chart.svg', backgroundImage: '/laptop.svg' },
        { title: 'Settings', icon: '/settings.svg', backgroundImage: '/laptop.svg' }
      ];
      
      const nextFeatureIndex = localContent.features.length;
      const demoFeature = demoFeatures[nextFeatureIndex] || demoFeatures[0];
      
      const newFeature = {
        id: `feature-${Date.now()}`,
        title: demoFeature.title,
        icon: demoFeature.icon,
        backgroundImage: demoFeature.backgroundImage
      };
      const updatedFeatures = [...localContent.features, newFeature];
      updateField('features', updatedFeatures);
      // Automatically expand the newly added feature
      setExpandedFeatureId(newFeature.id);
    }
  };

  const handleUpdateFeatureField = (featureId: string, field: string, value: string) => {
    const featureIndex = localContent.features.findIndex((f: any) => f.id === featureId);
    if (featureIndex !== -1) {
      const updatedFeatures = [...localContent.features];
      updatedFeatures[featureIndex] = { 
        ...updatedFeatures[featureIndex], 
        [field]: value 
      };
      updateField('features', updatedFeatures);
    }
  };

  const removeFeature = (featureId: string) => {
    const updatedFeatures = localContent.features.filter((f: Feature) => f.id !== featureId);
    updateField('features', updatedFeatures);
  };

  const updateCardField = (cardId: string, field: string, value: string) => {
    const cardIndex = localContent.cards.findIndex((c: Card) => c.id === cardId);
    if (cardIndex !== -1) {
      const updatedCards = [...localContent.cards];
      updatedCards[cardIndex] = { 
        ...updatedCards[cardIndex], 
        [field]: value 
      };
      updateField('cards', updatedCards);
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedItem({ type: 'feature', index });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (draggedItem && draggedItem.type === 'feature' && draggedItem.index !== dropIndex) {
      const draggedFeature = localContent.features[draggedItem.index];
      const updatedFeatures = [...localContent.features];
      
      // Remove from original position
      updatedFeatures.splice(draggedItem.index, 1);
      
      // Adjust drop index if necessary (since we removed an item)
      const adjustedDropIndex = draggedItem.index < dropIndex ? dropIndex - 1 : dropIndex;
      
      // Insert at new position
      updatedFeatures.splice(adjustedDropIndex, 0, draggedFeature);
      
      // Update local state immediately
      setLocalContent((prev: any) => ({ ...prev, features: updatedFeatures }));
      
      // Update section content in builderSlice
      if (section?.id) {
        dispatch(updateSectionContent({ id: section.id, content: { features: updatedFeatures } }));
      }
    }
    
    setDraggedItem(null);
    setDragOverIndex(null);
  };

  const handleDone = () => {
    if (section?.id) {
      // Final update to section content
      dispatch(updateSectionContent({ id: section.id, content: localContent }));
    }
    // Close editor and builder via Redux
    dispatch(closeEditor());
    dispatch(toggleBuilderMode());
    
    // Redirect to show the updated section - scroll directly to section
    setTimeout(() => {
      // Find and scroll to the updated section using the section ID directly
      const sectionElement = document.getElementById(section?.id || '');
      if (sectionElement) {
        sectionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 300);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <h3 className="text-lg font-semibold text-gray-900 whitespace-nowrap">
          Features Section Editor
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
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'features' 
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
          onClick={() => setActiveTab('features')}
        >
          Features
        </button>
         <button
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'cards' 
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
          onClick={() => setActiveTab('cards')}
        >
          Cards
        </button>
        <button
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'style' 
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
          onClick={() => setActiveTab('style')}
        >
          Style
        </button>
       
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Features Tab */}
        {activeTab === 'features' && (
          <div className="space-y-4">
        {/* Header Content */}
        <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Header Content</h4>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dot Text</label>
              <input
                type="text"
                value={localContent.dotText || ''}
                onChange={(e) => updateField('dotText', e.target.value)}
                className=" w-full  px-2 py-1.5  border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                placeholder="Main Features"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={localContent.title}
                onChange={(e) => updateField('title', e.target.value)}
                className=" w-full  px-2 py-1.5  border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                placeholder="Achieving More Through Digital Excellence"
              />
            </div>
          </div>
        </div>

        {/* Main Features (Max 6) */}
        <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
         <div className="flex items-center justify-between mb-4">
  <div>
    <h4 className="text-lg font-semibold text-gray-800 m-0">Main Features</h4>
    <p className="text-xs text-gray-500 ">(max 6)</p>
  </div>
  <button
    onClick={addNewFeature}
    disabled={localContent.features.length >= 6}
    className="p-1.5 px-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm flex items-center gap-1"
  >
    <Plus size={14} />
    Add Feature
  </button>
</div>
          <div className="space-y-4">
            {localContent.features.map((feature: any, index: number) => (
              <div 
                key={feature.id || `feature-${index}`} 
                className={`border border-gray-200 rounded-lg p-2 transition-all ${
                  dragOverIndex === index ? 'border-blue-400 bg-blue-50' : ''
                }`}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
              >
                <div className="flex items-center gap-2 mb-3">
                  <GripVertical className="text-gray-400 cursor-move" size={20} />
                  <button
                    onClick={() => setExpandedFeatureId(expandedFeatureId === feature.id ? null : feature.id)}
                    className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <span className="text-sm font-medium text-gray-600">{feature.title || 'Feature ' + (index + 1)}</span>
                  </button>
                  <div className="ml-auto flex items-center gap-1">
                   
                    <button
                      onClick={() => removeFeature(feature.id)}
                      className="p-1 text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                     <button
                      onClick={() => setExpandedFeatureId(expandedFeatureId === feature.id ? null : feature.id)}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                    >
                      {expandedFeatureId === feature.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>
                {expandedFeatureId === feature.id && (
                  <div className="space-y-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Feature Title</label>
                      <input
                        type="text"
                        value={feature.title}
                        onChange={(e) => handleUpdateFeatureField(feature.id, 'title', e.target.value)}
                        className=" w-full  px-2 py-1.5  border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                        placeholder="Enter feature title"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={feature.icon}
                          onChange={(e) => handleUpdateFeatureField(feature.id, 'icon', e.target.value)}
                          placeholder="/icon.svg"
                          className="flex-1 px-2 py-1.5  border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                        />
                        <button
                          onClick={() => handleImageUpload('icon', feature.id)}
                          className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                          title="Upload Icon"
                        >
                          <Upload size={16} />
                        </button>
                      </div>
                      {/* Icon Preview */}
                      {feature.id ? (
                        <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg border border-gray-200 mt-2">
                          {feature.icon && feature.icon !== '' ? (
                            <Image 
                              src={feature.icon} 
                              alt="Feature icon" 
                              width={32}
                              height={32}
                              className="w-8 h-8 object-contain rounded cursor-pointer hover:opacity-80 transition-opacity shrink-0"
                              onClick={() => dispatch(openImageModal({ imageSrc: feature.icon, alt: 'Feature Icon' }))}
                              onError={(e) => {
                                console.error('Icon failed to load:', feature.icon);
                                // If it's a file path that failed, try without the leading slash
                                if (feature.icon.startsWith('/')) {
                                  (e.target as HTMLImageElement).src = feature.icon.slice(1);
                                }
                              }}
                            />
                          ) : (
                            <div className="w-8 h-8 bg-white rounded border border-gray-200 p-1 flex items-center justify-center shrink-0">
                              <Image 
                                src={getDefaultFeatureIcon(feature.title)} 
                                alt="Feature icon" 
                                width={24} 
                                height={24}
                                className="object-contain"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-700 font-medium truncate">Feature Icon</p>
                            <p className="text-xs text-gray-500 mt-0.5 truncate">{feature.icon || 'No icon set'}</p>
                          </div>
                          <button
                            onClick={() => handleImageUpload('icon', feature.id)}
                            className="ml-auto text-blue-600 hover:text-blue-700 text-sm hover:underline cursor-pointer shrink-0"
                            title={feature.icon ? "Change icon" : "Upload icon"}
                          >
                            {feature.icon ? "Change" : "Upload"}
                          </button>
                        </div>
                      ) : null}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Background Image</label>
                      <input
                        type="text"
                        value={feature.backgroundImage || ''}
                        onChange={(e) => handleUpdateFeatureField(feature.id, 'backgroundImage', e.target.value)}
                        placeholder="/background.svg"
                        className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      />
                      {feature.backgroundImage && feature.backgroundImage !== '' && (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 mt-2">
                          <img 
                            src={feature.backgroundImage} 
                            alt="Feature background" 
                            className="w-8 h-8 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity shrink-0"
                            onClick={() => dispatch(openImageModal({ imageSrc: feature.backgroundImage, alt: 'Feature Background' }))}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-700 font-medium truncate">Feature Image</p>
                            <p className="text-xs text-gray-500 mt-0.5 truncate">{feature.backgroundImage}</p>
                          </div>
                          <button
                            onClick={() => handleImageUpload('backgroundImage', feature.id)}
                            className="ml-auto text-blue-600 hover:text-blue-700 text-sm hover:underline cursor-pointer shrink-0"
                            title="Change background image"
                          >
                            Change
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

        {/* Style Tab */}
        {activeTab === 'style' && (
          <div className="space-y-4">
            {/* Colors */}
            <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Colors</h4>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={localContent.backgroundColor || '#000000'}
                      onChange={(e) => updateField('backgroundColor', e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer border-0 shrink-0"
                    />
                    <input
                      type="text"
                      value={localContent.backgroundColor || '#000000'}
                      onChange={(e) => updateField('backgroundColor', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-mono"
                      placeholder="#000000"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Main Title Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={localContent.titleColor || '#ffffff'}
                      onChange={(e) => updateField('titleColor', e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer border-0 shrink-0"
                    />
                    <input
                      type="text"
                      value={localContent.titleColor || '#ffffff'}
                      onChange={(e) => updateField('titleColor', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-mono"
                      placeholder="#ffffff"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Feature Label Color</label>
                  <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={localContent.textColor || '#ffffff'}
                  onChange={(e) => updateField('textColor', e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer border-0"
                />
                <input
                  type="text"
                  value={localContent.textColor || '#ffffff'}
                  onChange={(e) => updateField('textColor', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-mono"
                  placeholder="#ffffff"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={localContent.descriptionColor || '#ffffff'}
                  onChange={(e) => updateField('descriptionColor', e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer border-0"
                />
                <input
                  type="text"
                  value={localContent.descriptionColor || '#ffffff'}
                  onChange={(e) => updateField('descriptionColor', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-mono"
                  placeholder="#ffffff"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dot Text Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={localContent.dotTextColor || '#FFFFFF'}
                  onChange={(e) => updateField('dotTextColor', e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer border-0"
                />
                <input
                  type="text"
                  value={localContent.dotTextColor || '#FFFFFF'}
                  onChange={(e) => updateField('dotTextColor', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-mono"
                  placeholder="#FFFFFF"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dot Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={localContent.dotColor || '#a8aff5'}
                  onChange={(e) => updateField('dotColor', e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer border-0"
                />
                <input
                  type="text"
                  value={localContent.dotColor || '#a8aff5'}
                  onChange={(e) => updateField('dotColor', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-mono"
                  placeholder="#a8aff5"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Card Title Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={localContent.cardTitleColor || '#000000'}
                  onChange={(e) => updateField('cardTitleColor', e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer border-0"
                />
                <input
                  type="text"
                  value={localContent.cardTitleColor || '#000000'}
                  onChange={(e) => updateField('cardTitleColor', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-mono"
                  placeholder="#000000"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Card Description Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={localContent.cardDescriptionColor || '#6B7280'}
                  onChange={(e) => updateField('cardDescriptionColor', e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer border-0"
                />
                <input
                  type="text"
                  value={localContent.cardDescriptionColor || '#6B7280'}
                  onChange={(e) => updateField('cardDescriptionColor', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-mono"
                  placeholder="#6B7280"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
        )}

        {/* Cards Tab */}
        {activeTab === 'cards' && (
          <div className="space-y-4">

            {/* Cards (7 compulsory cards) */}
            <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Cards (7 Compulsory Cards)</h4>
              <div className="space-y-4">
                {localContent.cards.map((card: Card, index: number) => (
                  <div key={card.id || `card-${index}`} className="border border-gray-200 rounded-lg p-2">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm font-bold text-black">Card {index + 1}</span>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Card Title</label>
                        <input
                          type="text"
                          value={card.title}
                          onChange={(e) => updateCardField(card.id, 'title', e.target.value)}
                          className=" w-full  px-2 py-1.5  border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                          placeholder="Enter card title"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Card Description</label>
                        <textarea
                          value={card.description}
                          onChange={(e) => updateCardField(card.id, 'description', e.target.value)}
                          rows={3}
                          className=" w-full  px-2 py-1.5  border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 resize-none"
                          placeholder="Enter card description"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Card Image</label>
                        <input
                          type="text"
                          value={card.image}
                          onChange={(e) => updateCardField(card.id, 'image', e.target.value)}
                          placeholder="/image.svg"
                          className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                        />
                        {card.image && card.image !== '' && (
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 mt-2">
                            <img 
                              src={card.image} 
                              alt="Card image" 
                              className="w-8 h-8 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity shrink-0"
                              onClick={() => dispatch(openImageModal({ imageSrc: card.image, alt: 'Card Image' }))}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-700 font-medium truncate">Card Image</p>
                              <p className="text-xs text-gray-500 mt-0.5 truncate">{card.image}</p>
                            </div>
                            <button
                              onClick={() => handleImageUpload('image', undefined, card.id)}
                              className="ml-auto text-blue-600 hover:text-blue-700 text-sm hover:underline cursor-pointer shrink-0"
                              title="Change image"
                            >
                              Change
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
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

export default FeaturesEditor;
