import { useState, useEffect } from "react";
import {
  CustomerDetailInfo,
  CustomerActivity,
  CustomerActivityResponse,
} from "@/types/customer-detail";

interface UseCustomerDetailReturn {
  customer: CustomerDetailInfo | null;
  activities: CustomerActivity[];
  activitiesLoading: boolean;
  activitiesPagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  loadMoreActivities: () => Promise<void>;
  setActivitiesPage: (page: number) => void;
}

export function useCustomerDetail(customerId: string): UseCustomerDetailReturn {
  const [customer, setCustomer] = useState<CustomerDetailInfo | null>(null);
  const [activities, setActivities] = useState<CustomerActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activitiesPage, setActivitiesPage] = useState(1);
  const [activitiesPagination, setActivitiesPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  const fetchCustomerDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/customers/${customerId}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch customer details");
      }

      setCustomer(data.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setCustomer(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async (page: number) => {
    try {
      setActivitiesLoading(true);
      const response = await fetch(
        `/api/admin/customers/${customerId}/activities?page=${page}&limit=20`
      );
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to fetch activities");
      }

      const data = result.data as CustomerActivityResponse;
      setActivities(data.activities);
      setActivitiesPagination(data.pagination);
    } catch (err) {
      console.error("Failed to fetch activities:", err);
    } finally {
      setActivitiesLoading(false);
    }
  };

  useEffect(() => {
    if (customerId) {
      fetchCustomerDetails();
      fetchActivities(1);
    }
  }, [customerId]);

  const refetch = async () => {
    await fetchCustomerDetails();
    await fetchActivities(activitiesPage);
  };

  const loadMoreActivities = async () => {
    if (activitiesPage < activitiesPagination.totalPages) {
      await fetchActivities(activitiesPage + 1);
      setActivitiesPage((prev) => prev + 1);
    }
  };

  const handleSetActivitiesPage = async (page: number) => {
    setActivitiesPage(page);
    await fetchActivities(page);
  };

  return {
    customer,
    activities,
    activitiesLoading,
    activitiesPagination,
    loading,
    error,
    refetch,
    loadMoreActivities,
    setActivitiesPage: handleSetActivitiesPage,
  };
}
