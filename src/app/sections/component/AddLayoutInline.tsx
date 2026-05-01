'use client';

import React, { useState } from 'react';
import { Plus, Grid3X3, LayoutTemplate, ArrowLeft } from 'lucide-react';
import { LayoutType, LayoutConfig, FLEX_LAYOUTS, GRID_LAYOUTS } from '@/app/store/layoutSlice';

interface AddLayoutInlineProps {
  currentPage: string;
  onAddLayout: (type: LayoutType, config: LayoutConfig, name: string) => void;
}

type SelectionStep = 'initial' | 'type-select' | 'layout-select';

export default function AddLayoutInline({ currentPage, onAddLayout }: AddLayoutInlineProps) {
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
      onAddLayout(selectedType, selectedLayout.config, selectedLayout.name);
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

  // Render layout preview visual
  const renderLayoutPreview = (layoutId: string, type: LayoutType) => {
    const isFlex = type === 'flex';
    
    const getLayoutVisual = () => {
      switch (layoutId) {
        case 'flex-1':
          return <div className="flex flex-col gap-1 w-full h-full"><div className="flex-1 bg-gray-300 rounded" /><div className="flex-1 bg-gray-300 rounded" /><div className="flex-1 bg-gray-300 rounded" /></div>;
        case 'flex-2':
          return <div className="flex flex-row gap-1 w-full h-full"><div className="flex-1 bg-gray-300 rounded" /><div className="flex-1 bg-gray-300 rounded" /></div>;
        case 'flex-3':
          return <div className="flex flex-row gap-1 w-full h-full"><div className="flex-1 bg-gray-300 rounded" /><div className="flex-1 bg-gray-300 rounded" /><div className="flex-1 bg-gray-300 rounded" /></div>;
        case 'flex-4':
          return <div className="flex flex-col items-center justify-center gap-1 w-full h-full"><div className="w-2/3 h-4 bg-gray-300 rounded" /><div className="w-1/2 h-4 bg-gray-300 rounded" /></div>;
        case 'flex-5':
          return <div className="flex flex-row gap-1 w-full h-full"><div className="w-1/3 bg-gray-300 rounded" /><div className="flex-1 bg-gray-300 rounded" /></div>;
        case 'flex-6':
          return <div className="flex flex-col items-center justify-center gap-2 w-full h-full"><div className="w-3/4 h-6 bg-gray-300 rounded" /><div className="w-1/2 h-4 bg-gray-300 rounded" /></div>;
        case 'grid-1':
          return <div className="grid grid-cols-2 gap-1 w-full h-full"><div className="bg-gray-300 rounded" /><div className="bg-gray-300 rounded" /><div className="bg-gray-300 rounded" /><div className="bg-gray-300 rounded" /></div>;
        case 'grid-2':
          return <div className="grid grid-cols-3 gap-1 w-full h-full"><div className="bg-gray-300 rounded" /><div className="bg-gray-300 rounded" /><div className="bg-gray-300 rounded" /><div className="bg-gray-300 rounded" /><div className="bg-gray-300 rounded" /><div className="bg-gray-300 rounded" /></div>;
        case 'grid-3':
          return <div className="grid grid-cols-4 gap-1 w-full h-full"><div className="bg-gray-300 rounded" /><div className="bg-gray-300 rounded" /><div className="bg-gray-300 rounded" /><div className="bg-gray-300 rounded" /></div>;
        case 'grid-4':
          return <div className="grid grid-cols-2 gap-1 w-full h-full"><div className="bg-gray-300 rounded row-span-2" /><div className="bg-gray-300 rounded" /><div className="bg-gray-300 rounded" /></div>;
        case 'grid-5':
          return <div className="grid grid-cols-2 gap-1 w-full h-full"><div className="bg-gray-300 rounded col-span-2" /><div className="bg-gray-300 rounded" /><div className="bg-gray-300 rounded" /></div>;
        case 'grid-6':
          return <div className="grid grid-cols-3 gap-1 w-full h-full"><div className="bg-gray-300 rounded col-span-2" /><div className="bg-gray-300 rounded" /><div className="bg-gray-300 rounded" /><div className="bg-gray-300 rounded col-span-2" /></div>;
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
      <div id="add-new-layout" className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center gap-3 hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer group min-h-40 mx-4 mb-8 mt-8 bg-gray-50"
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
      <div id="add-new-layout" className="border-2 border-dashed border-gray-300 rounded-xl p-6 mx-4 mb-8 mt-8 bg-gray-50">
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h3 className="text-lg font-semibold text-gray-900">Which layout would you like to use?</h3>
          <div className="w-9" />
        </div>

        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
          <button
            onClick={() => handleTypeSelect('flex')}
            className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-400 hover:shadow-lg transition-all group flex flex-col items-center gap-4 bg-white"
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

          <button
            onClick={() => handleTypeSelect('grid')}
            className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-400 hover:shadow-lg transition-all group flex flex-col items-center gap-4 bg-white"
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
    );
  }

  // Layout selection step
  if (step === 'layout-select' && selectedType) {
    const layouts = selectedType === 'flex' ? FLEX_LAYOUTS : GRID_LAYOUTS;
    const typeLabel = selectedType === 'flex' ? 'Flexbox' : 'Grid';

    return (
      <div id="add-new-layout" className="border-2 border-dashed border-gray-300 rounded-xl p-6 mx-4 mb-8 mt-8 bg-gray-50">
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h3 className="text-lg font-semibold text-gray-900">Select your structure</h3>
          <div className="w-9" />
        </div>

        <p className="text-sm text-gray-500 mb-4 text-center">{typeLabel} Layouts</p>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {layouts.map((layout) => (
            <button
              key={layout.id}
              onClick={() => handleLayoutSelect(layout.id)}
              className="p-4 border-2 border-gray-200 rounded-xl hover:border-blue-400 hover:shadow-md transition-all group flex flex-col items-center gap-2 min-h-25 bg-white"
            >
              <div className="w-full h-16">
                {renderLayoutPreview(layout.id, selectedType)}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
