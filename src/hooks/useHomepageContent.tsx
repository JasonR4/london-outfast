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
        console.log(`🔍 Fetching homepage content for: ${sectionKey}`);
        console.log(`🌐 Current domain: ${window.location.hostname}`);
        console.log(`📍 In iframe: ${window !== window.top}`);
        
        const { data, error } = await supabase
          .from('homepage_content')
          .select('content')
          .eq('section_key', sectionKey)
          .eq('is_active', true)
          .single();

        if (error) {
          console.log(`❌ Homepage content error for ${sectionKey}:`, error);
          if (error.code === 'PGRST116') {
            // No data found, use empty object
            console.log(`📭 No data found for ${sectionKey}, using fallback`);
            setContent({});
          } else {
            throw error;
          }
        } else {
          console.log(`✅ Homepage content loaded for ${sectionKey}:`, data.content);
          setContent(data.content);
        }
      } catch (err) {
        console.error(`❌ Error fetching ${sectionKey} content:`, err);
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