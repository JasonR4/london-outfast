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
        console.log(`Fetching ${sectionKey} content...`);
        const { data, error } = await supabase
          .from('homepage_content')
          .select('content')
          .eq('section_key', sectionKey)
          .eq('is_active', true)
          .maybeSingle();

        if (error) {
          if (error.code === 'PGRST116') {
            // No data found, use empty object
            console.log(`No content found for ${sectionKey}, using fallback`);
            setContent({});
          } else {
            throw error;
          }
        } else if (data) {
          console.log(`Content loaded for ${sectionKey}:`, data.content);
          setContent(data.content);
        } else {
          // Handle null data case
          console.log(`Null data for ${sectionKey}, using fallback`);
          setContent({});
        }
      } catch (err) {
        console.error(`Error fetching ${sectionKey} content:`, err);
        setError(`Failed to load ${sectionKey} content`);
        setContent({}); // Fallback to empty object
      } finally {
        console.log(`Loading complete for ${sectionKey}`);
        setLoading(false);
      }
    };

    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.warn(`Content loading timeout for ${sectionKey}, using fallback`);
      setContent({});
      setLoading(false);
    }, 5000); // 5 second timeout

    fetchContent().finally(() => {
      clearTimeout(timeoutId);
    });

    return () => clearTimeout(timeoutId);
  }, [sectionKey]);

  return { content, loading, error };
};