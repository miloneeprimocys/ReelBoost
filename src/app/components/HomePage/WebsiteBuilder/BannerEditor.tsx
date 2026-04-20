"use client";

import React, { useState, useRef, useMemo, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../../../hooks/reduxHooks";
import { 
  updateBannerContent, 
  addBannerFeature, 
  updateBannerFeature, 
  deleteBannerFeature,
  setActiveBannerSection
} from "../../../store/bannerSlice";
import { 
  updateSectionContent,
  toggleBuilderMode,
  undo,
  redo,
  undoSection,
  redoSection,
  setEditingSection
} from "../../../store/builderSlice";
import { closeEditor } from "../../../store/editorSlice";
import { selectCanUndo, selectCanRedo } from "../../../store/builderSlice";
import { Trash2, Upload, Plus, X, Undo, Redo } from "lucide-react";
import { openImageModal } from "../../../store/modalSlice";
import ImageModal from "./ImageModal";
import HeroImage from "../../../../../public/third.svg";
import Audience from "../../../../../public/audience.svg";
import Gift from "../../../../../public/gift.svg";
import Sword from "../../../../../public/sword.svg";
import list from "../../../../../public/list.svg";
import live from "../../../../../public/livestream.svg";
import second from "../../../public/second.svg";
import Image from "next/image";

// Helper function to get the correct icon for Second and Third sections
const getFeatureIcon = (sectionType: string, featureIndex: number) => {
  if (sectionType === 'second') {
    if (featureIndex === 0) return '/list.svg';
    if (featureIndex === 1) return '/livestream.svg';
    if (featureIndex === 2) return '/video.svg';
  }
  
  if (sectionType === 'third') {
    if (featureIndex === 0) return '/sword.svg';
    if (featureIndex === 1) return '/gift.svg';
    if (featureIndex === 2) return '/audience.svg';
    if (featureIndex === 3) return '/crown.svg';
  }
  
  return '/default-icon.svg'; // Fallback icon
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
  const isUpdatingFromRedux = useRef(false);
  
  // Get editor state and section data directly
  const { editingOverlay } = useAppSelector(state => state.editor);
  const bannerSections = useAppSelector(state => state.banner?.sections || []);
  const builderSections = useAppSelector(state => state.builder?.sections || []);
  
  // Helper function to get default layout based on section name
  const getDefaultLayout = (sectionName?: string) => {
    if (!sectionName) return 'left';
    const name = sectionName.toLowerCase();
    if (name.includes('live streaming')) {
      return 'left';
    }
    if (name.includes('pk battle')) {
      return 'right';
    }
    return 'left';
  };
  
  // Default content for fallback
  const defaultContent: BannerContent = {
    dotText: 'Live Streaming',
    title: 'Start video, interact with your user.',
    description: 'Start live streaming to connect with your audience in real time, where viewers can comment, like, stream, and send virtual gifts to show their support.',
    features: [
      {
        title: 'List of Live Streamers',
        description: 'You can check the list of live streamers, and can view likes and audience connected to the stream',
        icon: '/list.svg'
      },
      {
        title: 'Live Streaming Interaction',
        description: 'Viewers can comment, send virtual gifts, like the stream, and follow the streamer to stay connected.',
        icon: '/livestream.svg'
      }
    ],
    backgroundImage: '/second.svg',
    backgroundColor: '#ffffff',
    layout: 'left' as const,
    animation: 'fade',
    titleColor: '#111827',
    subtitleColor: '#4B5563',
    descriptionColor: '#4B5563',
    featureTitleColor: '#111827',
    featureDescriptionColor: '#4B5563'
  };
  
  const [localContent, setLocalContent] = useState<BannerContent>(defaultContent);
  
  // Get section directly from Redux store using editingOverlay.sectionId
  const section = useMemo(() => {
    if (!editingOverlay.sectionId) return null;
    
    console.log('BannerEditor - Looking for section:', {
      editingOverlayId: editingOverlay.sectionId,
      editingOverlayType: editingOverlay.sectionType,
      availableBannerSections: bannerSections.map(s => ({ id: s.id, type: s.type })),
      availableBuilderSections: builderSections.map(s => ({ id: s.id, type: s.type }))
    });
    
    // Find section in Redux store - prioritize builderSections
    const foundSection = builderSections.find(s => s.id === editingOverlay.sectionId) || 
                         bannerSections.find(s => s.id === editingOverlay.sectionId);
    
    console.log('BannerEditor - Found section:', foundSection ? { id: foundSection.id, type: foundSection.type, hasContent: !!foundSection.content } : null);
    
    // Create deep copy to prevent data swapping
    if (foundSection) {
      return JSON.parse(JSON.stringify(foundSection));
    }
    
    return null;
  }, [editingOverlay.sectionId, editingOverlay.sectionType, bannerSections, builderSections]);
  
  // Get current activeBannerSection at component level (not in event handlers)
  const activeBannerSection = useAppSelector(state => state.banner.activeSection);
  
  // Get undo/redo state
  const canUndo = useAppSelector(selectCanUndo);
  const canRedo = useAppSelector(selectCanRedo);
  
  // Set editing section ID when component mounts (all banner sections are now in builderSlice)
  React.useEffect(() => {
    console.log('BannerEditor setEditingSection useEffect:', {
      sectionId: section?.id,
      hasSection: !!section
    });
    
    if (section) {
      console.log('BannerEditor - setting editing section:', section.id);
      dispatch(setEditingSection({ sectionId: section.id, field: null }));
    }
  }, [section?.id]);
  
  const handleUndo = React.useCallback(() => {
    console.log('BannerEditor handleUndo called:', {
      sectionId: section?.id,
      hasSection: !!section
    });
    if (section) {
      console.log('BannerEditor - dispatching undoSection for:', section.id);
      dispatch(undoSection(section.id));
    } else {
      console.log('BannerEditor - handleUndo: no section found');
    }
  }, [section, dispatch]);
  
  const handleRedo = React.useCallback(() => {
    console.log('BannerEditor handleRedo called:', {
      sectionId: section?.id,
      hasSection: !!section
    });
    if (section) {
      console.log('BannerEditor - dispatching redoSection for:', section.id);
      dispatch(redoSection(section.id));
    } else {
      console.log('BannerEditor - handleRedo: no section found');
    }
  }, [section, dispatch]);

  // Keyboard shortcuts for undo/redo
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle keyboard events when BannerEditor is active and has a section
      if (!section) {
        return;
      }

      console.log('BannerEditor ANY keyboard event detected:', {
        key: e.key,
        ctrlKey: e.ctrlKey,
        metaKey: e.metaKey,
        shiftKey: e.shiftKey,
        canUndo,
        canRedo,
        sectionId: section?.id,
        target: (e.target as HTMLElement)?.tagName,
        targetInput: (e.target as HTMLElement)?.tagName === 'INPUT' || (e.target as HTMLElement)?.tagName === 'TEXTAREA'
      });
      
      // Check for Ctrl/Cmd + Z (undo)
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
        console.log('BannerEditor - undo triggered, canUndo:', canUndo);
        if (canUndo) {
          console.log('BannerEditor - calling handleUndo');
          handleUndo();
        } else {
          console.log('BannerEditor - undo not available');
        }
        return;
      }
      // Check for Ctrl/Cmd + Y (redo) or Ctrl/Cmd + Shift + Z (redo)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        e.stopPropagation();
        console.log('BannerEditor - redo triggered, canRedo:', canRedo);
        if (canRedo) {
          console.log('BannerEditor - calling handleRedo');
          handleRedo();
        } else {
          console.log('BannerEditor - redo not available');
        }
        return;
      }
    };
    
    console.log('BannerEditor - Adding keyboard event listener to document');
    // Use document level event listener with capture to ensure it catches events
    document.addEventListener('keydown', handleKeyDown, true);
    return () => {
      console.log('BannerEditor - Removing keyboard event listener from document');
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [canUndo, canRedo, handleUndo, handleRedo, section?.id]);
  
  // Sync local state with Redux when section ID changes (not content changes)
  useEffect(() => {
    if (section?.content && Object.keys(section.content).length > 0) {
      console.log('BannerEditor - Syncing local state with Redux (section ID change):', section.content);
      // Use section name to determine layout
      const layout = getDefaultLayout(section.name);
      setLocalContent({ ...defaultContent, ...section.content, layout });
    } else if (section) {
      // Section exists but has no content, use defaults with section-based layout
      const layout = getDefaultLayout(section.name);
      setLocalContent({ ...defaultContent, layout });
    }
  }, [section?.id]); // Only depend on section ID, not content
  
  // Use local state for inputs
  const content = localContent;

  const updateField = (field: keyof BannerContent, value: any) => {
    console.log('=== BannerEditor updateField START ===');
    console.log('Field:', field, 'Value:', value);
    
    // Update local state immediately for responsive UI
    const updatedContent = { ...localContent, [field]: value };
    setLocalContent(updatedContent);
    
    // Clear existing debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Debounce Redux dispatch - only send the changed field
    debounceTimerRef.current = setTimeout(() => {
      console.log('DISPATCHING to Redux after debounce');
      if (section) {
        console.log('Section ID:', section.id, 'Type:', section.type, 'Field:', field);
        // Only dispatch the changed field, not the entire content object
        const updatePayload = { [field]: value };
        console.log('DISPATCHING to builderSlice - updateSectionContent with payload:', updatePayload);
        dispatch(updateSectionContent({ id: section.id, content: updatePayload }));
      }
    }, 300);
    
    console.log('=== BannerEditor updateField END ===');
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
                      {(feature.icon && feature.icon !== '') || getFeatureIcon(section?.type, index) ? (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 mt-2 min-w-0">
                          {feature.icon && feature.icon !== '' ? (
                            <img 
                              src={feature.icon} 
                              alt="Feature icon" 
                              className="w-12 h-12 object-contain rounded bg-white p-1 border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity shrink-0"
                              onClick={() => dispatch(openImageModal({ imageSrc: feature.icon, alt: 'Feature Icon' }))}
                            />
                          ) : getFeatureIcon(section?.type, index) ? (
                            <div className="w-12 h-12 bg-white rounded border border-gray-200 p-1 flex items-center justify-center shrink-0">
                              <Image 
                                src={getFeatureIcon(section.type, index)} 
                                alt="Feature icon" 
                                width={40} 
                                height={40}
                                className="object-contain"
                              />
                            </div>
                          ) : null}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-700 font-medium truncate">Icon Preview</p>
                            <p className="text-xs text-gray-500 mt-0.5 truncate">{feature.icon || getFeatureIcon(section?.type, index)}</p>
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