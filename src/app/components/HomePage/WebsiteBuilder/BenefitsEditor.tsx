"use client";

import React, { useState, useRef } from "react";
import { useAppSelector, useAppDispatch } from "../../../hooks/reduxHooks";
import { 
  updateBenefitsContent,
  addBenefit,
  updateBenefit,
  deleteBenefit,
  reorderBenefits,
  Benefit
} from "../../../store/benefitsSlice";
import { 
  updateSectionContent,
  toggleBuilderMode,
  undo,
  redo,
  undoSection,
  redoSection,
  setEditingSection,
  selectCanUndo,
  selectCanRedo
} from "../../../store/builderSlice";
import { closeEditor } from "../../../store/editorSlice";
import { openImageModal } from "../../../store/modalSlice";
import ImageModal from "./ImageModal";
import { Trash2, Plus, GripVertical, ChevronDown, Undo, Redo, Upload } from "lucide-react";
import { iconMap } from "../../../store/benefitsSlice";

const availableIcons = Object.keys(iconMap);

const BenefitsEditor: React.FC = () => {
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<'text' | 'style' | 'image'>('text');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [expandedBenefitId, setExpandedBenefitId] = useState<string | null>(null);
  const previousSectionId = useRef<string | null>(null);
  
  // Get editor state from editorSlice
  const { editorSection } = useAppSelector(state => state.editor);
  
  // Get undo/redo state
  const canUndo = useAppSelector(selectCanUndo);
  const canRedo = useAppSelector(selectCanRedo);
  
  // Get benefits content from benefitsSlice
  const { benefitsContent } = useAppSelector(state => state.benefits);
  
  // Get builder sections to find the current benefits section
  const { sections } = useAppSelector(state => state.builder);
  const currentBenefitsSection = sections.find(s => s.id === editorSection?.id);
  
  // Set editing section ID when component mounts
  React.useEffect(() => {
    if (currentBenefitsSection) {
      dispatch(setEditingSection({ sectionId: currentBenefitsSection.id, field: null }));
    }
  }, [currentBenefitsSection?.id]);

  const handleUndo = React.useCallback(() => {
    if (currentBenefitsSection) {
      dispatch(undoSection(currentBenefitsSection.id));
    }
  }, [currentBenefitsSection, dispatch]);
  
  const handleRedo = React.useCallback(() => {
    if (currentBenefitsSection) {
      dispatch(redoSection(currentBenefitsSection.id));
    }
  }, [currentBenefitsSection, dispatch]);

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
  
  // Local state for editing - prioritize current benefits section data
  const [localContent, setLocalContent] = useState(() => {
    // For any benefits section, use its specific content first (highest priority)
    if (editorSection?.id && currentBenefitsSection?.content) {
      return currentBenefitsSection.content;
    }
    
    // If we have an editor section with content, use it
    if (editorSection?.content) {
      return editorSection.content;
    }
    
    // Default to benefitsContent for fallback
    return benefitsContent;
  });

  // Update local content when section changes - preserve existing edits
  React.useEffect(() => {
    const currentSectionId = editorSection?.id || null;
    
    // Always update when we have a current benefits section with content
    if (currentSectionId !== previousSectionId.current || currentBenefitsSection?.content) {
      if (currentBenefitsSection?.content) {
        // Use the current benefits section content - this is the correct source
        setLocalContent((prev: typeof localContent) => ({ 
          ...currentBenefitsSection.content,
          // Ensure we have the benefits array
          benefits: currentBenefitsSection.content.benefits || []
        }));
      } else if (editorSection?.content) {
        // Fallback to editor section content
        setLocalContent((prev: typeof localContent) => ({ 
          ...prev, 
          ...editorSection.content,
          // Preserve benefits array if it exists in prev but not in new content
          benefits: editorSection.content.benefits || prev.benefits || []
        }));
      }
      previousSectionId.current = currentSectionId;
    }
  }, [editorSection?.id, editorSection?.content, currentBenefitsSection?.content]);

  
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
    // Demo benefit templates for new sections
    const demoBenefitTemplates: Benefit[] = [
      { id: `benefit-${Date.now()}-1`, iconName: 'Star', title: 'Demo Data 1', description: 'This is demo data for the first benefit. You can customize this text to match your specific product or service features.', order: 1 },
      { id: `benefit-${Date.now()}-2`, iconName: 'CheckCircle', title: 'Demo Data 2', description: 'This is demo data for the second benefit. Replace this with actual benefits that your customers will receive.', order: 2 },
      { id: `benefit-${Date.now()}-3`, iconName: 'Zap', title: 'Demo Data 3', description: 'This is demo data for the third benefit. Make sure to highlight the unique value propositions of your offering.', order: 3 }
    ];
    
    const newBenefit: Benefit = {
      id: `benefit-${Date.now()}`,
      iconName: 'Star',
      title: 'New Feature',
      description: 'Description for this new benefit feature goes here.',
      order: localContent.benefits.length + 1
    };
    
    // If editing existing section with no benefits, add demo data first
    if (localContent.benefits.length === 0) {
      const updatedBenefits = [...demoBenefitTemplates, newBenefit];
      updateField('benefits', updatedBenefits);
      demoBenefitTemplates.forEach(benefit => dispatch(addBenefit(benefit)));
      dispatch(addBenefit(newBenefit));
    } else {
      // Just add the new benefit
      const updatedBenefits = [...localContent.benefits, newBenefit];
      updateField('benefits', updatedBenefits);
      dispatch(addBenefit(newBenefit));
    }
    
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

  return (
    <div className=" bg-gray-50 min-h-full">
      <div className="flex items-center justify-between mb-2 p-3 border-b border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900">Benefits Section Editor</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => currentBenefitsSection && dispatch(undoSection(currentBenefitsSection.id))}
            disabled={!canUndo}
            className="p-2 rounded-lg border border-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-300"
            title="Undo (Ctrl+Z)"
          >
            <Undo size={16} className="text-gray-600" />
          </button>
          <button
            onClick={() => currentBenefitsSection && dispatch(redoSection(currentBenefitsSection.id))}
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
        <button
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'image'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
              : 'text-gray-600 hover:text-gray-900'
            }`}
          onClick={() => setActiveTab('image')}
        >
          Image
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Text Fields Tab */}
        {activeTab === 'text' && (
          <div className="space-y-4 p-3">
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
          
          <div className="space-y-3 max-h-96 overflow-y-auto overflow-x-hidden hide-scrollbar">
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
                          <Upload className="h-4 w-4"/>                          </button>
                        </div>
                        {/* Icon Preview */}
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          {benefit.iconImage ? (
                            <img 
                              src={benefit.iconImage} 
                              alt="Custom icon" 
                              className="w-8 h-8 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity shrink-0"
                              onClick={() => benefit.iconImage && dispatch(openImageModal({ imageSrc: benefit.iconImage, alt: 'Custom Icon' }))}
                            />
                          ) : (
                            <div className="w-8 h-8 bg-white rounded border border-gray-200 p-1 flex items-center justify-center shrink-0">
                              {(() => {
                                const IconComponent = iconMap[benefit.iconName] || iconMap.Star;
                                return <IconComponent className="w-5 h-5 text-gray-600" />;
                              })()}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-700 font-medium truncate">Icon Preview</p>
                            <p className="text-xs text-gray-500 mt-0.5 truncate">{benefit.iconImage ? 'Custom icon image' : benefit.iconName}</p>
                          </div>
                          {benefit.iconImage ? (
                            <button
                              onClick={() => handleUpdateBenefit(benefit.id, 'iconImage', '')}
                              className="ml-auto text-red-600 hover:text-red-700 text-sm hover:underline cursor-pointer shrink-0"
                              title="Remove custom icon"
                            >
                              Remove
                            </button>
                          ) : (
                            <button
                              onClick={() => handleIconImageUpload(benefit.id)}
                              className="ml-auto text-blue-600 hover:text-blue-700 text-sm hover:underline cursor-pointer shrink-0"
                              title="Upload custom icon"
                            >
                              Upload
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-3">Drag to reorder benefits. Click a benefit to expand/collapse.</p>
        </div>

       
      </div>
        )}

        {/* Style Tab */}
        {activeTab === 'style' && (
          <div className="p-4">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Style Settings</h4>
              <div className="grid grid-cols-1 gap-4">
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
              </div>
            </div>
          </div>
        )}

        {/* Image Tab */}
        {activeTab === 'image' && (
          <div className="p-4">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Image Settings</h4>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  In the Text Fields tab, you can upload custom icons for each benefit. 
                  Click on a benefit to expand it, then use the "Upload" button to add a custom icon image.
                </p>
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

export default BenefitsEditor;
