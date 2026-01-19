"use client";

import { useState, useMemo } from "react";
import { CalendarItem, CalendarViewMode } from "@/types/database";
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  addWeeks,
  addDays,
  subMonths,
  subWeeks,
  subDays,
  isSameDay,
  isSameMonth,
  startOfDay,
  getHours,
  getMinutes,
  differenceInMinutes,
  differenceInHours,
} from "date-fns";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  FunnelIcon,
  ClockIcon,
  MapPinIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import BookingDetailModal from "./BookingDetailModal";

interface CalendarViewProps {
  events: CalendarItem[];
  bookings: CalendarItem[];
}

export default function CalendarView({ events, bookings }: CalendarViewProps) {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<CalendarViewMode>("month");
  const [filters, setFilters] = useState({
    events: true,
    bookings: true,
  });
  const [selectedBooking, setSelectedBooking] = useState<CalendarItem | null>(
    null
  );
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Combine and sort items
  const calendarItems = useMemo(() => {
    const items: CalendarItem[] = [];

    if (filters.events) {
      items.push(...events);
    }

    if (filters.bookings) {
      items.push(...bookings);
    }

    return items.sort((a, b) => a.start.getTime() - b.start.getTime());
  }, [events, bookings, filters]);

  // ✅ Transform CalendarItem to BookingDetails
  const getBookingDetails = (item: CalendarItem) => {
    if (item.type !== 'booking') return null;

    // ✅ Calculate duration from start/end dates if not provided
    const calculatedDuration = item.duration 
      ? item.duration 
      : Math.max(1, Math.round(differenceInHours(item.end, item.start) * 10) / 10);

    return {
      id: item.id,
      type: 'booking' as const, // ✅ Changed from 'meeting_room' to 'booking'
      title: item.title,
      date: format(item.start, 'EEEE, MMMM d, yyyy'),
      startTime: format(item.start, 'HH:mm'),
      endTime: format(item.end, 'HH:mm'),
      duration: calculatedDuration,
      room: item.room || {
        id: '',
        name: item.roomName || 'Unknown Room',
        capacity: 0,
        hourlyRate: 0,
        floor: null,
        roomNumber: null,
        amenities: null,
      },
      contactName: item.contactName || item.userName || 'Unknown',
      contactEmail: item.contactEmail || null,
      contactMobile: item.contactMobile || null,
      company: item.company || null,
      designation: item.designation || null,
      numberOfAttendees: item.numberOfAttendees || 1,
      purpose: item.purpose || null,
      totalAmount: item.totalAmount || 0,
      status: item.status || 'PENDING',
      bookingType: item.bookingType || 'customer',
      paymentReference: item.paymentReference || null,
      paymentMethod: item.paymentMethod || null,
    };
  };

  // Handle item click
  const handleItemClick = (item: CalendarItem) => {
    if (item.type === "event") {
      // Navigate to event detail page
      router.push(`/admin/events/${item.id}`);
    } else if (item.type === "booking") {
      // ✅ Open booking detail modal for bookings
      setSelectedBooking(item);
      setIsBookingModalOpen(true);
    }
  };

  // Navigation
  const next = () => {
    if (viewMode === "month") setCurrentDate(addMonths(currentDate, 1));
    else if (viewMode === "week") setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addDays(currentDate, 1));
  };

  const prev = () => {
    if (viewMode === "month") setCurrentDate(subMonths(currentDate, 1));
    else if (viewMode === "week") setCurrentDate(subWeeks(currentDate, 1));
    else setCurrentDate(subDays(currentDate, 1));
  };

  const today = () => setCurrentDate(new Date());

  // Header
  const renderHeader = () => {
    const dateFormat = "MMMM yyyy";

    return (
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-foreground/10">
        <div className="flex items-center justify-between sm:justify-start gap-4">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground min-w-[200px]">
            {format(currentDate, dateFormat)}
          </h2>
          <div className="flex items-center bg-foreground/5 rounded-lg p-1">
            <button
              onClick={prev}
              className="p-1.5 rounded-md hover:bg-white hover:shadow-sm text-foreground/60 transition-all"
              aria-label="Previous"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <button
              onClick={today}
              className="px-3 py-1 text-sm font-medium text-foreground/70 hover:bg-white hover:shadow-sm rounded-md transition-all"
            >
              Today
            </button>
            <button
              onClick={next}
              className="p-1.5 rounded-md hover:bg-white hover:shadow-sm text-foreground/60 transition-all"
              aria-label="Next"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          {/* Filters */}
          <div className="flex items-center gap-3 bg-foreground/5 px-3 py-1.5 rounded-lg border border-foreground/10">
            <FunnelIcon className="w-4 h-4 text-foreground/40" />
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="rounded border-foreground/30 text-primary focus:ring-primary/20"
                checked={filters.events}
                onChange={(e) =>
                  setFilters({ ...filters, events: e.target.checked })
                }
              />
              <span className="text-sm text-foreground/70">Events</span>
            </label>
            <div className="w-px h-4 bg-foreground/20 mx-1"></div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="rounded border-foreground/30 text-blue-500 focus:ring-blue-500/20"
                checked={filters.bookings}
                onChange={(e) =>
                  setFilters({ ...filters, bookings: e.target.checked })
                }
              />
              <span className="text-sm text-foreground/70">Bookings</span>
            </label>
          </div>

          {/* View Switcher */}
          <div className="flex bg-foreground/5 p-1 rounded-lg">
            {(["month", "week", "day"] as CalendarViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md capitalize transition-all ${
                  viewMode === mode
                    ? "bg-white text-foreground shadow-sm"
                    : "text-foreground/50 hover:text-foreground"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Month View
  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return (
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-foreground/10 flex flex-col min-h-[600px]">
        {/* Header Days */}
        <div className="grid grid-cols-7 border-b border-foreground/10">
          {weekDays.map((day) => (
            <div
              key={day}
              className="py-3 text-center text-xs font-semibold text-foreground/50 uppercase tracking-wide bg-foreground/5 first:rounded-tl-xl last:rounded-tr-xl"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 flex-1 auto-rows-fr">
          {days.map((day, idx) => {
            const dayItems = calendarItems.filter((item) =>
              isSameDay(item.start, day)
            );
            const isToday = isSameDay(day, new Date());
            const isCurrentMonth = isSameMonth(day, monthStart);

            const borderClasses = `border-b border-r border-foreground/10 ${
              idx % 7 === 6 ? "border-r-0" : ""
            }`;

            return (
              <div
                key={day.toString()}
                className={`p-2 min-h-[100px] hover:bg-foreground/5 transition-colors relative group ${borderClasses} ${
                  !isCurrentMonth ? "bg-foreground/5" : "bg-white"
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span
                    className={`text-sm font-medium h-7 w-7 flex items-center justify-center rounded-full ${
                      isToday
                        ? "bg-primary text-white shadow-sm"
                        : isCurrentMonth
                          ? "text-foreground/70"
                          : "text-foreground/40"
                    }`}
                  >
                    {format(day, "d")}
                  </span>
                </div>
                <div className="space-y-1.5 overflow-y-auto max-h-20 scrollbar-thin scrollbar-thumb-foreground/20 scrollbar-track-transparent">
                  {dayItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick(item)}
                      className={`w-full text-left px-2 py-1 text-xs font-medium rounded border truncate cursor-pointer transition-colors ${item.colorClass}`}
                      title={`${format(item.start, "HH:mm")} - ${item.title}`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex-1 truncate">
                          <span className="hidden sm:inline font-bold mr-1">
                            {format(item.start, "HH:mm")}
                          </span>
                          {item.title}
                        </div>
                        {/* Event badges */}
                        {item.type === "event" &&
                          item.registrationCount !== undefined &&
                          item.maxAttendees && (
                            <div className="flex items-center gap-0.5 shrink-0">
                              <UsersIcon className="w-3 h-3" />
                              <span className="text-[10px]">
                                {item.registrationCount}/{item.maxAttendees}
                              </span>
                            </div>
                          )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Week/Day Time Grid View
  const renderTimeGrid = () => {
    const start =
      viewMode === "week" ? startOfWeek(currentDate) : startOfDay(currentDate);
    const end =
      viewMode === "week" ? endOfWeek(currentDate) : startOfDay(currentDate);

    const days =
      viewMode === "week" ? eachDayOfInterval({ start, end }) : [start];
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-foreground/10 flex flex-col overflow-hidden h-[calc(100vh-220px)]">
        {/* Header: Days */}
        <div className="flex border-b border-foreground/10 overflow-x-auto scrollbar-thin scrollbar-thumb-foreground/20 scrollbar-track-transparent">
          <div className="w-16 shrink-0 border-r border-foreground/10 bg-foreground/5 sticky left-0 z-10"></div>
          {days.map((day) => {
            const isToday = isSameDay(day, new Date());
            return (
              <div
                key={day.toString()}
                className="flex-1 py-3 text-center border-r border-foreground/10 min-w-[120px]"
              >
                <div
                  className={`text-xs font-medium uppercase ${
                    isToday ? "text-primary" : "text-foreground/50"
                  }`}
                >
                  {format(day, "EEE")}
                </div>
                <div
                  className={`text-xl font-semibold mt-1 ${
                    isToday ? "text-primary" : "text-foreground"
                  }`}
                >
                  {format(day, "d")}
                </div>
              </div>
            );
          })}
        </div>

        {/* Scrollable Time Grid */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-foreground/20 scrollbar-track-transparent relative">
          <div className="flex relative min-h-[1440px]">
            {/* Time Axis */}
            <div className="w-16 shrink-0 border-r border-foreground/10 bg-foreground/5 select-none sticky left-0 z-10">
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="h-[60px] text-right pr-2 pt-1 text-xs text-foreground/40 relative"
                >
                  <span className="-translate-y-1/2 block">
                    {hour === 0
                      ? "12 AM"
                      : hour < 12
                        ? `${hour} AM`
                        : hour === 12
                          ? "12 PM"
                          : `${hour - 12} PM`}
                  </span>
                </div>
              ))}
            </div>

            {/* Columns */}
            {days.map((day) => {
              const dayItems = calendarItems.filter((item) =>
                isSameDay(item.start, day)
              );

              return (
                <div
                  key={day.toString()}
                  className="flex-1 relative border-r border-foreground/10 min-w-[120px] bg-white group"
                >
                  {/* Grid Lines */}
                  {hours.map((h) => (
                    <div
                      key={h}
                      className="h-[60px] border-b border-foreground/5"
                    ></div>
                  ))}

                  {/* Items */}
                  {dayItems.map((item) => {
                    const startHour = getHours(item.start);
                    const startMin = getMinutes(item.start);
                    const top = startHour * 60 + startMin;

                    const diffMins = differenceInMinutes(item.end, item.start);
                    const height = Math.max(diffMins, 30);

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleItemClick(item)}
                        className={`absolute left-1 right-1 rounded p-2 text-xs border overflow-hidden hover:z-20 transition-all shadow-sm cursor-pointer ${item.colorClass}`}
                        style={{
                          top: `${top}px`,
                          height: `${height}px`,
                        }}
                        title={`${item.title} (${format(item.start, "HH:mm")} - ${format(
                          item.end,
                          "HH:mm"
                        )})`}
                      >
                        <div className="font-bold truncate">{item.title}</div>
                        <div className="flex items-center mt-0.5 opacity-80 truncate">
                          <ClockIcon className="w-3 h-3 mr-1" />
                          {format(item.start, "h:mm a")} -{" "}
                          {format(item.end, "h:mm a")}
                        </div>
                        {item.location && (
                          <div className="flex items-center mt-0.5 opacity-80 truncate">
                            <MapPinIcon className="w-3 h-3 mr-1" />
                            {item.location}
                          </div>
                        )}
                        {/* Event metadata */}
                        {item.type === "event" &&
                          item.registrationCount !== undefined &&
                          item.maxAttendees && (
                            <div className="flex items-center mt-0.5 opacity-80 truncate">
                              <UsersIcon className="w-3 h-3 mr-1" />
                              {item.registrationCount}/{item.maxAttendees}
                            </div>
                          )}
                      </button>
                    );
                  })}

                  {/* Current Time Indicator */}
                  {isSameDay(day, new Date()) && (
                    <div
                      className="absolute left-0 right-0 border-t-2 border-red-400 z-30 pointer-events-none"
                      style={{
                        top: `${getHours(new Date()) * 60 + getMinutes(new Date())}px`,
                      }}
                    >
                      <div className="w-2 h-2 bg-red-400 rounded-full -mt-[5px] -ml-px"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="h-full flex flex-col space-y-4">
        {renderHeader()}
        {viewMode === "month" ? renderMonthView() : renderTimeGrid()}
      </div>

      {/* Booking Detail Modal */}
      {selectedBooking && selectedBooking.type === 'booking' && (
        <BookingDetailModal
          isOpen={isBookingModalOpen}
          onClose={() => {
            setIsBookingModalOpen(false);
            setSelectedBooking(null);
          }}
          details={getBookingDetails(selectedBooking)}
        />
      )}
    </>
  );
}