import { Event, EventCategory } from '@/types/database';

type PublicEvent = Event & {
  category?: EventCategory | null;
  registrationCount?: number;
  freebies?: Array<{
    id: string;
    name: string;
    description: string | null;
    quantity: number;
    imageUrl: string | null;
  }>;
};

export async function fetchPublicEvents(params?: {
  search?: string;
  categoryId?: string;
}): Promise<{ success: boolean; data?: PublicEvent[]; error?: string }> {
  try {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.categoryId) searchParams.set('categoryId', params.categoryId);

    const url = `/api/public/events${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to fetch events' }));
      return {
        success: false,
        error: errorData.error || `HTTP error ${response.status}`,
      };
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching public events:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch events',
    };
  }
}

export async function fetchPublicEventBySlug(slug: string): Promise<{
  success: boolean;
  data?: PublicEvent;
  error?: string;
  correctSlug?: string;
}> {
  try {
    if (!slug) {
      return {
        success: false,
        error: 'Slug is required',
      };
    }

    const response = await fetch(`/api/public/events/${encodeURIComponent(slug)}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Event not found' }));
      return {
        success: false,
        error: errorData.error || `HTTP error ${response.status}`,
        correctSlug: errorData.correctSlug,
      };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching event by slug:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch event',
    };
  }
}

export async function fetchPublicEventCategories(): Promise<{
  success: boolean;
  data?: EventCategory[];
  error?: string;
}> {
  try {
    const response = await fetch('/api/public/categories');
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to fetch categories' }));
      return {
        success: false,
        error: errorData.error || `HTTP error ${response.status}`,
      };
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching categories:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch categories',
    };
  }
}