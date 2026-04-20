import React, { useState } from 'react';
import { useAppDispatch } from '../../../hooks/reduxHooks';
import { addSectionAndSetActive } from '../../../store/builderSlice';
import { Plus } from 'lucide-react';

type SectionType = 'hero' | 'banner' | 'live-streaming' | 'pk-battle' | 'features' | 'admin-panel' | 'benefits' | 'testimonials' | 'faq' | 'subscription-plan' | 'second' | 'third' | 'fourth' | 'fifth' | 'sixth';

interface AddSectionBoxProps {
  onSectionAdded?: () => void;
}

const AddSectionBox: React.FC<AddSectionBoxProps> = ({ onSectionAdded }) => {
  const dispatch = useAppDispatch();
  const [showOptions, setShowOptions] = useState(false);

  const sectionTypes: { type: SectionType; name: string; description: string }[] = [
    { type: 'hero', name: 'Hero', description: 'Main hero section with title and CTA' },
    { type: 'fourth', name: 'Features', description: 'Feature showcase with grid layout' },
    { type: 'second', name: 'Live Streaming', description: 'Live streaming section with features' },
    { type: 'third', name: 'PK Battle', description: 'Competition battle section' },
    { type: 'fifth', name: 'Admin Panel', description: 'Admin dashboard with tabs' },
    { type: 'sixth', name: 'Benefits', description: 'Benefits grid with icons' },
    { type: 'testimonials', name: 'Testimonials', description: 'Customer testimonials with ratings' },
    { type: 'faq', name: 'FAQ', description: 'Frequently asked questions section' },
    { type: 'subscription-plan', name: 'Pricing Plans', description: 'Subscription pricing plans with features' },
  ];

  const handleAddSection = (type: SectionType, name: string) => {
    dispatch(addSectionAndSetActive({ type, name }));
    setShowOptions(false);
    if (onSectionAdded) {
      onSectionAdded();
    }
  };

  if (showOptions) {
    return (
      <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 m-4 bg-blue-50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Choose Section Type</h3>
          <button
            onClick={() => setShowOptions(false)}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            ×
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sectionTypes.map((sectionType) => (
            <button
              key={sectionType.type}
              onClick={() => handleAddSection(sectionType.type, sectionType.name)}
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 text-left group"
            >
              <div className="flex items-center mb-2">
                <Plus className="w-5 h-5 text-blue-500 mr-2" />
                <span className="font-medium text-gray-900 group-hover:text-blue-600">
                  {sectionType.name}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                {sectionType.description}
              </p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 m-4 hover:border-gray-400 transition-colors">
      <button 
        onClick={() => setShowOptions(true)}
        className="w-full h-20 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-200"
      >
        <Plus className="w-8 h-8 mr-3" />
        <span className="text-lg font-medium">Add New Section</span>
      </button>
    </div>
  );
};

export default AddSectionBox;
