'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Plus } from 'lucide-react';
import { LayoutItem, LayoutComponent } from '@/app/store/layoutSlice';
import ComponentRenderer from '../../components/HomePage/ComponentRenderer';

interface LayoutProps {
  layout: LayoutItem;
  isInIframe?: boolean;
  onClick?: () => void;
}

// Component renderer for layout items
const renderComponent = (component: LayoutComponent) => {
  const { type, content, styles } = component;

  switch (type) {
    case 'heading':
      return (
        <h3 
          className="text-2xl font-bold text-gray-900"
          style={{
            color: styles?.color,
            fontSize: styles?.fontSize,
            textAlign: styles?.textAlign as 'left' | 'center' | 'right',
          }}
        >
          {(content?.text as string) || 'Heading'}
        </h3>
      );
    
    case 'text':
      return (
        <p 
          className="text-base text-gray-600 leading-relaxed"
          style={{
            color: styles?.color,
            fontSize: styles?.fontSize,
            textAlign: styles?.textAlign as 'left' | 'center' | 'right',
          }}
        >
          {(content?.text as string) || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'}
        </p>
      );
    
    case 'image':
      if (content?.src) {
        return (
          <div className="relative w-full aspect-video">
            <Image
              src={content.src as string}
              alt={(content?.alt as string) || 'Image'}
              fill
              className="object-cover rounded-lg"
            />
          </div>
        );
      }
      return (
        <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
          <span className="text-gray-400">Image Placeholder</span>
        </div>
      );
    
    case 'button':
      return (
        <button
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          style={{
            backgroundColor: styles?.backgroundColor,
            color: styles?.color,
            borderRadius: styles?.borderRadius,
          }}
        >
          {(content?.text as string) || 'Click Me'}
        </button>
      );
    
    case 'video':
      return (
        <div className="w-full aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
          <span className="text-white">Video Placeholder</span>
        </div>
      );
    
    case 'divider':
      return <hr className="w-full border-t border-gray-300" />;
    
    case 'spacer':
      return <div className="h-8" />;
    
    case 'icon':
      return (
        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
      );
    
    case 'google-maps':
      return (
        <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
          <span className="text-gray-400">Google Maps Placeholder</span>
        </div>
      );
    
    case 'optinmonster':
      return (
        <div className="w-full p-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white text-center">
          <span className="font-medium">OptinMonster Widget</span>
        </div>
      );
    
    default:
      return null;
  }
};

export default function Layout({ layout, isInIframe = false, onClick }: LayoutProps) {
  const { type, config, components, styles, id } = layout;
  
  // Base wrapper classes
  const wrapperClasses = isInIframe 
    ? "cursor-pointer hover:ring-2 hover:ring-blue-400 hover:ring-inset scroll-mt-20" 
    : "scroll-mt-20";

  // Generate grid template style
  const getGridStyle = (): React.CSSProperties => {
    if (type !== 'grid') return {};
    
    const { columns = 1, rows = 1, gap = 16 } = config;
    return {
      display: 'grid',
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gridTemplateRows: rows ? `repeat(${rows}, auto)` : undefined,
      gap: `${gap}px`,
    };
  };

  // Generate flex style
  const getFlexStyle = (): React.CSSProperties => {
    if (type !== 'flex') return {};
    
    const { 
      flexDirection = 'row', 
      justifyContent = 'flex-start', 
      alignItems = 'stretch',
      gap = 16,
      wrap = false 
    } = config;
    
    return {
      display: 'flex',
      flexDirection: flexDirection as 'row' | 'column' | 'row-reverse' | 'column-reverse',
      justifyContent,
      alignItems,
      gap: `${gap}px`,
      flexWrap: wrap ? 'wrap' : 'nowrap',
    };
  };

  // Section wrapper styles
  const sectionStyle: React.CSSProperties = {
    backgroundColor: styles?.backgroundColor || 'transparent',
    padding: styles?.padding || '2rem',
    margin: styles?.margin || '0',
    borderRadius: styles?.borderRadius || '0',
    minHeight: styles?.minHeight || 'auto',
  };

  // Empty state - no components yet
  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center border-2 border-dashed border-gray-300 rounded-lg">
      <div className="flex gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        </div>
      </div>
      <p className="text-gray-500 text-sm italic">Drag widget here</p>
    </div>
  );

  // Handle cell click
  const handleCellClick = (cellIndex: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isInIframe && window.parent) {
      window.parent.postMessage({
        type: 'LAYOUT_CELL_CLICK',
        layoutId: id,
        cellIndex
      }, '*');
    }
    onClick?.();
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent, cellIndex: number) => {
    e.preventDefault();
    const componentType = e.dataTransfer.getData('componentType');
    
    if (componentType && isInIframe && window.parent) {
      window.parent.postMessage({
        type: 'COMPONENT_DROPPED',
        layoutId: id,
        cellIndex,
        componentType
      }, '*');
    }
  };

  // Render grid cells
  const renderGridCells = () => {
    const { columns = 2, rows = 2 } = config;
    const cellCount = columns * rows;
    
    return (
      <div style={getGridStyle()} className="w-full h-full gap-4">
        {Array.from({ length: cellCount }).map((_, index) => {
          const cellComponents = components.filter(c => c.cellIndex === index);
          const hasComponents = cellComponents.length > 0;
          
          return (
            <div
              key={`cell-${index}`}
              className={`relative border-2 ${hasComponents ? 'border-solid border-gray-200' : 'border-dashed border-gray-300'} rounded-lg p-4 min-h-[200px] transition-all group ${
                isInIframe ? 'hover:ring-2 hover:ring-blue-400' : ''
              } ${hasComponents ? 'bg-white' : 'hover:border-blue-400 hover:bg-blue-50/30 cursor-pointer'}`}
              onClick={(e) => !hasComponents && handleCellClick(index, e)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
            >
              {!hasComponents && (
                <>
                  {/* Widget Selector Toolbar - appears on hover/active */}
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 flex items-center gap-1 bg-gradient-to-r from-pink-200 to-purple-200 rounded-full px-2 py-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button className="w-6 h-6 rounded-full bg-white/80 flex items-center justify-center hover:bg-white transition-colors">
                      <Plus size={14} className="text-gray-700" />
                    </button>
                    <button className="w-6 h-6 rounded-full bg-white/80 flex items-center justify-center hover:bg-white transition-colors">
                      <svg className="w-3.5 h-3.5 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3 3h18v18H3V3zm16 16V5H5v14h14zM7 7h4v4H7V7zm0 6h4v4H7v-4zm6-6h4v4h-4V7zm0 6h4v4h-4v-4z"/>
                      </svg>
                    </button>
                    <button className="w-6 h-6 rounded-full bg-white/80 flex items-center justify-center hover:bg-white transition-colors">
                      <svg className="w-3.5 h-3.5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="flex gap-2 mb-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                        <Plus size={16} className="text-gray-600" />
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm">Drag widget here</p>
                  </div>
                </>
              )}
              
              {hasComponents && (
                <div className="space-y-4">
                  {cellComponents.map((component) => (
                    <div key={component.id} className="layout-component">
                      <ComponentRenderer component={component} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Render flex cells
  const renderFlexCells = () => {
    const { flexDirection = 'row' } = config;
    const isRow = flexDirection === 'row' || flexDirection === 'row-reverse';
    const cellCount = isRow ? 2 : 1;
    
    return (
      <div style={getFlexStyle()} className="w-full h-full gap-4">
        {Array.from({ length: cellCount }).map((_, index) => {
          const cellComponents = components.filter(c => c.cellIndex === index);
          const hasComponents = cellComponents.length > 0;
          
          return (
            <div
              key={`cell-${index}`}
              className={`flex-1 border-2 ${hasComponents ? 'border-solid border-gray-200' : 'border-dashed border-gray-300'} rounded-lg p-4 min-h-[200px] transition-all ${
                isInIframe ? 'hover:ring-2 hover:ring-blue-400' : ''
              } ${hasComponents ? 'bg-white' : 'hover:border-blue-400 hover:bg-blue-50/30 cursor-pointer'}`}
              onClick={(e) => !hasComponents && handleCellClick(index, e)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
            >
              {!hasComponents ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="flex gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-blue-100 transition-colors">
                      <Plus size={16} className="text-gray-600" />
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm">Click to add widget</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cellComponents.map((component) => (
                    <div key={component.id} className="layout-component">
                      <ComponentRenderer component={component} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <section
      id={id}
      className={`layout-section w-full ${wrapperClasses}`}
      style={{
        ...sectionStyle,
        minHeight: '300px',
      }}
      onClick={isInIframe ? onClick : undefined}
    >
      <div className="w-full h-full px-4 py-8">
        {type === 'grid' ? renderGridCells() : renderFlexCells()}
      </div>
    </section>
  );
}
