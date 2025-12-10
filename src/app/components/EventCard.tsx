"use client";

import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  ArrowRightIcon,
  GiftIcon,
} from "@heroicons/react/24/outline";
import type { EventWithRelations } from "@/types";
import Image from "next/image";

interface EventCardProps {
  event: EventWithRelations & {
    registrationCount?: number;
    category?: {
      id: string;
      name: string;
      color: string | null;
      icon: string | null;
    } | null;
    freebies?: Array<{
      id: string;
      name: string;
      description?: string | null;
    }>;
  };
  onClick: (id: string, title: string) => void; // Updated signature
}

export default function EventCard({ event, onClick }: EventCardProps) {
  const isCompleted = new Date(event.date) < new Date();
  const isFree = event.price === 0 || event.isFree;
  const hasFreebies = event.freebies && event.freebies.length > 0;

  const getCategoryColor = (color: string | null) => {
    if (!color) return "bg-gray-100 text-gray-800";

    const colorMap: Record<string, string> = {
      "#3B82F6": "bg-blue-100 text-blue-800",
      "#10B981": "bg-green-100 text-green-800",
      "#F59E0B": "bg-orange-100 text-orange-800",
      "#EC4899": "bg-pink-100 text-pink-800",
      "#8B5CF6": "bg-purple-100 text-purple-800",
      "#EF4444": "bg-red-100 text-red-800",
      "#6366F1": "bg-indigo-100 text-indigo-800",
      "#6B7280": "bg-gray-100 text-gray-800",
    };

    return colorMap[color] || "bg-gray-100 text-gray-800";
  };

  return (
    <div
      onClick={() => onClick(event.id, event.title)}
      className="group bg-white rounded-2xl border border-foreground/10 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 overflow-hidden flex flex-col h-full cursor-pointer"
    >
      {/* Image Section */}
      <div className="h-48 bg-orange-50 relative overflow-hidden">
        {event.imageUrl ? (
          <div className="absolute inset-0">
            <Image
              src={event.imageUrl}
              alt={event.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent opacity-60" />
          </div>
        ) : (
          <>
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-primary via-orange-300 to-transparent" />
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-colors" />
          </>
        )}

        {/* Status Badge Only */}
        <div className="absolute top-4 right-4">
          <span
            className={`px-3 py-1 text-xs font-bold rounded-full shadow-sm backdrop-blur-md ${
              isCompleted
                ? "bg-gray-100 text-gray-500"
                : "bg-white text-primary"
            }`}
          >
            {isCompleted ? "Past Event" : "Registration Open"}
          </span>
        </div>

        {/* Date Badge */}
        <div className="absolute bottom-4 left-4">
          <div className="bg-white/90 backdrop-blur rounded-lg px-3 py-1.5 shadow-sm inline-flex items-center space-x-2">
            <CalendarIcon className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-foreground uppercase tracking-wide">
              {new Date(event.date).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex flex-row gap-1">
          {/* Category Badge Above Title */}
          {event.category && (
            <div className="mb-2">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(
                  event.category.color
                )}`}
              >
                {event.category.icon && (
                  <span className="mr-1">{event.category.icon}</span>
                )}
                {event.category.name}
              </span>
            </div>
          )}
          <div className="mb-2">
            {event.isMemberOnly && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Members-Only
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors leading-tight mb-2">
          {event.title}
        </h3>

        {/* Description */}
        <p className="text-foreground/60 text-sm mb-4 line-clamp-2 flex-1 leading-relaxed">
          {event.description ||
            "Join us for this amazing experience at KITA Spaces."}
        </p>

        {/* Event Details */}
        <div className="space-y-3 mt-auto border-t border-foreground/10 pt-4">
          <div className="flex items-center text-sm text-foreground/60">
            <ClockIcon className="w-4 h-4 mr-2.5 text-foreground/40" />
            {event.startTime ||
              new Date(event.date).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
          </div>

          <div className="flex items-center text-sm text-foreground/60">
            <MapPinIcon className="w-4 h-4 mr-2.5 text-foreground/40" />
            {event.location || "KITA Spaces"}
          </div>

          {/* Freebies */}
          {hasFreebies && (
            <div className="flex items-start text-sm text-foreground/60">
              <GiftIcon className="w-4 h-4 mr-2.5 text-foreground/40 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-medium text-primary">
                  {event.freebies!.length}{" "}
                  {event.freebies!.length === 1 ? "Freebie" : "Freebies"}{" "}
                  Included
                </span>
                <p className="text-xs text-foreground/50 mt-0.5 line-clamp-1">
                  {event.freebies!.map((f) => f.name).join(", ")}
                </p>
              </div>
            </div>
          )}

          {/* Price or Free for Members Badge */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-sm font-medium text-foreground/60">
              Price per person
            </span>
            {isFree ? (
              <span className="text-lg font-bold text-green-600">Free</span>
            ) : (
              <div className="flex flex-col items-end">
                <span className="text-lg font-bold text-primary">
                  ₱{event.price}
                </span>
                {event.isFreeForMembers && (
                  <span className="text-[10px] text-blue-600 font-semibold">
                    Free for members
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* CTA Button */}
        <div
          className={`mt-6 w-full py-2.5 rounded-xl font-medium text-sm transition-all shadow-md flex items-center justify-center ${
            isCompleted
              ? "bg-foreground/5 text-foreground/40 cursor-not-allowed shadow-none"
              : "bg-foreground text-white group-hover:bg-primary group-hover:shadow-primary/20 shadow-gray-200"
          }`}
        >
          {isCompleted ? "Event Ended" : "View Details"}
          {!isCompleted && <ArrowRightIcon className="w-4 h-4 ml-2" />}
        </div>
      </div>
    </div>
  );
}
