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
  const [navigation, setNavigation] = useState<any>({
    logo: { text: 'Media Buying London', url: '/' },
    menu_items: [
      { label: 'Services', type: 'dropdown', submenu: [
        { label: 'London Underground Advertising', url: '/london-underground-advertising' },
        { label: 'Bus Advertising', url: '/bus-advertising' },
        { label: 'Taxi Advertising', url: '/taxi-advertising' },
        { label: 'Roadside Advertising', url: '/ooh/roadside-billboards' },
        { label: 'Rail Advertising London', url: '/rail-advertising-london' },
        { label: 'Digital OOH', url: '/digital-ooh' },
        { label: 'Street Furniture', url: '/street-furniture' },
        { label: 'Airport Advertising', url: '/airport-advertising' }
      ]},
      { label: 'About', type: 'dropdown', submenu: [
        { label: 'How We Work', url: '/how-we-work' },
        { label: 'About Us', url: '/about' },
        { label: 'Contact', url: '/contact' }
      ]},
      { label: 'Industries', url: '/industries' }
    ]
  });
  const [footer, setFooter] = useState<any>({
    company: { name: 'Media Buying London', email: 'hello@mediabuyinglondon.com' },
    links: {
      services: [
        { label: 'London Underground Advertising', url: '/london-underground-advertising' },
        { label: 'Bus Advertising', url: '/bus-advertising' },
        { label: 'Taxi Advertising', url: '/taxi-advertising' },
        { label: 'Roadside Advertising', url: '/ooh/roadside-billboards' }
      ],
      company: [
        { label: 'How We Work', url: '/how-we-work' },
        { label: 'About Us', url: '/about' }
      ],
      legal: [
        { label: 'Privacy Policy', url: '/privacy-policy' },
        { label: 'Terms of Service', url: '/terms-of-service' }
      ]
    },
    copyright: '© 2024 Media Buying London. All rights reserved.'
  });
  const [loading, setLoading] = useState(false);

  const fetchSettings = async () => {
    try {
      console.log('🔍 Fetching global settings...');
      const { data, error } = await supabase
        .from('global_settings')
        .select('*')
        .eq('is_active', true)
        .in('setting_key', ['main_navigation', 'main_footer']);

      if (error) {
        console.error('❌ Error fetching global settings:', error);
        return;
      }

      console.log('📊 Global settings data:', data);

      data?.forEach((setting: GlobalSetting) => {
        if (setting.setting_key === 'main_navigation') {
          console.log('✅ Setting navigation:', setting.setting_value);
          setNavigation(setting.setting_value);
        } else if (setting.setting_key === 'main_footer') {
          console.log('✅ Setting footer:', setting.setting_value);
          setFooter(setting.setting_value);
        }
      });
    } catch (error) {
      console.error('❌ Error fetching global settings:', error);
    } finally {
      console.log('✅ Global settings loading complete');
      setLoading(false);
    }
  };

  useEffect(() => {
    // Add timeout for global settings too
    const timeoutId = setTimeout(() => {
      console.warn('⏰ Global settings timeout, using fallbacks');
      setLoading(false);
    }, 1000);

    fetchSettings().finally(() => {
      clearTimeout(timeoutId);
    });

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