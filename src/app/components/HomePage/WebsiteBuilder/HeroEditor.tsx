"use client";

import React, { useMemo, useState } from 'react';
import { useAppSelector, useAppDispatch } from "../../../hooks/reduxHooks";
import { markSectionAsReady, updateSectionContent, toggleBuilderMode, undo, redo, undoSection, redoSection, setEditingSection } from "../../../store/builderSlice";
import { selectCanUndo, selectCanRedo } from "../../../store/builderSlice";
import { closeEditor } from "../../../store/editorSlice";
import { Trash2, Upload, X, Undo, Redo } from "lucide-react";

interface HeroContent {
  title: string;
  description: string;
  backgroundImage: string;
  titleColor: string;
  descriptionColor: string;
  primaryButtonColor: string;
  secondaryButtonColor: string;
  animation: 'fade' | 'slide' | 'bounce' | 'none';
  tags: string[];
  activeTag: string;
  appStoreImage: string;
  googlePlayImage: string;
  topAccentColor: string;
  bottomAccentColor: string;
}

const HeroEditor: React.FC = () => {
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<'text' | 'style' | 'image'>('text');
  
  // Get editor state and section data directly
  const { editorSection } = useAppSelector(state => state.editor);
  const { editingOverlay } = useAppSelector(state => state.editor);
  const sections = useAppSelector(state => state.builder?.sections || []);
  
  // Get static hero content from homeSlice as base
  const staticHeroContent = useAppSelector(state => state.home.heroContent);
  
  // Get section directly from Redux store using editingOverlay.sectionId
  const section = useMemo(() => {
    if (!editingOverlay.sectionId) return null;
    
    console.log('HeroEditor - Looking for section:', {
      editingOverlayId: editingOverlay.sectionId,
      editingOverlayType: editingOverlay.sectionType,
      availableSections: sections.map(s => ({ id: s.id, type: s.type }))
    });
    
    // Find section in Redux store
    const foundSection = sections.find(s => s.id === editingOverlay.sectionId);
    console.log('HeroEditor - Found section:', foundSection ? { id: foundSection.id, type: foundSection.type, hasContent: !!foundSection.content } : null);
    
    // Create deep copy to prevent data swapping
    if (foundSection) {
      return JSON.parse(JSON.stringify(foundSection));
    }
    
    return null;
  }, [editingOverlay.sectionId, editingOverlay.sectionType, sections]);
  
  // Get undo/redo state
  const canUndo = useAppSelector(selectCanUndo);
  const canRedo = useAppSelector(selectCanRedo);
  
  // Set editing section ID when component mounts
  React.useEffect(() => {
    if (section) {
      dispatch(setEditingSection({ sectionId: section.id, field: null }));
    }
  }, [section?.id]);
  
  const handleUndo = () => {
    if (section) {
      dispatch(undoSection(section.id));
    }
  };
  
  const handleRedo = () => {
    if (section) {
      dispatch(redoSection(section.id));
    }
  };
  
  // Ensure content is properly initialized with default values
  const defaultContent: HeroContent = {
    title: 'Reelboost - Tiktok Clone App',
    description: 'ReelBoost is a modern short-video and live-streaming app inspired by TikTok. It lets users create, edit, and share engaging short videos with a smooth discovery feed. Creators can go live, interact with audiences in real time, and build loyal communities. Designed for performance and scale, ReelBoost supports engagement, growth, and monetization.',
    backgroundImage: '/hero.png',
    titleColor: '#2D3134',
    descriptionColor: '#6B7280',
    primaryButtonColor: '#000000',
    secondaryButtonColor: '#000000',
    animation: 'none',
    tags: ["Live Streaming", "PK Battle", "Multiple Payment Gateway", "Video Trimming", "Add Music", "Wallet", "Gits", "Earn Coins"],
    activeTag: 'Live Streaming',
    appStoreImage: '/Button1.png',
    googlePlayImage: '/Button2.png',
    topAccentColor: '#2B59FF',
    bottomAccentColor: '#FFB800'
  };
  
  // Use section content if available, otherwise use defaults
  const [content, setContent] = useState<HeroContent>(() => {
    // Merge static hero content with section-specific content
    const mergedContent = { ...staticHeroContent };
    
    if (section?.content && Object.keys(section.content).length > 0) {
      console.log('HeroEditor - Merging static content with section content:', { 
        static: staticHeroContent, 
        section: section.content 
      });
      Object.assign(mergedContent, section.content);
    } else {
      console.log('HeroEditor - Using static hero content as base');
    }
    
    return JSON.parse(JSON.stringify(mergedContent)) as HeroContent;
  });

  // Update content when section changes
  React.useEffect(() => {
    if (section) {
      console.log('HeroEditor - Section changed:', section.id, section.type, section.content);
      
      // Merge static hero content with section-specific content
      const mergedContent = { ...staticHeroContent };
      
      if (section?.content && Object.keys(section.content).length > 0) {
        console.log('HeroEditor - Merging static content with section content:', { 
          static: staticHeroContent, 
          section: section.content 
        });
        Object.assign(mergedContent, section.content);
      } else {
        console.log('HeroEditor - Using static hero content as base');
      }
      
      setContent(JSON.parse(JSON.stringify(mergedContent)) as HeroContent);
    }
  }, [section?.id, section?.content, section?.type, staticHeroContent]);

  // Early return if no valid section found
  if (!section) {
    console.warn('HeroEditor: No valid section found');
    return null;
  }
  
  const updateField = (field: keyof HeroContent, value: string) => {
    const updatedContent = { ...content, [field]: value };
    
    console.log('HeroEditor updateField:', { field, value, sectionId: section?.id });
    console.log('Updated content:', updatedContent);
    
    // Only update the builderSlice section content, not the global heroContent
    if (section) {
      console.log('Dispatching updateSectionContent for section:', section.id);
      dispatch(updateSectionContent({ id: section.id, content: updatedContent }));
    } else {
      console.error('No section found for update');
    }
  };

  
  const updateTags = (newTags: string[]) => {
    const updatedContent = { ...content, tags: newTags };
    if (section) {
      dispatch(updateSectionContent({ id: section.id, content: updatedContent }));
    }
  };

  const addTag = () => {
    const newTag = `Tag ${content.tags.length + 1}`;
    const updatedTags = [...content.tags, newTag];
    updateTags(updatedTags);
    
    // Scroll to bottom to show the new tag
    setTimeout(() => {
      const tagsContainer = document.querySelector('[data-tags-container]');
      if (tagsContainer) {
        tagsContainer.scrollTop = tagsContainer.scrollHeight;
      }
    }, 100);
  };

  const removeTag = (index: number) => {
    const updatedTags = content.tags.filter((_: string, i: number) => i !== index);
    updateTags(updatedTags);
  };

  const handleImageUpload = (sectionId: string, imageType: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // Read the file as a data URL for immediate display
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          updateField(imageType as keyof HeroContent, result);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const updateTag = (index: number, value: string) => {
    const newTags = [...content.tags];
    newTags[index] = value;
    updateTags(newTags);
  };
  const hasContent =
  content.title ||
 
  content.description ||
  content.backgroundImage;
  

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <h3 className="text-lg font-semibold text-gray-900 whitespace-nowrap">
          {hasContent ? "Text and Image Section Editor" : "Hero Section Editor"}
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

            
            {/* Tags */}
            <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
              <label className="block text-sm font-semibold text-gray-800 mb-2">Feature Tags</label>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-2" data-tags-container>
                {content.tags?.map((tag: string, index: number) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={tag}
                      onChange={(e) => updateTag(index, e.target.value)}
                      className="flex-1 p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    />
                    <button
                      onClick={() => removeTag(index)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="w-full" style={{ touchAction: 'none' }}>
                <button
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    addTag();
                  }}
                  className="w-full p-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors bg-gray-50 hover:bg-blue-50 text-sm"
                >
                  + Add Tag
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Style Tab */}
        {activeTab === 'style' && (
          <div className="space-y-4">
            {/* Colors */}
            <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
              <label className="block text-sm font-semibold text-gray-800 mb-3">Colors</label>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Title Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={content.titleColor}
                      onChange={(e) => updateField('titleColor', e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer border-0"
                    />
                    <input
                      type="text"
                      value={content.titleColor}
                      onChange={(e) => updateField('titleColor', e.target.value)}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-mono"
                      placeholder="#000000"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Description Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={content.descriptionColor}
                      onChange={(e) => updateField('descriptionColor', e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer border-0"
                    />
                    <input
                      type="text"
                      value={content.descriptionColor}
                      onChange={(e) => updateField('descriptionColor', e.target.value)}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-mono"
                      placeholder="#000000"
                    />
                  </div>
                </div>
              
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Top Accent Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={content.topAccentColor}
                      onChange={(e) => updateField('topAccentColor', e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer border-0"
                    />
                    <input
                      type="text"
                      value={content.topAccentColor}
                      onChange={(e) => updateField('topAccentColor', e.target.value)}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-mono"
                      placeholder="#2B59FF"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Bottom Accent Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={content.bottomAccentColor}
                      onChange={(e) => updateField('bottomAccentColor', e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer border-0"
                    />
                    <input
                      type="text"
                      value={content.bottomAccentColor}
                      onChange={(e) => updateField('bottomAccentColor', e.target.value)}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-mono"
                      placeholder="#FFB800"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Animation */}
            <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
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
        )}

        {/* Images Tab */}
        {activeTab === 'image' && (
          <div className="space-y-4">
            {/* Hero Background */}
            <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
              <label className="block text-sm font-semibold text-gray-800 mb-2">Hero Background Image</label>
              <input
                type="text"
                value={content.backgroundImage}
                onChange={(e) => updateField('backgroundImage', e.target.value)}
                placeholder="/hero.png"
                className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              />
              {content.backgroundImage && content.backgroundImage !== '' && (
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border mt-2">
                  <img 
                    src={content.backgroundImage} 
                    alt="Background image" 
                    className="w-12 h-12 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => {
                      const newWindow = window.open(content.backgroundImage, '_blank');
                      if (newWindow) newWindow.focus();
                    }}
                  />
                  <button
                    onClick={() => section && handleImageUpload(section.id, 'backgroundImage')}
                    className="ml-auto text-blue-600 hover:text-blue-700 text-sm"
                    title="Change image"
                  >
                    Change
                  </button>
                </div>
              )}
            </div>

            {/* App Store Button */}
            <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
              <label className="block text-sm font-semibold text-gray-800 mb-2">App Store Button</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={content.appStoreImage}
                  onChange={(e) => updateField('appStoreImage', e.target.value)}
                  placeholder="/Button1.png"
                  className="flex-1 min-w-0 p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
                <button
                  onClick={() => section && handleImageUpload(section.id, 'appStoreImage')}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm shrink-0 cursor-pointer"
                >
                  <Upload size={16} />
                </button>
              </div>
              {content.appStoreImage && content.appStoreImage !== '' && (
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border mt-2">
                  <img 
                    src={content.appStoreImage} 
                    alt="App Store button" 
                    className="w-12 h-12 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => {
                      const newWindow = window.open(content.appStoreImage, '_blank');
                      if (newWindow) newWindow.focus();
                    }}
                  />
                  {!content.appStoreImage.startsWith('data:') ? (
                     <button
                    onClick={() => section && handleImageUpload(section.id, 'backgroundImage')}
                    className="ml-auto text-blue-600 hover:text-blue-700 text-sm"
                    title="Change image"
                  >
                    Change
                  </button>
                  ) : (
                     <button
                    onClick={() => section && handleImageUpload(section.id, 'backgroundImage')}
                    className="ml-auto text-blue-600 hover:text-blue-700 text-sm"
                    title="Change image"
                  >
                    Change
                  </button>
                  )}
                </div>
              )}
            </div>

            {/* Google Play Button */}
            <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
              <label className="block text-sm font-semibold text-gray-800 mb-2">Google Play Button</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={content.googlePlayImage}
                  onChange={(e) => updateField('googlePlayImage', e.target.value)}
                  placeholder="/Button2.png"
                  className="flex-1 min-w-0 p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
                <button
                  onClick={() => section && handleImageUpload(section.id, 'googlePlayImage')}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm shrink-0 cursor-pointer"
                >
                  <Upload size={16} />
                </button>
              </div>
              {content.googlePlayImage && content.googlePlayImage !== '' && (
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border mt-2">
                  <img 
                    src={content.googlePlayImage} 
                    alt="Google Play button" 
                    className="w-12 h-12 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => {
                      const newWindow = window.open(content.googlePlayImage, '_blank');
                      if (newWindow) newWindow.focus();
                    }}
                  />
                  {!content.googlePlayImage.startsWith('data:') ? (
                  <button
                    onClick={() => section && handleImageUpload(section.id, 'backgroundImage')}
                    className="ml-auto text-blue-600 hover:text-blue-700 text-sm"
                    title="Change image"
                  >
                    Change
                  </button>
                  ) : (
                    <button
                    onClick={() => section && handleImageUpload(section.id, 'backgroundImage')}
                    className="ml-auto text-blue-600 hover:text-blue-700 text-sm"
                    title="Change image"
                  >
                    Change
                  </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HeroEditor;