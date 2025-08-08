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
        setLoading(true);
        console.log(`Fetching homepage content for section: ${sectionKey}`);
        
        const { data, error } = await supabase
          .from('homepage_content')
          .select('content')
          .eq('section_key', sectionKey)
          .eq('is_active', true)
          .maybeSingle(); // Use maybeSingle instead of single

        if (error) {
          console.error(`Error fetching ${sectionKey} content:`, error);
          setError(`Failed to load ${sectionKey} content`);
          setContent({}); // Fallback to empty object
        } else if (data) {
          console.log(`Successfully fetched ${sectionKey} content:`, data);
          setContent(data.content);
        } else {
          console.log(`No content found for ${sectionKey}, using fallback`);
          setContent({}); // No data found, use empty object
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