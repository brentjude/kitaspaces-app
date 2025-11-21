// Purpose: Reusable stats card for dashboard metrics
// Features: Icon, title, value, change indicator
'use client';

interface AdminStatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    trend: 'up' | 'down';
  };
  icon: React.ReactNode;
}

export default function AdminStatsCard({ title, value, change, icon }: AdminStatsCardProps) {
  return (
    <div className="bg-white rounded-lg border border-foreground/10 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
        {change && (
          <span
            className={`flex items-center gap-1 text-xs font-medium ${
              change.trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {change.trend === 'up' ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            )}
            {Math.abs(change.value)}%
          </span>
        )}
      </div>
      <h3 className="text-sm font-medium text-foreground/60 mb-1">
        {title}
      </h3>
      <p className="text-2xl font-semibold text-foreground">
        {value}
      </p>
    </div>
  );
}