import React from 'react';
import { useAppSelector, useAppDispatch } from '../../../hooks/reduxHooks';
import { setInlineEditMode } from '../../../store/builderSlice';
import InlineEditableSection from './InlineEditableSection';
import AddSectionBox from './AddSectionBox';

// Import section renderers
import Hero from '../../../Pages/Home/Hero';
import DynamicFeatures from '../../../sections/Home/DynamicFeatures';
import SecondSection from '../../../Pages/Home/SecondSection';
import ThirdSection from '../../../Pages/Home/ThirdSection';
import DynamicBanner from '../../../sections/Home/DynamicBanner';
import FifthSection from '../../../Pages/Home/FifthSection';
import DynamicBenefits from '../../../sections/Home/DynamicBenefits';

const InlineBuilder: React.FC = () => {
  const dispatch = useAppDispatch();
  const { sections } = useAppSelector(state => state.builder);

  const handleExitInlineMode = () => {
    dispatch(setInlineEditMode(false));
  };

  // Sort sections by order
  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  // Filter only visible sections
  const visibleSections = sortedSections.filter(section => section.visible !== false);

  const renderSection = (section: any) => {
    const commonProps = { key: section.id, sectionId: section.id };

    switch (section.type) {
      case 'hero':
        return (
          <InlineEditableSection key={section.id} section={section}>
            <Hero />
          </InlineEditableSection>
        );
      
      case 'fourth':
      case 'features':
        return (
          <InlineEditableSection key={section.id} section={section}>
            <DynamicFeatures section={section} />
          </InlineEditableSection>
        );
      
      case 'second':
        return (
          <InlineEditableSection key={section.id} section={section}>
            <SecondSection sectionId={section.id} />
          </InlineEditableSection>
        );
      
      case 'third':
        return (
          <InlineEditableSection key={section.id} section={section}>
            <ThirdSection sectionId={section.id} />
          </InlineEditableSection>
        );
      
      case 'banner':
        return (
          <InlineEditableSection key={section.id} section={section}>
            <DynamicBanner sectionId={section.id} />
          </InlineEditableSection>
        );
      
      case 'fifth':
      case 'admin-panel':
        return (
          <InlineEditableSection key={section.id} section={section}>
            <FifthSection sectionId={section.id} />
          </InlineEditableSection>
        );
      
      case 'sixth':
      case 'benefits':
        return (
          <InlineEditableSection key={section.id} section={section}>
            <DynamicBenefits sectionId={section.id} />
          </InlineEditableSection>
        );
      
      default:
        return (
          <InlineEditableSection key={section.id} section={section}>
            <div className="p-8 text-center text-gray-500">
              Section type "{section.type}" not implemented yet
            </div>
          </InlineEditableSection>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with exit button */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">Inline Editor Mode</h1>
            <span className="ml-4 text-sm text-gray-500">
              Click any section to edit, or add new sections below
            </span>
          </div>
          <button
            onClick={handleExitInlineMode}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Exit Editor
          </button>
        </div>
      </div>

      {/* Main content area */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Render all visible sections */}
        {visibleSections.map(renderSection)}

        {/* Add Section Box at the end */}
        <AddSectionBox />
      </div>
    </div>
  );
};

export default InlineBuilder;
