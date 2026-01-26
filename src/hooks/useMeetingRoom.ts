import { useState, useEffect } from 'react';
import { MeetingRoom } from '@/types/database';

interface UseMeetingRoomResult {
  room: MeetingRoom | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useMeetingRoom(roomId: string): UseMeetingRoomResult {
  const [room, setRoom] = useState<MeetingRoom | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoom = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/public/meeting-rooms/${roomId}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch meeting room');
      }

      // Convert amenities array back to JSON string to match MeetingRoom type
      const roomData: MeetingRoom = {
        ...data.data,
        amenities: JSON.stringify(data.data.amenities),
      };

      setRoom(roomData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching meeting room:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (roomId) {
      fetchRoom();
    }
  }, [roomId]);

  const refetch = async () => {
    await fetchRoom();
  };

  return { room, isLoading, error, refetch };
}