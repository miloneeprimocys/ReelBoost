"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '../../../hooks/reduxHooks';
import { setCurrentPage } from '../../../store/builderSlice';
import { openAddPageModal } from '../../../store/pagesSlice';
import { FileText, Plus } from 'lucide-react';

interface PagesListProps {
  onPageSelect?: () => void;
}

const PagesList: React.FC<PagesListProps> = ({ onPageSelect }) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { currentPage } = useAppSelector(state => state.builder);
  const { pages } = useAppSelector(state => state.pages);

  const handlePageClick = (pageId: string) => {
    const page = pages.find(p => p.id === pageId);
    dispatch(setCurrentPage(pageId));
    // Navigate to /WebsiteBuilder/[page-slug]
    if (page?.slug) {
      router.push(`/WebsiteBuilder/${page.slug}`);
    }
    // Call onPageSelect callback to switch to sections view
    if (onPageSelect) {
      onPageSelect();
    }
  };

  const handleAddPage = () => {
    dispatch(openAddPageModal());
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pages</h3>
        <button
          onClick={handleAddPage}
          className="inline-flex items-center cursor-pointer gap-1.5 px-2.5 py-1 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-md hover:border-gray-300 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          title="Add New Page"
        >
          <Plus size={12} />
          <span>Add Page</span>
        </button>
      </div>

      <div className="space-y-1.5">
        {pages.map((page) => (
          <button
            key={page.id}
            onClick={() => handlePageClick(page.id)}
            className={`group w-full flex items-center cursor-pointer gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-left ${
              currentPage === page.id
                ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200 shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200/60 hover:border-gray-300 hover:shadow-sm'
            }`}
          >
            <FileText 
              size={16} 
              className={`shrink-0 transition-colors ${
                currentPage === page.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
              }`} 
            />
            <div className="flex-1 min-w-0">
              <div className={`text-sm font-medium truncate ${
                currentPage === page.id ? 'text-blue-700' : 'text-gray-700 group-hover:text-gray-900'
              }`}>
                {page.title}
              </div>
              <div className={`text-xs truncate mt-0.5 ${
                currentPage === page.id ? 'text-blue-500/70' : 'text-gray-400'
              }`}>
                {page.slug}
              </div>
            </div>
            {currentPage === page.id && (
              <div className="w-1 h-6 bg-blue-500 rounded-full shadow-sm"></div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PagesList;