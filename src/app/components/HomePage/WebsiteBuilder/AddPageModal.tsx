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
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4 transition-opacity duration-300"
        onClick={handleClose}
      >
        <div 
          className="bg-white rounded-3xl shadow-xl w-full max-w-lg mx-auto overflow-hidden transition-all duration-300 scale-100 flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header - Reduced padding */}
          <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-50/50 rounded-xl">
                <FileText size={20} className="text-blue-500/80" />
              </div>
              <div>
                <h2 className="text-lg font-medium text-gray-800">New Page</h2>
                <p className="text-xs text-gray-400">Define your page details below</p>
              </div>
            </div>
           
          </div>

          {/* Form - Reduced spacing (space-y-4) and padding */}
          <form onSubmit={handleSubmit} className="px-8 py-6 flex-1 flex flex-col space-y-4">
            <div className="space-y-4 flex-1">
              {/* Page Name */}
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-gray-500 ml-1">
                  PAGE TITLE
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={pageName}
                    onChange={handlePageNameChange}
                    placeholder="e.g. About our team"
                    className="w-full px-5 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-[14px] text-gray-700 focus:bg-white focus:border-blue-200 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all duration-200 placeholder:text-gray-300"
                    autoFocus
                  />
                </div>
              </div>

              {/* Slug */}
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-gray-500 ml-1">
                  URL PATH
                </label>
                <div className="flex items-center bg-gray-50/50 border border-gray-100 rounded-2xl px-5 focus-within:bg-white focus-within:border-blue-200 focus-within:ring-4 focus-within:ring-blue-500/5 transition-all duration-200">
                  <span className="text-gray-300 font-light text-base pr-2">/</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={handleSlugChange}
                    placeholder="about-us"
                    className="flex-1 py-3 bg-transparent text-[14px] text-gray-700 outline-none placeholder:text-gray-300 font-mono"
                  />
                  <Link2 size={14} className="text-gray-200 ml-2" />
                </div>
                <div className="px-1">
                  <p className="text-[10px] text-gray-400 font-mono truncate">
                    Preview: <span className="text-blue-400/80">domain.com/{slug || '...'}</span>
                  </p>
                </div>
              </div>

              {/* Status Messages - Reduced min-height */}
              <div className="min-h-[24px]">
                {error ? (
                  <div className="flex items-center gap-2 text-[13px] text-red-500/80 px-1 transition-all">
                    <AlertCircle size={14} />
                    <span>{error}</span>
                  </div>
                ) : isFormValid ? (
                  <div className="flex items-center gap-2 text-[13px] text-emerald-500/70 px-1 transition-all">
                    <CheckCircle size={14} />
                    <span>Ready to publish</span>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Footer Actions - Reduced top padding */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-50">
              <button
                type="button"
                onClick={handleClose}
                className="px-7 py-2.5 text-[13px] font-medium border border-gray-200 rounded-2xl text-gray-400 hover:text-gray-600 transition-colors"
                disabled={isSubmitting}
              >
                Discard
              </button>
              <button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                className={`px-7 py-2.5 text-[13px] font-medium text-white rounded-2xl transition-all duration-300 ${
                  isFormValid && !isSubmitting
                    ? 'bg-blue-500 hover:bg-blue-600 shadow-md shadow-blue-500/10 active:scale-[0.98]'
                    : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Processing</span>
                  </div>
                ) : (
                  'Create Page'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}