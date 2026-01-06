import { ReactNode } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import PublicHeader from '@/app/components/Header';

interface UserLayoutProps {
  children: ReactNode;
}

export default async function UserLayout({ children }: UserLayoutProps) {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <PublicHeader
        currentUser={
          session?.user
            ? {
                name: session.user.name || '',
                email: session.user.email || '',
                role: session.user.role,
                isMember: true, // Users in this route are typically members
              }
            : null
        }
      />
      {children}
    </div>
  );
}