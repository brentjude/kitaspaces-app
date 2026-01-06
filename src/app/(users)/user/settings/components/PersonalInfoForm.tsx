'use client';

interface PersonalInfoFormProps {
  formData: {
    name: string;
    email: string;
    nickname: string;
    contactNumber: string;
    company: string;
    birthdate: string;
    referralSource: string;
  };
  errors: Record<string, string>;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const referralSources = [
  { value: 'WORD_OF_MOUTH', label: 'Word of Mouth' },
  { value: 'SOCIAL_MEDIA', label: 'Social Media' },
  { value: 'ADS', label: 'Advertisements' },
  { value: 'GOOGLE_MAPS', label: 'Google Maps' },
  { value: 'WEBSITE_BLOGS', label: 'Website/Blogs' },
  { value: 'INFLUENCER_CREATOR', label: 'Influencer/Creator' },
  { value: 'OTHER', label: 'Other' },
];

export default function PersonalInfoForm({
  formData,
  errors,
  onChange,
}: PersonalInfoFormProps) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground/60 uppercase tracking-wider mb-4">
        Personal Information
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={onChange}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.name ? 'border-red-500' : 'border-foreground/20'
            }`}
            placeholder="Juan Dela Cruz"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        {/* Nickname */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Nickname
          </label>
          <input
            type="text"
            name="nickname"
            value={formData.nickname}
            onChange={onChange}
            className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Optional"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        {/* Email (Disabled) */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={formData.email}
            disabled
            className="w-full px-4 py-2 border border-foreground/20 rounded-lg bg-gray-50 text-foreground/60 cursor-not-allowed"
          />
          <p className="text-xs text-foreground/40 mt-1">
            Email cannot be changed
          </p>
        </div>

        {/* Contact Number */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Contact Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            name="contactNumber"
            value={formData.contactNumber}
            onChange={onChange}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.contactNumber ? 'border-red-500' : 'border-foreground/20'
            }`}
            placeholder="09XX XXX XXXX"
          />
          {errors.contactNumber && (
            <p className="text-red-500 text-sm mt-1">{errors.contactNumber}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        {/* Company */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Company (Optional)
          </label>
          <input
            type="text"
            name="company"
            value={formData.company}
            onChange={onChange}
            className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Company Name"
          />
        </div>

        {/* Birthdate */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Birthdate (Optional)
          </label>
          <input
            type="date"
            name="birthdate"
            value={formData.birthdate}
            onChange={onChange}
            className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Referral Source */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-foreground mb-2">
          How did you hear about us? (Optional)
        </label>
        <select
          name="referralSource"
          value={formData.referralSource}
          onChange={onChange}
          className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Select an option</option>
          {referralSources.map((source) => (
            <option key={source.value} value={source.value}>
              {source.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}