'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import UserSettingsHeader from './components/UserSettingsHeader';
import UserProfileSidebar from './components/UserProfileSidebar';
import PersonalInfoForm from './components/PersonalInfoForm';
import PreferencesSection from './components/PreferencesSection';
import ChangePasswordModal from './components/ChangePasswordModal';

interface UserData {
  id: string;
  name: string;
  email: string;
  nickname: string;
  company: string;
  contactNumber: string;
  birthdate: string;
  referralSource: string;
  agreeToNewsletter: boolean;
}

export default function UserSettingsPage() {
  const { status } = useSession(); // ✅ Removed 'session' since it's not used
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const [formData, setFormData] = useState<UserData>({
    id: '',
    name: '',
    email: '',
    nickname: '',
    company: '',
    contactNumber: '',
    birthdate: '',
    referralSource: '',
    agreeToNewsletter: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      fetchUserData();
    }
  }, [status, router]);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user');
      const result = await response.json();

      if (result.success && result.data) {
        setFormData({
          id: result.data.id,
          name: result.data.name || '',
          email: result.data.email || '',
          nickname: result.data.nickname || '',
          company: result.data.company || '',
          contactNumber: result.data.contactNumber || '',
          birthdate: result.data.birthdate
            ? new Date(result.data.birthdate).toISOString().split('T')[0]
            : '',
          referralSource: result.data.referralSource || '',
          agreeToNewsletter: result.data.agreeToNewsletter || false,
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Failed to load user data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = 'Contact number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSaving(true);
    setError('');
    setShowSuccess(false);

    try {
      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          nickname: formData.nickname,
          company: formData.company,
          contactNumber: formData.contactNumber,
          birthdate: formData.birthdate || null,
          referralSource: formData.referralSource || null,
          agreeToNewsletter: formData.agreeToNewsletter,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        setError(result.error || 'Failed to update profile');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header with Messages */}
        <UserSettingsHeader showSuccess={showSuccess} error={error} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <UserProfileSidebar
            name={formData.name}
            email={formData.email}
            onChangePassword={() => setIsPasswordModalOpen(true)}
          />

          {/* Main Form */}
          <div className="lg:col-span-2">
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-xl shadow-sm border border-foreground/10 p-6 space-y-6"
            >
              {/* Personal Information */}
              <PersonalInfoForm
                formData={formData}
                errors={errors}
                onChange={handleChange}
              />

              {/* Preferences */}
              <PreferencesSection
                agreeToNewsletter={formData.agreeToNewsletter}
                onChange={handleChange}
              />

              {/* Submit Button */}
              <div className="flex justify-end pt-6 border-t border-foreground/10">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </div>
  );
}