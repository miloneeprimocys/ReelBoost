"use client";

import React, { useState, useRef, useMemo, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../../../hooks/reduxHooks";
import { 
  updateSectionContent,
  undoSection,
  redoSection,
  setEditingSection,
  selectSectionCanUndo,
  selectSectionCanRedo
} from "../../../store/builderSlice";
import { closeEditor } from "../../../store/editorSlice";
import { Trash2, Upload, Undo, Redo } from "lucide-react";
import { openImageModal } from "../../../store/modalSlice";
import ImageModal from "./ImageModal";
import Image from "next/image";

// Helper function to get the correct icon for Live Streaming and PK Battle sections
const getFeatureIcon = (sectionName: string, featureIndex: number) => {
  const name = sectionName?.toLowerCase() || '';
  const isLiveStreaming = name.includes('live streaming');
  const isPKBattle = name.includes('pk battle');
  
  if (isLiveStreaming) {
    if (featureIndex === 0) return '/list.svg';
    if (featureIndex === 1) return '/livestream.svg';
    return '/list.svg';
  }
  
  if (isPKBattle) {
    if (featureIndex === 0) return '/sword.svg';
    if (featureIndex === 1) return '/gift.svg';
    if (featureIndex === 2) return '/audience.svg';
    return '/sword.svg';
  }
  
  return '/default-icon.svg';
};

// Helper function to determine banner type from section
const getBannerType = (section: any): 'live-streaming' | 'pk-battle' | 'banner' => {
  if (!section) return 'banner';
  const name = section.name?.toLowerCase() || '';
  const id = section.id?.toLowerCase() || '';
  
  if (name.includes('live streaming') || id.includes('live-streaming') || id.startsWith('second-')) {
    return 'live-streaming';
  }
  if (name.includes('pk battle') || id.includes('pk-battle') || id.startsWith('third-')) {
    return 'pk-battle';
  }
  return 'banner';
};

// Helper to get default layout based on banner type
const getDefaultLayoutForType = (section: any): 'left' | 'right' => {
  const type = getBannerType(section);
  // Live Streaming: Content Left, Image Right (layout='right' means content on right? No wait - let's be consistent)
  // Actually looking at the reference code:
  // Live Streaming: layout='right' (from initialSections in builderSlice) - Image Left, Content Right
  // PK Battle: layout='left' - Image Right, Content Left
  return type === 'live-streaming' ? 'right' : 'left';
};

interface BannerContent {
  dotText?: string;
  dotColor?: string;
  dotTextColor?: string;
  title: string;
  subtitle?: string;
  description: string;
  features: Array<{
    title: string;
    description: string;
    icon: string;
  }>;
  backgroundImage?: string;
  backgroundColor?: string;
  layout: 'left' | 'right' | 'center';
  animation: 'none' | 'fade' | 'slide' | 'bounce';
  titleColor?: string;
  subtitleColor?: string;
  descriptionColor?: string;
  featureTitleColor?: string;
  featureDescriptionColor?: string;
}

const BannerEditor: React.FC = () => {
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<'text' | 'style' | 'image'>('text');
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Get editor state and section data directly from builderSlice only
  const { editingOverlay } = useAppSelector(state => state.editor);
  const builderSections = useAppSelector(state => state.builder?.sections || []);
  
  // Get section directly from builderSlice using editingOverlay.sectionId
  const section = useMemo(() => {
    if (!editingOverlay.sectionId) return null;
    
    console.log('BannerEditor - Looking for section in builderSlice:', {
      editingOverlayId: editingOverlay.sectionId,
      availableBuilderSections: builderSections.map(s => ({ id: s.id, type: s.type, name: s.name }))
    });
    
    // Find section in builderSlice only (bannerSlice is deprecated)
    const foundSection = builderSections.find(s => s.id === editingOverlay.sectionId);
    
    console.log('BannerEditor - Found section:', foundSection ? { 
      id: foundSection.id, 
      type: foundSection.type, 
      name: foundSection.name,
      hasContent: !!foundSection.content 
    } : null);
    
    // Create deep copy to prevent data swapping
    if (foundSection) {
      return JSON.parse(JSON.stringify(foundSection));
    }
    
    return null;
  }, [editingOverlay.sectionId, builderSections]);
  
  // Get banner type for this section
  const bannerType = useMemo(() => getBannerType(section), [section]);
  
  // Get undo/redo state from builderSlice section history
  const canUndo = useAppSelector(selectSectionCanUndo(section?.id || ''));
  const canRedo = useAppSelector(selectSectionCanRedo(section?.id || ''));
  
  // Set editing section ID when component mounts
  useEffect(() => {
    if (section?.id) {
      console.log('BannerEditor - setting editing section:', section.id);
      dispatch(setEditingSection({ sectionId: section.id, field: null }));
    }
    
    return () => {
      // Clear editing section when unmounting
      dispatch(setEditingSection({ sectionId: null, field: null }));
    };
  }, [section?.id, dispatch]);
  
  const handleUndo = React.useCallback(() => {
    if (section?.id) {
      console.log('BannerEditor - dispatching undoSection for:', section.id);
      dispatch(undoSection(section.id));
    }
  }, [section, dispatch]);
  
  const handleRedo = React.useCallback(() => {
    if (section?.id) {
      console.log('BannerEditor - dispatching redoSection for:', section.id);
      dispatch(redoSection(section.id));
    }
  }, [section, dispatch]);

  // Keyboard shortcuts for undo/redo
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle keyboard events when BannerEditor is active and has a section
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
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [canUndo, canRedo, handleUndo, handleRedo, section?.id]);
  
  // Ensure content is properly initialized with default values based on banner type
  const getDefaultLayout = () => {
    return getDefaultLayoutForType(section);
  };

  const defaultContent: BannerContent = {
    dotText: '',
    dotColor: '#a8aff5',
    dotTextColor: '#2b49c5',
    title: '',
    subtitle: '',
    description: '',
    features: [],
    backgroundImage: '',
    backgroundColor: '#ffffff',
    layout: getDefaultLayout(),
    animation: 'fade',
    titleColor: '#111827',
    subtitleColor: '#4B5563',
    descriptionColor: '#4B5563',
    featureTitleColor: '#111827',
    featureDescriptionColor: '#4B5563'
  };
  
  const [content, setContent] = useState<BannerContent>(() => {
    if (section?.content && Object.keys(section.content).length > 0) {
      console.log('BannerEditor - Using existing section content directly:', section.content);
      return JSON.parse(JSON.stringify({ ...defaultContent, ...section.content })) as BannerContent;
    }
    console.log('BannerEditor - Using default content for section type:', section?.type);
    return JSON.parse(JSON.stringify(defaultContent));
  });
  
  // Update content when section changes
  React.useEffect(() => {
    if (section) {
      console.log('BannerEditor - Section changed:', section.id, section.type, section.content);
      
      // If section has existing content, use that directly (no defaults)
      if (section?.content && Object.keys(section.content).length > 0) {
        const newContent = { ...defaultContent, ...section.content };
        // Ensure layout is set correctly based on section type
        if (!newContent.layout) {
          newContent.layout = getDefaultLayout();
        }
        console.log('BannerEditor - Using existing section content directly:', newContent);
        setContent(JSON.parse(JSON.stringify(newContent)) as BannerContent);
      } else {
        // Use default content based on section type
        console.log('BannerEditor - Using default content for section type:', section.type);
        const newContent = { ...defaultContent, layout: getDefaultLayout() };
        setContent(JSON.parse(JSON.stringify(newContent)) as BannerContent);
      }
    }
  }, [section?.id, section?.content, section?.type]); // Include section type for layout

  // Sync local content with Redux state changes (for undo/redo and real-time updates)
  React.useEffect(() => {
    if (section && section.content) {
      console.log('BannerEditor - Syncing content with Redux state:', section.content);
      const newContent = { ...defaultContent, ...section.content };
      if (!newContent.layout) {
        newContent.layout = getDefaultLayout();
      }
      setContent(JSON.parse(JSON.stringify(newContent)) as BannerContent);
    }
  }, [section?.content]); // Sync when section content changes in Redux

  const updateField = (field: keyof BannerContent, value: any) => {
    const updatedContent = { ...content, [field]: value };
    
    // Update local state immediately for responsive UI
    setContent(updatedContent);
    
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

  const handleImageUpload = (sectionId: string, field: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          updateField(field as keyof BannerContent, result);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleFeatureImageUpload = (featureIndex: number) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          const updatedFeatures = [...content.features];
          updatedFeatures[featureIndex].icon = result;
          updateField('features', updatedFeatures);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const addFeature = () => {
    const newFeature = {
      title: 'New Feature',
      description: 'Feature description goes here',
      icon: ''
    };
    const updatedFeatures = [...content.features, newFeature];
    
    // Just call updateField - it handles the Redux dispatch properly
    updateField('features', updatedFeatures);
  };

  const updateFeature = (index: number, field: 'title' | 'description' | 'icon', value: string) => {
    const updatedFeatures = [...content.features];
    updatedFeatures[index] = { ...updatedFeatures[index], [field]: value };
    
    // Just call updateField - it handles the Redux dispatch properly
    updateField('features', updatedFeatures);
  };

  const removeFeature = (index: number) => {
    const updatedFeatures = content.features.filter((_, i) => i !== index);
    
    // Just call updateField - it handles the Redux dispatch properly
    updateField('features', updatedFeatures);
  };


  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <h3 className="text-lg font-semibold text-gray-900">
          Banner Section Editor
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
            activeTab === 'text' 
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
          onClick={() => setActiveTab('text')}
        >
          Text Fields
        </button>
          <button
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'image' 
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
          onClick={() => setActiveTab('image')}
        >
          Images
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
        {/* Text Fields Tab */}
        {activeTab === 'text' && (
          <div className="space-y-4">
            {/* Dot Text */}
            <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
              <label className="block text-sm font-semibold text-gray-800 mb-2">Dot Text (above title)</label>
              <input
                type="text"
                value={content.dotText || ''}
                onChange={(e) => updateField('dotText', e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 text-sm"
                placeholder="Live Streaming"
              />
            </div>

            {/* Title */}
            <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
              <label className="block text-sm font-semibold text-gray-800 mb-2">Title</label>
              <input
                type="text"
                value={content.title}
                onChange={(e) => updateField('title', e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 text-sm"
                placeholder="Enter title"
              />
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
              <label className="block text-sm font-semibold text-gray-800 mb-2">Description</label>
              <textarea
                value={content.description}
                onChange={(e) => updateField('description', e.target.value)}
                rows={6}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm resize-none"
                placeholder="Enter description"
              />
            </div>

            {/* Features */}
            <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
              <label className="block text-sm font-semibold text-gray-800 mb-2">Features</label>
              <div className="space-y-3">
                {content.features?.map((feature, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-3">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Feature Title</label>
                        <input
                          type="text"
                          value={feature.title}
                          onChange={(e) => updateFeature(index, 'title', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                          placeholder="Feature title"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Feature Description</label>
                        <textarea
                          value={feature.description}
                          onChange={(e) => updateFeature(index, 'description', e.target.value)}
                          rows={3}
                          className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 resize-none"
                          placeholder="Feature description"
                        />
                      </div>
                      <div className="flex gap-2 -mt-2">
                        <button
                          onClick={() => removeFeature(index)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  onClick={addFeature}
                  className="w-full p-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors bg-gray-50 hover:bg-blue-50 text-sm"
                >
                  + Add Feature
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Style Tab */}
        {activeTab === 'style' && (
          <div className="space-y-4">
            {/* Layout & Animation */}
            <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Content Layout</label>
                <select
                  value={content.layout}
                  onChange={(e) => updateField('layout', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white text-sm"
                >
                  <option value="left">Content Left, Image Right</option>
                  <option value="right">Content Right, Image Left</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Animation</label>
                <select
                  value={content.animation}
                  onChange={(e) => updateField('animation', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white text-sm"
                >
                  <option value="none">None</option>
                  <option value="fade">Fade In</option>
                  <option value="slide">Slide In</option>
                  <option value="bounce">Bounce In</option>
                </select>
              </div>
            </div>

            {/* Colors */}
            <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
              <label className="block text-sm font-semibold text-gray-800 mb-3">Colors</label>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Dot Text Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={content.dotTextColor || '#2b49c5'}
                      onChange={(e) => updateField('dotTextColor', e.target.value)}
                      className="w-8 h-8 min-w-8 min-h-8 shrink-0 rounded cursor-pointer border-0 p-0"
                    />
                    <input
                      type="text"
                      value={content.dotTextColor || '#2b49c5'}
                      onChange={(e) => updateField('dotTextColor', e.target.value)}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-mono"
                      placeholder="#2b49c5"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Dot Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={content.dotColor || '#a8aff5'}
                      onChange={(e) => updateField('dotColor', e.target.value)}
                      className="w-8 h-8 min-w-8 min-h-8 shrink-0 rounded cursor-pointer border-0 p-0"
                    />
                    <input
                      type="text"
                      value={content.dotColor || '#a8aff5'}
                      onChange={(e) => updateField('dotColor', e.target.value)}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-mono"
                      placeholder="#a8aff5"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Title Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={content.titleColor || '#111827'}
                      onChange={(e) => updateField('titleColor', e.target.value)}
                      className="w-8 h-8 min-w-8 min-h-8 shrink-0 rounded cursor-pointer border-0 p-0"
                    />
                    <input
                      type="text"
                      value={content.titleColor || '#111827'}
                      onChange={(e) => updateField('titleColor', e.target.value)}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-mono"
                      placeholder="#111827"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Description Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={content.descriptionColor || '#4B5563'}
                      onChange={(e) => updateField('descriptionColor', e.target.value)}
                      className="w-8 h-8 min-w-8 min-h-8 shrink-0 rounded cursor-pointer border-0 p-0"
                    />
                    <input
                      type="text"
                      value={content.descriptionColor || '#4B5563'}
                      onChange={(e) => updateField('descriptionColor', e.target.value)}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-mono"
                      placeholder="#4B5563"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Feature Title Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={content.featureTitleColor || '#111827'}
                      onChange={(e) => updateField('featureTitleColor', e.target.value)}
                      className="w-8 h-8 min-w-8 min-h-8 shrink-0 rounded cursor-pointer border-0 p-0"
                    />
                    <input
                      type="text"
                      value={content.featureTitleColor || '#111827'}
                      onChange={(e) => updateField('featureTitleColor', e.target.value)}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-mono"
                      placeholder="#111827"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Feature Description Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={content.featureDescriptionColor || '#4B5563'}
                      onChange={(e) => updateField('featureDescriptionColor', e.target.value)}
                      className="w-8 h-8 min-w-8 min-h-8 shrink-0 rounded cursor-pointer border-0 p-0"
                    />
                    <input
                      type="text"
                      value={content.featureDescriptionColor || '#4B5563'}
                      onChange={(e) => updateField('featureDescriptionColor', e.target.value)}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-mono"
                      placeholder="#4B5563"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Image Background Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={content.backgroundColor || '#4A72FF'}
                      onChange={(e) => updateField('backgroundColor', e.target.value)}
                      className="w-8 h-8 min-w-8 min-h-8 shrink-0 rounded cursor-pointer border-0 p-0"
                    />
                    <input
                      type="text"
                      value={content.backgroundColor || '#4A72FF'}
                      onChange={(e) => updateField('backgroundColor', e.target.value)}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-mono"
                      placeholder="#4A72FF"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Images Tab */}
        {activeTab === 'image' && (
          <div className="space-y-4">
            {/* Background Image */}
            <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
              <label className="block text-sm font-semibold text-gray-800 mb-2">Background Image</label>
              <input
                type="text"
                value={content.backgroundImage || ''}
                onChange={(e) => updateField('backgroundImage', e.target.value)}
                placeholder="/banner.svg"
                className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              />
              {content.backgroundImage && content.backgroundImage !== '' && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 mt-2">
                  <img 
                    src={content.backgroundImage} 
                    alt="Banner background" 
                    className="w-12 h-12 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity shrink-0"
                    onClick={() => content.backgroundImage && dispatch(openImageModal({ imageSrc: content.backgroundImage, alt: 'Banner Background' }))}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 font-medium truncate">Banner Image</p>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{content.backgroundImage}</p>
                  </div>
                  <button
                    onClick={() => section && handleImageUpload(section.id, 'backgroundImage')}
                    className="ml-auto text-blue-600 hover:text-blue-700 text-sm hover:underline cursor-pointer shrink-0"
                    title="Change image"
                  >
                    Change
                  </button>
                </div>
              )}
            </div>

            {/* Feature Icons */}
            <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
              <label className="block text-sm font-semibold text-gray-800 mb-2">Feature Icons</label>
              <div className="space-y-2 max-h-96 overflow-x-hidden overflow-y-auto">
                {content.features?.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2 min-w-0">
                    <div className="flex-1 min-w-0">
                      <div className="flex gap-2 items-center min-w-0">
                        <input
                          type="text"
                          value={feature.icon}
                          onChange={(e) => updateFeature(index, 'icon', e.target.value)}
                          placeholder="/icon.svg"
                          className="flex-1 min-w-0 p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 truncate"
                        />
                        <button
                          onClick={() => handleFeatureImageUpload(index)}
                          className="p-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors shadow-sm shrink-0"
                          title="Upload icon"
                        >
                          <Upload size={16} />
                        </button>
                      </div>
                      {/* Icon Preview */}
                      {(feature.icon && feature.icon !== '') || getFeatureIcon(section?.name, index) ? (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 mt-2 min-w-0">
                          {feature.icon && feature.icon !== '' ? (
                            <img 
                              src={feature.icon} 
                              alt="Feature icon" 
                              className="w-12 h-12 object-contain rounded bg-white p-1 border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity shrink-0"
                              onClick={() => dispatch(openImageModal({ imageSrc: feature.icon, alt: 'Feature Icon' }))}
                            />
                          ) : getFeatureIcon(section?.name, index) ? (
                            <div className="w-12 h-12 bg-white rounded border border-gray-200 p-1 flex items-center justify-center shrink-0">
                              <Image 
                                src={getFeatureIcon(section.name, index)} 
                                alt="Feature icon" 
                                width={40} 
                                height={40}
                                className="object-contain"
                              />
                            </div>
                          ) : null}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-700 font-medium truncate">Icon Preview</p>
                            <p className="text-xs text-gray-500 mt-0.5 truncate">{feature.icon || getFeatureIcon(section?.name, index)}</p>
                          </div>
                          <button
                            onClick={() => handleFeatureImageUpload(index)}
                            className="ml-auto text-blue-600 hover:text-blue-700 text-sm hover:underline cursor-pointer shrink-0"
                            title="Change icon"
                          >
                            Change
                          </button>
                        </div>
                      ) : null}
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

export default BannerEditor;
