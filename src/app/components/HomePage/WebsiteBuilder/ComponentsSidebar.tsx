'use client';

import React from 'react';
import { 
  Type, 
  Image, 
  Video, 
  Square, 
  Minus, 
  MapPin, 
  Star,
  MousePointer2,
  Sparkles,
  LayoutGrid,
  Type as TypeIcon,
  Image as ImageIcon,
  Play,
  Square as ButtonIcon,
  Minus as DividerIcon,
  MapPin as MapsIcon,
  Star as IconStar
} from 'lucide-react';

export type ComponentType = 
  | 'heading' 
  | 'text' 
  | 'image' 
  | 'video' 
  | 'button' 
  | 'divider' 
  | 'spacer' 
  | 'icon'
  | 'google-maps'
  | 'optinmonster';

interface ComponentItem {
  id: string;
  type: ComponentType;
  name: string;
  icon: React.ReactNode;
  category: 'basic' | 'media' | 'layout';
}

const COMPONENT_LIST: ComponentItem[] = [
  { id: 'heading', type: 'heading', name: 'Heading', icon: <TypeIcon size={20} />, category: 'basic' },
  { id: 'text', type: 'text', name: 'Text Editor', icon: <Type size={20} />, category: 'basic' },
  { id: 'image', type: 'image', name: 'Image', icon: <ImageIcon size={20} />, category: 'media' },
  { id: 'video', type: 'video', name: 'Video', icon: <Play size={20} />, category: 'media' },
  { id: 'button', type: 'button', name: 'Button', icon: <ButtonIcon size={20} />, category: 'basic' },
  { id: 'divider', type: 'divider', name: 'Divider', icon: <DividerIcon size={20} />, category: 'layout' },
  { id: 'spacer', type: 'spacer', name: 'Spacer', icon: <LayoutGrid size={20} />, category: 'layout' },
  { id: 'icon', type: 'icon', name: 'Icon', icon: <IconStar size={20} />, category: 'basic' },
  { id: 'google-maps', type: 'google-maps', name: 'Google Maps', icon: <MapsIcon size={20} />, category: 'media' },
];

interface ComponentsSidebarProps {
  onDragStart?: (componentType: ComponentType) => void;
}

export default function ComponentsSidebar({ onDragStart }: ComponentsSidebarProps) {
  const handleDragStart = (e: React.DragEvent, component: ComponentItem) => {
    e.dataTransfer.setData('componentType', component.type);
    e.dataTransfer.setData('componentId', component.id);
    e.dataTransfer.effectAllowed = 'copy';
    onDragStart?.(component.type);
  };

  const basicComponents = COMPONENT_LIST.filter(c => c.category === 'basic');
  const mediaComponents = COMPONENT_LIST.filter(c => c.category === 'media');
  const layoutComponents = COMPONENT_LIST.filter(c => c.category === 'layout');

  const renderComponentItem = (component: ComponentItem) => (
    <div
      key={component.id}
      draggable
      onDragStart={(e) => handleDragStart(e, component)}
      className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg cursor-grab hover:border-blue-400 hover:shadow-md transition-all active:cursor-grabbing group"
    >
      <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-600 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
        {component.icon}
      </div>
      <span className="text-sm font-medium text-gray-700">{component.name}</span>
    </div>
  );

  return (
    <div className="w-full h-full bg-gray-50 flex flex-col">
      <div className="p-4 border-b border-gray-200 bg-white">
        <h2 className="text-lg font-semibold text-gray-900">Components</h2>
        <p className="text-xs text-gray-500 mt-1">Drag to add to layout</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Basic Section */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <MousePointer2 size={14} />
            Basic
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {basicComponents.map(renderComponentItem)}
          </div>
        </div>

        {/* Media Section */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Image size={14} />
            Media
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {mediaComponents.map(renderComponentItem)}
          </div>
        </div>

        {/* Layout Section */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <LayoutGrid size={14} />
            Layout
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {layoutComponents.map(renderComponentItem)}
          </div>
        </div>

        {/* OptinMonster */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Sparkles size={14} />
            Marketing
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <div
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('componentType', 'optinmonster');
                e.dataTransfer.setData('componentId', 'optinmonster');
              }}
              className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg cursor-grab hover:border-blue-400 hover:shadow-md transition-all active:cursor-grabbing group"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center text-pink-600">
                <Sparkles size={20} />
              </div>
              <span className="text-sm font-medium text-gray-700">OptinMonster</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
