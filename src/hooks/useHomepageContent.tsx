import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface HomepageContent {
  id: string;
  section_key: string;
  content: any;
  is_active: boolean;
}

export const useHomepageContent = (sectionKey: string) => {
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const { data, error } = await supabase
          .from('homepage_content')
          .select('content')
          .eq('section_key', sectionKey)
          .eq('is_active', true)
          .maybeSingle();

        if (error) {
          if (error.code === 'PGRST116') {
            // No data found, use empty object
            setContent({});
          } else {
            throw error;
          }
        } else if (data) {
          setContent(data.content);
        } else {
          // Handle null data case
          setContent({});
        }
      } catch (err) {
        console.error(`Error fetching ${sectionKey} content:`, err);
        setError(`Failed to load ${sectionKey} content`);
        setContent({}); // Fallback to empty object
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [sectionKey]);

  return { content, loading, error };
};