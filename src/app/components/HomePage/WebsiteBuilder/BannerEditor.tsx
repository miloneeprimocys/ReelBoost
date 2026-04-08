"use client";

import React, { useState, useRef } from "react";
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
  toggleBuilderMode 
} from "../../../store/builderSlice";
import { closeEditor } from "../../../store/editorSlice";
import { Trash2, Upload, Plus, X } from "lucide-react";
import HeroImage from "../../../../../public/third.svg";
import Audience from "../../../../../public/audience.svg";
import Gift from "../../../../../public/gift.svg";
import Sword from "../../../../../public/sword.svg";
import list from "../../../../../public/list.svg";
import live from "../../../../../public/livestream.svg";
import Image from "next/image";

// Helper function to get the correct icon for Second and Third sections
const getFeatureIcon = (sectionType: string, featureIndex: number) => {
  if (sectionType === 'second') {
    if (featureIndex === 0) return list;
    if (featureIndex === 1) return live;
    if (featureIndex === 2) return HeroImage;
  }
  
  if (sectionType === 'third') {
    if (featureIndex === 0) return HeroImage;
    if (featureIndex === 1) return Audience;
    if (featureIndex === 2) return Gift;
    if (featureIndex === 3) return Sword;
  }
  
  return null;
};

interface BannerContent {
  dotText?: string;
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
  
  // Get editor state from editorSlice instead of props
  const { editorSection } = useAppSelector(state => state.editor);
  
  // Get current activeBannerSection at component level (not in event handlers)
  const activeBannerSection = useAppSelector(state => state.banner.activeSection);
  
  // Use section-specific content from editorSection, not global bannerContent
  const section = editorSection;
  
  // Ensure content is properly initialized with default values
 const getDefaultLayout = () => {
  const sectionType = section?.type;
  // Second section (live streaming): Image on LEFT, Content on RIGHT
  if (sectionType === 'second' || sectionType === 'live-streaming') return 'right'; // Image Left, Content Right
  // Third section (pk battle): Image on RIGHT, Content on LEFT
  if (sectionType === 'third' || sectionType === 'pk-battle') return 'left'; // Image Right, Content Left
  return 'left'; // Default for banner
};

  const defaultContent: BannerContent = {
    dotText: '',
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
  
  const [content, setContent] = useState<BannerContent>(defaultContent);
  
  // Use section content if available, otherwise use defaults
  React.useEffect(() => {
    if (section && section.content) {
      const newContent = { ...defaultContent, ...section.content };
      // Ensure layout is set correctly based on section type
      if (!newContent.layout) {
        newContent.layout = getDefaultLayout();
      }
      // Only update if content actually changed to prevent infinite loop
      setContent(prevContent => {
        const hasChanged = JSON.stringify(prevContent) !== JSON.stringify(newContent);
        return hasChanged ? newContent : prevContent;
      });
    }
  }, [section?.id, section?.content, section?.type]); // Include section type for layout

  const updateField = (field: keyof BannerContent, value: any) => {
    console.log('BannerEditor - updateField called:', field, value);
    const updatedContent = { ...content, [field]: value };
    console.log('BannerEditor - updatedContent:', updatedContent);
    
    // Use section-specific content from editorSection, not global bannerContent
    if (section) {
      console.log('BannerEditor - updating section:', section.id);
      // Check if this is a builderSlice section (starts with 'second-' or 'third-')
      if (section.id.startsWith('second-') || section.id.startsWith('third-')) {
        console.log('BannerEditor - updating builderSlice section');
        dispatch(updateSectionContent({ id: section.id, content: updatedContent }));
      } else {
        console.log('BannerEditor - updating bannerSlice section');
        dispatch(updateBannerContent({ id: section.id, content: updatedContent }));
      }
    }
    setContent(updatedContent);
  };

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
    updateField('features', updatedFeatures);
    if (section) {
      // Check if this is a builderSlice section
      if (section.id.startsWith('second-') || section.id.startsWith('third-')) {
        // For builderSlice sections, just update the content with the new feature
        dispatch(updateSectionContent({ id: section.id, content: { features: updatedFeatures } }));
      } else {
        dispatch(addBannerFeature({ id: section.id, feature: newFeature }));
      }
    }
  };

  const updateFeature = (index: number, field: 'title' | 'description' | 'icon', value: string) => {
    const updatedFeatures = [...content.features];
    updatedFeatures[index] = { ...updatedFeatures[index], [field]: value };
    updateField('features', updatedFeatures);
    if (section) {
      // Check if this is a builderSlice section
      if (section.id.startsWith('second-') || section.id.startsWith('third-')) {
        // For builderSlice sections, just update the content
        dispatch(updateSectionContent({ id: section.id, content: { features: updatedFeatures } }));
      } else {
        dispatch(updateBannerFeature({ id: section.id, featureIndex: index, feature: { [field]: value } }));
      }
    }
  };

  const removeFeature = (index: number) => {
    const updatedFeatures = content.features.filter((_, i) => i !== index);
    updateField('features', updatedFeatures);
    if (section) {
      // Check if this is a builderSlice section
      if (section.id.startsWith('second-') || section.id.startsWith('third-')) {
        // For builderSlice sections, just update the content
        dispatch(updateSectionContent({ id: section.id, content: { features: updatedFeatures } }));
      } else {
        dispatch(deleteBannerFeature({ id: section.id, featureIndex: index }));
      }
    }
  };

 const handleDone = () => {
  console.log('BannerEditor - handleDone called');

  // ✅ Save already handled via updateField

  // ✅ Close editor
  dispatch(closeEditor());

  // ✅ CLEAR ACTIVE STATES (CRITICAL FIX)
  dispatch(setActiveBannerSection(null));

  // ✅ Close builder
  dispatch(toggleBuilderMode());

  // ❌ REMOVE THIS COMPLETELY
  // setTimeout(() => {
  //   if (activeBannerSection) {
  //     dispatch(setActiveBannerSection(activeBannerSection));
  //   }
  // }, 50);

  // ✅ Scroll to updated section
  setTimeout(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const sectionElement = document.getElementById(section?.id || '');
    if (sectionElement) {
      sectionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, 300);
};

  return (
    <div className="p-6 bg-gray-50 min-h-full overflow-hidden">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900">Banner Section Editor</h3>
        <button
          onClick={handleDone}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm hover:shadow-md"
        >
          Done
        </button>
      </div>

      <div className={`mx-auto flex  flex-col lg:flex-row items-start justify-center gap-6 w-full`}>
        {/* Left Column - Content Settings */}
        <div className="flex-1 w-full order-1 lg:order-none space-y-6">
          {/* Dot Text */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <label className="block text-sm font-semibold text-gray-800 mb-2">Dot Text (above title)</label>
            <input
              type="text"
              value={content.dotText || ''}
              onChange={(e) => updateField('dotText', e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 break-words overflow-hidden"
              placeholder="Live Streaming"
              style={{ wordWrap: 'break-word', overflowWrap: 'break-word', maxWidth: '100%' }}
            />
          </div>

          {/* Title */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <label className="block text-sm font-semibold text-gray-800 mb-2">Title</label>
            <input
              type="text"
              value={content.title}
              onChange={(e) => updateField('title', e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 break-words overflow-hidden"
              placeholder="Enter title"
              style={{ wordWrap: 'break-word', overflowWrap: 'break-word', maxWidth: '100%' }}
            />
          </div>

          
          {/* Description */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <label className="block text-sm font-semibold text-gray-800 mb-2">Description</label>
            <textarea
              value={content.description}
              onChange={(e) => updateField('description', e.target.value)}
              rows={4}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 break-words overflow-hidden"
              placeholder="Enter description"
              style={{ wordWrap: 'break-word', overflowWrap: 'break-word', maxWidth: '100%' }}
            />
          </div>

          {/* Layout & Animation */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Content Layout</label>
                <select
                  value={content.layout}
                  onChange={(e) => updateField('layout', e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
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
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                >
                  <option value="none">None</option>
                  <option value="fade">Fade In</option>
                  <option value="slide">Slide In</option>
                  <option value="bounce">Bounce In</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Features, Images, Colors */}
        <div className="flex-1 w-full order-2 lg:order-none space-y-6">
          {/* Features */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <label className="block text-sm font-semibold text-gray-800 mb-3">Features</label>
            <div className="space-y-4">
              {content.features?.map((feature, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 gap-3">
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
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                        placeholder="Feature description"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Feature Icon</label>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={feature.icon}
                            onChange={(e) => updateFeature(index, 'icon', e.target.value)}
                            placeholder="/icon.svg"
                            className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                          />
                          {/* Icon Preview */}
                          {section && (section.type === 'second' || section.type === 'third') && (
                            <div className="mt-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">Preview:</span>
                                {getFeatureIcon(section.type, index) && (
                                  <Image 
                                    src={getFeatureIcon(section.type, index)} 
                                    alt="Feature icon" 
                                    width={20} 
                                    height={20}
                                    className="object-contain"
                                  />
                                )}
                                {!getFeatureIcon(section.type, index) && (
                                  <div className="w-5 h-5 bg-gray-300 rounded-full"></div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleFeatureImageUpload(index)}
                          className="p-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
                        >
                          <Upload size={16} />
                        </button>
                        <button
                          onClick={() => removeFeature(index)}
                           className="p-2 text-red-500 cursor-pointer"  >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <button
                onClick={addFeature}
                className="w-full p-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors bg-gray-50 hover:bg-blue-50 flex items-center justify-center gap-2"
              >
                <Plus size={16} />
                Add Feature
              </button>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <label className="block text-sm font-semibold text-gray-800 mb-3">Images</label>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Image Section</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={content.backgroundImage || ''}
                      onChange={(e) => updateField('backgroundImage', e.target.value)}
                      placeholder="/banner.svg"
                      className="flex-1 p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    />
                    <button
                      onClick={() => section && handleImageUpload(section.id, 'backgroundImage')}
                      className="p-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
                    >
                      <Upload size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Colors */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <label className="block text-sm font-semibold text-gray-800 mb-3">Colors</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Image Background Color</label>
                <input
                  type="color"
                  value={content.backgroundColor || '#4A72FF'}
                  onChange={(e) => updateField('backgroundColor', e.target.value)}
                  className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Title Color</label>
                <input
                  type="color"
                  value={content.titleColor || '#111827'}
                  onChange={(e) => updateField('titleColor', e.target.value)}
                  className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                />
              </div>
                            <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Description Color</label>
                <input
                  type="color"
                  value={content.descriptionColor || '#4B5563'}
                  onChange={(e) => updateField('descriptionColor', e.target.value)}
                  className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Feature Title Color</label>
                <input
                  type="color"
                  value={content.featureTitleColor || '#111827'}
                  onChange={(e) => updateField('featureTitleColor', e.target.value)}
                  className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Feature Description Color</label>
                <input
                  type="color"
                  value={content.featureDescriptionColor || '#4B5563'}
                  onChange={(e) => updateField('featureDescriptionColor', e.target.value)}
                  className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BannerEditor;
