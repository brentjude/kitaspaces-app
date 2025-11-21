// Purpose: Reusable header for admin dashboard pages
// Features: Page title, breadcrumbs, action buttons
'use client';

interface AdminHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export default function AdminHeader({ title, description, children }: AdminHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground font-sans">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-foreground/70 mt-1">
            {description}
          </p>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-3">
          {children}
        </div>
      )}
    </div>
  );
}