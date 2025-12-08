'use client';

import { useState } from 'react';
import { UsersIcon, PlusIcon } from '@heroicons/react/24/outline';
import AddAdminModal from './AddAdminModal';

interface Admin {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

interface SystemUsersTabProps {
  admins: Admin[];
  onAddAdmin: (data: { name: string; email: string; password: string }) => Promise<void>;
}

export default function SystemUsersTab({ admins, onAddAdmin }: SystemUsersTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-foreground/10 overflow-hidden">
        <div className="border-b border-foreground/10 bg-foreground/5 px-6 py-4 flex justify-between items-center">
          <h3 className="text-base font-semibold text-foreground flex items-center">
            <UsersIcon className="w-5 h-5 mr-2" />
            System Administrators
          </h3>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-3 py-1.5 bg-white border border-foreground/20 text-foreground text-xs font-medium rounded-lg hover:bg-foreground/5 transition-colors"
          >
            <PlusIcon className="w-4 h-4 mr-1.5" />
            Add Admin
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-foreground/10">
            <thead className="bg-foreground/5">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-foreground/10">
              {admins.map((admin) => (
                <tr key={admin.id} className="hover:bg-foreground/5">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {admin.name.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-foreground">
                          {admin.name}
                        </div>
                        <div className="text-sm text-foreground/50">{admin.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
                      Admin
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground/60">
                    {new Date(admin.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
              {admins.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-foreground/40 text-sm"
                  >
                    No administrators found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddAdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={onAddAdmin}
      />
    </>
  );
}