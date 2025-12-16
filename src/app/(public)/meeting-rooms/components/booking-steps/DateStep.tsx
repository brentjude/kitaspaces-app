'use client';

import { CalendarIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface DateStepProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export default function DateStep({ selectedDate, onDateChange }: DateStepProps) {
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <h4 className="text-lg font-bold text-foreground">Select Date</h4>
      
      <div className="relative">
        <input
          type="date"
          required
          className="w-full text-lg p-4 rounded-xl border-2 border-foreground/20 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all cursor-pointer font-medium text-foreground"
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
          min={today}
        />
        <CalendarIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-foreground/40 pointer-events-none" />
      </div>

      <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3 items-start">
        <CheckCircleIcon className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-bold text-blue-800">Instant Confirmation</p>
          <p className="text-xs text-blue-600 mt-1">
            Your booking is secured immediately after completion.
          </p>
        </div>
      </div>
    </div>
  );
}