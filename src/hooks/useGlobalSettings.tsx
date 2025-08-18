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

  // Fallback data
  const fallbackNavigation = {
    logo: {
      text: 'Media Buying London',
      url: '/'
    },
    menu_items: [
      {
        label: 'About',
        type: 'dropdown',
        submenu: [
          { label: 'How We Work', url: '/how-we-work' },
          { label: 'About Us', url: '/about' },
          { label: 'Contact Us', url: '/contact' },
          { label: 'FAQs', url: '/faqs' }
        ]
      },
      {
        label: 'Formats',
        type: 'dropdown',
        submenu: [
          { label: 'London Underground', url: '/london-underground-advertising' },
          { label: 'Bus Advertising', url: '/bus-advertising' },
          { label: 'Digital OOH', url: '/digital-ooh' },
          { label: 'City Posters', url: '/city-posters' },
          { label: 'All Formats', url: '/formats' }
        ]
      },
      {
        label: 'Industries',
        url: '/industries'
      },
      {
        label: 'Blog',
        url: '/blog'
      }
    ]
  };

  const fallbackFooter = {
    company: {
      name: 'Media Buying London',
      description: 'Your trusted partner for outdoor advertising in London.',
      phone: '+44 204 524 3019',
      email: 'hello@mediabuyinglondon.co.uk',
      address: 'London, United Kingdom'
    },
    links: {
      services: [
        { label: 'London Underground Advertising', url: '/london-underground-advertising' },
        { label: 'Bus Advertising', url: '/bus-advertising' },
        { label: 'Digital OOH', url: '/digital-ooh' },
        { label: 'City Posters', url: '/city-posters' }
      ],
      company: [
        { label: 'About Us', url: '/about' },
        { label: 'How We Work', url: '/how-we-work' },
        { label: 'Contact', url: '/contact' },
        { label: 'Blog', url: '/blog' }
      ],
      legal: [
        { label: 'Privacy Policy', url: '/privacy-policy' },
        { label: 'Terms of Service', url: '/terms-of-service' },
        { label: 'Cookie Policy', url: '/cookie-policy' }
      ]
    },
    copyright: '© 2024 Media Buying London. All rights reserved.'
  };

  const fetchSettings = async () => {
    try {
      console.log('🔍 Fetching global settings...');
      
      const fetchPromise = supabase
        .from('global_settings')
        .select('*')
        .eq('is_active', true)
        .in('setting_key', ['main_navigation', 'main_footer']);

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Query timeout')), 2000)
      );

      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

      if (error) {
        console.error('❌ Error fetching global settings:', error);
        throw error;
      }

      console.log('📊 Global settings data:', data);

      let foundNavigation = false;
      let foundFooter = false;

      data?.forEach((setting: GlobalSetting) => {
        if (setting.setting_key === 'main_navigation') {
          console.log('✅ Setting navigation from CMS:', setting.setting_value);
          setNavigation(setting.setting_value);
          foundNavigation = true;
        } else if (setting.setting_key === 'main_footer') {
          console.log('✅ Setting footer from CMS:', setting.setting_value);
          setFooter(setting.setting_value);
          foundFooter = true;
        }
      });

      // Set fallbacks if not found in CMS
      if (!foundNavigation) {
        console.log('⚠️ No navigation found in CMS, using fallback');
        setNavigation(fallbackNavigation);
      }
      if (!foundFooter) {
        console.log('⚠️ No footer found in CMS, using fallback');
        setFooter(fallbackFooter);
      }

    } catch (error) {
      console.error('❌ Error fetching global settings, using fallbacks:', error);
      setNavigation(fallbackNavigation);
      setFooter(fallbackFooter);
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