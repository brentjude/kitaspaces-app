"use client";

import { PlusIcon, TrashIcon, UserIcon } from "@heroicons/react/24/outline";
import { Event } from "@/types/database";
import { AttendeeFormData } from "@/types/registration";
import FreebieSelector from "./FreebieSelector";

interface AttendeeFormProps {
  attendees: AttendeeFormData[];
  event: Event & {
    freebies?: Array<{
      id: string;
      name: string;
      description: string | null;
      quantity: number;
    }>;
  };
  currentUser: { name: string; email: string } | null;
  onAttendeesChange: (attendees: AttendeeFormData[]) => void;
  onLoginRequest: () => void;
}

export default function AttendeeForm({
  attendees,
  event,
  currentUser,
  onAttendeesChange,
  onLoginRequest,
}: AttendeeFormProps) {
  const addAttendee = () => {
    onAttendeesChange([
      ...attendees,
      {
        id: Math.random().toString(36).substring(2, 9),
        name: "",
        email: "",
        selectedFreebies: {},
      },
    ]);
  };

  const removeAttendee = (id: string) => {
    onAttendeesChange(attendees.filter((a) => a.id !== id));
  };

  const updateAttendee = (
    id: string,
    field: keyof AttendeeFormData,
    value: string | Record<string, string>
  ) => {
    onAttendeesChange(
      attendees.map((a) => (a.id === id ? { ...a, [field]: value } : a))
    );
  };

  return (
    <div className="p-6 sm:p-8 space-y-8">
      {/* Login Prompt */}
      {!currentUser && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center justify-between">
          <div className="text-sm text-blue-800">
            <span className="font-bold block">Already a member?</span>
            Login to pre-fill your details and access member pricing.
          </div>
          <button
            onClick={onLoginRequest}
            className="text-xs bg-white text-blue-600 px-4 py-2 rounded-lg font-bold shadow-sm border border-blue-200 hover:bg-blue-50"
          >
            Login
          </button>
        </div>
      )}

      {/* Attendees */}
      {attendees.map((attendee, index) => (
        <div
          key={attendee.id}
          className="relative pb-8 border-b border-foreground/10 last:border-0 last:pb-0"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-foreground flex items-center">
              <UserIcon className="w-5 h-5 mr-2 text-primary" />
              {index === 0 ? "Main Attendee (You)" : `Guest #${index}`}
            </h3>
            {index > 0 && (
              <button
                onClick={() => removeAttendee(attendee.id)}
                className="text-red-500 text-sm font-medium hover:text-red-700 flex items-center"
              >
                <TrashIcon className="w-4 h-4 mr-1" />
                Remove
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full rounded-lg border border-foreground/20 px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                placeholder="Full Name"
                value={attendee.name}
                onChange={(e) =>
                  updateAttendee(attendee.id, "name", e.target.value)
                }
                disabled={index === 0 && !!currentUser}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                className="w-full rounded-lg border border-foreground/20 px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                placeholder="email@example.com"
                value={attendee.email}
                onChange={(e) =>
                  updateAttendee(attendee.id, "email", e.target.value)
                }
                disabled={index === 0 && !!currentUser}
              />
            </div>
          </div>

          {/* Freebies */}
          {event.freebies && event.freebies.length > 0 && (
            <FreebieSelector
              freebies={event.freebies}
              selectedFreebies={attendee.selectedFreebies}
              onFreebieChange={(freebieId, option) => {
                const newSelectedFreebies = {
                  ...attendee.selectedFreebies,
                  [freebieId]: option,
                };
                updateAttendee(
                  attendee.id,
                  "selectedFreebies",
                  newSelectedFreebies
                );
              }}
            />
          )}
        </div>
      ))}

      {/* Add Attendee Button */}
      <button
        onClick={addAttendee}
        className="w-full py-3 border-2 border-dashed border-foreground/20 rounded-xl text-foreground/60 font-medium hover:border-primary hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center"
      >
        <PlusIcon className="w-5 h-5 mr-2" />
        Add Another Guest
      </button>
    </div>
  );
}
