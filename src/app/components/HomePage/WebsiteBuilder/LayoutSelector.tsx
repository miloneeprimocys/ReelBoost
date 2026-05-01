'use client';

import React, { useState } from 'react';
import { Plus, Grid3X3, LayoutTemplate, ArrowLeft, X } from 'lucide-react';
import { LayoutType, FLEX_LAYOUTS, GRID_LAYOUTS, LayoutConfig } from '@/app/store/layoutSlice';

interface LayoutSelectorProps {
  onSelectLayout: (type: LayoutType, config: LayoutConfig, name: string) => void;
  onCancel?: () => void;
}

type SelectionStep = 'initial' | 'type-select' | 'layout-select';

export default function LayoutSelector({ onSelectLayout, onCancel }: LayoutSelectorProps) {
  const [step, setStep] = useState<SelectionStep>('initial');
  const [selectedType, setSelectedType] = useState<LayoutType | null>(null);

  const handleTypeSelect = (type: LayoutType) => {
    setSelectedType(type);
    setStep('layout-select');
  };

  const handleLayoutSelect = (layoutId: string) => {
    if (!selectedType) return;

    const layouts = selectedType === 'flex' ? FLEX_LAYOUTS : GRID_LAYOUTS;
    const selectedLayout = layouts.find(l => l.id === layoutId);
    
    if (selectedLayout) {
      onSelectLayout(selectedType, selectedLayout.config, selectedLayout.name);
      // Reset state
      setStep('initial');
      setSelectedType(null);
    }
  };

  const handleBack = () => {
    if (step === 'layout-select') {
      setStep('type-select');
      setSelectedType(null);
    } else if (step === 'type-select') {
      setStep('initial');
    }
  };

  const handleClose = () => {
    setStep('initial');
    setSelectedType(null);
    onCancel?.();
  };

  // Render layout preview visual
  const renderLayoutPreview = (layoutId: string, type: LayoutType) => {
    const isFlex = type === 'flex';
    
    // Simple visual representations of layouts
    const getLayoutVisual = () => {
      switch (layoutId) {
        // Flex layouts
        case 'flex-1': // Single Column
          return (
            <div className="flex flex-col gap-1 w-full h-full">
              <div className="flex-1 bg-gray-300 rounded" />
              <div className="flex-1 bg-gray-300 rounded" />
              <div className="flex-1 bg-gray-300 rounded" />
            </div>
          );
        case 'flex-2': // Two Columns
          return (
            <div className="flex flex-row gap-1 w-full h-full">
              <div className="flex-1 bg-gray-300 rounded" />
              <div className="flex-1 bg-gray-300 rounded" />
            </div>
          );
        case 'flex-3': // Three Columns
          return (
            <div className="flex flex-row gap-1 w-full h-full">
              <div className="flex-1 bg-gray-300 rounded" />
              <div className="flex-1 bg-gray-300 rounded" />
              <div className="flex-1 bg-gray-300 rounded" />
            </div>
          );
        case 'flex-4': // Centered Content
          return (
            <div className="flex flex-col items-center justify-center gap-1 w-full h-full">
              <div className="w-2/3 h-4 bg-gray-300 rounded" />
              <div className="w-1/2 h-4 bg-gray-300 rounded" />
            </div>
          );
        case 'flex-5': // Sidebar + Content
          return (
            <div className="flex flex-row gap-1 w-full h-full">
              <div className="w-1/3 bg-gray-300 rounded" />
              <div className="flex-1 bg-gray-300 rounded" />
            </div>
          );
        case 'flex-6': // Hero Layout
          return (
            <div className="flex flex-col items-center justify-center gap-2 w-full h-full">
              <div className="w-3/4 h-6 bg-gray-300 rounded" />
              <div className="w-1/2 h-4 bg-gray-300 rounded" />
            </div>
          );
        // Grid layouts
        case 'grid-1': // 2x2 Grid
          return (
            <div className="grid grid-cols-2 gap-1 w-full h-full">
              <div className="bg-gray-300 rounded" />
              <div className="bg-gray-300 rounded" />
              <div className="bg-gray-300 rounded" />
              <div className="bg-gray-300 rounded" />
            </div>
          );
        case 'grid-2': // 3x2 Grid
          return (
            <div className="grid grid-cols-3 gap-1 w-full h-full">
              <div className="bg-gray-300 rounded" />
              <div className="bg-gray-300 rounded" />
              <div className="bg-gray-300 rounded" />
              <div className="bg-gray-300 rounded" />
              <div className="bg-gray-300 rounded" />
              <div className="bg-gray-300 rounded" />
            </div>
          );
        case 'grid-3': // 4x1 Grid
          return (
            <div className="grid grid-cols-4 gap-1 w-full h-full">
              <div className="bg-gray-300 rounded" />
              <div className="bg-gray-300 rounded" />
              <div className="bg-gray-300 rounded" />
              <div className="bg-gray-300 rounded" />
            </div>
          );
        case 'grid-4': // Masonry 2 Col
          return (
            <div className="grid grid-cols-2 gap-1 w-full h-full">
              <div className="bg-gray-300 rounded row-span-2" />
              <div className="bg-gray-300 rounded" />
              <div className="bg-gray-300 rounded" />
            </div>
          );
        case 'grid-5': // Featured + Grid
          return (
            <div className="grid grid-cols-2 gap-1 w-full h-full">
              <div className="bg-gray-300 rounded col-span-2" />
              <div className="bg-gray-300 rounded" />
              <div className="bg-gray-300 rounded" />
            </div>
          );
        case 'grid-6': // Asymmetric
          return (
            <div className="grid grid-cols-3 gap-1 w-full h-full">
              <div className="bg-gray-300 rounded col-span-2" />
              <div className="bg-gray-300 rounded" />
              <div className="bg-gray-300 rounded" />
              <div className="bg-gray-300 rounded col-span-2" />
            </div>
          );
        default:
          return <div className="w-full h-full bg-gray-300 rounded" />;
      }
    };

    return (
      <div className="w-full h-full p-2 bg-gray-100 rounded">
        {getLayoutVisual()}
      </div>
    );
  };

  // Initial step - show plus button
  if (step === 'initial') {
    return (
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center gap-3 hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer group min-h-[160px]"
        onClick={() => setStep('type-select')}>
        <div className="flex gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-white flex items-center justify-center transition-colors shadow-sm">
            <Plus className="w-6 h-6 text-gray-600" />
          </div>
        </div>
        <span className="text-sm text-gray-500 group-hover:text-blue-600 font-medium">Add Layout</span>
      </div>
    );
  }

  // Type selection step
  if (step === 'type-select') {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <button 
              onClick={handleBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900">Which layout would you like to use?</h2>
            <button 
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Layout Type Options */}
          <div className="p-8">
            <div className="grid grid-cols-2 gap-6">
              {/* Flexbox Option */}
              <button
                onClick={() => handleTypeSelect('flex')}
                className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-400 hover:shadow-lg transition-all group flex flex-col items-center gap-4"
              >
                <div className="w-32 h-24 bg-gray-100 rounded-lg p-3 group-hover:bg-blue-50 transition-colors">
                  <div className="w-full h-full flex flex-col gap-1">
                    <div className="flex-1 bg-gray-300 rounded" />
                    <div className="flex-1 bg-gray-300 rounded" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <LayoutTemplate className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
                  <span className="font-medium text-gray-900 group-hover:text-blue-600">Flexbox</span>
                </div>
              </button>

              {/* Grid Option */}
              <button
                onClick={() => handleTypeSelect('grid')}
                className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-400 hover:shadow-lg transition-all group flex flex-col items-center gap-4"
              >
                <div className="w-32 h-24 bg-gray-100 rounded-lg p-3 group-hover:bg-blue-50 transition-colors">
                  <div className="w-full h-full grid grid-cols-2 gap-1">
                    <div className="bg-gray-300 rounded" />
                    <div className="bg-gray-300 rounded" />
                    <div className="bg-gray-300 rounded" />
                    <div className="bg-gray-300 rounded" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Grid3X3 className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
                  <span className="font-medium text-gray-900 group-hover:text-blue-600">Grid</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Layout selection step
  if (step === 'layout-select' && selectedType) {
    const layouts = selectedType === 'flex' ? FLEX_LAYOUTS : GRID_LAYOUTS;
    const typeLabel = selectedType === 'flex' ? 'Flexbox' : 'Grid';

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <button 
              onClick={handleBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900">Select your structure</h2>
            <button 
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Layout Grid */}
          <div className="p-6 overflow-y-auto">
            <p className="text-sm text-gray-500 mb-4 text-center">{typeLabel} Layouts</p>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              {layouts.map((layout) => (
                <button
                  key={layout.id}
                  onClick={() => handleLayoutSelect(layout.id)}
                  className="p-4 border-2 border-gray-200 rounded-xl hover:border-blue-400 hover:shadow-md transition-all group flex flex-col items-center gap-2 min-h-[100px]"
                >
                  <div className="w-full h-16">
                    {renderLayoutPreview(layout.id, selectedType)}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
