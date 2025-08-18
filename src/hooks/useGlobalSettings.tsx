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
      const { data, error } = await supabase
        .from('global_settings')
        .select('*')
        .eq('is_active', true)
        .in('setting_key', ['main_navigation', 'main_footer']);

      console.log('🔍 Raw Supabase response:', { data, error });

      if (error) {
        console.error('❌ Error fetching global settings:', error);
        setLoading(false);
        return;
      }

      console.log('📊 Global settings data:', data);

      if (data && data.length > 0) {
        data.forEach((setting: GlobalSetting) => {
          console.log('🔄 Processing setting:', setting.setting_key, setting.setting_value);
          if (setting.setting_key === 'main_navigation') {
            console.log('✅ Setting navigation:', setting.setting_value);
            setNavigation(setting.setting_value);
          } else if (setting.setting_key === 'main_footer') {
            console.log('✅ Setting footer:', setting.setting_value);
            setFooter(setting.setting_value);
          }
        });
      } else {
        console.warn('⚠️ No global settings data found');
      }
      
      setLoading(false);
      console.log('✅ Global settings loading complete');
    } catch (error) {
      console.error('❌ Error fetching global settings:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    // Add timeout for global settings too
    const timeoutId = setTimeout(() => {
      console.warn('⏰ Global settings timeout, using fallbacks');
      setLoading(false);
    }, 3000); // Increased timeout to 3 seconds

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
      clearTimeout(timeoutId);
      supabase.removeChannel(channel);
    };
  }, []);

  return { navigation, footer, loading, refetch: fetchSettings };
};

export default useGlobalSettings;