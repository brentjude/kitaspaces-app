"use client";

import { GiftIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

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

  // Separate freebies into those with options and those without
  const freebiesWithOptions = freebies.filter((freebie) => {
    const options = parseOptions(freebie.description);
    return options.length > 0;
  });

  const freebiesWithoutOptions = freebies.filter((freebie) => {
    const options = parseOptions(freebie.description);
    return options.length === 0;
  });

  // Don't render if no freebies at all
  if (freebies.length === 0) {
    return null;
  }

  return (
    <div className="bg-orange-50 rounded-xl p-4 border border-orange-100 mt-4">
      <h4 className="text-sm font-bold text-foreground mb-3 flex items-center">
        <GiftIcon className="w-4 h-4 mr-2 text-primary" />
        Event Freebies
      </h4>

      {/* Simple Freebies (no options needed) */}
      {freebiesWithoutOptions.length > 0 && (
        <div className="mb-4 space-y-2">
          <p className="text-xs font-semibold text-foreground/60 uppercase tracking-wide">
            Included with Registration
          </p>
          {freebiesWithoutOptions.map((freebie) => (
            <div
              key={freebie.id}
              className="flex items-start bg-white rounded-lg border border-orange-200 px-3 py-2.5"
            >
              <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  {freebie.name}
                </p>
                {freebie.description && (
                  <p className="text-xs text-foreground/60 mt-0.5">
                    {freebie.description}
                  </p>
                )}
              </div>
              {freebie.quantity > 0 && (
                <span className="text-xs text-orange-600 font-medium bg-orange-100 px-2 py-0.5 rounded ml-2">
                  {freebie.quantity} left
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Freebies with Options (require selection) */}
      {freebiesWithOptions.length > 0 && (
        <div>
          {freebiesWithoutOptions.length > 0 && (
            <p className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-2 mt-4">
              Customize Your Freebies
            </p>
          )}
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
                    onChange={(e) =>
                      onFreebieChange(freebie.id, e.target.value)
                    }
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
                  {freebie.quantity > 0 && (
                    <p className="text-xs text-foreground/50 mt-1">
                      {freebie.quantity} available
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
