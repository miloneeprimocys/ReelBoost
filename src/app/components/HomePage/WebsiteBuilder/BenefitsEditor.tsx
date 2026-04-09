"use client";

import React, { useState, useRef } from "react";
import { useAppSelector, useAppDispatch } from "../../../hooks/reduxHooks";
import { 
  updateBenefitsContent,
  addBenefit,
  updateBenefit,
  deleteBenefit,
  reorderBenefits,
  Benefit,
  iconMap
} from "../../../store/benefitsSlice";
import { 
  updateSectionContent,
  toggleBuilderMode 
} from "../../../store/builderSlice";
import { closeEditor } from "../../../store/editorSlice";
import { Trash2, Plus, GripVertical, ChevronDown } from "lucide-react";

const availableIcons = Object.keys(iconMap);

const BenefitsEditor: React.FC = () => {
  const dispatch = useAppDispatch();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [expandedBenefitId, setExpandedBenefitId] = useState<string | null>(null);
  const previousSectionId = useRef<string | null>(null);
  
  // Get editor state from editorSlice
  const { editorSection } = useAppSelector(state => state.editor);
  
  // Get benefits content from benefitsSlice
  const { benefitsContent } = useAppSelector(state => state.benefits);
  
  // Get builder sections to find sixth-1 content
  const { sections } = useAppSelector(state => state.builder);
  const sixthSection = sections.find(s => s.id === 'sixth-1');
  
  // Local state for editing - prioritize the section's own content
  const [localContent, setLocalContent] = useState(() => {
    // If we have an editor section with content, use it
    if (editorSection?.content) {
      return editorSection.content;
    }
    
    // For sixth-1 section, use its specific content
    if (editorSection?.id === 'sixth-1' && sixthSection?.content) {
      return sixthSection.content;
    }
    
    // For new sections, they should have default content with 3 demo benefits
    // If no content exists, create minimal default
    return {
      dotText: 'Main Benefits',
      title: 'Many Benefits You Get',
      highlightedTitle: 'Using Product',
      benefits: [
        { id: 'benefit-1', iconName: 'Star', title: 'Benefit 1', description: 'Description for benefit 1', order: 1 },
        { id: 'benefit-2', iconName: 'Star', title: 'Benefit 2', description: 'Description for benefit 2', order: 2 },
        { id: 'benefit-3', iconName: 'Star', title: 'Benefit 3', description: 'Description for benefit 3', order: 3 }
      ],
      dotColor: '#4A6CF7',
      dotTextColor: '#000000',
      titleColor: '#111827',
      highlightedTitleBgColor: 'transparent',
      highlightedTitleColor: '#111827',
      benefitIconColor: '#2563EB',
      benefitTitleColor: '#111827',
      benefitDescriptionColor: '#6B7280',
      borderColor: '#D1D5DB',
      backgroundColor: '#FFFFFF'
    };
  });

  // Update local content when section changes - preserve existing edits
  React.useEffect(() => {
    const currentSectionId = editorSection?.id || null;
    
    // Only update if the section ID actually changed
    if (currentSectionId !== previousSectionId.current) {
      if (editorSection?.content) {
        setLocalContent((prev: typeof localContent) => ({ 
          ...prev, 
          ...editorSection.content,
          // Preserve benefits array if it exists in prev but not in new content
          benefits: editorSection.content.benefits || prev.benefits || []
        }));
      }
      previousSectionId.current = currentSectionId;
    }
  }, [editorSection?.id, editorSection?.content]);

  
  const updateField = (field: string, value: any) => {
    const updatedContent = { ...localContent, [field]: value };
    setLocalContent(updatedContent);
    
    // Update both benefitsSlice and section content
    dispatch(updateBenefitsContent({ [field]: value }));
    if (editorSection) {
      dispatch(updateSectionContent({ id: editorSection.id, content: updatedContent }));
    }
  };

  const handleUpdateBenefit = (benefitId: string, field: keyof Benefit, value: string) => {
    const benefitIndex = localContent.benefits.findIndex((b: Benefit) => b.id === benefitId);
    if (benefitIndex !== -1) {
      const updatedBenefits = [...localContent.benefits];
      updatedBenefits[benefitIndex] = { 
        ...updatedBenefits[benefitIndex], 
        [field]: value 
      };
      updateField('benefits', updatedBenefits);
      dispatch(updateBenefit({ id: benefitId, updates: { [field]: value } }));
    }
  };

  const handleIconImageUpload = (benefitId: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          handleUpdateBenefit(benefitId, 'iconImage', result);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const addNewBenefit = () => {
    // For new sections (not sixth-1), start with 3 demo benefits
    const isEditingExistingSection = editorSection?.id === 'sixth-1';
    
    const demoBenefits: Benefit[] = [
      { id: `benefit-${Date.now()}-1`, iconName: 'Star', title: 'Benefit 1', description: 'Description for benefit 1', order: 1 },
      { id: `benefit-${Date.now()}-2`, iconName: 'Star', title: 'Benefit 2', description: 'Description for benefit 2', order: 2 },
      { id: `benefit-${Date.now()}-3`, iconName: 'Star', title: 'Benefit 3', description: 'Description for benefit 3', order: 3 }
    ];
    
    const newBenefit: Benefit = {
      id: `benefit-${Date.now()}`,
      iconName: 'Star',
      title: 'New Benefit',
      description: 'Description for this benefit',
      order: localContent.benefits.length + 1
    };
    
    const updatedBenefits = isEditingExistingSection 
      ? [...localContent.benefits, newBenefit]
      : [...demoBenefits, newBenefit];
      
    updateField('benefits', updatedBenefits);
    dispatch(addBenefit(newBenefit));
    setExpandedBenefitId(newBenefit.id);
  };

  const removeBenefit = (benefitId: string) => {
    const updatedBenefits = localContent.benefits.filter((b: Benefit) => b.id !== benefitId);
    updateField('benefits', updatedBenefits);
    dispatch(deleteBenefit(benefitId));
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragEnter = (index: number) => {
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      const updatedBenefits = [...localContent.benefits];
      const [movedBenefit] = updatedBenefits.splice(draggedIndex, 1);
      updatedBenefits.splice(dragOverIndex, 0, movedBenefit);
      
      // Update order property
      const reorderedBenefits = updatedBenefits.map((b, i) => ({ ...b, order: i + 1 }));
      
      updateField('benefits', reorderedBenefits);
      dispatch(reorderBenefits({ fromIndex: draggedIndex, toIndex: dragOverIndex }));
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDone = () => {
    if (editorSection) {
      // Ensure all content is saved to the section
      const finalContent = {
        ...localContent,
        // Make sure benefits array is properly included
        benefits: localContent.benefits || []
      };
      
      // Update the section content with all edits
      dispatch(updateSectionContent({ id: editorSection.id, content: finalContent }));
      
      // Also update benefitsSlice for consistency
      dispatch(updateBenefitsContent(finalContent));
    }
    dispatch(closeEditor());
    dispatch(toggleBuilderMode());
    
    // Redirect to the edited section
    setTimeout(() => {
      const targetId = editorSection?.id || 'sixth-1';
      const sectionElement = document.getElementById(targetId);
      if (sectionElement) {
        // Directly scroll to the section from current position
        sectionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 300);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900">Benefits Section Editor</h3>
        <button
          onClick={handleDone}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm hover:shadow-md"
        >
          Done
        </button>
      </div>

      <div className="space-y-6">
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
                placeholder="Main Benefits"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={localContent.title || ''}
                onChange={(e) => updateField('title', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                placeholder="Many Benefits You Get"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Highlighted Title</label>
              <input
                type="text"
                value={localContent.highlightedTitle || ''}
                onChange={(e) => updateField('highlightedTitle', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                placeholder="Using Product"
              />
            </div>
          </div>
        </div>

        {/* Benefits List */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-800">Benefits ({localContent.benefits?.length || 0})</h4>
            <button
              onClick={addNewBenefit}
              className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-1"
            >
              <Plus size={16} />
              Add Benefit
            </button>
          </div>
          
          <div className="space-y-3">
            {localContent.benefits?.map((benefit: Benefit, index: number) => (
              <div 
                key={benefit.id}
                className={`border rounded-lg overflow-hidden transition-all ${
                  dragOverIndex === index ? 'border-blue-400 bg-blue-50' : 'border-gray-200'
                }`}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragEnter={() => handleDragEnter(index)}
                onDragEnd={handleDragEnd}
              >
                {/* Benefit Header - Always visible */}
                <div
                  onClick={() => setExpandedBenefitId(expandedBenefitId === benefit.id ? null : benefit.id)}
                  className="flex items-center gap-3 p-3 cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <GripVertical size={18} className="text-gray-400 cursor-move" />
                  <span className="text-sm font-medium text-gray-500 w-6">{index + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">{benefit.title}</div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeBenefit(benefit.id);
                    }}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                    title="Delete benefit"
                  >
                    <Trash2 size={16} />
                  </button>
                  <ChevronDown 
                    size={18} 
                    className={`text-gray-400 transition-transform ${expandedBenefitId === benefit.id ? 'rotate-180' : ''}`}
                  />
                </div>
                
                {/* Benefit Content - Expandable */}
                {expandedBenefitId === benefit.id && (
                  <div className="p-4 space-y-3 border-t border-gray-100">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
                      <input
                        type="text"
                        value={benefit.title}
                        onChange={(e) => handleUpdateBenefit(benefit.id, 'title', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                      <textarea
                        value={benefit.description}
                        onChange={(e) => handleUpdateBenefit(benefit.id, 'description', e.target.value)}
                        rows={3}
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Icon</label>
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <select
                            value={benefit.iconName}
                            onChange={(e) => handleUpdateBenefit(benefit.id, 'iconName', e.target.value)}
                            className="flex-1 p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                          >
                            {availableIcons.map(iconName => (
                              <option key={iconName} value={iconName}>{iconName}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleIconImageUpload(benefit.id)}
                            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                            title="Upload custom icon image"
                          >
                            Upload
                          </button>
                        </div>
                        {benefit.iconImage && (
                          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                            <img 
                              src={benefit.iconImage} 
                              alt="Custom icon" 
                              className="w-8 h-8 object-cover rounded"
                            />
                            <span className="text-xs text-gray-600">Custom image uploaded</span>
                            <button
                              onClick={() => handleUpdateBenefit(benefit.id, 'iconImage', '')}
                              className="ml-auto text-red-500 hover:text-red-700 text-sm"
                              title="Remove custom image"
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-3">Drag to reorder benefits. Click a benefit to expand/collapse.</p>
        </div>

        {/* Colors */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Colors</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dot Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={localContent.dotColor || '#4A6CF7'}
                  onChange={(e) => updateField('dotColor', e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer border-0"
                />
                <input
                  type="text"
                  value={localContent.dotColor || '#4A6CF7'}
                  onChange={(e) => updateField('dotColor', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 font-mono"
                  placeholder="#4A6CF7"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dot Text Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={localContent.dotTextColor || '#000000'}
                  onChange={(e) => updateField('dotTextColor', e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer border-0"
                />
                <input
                  type="text"
                  value={localContent.dotTextColor || '#000000'}
                  onChange={(e) => updateField('dotTextColor', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 font-mono"
                  placeholder="#000000"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={localContent.titleColor || '#111827'}
                  onChange={(e) => updateField('titleColor', e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer border-0"
                />
                <input
                  type="text"
                  value={localContent.titleColor || '#111827'}
                  onChange={(e) => updateField('titleColor', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 font-mono"
                  placeholder="#111827"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Highlighted Title Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={localContent.highlightedTitleColor || '#111827'}
                  onChange={(e) => updateField('highlightedTitleColor', e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer border-0"
                />
                <input
                  type="text"
                  value={localContent.highlightedTitleColor || '#111827'}
                  onChange={(e) => updateField('highlightedTitleColor', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 font-mono"
                  placeholder="#111827"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Benefit Icon Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={localContent.benefitIconColor || '#2563EB'}
                  onChange={(e) => updateField('benefitIconColor', e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer border-0"
                />
                <input
                  type="text"
                  value={localContent.benefitIconColor || '#2563EB'}
                  onChange={(e) => updateField('benefitIconColor', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 font-mono"
                  placeholder="#2563EB"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Benefit Title Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={localContent.benefitTitleColor || '#111827'}
                  onChange={(e) => updateField('benefitTitleColor', e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer border-0"
                />
                <input
                  type="text"
                  value={localContent.benefitTitleColor || '#111827'}
                  onChange={(e) => updateField('benefitTitleColor', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 font-mono"
                  placeholder="#111827"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Benefit Description Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={localContent.benefitDescriptionColor || '#6B7280'}
                  onChange={(e) => updateField('benefitDescriptionColor', e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer border-0"
                />
                <input
                  type="text"
                  value={localContent.benefitDescriptionColor || '#6B7280'}
                  onChange={(e) => updateField('benefitDescriptionColor', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 font-mono"
                  placeholder="#6B7280"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Border Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={localContent.borderColor || '#D1D5DB'}
                  onChange={(e) => updateField('borderColor', e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer border-0"
                />
                <input
                  type="text"
                  value={localContent.borderColor || '#D1D5DB'}
                  onChange={(e) => updateField('borderColor', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 font-mono"
                  placeholder="#D1D5DB"
                />
              </div>
            </div>
            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={localContent.backgroundColor || '#FFFFFF'}
                  onChange={(e) => updateField('backgroundColor', e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer border-0"
                />
                <input
                  type="text"
                  value={localContent.backgroundColor || '#FFFFFF'}
                  onChange={(e) => updateField('backgroundColor', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 font-mono"
                  placeholder="#FFFFFF"
                />
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BenefitsEditor;
