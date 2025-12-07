'use client';

import { NavArrowLeft, NavArrowRight } from 'iconoir-react';

interface PaginationProps {
  currentPage: number;
  totalCount: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalCount,
  itemsPerPage,
  onPageChange,
}: PaginationProps) {
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-between mt-6">
      <div className="text-sm text-text-col/60">
        Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalCount)} -{' '}
        {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} users
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrevious}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-md ${
            hasPrevious
              ? 'bg-component-col text-text-col hover:bg-bg-col/50'
              : 'bg-bg-col/30 text-text-col/30 cursor-not-allowed'
          }`}
        >
          <NavArrowLeft className="w-4 h-4" />
          Previous
        </button>
        <div className="px-3 py-1.5 text-text-col">
          Page {currentPage} of {totalPages}
        </div>
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNext}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-md ${
            hasNext
              ? 'bg-component-col text-text-col hover:bg-bg-col/50'
              : 'bg-bg-col/30 text-text-col/30 cursor-not-allowed'
          }`}
        >
          Next
          <NavArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
