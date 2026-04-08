"use client";

import React, { useState, useRef } from "react";
import { useAppSelector, useAppDispatch } from "../../../hooks/reduxHooks";
import { 
  updateFeaturesContent, 
  addFeature, 
  updateFeature, 
  deleteFeature,
  reorderFeatures,
  updateCard,
  reorderCards,
  setActiveFeaturesSection
} from "../../../store/featuresSlice";
import { 
  updateSectionContent,
  toggleBuilderMode 
} from "../../../store/builderSlice";
import { closeEditor } from "../../../store/editorSlice";
import { Trash2, Upload, Plus, X, GripVertical } from "lucide-react";
import Image from "next/image";

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
  console.log('=== FEATURES EDITOR COMPONENT LOADED ===');
  const dispatch = useAppDispatch();
  const [draggedItem, setDraggedItem] = useState<{ type: 'feature' | 'card', index: number } | null>(null);
  const [expandedFeatureId, setExpandedFeatureId] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  
  console.log('FeaturesEditor rendering...');
  
  // Get editor state from editorSlice
  const { editorSection } = useAppSelector(state => state.editor);
  
  // Get builder state as fallback
  const { activeSection, sections } = useAppSelector(state => state.builder);
  
  // Use section-specific content from editorSection, or fallback to activeSection
  const section = editorSection || (activeSection ? sections.find(s => s.id === activeSection) : null);
  
  // Get features content from featuresSlice as fallback
  const { featuresContent } = useAppSelector(state => state.features);
  
  // Use section content if available, otherwise use features content
  const content = section?.content || featuresContent;
  
  console.log('FeaturesEditor debug:', { 
    editorSection, 
    activeSection, 
    section, 
    content,
    contentFeatures: content?.features?.length,
    contentKeys: content ? Object.keys(content) : 'no content'
  });
  
  // Ensure localContent always has proper default values
  const [localContent, setLocalContent] = useState(() => ({
    dotText: 'Main Features',
    title: 'Achieving More Through Digital Excellence',
    features: [],
    cards: [],
    backgroundColor: '#000000',
    textColor: '#ffffff',
    titleColor: '#ffffff',
    ...content
  }));
  
  // Use section content if available, otherwise use features content
  React.useEffect(() => {
    if (section && section.content) {
      const newContent = { ...featuresContent, ...section.content };
      setLocalContent(newContent);
    } else if (featuresContent && (!localContent.features.length || !localContent.cards.length)) {
      // Load from featuresContent if localContent is empty
      setLocalContent(featuresContent);
    }
  }, [section?.id]);

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
  }, [JSON.stringify(localContent.features.map((f: Feature) => f.id)), expandedFeatureId]);

  const updateField = (field: string, value: any) => {
    const updatedContent = { ...localContent, [field]: value };
    setLocalContent(updatedContent);
    
    // Update both featuresSlice and section content
    dispatch(updateFeaturesContent({ [field]: value }));
    if (section) {
      dispatch(updateSectionContent({ id: section.id, content: updatedContent }));
    }
  };

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
              dispatch(updateFeature({ id: featureId, updates: { [field]: result } }));
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
              dispatch(updateCard({ id: cardId, updates: { image: result } }));
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
      dispatch(addFeature(newFeature));
      // Automatically expand the newly added feature
      setExpandedFeatureId(newFeature.id);
    }
  };

  const updateFeatureField = (featureId: string, field: string, value: string) => {
    const featureIndex = localContent.features.findIndex((f: any) => f.id === featureId);
    if (featureIndex !== -1) {
      const updatedFeatures = [...localContent.features];
      updatedFeatures[featureIndex] = { 
        ...updatedFeatures[featureIndex], 
        [field]: value 
      };
      updateField('features', updatedFeatures);
      dispatch(updateFeature({ id: featureId, updates: { [field]: value } }));
    }
  };

  const removeFeature = (featureId: string) => {
    const updatedFeatures = localContent.features.filter((f: Feature) => f.id !== featureId);
    updateField('features', updatedFeatures);
    dispatch(deleteFeature(featureId));
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
      dispatch(updateCard({ id: cardId, updates: { [field]: value } }));
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
      
      // Update Redux store
      dispatch(reorderFeatures({ fromIndex: draggedItem.index, toIndex: adjustedDropIndex }));
      
      // Update section content if exists
      if (section) {
        dispatch(updateSectionContent({ id: section.id, content: { ...localContent, features: updatedFeatures } }));
      }
    }
    
    setDraggedItem(null);
    setDragOverIndex(null);
  };

  const handleDone = () => {
    if (section) {
      // Mark section as ready (similar to HeroEditor)
      dispatch(updateSectionContent({ id: section.id, content: localContent }));
    }
    // Close editor and builder via Redux
    dispatch(closeEditor());
    dispatch(setActiveFeaturesSection(null));
    dispatch(toggleBuilderMode());
    
    // Redirect to show the updated section - scroll to top and then to section
    setTimeout(() => {
      // Scroll to top of page
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Find and scroll to the updated section using the section ID directly
      const sectionElement = document.getElementById(section?.id || '');
      if (sectionElement) {
        sectionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 300);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900">Features Section Editor</h3>
        <button
          onClick={handleDone}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm hover:shadow-md"
        >
          Done
        </button>
      </div>

      <div className="space-y-8">
        {/* Header Content */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Header Content</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dot Text</label>
              <input
                type="text"
                value={localContent.dotText || ''}
                onChange={(e) => updateField('dotText', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                placeholder="Main Features"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={localContent.title}
                onChange={(e) => updateField('title', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                placeholder="Achieving More Through Digital Excellence"
              />
            </div>
          </div>
        </div>

        {/* Main Features (Max 6) */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-800">Main Features (Max 6)</h4>
            <button
              onClick={addNewFeature}
              disabled={localContent.features.length >= 6}
              className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm flex items-center gap-1"
            >
              <Plus size={16} />
              Add Feature
            </button>
          </div>
          <div className="space-y-4">
            {localContent.features.map((feature: Feature, index: number) => (
              <div 
                key={feature.id || `feature-${index}`} 
                className={`border border-gray-200 rounded-lg p-4 transition-all ${
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
                    <span className="text-sm font-medium text-gray-600">Feature {feature.id ? feature.id.split('-')[1] : index + 1}</span>
                    <span className="text-xs text-gray-400">
                      {expandedFeatureId === feature.id ? 'Click to collapse' : 'Click to expand'}
                    </span>
                  </button>
                  <button
                    onClick={() => removeFeature(feature.id)}
                    className="ml-auto p-1 text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                {expandedFeatureId === feature.id && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Feature Title</label>
                    <input
                      type="text"
                      value={feature.title}
                      onChange={(e) => updateFeatureField(feature.id, 'title', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Icon</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={feature.icon}
                        onChange={(e) => updateFeatureField(feature.id, 'icon', e.target.value)}
                        placeholder="/icon.svg"
                        className="flex-1 p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      />
                      <button
                        onClick={() => handleImageUpload('icon', feature.id)}
                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Upload size={16} />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Background Image</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={feature.backgroundImage || ''}
                        onChange={(e) => updateFeatureField(feature.id, 'backgroundImage', e.target.value)}
                        placeholder="/background.svg"
                        className="flex-1 p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      />
                      <button
                        onClick={() => handleImageUpload('backgroundImage', feature.id)}
                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Upload size={16} />
                      </button>
                    </div>
                  </div>
                </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Cards (7 compulsory cards) */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Cards (7 Compulsory Cards)</h4>
          <div className="space-y-4">
            {localContent.cards.map((card: Card, index: number) => (
              <div key={card.id || `card-${index}`} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <GripVertical className="text-gray-400 cursor-move" size={20} />
                  <span className="text-sm font-medium text-gray-600">Card {index + 1}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Card Title</label>
                    <input
                      type="text"
                      value={card.title}
                      onChange={(e) => updateCardField(card.id, 'title', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Card Description</label>
                    <textarea
                      value={card.description}
                      onChange={(e) => updateCardField(card.id, 'description', e.target.value)}
                      rows={2}
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Image</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={card.image}
                        onChange={(e) => updateCardField(card.id, 'image', e.target.value)}
                        placeholder="/image.svg"
                        className="flex-1 p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      />
                      <button
                        onClick={() => handleImageUpload('image', undefined, card.id)}
                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Upload size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Colors */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Colors</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Background Color</label>
              <input
                type="color"
                value={localContent.backgroundColor || '#000000'}
                onChange={(e) => updateField('backgroundColor', e.target.value)}
                className="w-full h-10 border border-gray-300 rounded cursor-pointer"
              />
            </div>
             <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Main Title Color</label>
              <input
                type="color"
                value={localContent.titleColor || '#ffffff'}
                onChange={(e) => updateField('titleColor', e.target.value)}
                className="w-full h-10 border border-gray-300 rounded cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Feature Label Color</label>
              <input
                type="color"
                value={localContent.textColor || '#ffffff'}
                onChange={(e) => updateField('textColor', e.target.value)}
                className="w-full h-10 border border-gray-300 rounded cursor-pointer"
              />
            </div>
           
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Card Background</label>
              <input
                type="color"
                value={localContent.cards[0]?.backgroundColor || '#F1F3EE'}
                onChange={(e) => {
                  const updatedCards = localContent.cards.map((card: Card) => ({
                    ...card,
                    backgroundColor: e.target.value
                  }));
                  updateField('cards', updatedCards);
                }}
                className="w-full h-10 border border-gray-300 rounded cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Card Title Color</label>
              <input
                type="color"
                value={localContent.cardTitleColor || '#111827'}
                onChange={(e) => updateField('cardTitleColor', e.target.value)}
                className="w-full h-10 border border-gray-300 rounded cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Card Description Color</label>
              <input
                type="color"
                value={localContent.cardDescriptionColor || '#4B5563'}
                onChange={(e) => updateField('cardDescriptionColor', e.target.value)}
                className="w-full h-10 border border-gray-300 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturesEditor;
