import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface MediaFormat {
  id: string;
  format_slug: string;
  format_name: string;
  description?: string;
  dimensions?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useMediaFormats = () => {
  const [mediaFormats, setMediaFormats] = useState<MediaFormat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMediaFormats = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('media_formats')
        .select('*')
        .eq('is_active', true)
        .order('format_name');

      if (error) throw error;
      setMediaFormats(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch media formats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMediaFormats();
  }, []);

  const getFormatBySlug = (slug: string): MediaFormat | undefined => {
    return mediaFormats.find(format => format.format_slug === slug);
  };

  const getFormatsBySearch = (searchQuery: string): MediaFormat[] => {
    return mediaFormats.filter(format =>
      format.format_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (format.description && format.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };

  return {
    mediaFormats,
    loading,
    error,
    refetch: fetchMediaFormats,
    getFormatBySlug,
    getFormatsBySearch
  };
};