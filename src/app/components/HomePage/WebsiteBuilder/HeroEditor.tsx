"use client";

import React from 'react';
import { useAppSelector, useAppDispatch } from "../../../hooks/reduxHooks";
import { markSectionAsReady, updateSectionContent, toggleBuilderMode } from "../../../store/builderSlice";
import { closeEditor } from "../../../store/editorSlice";
import { Trash2, Upload, X } from "lucide-react";

interface HeroContent {
  title: string;
  subtitle: string;
  description: string;
  primaryButtonText: string;
  secondaryButtonText: string;
  backgroundImage: string;
  layout: 'left' | 'right' | 'center';
  titleColor: string;
  subtitleColor: string;
  descriptionColor: string;
  primaryButtonColor: string;
  secondaryButtonColor: string;
  animation: 'fade' | 'slide' | 'bounce' | 'none';
  tags: string[];
  activeTag: string;
  appStoreImage: string;
  googlePlayImage: string;
  dotText: string;
}

const HeroEditor: React.FC = () => {
  const dispatch = useAppDispatch();
  
  // Get editor state from editorSlice instead of props
  const { editorSection } = useAppSelector(state => state.editor);
  
  // Use section-specific content from editorSection, not global heroContent
  const section = editorSection;
  
  // Ensure content is properly initialized with default values
  const defaultContent: HeroContent = {
    title: '',
    subtitle: '',
    description: '',
    primaryButtonText: '',
    secondaryButtonText: '',
    backgroundImage: '',
    layout: 'left',
    titleColor: '#000000',
    subtitleColor: '#000000',
    descriptionColor: '#000000',
    primaryButtonColor: '#000000',
    secondaryButtonColor: '#000000',
    animation: 'none',
    tags: [],
    activeTag: '',
    appStoreImage: '',
    googlePlayImage: '',
    dotText: ''
  };
  
  // Use section content if available, otherwise use defaults
  const content = section?.content ? { ...defaultContent, ...section.content } : defaultContent;

  // Debug: log the content to see what we're working with
  console.log('HeroEditor content:', content);
  console.log('Section object:', section);

  const updateField = (field: keyof HeroContent, value: string) => {
    console.log('Updating field:', field, 'with value:', value);
    const updatedContent = { ...content, [field]: value };
    console.log('Updated content:', updatedContent);
    
    // Only update the builderSlice section content, not the global heroContent
    if (section) {
      dispatch(updateSectionContent({ id: section.id, content: updatedContent }));
    }
  };

  const handleDone = () => {
    if (section) {
      dispatch(markSectionAsReady({ id: section.id, content: content }));
    }
    // Close editor and builder via Redux
    dispatch(closeEditor());
    dispatch(toggleBuilderMode());
    
    // Redirect to show the updated section - scroll to top and then to section
    setTimeout(() => {
      // Scroll to top of page
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Find and scroll to the updated section using the section ID directly
      const sectionElement = document.getElementById(section.id);
      if (sectionElement) {
        sectionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 300);
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
  content.subtitle ||
  content.description ||
  content.backgroundImage;
  

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900">
  {hasContent ? "Text and Image Section Editor" : "Hero Section Editor"}
</h3>  <button
          onClick={handleDone}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm hover:shadow-md"
        >
          Done
        </button>
      </div>

      <div className="space-y-6">
        {/* Title */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <label className="block text-sm font-semibold text-gray-800 mb-2">Title</label>
          <input
            type="text"
            value={content.title}
            onChange={(e) => updateField('title', e.target.value)}
            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
            placeholder="Enter title"
          />
        </div>


        {/* Description */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <label className="block text-sm font-semibold text-gray-800 mb-2">Description</label>
          <textarea
            value={content.description}
            onChange={(e) => updateField('description', e.target.value)}
            rows={4}
            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
          />
        </div>


      {/* Images */}
<div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
  <label className="block text-sm font-semibold text-gray-800 mb-3">Images</label>
  <div className="space-y-4">
    {/* Hero Background - Full Width */}
    <div className="flex flex-col">
      <label className="block text-xs font-medium text-gray-600 mb-1">Image Section</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={content.backgroundImage}
          onChange={(e) => updateField('backgroundImage', e.target.value)}
          placeholder="/hero.png"
          className="flex-1 min-w-0 p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
        />
        <button
          onClick={() => section && handleImageUpload(section.id, 'backgroundImage')}
          className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm shrink-0 cursor-pointer"
        >
          <Upload size={16} />
        </button>
      </div>
    </div>

    {/* Store Buttons - Responsive Grid */}
    {/* sm:grid-cols-2 ensures it stays 1 column on mobile and splits on larger screens */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Bottom Button-1</label>
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
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Bottom Button-2</label>
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
      </div>
    </div>
  </div>
</div>
        {/* Tags */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <label className="block text-sm font-semibold text-gray-800 mb-3">Feature Tags</label>
          <div className="space-y-2">
            {content.tags?.map((tag: string, index: number) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={tag}
                  onChange={(e) => updateTag(index, e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
                <button
                  onClick={() => removeTag(index)}
                  className="p-2 text-red-500 cursor-pointer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <button
              onClick={addTag}
              className="w-full p-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors bg-gray-50 hover:bg-blue-50"
            >
              + Add Tag
            </button>
          </div>
        </div>

        {/* Colors */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <label className="block text-sm font-semibold text-gray-800 mb-3">Colors</label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Title Color</label>
              <input
                type="color"
                value={content.titleColor}
                onChange={(e) => updateField('titleColor', e.target.value)}
                className="w-full h-10 border border-gray-300 rounded cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Description Color</label>
              <input
                type="color"
                value={content.descriptionColor}
                onChange={(e) => updateField('descriptionColor', e.target.value)}
                className="w-full h-10 border border-gray-300 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Animation */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
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
  );
};

export default HeroEditor;