// Single source of truth for global nav/footer
// Uses your existing Supabase global_settings data

import { supabase } from '@/integrations/supabase/client';

export type NavItem = { label: string; href: string; children?: NavItem[] };
export type FooterLink = { label: string; href: string };
export type SiteSettings = {
  header: { nav: NavItem[] };
  footer: { columns: { title: string; links: FooterLink[] }[]; bottom?: FooterLink[] };
  updatedAt: string;
};

export async function fetchSiteSettings(): Promise<SiteSettings> {
  // Fetch from Supabase global_settings (your existing working system)
  const { data: settings, error } = await supabase
    .from('global_settings')
    .select('*')
    .in('setting_key', ['main_navigation', 'main_footer'])
    .eq('is_active', true);

  if (error) throw new Error(`Settings fetch failed: ${error.message}`);
  if (!settings || settings.length === 0) throw new Error('No settings found');

  const navSetting = settings.find(s => s.setting_key === 'main_navigation');
  const footerSetting = settings.find(s => s.setting_key === 'main_footer');

  if (!navSetting || !footerSetting) throw new Error('Missing nav or footer settings');

  // Transform your existing Supabase data to the expected format
  const navData = navSetting.setting_value as any;
  const nav: NavItem[] = navData.menu_items.map((item: any) => ({
    label: item.label,
    href: item.url,
    children: undefined // Add dropdown logic here if needed
  }));

  const footerData = footerSetting.setting_value as any;
  const columns = [
    {
      title: "Services",
      links: footerData.links.services.map((link: any) => ({ label: link.label, href: link.url }))
    },
    {
      title: "OOH Formats", 
      links: footerData.links.formats?.map((link: any) => ({ label: link.label, href: link.url })) || []
    },
    {
      title: "Company", 
      links: footerData.links.company.map((link: any) => ({ label: link.label, href: link.url }))
    },
    {
      title: "Legal",
      links: footerData.links.legal.map((link: any) => ({ label: link.label, href: link.url }))
    }
  ];

  const bottom = [
    { label: "Client Portal", href: "/client-portal" },
    { label: footerData.company.phone, href: `tel:${footerData.company.phone.replace(/\s/g, '')}` }
  ];

  return {
    header: { nav },
    footer: { columns, bottom },
    updatedAt: navSetting.updated_at || new Date().toISOString()
  };
}
