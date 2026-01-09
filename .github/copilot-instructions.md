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

### 3. Next.js 15+ Best Practices

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

### 4. Database Schema & Types

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

### 5. API Response Structure

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

### 6. Authentication & Authorization

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

### 7. Database Transactions

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

### 8. Error Handling

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

### 9. Logging & Activity Tracking

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

### 10. Component Props

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

### 11. Date & Time Handling

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

### 12. Environment Variables

```typescript
// Access in server components/API routes only
const apiKey = process.env.STRIPE_SECRET_KEY;

// For client-side (must be prefixed with NEXT_PUBLIC_)
const publicKey = process.env.NEXT_PUBLIC_STRIPE_KEY;
```

### 13. Image Handling

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

### 14. Form Handling

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

### 15. Tailwind CSS Classes

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