'use client';

import { useState } from 'react';
import AddAdminModal from './AddAdminModal';
import EditAdminModal from './EditAdminModal';
import DeleteAdminModal from './DeleteAdminModal';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface SystemUsersTabProps {
  admins: Array<{
    id: string;
    name: string;
    email: string;
    createdAt: Date;
  }>;
  onAddAdmin: (data: {
    name: string;
    email: string;
    password: string;
    superKey: string;
  }) => Promise<void>;
  onEditAdmin: (id: string, data: { name: string; password?: string; superKey: string }) => Promise<void>;
  onDeleteAdmin: (id: string, superKey: string) => Promise<void>;
}

export default function SystemUsersTab({
  admins,
  onAddAdmin,
  onEditAdmin,
  onDeleteAdmin,
}: SystemUsersTabProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<{
    id: string;
    name: string;
    email: string;
  } | null>(null);
  const [deletingAdmin, setDeletingAdmin] = useState<{
    id: string;
    name: string;
    email: string;
  } | null>(null);

  const handleOpenEditModal = (admin: { id: string; name: string; email: string }) => {
    setEditingAdmin(admin);
  };

  const handleCloseEditModal = () => {
    setEditingAdmin(null);
  };

  const handleOpenDeleteModal = (admin: { id: string; name: string; email: string }) => {
    setDeletingAdmin(admin);
  };

  const handleCloseDeleteModal = () => {
    setDeletingAdmin(null);
  };

  const handleDelete = async (id: string, superKey: string) => {
    await onDeleteAdmin(id, superKey);
    alert('Admin deleted successfully!');
    setDeletingAdmin(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-foreground">System Administrators</h2>
          <p className="text-sm text-foreground/60 mt-1">
            Manage admin user accounts with full system access
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Add Admin
        </button>
      </div>

      {/* Admins List */}
      <div className="bg-white rounded-xl shadow-sm border border-foreground/10 overflow-hidden">
        {admins.length === 0 ? (
          <div className="p-8 text-center text-foreground/60">
            No administrators found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-foreground/5 border-b border-foreground/10">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-foreground uppercase">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-foreground uppercase">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-foreground uppercase">
                    Created At
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-foreground uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-foreground/10">
                {admins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-foreground/5">
                    <td className="px-4 py-3">
                      <span className="font-medium text-foreground">{admin.name}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-foreground">{admin.email}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-foreground/60">
                        {new Date(admin.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() =>
                            handleOpenEditModal({
                              id: admin.id,
                              name: admin.name,
                              email: admin.email,
                            })
                          }
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit admin"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleOpenDeleteModal({
                              id: admin.id,
                              name: admin.name,
                              email: admin.email,
                            })
                          }
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete admin"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Admin Modal */}
      {isAddModalOpen && (
        <AddAdminModal
          onClose={() => setIsAddModalOpen(false)}
          onSave={onAddAdmin}
        />
      )}

      {/* Edit Admin Modal */}
      {editingAdmin && (
        <EditAdminModal
          admin={editingAdmin}
          onClose={handleCloseEditModal}
          onSave={onEditAdmin}
        />
      )}

      {/* Delete Admin Modal */}
      {deletingAdmin && (
        <DeleteAdminModal
          admin={deletingAdmin}
          onClose={handleCloseDeleteModal}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}