import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../../hooks/reduxHooks';
import { setEditingSection, updateSectionContent } from '../../../store/builderSlice';
import { Edit3, X, Check } from 'lucide-react';

interface InlineEditableSectionProps {
  section: any;
  children: React.ReactNode;
}

const InlineEditableSection: React.FC<InlineEditableSectionProps> = ({ section, children }) => {
  const dispatch = useAppDispatch();
  const { editingSectionId, editingField } = useAppSelector(state => state.builder);
  const [editValues, setEditValues] = useState<Record<string, any>>({});
  const [isEditing, setIsEditing] = useState(false);

  const isCurrentlyEditing = editingSectionId === section.id;

  const handleEdit = (field = 'all') => {
    setIsEditing(true);
    setEditValues(section.content || {});
    dispatch(setEditingSection({ sectionId: section.id, field }));
  };

  const handleSave = () => {
    dispatch(updateSectionContent({ id: section.id, content: editValues }));
    dispatch(setEditingSection({ sectionId: null, field: null }));
    setIsEditing(false);
  };

  const handleCancel = () => {
    dispatch(setEditingSection({ sectionId: null, field: null }));
    setIsEditing(false);
    setEditValues({});
  };

  const handleFieldChange = (field: string, value: any) => {
    setEditValues(prev => ({ ...prev, [field]: value }));
  };

  const renderEditForm = () => {
    if (!isCurrentlyEditing) return null;

    const content = section.content || {};

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Editing {section.name}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                <Check size={18} />
                Save
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                <X size={18} />
                Cancel
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Common fields for all sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
                <input
                  type="text"
                  value={editValues.title || content.title || ''}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter section title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
                <input
                  type="text"
                  value={editValues.subtitle || content.subtitle || ''}
                  onChange={(e) => handleFieldChange('subtitle', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter subtitle"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={editValues.description || content.description || ''}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter description"
                />
              </div>

              {/* Section-specific fields */}
              {section.type === 'hero' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Primary Button Text</label>
                    <input
                      type="text"
                      value={editValues.primaryButtonText || content.primaryButtonText || ''}
                      onChange={(e) => handleFieldChange('primaryButtonText', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Primary button text"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Button Text</label>
                    <input
                      type="text"
                      value={editValues.secondaryButtonText || content.secondaryButtonText || ''}
                      onChange={(e) => handleFieldChange('secondaryButtonText', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Secondary button text"
                    />
                  </div>
                </>
              )}

              {section.type === 'fourth' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Layout</label>
                    <select
                      value={editValues.layout || content.layout || 'left'}
                      onChange={(e) => handleFieldChange('layout', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="left">Image Left</option>
                      <option value="right">Image Right</option>
                      <option value="center">Center</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
                    <input
                      type="color"
                      value={editValues.backgroundColor || content.backgroundColor || '#ffffff'}
                      onChange={(e) => handleFieldChange('backgroundColor', e.target.value)}
                      className="w-full h-10 px-3 py-1 border border-gray-300 rounded-lg cursor-pointer"
                    />
                  </div>
                </>
              )}

              {/* Color fields for all sections */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title Color</label>
                <input
                  type="color"
                  value={editValues.titleColor || content.titleColor || '#000000'}
                  onChange={(e) => handleFieldChange('titleColor', e.target.value)}
                  className="w-full h-10 px-3 py-1 border border-gray-300 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description Color</label>
                <input
                  type="color"
                  value={editValues.descriptionColor || content.descriptionColor || '#666666'}
                  onChange={(e) => handleFieldChange('descriptionColor', e.target.value)}
                  className="w-full h-10 px-3 py-1 border border-gray-300 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div 
      className={`relative group ${isCurrentlyEditing ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
      id={section.id}
    >
      {/* Section Content */}
      {children}

      {/* Edit Button (visible on hover) */}
      {!isCurrentlyEditing && (
        <button 
          onClick={() => handleEdit()}
          className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 bg-blue-500 text-white p-2 rounded-lg shadow-lg transition-all duration-200 hover:bg-blue-600 z-10"
          title={`Edit ${section.name}`}
        >
          <Edit3 size={18} />
        </button>
      )}

      {/* Edit Form Modal */}
      {renderEditForm()}
    </div>
  );
};

export default InlineEditableSection;
