'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { usePasswordReset } from '@/hooks/usePasswordReset';
import {
  ArrowLeftIcon,
  EnvelopeIcon,
  LockClosedIcon,
  ArrowRightIcon,
  KeyIcon,
  CheckCircleIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';

export default function ForgotPasswordForm() {
  const router = useRouter();
  const { requestOtp, verifyOtp, resetPassword, isLoading } = usePasswordReset();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const result = await requestOtp(email);
    if (result.success) {
      setStep(2);
    } else {
      setError(result.error || 'Failed to send code');
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const result = await verifyOtp(email, otp);
    if (result.success) {
      setStep(3);
    } else {
      setError(result.error || 'Invalid code');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const result = await resetPassword(email, otp, newPassword);
    if (result.success) {
      setStep(4);
    } else {
      setError(result.error || 'Failed to reset password');
    }
  };

  const handleResendCode = async () => {
    setError('');
    const result = await requestOtp(email);
    if (!result.success) {
      setError(result.error || 'Failed to resend code');
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24 relative z-10">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="mb-8">
            <button
              onClick={() => router.push('/auth/signin')}
              className="flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-1" /> Back to Login
            </button>

            {/* Step Headers */}
            {step === 1 && (
              <>
                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                  Forgot Password?
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  Enter your email address and we'll send you a 6-digit code to reset your password.
                </p>
              </>
            )}
            {step === 2 && (
              <>
                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                  Check your email
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  We've sent a 6-digit code to{' '}
                  <span className="font-semibold text-gray-900">{email}</span>.
                </p>
              </>
            )}
            {step === 3 && (
              <>
                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                  Set new password
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  Your new password must be different from previously used passwords.
                </p>
              </>
            )}
            {step === 4 && (
              <>
                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                  Password reset
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  Your password has been successfully reset. You can now login with your new password.
                </p>
              </>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm border border-red-200">
              {error}
            </div>
          )}

          {/* Step 1: Email Form */}
          {step === 1 && (
            <form onSubmit={handleSendCode} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF8E49] focus:border-[#FF8E49] sm:text-sm transition-all"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading || !email}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-[#FF8E49] hover:bg-[#ff7d2e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF8E49] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  'Send Reset Code'
                )}
              </button>
            </form>
          )}

          {/* Step 2: OTP Form */}
          {step === 2 && (
            <form onSubmit={handleVerifyCode} className="space-y-6">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmation Code
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF8E49] focus:border-[#FF8E49] sm:text-sm transition-all tracking-[0.5em] font-mono text-center text-lg"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
                <p className="mt-2 text-xs text-center text-gray-500">
                  Didn't receive the email?{' '}
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={isLoading}
                    className="text-[#FF8E49] hover:underline disabled:opacity-50"
                  >
                    Click to resend
                  </button>
                </p>
              </div>
              <button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-[#FF8E49] hover:bg-[#ff7d2e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF8E49] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  'Verify Code'
                )}
              </button>
            </form>
          )}

          {/* Step 3: New Password Form */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New password
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="block w-full pl-10 pr-11 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF8E49] focus:border-[#FF8E49] sm:text-sm transition-all"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm password
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    className="block w-full pl-10 pr-11 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF8E49] focus:border-[#FF8E49] sm:text-sm transition-all"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading || !newPassword || newPassword !== confirmPassword}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-[#FF8E49] hover:bg-[#ff7d2e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF8E49] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-100 mb-8 animate-in zoom-in duration-300">
                <CheckCircleIcon className="h-12 w-12 text-green-600" />
              </div>
              <button
                onClick={() => router.push('/auth/signin')}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-[#FF8E49] hover:bg-[#ff7d2e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF8E49] transition-all"
              >
                Back to Login <ArrowRightIcon className="ml-2 h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right Side - Same as SignIn */}
      <div className="hidden lg:block relative w-0 flex-1 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#FF8E49] via-[#ff7d2e] to-[#FFB082]" />
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[400px] h-[400px] rounded-full bg-white/10 blur-3xl" />
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="relative h-full flex flex-col items-center justify-center p-12">
          <div className="w-full max-w-md space-y-8 text-center">
            <div className="relative mx-auto w-80 h-80 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-white/10 animate-pulse" />
              <div className="absolute inset-8 rounded-full bg-white/5 animate-pulse" style={{ animationDelay: '0.3s' }} />
              <div className="relative z-10">
                <Image 
                  src="/logo/kita-white-logo.png" 
                  alt="KITA Spaces Logo" 
                  width={280} 
                  height={180}
                  priority
                  className="drop-shadow-2xl"
                />
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-white drop-shadow-lg">
                Welcome to KITA Spaces
              </h2>
              <p className="text-lg text-white/90 drop-shadow-md max-w-sm mx-auto">
                Secure and simple account management for our community.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3 pt-8">
              <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium text-white border border-white/30">
                ✨ Modern Spaces
              </div>
              <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium text-white border border-white/30">
                🤝 Community Driven
              </div>
              <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium text-white border border-white/30">
                🚀 Growth Focused
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}