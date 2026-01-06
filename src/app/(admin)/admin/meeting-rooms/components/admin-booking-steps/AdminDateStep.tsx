'use client';

import { CalendarIcon } from '@heroicons/react/24/outline';

interface AdminDateStepProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export default function AdminDateStep({ selectedDate, onDateChange }: AdminDateStepProps) {
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-foreground mb-1">Select Date</h3>
        <p className="text-sm text-foreground/60">
          Choose the booking date (admin can select any date)
        </p>
      </div>

      <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <CalendarIcon className="w-6 h-6 text-blue-600" />
          <label className="text-base font-bold text-foreground">
            Booking Date
          </label>
        </div>

        <input
          type="date"
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
          className="w-full px-4 py-3 text-lg border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold"
        />

        <div className="mt-4 space-y-2">
          <p className="text-sm text-blue-700">
            💡 <strong>Admin Privilege:</strong> You can select any date, including past dates for record-keeping.
          </p>
          {selectedDate && (
            <div className="p-3 bg-white border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-foreground">
                <strong>Selected:</strong>{' '}
                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Date Shortcuts */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onDateChange(today)}
          className="px-4 py-2 bg-white border-2 border-foreground/20 rounded-lg hover:border-primary hover:bg-primary/5 transition-all font-medium text-sm"
        >
          Today
        </button>
        <button
          type="button"
          onClick={() => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            onDateChange(tomorrow.toISOString().split('T')[0]);
          }}
          className="px-4 py-2 bg-white border-2 border-foreground/20 rounded-lg hover:border-primary hover:bg-primary/5 transition-all font-medium text-sm"
        >
          Tomorrow
        </button>
      </div>
    </div>
  );
}