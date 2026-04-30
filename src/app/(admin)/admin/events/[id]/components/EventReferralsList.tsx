"use client";

import { useState } from "react";
import {
  LinkIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { generateReferralCode } from "@/lib/utils/referral";

interface EventReferral {
  id: string;
  name: string;
  code: string;
  createdAt: Date | string;
}

interface EventReferralsListProps {
  event: {
    id: string;
    slug: string;
    hasReferral: boolean;
    referrals: EventReferral[];
  };
  referralUsageCodes: string[];
}

interface ReferralFormState {
  name: string;
  code: string;
}

export default function EventReferralsList({
  event,
  referralUsageCodes,
}: EventReferralsListProps) {
  const [referrals, setReferrals] = useState<EventReferral[]>(
    event.referrals ?? [],
  );
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addForm, setAddForm] = useState<ReferralFormState>({
    name: "",
    code: "",
  });
  const [editForm, setEditForm] = useState<ReferralFormState>({
    name: "",
    code: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!event.hasReferral) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="bg-foreground/5 rounded-full p-4 mb-4">
          <LinkIcon className="w-8 h-8 text-foreground/40" />
        </div>
        <p className="text-foreground/60 text-sm">
          Referrals are not enabled for this event.
        </p>
        <p className="text-foreground/40 text-xs mt-1">
          Enable the referral system in{" "}
          <span className="font-medium">
            Edit Event → Enable Referral System
          </span>
          .
        </p>
      </div>
    );
  }

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  const getReferralUrl = (code: string) =>
    `${baseUrl}/events/${event.slug}?referralCode=${code}`;

  const handleCopyUrl = async (referral: EventReferral) => {
    try {
      await navigator.clipboard.writeText(getReferralUrl(referral.code));
      setCopiedId(referral.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      console.error("Failed to copy referral URL");
    }
  };

  const validateCode = (code: string): string | null => {
    if (!/^[A-Z0-9]{6}$/.test(code.toUpperCase())) {
      return "Code must be exactly 6 alphanumeric characters (A–Z, 0–9)";
    }
    return null;
  };

  const handleAddSubmit = async () => {
    setError(null);
    const name = addForm.name.trim();
    const code = addForm.code.trim().toUpperCase();

    if (!name) {
      setError("Name is required");
      return;
    }
    if (code) {
      const err = validateCode(code);
      if (err) {
        setError(err);
        return;
      }
    }

    // Check client-side uniqueness among existing referrals
    if (code && referrals.some((r) => r.code === code)) {
      setError("This code is already used by another referral in this event");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/events/${event.id}/referrals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, code: code || undefined }),
      });

      const result = (await response.json()) as {
        success: boolean;
        data: EventReferral;
        error?: string;
      };

      if (!result.success) {
        setError(result.error ?? "Failed to create referral");
        return;
      }

      setReferrals((prev) => [...prev, result.data]);
      setAddForm({ name: "", code: "" });
      setShowAddForm(false);
    } catch {
      setError("Failed to create referral");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditStart = (referral: EventReferral) => {
    setEditingId(referral.id);
    setEditForm({ name: referral.name, code: referral.code });
    setError(null);
  };

  const handleEditSubmit = async (referralId: string) => {
    setError(null);
    const name = editForm.name.trim();
    const code = editForm.code.trim().toUpperCase();

    if (!name) {
      setError("Name is required");
      return;
    }
    if (!code) {
      setError("Code is required");
      return;
    }

    const codeErr = validateCode(code);
    if (codeErr) {
      setError(codeErr);
      return;
    }

    // Client-side uniqueness (exclude self)
    if (referrals.some((r) => r.code === code && r.id !== referralId)) {
      setError("This code is already used by another referral in this event");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `/api/admin/events/${event.id}/referrals/${referralId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, code }),
        },
      );

      const result = (await response.json()) as {
        success: boolean;
        data: EventReferral;
        error?: string;
      };

      if (!result.success) {
        setError(result.error ?? "Failed to update referral");
        return;
      }

      setReferrals((prev) =>
        prev.map((r) => (r.id === referralId ? result.data : r)),
      );
      setEditingId(null);
    } catch {
      setError("Failed to update referral");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (referralId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this referral? This action cannot be undone.",
      )
    ) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `/api/admin/events/${event.id}/referrals/${referralId}`,
        { method: "DELETE" },
      );

      const result = (await response.json()) as {
        success: boolean;
        error?: string;
      };

      if (!result.success) {
        setError(result.error ?? "Failed to delete referral");
        return;
      }

      setReferrals((prev) => prev.filter((r) => r.id !== referralId));
    } catch {
      setError("Failed to delete referral");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-foreground/60">
          {referrals.length} referral{referrals.length !== 1 ? "s" : ""}
        </p>
        {!showAddForm && (
          <button
            onClick={() => {
              setShowAddForm(true);
              setAddForm({ name: "", code: generateReferralCode() });
              setError(null);
            }}
            className="flex items-center gap-1.5 bg-primary text-white text-sm px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            Add Referral
          </button>
        )}
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2 rounded-lg">
          {error}
        </div>
      )}

      {/* Add form */}
      {showAddForm && (
        <div className="border border-foreground/10 rounded-lg p-4 space-y-3 bg-foreground/5">
          <p className="text-sm font-medium">New Referral</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-foreground/60 mb-1 block">
                Name
              </label>
              <input
                type="text"
                placeholder="e.g. Partner XYZ"
                value={addForm.name}
                onChange={(e) =>
                  setAddForm((f) => ({ ...f, name: e.target.value }))
                }
                className="w-full border border-foreground/20 rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="text-xs text-foreground/60 mb-1 block">
                Code (6 chars, A–Z 0–9)
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. ABC123"
                  value={addForm.code}
                  maxLength={6}
                  onChange={(e) =>
                    setAddForm((f) => ({
                      ...f,
                      code: e.target.value.toUpperCase(),
                    }))
                  }
                  className="w-full border border-foreground/20 rounded-lg px-3 py-2 pr-10 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono"
                />
                <button
                  type="button"
                  title="Generate new code"
                  onClick={() =>
                    setAddForm((f) => ({ ...f, code: generateReferralCode() }))
                  }
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground/70"
                >
                  <ArrowPathIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddSubmit}
              disabled={isSubmitting}
              className="bg-primary text-white text-sm px-4 py-1.5 rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setError(null);
              }}
              className="text-sm px-4 py-1.5 rounded-lg border border-foreground/20 hover:bg-foreground/5 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      {referrals.length === 0 && !showAddForm ? (
        <div className="text-center py-12 text-foreground/40 text-sm">
          No referrals yet. Click &ldquo;Add Referral&rdquo; to create one.
        </div>
      ) : (
        <div className="border border-foreground/10 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-foreground/5 text-foreground/60">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium">Code</th>
                <th className="text-left px-4 py-3 font-medium">Used by</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-foreground/10">
              {referrals.map((referral) =>
                editingId === referral.id ? (
                  <tr key={referral.id} className="bg-foreground/5">
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) =>
                          setEditForm((f) => ({ ...f, name: e.target.value }))
                        }
                        className="w-full border border-foreground/20 rounded-lg px-2 py-1 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="relative">
                        <input
                          type="text"
                          value={editForm.code}
                          maxLength={6}
                          onChange={(e) =>
                            setEditForm((f) => ({
                              ...f,
                              code: e.target.value.toUpperCase(),
                            }))
                          }
                          className="w-full border border-foreground/20 rounded-lg px-2 py-1 pr-8 text-sm bg-background font-mono focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                        <button
                          type="button"
                          title="Generate new code"
                          onClick={() =>
                            setEditForm((f) => ({
                              ...f,
                              code: generateReferralCode(),
                            }))
                          }
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground/70"
                        >
                          <ArrowPathIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-foreground/40">—</td>
                    <td className="px-4 py-3">
                      <div className="relative">
                        <input
                          type="text"
                          value={editForm.code}
                          maxLength={6}
                          onChange={(e) =>
                            setEditForm((f) => ({
                              ...f,
                              code: e.target.value.toUpperCase(),
                            }))
                          }
                          className="w-full border border-foreground/20 rounded-lg px-2 py-1 pr-8 text-sm bg-background font-mono focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                        <button
                          type="button"
                          title="Generate new code"
                          onClick={() =>
                            setEditForm((f) => ({
                              ...f,
                              code: generateReferralCode(),
                            }))
                          }
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground/70"
                        >
                          <ArrowPathIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditSubmit(referral.id)}
                          disabled={isSubmitting}
                          className="text-xs bg-primary text-white px-3 py-1 rounded hover:bg-primary/90 disabled:opacity-50 transition-colors"
                        >
                          {isSubmitting ? "..." : "Save"}
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null);
                            setError(null);
                          }}
                          className="text-xs px-3 py-1 rounded border border-foreground/20 hover:bg-foreground/5 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr
                    key={referral.id}
                    className="hover:bg-foreground/5 transition-colors"
                  >
                    <td className="px-4 py-3 text-foreground">
                      {referral.name}
                    </td>
                    <td className="px-4 py-3 font-mono text-foreground/80">
                      {referral.code}
                    </td>
                    <td className="px-4 py-3">
                      {(() => {
                        const count = referralUsageCodes.filter(
                          (c) => c === referral.code,
                        ).length;
                        return count > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                            {count} participant{count !== 1 ? "s" : ""}
                          </span>
                        ) : (
                          <span className="text-xs text-foreground/40">—</span>
                        );
                      })()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          title={
                            copiedId === referral.id
                              ? "Copied!"
                              : "Copy referral URL"
                          }
                          onClick={() => handleCopyUrl(referral)}
                          className={`p-1.5 rounded hover:bg-foreground/10 transition-colors ${
                            copiedId === referral.id
                              ? "text-green-500"
                              : "text-foreground/50"
                          }`}
                        >
                          <LinkIcon className="w-4 h-4" />
                        </button>
                        <button
                          title="Edit referral"
                          onClick={() => handleEditStart(referral)}
                          className="p-1.5 rounded hover:bg-foreground/10 text-foreground/50 transition-colors"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          title="Delete referral"
                          onClick={() => handleDelete(referral.id)}
                          disabled={isSubmitting}
                          className="p-1.5 rounded hover:bg-red-50 text-foreground/50 hover:text-red-500 disabled:opacity-50 transition-colors"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
