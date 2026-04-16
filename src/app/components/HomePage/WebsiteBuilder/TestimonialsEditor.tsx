"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from "../../../hooks/reduxHooks";
import { 
  updateTestimonialsContent,
  Testimonial,
  TestimonialsContent
} from "../../../store/testimonialsSlice";
import { 
  updateSectionContent,
  undoSection,
  redoSection,
  setEditingSection
} from "../../../store/builderSlice";
import { selectCanUndo, selectCanRedo } from "../../../store/builderSlice";
import { closeEditor, setEditingOverlay } from "../../../store/editorSlice";
import { openImageModal } from "../../../store/modalSlice";
import { 
  Trash2, 
  Upload, 
  Plus, 
  GripVertical, 
  CheckCircle, 
  Undo, 
  Redo,
  Star,
  X,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon
} from "lucide-react";
import ImageModal from "./ImageModal";

const TestimonialsEditor: React.FC = () => {
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<'content' | 'style' | 'testimonials'>('content');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  
  // Get editor state from editorSlice
  const { editingOverlay } = useAppSelector(state => state.editor);
  const { sections } = useAppSelector(state => state.builder);
  const { testimonialsContent } = useAppSelector(state => state.testimonials);
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
  
  // Use section content if available, otherwise fallback to testimonialsContent
  const content = section?.content || testimonialsContent;
  const testimonials = content.testimonials || [];

  // Local state for new testimonial form
  const [newTestimonial, setNewTestimonial] = useState<Partial<Testimonial>>({
    name: '',
    role: '',
    company: '',
    content: '',
    rating: 5
  });

  // Helper to update section content in real-time
  const updateContent = useCallback((updates: Partial<TestimonialsContent>) => {
    const updatedContent = { ...content, ...updates };
    
    // Always force light gray when saving to section (homepage will override anyway)
    updatedContent.backgroundColor = '#f3f4f6';
    updatedContent.textColor = '#111827';
    
    if (section) {
      dispatch(updateSectionContent({ id: section.id, content: updatedContent }));
    }
    dispatch(updateTestimonialsContent(updatedContent));
  }, [content, section, dispatch]);

  // Update testimonials array
  const updateTestimonials = useCallback((newTestimonials: Testimonial[]) => {
    updateContent({ testimonials: newTestimonials });
  }, [updateContent]);

  // Set editing section ID when component mounts
  React.useEffect(() => {
    if (section) {
      dispatch(setEditingSection({ sectionId: section.id, field: null }));
    }
  }, [section?.id, dispatch]);

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

  const handleAddTestimonial = () => {
    const testimonial: Testimonial = {
      id: Date.now().toString(),
      name: newTestimonial.name || 'New Testimonial',
      role: newTestimonial.role || '',
      company: newTestimonial.company || '',
      content: newTestimonial.content || '',
      rating: newTestimonial.rating || 5,
      avatar: newTestimonial.avatar || ''
    };

    const updatedTestimonials = [...testimonials, testimonial];
    updateTestimonials(updatedTestimonials);
    
    setNewTestimonial({
      name: '',
      role: '',
      company: '',
      content: '',
      rating: 5,
      avatar: ''
    });
    setIsAddingNew(false);
    setExpandedId(testimonial.id);
  };

  const handleUpdateTestimonial = (id: string, updates: Partial<Testimonial>) => {
    const updatedTestimonials = testimonials.map((t: Testimonial) => 
      t.id === id ? { ...t, ...updates } : t
    );
    updateTestimonials(updatedTestimonials);
  };

  const handleDeleteTestimonial = (id: string) => {
    if (confirm('Are you sure you want to delete this testimonial?')) {
      const updatedTestimonials = testimonials.filter((t: Testimonial) => t.id !== id);
      updateTestimonials(updatedTestimonials);
      if (expandedId === id) setExpandedId(null);
    }
  };

  const handleReorder = (fromIndex: number, toIndex: number) => {
    const newTestimonials = [...testimonials];
    const [removed] = newTestimonials.splice(fromIndex, 1);
    newTestimonials.splice(toIndex, 0, removed);
    updateTestimonials(newTestimonials);
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

  const handleImageUpload = (testimonialId: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          handleUpdateTestimonial(testimonialId, { avatar: result });
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (!editingOverlay.isOpen || editingOverlay.sectionType !== 'testimonials') return null;

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <h2 className="text-lg font-semibold text-gray-900">Testimonials Section</h2>
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
            onClick={() => setActiveTab('testimonials')}
            className={`flex-1 py-3 px-2 text-sm font-medium transition-colors ${
              activeTab === 'testimonials'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Testimonials ({content.testimonials?.length || 0})
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
                  placeholder="Reviews from real people"
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
                  placeholder="What our customers are saying"
                />
              </div>
              
              {/* Auto-calculated info */}
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                <p className="text-sm text-blue-700">
                  <strong>Auto-calculated:</strong> Rating ({(testimonials.reduce((sum: number, t: Testimonial) => sum + (t.rating || 5), 0) / (testimonials.length || 1)).toFixed(1)}) and review count ({testimonials.length}) are calculated automatically from individual testimonial ratings.
                </p>
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
                    <label className="block text-xs font-medium text-gray-600 mb-1">Background Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={content.backgroundColor || '#f9fafb'}
                        onChange={(e) => updateContent({ backgroundColor: e.target.value })}
                        className="w-8 h-8 rounded cursor-pointer border-0"
                      />
                      <input
                        type="text"
                        value={content.backgroundColor || '#f9fafb'}
                        onChange={(e) => updateContent({ backgroundColor: e.target.value })}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-mono"
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
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Card Text Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={content.cardTextColor || '#1f2937'}
                        onChange={(e) => updateContent({ cardTextColor: e.target.value })}
                        className="w-8 h-8 rounded cursor-pointer border-0"
                      />
                      <input
                        type="text"
                        value={content.cardTextColor || '#1f2937'}
                        onChange={(e) => updateContent({ cardTextColor: e.target.value })}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Star Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={content.starColor || '#fbbf24'}
                        onChange={(e) => updateContent({ starColor: e.target.value })}
                        className="w-8 h-8 rounded cursor-pointer border-0"
                      />
                      <input
                        type="text"
                        value={content.starColor || '#fbbf24'}
                        onChange={(e) => updateContent({ starColor: e.target.value })}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Quote Icon Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={content.quoteIconColor || '#3b82f6'}
                        onChange={(e) => updateContent({ quoteIconColor: e.target.value })}
                        className="w-8 h-8 rounded cursor-pointer border-0"
                      />
                      <input
                        type="text"
                        value={content.quoteIconColor || '#3b82f6'}
                        onChange={(e) => updateContent({ quoteIconColor: e.target.value })}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Layout Settings */}
              <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                <label className="block text-sm font-semibold text-gray-800 mb-3">Layout</label>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">Carousel Position</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateContent({ carouselPosition: 'left' })}
                        className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                          content.carouselPosition === 'left'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Left
                      </button>
                      <button
                        onClick={() => updateContent({ carouselPosition: 'right' })}
                        className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                          content.carouselPosition === 'right' || !content.carouselPosition
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Right
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Changes the position of the carousel relative to the content on desktop screens.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'testimonials' && (
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
                  + Add Testimonial
                </button>
              </div>

              {/* Add New Testimonial Form */}
              {isAddingNew && (
                <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                  <h4 className="font-semibold text-gray-800 mb-3 text-sm">New Testimonial</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Name *</label>
                      <input
                        type="text"
                        value={newTestimonial.name || ''}
                        onChange={(e) => setNewTestimonial({ ...newTestimonial, name: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
                        <input
                          type="text"
                          value={newTestimonial.role || ''}
                          onChange={(e) => setNewTestimonial({ ...newTestimonial, role: e.target.value })}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm"
                          placeholder="CEO"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Company</label>
                        <input
                          type="text"
                          value={newTestimonial.company || ''}
                          onChange={(e) => setNewTestimonial({ ...newTestimonial, company: e.target.value })}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm"
                          placeholder="Company Inc"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Rating</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setNewTestimonial({ ...newTestimonial, rating: star })}
                            className="p-0.5 hover:scale-110 transition-transform"
                          >
                            <Star
                              size={20}
                              className={star <= (newTestimonial.rating || 5) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Testimonial Content *</label>
                      <textarea
                        value={newTestimonial.content || ''}
                        onChange={(e) => setNewTestimonial({ ...newTestimonial, content: e.target.value })}
                        rows={3}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm resize-none"
                        placeholder="Write the testimonial content here..."
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleAddTestimonial}
                        disabled={!newTestimonial.name || !newTestimonial.content}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <CheckCircle size={14} className="inline mr-1" />
                        Add
                      </button>
                      <button
                        onClick={() => {
                          setIsAddingNew(false);
                          setNewTestimonial({
                            name: '',
                            role: '',
                            company: '',
                            content: '',
                            rating: 5,
                            avatar: ''
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

              {/* Existing Testimonials - Accordion Style */}
              <div className="space-y-2">
                {testimonials.map((testimonial: Testimonial, index: number) => {
                  const isExpanded = expandedId === testimonial.id;
                  return (
                    <div 
                      key={testimonial.id} 
                      className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden"
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                    >
                      {/* Accordion Header */}
                      <div 
                        className="flex items-center gap-2 p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => toggleExpand(testimonial.id)}
                      >
                        {/* Drag Handle */}
                        <div 
                          className="cursor-move text-gray-400 hover:text-gray-600 p-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <GripVertical size={16} />
                        </div>
                        
                        {/* Avatar */}
                        <div className="relative shrink-0">
                          {testimonial.avatar ? (
                            <div className="w-8 h-8 rounded-full overflow-hidden">
                              <img 
                                src={testimonial.avatar} 
                                alt={testimonial.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div 
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0"
                              style={{ 
                                background: `linear-gradient(to bottom right, ${content.starColor || '#60a5fa'}, ${content.quoteIconColor || '#2563eb'})` 
                              }}
                            >
                              {testimonial.name ? testimonial.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                          )}
                        </div>
                        
                        {/* Name */}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm truncate">{testimonial.name || 'Unnamed'}</p>
                          <p className="text-xs text-gray-500 truncate">{testimonial.role}{testimonial.company ? ` @ ${testimonial.company}` : ''}</p>
                        </div>
                        
                        {/* Star Rating Display */}
                        <div className="flex gap-0.5 shrink-0">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={12}
                              className={star <= (testimonial.rating || 5) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                            />
                          ))}
                        </div>
                        
                        {/* Expand/Collapse Icon */}
                        <div className="shrink-0 text-gray-400">
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>
                      </div>
                      
                      {/* Accordion Content */}
                      {isExpanded && (
                        <div className="p-3 pt-0 border-t border-gray-100 space-y-3">
                          {/* Avatar Upload */}
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              {testimonial.avatar ? (
                                <div className="w-12 h-12 rounded-full overflow-hidden">
                                  <img 
                                    src={testimonial.avatar} 
                                    alt={testimonial.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ) : (
                                <div 
                                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                                  style={{ 
                                    background: `linear-gradient(to bottom right, ${content.starColor || '#60a5fa'}, ${content.quoteIconColor || '#2563eb'})` 
                                  }}
                                >
                                  {testimonial.name ? testimonial.name.charAt(0).toUpperCase() : 'U'}
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() => handleImageUpload(testimonial.id)}
                              className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 text-xs transition-colors"
                            >
                              <Upload size={12} />
                              {testimonial.avatar ? 'Change Image' : 'Upload Image'}
                            </button>
                            {testimonial.avatar && (
                              <button
                                onClick={() => handleUpdateTestimonial(testimonial.id, { avatar: '' })}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                          
                          {/* Name */}
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
                            <input
                              type="text"
                              value={testimonial.name}
                              onChange={(e) => handleUpdateTestimonial(testimonial.id, { name: e.target.value })}
                              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm"
                              placeholder="Name"
                            />
                          </div>
                          
                          {/* Role & Company */}
                          <div className="flex gap-3">
                            <div className="flex-1">
                              <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
                              <input
                                type="text"
                                value={testimonial.role}
                                onChange={(e) => handleUpdateTestimonial(testimonial.id, { role: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm"
                                placeholder="Role"
                              />
                            </div>
                            <div className="flex-1">
                              <label className="block text-xs font-medium text-gray-600 mb-1">Company</label>
                              <input
                                type="text"
                                value={testimonial.company}
                                onChange={(e) => handleUpdateTestimonial(testimonial.id, { company: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm"
                                placeholder="Company"
                              />
                            </div>
                          </div>
                          
                          {/* Star Rating */}
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Rating</label>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  onClick={() => handleUpdateTestimonial(testimonial.id, { rating: star })}
                                  className="p-0.5 hover:scale-110 transition-transform"
                                >
                                  <Star
                                    size={24}
                                    className={star <= (testimonial.rating || 5) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                                  />
                                </button>
                              ))}
                            </div>
                          </div>
                          
                          {/* Content */}
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Testimonial Content</label>
                            <textarea
                              value={testimonial.content}
                              onChange={(e) => handleUpdateTestimonial(testimonial.id, { content: e.target.value })}
                              rows={3}
                              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm resize-none"
                              placeholder="Testimonial content..."
                            />
                          </div>
                          
                          {/* Delete Button */}
                          <button
                            onClick={() => handleDeleteTestimonial(testimonial.id)}
                            className="w-full p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium border border-red-200"
                          >
                            <Trash2 size={14} className="inline mr-1" />
                            Delete Testimonial
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

export default TestimonialsEditor;
