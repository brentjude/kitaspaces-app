# GitHub Copilot Instructions for KitaSpaces App

## Project Overview
This is a Next.js 15+ application for KitaSpaces - a coworking space management system with event management, membership plans, and meeting room bookings.

## Core Rules

### 1. Type Safety - NO `any` Types
- **NEVER** use `any` type
- Always define explicit interfaces and types
- Use proper TypeScript generics when needed
- Import types from `@/types/*` or `@/generated/prisma`

#### ✅ Good Examples:
```typescript
interface CustomerData {
  id: string;
  name: string;
  email: string | null;
  contactNumber: string | null;
}

const updateData: {
  name?: string;
  email?: string | null;
} = {};
```

#### ❌ Bad Examples:
```typescript
const data: any = {};
function handleData(item: any) {}
```

### 2. File Structure Comments
**ALWAYS** start every file with a filepath comment:

```typescript
// filepath: c:\Users\Jude\Documents\GitHub\kitaspaces-app\src\app\api\admin\payments\route.ts
```

### 3. Component Refractoring & Organization

#### Always Refractor When Possible

- Break down large components into smaller, reusable pieces
- Extract repeated UI patterns into separate components
- Separate logic from presentation when applicable
- Create component folders for related components

#### When to Refractor
1. Component exceeds 200 lines
2. Multiple similar UI patterns exist
3. Logic can be reused across pages
4. Component has multiple responsibilities
5. Complex state management exists

#### Component Structure Examples

✅ Good - Modular Structure:
```typescript
src/app/(admin)/admin/payments/
├── page.tsx                    # Main page - orchestrates components
├── components/
│   ├── PaymentFilters.tsx     # Filter controls
│   ├── PaymentsTable.tsx      # Table display
│   ├── PaymentDetailsModal.tsx # Detail modal
│   ├── PaymentStats.tsx       # Stats cards
│   └── Pagination.tsx         # Pagination controls

❌ Bad - Monolithic Structure:

src/app/(admin)/admin/payments/
└── page.tsx                    # Everything in one file (500+ lines)
```

#### Component Extration Guidelines

```typescript
Extract when you see:
// ❌ BAD - All in one component
export default function PaymentsPage() {
  // 50 lines of state management
  // 100 lines of data fetching
  // 200 lines of UI rendering
  // 150 lines of modal logic
}
```

✅ GOOD - Separated:
```typescript
// Main page - orchestration only
export default function PaymentsPage() {
  const { payments, stats, isLoading } = usePayments(filters);
  
  return (
    <div className="space-y-6">
      <PaymentStats stats={stats} />
      <PaymentFilters filters={filters} onFilterChange={setFilters} />
      <PaymentsTable payments={payments} onSelect={handleSelect} />
      <PaymentModal payment={selected} onClose={handleClose} />
    </div>
  );
}

// Separate components
// src/app/(admin)/admin/payments/components/PaymentStats.tsx
// src/app/(admin)/admin/payments/components/PaymentFilters.tsx
// src/app/(admin)/admin/payments/components/PaymentsTable.tsx
// src/app/(admin)/admin/payments/components/PaymentModal.tsx
```

#### Customer Hooks for Logic

```typescript
// filepath: src/hooks/usePayments.ts
import { useState, useEffect } from 'react';
import { PaymentRecord, PaymentFilters } from '@/types/payment';

export function usePayments(filters: PaymentFilters) {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalPaid: 0,
    totalPending: 0,
    totalRefunded: 0,
    eventRevenue: 0,
    membershipRevenue: 0,
    roomBookingRevenue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          search: filters.search,
          typeFilter: filters.typeFilter,
          statusFilter: filters.statusFilter,
          page: filters.page.toString(),
          limit: filters.limit.toString(),
        });

        const response = await fetch(`/api/admin/payments?${params}`);
        const data = await response.json();

        if (data.success) {
          setPayments(data.data.payments);
          setStats(data.data.stats);
        }
      } catch (error) {
        console.error('Error fetching payments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayments();
  }, [filters]);

  const refetch = async () => {
    // Refetch logic
  };

  return { payments, stats, isLoading, refetch };
}
```

#### Shared Component Location
```typescript
// Used in multiple pages → src/app/components/
// filepath: src/app/components/DataTable.tsx
export default function DataTable({ ... }) { }

// Used in one feature → feature/components/
// filepath: src/app/(admin)/admin/payments/components/PaymentTable.tsx
export default function PaymentTable({ ... }) { }
```

### 4. Next.js 15+ Best Practices

#### Server Components (Default)
```typescript
// filepath: src/app/dashboard/page.tsx
import { prisma } from '@/lib/prisma';

export default async function DashboardPage() {
  const data = await prisma.event.findMany();
  return <div>{/* ... */}</div>;
}
```

#### Client Components
```typescript
// filepath: src/app/components/Modal.tsx
'use client';

import { useState } from 'react';

export default function Modal() {
  const [isOpen, setIsOpen] = useState(false);
  return <div>{/* ... */}</div>;
}
```

#### API Routes (App Router)
```typescript
// filepath: src/app/api/events/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const data = await prisma.event.findMany();
  return NextResponse.json({ success: true, data });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  // ...
  return NextResponse.json({ success: true });
}
```

#### Dynamic Routes
```typescript
// filepath: src/app/api/events/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  const { id } = params;
  // ...
}
```

### 5. Database Schema & Types

#### Always Include Schema Relations
```typescript
const booking = await prisma.meetingRoomBooking.create({
  data: {
    // ... data
  },
  include: {
    room: true,
    payment: true,
    user: {
      select: {
        id: true,
        name: true,
        email: true,
      },
    },
  },
});
```

#### Use Prisma Types
```typescript
import { PaymentStatus, PaymentMethod, Prisma } from '@/generated/prisma';

const whereCondition: Prisma.PaymentWhereInput = {
  status: PaymentStatus.COMPLETED,
  paymentMethod: PaymentMethod.GCASH,
};
```

#### Define Response Types
```typescript
// filepath: src/types/payment.ts
import { PaymentMethod, PaymentStatus } from '@/generated/prisma';

export interface PaymentRecord {
  id: string;
  type: 'USER' | 'CUSTOMER';
  recordType: 'EVENT' | 'MEMBERSHIP' | 'ROOM_BOOKING';
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  // ... other fields
}

export interface PaymentStats {
  totalRevenue: number;
  totalPaid: number;
  totalPending: number;
  eventRevenue: number;
  membershipRevenue: number;
  roomBookingRevenue: number;
}
```

### 6. API Response Structure

#### Standard Success Response
```typescript
return NextResponse.json({
  success: true,
  data: {
    // ... response data
  },
  message: 'Operation completed successfully', // optional
});
```

#### Standard Error Response
```typescript
return NextResponse.json(
  {
    success: false,
    error: 'Error message here',
  },
  { status: 400 } // or appropriate status code
);
```

### 7. Authentication & Authorization

#### Check Admin Role
```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const session = await getServerSession(authOptions);

if (!session?.user || session.user.role !== 'ADMIN') {
  return NextResponse.json(
    { success: false, error: 'Unauthorized' },
    { status: 401 }
  );
}
```

#### Check Member Status
```typescript
if (!session?.user || !session.user.isMember) {
  return NextResponse.json(
    { success: false, error: 'Member access required' },
    { status: 403 }
  );
}
```

### 8. Database Transactions

#### Always Use Transactions for Multiple Operations
```typescript
const result = await prisma.$transaction(async (tx) => {
  const customer = await tx.customer.create({
    data: { /* ... */ },
  });

  const payment = await tx.customerPayment.create({
    data: {
      customerId: customer.id,
      // ...
    },
  });

  const booking = await tx.customerMeetingRoomBooking.create({
    data: {
      customerId: customer.id,
      paymentId: payment.id,
      // ...
    },
  });

  return { customer, payment, booking };
});
```

### 9. Error Handling

#### API Routes
```typescript
export async function POST(request: NextRequest) {
  try {
    // ... logic
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error description:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Generic error message',
      },
      { status: 500 }
    );
  }
}
```

#### Client Components
```typescript
try {
  const response = await fetch('/api/endpoint', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || 'Operation failed');
  }

  // Handle success
} catch (error) {
  console.error('Operation error:', error);
  alert(error instanceof Error ? error.message : 'Operation failed');
}
```

### 10. Logging & Activity Tracking

#### Admin Actions
```typescript
import { logAdminActivity } from '@/lib/activityLogger';

await logAdminActivity(
  session.user.id!,
  'ACTION_TYPE',
  'Human readable description',
  {
    referenceId: record.id,
    referenceType: 'RECORD_TYPE',
    metadata: {
      // ... relevant data
    },
    request,
  }
);
```

#### Console Logging
```typescript
// ✅ Allowed console methods:
console.error('Error message', error);
console.warn('Warning message');
console.info('Info message');

// ❌ NOT allowed:
console.log('Debug message'); // Use console.info instead
```

### 11. Component Props

#### Always Define Prop Interfaces
```typescript
// filepath: src/app/components/Modal.tsx
'use client';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}: ModalProps) {
  // ...
}
```

### 12. Date & Time Handling

```typescript
// Store as Date objects in database
const bookingDate = new Date(dateString);

// Format for display
const formattedDate = bookingDate.toLocaleDateString('en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

// Time calculations
const [hours, minutes] = startTime.split(':').map(Number);
const totalMinutes = hours * 60 + minutes + durationHours * 60;
```

### 13. Environment Variables

```typescript
// Access in server components/API routes only
const apiKey = process.env.STRIPE_SECRET_KEY;

// For client-side (must be prefixed with NEXT_PUBLIC_)
const publicKey = process.env.NEXT_PUBLIC_STRIPE_KEY;
```

### 14. Image Handling

```typescript
import Image from 'next/image';

<Image
  src={imageUrl}
  alt="Description"
  fill
  className="object-cover"
  priority // for above-fold images
/>
```

### 15. Form Handling

```typescript
'use client';

interface FormData {
  name: string;
  email: string;
  phone: string;
}

const [formData, setFormData] = useState<FormData>({
  name: '',
  email: '',
  phone: '',
});

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Validation
  if (!formData.name.trim()) {
    alert('Name is required');
    return;
  }

  // Submit logic
};
```

### 16. Tailwind CSS Classes

```typescript
// Use semantic color variables
className="bg-primary text-white"
className="text-foreground/60"
className="border-foreground/10"

// Responsive design
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"

// Hover states
className="hover:bg-primary/90 transition-colors"
```

## Project-Specific Patterns

### Meeting Room Bookings
- User bookings → `MeetingRoomBooking` table + `Payment` table
- Customer bookings → `CustomerMeetingRoomBooking` table + `CustomerPayment` table
- Payment reference format: `mrb_kita_YYYY_NNN`

### Event Registrations
- User registrations → `EventRegistration` table + `Payment` table
- Customer registrations → `CustomerEventRegistration` table + `CustomerPayment` table

### Membership Plans
- Only users can have memberships (not customers)
- Track perk usage in `MembershipPerkUsage` table

### Customer vs User
- **User**: Registered account with authentication
- **Customer**: Walk-in or guest without account
- Both can register for events and book rooms
- Only users can have memberships

## File Organization

```
src/
├── app/
│   ├── (admin)/           # Admin dashboard routes
│   ├── (public)/          # Public-facing routes
│   ├── api/               # API routes
│   └── components/        # Shared components
├── lib/                   # Utility functions
├── types/                 # TypeScript type definitions
└── generated/             # Generated Prisma types
    └── prisma/
```

## Common Pitfalls to Avoid

1. ❌ Using `any` type
2. ❌ Forgetting filepath comments
3. ❌ Not including relations in Prisma queries
4. ❌ Missing error handling in API routes
5. ❌ Not validating required fields
6. ❌ Using `console.log` instead of `console.info`
7. ❌ Not using transactions for multi-table operations
8. ❌ Missing TypeScript interfaces for props and data
9. ❌ Not checking authentication/authorization
10. ❌ Inconsistent API response structures

## Questions to Ask Before Coding

1. Is this a server or client component?
2. What types/interfaces are needed?
3. What database relations should be included?
4. Does this need authentication/authorization?
5. Should this be in a transaction?
6. What error cases need handling?
7. What activity logging is needed?
8. Are all required fields validated?

---

**Remember**: Type safety, explicit schemas, and proper error handling are non-negotiable in this project.