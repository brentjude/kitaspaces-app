'use client';

import { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, UserIcon, UserGroupIcon, UserPlusIcon } from '@heroicons/react/24/outline';

interface Customer {
  id: string;
  name: string;
  email: string | null;
  contactNumber: string | null;
  company: string | null;
}

interface Member {
  id: string;
  name: string;
  email: string;
  contactNumber: string | null;
  company: string | null;
  membership?: {
    id: string;
    plan?: {
      name: string;
      perks: Array<{
        perkType: string;
        name: string;
        quantity: number;
        unit: string;
      }>;
    };
  };
  availableMeetingRoomHours?: number;
}

interface AdminCustomerSelectionStepProps {
  selectedType: 'CUSTOMER' | 'MEMBER' | 'GUEST' | '';
  selectedCustomerId: string;
  selectedMemberId: string;
  onTypeChange: (type: 'CUSTOMER' | 'MEMBER' | 'GUEST') => void;
  onCustomerSelect: (customerId: string, customer: Customer) => void;
  onMemberSelect: (memberId: string, member: Member) => void;
}

export default function AdminCustomerSelectionStep({
  selectedType,
  selectedCustomerId,
  selectedMemberId,
  onTypeChange,
  onCustomerSelect,
  onMemberSelect,
}: AdminCustomerSelectionStepProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  useEffect(() => {
    if (selectedType === 'CUSTOMER' && searchQuery.length >= 2) {
      searchCustomers();
    } else if (selectedType === 'MEMBER' && searchQuery.length >= 2) {
      searchMembers();
    }
  }, [searchQuery, selectedType]);

  const searchCustomers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/customers/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      if (data.success) {
        setCustomers(data.data || []);
      }
    } catch (error) {
      console.error('Error searching customers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const searchMembers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/members/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      if (data.success) {
        setMembers(data.data || []);
      }
    } catch (error) {
      console.error('Error searching members:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomerClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    onCustomerSelect(customer.id, customer);
  };

  const handleMemberClick = (member: Member) => {
    setSelectedMember(member);
    onMemberSelect(member.id, member);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-foreground mb-1">Select Booking Type</h3>
        <p className="text-sm text-foreground/60">
          Choose whether this is for a customer, member, or walk-in guest
        </p>
      </div>

      {/* Type Selection */}
      <div className="grid grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => {
            onTypeChange('CUSTOMER');
            setSearchQuery('');
            setSelectedCustomer(null);
          }}
          className={`p-4 rounded-xl border-2 transition-all ${
            selectedType === 'CUSTOMER'
              ? 'border-primary bg-primary/5'
              : 'border-foreground/20 hover:border-primary/50'
          }`}
        >
          <UserIcon className="w-8 h-8 mx-auto mb-2 text-primary" />
          <p className="font-semibold text-sm">Customer</p>
          <p className="text-xs text-foreground/60 mt-1">Existing customer</p>
        </button>

        <button
          type="button"
          onClick={() => {
            onTypeChange('MEMBER');
            setSearchQuery('');
            setSelectedMember(null);
          }}
          className={`p-4 rounded-xl border-2 transition-all ${
            selectedType === 'MEMBER'
              ? 'border-primary bg-primary/5'
              : 'border-foreground/20 hover:border-primary/50'
          }`}
        >
          <UserGroupIcon className="w-8 h-8 mx-auto mb-2 text-green-600" />
          <p className="font-semibold text-sm">Member</p>
          <p className="text-xs text-foreground/60 mt-1">Registered member</p>
        </button>

        <button
          type="button"
          onClick={() => onTypeChange('GUEST')}
          className={`p-4 rounded-xl border-2 transition-all ${
            selectedType === 'GUEST'
              ? 'border-primary bg-primary/5'
              : 'border-foreground/20 hover:border-primary/50'
          }`}
        >
          <UserPlusIcon className="w-8 h-8 mx-auto mb-2 text-orange-600" />
          <p className="font-semibold text-sm">Guest</p>
          <p className="text-xs text-foreground/60 mt-1">Walk-in/New</p>
        </button>
      </div>

      {/* Search for Customer */}
      {selectedType === 'CUSTOMER' && (
        <div className="space-y-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, or phone..."
              className="w-full pl-11 pr-4 py-3 border-2 border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>

          {isLoading && (
            <div className="text-center py-4">
              <div className="inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {!isLoading && searchQuery.length >= 2 && customers.length === 0 && (
            <div className="text-center py-8 text-foreground/60">
              No customers found. Try a different search or select Guest.
            </div>
          )}

          {!isLoading && customers.length > 0 && (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {customers.map((customer) => (
                <button
                  key={customer.id}
                  type="button"
                  onClick={() => handleCustomerClick(customer)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                    selectedCustomerId === customer.id
                      ? 'border-primary bg-primary/5'
                      : 'border-foreground/10 hover:border-primary/50'
                  }`}
                >
                  <div className="font-semibold">{customer.name}</div>
                  <div className="text-sm text-foreground/60 flex items-center gap-3 mt-1">
                    {customer.email && <span>{customer.email}</span>}
                    {customer.contactNumber && <span>📱 {customer.contactNumber}</span>}
                  </div>
                  {customer.company && (
                    <div className="text-xs text-foreground/50 mt-1">🏢 {customer.company}</div>
                  )}
                </button>
              ))}
            </div>
          )}

          {selectedCustomer && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>Selected:</strong> {selectedCustomer.name}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Search for Member */}
      {selectedType === 'MEMBER' && (
        <div className="space-y-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-11 pr-4 py-3 border-2 border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>

          {isLoading && (
            <div className="text-center py-4">
              <div className="inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {!isLoading && searchQuery.length >= 2 && members.length === 0 && (
            <div className="text-center py-8 text-foreground/60">
              No members found. Try a different search.
            </div>
          )}

          {!isLoading && members.length > 0 && (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {members.map((member) => {
                const meetingRoomPerk = member.membership?.plan?.perks?.find(
                  (p) => p.perkType === 'MEETING_ROOM_HOURS'
                );

                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => handleMemberClick(member)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                      selectedMemberId === member.id
                        ? 'border-primary bg-primary/5'
                        : 'border-foreground/10 hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-semibold">{member.name}</div>
                        <div className="text-sm text-foreground/60 mt-1">{member.email}</div>
                        {member.company && (
                          <div className="text-xs text-foreground/50 mt-1">🏢 {member.company}</div>
                        )}
                      </div>
                      {member.membership?.plan && (
                        <div className="ml-3">
                          <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                            {member.membership.plan.name}
                          </span>
                        </div>
                      )}
                    </div>

                    {meetingRoomPerk && (
                      <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                        <p className="text-xs text-blue-800">
                          <strong>Meeting Room Hours:</strong> {meetingRoomPerk.quantity} {meetingRoomPerk.unit}
                          {member.availableMeetingRoomHours !== undefined && (
                            <span className="ml-2 text-blue-600">
                              ({member.availableMeetingRoomHours} available)
                            </span>
                          )}
                        </p>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {selectedMember && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>Selected:</strong> {selectedMember.name}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Guest Info */}
      {selectedType === 'GUEST' && (
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-sm text-orange-900">
            <strong>📝 Guest Booking:</strong> You'll enter the guest's details in the next step. 
            Only name and contact number are required. A new customer record will be created.
          </p>
        </div>
      )}
    </div>
  );
}