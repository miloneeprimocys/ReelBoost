"use client";

import React, { useState } from 'react';
import { X, AlertCircle, FileText, Link2, CheckCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../hooks/reduxHooks';
import { addPage, closeAddPageModal } from '../../../store/pagesSlice';

export default function AddPageModal() {
  const dispatch = useAppDispatch();
  const { isAddPageModalOpen, pages } = useAppSelector((state) => state.pages);
  const [pageName, setPageName] = useState('');
  const [slug, setSlug] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);

  if (!isAddPageModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!pageName.trim()) {
      setError('Page name is required');
      return;
    }

    if (!slug.trim()) {
      setError('Slug is required');
      return;
    }

    const formattedSlug = slug.startsWith('/') ? slug : `/${slug}`;
    const slugExists = pages.some(
      (p) => p.slug.toLowerCase() === formattedSlug.toLowerCase()
    );

    if (slugExists) {
      setError('A page with this slug already exists');
      return;
    }

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    dispatch(addPage({ title: pageName.trim(), slug: slug.trim() }));

    handleClose();
    setIsSubmitting(false);
  };

  const handleClose = () => {
    dispatch(closeAddPageModal());
    setPageName('');
    setSlug('');
    setError('');
    setIsSubmitting(false);
    setSlugTouched(false);
  };

  const handlePageNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setPageName(name);
    if (!slugTouched) {
      setSlug(generateSlug(name));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const cleanedSlug = value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    setSlug(cleanedSlug);
    setSlugTouched(true);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const isFormValid = pageName.trim() && slug.trim();

  return (
    <>
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300"
        onClick={handleClose}
      >
        <div 
          className="bg-white rounded-2xl shadow-2xl shadow-slate-900/20 w-full max-w-md mx-auto overflow-hidden transition-all duration-300 scale-100 flex flex-col border border-gray-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-white">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md shadow-blue-500/20">
                <FileText size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Create New Page</h2>
                <p className="text-xs text-gray-500">Add a new page to your website</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-600"
              type="button"
            >
              <X size={20} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-5 flex-1 flex flex-col space-y-5">
            <div className="space-y-4 flex-1">
              {/* Page Name */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide ml-1">
                  Page Title
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    value={pageName}
                    onChange={handlePageNameChange}
                    placeholder="e.g. About Us, Services, Contact"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:bg-white focus:border-blue-500 focus:ring-3 focus:ring-blue-500/10 outline-none transition-all duration-200 placeholder:text-gray-400 group-hover:border-gray-300"
                    autoFocus
                  />
                </div>
              </div>

              {/* Slug */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide ml-1">
                  URL Slug
                </label>
                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-4 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-3 focus-within:ring-blue-500/10 transition-all duration-200 group hover:border-gray-300">
                  <span className="text-gray-400 font-medium text-sm pr-2">/</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={handleSlugChange}
                    placeholder="about-us"
                    className="flex-1 py-3 bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400 font-mono"
                  />
                  <Link2 size={14} className="text-gray-400" />
                </div>
                <div className="px-1 flex items-center gap-2">
                  <span className="text-xs text-gray-500">Preview:</span>
                  <span className="text-xs text-blue-600 font-mono bg-blue-50 px-2 py-0.5 rounded">yourdomain.com/{slug || '...'}</span>
                </div>
              </div>

              {/* Status Messages */}
              <div className="min-h-[28px]">
                {error ? (
                  <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg transition-all">
                    <AlertCircle size={16} />
                    <span className="font-medium">{error}</span>
                  </div>
                ) : isFormValid ? (
                  <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg transition-all">
                    <CheckCircle size={16} />
                    <span className="font-medium">Ready to create page</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-gray-500 px-1">
                    <span>Fill in the details to create your page</span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-3 pt-5 border-t border-gray-100">
              <button
                type="button"
                onClick={handleClose}
                className="px-5 py-2.5 text-sm font-semibold border cursor-pointer border-gray-200 rounded-xl text-gray-600 hover:text-gray-800 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                className={`px-5 py-2.5 text-sm font-semibold cursor-pointer text-white rounded-xl transition-all duration-200 flex items-center gap-2 ${
                  isFormValid && !isSubmitting
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5 active:translate-y-0'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <FileText size={16} />
                    <span>Create Page</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}