"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from "../../../hooks/reduxHooks";
import { 
  updateSubscriptionPlanContent,
  SubscriptionPlan,
  SubscriptionPlanContent
} from "../../../store/subscriptionPlanSlice";
import { 
  updateSectionContent,
  undoSection,
  redoSection,
  setEditingSection
} from "../../../store/builderSlice";
import { selectCanUndo, selectCanRedo } from "../../../store/builderSlice";
import { closeEditor, setEditingOverlay } from "../../../store/editorSlice";
import { 
  Trash2, 
  Plus, 
  GripVertical, 
  CheckCircle, 
  Undo, 
  Redo,
  X,
  ChevronDown,
  ChevronUp,
  Star,
  Sparkles
} from "lucide-react";

const SubscriptionPlanEditor: React.FC = () => {
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<'content' | 'style' | 'plans'>('content');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  
  // Get editor state from editorSlice
  const { editingOverlay } = useAppSelector(state => state.editor);
  const { sections } = useAppSelector(state => state.builder);
  const { subscriptionPlanContent } = useAppSelector(state => state.subscriptionPlan);
  const canUndo = useAppSelector(selectCanUndo);
  const canRedo = useAppSelector(selectCanRedo);
  
  // Get section directly from Redux store
  const section = useMemo(() => {
    if (!editingOverlay.sectionId) return null;
    const foundSection = sections.find(s => s.id === editingOverlay.sectionId);
    if (foundSection) {
      return JSON.parse(JSON.stringify(foundSection));
    }
    return null;
  }, [editingOverlay.sectionId, sections]);
  
  // Use section content if available, otherwise fallback to subscriptionPlanContent
  const content = section?.content || subscriptionPlanContent;
  const plans = content.plans || [];

  // Local state for new plan form
  const [newPlan, setNewPlan] = useState<Partial<SubscriptionPlan>>({
    name: '',
    price: '',
    period: '/month',
    description: '',
    features: [''],
    buttonText: 'Get Started',
    isPopular: false,
    buttonLink: '',
    buttonTarget: '_blank'
  });

  // Helper to update section content in real-time
  const updateContent = useCallback((updates: Partial<SubscriptionPlanContent>) => {
    // Always preserve backgroundColor from the original content if not being updated
    const preservedBackgroundColor = content.backgroundColor || '#ffffff';
    
    const updatedContent = { 
      ...content, 
      ...updates,
      // Explicitly preserve backgroundColor to prevent it from being lost
      backgroundColor: updates.backgroundColor !== undefined ? updates.backgroundColor : preservedBackgroundColor
    };
    
    // Validate backgroundColor
    if (!updatedContent.backgroundColor || 
        updatedContent.backgroundColor === 'undefined' || 
        updatedContent.backgroundColor === 'null' || 
        updatedContent.backgroundColor === '' || 
        typeof updatedContent.backgroundColor !== 'string' ||
        !updatedContent.backgroundColor.match(/^#[0-9A-Fa-f]{6}$/)) {
      updatedContent.backgroundColor = preservedBackgroundColor;
    }
    
    if (section) {
      dispatch(updateSectionContent({ id: section.id, content: updatedContent }));
    }
    dispatch(updateSubscriptionPlanContent(updatedContent));
  }, [content, section, dispatch]);

  // Update plans array
  const updatePlans = useCallback((newPlans: SubscriptionPlan[]) => {
    updateContent({ plans: newPlans });
  }, [updateContent]);

  // Set editing section ID when component mounts
  React.useEffect(() => {
    if (section) {
      dispatch(setEditingSection({ sectionId: section.id, field: null }));
    }
  }, [section?.id, dispatch]);

  // Keyboard shortcuts for undo/redo
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isModifier = e.ctrlKey || e.metaKey;
      
      if (isModifier) {
        if (e.key === 'z' || e.key === 'Z') {
          e.preventDefault();
          if (e.shiftKey) {
            handleRedo();
          } else {
            handleUndo();
          }
        } else if (e.key === 'y' || e.key === 'Y') {
          e.preventDefault();
          handleRedo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [section, canUndo, canRedo]);

  const handleClose = () => {
    dispatch(closeEditor());
    dispatch(setEditingSection({ sectionId: null, field: null }));
    dispatch(setEditingOverlay({ isOpen: false, sectionId: null, sectionType: null, contentType: null }));
  };

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

  const handleSave = () => {
    handleClose();
  };

  const handleAddPlan = () => {
    const plan: SubscriptionPlan = {
      id: Date.now().toString(),
      name: newPlan.name || 'New Plan',
      price: newPlan.price || '$0',
      period: newPlan.period || '/month',
      description: newPlan.description || '',
      features: newPlan.features?.filter(f => f.trim()) || ['Feature 1'],
      buttonText: newPlan.buttonText || 'Get Started',
      isPopular: newPlan.isPopular || false,
      badgeText: newPlan.isPopular ? (newPlan.badgeText || 'Most Popular') : undefined,
      buttonLink: newPlan.buttonLink || '',
      buttonTarget: newPlan.buttonTarget || '_blank'
    };

    const updatedPlans = [...plans, plan];
    updatePlans(updatedPlans);
    
    setNewPlan({
      name: '',
      price: '',
      period: '/month',
      description: '',
      features: [''],
      buttonText: 'Get Started',
      isPopular: false,
      buttonLink: '',
      buttonTarget: '_blank'
    });
    setIsAddingNew(false);
    setExpandedId(plan.id);
  };

  const handleUpdatePlan = (id: string, updates: Partial<SubscriptionPlan>) => {
    const updatedPlans = plans.map((p: SubscriptionPlan) => {
      if (p.id === id) {
        const updated = { ...p, ...updates };
        // Automatically set badgeText when isPopular is toggled
        if (updates.isPopular === true && !updated.badgeText) {
          updated.badgeText = 'Most Popular';
        } else if (updates.isPopular === false) {
          updated.badgeText = undefined;
        }
        return updated;
      }
      return p;
    });
    updatePlans(updatedPlans);
  };

  const handleDeletePlan = (id: string) => {
    if (confirm('Are you sure you want to delete this plan?')) {
      const updatedPlans = plans.filter((p: SubscriptionPlan) => p.id !== id);
      updatePlans(updatedPlans);
      if (expandedId === id) setExpandedId(null);
    }
  };

  const handleReorder = (fromIndex: number, toIndex: number) => {
    const newPlans = [...plans];
    const [removed] = newPlans.splice(fromIndex, 1);
    newPlans.splice(toIndex, 0, removed);
    updatePlans(newPlans);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    handleReorder(draggedIndex, index);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const updateFeature = (planId: string, featureIndex: number, value: string) => {
    const plan = plans.find((p: SubscriptionPlan) => p.id === planId);
    if (!plan) return;
    
    const newFeatures = [...plan.features];
    newFeatures[featureIndex] = value;
    handleUpdatePlan(planId, { features: newFeatures });
  };

  const addFeature = (planId: string) => {
    const plan = plans.find((p: SubscriptionPlan) => p.id === planId);
    if (!plan) return;
    
    handleUpdatePlan(planId, { features: [...plan.features, ''] });
  };

  const removeFeature = (planId: string, featureIndex: number) => {
    const plan = plans.find((p: SubscriptionPlan) => p.id === planId);
    if (!plan || plan.features.length <= 1) return;
    
    const newFeatures = plan.features.filter((_: string, i: number) => i !== featureIndex);
    handleUpdatePlan(planId, { features: newFeatures });
  };

  const updateNewFeature = (index: number, value: string) => {
    const newFeatures = [...(newPlan.features || [''])];
    newFeatures[index] = value;
    setNewPlan({ ...newPlan, features: newFeatures });
  };

  const addNewFeature = () => {
    setNewPlan({ ...newPlan, features: [...(newPlan.features || ['']), ''] });
  };

  const removeNewFeature = (index: number) => {
    if ((newPlan.features || []).length <= 1) return;
    const newFeatures = (newPlan.features || []).filter((_, i) => i !== index);
    setNewPlan({ ...newPlan, features: newFeatures });
  };

  if (!editingOverlay.isOpen || editingOverlay.sectionType !== 'subscription-plan') return null;

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <h2 className="text-lg font-semibold text-gray-900">Subscription Plan Section</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleUndo}
            disabled={!canUndo}
            className="p-2 rounded-lg border border-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-300"
            title="Undo"
          >
            <Undo size={16} className="text-gray-600" />
          </button>
          <button
            onClick={handleRedo}
            disabled={!canRedo}
            className="p-2 rounded-lg border border-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-300"
            title="Redo"
          >
            <Redo size={16} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('content')}
          className={`flex-1 py-3 px-2 text-sm font-medium transition-colors ${
            activeTab === 'content'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          Content
        </button>
         <button
          onClick={() => setActiveTab('plans')}
          className={`flex-1 py-3 px-2 text-sm font-medium transition-colors ${
            activeTab === 'plans'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          Plans ({plans.length})
        </button>
        <button
          onClick={() => setActiveTab('style')}
          className={`flex-1 py-3 px-2 text-sm font-medium transition-colors ${
            activeTab === 'style'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          Style
        </button>
       
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'content' && (
          <div className="space-y-4">
            {/* Title */}
            <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
              <label className="block text-sm font-semibold text-gray-800 mb-2">Title</label>
              <input
                type="text"
                value={content.title || ''}
                onChange={(e) => updateContent({ title: e.target.value })}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 text-sm"
                placeholder="Choose Your Plan"
              />
            </div>
            
            {/* Subtitle */}
            <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
              <label className="block text-sm font-semibold text-gray-800 mb-2">Subtitle</label>
              <input
                type="text"
                value={content.subtitle || ''}
                onChange={(e) => updateContent({ subtitle: e.target.value })}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 text-sm"
                placeholder="Flexible pricing options for every stage of your journey"
              />
            </div>
            
            {/* Dot Text Settings */}
            <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
              <label className="block text-sm font-semibold text-gray-800 mb-3">Dot Text (Above Title)</label>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="showDotText"
                    checked={content.showDotText !== false}
                    onChange={(e) => updateContent({ showDotText: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="showDotText" className="text-sm font-medium text-gray-700">
                    Show dot text above title
                  </label>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Dot Text Content</label>
                  <input
                    type="text"
                    value={content.dotText || ''}
                    onChange={(e) => updateContent({ dotText: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 text-sm"
                    placeholder="Pricing"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'style' && (
          <div className="space-y-4">
            {/* Colors */}
            <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
              <label className="block text-sm font-semibold text-gray-800 mb-3">Colors</label>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Background Color <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={content.backgroundColor ?? '#ffffff'}
                      onChange={(e) => updateContent({ backgroundColor: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer border-0"
                      required
                    />
                    <input
                      type="text"
                      value={content.backgroundColor ?? '#ffffff'}
                      onChange={(e) => updateContent({ backgroundColor: e.target.value })}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-mono"
                      placeholder="#ffffff"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Text Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={content.textColor || '#111827'}
                      onChange={(e) => updateContent({ textColor: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer border-0"
                    />
                    <input
                      type="text"
                      value={content.textColor || '#111827'}
                      onChange={(e) => updateContent({ textColor: e.target.value })}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-mono"
                      placeholder="#111827"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Dot Text Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={content.dotTextColor || content.textColor || '#111827'}
                      onChange={(e) => updateContent({ dotTextColor: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer border-0"
                    />
                    <input
                      type="text"
                      value={content.dotTextColor || content.textColor || '#111827'}
                      onChange={(e) => updateContent({ dotTextColor: e.target.value })}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-mono"
                      placeholder="#111827"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Card Background Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={content.cardBackgroundColor || '#ffffff'}
                      onChange={(e) => updateContent({ cardBackgroundColor: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer border-0"
                    />
                    <input
                      type="text"
                      value={content.cardBackgroundColor || '#ffffff'}
                      onChange={(e) => updateContent({ cardBackgroundColor: e.target.value })}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-mono"
                      placeholder="#ffffff"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Card Text Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={content.cardTextColor || '#374151'}
                      onChange={(e) => updateContent({ cardTextColor: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer border-0"
                    />
                    <input
                      type="text"
                      value={content.cardTextColor || '#374151'}
                      onChange={(e) => updateContent({ cardTextColor: e.target.value })}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-mono"
                      placeholder="#374151"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Popular Card Background</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={content.popularCardBackgroundColor || '#f0f9ff'}
                      onChange={(e) => updateContent({ popularCardBackgroundColor: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer border-0"
                    />
                    <input
                      type="text"
                      value={content.popularCardBackgroundColor || '#f0f9ff'}
                      onChange={(e) => updateContent({ popularCardBackgroundColor: e.target.value })}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-mono"
                      placeholder="#f0f9ff"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Popular Card Border</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={content.popularCardBorderColor || '#3b82f6'}
                      onChange={(e) => updateContent({ popularCardBorderColor: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer border-0"
                    />
                    <input
                      type="text"
                      value={content.popularCardBorderColor || '#3b82f6'}
                      onChange={(e) => updateContent({ popularCardBorderColor: e.target.value })}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-mono"
                      placeholder="#3b82f6"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Button Background</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={content.buttonBackgroundColor || '#111827'}
                      onChange={(e) => updateContent({ buttonBackgroundColor: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer border-0"
                    />
                    <input
                      type="text"
                      value={content.buttonBackgroundColor || '#111827'}
                      onChange={(e) => updateContent({ buttonBackgroundColor: e.target.value })}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-mono"
                      placeholder="#111827"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Popular Button Background</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={content.popularButtonBackgroundColor || '#3b82f6'}
                      onChange={(e) => updateContent({ popularButtonBackgroundColor: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer border-0"
                    />
                    <input
                      type="text"
                      value={content.popularButtonBackgroundColor || '#3b82f6'}
                      onChange={(e) => updateContent({ popularButtonBackgroundColor: e.target.value })}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-mono"
                      placeholder="#3b82f6"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Button Text Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={content.buttonTextColor || '#ffffff'}
                      onChange={(e) => updateContent({ buttonTextColor: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer border-0"
                    />
                    <input
                      type="text"
                      value={content.buttonTextColor || '#ffffff'}
                      onChange={(e) => updateContent({ buttonTextColor: e.target.value })}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-mono"
                      placeholder="#ffffff"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Popular Button Text Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={content.popularButtonTextColor || '#ffffff'}
                      onChange={(e) => updateContent({ popularButtonTextColor: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer border-0"
                    />
                    <input
                      type="text"
                      value={content.popularButtonTextColor || '#ffffff'}
                      onChange={(e) => updateContent({ popularButtonTextColor: e.target.value })}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-mono"
                      placeholder="#ffffff"
                    />
                  </div>
                </div>
                {/* <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Badge Text Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={content.badgeTextColor || '#ffffff'}
                      onChange={(e) => updateContent({ badgeTextColor: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer border-0"
                    />
                    <input
                      type="text"
                      value={content.badgeTextColor || '#ffffff'}
                      onChange={(e) => updateContent({ badgeTextColor: e.target.value })}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-mono"
                      placeholder="#ffffff"
                    />
                  </div>
                </div> */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Badge Background Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={content.badgeBackgroundColor || '#3b82f6'}
                      onChange={(e) => updateContent({ badgeBackgroundColor: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer border-0"
                    />
                    <input
                      type="text"
                      value={content.badgeBackgroundColor || '#3b82f6'}
                      onChange={(e) => updateContent({ badgeBackgroundColor: e.target.value })}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-mono"
                      placeholder="#3b82f6"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Tick/Checkmark Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={content.tickColor || '#10b981'}
                      onChange={(e) => updateContent({ tickColor: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer border-0"
                    />
                    <input
                      type="text"
                      value={content.tickColor || '#10b981'}
                      onChange={(e) => updateContent({ tickColor: e.target.value })}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-mono"
                      placeholder="#10b981"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'plans' && (
          <div className="space-y-4">
            {/* Add New Plan Button */}
            {!isAddingNew ? (
              <button
                onClick={() => setIsAddingNew(true)}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Add New Plan
              </button>
            ) : (
              <div className="bg-white rounded-lg p-4 shadow-sm border-2 border-blue-200">
                <h4 className="font-medium text-gray-900 mb-3">New Plan</h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={newPlan.name}
                    onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                    placeholder="Plan Name"
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm text-black"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newPlan.price}
                      onChange={(e) => setNewPlan({ ...newPlan, price: e.target.value })}
                      placeholder="Price (e.g. $9)"
                      className="flex-1 p-2 border border-gray-300 rounded-lg text-sm text-black"
                    />
                    <input
                      type="text"
                      value={newPlan.period}
                      onChange={(e) => setNewPlan({ ...newPlan, period: e.target.value })}
                      placeholder="Period (e.g. /month)"
                      className="w-24 p-2 border border-gray-300 rounded-lg text-sm text-black"
                    />
                  </div>
                  <input
                    type="text"
                    value={newPlan.description}
                    onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
                    placeholder="Description"
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm text-black"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isPopular"
                      checked={newPlan.isPopular}
                      onChange={(e) => setNewPlan({ ...newPlan, isPopular: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <label htmlFor="isPopular" className="text-sm text-gray-700">Mark as Popular</label>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Button Link URL</label>
                    <input
                      type="text"
                      value={newPlan.buttonLink || ''}
                      onChange={(e) => setNewPlan({ ...newPlan, buttonLink: e.target.value })}
                      placeholder="https://..."
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Open Link In</label>
                    <select
                      value={newPlan.buttonTarget || '_blank'}
                      onChange={(e) => setNewPlan({ ...newPlan, buttonTarget: e.target.value as '_self' | '_blank' })}
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm text-black bg-white"
                    >
                      <option value="_blank">New Tab (_blank)</option>
                      <option value="_self">Same Page (_self)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">Features</label>
                    {(newPlan.features || ['']).map((feature, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={feature}
                          onChange={(e) => updateNewFeature(index, e.target.value)}
                          placeholder={`Feature ${index + 1}`}
                          className="flex-1 p-2 border border-gray-300 rounded-lg text-sm text-black"
                        />
                        <button
                          onClick={() => removeNewFeature(index)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                          disabled={(newPlan.features || []).length <= 1}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={addNewFeature}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      + Add Feature
                    </button>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleAddPlan}
                      className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all"
                    >
                      Add Plan
                    </button>
                    <button
                      onClick={() => {
                        setIsAddingNew(false);
                        setNewPlan({
                          name: '',
                          price: '',
                          period: '/month',
                          description: '',
                          features: [''],
                          buttonText: 'Get Started',
                          isPopular: false
                        });
                      }}
                      className="flex-1 py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Plans List */}
            {plans.map((plan: SubscriptionPlan, index: number) => (
              <div
                key={plan.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`bg-white rounded-lg shadow-sm border ${plan.isPopular ? 'border-blue-300' : 'border-gray-200'} overflow-hidden transition-all duration-200 ${draggedIndex === index ? 'opacity-50' : ''}`}
              >
                {/* Plan Header */}
                <div
                  className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedId(expandedId === plan.id ? null : plan.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="cursor-move p-1 hover:bg-gray-200 rounded">
                      <GripVertical className="w-4 h-4 text-gray-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{plan.name}</span>
                        {plan.isPopular && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            Popular
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">{plan.price}{plan.period}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePlan(plan.id);
                      }}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {expandedId === plan.id ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedId === plan.id && (
                  <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
                    <input
                      type="text"
                      value={plan.name}
                      onChange={(e) => handleUpdatePlan(plan.id, { name: e.target.value })}
                      placeholder="Plan Name"
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm text-black"
                    />
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={plan.price}
                        onChange={(e) => handleUpdatePlan(plan.id, { price: e.target.value })}
                        placeholder="Price"
                        className="flex-1 p-2 border border-gray-300 rounded-lg text-sm text-black"
                      />
                      <input
                        type="text"
                        value={plan.period}
                        onChange={(e) => handleUpdatePlan(plan.id, { period: e.target.value })}
                        placeholder="Period"
                        className="w-24 p-2 border border-gray-300 rounded-lg text-sm text-black"
                      />
                    </div>
                    <input
                      type="text"
                      value={plan.description}
                      onChange={(e) => handleUpdatePlan(plan.id, { description: e.target.value })}
                      placeholder="Description"
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm text-black"
                    />
                    <input
                      type="text"
                      value={plan.buttonText}
                      onChange={(e) => handleUpdatePlan(plan.id, { buttonText: e.target.value })}
                      placeholder="Button Text"
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm text-black"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`isPopular-${plan.id}`}
                        checked={plan.isPopular}
                        onChange={(e) => handleUpdatePlan(plan.id, { isPopular: e.target.checked })}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <label htmlFor={`isPopular-${plan.id}`} className="text-sm text-gray-700">Mark as Popular</label>
                    </div>
                    {plan.isPopular && (
                      <input
                        type="text"
                        value={plan.badgeText || ''}
                        onChange={(e) => handleUpdatePlan(plan.id, { badgeText: e.target.value })}
                        placeholder="Badge Text (e.g. Most Popular)"
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm text-black"
                      />
                    )}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Button Link URL</label>
                      <input
                        type="text"
                        value={plan.buttonLink || ''}
                        onChange={(e) => handleUpdatePlan(plan.id, { buttonLink: e.target.value })}
                        placeholder="https://..."
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm text-black"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Open Link In</label>
                      <select
                        value={plan.buttonTarget || '_blank'}
                        onChange={(e) => handleUpdatePlan(plan.id, { buttonTarget: e.target.value as '_self' | '_blank' })}
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm text-black bg-white"
                      >
                        <option value="_blank">New Tab (_blank)</option>
                        <option value="_self">Same Page (_self)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-2">Features</label>
                      {plan.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex gap-2 mb-2">
                          <input
                            type="text"
                            value={feature}
                            onChange={(e) => updateFeature(plan.id, featureIndex, e.target.value)}
                            placeholder={`Feature ${featureIndex + 1}`}
                            className="flex-1 p-2 border border-gray-300 rounded-lg text-sm text-black"
                          />
                          <button
                            onClick={() => removeFeature(plan.id, featureIndex)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                            disabled={plan.features.length <= 1}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => addFeature(plan.id)}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        + Add Feature
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default SubscriptionPlanEditor;
