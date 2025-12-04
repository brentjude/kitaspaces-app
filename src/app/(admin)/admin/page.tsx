import AdminStatsCard from "@/app/(admin)/components/AdminStatsCard";

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 lg:mb-8">
          <AdminStatsCard
            title="Total Users"
            value="1,234"
            change={{ value: 12, trend: "up" }}
            icon={
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            }
          />

          <AdminStatsCard
            title="Upcoming Events"
            value="28"
            change={{ value: 5, trend: "up" }}
            icon={
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            }
          />

          <AdminStatsCard
            title="Total Revenue"
            value="$45,231"
            change={{ value: 8, trend: "up" }}
            icon={
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
          />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Recent Users */}
          <div className="bg-white rounded-lg border border-foreground/10 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base sm:text-lg font-semibold text-foreground">
                Recent Users
              </h2>
              <button className="text-xs text-primary hover:text-primary/80 font-medium">
                View all
              </button>
            </div>
            <div className="space-y-3">
              {[
                {
                  name: "John Doe",
                  email: "john@example.com",
                  time: "2 mins ago",
                },
                {
                  name: "Jane Smith",
                  email: "jane@example.com",
                  time: "15 mins ago",
                },
                {
                  name: "Mike Johnson",
                  email: "mike@example.com",
                  time: "1 hour ago",
                },
                {
                  name: "Sarah Wilson",
                  email: "sarah@example.com",
                  time: "2 hours ago",
                },
                {
                  name: "Tom Brown",
                  email: "tom@example.com",
                  time: "3 hours ago",
                },
              ].map((user, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-foreground/5 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-primary">
                      {user.name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-foreground/60 truncate">
                      {user.email}
                    </p>
                  </div>
                  <span className="text-xs text-foreground/50 flex-shrink-0">
                    {user.time}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white rounded-lg border border-foreground/10 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base sm:text-lg font-semibold text-foreground">
                Upcoming Events
              </h2>
              <button className="text-xs text-primary hover:text-primary/80 font-medium">
                View all
              </button>
            </div>
            <div className="space-y-3">
              {[
                {
                  title: "Team Meeting",
                  date: "Today, 2:00 PM",
                  attendees: 12,
                },
                {
                  title: "Product Launch",
                  date: "Tomorrow, 10:00 AM",
                  attendees: 45,
                },
                {
                  title: "Design Review",
                  date: "Dec 25, 3:00 PM",
                  attendees: 8,
                },
                {
                  title: "Sprint Planning",
                  date: "Dec 26, 9:00 AM",
                  attendees: 15,
                },
                {
                  title: "Client Presentation",
                  date: "Dec 27, 1:00 PM",
                  attendees: 20,
                },
              ].map((event, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-foreground/5 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {event.title}
                    </p>
                    <p className="text-xs text-foreground/60 mt-0.5">
                      {event.date}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-foreground/60 flex-shrink-0">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                    {event.attendees}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
