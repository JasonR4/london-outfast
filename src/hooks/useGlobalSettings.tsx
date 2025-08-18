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
        { label: 'London Underground', url: '/london-underground-advertising' },
        { label: 'Bus Advertising', url: '/bus-advertising' },
        { label: 'Roadside Advertising', url: '/roadside-advertising' },
        { label: 'Digital OOH', url: '/digital-ooh' },
        { label: 'Rail Advertising', url: '/rail-advertising-london' },
        { label: 'Taxi Advertising', url: '/taxi-advertising' }
      ]},
      { label: 'Industries', type: 'dropdown', submenu: [
        { label: 'Retail', url: '/industries/retail' },
        { label: 'Technology', url: '/industries/technology' },
        { label: 'Finance', url: '/industries/finance' },
        { label: 'Healthcare', url: '/industries/healthcare' }
      ]},
      { label: 'About', type: 'dropdown', submenu: [
        { label: 'How We Work', url: '/how-we-work' },
        { label: 'Contact', url: '/contact' },
        { label: 'FAQs', url: '/faqs' }
      ]}
    ]
  });
  const [footer, setFooter] = useState<any>({
    company: { name: 'Media Buying London', email: 'hello@mediabuyinglondon.com' },
    links: {
      services: [
        { label: 'London Underground', url: '/london-underground-advertising' },
        { label: 'Bus Advertising', url: '/bus-advertising' },
        { label: 'Roadside Advertising', url: '/roadside-advertising' },
        { label: 'Digital OOH', url: '/digital-ooh' }
      ],
      company: [
        { label: 'About', url: '/about' },
        { label: 'How We Work', url: '/how-we-work' },
        { label: 'Contact', url: '/contact' }
      ],
      legal: [
        { label: 'Privacy Policy', url: '/privacy' },
        { label: 'Terms of Service', url: '/terms' }
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