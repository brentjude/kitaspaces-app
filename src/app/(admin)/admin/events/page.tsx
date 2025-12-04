import { Suspense } from "react";
import EventsListClient from "./components/EventsListClient";

export default function EventsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<EventsListSkeleton />}>
        <EventsListClient />
      </Suspense>
    </div>
  );
}

function EventsListSkeleton() {
  return (
    <div className="min-h-screen bg-background ">
      <div className="sticky top-0 z-30 bg-white border-b border-foreground/10 px-4 sm:px-6 lg:px-8 py-3 lg:py-4">
        <div className="h-8 bg-foreground/10 rounded w-32 animate-pulse"></div>
      </div>

      <div className="p-6 sm:p-6 lg:p-8 space-y-6">
        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-sm border border-foreground/10 p-6 animate-pulse"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-4 bg-foreground/10 rounded w-24 mb-2"></div>
                  <div className="h-8 bg-foreground/10 rounded w-16"></div>
                </div>
                <div className="w-12 h-12 bg-foreground/10 rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters Skeleton */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-foreground/10 animate-pulse">
          <div className="h-10 bg-foreground/5 rounded w-full"></div>
        </div>

        {/* Table Skeleton */}
        <div className="bg-white rounded-xl shadow-sm border border-foreground/10 p-6 animate-pulse">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-foreground/5 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
