'use client';

import { CheckCircleIcon } from '@heroicons/react/24/solid';

interface AdminConfirmationSuccessProps {
  memberId: string;
  memberName: string;
  onFinish: () => void;
}

export default function AdminConfirmationSuccess({
  memberId,
  memberName,
  onFinish,
}: AdminConfirmationSuccessProps) {
  return (
    <div className="text-center py-8">
      <CheckCircleIcon className="w-20 h-20 text-green-500 mx-auto mb-6" />
      
      <h2 className="text-2xl font-bold text-foreground mb-4">
        Member Created Successfully!
      </h2>
      
      <div className="bg-gray-50 rounded-lg p-6 mb-6 max-w-md mx-auto">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-foreground/60">Member ID:</span>
            <span className="font-mono font-semibold">{memberId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-foreground/60">Member Name:</span>
            <span className="font-semibold">{memberName}</span>
          </div>
        </div>
      </div>

      <p className="text-foreground/60 mb-8">
        The member account has been created and activated. They can now log in using their email and password.
      </p>

      <button
        onClick={onFinish}
        className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-semibold"
      >
        Done
      </button>
    </div>
  );
}