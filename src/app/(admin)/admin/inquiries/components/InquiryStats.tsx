'use client';

import {
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

interface InquiryStatsProps {
  stats: {
    PENDING: number;
    IN_PROGRESS: number;
    RESOLVED: number;
    CLOSED: number;
  };
}

export default function InquiryStats({ stats }: InquiryStatsProps) {
  const statCards = [
    {
      label: 'Pending',
      value: stats.PENDING,
      icon: ClockIcon,
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600',
      borderColor: 'border-yellow-200',
    },
    {
      label: 'In Progress',
      value: stats.IN_PROGRESS,
      icon: ExclamationCircleIcon,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-200',
    },
    {
      label: 'Resolved',
      value: stats.RESOLVED,
      icon: CheckCircleIcon,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      borderColor: 'border-green-200',
    },
    {
      label: 'Closed',
      value: stats.CLOSED,
      icon: XCircleIcon,
      bgColor: 'bg-gray-50',
      iconColor: 'text-gray-600',
      borderColor: 'border-gray-200',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat) => (
        <div
          key={stat.label}
          className={`${stat.bgColor} border ${stat.borderColor} rounded-lg p-4`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground/60">
                {stat.label}
              </p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {stat.value}
              </p>
            </div>
            <div className={`${stat.iconColor}`}>
              <stat.icon className="w-8 h-8" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}