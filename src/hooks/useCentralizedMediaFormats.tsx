import { useState, useEffect } from 'react';
import MediaFormatsService, { MediaFormat } from '@/services/mediaFormatsService';

export const useCentralizedMediaFormats = (includeInactive = false) => {
  const [mediaFormats, setMediaFormats] = useState<MediaFormat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const service = MediaFormatsService.getInstance();
    const subscriptionKey = `hook-${Date.now()}-${Math.random()}`;

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
        const formats = await service.fetchFormats(includeInactive);
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
  }, [includeInactive]);

  const updateFormat = async (formatId: string, updates: Partial<MediaFormat>) => {
    try {
      const service = MediaFormatsService.getInstance();
      await service.updateFormat(formatId, updates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update format');
      throw err;
    }
  };

  const createFormat = async (format: Omit<MediaFormat, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const service = MediaFormatsService.getInstance();
      return await service.createFormat(format);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create format');
      throw err;
    }
  };

  const deleteFormat = async (formatId: string) => {
    try {
      const service = MediaFormatsService.getInstance();
      await service.deleteFormat(formatId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete format');
      throw err;
    }
  };

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);
      const service = MediaFormatsService.getInstance();
      const formats = await service.fetchFormats(includeInactive);
      setMediaFormats(formats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refetch media formats');
    } finally {
      setLoading(false);
    }
  };

  const getFormatBySlug = async (slug: string): Promise<MediaFormat | undefined> => {
    const service = MediaFormatsService.getInstance();
    return await service.getFormatBySlugAsync(slug);
  };

  const getFormatBySlugSync = (slug: string): MediaFormat | undefined => {
    const service = MediaFormatsService.getInstance();
    return service.getFormatBySlug(slug);
  };

  const getFormatsBySearch = (searchQuery: string): MediaFormat[] => {
    const service = MediaFormatsService.getInstance();
    return service.getFormatsBySearch(searchQuery);
  };

  return {
    mediaFormats,
    loading,
    error,
    updateFormat,
    createFormat,
    deleteFormat,
    refetch,
    getFormatBySlug,
    getFormatBySlugSync,
    getFormatsBySearch
  };
};