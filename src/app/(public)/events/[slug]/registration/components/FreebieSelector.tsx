'use client';

import { GiftIcon } from '@heroicons/react/24/outline';

interface FreebieOption {
  id: string;
  name: string;
  description: string | null;
  quantity: number;
}

interface FreebieSelectorProps {
  freebies: FreebieOption[];
  selectedFreebies: Record<string, string>;
  onFreebieChange: (freebieId: string, option: string) => void;
}

export default function FreebieSelector({
  freebies,
  selectedFreebies,
  onFreebieChange,
}: FreebieSelectorProps) {
  const parseOptions = (description: string | null): string[] => {
    if (!description) return [];
    return description.split(',').map((opt) => opt.trim());
  };

  return (
    <div className="bg-orange-50 rounded-xl p-4 border border-orange-100 mt-4">
      <h4 className="text-sm font-bold text-foreground mb-3 flex items-center">
        <GiftIcon className="w-4 h-4 mr-2 text-primary" />
        Customize Freebies
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {freebies.map((freebie) => {
          const options = parseOptions(freebie.description);
          
          return (
            <div key={freebie.id}>
              <label className="block text-xs font-semibold text-foreground/60 mb-1">
                {freebie.name} <span className="text-red-500">*</span>
              </label>
              {options.length > 0 ? (
                <select
                  className="w-full rounded-lg border border-orange-200 text-sm px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white"
                  value={selectedFreebies[freebie.id] || ''}
                  onChange={(e) => onFreebieChange(freebie.id, e.target.value)}
                >
                  <option value="" disabled>
                    Select option
                  </option>
                  {options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="text-sm text-foreground/50 italic py-2">Included</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}