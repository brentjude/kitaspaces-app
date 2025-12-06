'use client';

import CustomerTableRow from './CustomerTableRow';

interface Customer {
  id: string;
  name: string;
  email: string | null;
  company: string | null;
  contactNumber: string | null;
  isRegistered: boolean;
  isMember: boolean;
  referralSource: string | null;
  joinedDate: Date;
  eventRegistrations: number;
  totalPayments: number;
  type: 'user' | 'customer';
  linkedUserId?: string | null;
}

interface CustomersTableProps {
  customers: Customer[];
  loading: boolean;
}

export default function CustomersTable({ customers, loading }: CustomersTableProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-foreground/10 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-2 text-sm text-foreground/60">Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-foreground/10 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-foreground/10">
          <thead className="bg-foreground/5">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider"
              >
                Customer Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider"
              >
                Contact Info
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider"
              >
                Company
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider"
              >
                Is User
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider"
              >
                Activity
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider"
              >
                Joined Date
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-foreground/10">
            {customers.length > 0 ? (
              customers.map((customer) => (
                <CustomerTableRow key={customer.id} customer={customer} />
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-foreground/50 text-sm">
                  No customers found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}