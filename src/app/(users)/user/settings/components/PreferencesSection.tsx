'use client';

interface PreferencesSectionProps {
  agreeToNewsletter: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function PreferencesSection({
  agreeToNewsletter,
  onChange,
}: PreferencesSectionProps) {
  return (
    <div className="pt-6 border-t border-foreground/10">
      <h3 className="text-sm font-semibold text-foreground/60 uppercase tracking-wider mb-4">
        Preferences
      </h3>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          name="agreeToNewsletter"
          checked={agreeToNewsletter}
          onChange={onChange}
          className="w-4 h-4 text-primary focus:ring-primary border-foreground/20 rounded"
        />
        <span className="text-sm text-foreground">
          I want to receive newsletters and updates
        </span>
      </label>
    </div>
  );
}