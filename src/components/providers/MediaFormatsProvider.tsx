import React, { createContext, useContext, useEffect, useState } from 'react';
import MediaFormatsService, { MediaFormat } from '@/services/mediaFormatsService';

interface MediaFormatsContextType {
  mediaFormats: MediaFormat[];
  loading: boolean;
  error: string | null;
  service: MediaFormatsService;
}

const MediaFormatsContext = createContext<MediaFormatsContextType | undefined>(undefined);

export const MediaFormatsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mediaFormats, setMediaFormats] = useState<MediaFormat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [service] = useState(() => MediaFormatsService.getInstance());

  useEffect(() => {
    const subscriptionKey = 'provider';

    // Subscribe to real-time updates
    service.subscribe(subscriptionKey, (formats) => {
      setMediaFormats(formats);
      setLoading(false);
    });

    // Initial fetch
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const formats = await service.fetchFormats(false);
        setMediaFormats(formats);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch media formats');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Cleanup subscription on unmount
    return () => {
      service.unsubscribe(subscriptionKey);
    };
  }, [service]);

  const value: MediaFormatsContextType = {
    mediaFormats,
    loading,
    error,
    service
  };

  return (
    <MediaFormatsContext.Provider value={value}>
      {children}
    </MediaFormatsContext.Provider>
  );
};

export const useMediaFormatsContext = () => {
  const context = useContext(MediaFormatsContext);
  if (context === undefined) {
    throw new Error('useMediaFormatsContext must be used within a MediaFormatsProvider');
  }
  return context;
};