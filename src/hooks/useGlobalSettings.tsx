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
  // Fallback navigation data with How We Work under About
  const fallbackNavigation = {
    menu_items: [
      {
        label: "About",
        type: "dropdown",
        items: [
          { label: "About Us", href: "/about" },
          { label: "How We Work", href: "/how-we-work" }
        ]
      },
      {
        label: "Advertising Formats",
        type: "dropdown", 
        items: [
          { label: "Format Directory", href: "/formats" },
          { label: "Digital OOH", href: "/digital-ooh" },
          { label: "City Posters", href: "/city-posters" },
          { label: "Bus Advertising", href: "/bus-advertising" },
          { label: "London Underground", href: "/london-underground-advertising" },
          { label: "Rail Advertising", href: "/rail-advertising-london" },
          { label: "Airport Advertising", href: "/airport-advertising" },
          { label: "Roadside Advertising", href: "/roadside-advertising" },
          { label: "Street Furniture", href: "/street-furniture" },
          { label: "Taxi Advertising", href: "/taxi-advertising" },
          { label: "Shopping Mall", href: "/shopping-mall-advertising" },
          { label: "Stadium Advertising", href: "/stadium-advertising" },
          { label: "Supermarket Advertising", href: "/supermarket-advertising" },
          { label: "Lamp Post Banners", href: "/lamp-post-banner-advertising" },
          { label: "Bike Hire Dock", href: "/bike-hire-dock-advertising" },
          { label: "Projection Mapping", href: "/projection-mapping-advertising" },
          { label: "Experiential Sampling", href: "/experiential-sampling" }
        ]
      },
      {
        label: "Industries",
        type: "dropdown",
        items: [
          { label: "All Industries", href: "/industries" },
          { label: "Technology", href: "/industries/technology" },
          { label: "Fashion & Beauty", href: "/industries/fashion-beauty" },
          { label: "Food & Beverage", href: "/industries/food-beverage" },
          { label: "Entertainment", href: "/industries/entertainment" },
          { label: "Healthcare", href: "/industries/healthcare" },
          { label: "Finance", href: "/industries/finance" },
          { label: "Education", href: "/industries/education" },
          { label: "Automotive", href: "/industries/automotive" },
          { label: "Travel & Tourism", href: "/industries/travel-tourism" },
          { label: "Real Estate", href: "/industries/real-estate" }
        ]
      },
      { label: "Rates", href: "/rates" },
      { label: "Brief Us Today", href: "/quote" },
      { label: "Blog", href: "/blog" }
    ]
  };

  const fallbackFooter = {
    sections: [
      {
        title: "Services",
        links: [
          { label: "OOH Advertising", href: "/ooh-advertising-london" },
          { label: "Media Buying", href: "/what-is-media-buying" },
          { label: "Planning Tools", href: "/configurator" }
        ]
      },
      {
        title: "Formats",
        links: [
          { label: "Digital OOH", href: "/digital-ooh" },
          { label: "Bus Advertising", href: "/bus-advertising" },
          { label: "Underground", href: "/london-underground-advertising" }
        ]
      },
      {
        title: "Company",
        links: [
          { label: "About", href: "/about" },
          { label: "How We Work", href: "/how-we-work" },
          { label: "Contact", href: "/contact" }
        ]
      }
    ]
  };

  const [navigation, setNavigation] = useState<any>(fallbackNavigation);
  const [footer, setFooter] = useState<any>(fallbackFooter);
  const [loading, setLoading] = useState(true);
  const [cmsDataLoaded, setCmsDataLoaded] = useState(false);

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
        setCmsDataLoaded(false);
        return;
      }

      console.log('📊 Global settings data:', data);

      if (data && data.length > 0) {
        data.forEach((setting: GlobalSetting) => {
          if (setting.setting_key === 'main_navigation' && setting.setting_value) {
            console.log('✅ Setting navigation from CMS:', setting.setting_value);
            setNavigation(setting.setting_value);
            setCmsDataLoaded(true);
          } else if (setting.setting_key === 'main_footer' && setting.setting_value) {
            console.log('✅ Setting footer from CMS:', setting.setting_value);
            setFooter(setting.setting_value);
          }
        });
      } else {
        console.log('📝 No CMS data found, using fallbacks');
        setCmsDataLoaded(false);
      }
    } catch (error) {
      console.error('❌ Error fetching global settings:', error);
      setCmsDataLoaded(false);
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

  return { navigation, footer, loading, cmsDataLoaded, refetch: fetchSettings };
};

export default useGlobalSettings;