import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface GlobalSetting {
  id: string;
  setting_key: string;
  setting_value: any;
  setting_type: string;
  is_active: boolean;
}

export const useGlobalSettings = () => {
  const [navigation, setNavigation] = useState<any>(null);
  const [footer, setFooter] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      console.log('🔍 Fetching global settings...');
      
      // Query navigation settings
      const navQuery = supabase
        .from('global_settings')
        .select('*')
        .eq('is_active', true)
        .eq('setting_key', 'main_navigation')
        .single();

      // Query footer settings  
      const footerQuery = supabase
        .from('global_settings')
        .select('*')
        .eq('is_active', true)
        .eq('setting_key', 'main_footer')
        .single();

      console.log('🔍 Executing queries...');
      
      const [navResult, footerResult] = await Promise.all([navQuery, footerQuery]);

      console.log('🔍 Navigation result:', navResult);
      console.log('🔍 Footer result:', footerResult);

      if (navResult.data) {
        console.log('✅ Setting navigation:', navResult.data.setting_value);
        setNavigation(navResult.data.setting_value);
      } else {
        console.warn('⚠️ No navigation data found');
      }

      if (footerResult.data) {
        console.log('✅ Setting footer:', footerResult.data.setting_value);
        setFooter(footerResult.data.setting_value);
      } else {
        console.warn('⚠️ No footer data found');
      }

      setLoading(false);
      console.log('✅ Global settings loading complete');
    } catch (error) {
      console.error('❌ Error fetching global settings:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('global-settings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'global_settings'
        },
        () => {
          console.log('🔄 Global settings changed, refetching...');
          fetchSettings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { navigation, footer, loading, refetch: fetchSettings };
};

export default useGlobalSettings;