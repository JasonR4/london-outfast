import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PageSchemaData {
  seo?: {
    canonical?: string;
  };
  schema?: {
    faq_enabled?: boolean;
    faq_items?: Array<{ question: string; answer: string; }>;
    breadcrumb?: Array<{ name: string; url: string; }>;
  };
}

export const usePageSchema = (pageKey: string) => {
  const [pageData, setPageData] = useState<PageSchemaData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPageSchema = async () => {
      try {
        const { data, error } = await supabase
          .from('global_settings')
          .select('setting_value')
          .eq('setting_key', `page_${pageKey}_schema`)
          .eq('is_active', true)
          .single();

        if (data && !error) {
          setPageData(data.setting_value as PageSchemaData);
        }
      } catch (error) {
        console.error('Error fetching page schema:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPageSchema();
  }, [pageKey]);

  return { pageData, loading };
};