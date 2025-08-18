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

      if (error) {
        console.error('❌ Error fetching global settings:', error);
        // Set default navigation if database error
        setDefaultData();
        return;
      }

      console.log('📊 Global settings data:', data);

      let hasNavigation = false;
      let hasFooter = false;

      data?.forEach((setting: GlobalSetting) => {
        if (setting.setting_key === 'main_navigation') {
          console.log('✅ Setting navigation:', setting.setting_value);
          setNavigation(setting.setting_value);
          hasNavigation = true;
        } else if (setting.setting_key === 'main_footer') {
          console.log('✅ Setting footer:', setting.setting_value);
          setFooter(setting.setting_value);
          hasFooter = true;
        }
      });

      // If no data found, set defaults
      if (!hasNavigation || !hasFooter) {
        console.log('📄 No CMS data found, using defaults');
        setDefaultData(hasNavigation, hasFooter);
      }
    } catch (error) {
      console.error('❌ Error fetching global settings:', error);
      setDefaultData();
    } finally {
      console.log('✅ Global settings loading complete');
      setLoading(false);
    }
  };

  const setDefaultData = (hasNavigation = false, hasFooter = false) => {
    if (!hasNavigation) {
      setNavigation({
        logo: {
          text: "Media Buying London",
          url: "/"
        },
        phone: "+44 204 524 3019",
        cta: {
          text: "Brief Us Today",
          url: "/brief"
        },
        menu_items: [
          {
            label: "Get Quote",
            url: "/quote",
            type: "link"
          },
          {
            label: "Configurator", 
            url: "/configurator",
            type: "link"
          },
          {
            label: "Formats",
            type: "dropdown",
            submenu: [
              { label: "6-Sheet Posters", url: "/city-posters" },
              { label: "48-Sheet Billboards", url: "/roadside-advertising" },
              { label: "Digital OOH", url: "/digital-ooh" },
              { label: "Bus Advertising", url: "/bus-advertising" },
              { label: "Rail Advertising", url: "/rail-advertising-london" },
              { label: "Underground Advertising", url: "/london-underground-advertising" },
              { label: "Format Directory", url: "/formats" }
            ]
          },
          {
            label: "Industries",
            type: "dropdown", 
            submenu: [
              { label: "All Industries", url: "/industries" }
            ]
          },
          {
            label: "About",
            type: "dropdown",
            submenu: [
              { label: "How We Work", url: "/how-we-work" },
              { label: "About Us", url: "/about" },
              { label: "FAQs", url: "/faqs" }
            ]
          },
          {
            label: "Contact",
            url: "/contact", 
            type: "link"
          },
          {
            label: "Blog",
            url: "/blog",
            type: "link"
          }
        ]
      });
    }

    if (!hasFooter) {
      setFooter({
        company: {
          name: "Media Buying London",
          description: "London's premier out-of-home advertising specialists.",
          address: "4th Floor, 86-90 Paul Street, London EC2A 4NE",
          phone: "+44 204 524 3019",
          email: "hello@mediabuyinglondon.co.uk"
        },
        copyright: "© 2024 Media Buying London. All rights reserved.",
        services_links: [
          { label: "6-Sheet Posters", url: "/city-posters" },
          { label: "48-Sheet Billboards", url: "/roadside-advertising" },
          { label: "Digital OOH", url: "/digital-ooh" },
          { label: "Bus Advertising", url: "/bus-advertising" }
        ],
        company_links: [
          { label: "About Us", url: "/about" },
          { label: "How We Work", url: "/how-we-work" },
          { label: "Contact", url: "/contact" }
        ],
        legal_links: [
          { label: "Privacy Policy", url: "/privacy-policy" },
          { label: "Terms of Service", url: "/terms-of-service" }
        ],
        social_links: []
      });
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