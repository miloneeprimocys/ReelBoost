'use client';

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/app/store';
import { X, Edit3, Eye, Settings, ChevronDown, Lock, Plus, RotateCcw, HelpCircle, Monitor, Globe, PenTool, Link as LinkIcon, Copy, LayoutGrid } from 'lucide-react';
import {
  closeHeadingEditor,
  setActiveTab,
  updateHeadingContent,
  updateHeadingTitle,
  updateHeadingAlignment,
  updateHeadingTypography,
  updateHeadingTextStroke,
  updateHeadingTextShadow,
  updateHeadingTextColor,
  updateHeadingBlendMode,
  updateHeadingAdvanced,
  updateHeadingMargin,
  updateHeadingPadding,
  updateHeadingBackground,
  updateHeadingTransform,
  updateHeadingBorder,
  updateHeadingResponsive,
  Alignment,
  HTMLTag,
  FontFamily,
  TextTransform,
  FontStyle,
  TextDecoration,
  BlendMode,
  WidthType,
  Position,
} from '@/app/store/headingEditorSlice';

interface HeadingEditorProps {
  componentId: string;
  onClose?: () => void;
}

const HeadingEditor: React.FC<HeadingEditorProps> = ({ componentId, onClose }) => {
  const dispatch = useDispatch();
  const { isOpen, activeTab, components } = useSelector((state: RootState) => state.headingEditor);
  
  // Local state for Normal/Hover tabs
  const [transformTab, setTransformTab] = useState<'normal' | 'hover'>('normal');
  const [backgroundTab, setBackgroundTab] = useState<'normal' | 'hover'>('normal');
  const [borderTab, setBorderTab] = useState<'normal' | 'hover'>('normal');
  
  const component = components[componentId];
  if (!component) return null;

  const { content, styles, advanced } = component;

  const handleClose = () => {
    dispatch(closeHeadingEditor());
    onClose?.();
  };

  // Content Tab Handlers
  const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    dispatch(updateHeadingTitle({ componentId, title: e.target.value }));
  };

  const handleLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(updateHeadingContent({ componentId, content: { link: e.target.value } }));
  };

  const handleTagChange = (tag: HTMLTag) => {
    dispatch(updateHeadingContent({ componentId, content: { htmlTag: tag } }));
  };

  const handleAnimatedToggle = () => {
    dispatch(updateHeadingContent({ componentId, content: { animatedHeadline: !content.animatedHeadline } }));
  };

  // Style Tab Handlers
  const handleAlignmentChange = (alignment: Alignment) => {
    dispatch(updateHeadingAlignment({ componentId, alignment }));
  };

  const handleTypographyChange = (field: string, value: any) => {
    dispatch(updateHeadingTypography({ componentId, typography: { [field]: value } }));
  };

  const handleTextColorChange = (color: string) => {
    console.log('HeadingEditor: Changing text color to', color, 'for component', componentId);
    dispatch(updateHeadingTextColor({ componentId, color }));
  };

  const handleBackgroundChange = (field: string, value: any) => {
    dispatch(updateHeadingBackground({ componentId, background: { [field]: value } }));
  };

  const handleTransformChange = (field: string, value: any) => {
    dispatch(updateHeadingTransform({ componentId, transform: { [field]: value } }));
  };

  const handleBorderChange = (field: string, value: any) => {
    dispatch(updateHeadingBorder({ componentId, border: { [field]: value } }));
  };

  const handleResponsiveChange = (field: string, value: boolean) => {
    dispatch(updateHeadingResponsive({ componentId, responsive: { [field]: value } }));
  };

  const handleBlendModeChange = (blendMode: BlendMode) => {
    dispatch(updateHeadingBlendMode({ componentId, blendMode }));
  };

  const handleTextStrokeChange = (field: string, value: any) => {
    dispatch(updateHeadingTextStroke({ componentId, textStroke: { [field]: value } }));
  };

  const handleTextShadowChange = (field: string, value: any) => {
    dispatch(updateHeadingTextShadow({ componentId, textShadow: { [field]: value } }));
  };

  // Advanced Tab Handlers
  const handleMarginChange = (field: 'top' | 'right' | 'bottom' | 'left', value: number | '') => {
    const margin = advanced.margin;
    if (margin.linked) {
      dispatch(updateHeadingMargin({ componentId, margin: { top: value, right: value, bottom: value, left: value } }));
    } else {
      dispatch(updateHeadingMargin({ componentId, margin: { [field]: value } }));
    }
  };

  const handlePaddingChange = (field: 'top' | 'right' | 'bottom' | 'left', value: number | '') => {
    const padding = advanced.padding;
    if (padding.linked) {
      dispatch(updateHeadingPadding({ componentId, padding: { top: value, right: value, bottom: value, left: value } }));
    } else {
      dispatch(updateHeadingPadding({ componentId, padding: { [field]: value } }));
    }
  };

  const toggleMarginLinked = () => {
    dispatch(updateHeadingMargin({ componentId, margin: { linked: !advanced.margin.linked } }));
  };

  const togglePaddingLinked = () => {
    dispatch(updateHeadingPadding({ componentId, padding: { linked: !advanced.padding.linked } }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-[380px] bg-[#1e1e1e] text-white shadow-2xl z-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <h2 className="text-sm font-semibold">Edit Heading</h2>
        <button onClick={handleClose} className="p-1 hover:bg-gray-700 rounded transition-colors">
          <X size={18} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-700">
        <button
          onClick={() => dispatch(setActiveTab('content'))}
          className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
            activeTab === 'content' ? 'text-white border-b-2 border-white' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Edit3 size={16} />
          Content
        </button>
        <button
          onClick={() => dispatch(setActiveTab('style'))}
          className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
            activeTab === 'style' ? 'text-white border-b-2 border-white' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Eye size={16} />
          Style
        </button>
        <button
          onClick={() => dispatch(setActiveTab('advanced'))}
          className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
            activeTab === 'advanced' ? 'text-white border-b-2 border-white' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Settings size={16} />
          Advanced
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'content' && (
          <>
            {/* Heading Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <ChevronDown size={16} />
                <span className="font-medium">Heading</span>
              </div>

              {/* Title */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-gray-400">Title</label>
                  <button className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300">
                    <PenTool size={12} />
                    Write with AI
                  </button>
                </div>
                <textarea
                  value={content.title}
                  onChange={handleTitleChange}
                  placeholder="Add Your Heading Text Here"
                  className="w-full h-20 bg-[#2a2a2a] border border-gray-600 rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              {/* Link */}
              <div className="space-y-1">
                <label className="text-xs text-gray-400">Link</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={content.link}
                    onChange={handleLinkChange}
                    placeholder="Paste URL or type"
                    className="flex-1 bg-[#2a2a2a] border border-gray-600 rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                  <button className="p-2 bg-[#2a2a2a] border border-gray-600 rounded hover:bg-gray-700">
                    <Settings size={14} />
                  </button>
                  <button className="p-2 bg-[#2a2a2a] border border-gray-600 rounded hover:bg-gray-700">
                    <LayoutGrid size={14} />
                  </button>
                </div>
              </div>

              {/* HTML Tag */}
              <div className="space-y-1">
                <label className="text-xs text-gray-400">HTML Tag</label>
                <div className="relative">
                  <select
                    value={content.htmlTag}
                    onChange={(e) => handleTagChange(e.target.value as HTMLTag)}
                    className="w-full bg-[#2a2a2a] border border-gray-600 rounded px-3 py-2 text-sm text-white appearance-none focus:outline-none focus:border-blue-500"
                  >
                    <option value="h1">H1</option>
                    <option value="h2">H2</option>
                    <option value="h3">H3</option>
                    <option value="h4">H4</option>
                    <option value="h5">H5</option>
                    <option value="h6">H6</option>
                    <option value="p">p</option>
                    <option value="span">span</option>
                    <option value="div">div</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Animated Headline */}
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-300">Animated Headline widget</span>
                <div className="flex items-center gap-2">
                  <Lock size={14} className="text-gray-500" />
                  <button
                    onClick={handleAnimatedToggle}
                    className={`w-12 h-6 rounded-full relative transition-colors ${
                      content.animatedHeadline ? 'bg-blue-500' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                        content.animatedHeadline ? 'left-7' : 'left-1'
                      }`}
                    />
                  </button>
                  <span className="text-xs text-gray-500 w-6">{content.animatedHeadline ? 'On' : 'Off'}</span>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'style' && (
          <>
            {/* Heading Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <ChevronDown size={16} />
                <span className="font-medium">Heading</span>
              </div>

              {/* Alignment */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span>Alignment</span>
                  <Monitor size={12} />
                </div>
                <div className="flex bg-[#2a2a2a] rounded border border-gray-600 overflow-hidden">
                  <button
                    onClick={() => handleAlignmentChange('left')}
                    className={`p-2 flex items-center justify-center w-10 h-8 transition-colors ${
                      styles.alignment === 'left' ? 'bg-gray-600 text-white' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                    }`}
                    title="left"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="3" y1="6" x2="21" y2="6"/>
                      <line x1="3" y1="12" x2="15" y2="12"/>
                      <line x1="3" y1="18" x2="18" y2="18"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => handleAlignmentChange('center')}
                    className={`p-2 flex items-center justify-center w-10 h-8 transition-colors border-l border-r border-gray-600 ${
                      styles.alignment === 'center' ? 'bg-gray-600 text-white' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                    }`}
                    title="center"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="3" y1="6" x2="21" y2="6"/>
                      <line x1="6" y1="12" x2="18" y2="12"/>
                      <line x1="5" y1="18" x2="19" y2="18"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => handleAlignmentChange('right')}
                    className={`p-2 flex items-center justify-center w-10 h-8 transition-colors border-r border-gray-600 ${
                      styles.alignment === 'right' ? 'bg-gray-600 text-white' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                    }`}
                    title="right"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="3" y1="6" x2="21" y2="6"/>
                      <line x1="9" y1="12" x2="21" y2="12"/>
                      <line x1="6" y1="18" x2="21" y2="18"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => handleAlignmentChange('justify')}
                    className={`p-2 flex items-center justify-center w-10 h-8 transition-colors ${
                      styles.alignment === 'justify' ? 'bg-gray-600 text-white' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                    }`}
                    title="justify"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="3" y1="6" x2="21" y2="6"/>
                      <line x1="3" y1="12" x2="21" y2="12"/>
                      <line x1="3" y1="18" x2="21" y2="18"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Typography */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Typography</span>
                  <div className="flex gap-1">
                    <button className="p-1.5 bg-[#2a2a2a] rounded hover:bg-gray-700">
                      <Globe size={14} />
                    </button>
                    <button className="p-1.5 bg-[#2a2a2a] rounded hover:bg-gray-700">
                      <PenTool size={14} />
                    </button>
                  </div>
                </div>

                {/* Global Fonts Dropdown */}
                <div className="relative">
                  <div className="flex items-center gap-2 p-3 bg-[#2a2a2a] rounded border border-gray-700">
                    <span className="text-blue-400 text-xs">ⓘ</span>
                    <span className="text-sm text-white">Global Fonts</span>
                    <button className="ml-auto p-1 hover:bg-gray-700 rounded">
                      <Settings size={14} />
                    </button>
                  </div>
                </div>

                {/* Font Family Options */}
                <div className="bg-[#2a2a2a] rounded border border-gray-700 p-2 space-y-1">
                  {(['Primary', 'Secondary', 'Text', 'Accent'] as FontFamily[]).map((font) => (
                    <button
                      key={font}
                      onClick={() => handleTypographyChange('fontFamily', font)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors ${
                        styles.typography.fontFamily === font
                          ? 'text-white'
                          : 'text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      {styles.typography.fontFamily === font && <span className="text-blue-400">✓</span>}
                      {font}
                    </button>
                  ))}
                </div>

                {/* Typography Details Panel */}
                <div className="bg-[#2a2a2a] rounded border border-gray-700 p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white">Typography</span>
                    <div className="flex gap-1">
                      <button className="p-1 hover:bg-gray-700 rounded">
                        <RotateCcw size={14} />
                      </button>
                      <button className="p-1 hover:bg-gray-700 rounded">
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Family */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Family</span>
                    <div className="relative">
                      <select
                        value={styles.typography.fontFamily}
                        onChange={(e) => handleTypographyChange('fontFamily', e.target.value)}
                        className="bg-[#1e1e1e] border border-gray-600 rounded px-2 py-1 text-xs text-white appearance-none pr-6 focus:outline-none"
                      >
                        <option value="Primary">Roboto</option>
                        <option value="Secondary">Open Sans</option>
                        <option value="Text">Inter</option>
                        <option value="Accent">Playfair</option>
                      </select>
                      <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Size */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <span>Size</span>
                        <Monitor size={10} />
                      </div>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={styles.typography.fontSize}
                          onChange={(e) => handleTypographyChange('fontSize', Number(e.target.value))}
                          className="w-14 bg-[#1e1e1e] border border-gray-600 rounded px-2 py-1 text-xs text-white text-center"
                        />
                        <div className="relative">
                          <select
                            value={styles.typography.fontSizeUnit}
                            onChange={(e) => handleTypographyChange('fontSizeUnit', e.target.value)}
                            className="bg-[#1e1e1e] border border-gray-600 rounded px-2 py-1 text-xs text-white appearance-none pr-5"
                          >
                            <option value="px">px</option>
                            <option value="em">em</option>
                            <option value="rem">rem</option>
                            <option value="%">%</option>
                          </select>
                          <ChevronDown size={10} className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="8"
                      max="72"
                      value={styles.typography.fontSize}
                      onChange={(e) => handleTypographyChange('fontSize', Number(e.target.value))}
                      className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Weight */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Weight</span>
                    <div className="relative">
                      <select
                        value={styles.typography.fontWeight}
                        onChange={(e) => handleTypographyChange('fontWeight', e.target.value)}
                        className="bg-[#1e1e1e] border border-gray-600 rounded px-2 py-1 text-xs text-white appearance-none pr-6 focus:outline-none"
                      >
                        <option value="100">100 (Thin)</option>
                        <option value="200">200 (Extra Light)</option>
                        <option value="300">300 (Light)</option>
                        <option value="400">400 (Regular)</option>
                        <option value="500">500 (Medium)</option>
                        <option value="600">600 (Semi Bold)</option>
                        <option value="700">700 (Bold)</option>
                        <option value="800">800 (Extra Bold)</option>
                        <option value="900">900 (Black)</option>
                      </select>
                      <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Transform */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Transform</span>
                    <div className="relative">
                      <select
                        value={styles.typography.textTransform}
                        onChange={(e) => handleTypographyChange('textTransform', e.target.value)}
                        className="bg-[#1e1e1e] border border-gray-600 rounded px-2 py-1 text-xs text-white appearance-none pr-6 focus:outline-none"
                      >
                        <option value="none">Default</option>
                        <option value="uppercase">Uppercase</option>
                        <option value="lowercase">Lowercase</option>
                        <option value="capitalize">Capitalize</option>
                      </select>
                      <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Style */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Style</span>
                    <div className="relative">
                      <select
                        value={styles.typography.fontStyle}
                        onChange={(e) => handleTypographyChange('fontStyle', e.target.value)}
                        className="bg-[#1e1e1e] border border-gray-600 rounded px-2 py-1 text-xs text-white appearance-none pr-6 focus:outline-none"
                      >
                        <option value="normal">Default</option>
                        <option value="italic">Italic</option>
                        <option value="oblique">Oblique</option>
                      </select>
                      <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Decoration */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Decoration</span>
                    <div className="relative">
                      <select
                        value={styles.typography.textDecoration}
                        onChange={(e) => handleTypographyChange('textDecoration', e.target.value)}
                        className="bg-[#1e1e1e] border border-gray-600 rounded px-2 py-1 text-xs text-white appearance-none pr-6 focus:outline-none"
                      >
                        <option value="none">Default</option>
                        <option value="underline">Underline</option>
                        <option value="line-through">Line Through</option>
                        <option value="overline">Overline</option>
                      </select>
                      <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Line Height */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <span>Line Height</span>
                        <Monitor size={10} />
                      </div>
                      <div className="relative">
                        <select
                          value={styles.typography.lineHeightUnit}
                          onChange={(e) => handleTypographyChange('lineHeightUnit', e.target.value)}
                          className="bg-[#1e1e1e] border border-gray-600 rounded px-2 py-1 text-xs text-white appearance-none pr-5"
                        >
                          <option value="normal">px</option>
                          <option value="em">em</option>
                          <option value="rem">rem</option>
                        </select>
                        <ChevronDown size={10} className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="3"
                      step="0.1"
                      value={styles.typography.lineHeight}
                      onChange={(e) => handleTypographyChange('lineHeight', Number(e.target.value))}
                      className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Letter Spacing */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <span>Letter Spacing</span>
                        <Monitor size={10} />
                      </div>
                      <input
                        type="number"
                        value={styles.typography.letterSpacing}
                        onChange={(e) => handleTypographyChange('letterSpacing', Number(e.target.value))}
                        className="w-14 bg-[#1e1e1e] border border-gray-600 rounded px-2 py-1 text-xs text-white text-center"
                      />
                    </div>
                    <input
                      type="range"
                      min="-5"
                      max="20"
                      value={styles.typography.letterSpacing}
                      onChange={(e) => handleTypographyChange('letterSpacing', Number(e.target.value))}
                      className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Word Spacing */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <span>Word Spacing</span>
                        <Monitor size={10} />
                      </div>
                      <input
                        type="number"
                        value={styles.typography.wordSpacing}
                        onChange={(e) => handleTypographyChange('wordSpacing', Number(e.target.value))}
                        className="w-14 bg-[#1e1e1e] border border-gray-600 rounded px-2 py-1 text-xs text-white text-center"
                      />
                    </div>
                    <input
                      type="range"
                      min="-5"
                      max="20"
                      value={styles.typography.wordSpacing}
                      onChange={(e) => handleTypographyChange('wordSpacing', Number(e.target.value))}
                      className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Text Stroke */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Text Stroke</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTextStrokeChange('enabled', !styles.textStroke.enabled)}
                      className={`w-10 h-5 rounded-full relative transition-colors ${styles.textStroke.enabled ? 'bg-blue-500' : 'bg-gray-600'}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${styles.textStroke.enabled ? 'left-5' : 'left-0.5'}`} />
                    </button>
                    <button className="p-1 hover:bg-gray-700 rounded">
                      <RotateCcw size={14} />
                    </button>
                    <button className="p-1 hover:bg-gray-700 rounded">
                      <PenTool size={14} />
                    </button>
                  </div>
                </div>

                <div className="bg-[#2a2a2a] rounded border border-gray-700 p-3 space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <span>Text Stroke</span>
                        <Monitor size={10} />
                      </div>
                      <div className="relative">
                        <select className="bg-[#1e1e1e] border border-gray-600 rounded px-2 py-1 text-xs text-white appearance-none pr-5">
                          <option>px</option>
                        </select>
                        <ChevronDown size={10} className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={styles.textStroke.width}
                      onChange={(e) => handleTextStrokeChange('width', Number(e.target.value))}
                      className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Stroke Color</span>
                    <div className="flex items-center gap-2">
                      <Globe size={14} className="text-gray-400" />
                      <input
                        type="color"
                        value={styles.textStroke.color}
                        onChange={(e) => handleTextStrokeChange('color', e.target.value)}
                        className="w-6 h-6 rounded border-0 bg-transparent cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Text Shadow */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Text Shadow</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTextShadowChange('enabled', !styles.textShadow.enabled)}
                      className={`w-10 h-5 rounded-full relative transition-colors ${styles.textShadow.enabled ? 'bg-blue-500' : 'bg-gray-600'}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${styles.textShadow.enabled ? 'left-5' : 'left-0.5'}`} />
                    </button>
                    <button className="p-1 hover:bg-gray-700 rounded">
                      <RotateCcw size={14} />
                    </button>
                    <button className="p-1 hover:bg-gray-700 rounded">
                      <PenTool size={14} />
                    </button>
                  </div>
                </div>

                <div className="bg-[#2a2a2a] rounded border border-gray-700 p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Color</span>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gradient-to-br from-gray-400 to-transparent rounded" />
                      <input
                        type="color"
                        value={styles.textShadow.color}
                        onChange={(e) => handleTextShadowChange('color', e.target.value)}
                        className="w-6 h-6 rounded border-0 bg-transparent cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">Blur</span>
                      <input
                        type="number"
                        value={styles.textShadow.blur}
                        onChange={(e) => handleTextShadowChange('blur', Number(e.target.value))}
                        className="w-14 bg-[#1e1e1e] border border-gray-600 rounded px-2 py-1 text-xs text-white text-center"
                      />
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={styles.textShadow.blur}
                      onChange={(e) => handleTextShadowChange('blur', Number(e.target.value))}
                      className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">Horizontal</span>
                      <input
                        type="number"
                        value={styles.textShadow.horizontal}
                        onChange={(e) => handleTextShadowChange('horizontal', Number(e.target.value))}
                        className="w-14 bg-[#1e1e1e] border border-gray-600 rounded px-2 py-1 text-xs text-white text-center"
                      />
                    </div>
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      value={styles.textShadow.horizontal}
                      onChange={(e) => handleTextShadowChange('horizontal', Number(e.target.value))}
                      className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">Vertical</span>
                      <input
                        type="number"
                        value={styles.textShadow.vertical}
                        onChange={(e) => handleTextShadowChange('vertical', Number(e.target.value))}
                        className="w-14 bg-[#1e1e1e] border border-gray-600 rounded px-2 py-1 text-xs text-white text-center"
                      />
                    </div>
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      value={styles.textShadow.vertical}
                      onChange={(e) => handleTextShadowChange('vertical', Number(e.target.value))}
                      className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Blend Mode */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Blend Mode</span>
                <div className="relative">
                  <select
                    value={styles.blendMode}
                    onChange={(e) => handleBlendModeChange(e.target.value as BlendMode)}
                    className="bg-[#2a2a2a] border border-gray-600 rounded px-3 py-2 text-xs text-white appearance-none pr-6 focus:outline-none"
                  >
                    <option value="normal">Normal</option>
                    <option value="multiply">Multiply</option>
                    <option value="screen">Screen</option>
                    <option value="overlay">Overlay</option>
                    <option value="soft-light">Soft Light</option>
                    <option value="hard-light">Hard Light</option>
                    <option value="color-dodge">Color Dodge</option>
                    <option value="color-burn">Color Burn</option>
                    <option value="darken">Darken</option>
                    <option value="lighten">Lighten</option>
                    <option value="difference">Difference</option>
                    <option value="exclusion">Exclusion</option>
                    <option value="hue">Hue</option>
                    <option value="saturation">Saturation</option>
                    <option value="color">Color</option>
                    <option value="luminosity">Luminosity</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Text Color */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Text Color</span>
                <div className="flex items-center gap-2">
                  <Globe size={14} className="text-gray-400" />
                  <input
                    type="color"
                    value={styles.textColor}
                    onChange={(e) => handleTextColorChange(e.target.value)}
                    className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer"
                  />
                  <span className="text-xs text-gray-400 font-mono">{styles.textColor}</span>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'advanced' && (
          <>
            {/* Layout Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <ChevronDown size={16} />
                <span className="font-medium">Layout</span>
              </div>

              {/* Margin */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <span>Margin</span>
                    <Monitor size={10} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">px</span>
                    <button
                      onClick={toggleMarginLinked}
                      className={`p-1 rounded ${advanced.margin.linked ? 'text-blue-400' : 'text-gray-500'}`}
                    >
                      <LinkIcon size={14} style={{ transform: advanced.margin.linked ? 'none' : 'rotate(-45deg)' }} />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
                    <div key={side} className="space-y-1">
                      <input
                        type="number"
                        value={advanced.margin[side]}
                        onChange={(e) => handleMarginChange(side, e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full bg-[#2a2a2a] border border-gray-600 rounded px-2 py-1.5 text-xs text-white text-center focus:outline-none focus:border-blue-500"
                      />
                      <span className="block text-center text-[10px] text-gray-500 capitalize">{side}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Padding */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <span>Padding</span>
                    <Monitor size={10} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">px</span>
                    <button
                      onClick={togglePaddingLinked}
                      className={`p-1 rounded ${advanced.padding.linked ? 'text-blue-400' : 'text-gray-500'}`}
                    >
                      <LinkIcon size={14} style={{ transform: advanced.padding.linked ? 'none' : 'rotate(-45deg)' }} />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
                    <div key={side} className="space-y-1">
                      <input
                        type="number"
                        value={advanced.padding[side]}
                        onChange={(e) => handlePaddingChange(side, e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full bg-[#2a2a2a] border border-gray-600 rounded px-2 py-1.5 text-xs text-white text-center focus:outline-none focus:border-blue-500"
                      />
                      <span className="block text-center text-[10px] text-gray-500 capitalize">{side}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Width */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <span>Width</span>
                  <Monitor size={10} />
                </div>
                <div className="relative">
                  <select
                    value={advanced.width}
                    onChange={(e) => dispatch(updateHeadingAdvanced({ componentId, advanced: { width: e.target.value as WidthType } }))}
                    className="bg-[#2a2a2a] border border-gray-600 rounded px-3 py-2 text-xs text-white appearance-none pr-6 focus:outline-none"
                  >
                    <option value="default">Default</option>
                    <option value="full">Full Width</option>
                    <option value="inline">Inline</option>
                    <option value="custom">Custom</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Align Self */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <span>Align Self</span>
                  <Monitor size={10} />
                </div>
                <div className="flex bg-[#2a2a2a] rounded overflow-hidden">
                  {(['auto', 'flex-start', 'center', 'flex-end'] as const).map((align) => (
                    <button
                      key={align}
                      onClick={() => dispatch(updateHeadingAdvanced({ componentId, advanced: { alignSelf: align } }))}
                      className={`p-2 text-xs transition-colors ${
                        advanced.alignSelf === align ? 'bg-gray-600 text-white' : 'text-gray-400 hover:text-gray-200'
                      }`}
                      title={align}
                    >
                      {align === 'auto' && <span>⟷</span>}
                      {align === 'flex-start' && <span>↑</span>}
                      {align === 'center' && <span>÷</span>}
                      {align === 'flex-end' && <span>↓</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Order */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <span>Order</span>
                    <Monitor size={10} />
                  </div>
                  <div className="flex bg-[#2a2a2a] rounded overflow-hidden">
                    <button className="p-2 text-gray-400 hover:text-gray-200"><ChevronDown size={14} className="rotate-180" /></button>
                    <button className="p-2 text-gray-400 hover:text-gray-200"><ChevronDown size={14} /></button>
                    <button className="p-2 text-gray-400 hover:text-gray-200">⋮</button>
                  </div>
                </div>
                <p className="text-[10px] text-gray-500 italic">This control will affect contained elements only.</p>
              </div>

              {/* Size */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <span>Size</span>
                    <Monitor size={10} />
                  </div>
                  <div className="flex bg-[#2a2a2a] rounded overflow-hidden">
                    <button className="p-2 text-gray-400 hover:text-gray-200"><div className="w-4 h-4 border-2 border-current rounded-full" /></button>
                    <button className="p-2 text-gray-400 hover:text-gray-200">⧖</button>
                    <button className="p-2 text-gray-400 hover:text-gray-200">⋮</button>
                  </div>
                </div>
              </div>

              {/* Position */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Position</span>
                <div className="relative">
                  <select
                    value={advanced.position}
                    onChange={(e) => dispatch(updateHeadingAdvanced({ componentId, advanced: { position: e.target.value as Position } }))}
                    className="bg-[#2a2a2a] border border-gray-600 rounded px-3 py-2 text-xs text-white appearance-none pr-6 focus:outline-none"
                  >
                    <option value="static">Default</option>
                    <option value="relative">Relative</option>
                    <option value="absolute">Absolute</option>
                    <option value="fixed">Fixed</option>
                    <option value="sticky">Sticky</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Z-Index */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <span>Z-Index</span>
                  <Monitor size={10} />
                </div>
                <input
                  type="number"
                  value={advanced.zIndex}
                  onChange={(e) => dispatch(updateHeadingAdvanced({ componentId, advanced: { zIndex: e.target.value === '' ? '' : Number(e.target.value) } }))}
                  className="w-20 bg-[#2a2a2a] border border-gray-600 rounded px-3 py-2 text-xs text-white text-center focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* CSS ID */}
              <div className="space-y-1">
                <span className="text-xs text-gray-400">CSS ID</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={advanced.cssId}
                    onChange={(e) => dispatch(updateHeadingAdvanced({ componentId, advanced: { cssId: e.target.value } }))}
                    className="flex-1 bg-[#2a2a2a] border border-gray-600 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                  <button className="p-2 bg-[#2a2a2a] border border-gray-600 rounded hover:bg-gray-700">
                    <LayoutGrid size={14} />
                  </button>
                </div>
              </div>

              {/* CSS Classes */}
              <div className="space-y-1">
                <span className="text-xs text-gray-400">CSS Classes</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={advanced.cssClasses}
                    onChange={(e) => dispatch(updateHeadingAdvanced({ componentId, advanced: { cssClasses: e.target.value } }))}
                    className="flex-1 bg-[#2a2a2a] border border-gray-600 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                  <button className="p-2 bg-[#2a2a2a] border border-gray-600 rounded hover:bg-gray-700">
                    <LayoutGrid size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Background Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <ChevronDown size={16} />
                  <span className="font-medium">Background</span>
                </div>

                {/* Normal/Hover Tabs */}
                <div className="flex bg-[#2a2a2a] rounded border border-gray-700 overflow-hidden">
                  <button
                    onClick={() => setBackgroundTab('normal')}
                    className={`flex-1 py-2 text-xs ${backgroundTab === 'normal' ? 'bg-gray-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
                  >
                    Normal
                  </button>
                  <button
                    onClick={() => setBackgroundTab('hover')}
                    className={`flex-1 py-2 text-xs ${backgroundTab === 'hover' ? 'bg-gray-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
                  >
                    Hover
                  </button>
                </div>

                <div className="space-y-2">
                  {backgroundTab === 'hover' ? (
                    // Hover tab shows gradient controls like the screenshot
                    <>
                      {/* Info Banner */}
                      <div className="bg-[#2a1f1a] border-l-2 border-orange-500 p-3 rounded">
                        <p className="text-xs text-orange-300 italic">
                          Set locations and angle for each breakpoint to ensure the gradient adapts to different screen sizes.
                        </p>
                      </div>

                      {/* Color 1 */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">Color</span>
                          <div className="flex items-center gap-2">
                            <Globe size={14} className="text-gray-400" />
                            <input
                              type="color"
                              defaultValue="#3b82f6"
                              className="w-6 h-6 rounded border-0 bg-transparent cursor-pointer"
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-400">Location</span>
                            <Monitor size={10} className="text-gray-500" />
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <span>%</span>
                            <ChevronDown size={10} />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            defaultValue={86}
                            className="flex-1 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                          />
                          <input
                            type="number"
                            defaultValue={86}
                            className="w-14 bg-[#2a2a2a] border border-gray-600 rounded px-2 py-1 text-xs text-white text-center"
                          />
                        </div>
                      </div>

                      {/* Second Color */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">Second Color</span>
                          <div className="flex items-center gap-2">
                            <Globe size={14} className="text-gray-400" />
                            <input
                              type="color"
                              defaultValue="#ec4899"
                              className="w-6 h-6 rounded border-0 bg-transparent cursor-pointer"
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-400">Location</span>
                            <Monitor size={10} className="text-gray-500" />
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <span>%</span>
                            <ChevronDown size={10} />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            defaultValue={100}
                            className="flex-1 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                          />
                          <input
                            type="number"
                            defaultValue={100}
                            className="w-14 bg-[#2a2a2a] border border-gray-600 rounded px-2 py-1 text-xs text-white text-center"
                          />
                        </div>
                      </div>

                      {/* Type */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">Type</span>
                        <div className="relative">
                          <select
                            defaultValue="Linear"
                            className="bg-[#2a2a2a] border border-gray-600 rounded px-3 py-1.5 text-xs text-white appearance-none pr-6 focus:outline-none"
                          >
                            <option>Linear</option>
                            <option>Radial</option>
                          </select>
                          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                      </div>

                      {/* Angle */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-400">Angle</span>
                            <Monitor size={10} className="text-gray-500" />
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <span>deg</span>
                            <ChevronDown size={10} />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min="0"
                            max="360"
                            defaultValue={180}
                            className="flex-1 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                          />
                          <input
                            type="number"
                            defaultValue={180}
                            className="w-14 bg-[#2a2a2a] border border-gray-600 rounded px-2 py-1 text-xs text-white text-center"
                          />
                        </div>
                      </div>

                      {/* Transition Duration (s) */}
                      <div className="space-y-2">
                        <span className="text-xs text-gray-400">Transition Duration (s)</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min="0"
                            max="2"
                            step="0.1"
                            defaultValue={0.8}
                            className="flex-1 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                          />
                          <input
                            type="number"
                            step="0.1"
                            defaultValue={0.8}
                            className="w-14 bg-[#2a2a2a] border border-gray-600 rounded px-2 py-1 text-xs text-white text-center"
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    // Normal tab - simple color/image selection
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">Background Type</span>
                        <div className="flex rounded border border-gray-600 overflow-hidden">
                          <button
                            onClick={() => handleBackgroundChange('type', 'color')}
                            className={`p-2 ${advanced.background.normal.type === 'color' ? 'bg-blue-500 text-white' : 'bg-[#2a2a2a] text-gray-400'}`}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="3" width="18" height="18" rx="2" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleBackgroundChange('type', 'gradient')}
                            className={`p-2 ${advanced.background.normal.type === 'gradient' ? 'bg-blue-500 text-white' : 'bg-[#2a2a2a] text-gray-400'}`}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <defs>
                                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                                  <stop offset="0%" stopColor="white" />
                                  <stop offset="100%" stopColor="gray" />
                                </linearGradient>
                              </defs>
                              <rect x="3" y="3" width="18" height="18" rx="2" fill="url(#grad)" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {advanced.background.normal.type === 'color' && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">Color</span>
                          <div className="flex items-center gap-2">
                            <Globe size={14} className="text-gray-400" />
                            <input
                              type="color"
                              value={advanced.background.normal.color}
                              onChange={(e) => handleBackgroundChange('color', e.target.value)}
                              className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer"
                            />
                          </div>
                        </div>
                      )}

                      {advanced.background.normal.type === 'image' && (
                        <div className="space-y-1">
                          <span className="text-xs text-gray-400">Image URL</span>
                          <input
                            type="text"
                            value={advanced.background.normal.image?.url || ''}
                            onChange={(e) => handleBackgroundChange('image', { ...(advanced.background.normal.image || { url: '', position: 'center center', repeat: 'no-repeat', size: 'cover' }), url: e.target.value })}
                            className="w-full bg-[#2a2a2a] border border-gray-600 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                            placeholder="Enter image URL"
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Transform Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <ChevronDown size={16} />
                  <span className="font-medium">Transform</span>
                </div>

                {/* Normal/Hover Tabs */}
                <div className="flex bg-[#2a2a2a] rounded border border-gray-700 overflow-hidden">
                  <button
                    onClick={() => setTransformTab('normal')}
                    className={`flex-1 py-2 text-xs ${transformTab === 'normal' ? 'bg-gray-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
                  >
                    Normal
                  </button>
                  <button
                    onClick={() => setTransformTab('hover')}
                    className={`flex-1 py-2 text-xs ${transformTab === 'hover' ? 'bg-gray-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
                  >
                    Hover
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Rotate</span>
                    <button className="p-1 hover:bg-gray-700 rounded">
                      <Edit3 size={12} className="text-gray-400" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Offset</span>
                    <button className="p-1 hover:bg-gray-700 rounded">
                      <Edit3 size={12} className="text-gray-400" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Scale</span>
                    <button className="p-1 hover:bg-gray-700 rounded">
                      <Edit3 size={12} className="text-gray-400" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Skew</span>
                    <button className="p-1 hover:bg-gray-700 rounded">
                      <Edit3 size={12} className="text-gray-400" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Flip Horizontal</span>
                    <button className="p-1 hover:bg-gray-700 rounded text-gray-400">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 4v16M4 8l4-4M4 16l4 4M20 8l-4-4M20 16l-4 4" />
                      </svg>
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Flip Vertical</span>
                    <button className="p-1 hover:bg-gray-700 rounded text-gray-400">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 12h16M8 4l-4 4M8 20l-4-4M16 4l4 4M16 20l4-4" />
                      </svg>
                    </button>
                  </div>

                  {/* Transition Duration only shows in Hover tab */}
                  {transformTab === 'hover' && (
                    <div className="space-y-1 pt-2 border-t border-gray-700">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">Transition Duration (ms)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min="0"
                          max="1000"
                          step="50"
                          className="flex-1 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                        />
                        <input
                          type="number"
                          defaultValue={300}
                          className="w-16 bg-[#2a2a2a] border border-gray-600 rounded px-2 py-1 text-xs text-white text-center"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Border Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <ChevronDown size={16} />
                  <span className="font-medium">Border</span>
                </div>

                {/* Normal/Hover Tabs */}
                <div className="flex bg-[#2a2a2a] rounded border border-gray-700 overflow-hidden">
                  <button
                    onClick={() => setBorderTab('normal')}
                    className={`flex-1 py-2 text-xs ${borderTab === 'normal' ? 'bg-gray-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
                  >
                    Normal
                  </button>
                  <button
                    onClick={() => setBorderTab('hover')}
                    className={`flex-1 py-2 text-xs ${borderTab === 'hover' ? 'bg-gray-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
                  >
                    Hover
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Border Type</span>
                    <div className="relative">
                      <select
                        value={advanced.border.normal.type}
                        onChange={(e) => handleBorderChange('type', e.target.value)}
                        className="bg-[#2a2a2a] border border-gray-600 rounded px-3 py-2 text-xs text-white appearance-none pr-6 focus:outline-none"
                      >
                        <option value="none">Default</option>
                        <option value="solid">Solid</option>
                        <option value="dashed">Dashed</option>
                        <option value="dotted">Dotted</option>
                        <option value="double">Double</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">Border Radius</span>
                      <div className="flex items-center gap-2">
                        <Monitor size={10} className="text-gray-500" />
                        <span className="text-xs text-gray-500">px</span>
                        <button
                          onClick={() => handleBorderChange('radiusLinked', !advanced.border.normal.radiusLinked)}
                          className={`p-1 rounded ${advanced.border.normal.radiusLinked ? 'text-blue-400' : 'text-gray-500'}`}
                        >
                          <LinkIcon size={12} style={{ transform: advanced.border.normal.radiusLinked ? 'none' : 'rotate(-45deg)' }} />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-1">
                      <input
                        type="number"
                        value={advanced.border.normal.radiusTop}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          if (advanced.border.normal.radiusLinked) {
                            handleBorderChange('radius', val);
                            handleBorderChange('radiusTop', val);
                            handleBorderChange('radiusRight', val);
                            handleBorderChange('radiusBottom', val);
                            handleBorderChange('radiusLeft', val);
                          } else {
                            handleBorderChange('radiusTop', val);
                          }
                        }}
                        className="w-full bg-[#2a2a2a] border border-gray-600 rounded px-2 py-1.5 text-xs text-white text-center focus:outline-none focus:border-blue-500"
                      />
                      <input
                        type="number"
                        value={advanced.border.normal.radiusRight}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          if (advanced.border.normal.radiusLinked) {
                            handleBorderChange('radius', val);
                            handleBorderChange('radiusTop', val);
                            handleBorderChange('radiusRight', val);
                            handleBorderChange('radiusBottom', val);
                            handleBorderChange('radiusLeft', val);
                          } else {
                            handleBorderChange('radiusRight', val);
                          }
                        }}
                        className="w-full bg-[#2a2a2a] border border-gray-600 rounded px-2 py-1.5 text-xs text-white text-center focus:outline-none focus:border-blue-500"
                      />
                      <input
                        type="number"
                        value={advanced.border.normal.radiusBottom}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          if (advanced.border.normal.radiusLinked) {
                            handleBorderChange('radius', val);
                            handleBorderChange('radiusTop', val);
                            handleBorderChange('radiusRight', val);
                            handleBorderChange('radiusBottom', val);
                            handleBorderChange('radiusLeft', val);
                          } else {
                            handleBorderChange('radiusBottom', val);
                          }
                        }}
                        className="w-full bg-[#2a2a2a] border border-gray-600 rounded px-2 py-1.5 text-xs text-white text-center focus:outline-none focus:border-blue-500"
                      />
                      <input
                        type="number"
                        value={advanced.border.normal.radiusLeft}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          if (advanced.border.normal.radiusLinked) {
                            handleBorderChange('radius', val);
                            handleBorderChange('radiusTop', val);
                            handleBorderChange('radiusRight', val);
                            handleBorderChange('radiusBottom', val);
                            handleBorderChange('radiusLeft', val);
                          } else {
                            handleBorderChange('radiusLeft', val);
                          }
                        }}
                        className="w-full bg-[#2a2a2a] border border-gray-600 rounded px-2 py-1.5 text-xs text-white text-center focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="flex justify-center gap-4 text-[10px] text-gray-500">
                      <span>Top</span>
                      <span>Right</span>
                      <span>Bottom</span>
                      <span>Left</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Box Shadow</span>
                    <button className="p-1 hover:bg-gray-700 rounded">
                      <Edit3 size={12} className="text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Responsive Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <ChevronDown size={16} />
                  <span className="font-medium">Responsive</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-300">Hide On Desktop</span>
                    <button
                      onClick={() => handleResponsiveChange('hideOnDesktop', !advanced.responsive.hideOnDesktop)}
                      className={`w-12 h-6 rounded-full relative transition-colors ${
                        advanced.responsive.hideOnDesktop ? 'bg-blue-500' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                          advanced.responsive.hideOnDesktop ? 'left-7' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-300">Hide On Tablet Portrait</span>
                    <button
                      onClick={() => handleResponsiveChange('hideOnTabletPortrait', !advanced.responsive.hideOnTabletPortrait)}
                      className={`w-12 h-6 rounded-full relative transition-colors ${
                        advanced.responsive.hideOnTabletPortrait ? 'bg-blue-500' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                          advanced.responsive.hideOnTabletPortrait ? 'left-7' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-300">Hide On Mobile Portrait</span>
                    <button
                      onClick={() => handleResponsiveChange('hideOnMobilePortrait', !advanced.responsive.hideOnMobilePortrait)}
                      className={`w-12 h-6 rounded-full relative transition-colors ${
                        advanced.responsive.hideOnMobilePortrait ? 'bg-blue-500' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                          advanced.responsive.hideOnMobilePortrait ? 'left-7' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <button className="flex items-center gap-2 text-xs text-gray-400 hover:text-gray-300 mx-auto">
          <HelpCircle size={14} />
          Need Help
        </button>
      </div>
    </div>
  );
};

export default HeadingEditor;
