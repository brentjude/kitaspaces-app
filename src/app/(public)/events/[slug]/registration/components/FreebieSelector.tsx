"use client";

import { GiftIcon } from "@heroicons/react/24/outline";

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
  // Parse options from description
  // If description has commas, treat them as options
  const parseOptions = (description: string | null): string[] => {
    if (!description) return [];

    // Check if description contains commas (indicating options)
    if (description.includes(",")) {
      // Split by comma and clean up each option
      return description
        .split(",")
        .map((opt) => opt.trim())
        .filter((opt) => opt.length > 0);
    }

    return [];
  };

  // Filter freebies that have options (contain commas)
  const freebiesWithOptions = freebies.filter((freebie) => {
    const options = parseOptions(freebie.description);
    return options.length > 0;
  });

  // Don't render if no freebies have options
  if (freebiesWithOptions.length === 0) {
    return null;
  }

  return (
    <div className="bg-orange-50 rounded-xl p-4 border border-orange-100 mt-4">
      <h4 className="text-sm font-bold text-foreground mb-3 flex items-center">
        <GiftIcon className="w-4 h-4 mr-2 text-primary" />
        Customize Freebies
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {freebiesWithOptions.map((freebie) => {
          const options = parseOptions(freebie.description);

          return (
            <div key={freebie.id}>
              <label className="block text-xs font-semibold text-foreground/60 mb-1">
                {freebie.name} <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full rounded-lg border border-orange-200 text-sm px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white"
                value={selectedFreebies[freebie.id] || ""}
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
              <p className="text-xs text-foreground/50 mt-1 italic">
                Options: {freebie.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
