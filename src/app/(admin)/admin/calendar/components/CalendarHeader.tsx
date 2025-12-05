'use client';

import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface CalendarHeaderProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}

export default function CalendarHeader({
  currentDate,
  onPrevMonth,
  onNextMonth,
  onToday,
}: CalendarHeaderProps) {
  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-bold text-foreground">
        {formatMonthYear(currentDate)}
      </h1>
      <div className="flex items-center gap-2">
        <button
          onClick={onPrevMonth}
          className="p-2 rounded-lg hover:bg-foreground/5 text-foreground/60 hover:text-foreground transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </button>
        <button
          onClick={onToday}
          className="px-4 py-2 text-sm font-medium border border-foreground/20 rounded-lg hover:bg-foreground/5 text-foreground/70 hover:text-foreground transition-colors"
        >
          Today
        </button>
        <button
          onClick={onNextMonth}
          className="p-2 rounded-lg hover:bg-foreground/5 text-foreground/60 hover:text-foreground transition-colors"
          aria-label="Next month"
        >
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}