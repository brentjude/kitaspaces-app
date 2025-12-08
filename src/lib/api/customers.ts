import { CustomerListApiResponse, CustomerQueryParams } from '@/types/database';

/**
 * Fetches customers from the API (both users and guests)
 * 
 * @param params - Query parameters for filtering customers
 * @returns Promise with customers data
 * 
 * @example
 * ```typescript
 * const { data } = await fetchCustomers({ 
 *   search: 'john', 
 *   filter: 'registered',
 *   page: 1,
 *   limit: 50
 * });
 * ```
 */
export async function fetchCustomers(
  params: CustomerQueryParams = {}
): Promise<CustomerListApiResponse> {
  const searchParams = new URLSearchParams();

  if (params.search) {
    searchParams.append('search', params.search);
  }

  if (params.filter) {
    searchParams.append('filter', params.filter);
  }

  if (params.page !== undefined) {
    searchParams.append('page', params.page.toString());
  }

  if (params.limit !== undefined) {
    searchParams.append('limit', params.limit.toString());
  }

  const url = `/api/admin/customers${searchParams.toString() ? `?${searchParams}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return response.json();
}