import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import EventDetailsCard from './components/EventDetailsCard';
import EventRegistrantsList from './components/EventRegistrantsList';

interface EventDetailsPageProps {
  params: Promise<{ id: string }>;
}

async function getEventDetails(eventId: string) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      registrations: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              isMember: true,
              contactNumber: true,
            },
          },
          pax: true,
          payment: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
      freebies: {
        include: {
          paxFreebies: {
            include: {
              pax: true,
            },
          },
        },
      },
    },
  });

  return event;
}

async function getAllUsers() {
  const users = await prisma.user.findMany({
    where: {
      role: 'USER',
    },
    select: {
      id: true,
      name: true,
      email: true,
      isMember: true,
    },
    orderBy: {
      name: 'asc',
    },
  });

  return users;
}

export default async function EventDetailsPage({ params }: EventDetailsPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/auth/signin');
  }

  const resolvedParams = await params;
  const event = await getEventDetails(resolvedParams.id);

  if (!event) {
    notFound();
  }

  const allUsers = await getAllUsers();

  // Check if event has paid registrations
  const hasPaidRegistrations = event.registrations.some(
    (reg) => reg.payment && reg.payment.status === 'COMPLETED'
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Back Button */}
        <Link
          href="/admin/events"
          className="inline-flex items-center gap-2 text-sm font-medium text-foreground/60 hover:text-primary transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Events
        </Link>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Event Details */}
          <EventDetailsCard
            event={event}
            hasPaidRegistrations={hasPaidRegistrations}
          />

          {/* Right Column: Registrants List */}
          <EventRegistrantsList
            event={event}
            allUsers={allUsers}
          />
        </div>
      </div>
    </div>
  );
}