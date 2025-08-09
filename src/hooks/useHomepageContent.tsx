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
        console.log(`🔍 Fetching ${sectionKey} content...`);
        const { data, error } = await supabase
          .from('homepage_content')
          .select('content')
          .eq('section_key', sectionKey)
          .eq('is_active', true)
          .maybeSingle();

        if (error) {
          console.error(`❌ Error fetching ${sectionKey}:`, error);
          if (error.code === 'PGRST116') {
            console.log(`⚠️ No content found for ${sectionKey}, using fallback`);
            setContent({});
          } else {
            throw error;
          }
        } else if (data) {
          console.log(`✅ Content loaded for ${sectionKey}:`, data.content);
          setContent(data.content);
        } else {
          console.log(`⚠️ Null data for ${sectionKey}, using fallback`);
          setContent({});
        }
      } catch (err) {
        console.error(`❌ Error fetching ${sectionKey} content:`, err);
        setError(`Failed to load ${sectionKey} content`);
        setContent({}); // Fallback to empty object
      } finally {
        console.log(`✅ Loading complete for ${sectionKey}`);
        setLoading(false);
      }
    };

    // Set loading to false immediately if data doesn't come through
    const timeoutId = setTimeout(() => {
      console.warn(`⏰ Timeout for ${sectionKey}, using fallback`);
      setContent({});
      setLoading(false);
    }, 1000); // Reduce to 1 second

    fetchContent().finally(() => {
      clearTimeout(timeoutId);
    });

    return () => clearTimeout(timeoutId);
  }, [sectionKey]);

  return { content, loading, error };
};