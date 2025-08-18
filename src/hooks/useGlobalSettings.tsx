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

  // Hardcoded fallback data to ensure nav and footer show up
  const fallbackNavigation = {
    logo: {
      text: 'Media Buying London',
      url: '/'
    },
    menu_items: [
      { label: 'Formats', url: '/outdoor-media' },
      { 
        label: 'About', 
        url: '/about', 
        type: 'dropdown',
        submenu: [
          { label: 'About Us', url: '/about' },
          { label: 'How We Work', url: '/how-we-work' },
          { label: 'FAQs', url: '/faqs' }
        ]
      },
      { 
        label: 'Industries', 
        url: '/industries',
        type: 'dropdown', 
        submenu: [
          { label: 'All Industries', url: '/industries' },
          { label: 'Automotive', url: '/industries/automotive' },
          { label: 'Fashion', url: '/industries/fashion' },
          { label: 'Tech', url: '/industries/tech' },
          { label: 'Finance', url: '/industries/finance' }
        ]
      },
      { 
        label: 'Contact', 
        url: '/contact',
        type: 'dropdown',
        submenu: [
          { label: 'Contact Us', url: '/contact' },
          { label: 'Brief Us Today', url: '/brief' },
          { label: 'Phone: +44 204 524 3019', url: 'tel:+442045243019' }
        ]
      },
      { 
        label: 'Blog', 
        url: '/blog',
        type: 'dropdown',
        submenu: [
          { label: 'All Posts', url: '/blog' },
          { label: 'Latest News', url: '/blog?category=news' },
          { label: 'Case Studies', url: '/blog?category=case-studies' }
        ]
      }
    ]
  };

  const fallbackFooter = {
    company: {
      name: 'Media Buying London',
      email: 'hello@mediabuyinglondon.co.uk',
      phone: '+44 204 524 3019'
    },
    links: {
      services: [
        { label: 'OOH Quote', url: '/quote' },
        { label: 'Campaign Configurator', url: '/configurator' },
        { label: 'Format Directory', url: '/outdoor-media' },
        { label: 'Industries', url: '/industries' }
      ],
      company: [
        { label: 'About Us', url: '/about' },
        { label: 'Contact', url: '/contact' },
        { label: 'Blog', url: '/blog' },
        { label: 'FAQs', url: '/faqs' }
      ],
      legal: [
        { label: 'Privacy Policy', url: '/privacy-policy' },
        { label: 'Terms of Service', url: '/terms-of-service' },
        { label: 'Cookie Policy', url: '/cookie-policy' },
        { label: 'Disclaimer', url: '/disclaimer' }
      ]
    },
    copyright: '© 2024 Media Buying London. All rights reserved.'
  };

  const fetchSettings = async () => {
    try {
      console.log('🔍 Fetching global settings...');
      
      // Query navigation settings
      const navQuery = supabase
        .from('global_settings')
        .select('*')
        .eq('is_active', true)
        .eq('setting_key', 'main_navigation')
        .maybeSingle();

      // Query footer settings  
      const footerQuery = supabase
        .from('global_settings')
        .select('*')
        .eq('is_active', true)
        .eq('setting_key', 'main_footer')
        .maybeSingle();

      console.log('🔍 Executing queries...');
      
      // Add a timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Query timeout')), 2000)
      );

      const [navResult, footerResult] = await Promise.allSettled([
        Promise.race([navQuery, timeoutPromise]),
        Promise.race([footerQuery, timeoutPromise])
      ]);

      console.log('🔍 Navigation result:', navResult);
      console.log('🔍 Footer result:', footerResult);

      if (navResult.status === 'fulfilled' && (navResult.value as any)?.data) {
        console.log('✅ Setting navigation from DB:', (navResult.value as any).data.setting_value);
        setNavigation((navResult.value as any).data.setting_value);
      } else {
        console.warn('⚠️ Using fallback navigation data');
        setNavigation(fallbackNavigation);
      }

      if (footerResult.status === 'fulfilled' && (footerResult.value as any)?.data) {
        console.log('✅ Setting footer from DB:', (footerResult.value as any).data.setting_value);
        setFooter((footerResult.value as any).data.setting_value);
      } else {
        console.warn('⚠️ Using fallback footer data');
        setFooter(fallbackFooter);
      }

      setLoading(false);
      console.log('✅ Global settings loading complete');
    } catch (error) {
      console.error('❌ Error fetching global settings, using fallbacks:', error);
      setNavigation(fallbackNavigation);
      setFooter(fallbackFooter);
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