import { useState, useCallback, useRef } from 'react';
import { Room, VideoPresets } from 'livekit-client';

export type ConnectionMode = "cloud" | "manual" | "env";

export function useConnection() {
  const [token, setToken] = useState<string>('');
  const [wsUrl, setWsUrl] = useState<string>('');
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const roomRef = useRef<Room | null>(null);

  const connect = useCallback(async (identity: string) => {
    try {
      // Limit reconnection attempts
      if (connectionAttempts > 3) {
        console.error('Maximum reconnection attempts reached');
        return false;
      }

      // Get LiveKit URL from environment variable
      const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;
      if (!livekitUrl) {
        throw new Error('LiveKit URL not configured');
      }

      setConnectionAttempts(prev => prev + 1);

      // Initialize room if not exists
      if (!roomRef.current) {
        roomRef.current = new Room({
          adaptiveStream: true,
          dynacast: true,
          publishDefaults: {
            simulcast: true,
            videoSimulcastLayers: [
              VideoPresets.h720,
              VideoPresets.h360
            ],
          },
        });
      }

      // Create a new token request
      const resp = await fetch('/api/get-participant-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identity,
          room: 'style-consultation',
        }),
      });

      const data = await resp.json();
      
      if (!resp.ok) {
        throw new Error(data.error || 'Failed to get token');
      }

      setToken(data.token);
      setWsUrl(livekitUrl);
      setConnectionAttempts(0); // Reset attempts on successful connection

      // Connect to room
      if (roomRef.current) {
        await roomRef.current.connect(livekitUrl, data.token, {
          autoSubscribe: true,
        });
      }

      return true;
    } catch (error) {
      console.error('Connection error:', error);
      return false;
    }
  }, [connectionAttempts]);

  const disconnect = useCallback(async () => {
    if (roomRef.current) {
      await roomRef.current.disconnect();
      roomRef.current = null;
    }
    setToken('');
    setWsUrl('');
    setConnectionAttempts(0);
  }, []);

  return {
    token,
    wsUrl,
    connect,
    disconnect,
    connectionAttempts,
    room: roomRef.current,
  };
} 