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
  const [hasCmsData, setHasCmsData] = useState(false);

  const fetchSettings = async () => {
    try {
      console.log('🔍 Fetching global settings...');
      
      // Use a simpler query that's less likely to trigger RLS issues
      const { data, error } = await supabase
        .from('global_settings')
        .select('setting_key, setting_value')
        .eq('is_active', true)
        .in('setting_key', ['main_navigation', 'main_footer']);

      if (error) {
        console.error('❌ Error fetching global settings:', error);
        // Keep fallback data
        setHasCmsData(false);
        return;
      }

      console.log('📊 Global settings data:', data);

      let foundNav = false;
      let foundFooter = false;

      if (data && data.length > 0) {
        data.forEach((setting: Pick<GlobalSetting, 'setting_key' | 'setting_value'>) => {
          if (setting.setting_key === 'main_navigation' && setting.setting_value) {
            console.log('✅ Setting CMS navigation');
            setNavigation(setting.setting_value);
            foundNav = true;
          } else if (setting.setting_key === 'main_footer' && setting.setting_value) {
            console.log('✅ Setting CMS footer');
            setFooter(setting.setting_value);
            foundFooter = true;
          }
        });
      }

      setHasCmsData(foundNav || foundFooter);
      
      if (!foundNav) {
        console.log('⚠️ No CMS navigation found, using fallback');
      }
      if (!foundFooter) {
        console.log('⚠️ No CMS footer found, using fallback');
      }

    } catch (error) {
      console.error('❌ Error fetching global settings:', error);
      setHasCmsData(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    
    // Set a timeout to prevent hanging
    const timeoutId = setTimeout(() => {
      if (mounted) {
        console.warn('⏰ Global settings timeout, using fallbacks');
        setLoading(false);
      }
    }, 2000);

    fetchSettings().finally(() => {
      if (mounted) {
        clearTimeout(timeoutId);
      }
    });

    // Real-time subscription with better error handling
    const channel = supabase
      .channel('global-settings-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'global_settings',
          filter: 'setting_key=in.(main_navigation,main_footer)'
        },
        (payload) => {
          if (mounted) {
            console.log('🔄 Global settings changed:', payload);
            // Debounce refetch to avoid rapid updates
            setTimeout(() => {
              if (mounted && !loading) {
                fetchSettings();
              }
            }, 500);
          }
        }
      )
      .subscribe((status) => {
        console.log('🔌 Global settings subscription:', status);
      });

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      supabase.removeChannel(channel);
    };
  }, []);

  return { 
    navigation, 
    footer, 
    loading, 
    hasCmsData, 
    refetch: fetchSettings 
  };
};

export default useGlobalSettings;
