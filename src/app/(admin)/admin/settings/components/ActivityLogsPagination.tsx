"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

interface ActivityLogsPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export default function ActivityLogsPagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: ActivityLogsPaginationProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="px-6 py-4 border-t border-foreground/10 bg-white flex items-center justify-between">
      <div className="text-sm text-foreground/60">
        Showing <span className="font-medium text-foreground">{startItem}</span>{" "}
        to <span className="font-medium text-foreground">{endItem}</span> of{" "}
        <span className="font-medium text-foreground">{totalItems}</span>{" "}
        results
      </div>
      <div className="flex gap-2 items-center">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="p-2 rounded-md border border-foreground/20 hover:bg-foreground/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeftIcon className="w-4 h-4 text-foreground/60" />
        </button>
        <span className="px-4 py-2 text-sm text-foreground bg-foreground/5 rounded-md border border-foreground/10">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="p-2 rounded-md border border-foreground/20 hover:bg-foreground/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          <ChevronRightIcon className="w-4 h-4 text-foreground/60" />
        </button>
      </div>
    </div>
  );
}
