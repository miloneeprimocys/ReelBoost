"use client";

import React, { useState, useMemo, useCallback, useRef } from 'react';
import { useAppSelector, useAppDispatch } from "../../../hooks/reduxHooks";
import {
  updateFAQContent,
  FAQItem,
  FAQContent
} from "../../../store/faqSlice";
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
  ChevronUp
} from "lucide-react";

const FaqEditor: React.FC = () => {
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<'content' | 'style' | 'faqs'>('content');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [draggedCatIndex, setDraggedCatIndex] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  const { editingOverlay } = useAppSelector(state => state.editor);
  const { sections } = useAppSelector(state => state.builder);
  const { faqContent } = useAppSelector(state => state.faq);
  const canUndo = useAppSelector(selectCanUndo);
  const canRedo = useAppSelector(selectCanRedo);

  const section = useMemo(() => {
    if (!editingOverlay.sectionId) return null;
    const foundSection = sections.find(s => s.id === editingOverlay.sectionId);
    if (foundSection) {
      return JSON.parse(JSON.stringify(foundSection));
    }
    return null;
  }, [editingOverlay.sectionId, sections]);

  const content = section?.content || faqContent;
  const faqs = content.faqs || [];
  const categories = content.categories || ['General'];

  const [newFAQ, setNewFAQ] = useState<Partial<FAQItem>>({
    question: '',
    answer: '',
    category: categories[0] || 'General'
  });

  const [newCategory, setNewCategory] = useState('');

  // Use ref to avoid circular dependency in updateContent
  const contentRef = useRef(content);
  contentRef.current = content;
  const sectionRef = useRef(section);
  sectionRef.current = section;

  const updateContent = useCallback((updates: Partial<FAQContent>) => {
    const currentContent = contentRef.current;
    const currentSection = sectionRef.current;
    const updatedContent = { ...currentContent, ...updates };
    
    // Ensure backgroundColor is always set to prevent dark background issues
    if (!updatedContent.backgroundColor) {
      updatedContent.backgroundColor = currentContent.backgroundColor || '#ffffff';
    }
    
    // Only dispatch if content actually changed
    const hasChanged = JSON.stringify(currentContent) !== JSON.stringify(updatedContent);
    if (!hasChanged) return;
    
    if (currentSection) {
      dispatch(updateSectionContent({ id: currentSection.id, content: updatedContent }));
    }
    dispatch(updateFAQContent(updatedContent));
  }, [dispatch]);

  const updateFAQs = useCallback((newFAQs: FAQItem[]) => {
    updateContent({ faqs: newFAQs });
  }, [updateContent]);

  React.useEffect(() => {
    if (section) {
      dispatch(setEditingSection({ sectionId: section.id, field: null }));
    }
  }, [section?.id, dispatch]);

  // Keyboard shortcuts for undo/redo
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl/Cmd + Z (Undo) or Ctrl/Cmd + Y (Redo)
      const isModifier = e.ctrlKey || e.metaKey;
      
      if (isModifier) {
        if (e.key === 'z' || e.key === 'Z') {
          e.preventDefault();
          if (e.shiftKey) {
            // Ctrl/Cmd + Shift + Z = Redo
            handleRedo();
          } else {
            // Ctrl/Cmd + Z = Undo
            handleUndo();
          }
        } else if (e.key === 'y' || e.key === 'Y') {
          e.preventDefault();
          // Ctrl/Cmd + Y = Redo
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

  const handleAddFAQ = () => {
    const faq: FAQItem = {
      id: Date.now().toString(),
      question: newFAQ.question || 'New Question',
      answer: newFAQ.answer || '',
      category: newFAQ.category || categories[0] || 'General'
    };

    const updatedFAQs = [...faqs, faq];
    updateFAQs(updatedFAQs);

    setNewFAQ({
      question: '',
      answer: '',
      category: categories[0] || 'General'
    });
    setIsAddingNew(false);
    setExpandedId(faq.id);
  };

  const handleUpdateFAQ = (id: string, updates: Partial<FAQItem>) => {
    const updatedFAQs = faqs.map((f: FAQItem) =>
      f.id === id ? { ...f, ...updates } : f
    );
    updateFAQs(updatedFAQs);
  };

  const handleDeleteFAQ = (id: string) => {
    if (confirm('Are you sure you want to delete this FAQ?')) {
      const updatedFAQs = faqs.filter((f: FAQItem) => f.id !== id);
      updateFAQs(updatedFAQs);
      if (expandedId === id) setExpandedId(null);
    }
  };

  // Category drag handlers
  const handleCatDragStart = (index: number) => {
    setDraggedCatIndex(index);
  };

  const handleCatDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedCatIndex === null || draggedCatIndex === index) return;

    const newCategories = [...categories];
    const [removed] = newCategories.splice(draggedCatIndex, 1);
    newCategories.splice(index, 0, removed);
    updateContent({ categories: newCategories });
    setDraggedCatIndex(index);
  };

  const handleCatDragEnd = () => {
    setDraggedCatIndex(null);
  };

  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      const updatedCategories = [...categories, newCategory.trim()];
      updateContent({ categories: updatedCategories });
      setNewCategory('');
    }
  };

  const handleDeleteCategory = (cat: string) => {
    const updatedCategories = categories.filter((c: string) => c !== cat);
    updateContent({ categories: updatedCategories });
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (!editingOverlay.isOpen || editingOverlay.sectionType !== 'faq') return null;

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <h2 className="text-lg font-semibold text-gray-900">FAQ Section</h2>
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
          <button
            onClick={handleClose}
            className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            title="Save & Close"
          >
            <CheckCircle size={16} />
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
          onClick={() => setActiveTab('style')}
          className={`flex-1 py-3 px-2 text-sm font-medium transition-colors ${
            activeTab === 'style'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          Style
        </button>
        <button
          onClick={() => setActiveTab('faqs')}
          className={`flex-1 py-3 px-2 text-sm font-medium transition-colors ${
            activeTab === 'faqs'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          FAQs ({content.faqs?.length || 0})
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'content' && (
          <div className="space-y-4">
            {/* Title */}
            <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
              <label className="block text-sm font-semibold text-gray-800 mb-2">Main Title</label>
              <input
                type="text"
                value={content.title || ''}
                onChange={(e) => updateContent({ title: e.target.value })}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 text-sm"
                placeholder="Frequently asked questions"
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
                placeholder="Can't find what you're looking for?"
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
                    placeholder="FAQ"
                  />
                </div>
              </div>
            </div>

            {/* Categories with Drag-and-Drop */}
            <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
              <label className="block text-sm font-semibold text-gray-800 mb-3">Categories (Drag to reorder)</label>
              <div className="flex flex-col gap-2 mb-3">
                {categories.map((cat: string, index: number) => (
                  <div
                    key={cat}
                    className={`flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm cursor-move transition-all ${
                      draggedCatIndex === index ? 'border-2 border-blue-500 bg-blue-50' : ''
                    }`}
                    draggable
                    onDragStart={() => handleCatDragStart(index)}
                    onDragOver={(e) => handleCatDragOver(e, index)}
                    onDragEnd={handleCatDragEnd}
                    onDragLeave={(e) => e.preventDefault()}
                  >
                    <GripVertical size={14} className="text-gray-600" />
                    <span className="text-gray-900 font-medium flex-1">{cat}</span>
                    <button
                      onClick={() => handleDeleteCategory(cat)}
                      className="text-gray-500 hover:text-red-500 ml-1"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="New category name"
                />
                <button
                  onClick={handleAddCategory}
                  disabled={!newCategory.trim()}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm disabled:opacity-50"
                >
                  <Plus size={16} />
                </button>
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
                      value={content.backgroundColor || '#ffffff'}
                      onChange={(e) => updateContent({ backgroundColor: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer border-0"
                      required
                    />
                    <input
                      type="text"
                      value={content.backgroundColor || '#ffffff'}
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
                      value={content.textColor || '#101828'}
                      onChange={(e) => updateContent({ textColor: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer border-0"
                    />
                    <input
                      type="text"
                      value={content.textColor || '#101828'}
                      onChange={(e) => updateContent({ textColor: e.target.value })}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Accent Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={content.accentColor || '#667085'}
                      onChange={(e) => updateContent({ accentColor: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer border-0"
                    />
                    <input
                      type="text"
                      value={content.accentColor || '#667085'}
                      onChange={(e) => updateContent({ accentColor: e.target.value })}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Border Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={content.borderColor || '#EAECF0'}
                      onChange={(e) => updateContent({ borderColor: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer border-0"
                    />
                    <input
                      type="text"
                      value={content.borderColor || '#EAECF0'}
                      onChange={(e) => updateContent({ borderColor: e.target.value })}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Dot Text Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={content.dotTextColor || '#101828'}
                      onChange={(e) => updateContent({ dotTextColor: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer border-0"
                    />
                    <input
                      type="text"
                      value={content.dotTextColor || '#101828'}
                      onChange={(e) => updateContent({ dotTextColor: e.target.value })}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Tab/Category Styling */}
            <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
              <label className="block text-sm font-semibold text-gray-800 mb-3">Tab/Category Colors</label>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Tab Container Background</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={content.tabContainerBgColor || '#F9FAFB'}
                      onChange={(e) => updateContent({ tabContainerBgColor: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer border-0"
                    />
                    <input
                      type="text"
                      value={content.tabContainerBgColor || '#F9FAFB'}
                      onChange={(e) => updateContent({ tabContainerBgColor: e.target.value })}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Tab Container Border</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={content.tabContainerBorderColor || '#F2F4F7'}
                      onChange={(e) => updateContent({ tabContainerBorderColor: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer border-0"
                    />
                    <input
                      type="text"
                      value={content.tabContainerBorderColor || '#F2F4F7'}
                      onChange={(e) => updateContent({ tabContainerBorderColor: e.target.value })}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Active Tab Background</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={content.tabActiveBgColor || '#ffffff'}
                      onChange={(e) => updateContent({ tabActiveBgColor: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer border-0"
                    />
                    <input
                      type="text"
                      value={content.tabActiveBgColor || '#ffffff'}
                      onChange={(e) => updateContent({ tabActiveBgColor: e.target.value })}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Active Tab Text</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={content.tabActiveTextColor || '#344054'}
                      onChange={(e) => updateContent({ tabActiveTextColor: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer border-0"
                    />
                    <input
                      type="text"
                      value={content.tabActiveTextColor || '#344054'}
                      onChange={(e) => updateContent({ tabActiveTextColor: e.target.value })}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Inactive Tab Text</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={content.tabInactiveTextColor || '#667085'}
                      onChange={(e) => updateContent({ tabInactiveTextColor: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer border-0"
                    />
                    <input
                      type="text"
                      value={content.tabInactiveTextColor || '#667085'}
                      onChange={(e) => updateContent({ tabInactiveTextColor: e.target.value })}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Accordion Styling */}
            <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
              <label className="block text-sm font-semibold text-gray-800 mb-3">Accordion Colors</label>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Accordion Background</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={content.accordionBgColor || '#ffffff'}
                      onChange={(e) => updateContent({ accordionBgColor: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer border-0"
                    />
                    <input
                      type="text"
                      value={content.accordionBgColor || '#ffffff'}
                      onChange={(e) => updateContent({ accordionBgColor: e.target.value })}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Active Accordion Background</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={content.activeAccordionBgColor || '#F9FAFB'}
                      onChange={(e) => updateContent({ activeAccordionBgColor: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer border-0"
                    />
                    <input
                      type="text"
                      value={content.activeAccordionBgColor || '#F9FAFB'}
                      onChange={(e) => updateContent({ activeAccordionBgColor: e.target.value })}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Plus Icon Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={content.plusIconColor || '#98A2B3'}
                      onChange={(e) => updateContent({ plusIconColor: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer border-0"
                    />
                    <input
                      type="text"
                      value={content.plusIconColor || '#98A2B3'}
                      onChange={(e) => updateContent({ plusIconColor: e.target.value })}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Minus Icon Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={content.minusIconColor || '#98A2B3'}
                      onChange={(e) => updateContent({ minusIconColor: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer border-0"
                    />
                    <input
                      type="text"
                      value={content.minusIconColor || '#98A2B3'}
                      onChange={(e) => updateContent({ minusIconColor: e.target.value })}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'faqs' && (
          <div className="space-y-4">
            {/* Add New Button */}
            <div className="w-full" style={{ touchAction: 'none' }}>
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsAddingNew(true);
                }}
                className="w-full p-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors bg-gray-50 hover:bg-blue-50 text-sm"
              >
                + Add FAQ
              </button>
            </div>

            {/* Add New FAQ Form */}
            {isAddingNew && (
              <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                <h4 className="font-semibold text-gray-800 mb-3 text-sm">New FAQ</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Question *</label>
                    <input
                      type="text"
                      value={newFAQ.question || ''}
                      onChange={(e) => setNewFAQ({ ...newFAQ, question: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm"
                      placeholder="Enter question..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Answer *</label>
                    <textarea
                      value={newFAQ.answer || ''}
                      onChange={(e) => setNewFAQ({ ...newFAQ, answer: e.target.value })}
                      rows={3}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm resize-none"
                      placeholder="Enter answer..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
                    <select
                      value={newFAQ.category || categories[0] || 'General'}
                      onChange={(e) => setNewFAQ({ ...newFAQ, category: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm"
                    >
                      {categories.map((cat: string) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddFAQ}
                      disabled={!newFAQ.question || !newFAQ.answer}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircle size={14} className="inline mr-1" />
                      Add
                    </button>
                    <button
                      onClick={() => {
                        setIsAddingNew(false);
                        setNewFAQ({
                          question: '',
                          answer: ''
                        });
                      }}
                      className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Existing FAQs - Accordion Style */}
            <div className="space-y-2">
              {faqs.map((faq: FAQItem, index: number) => {
                const isExpanded = expandedId === faq.id;
                return (
                  <div
                    key={faq.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden"
                  >
                    {/* Accordion Header */}
                    <div
                      className="flex items-center gap-2 p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => toggleExpand(faq.id)}
                    >
                      {/* Drag Handle */}
                      <div
                        className="cursor-move text-gray-400 hover:text-gray-600 p-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <GripVertical size={16} />
                      </div>

                      {/* Question Preview */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">{faq.question || 'Untitled'}</p>
                      </div>

                      {/* Expand/Collapse Icon */}
                      <div className="shrink-0 text-gray-400">
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </div>

                    {/* Accordion Content */}
                    {isExpanded && (
                      <div className="p-3 pt-0 border-t border-gray-100 space-y-3">
                        {/* Question */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Question</label>
                          <input
                            type="text"
                            value={faq.question}
                            onChange={(e) => handleUpdateFAQ(faq.id, { question: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm"
                            placeholder="Question"
                          />
                        </div>

                        {/* Answer */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Answer</label>
                          <textarea
                            value={faq.answer}
                            onChange={(e) => handleUpdateFAQ(faq.id, { answer: e.target.value })}
                            rows={3}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm resize-none"
                            placeholder="Answer..."
                          />
                        </div>

                        {/* Category */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
                          <select
                            value={faq.category || categories[0] || 'General'}
                            onChange={(e) => handleUpdateFAQ(faq.id, { category: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm"
                          >
                            {categories.map((cat: string) => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteFAQ(faq.id)}
                          className="w-full p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium border border-red-200"
                        >
                          <Trash2 size={14} className="inline mr-1" />
                          Delete FAQ
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FaqEditor;
