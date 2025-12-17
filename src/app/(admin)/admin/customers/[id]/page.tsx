"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useCustomerDetail } from "@/hooks/useCustomerDetail";
import CustomerInfoCard from "./components/CustomerInfoCard";
import ActivityHistory from "./components/ActivityHistory";

export default function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const {
    customer,
    activities,
    activitiesLoading,
    activitiesPagination,
    loading,
    error,
    setActivitiesPage,
  } = useCustomerDetail(resolvedParams.id);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-2 text-sm text-foreground/60">
            Loading customer details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-foreground/60">{error || "Customer not found"}</p>
          <button
            onClick={() => router.push("/admin/customers")}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Back to Customers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push("/admin/customers")}
              className="p-2 rounded-lg hover:bg-white hover:shadow-sm text-foreground/60 hover:text-foreground transition-all"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Customer Details
              </h2>
              <p className="text-sm text-foreground/60">
                View and manage customer information
              </p>
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Customer Info */}
            <div className="lg:col-span-1">
              <CustomerInfoCard customer={customer} />
            </div>

            {/* Right Column: Activity History */}
            <div className="lg:col-span-2">
              <ActivityHistory
                activities={activities}
                loading={activitiesLoading}
                pagination={activitiesPagination}
                onPageChange={setActivitiesPage}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
