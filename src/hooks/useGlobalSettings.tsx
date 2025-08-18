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
    logo: {
      text: 'Media Buying London',
      url: '/'
    },
    menu_items: [
      { label: 'Get Quote', url: '/quote' },
      { label: 'Configurator', url: '/configurator' },
      {
        label: 'Formats',
        type: 'dropdown',
        submenu: [
          { label: 'Digital OOH', url: '/digital-ooh' },
          { label: 'Billboard Advertising', url: '/ooh/roadside-billboards' },
          { label: 'Bus Advertising', url: '/bus-advertising' },
          { label: 'Underground Advertising', url: '/london-underground-advertising' },
          { label: 'Rail Advertising', url: '/rail-advertising-london' },
          { label: 'Street Furniture', url: '/street-furniture' },
          { label: 'Taxi Advertising', url: '/taxi-advertising' },
          { label: 'Airport Advertising', url: '/airport-advertising' },
          { label: 'Shopping Mall Advertising', url: '/shopping-mall-advertising' },
          { label: 'Stadium Advertising', url: '/stadium-advertising' },
          { label: 'Supermarket Advertising', url: '/supermarket-advertising' },
          { label: 'Bike Hire Dock Advertising', url: '/bike-hire-dock-advertising' },
          { label: 'Lamp Post Banner Advertising', url: '/lamp-post-banner-advertising' },
          { label: 'City Posters', url: '/city-posters' },
          { label: 'Projection Mapping Advertising', url: '/projection-mapping-advertising' },
          { label: 'Experiential Sampling', url: '/experiential-sampling' }
        ]
      },
      {
        label: 'Industries',
        type: 'dropdown',
        submenu: [
          { label: 'All Industries', url: '/industries' }
        ]
      },
      {
        label: 'About',
        type: 'dropdown',
        submenu: [
          { label: 'How We Work', url: '/how-we-work' },
          { label: 'About Us', url: '/about' },
          { label: 'FAQs', url: '/faqs' }
        ]
      },
      { label: 'Contact', url: '/contact' }
    ]
  });
  const [footer, setFooter] = useState<any>(null);
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
        // Set fallback navigation
        setNavigation({
          logo: {
            text: 'Media Buying London',
            url: '/'
          },
          menu_items: [
            { label: 'Get Quote', url: '/quote' },
            { label: 'Configurator', url: '/configurator' },
            {
              label: 'Formats',
              type: 'dropdown',
              submenu: [
                { label: 'Digital OOH', url: '/digital-ooh' },
                { label: 'Billboard Advertising', url: '/roadside-advertising' },
                { label: 'Bus Advertising', url: '/bus-advertising' },
                { label: 'Underground Advertising', url: '/london-underground-advertising' },
                { label: 'Rail Advertising', url: '/rail-advertising-london' },
                { label: 'Street Furniture', url: '/street-furniture' },
                { label: 'Taxi Advertising', url: '/taxi-advertising' },
                { label: 'Airport Advertising', url: '/airport-advertising' },
                { label: 'Shopping Mall Advertising', url: '/shopping-mall-advertising' },
                { label: 'Stadium Advertising', url: '/stadium-advertising' },
                { label: 'Supermarket Advertising', url: '/supermarket-advertising' },
                { label: 'Bike Hire Dock Advertising', url: '/bike-hire-dock-advertising' },
                { label: 'Lamp Post Banner Advertising', url: '/lamp-post-banner-advertising' },
                { label: 'City Posters', url: '/city-posters' },
                { label: 'Projection Mapping Advertising', url: '/projection-mapping-advertising' },
                { label: 'Experiential Sampling', url: '/experiential-sampling' }
              ]
            },
            {
              label: 'Industries',
              type: 'dropdown',
              submenu: [
                { label: 'All Industries', url: '/industries' }
              ]
            },
            {
              label: 'About',
              type: 'dropdown',
              submenu: [
                { label: 'How We Work', url: '/how-we-work' },
                { label: 'About Us', url: '/about' },
                { label: 'FAQs', url: '/faqs' }
              ]
            },
            { label: 'Contact', url: '/contact' }
          ]
        });
        return;
      }

      console.log('📊 Global settings data:', data);

      let hasNavigation = false;
      data?.forEach((setting: GlobalSetting) => {
        if (setting.setting_key === 'main_navigation') {
          console.log('✅ Setting navigation:', setting.setting_value);
          setNavigation(setting.setting_value);
          hasNavigation = true;
        } else if (setting.setting_key === 'main_footer') {
          console.log('✅ Setting footer:', setting.setting_value);
          setFooter(setting.setting_value);
        }
      });

      // If no navigation found in database, set fallback
      if (!hasNavigation) {
        setNavigation({
          logo: {
            text: 'Media Buying London',
            url: '/'
          },
          menu_items: [
            { label: 'Get Quote', url: '/quote' },
            { label: 'Configurator', url: '/configurator' },
            {
              label: 'Formats',
              type: 'dropdown',
              submenu: [
                { label: 'Digital OOH', url: '/digital-ooh' },
                { label: 'Billboard Advertising', url: '/roadside-advertising' },
                { label: 'Bus Advertising', url: '/bus-advertising' },
                { label: 'Underground Advertising', url: '/london-underground-advertising' },
                { label: 'Rail Advertising', url: '/rail-advertising-london' },
                { label: 'Street Furniture', url: '/street-furniture' },
                { label: 'Taxi Advertising', url: '/taxi-advertising' },
                { label: 'Airport Advertising', url: '/airport-advertising' },
                { label: 'Shopping Mall Advertising', url: '/shopping-mall-advertising' },
                { label: 'Stadium Advertising', url: '/stadium-advertising' },
                { label: 'Supermarket Advertising', url: '/supermarket-advertising' },
                { label: 'Bike Hire Dock Advertising', url: '/bike-hire-dock-advertising' },
                { label: 'Lamp Post Banner Advertising', url: '/lamp-post-banner-advertising' },
                { label: 'City Posters', url: '/city-posters' },
                { label: 'Projection Mapping Advertising', url: '/projection-mapping-advertising' },
                { label: 'Experiential Sampling', url: '/experiential-sampling' }
              ]
            },
            {
              label: 'Industries',
              type: 'dropdown',
              submenu: [
                { label: 'All Industries', url: '/industries' }
              ]
            },
            {
              label: 'About',
              type: 'dropdown',
              submenu: [
                { label: 'How We Work', url: '/how-we-work' },
                { label: 'About Us', url: '/about' },
                { label: 'FAQs', url: '/faqs' }
              ]
            },
            { label: 'Contact', url: '/contact' }
          ]
        });
      }
    } catch (error) {
      console.error('❌ Error fetching global settings:', error);
      // Set fallback navigation on error
      setNavigation({
        logo: {
          text: 'Media Buying London',
          url: '/'
        },
        menu_items: [
          { label: 'Get Quote', url: '/quote' },
          { label: 'Configurator', url: '/configurator' },
          {
            label: 'Formats',
            type: 'dropdown',
            submenu: [
              { label: 'Digital OOH', url: '/digital-ooh' },
              { label: 'Billboard Advertising', url: '/roadside-advertising' },
              { label: 'Bus Advertising', url: '/bus-advertising' },
              { label: 'Underground Advertising', url: '/london-underground-advertising' },
              { label: 'Rail Advertising', url: '/rail-advertising-london' },
              { label: 'Street Furniture', url: '/street-furniture' },
              { label: 'Taxi Advertising', url: '/taxi-advertising' },
              { label: 'Airport Advertising', url: '/airport-advertising' },
              { label: 'Shopping Mall Advertising', url: '/shopping-mall-advertising' },
              { label: 'Stadium Advertising', url: '/stadium-advertising' },
              { label: 'Supermarket Advertising', url: '/supermarket-advertising' },
              { label: 'Bike Hire Dock Advertising', url: '/bike-hire-dock-advertising' },
              { label: 'Lamp Post Banner Advertising', url: '/lamp-post-banner-advertising' },
              { label: 'City Posters', url: '/city-posters' },
              { label: 'Projection Mapping Advertising', url: '/projection-mapping-advertising' },
              { label: 'Experiential Sampling', url: '/experiential-sampling' }
            ]
          },
          {
            label: 'Industries',
            type: 'dropdown',
            submenu: [
              { label: 'All Industries', url: '/industries' }
            ]
          },
          {
            label: 'About',
            type: 'dropdown',
            submenu: [
              { label: 'How We Work', url: '/how-we-work' },
              { label: 'About Us', url: '/about' },
              { label: 'FAQs', url: '/faqs' }
            ]
          },
          { label: 'Contact', url: '/contact' }
        ]
      });
    } finally {
      console.log('✅ Global settings loading complete');
      setLoading(false);
    }
  };

  useEffect(() => {
    // Set fallback navigation immediately
    setNavigation({
      logo: {
        text: 'Media Buying London',
        url: '/'
      },
      menu_items: [
        { label: 'Get Quote', url: '/quote' },
        { label: 'Configurator', url: '/configurator' },
        {
          label: 'Formats',
          type: 'dropdown',
          submenu: [
            { label: 'Digital OOH', url: '/digital-ooh' },
            { label: 'Billboard Advertising', url: '/roadside-advertising' },
            { label: 'Bus Advertising', url: '/bus-advertising' },
            { label: 'Underground Advertising', url: '/london-underground-advertising' },
            { label: 'Rail Advertising', url: '/rail-advertising-london' },
            { label: 'Street Furniture', url: '/street-furniture' },
            { label: 'Taxi Advertising', url: '/taxi-advertising' },
            { label: 'Airport Advertising', url: '/airport-advertising' },
            { label: 'Shopping Mall Advertising', url: '/shopping-mall-advertising' },
            { label: 'Stadium Advertising', url: '/stadium-advertising' },
            { label: 'Supermarket Advertising', url: '/supermarket-advertising' },
            { label: 'Bike Hire Dock Advertising', url: '/bike-hire-dock-advertising' },
            { label: 'Lamp Post Banner Advertising', url: '/lamp-post-banner-advertising' },
            { label: 'City Posters', url: '/city-posters' },
            { label: 'Projection Mapping Advertising', url: '/projection-mapping-advertising' },
            { label: 'Experiential Sampling', url: '/experiential-sampling' }
          ]
        },
        {
          label: 'Industries',
          type: 'dropdown',
          submenu: [
            { label: 'All Industries', url: '/industries' }
          ]
        },
        {
          label: 'About',
          type: 'dropdown',
          submenu: [
            { label: 'How We Work', url: '/how-we-work' },
            { label: 'About Us', url: '/about' },
            { label: 'FAQs', url: '/faqs' }
          ]
        },
        { label: 'Contact', url: '/contact' }
      ]
    });

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