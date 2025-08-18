// Single source of truth for global nav/footer
// 1) Tries your production JSON endpoint (or Supabase/cms table if you use that)
// 2) Throws on error (no auto-fallback menus)

export type NavItem = { label: string; href: string; children?: NavItem[] };
export type FooterLink = { label: string; href: string };
export type SiteSettings = {
  header: { nav: NavItem[] };
  footer: { columns: { title: string; links: FooterLink[] }[]; bottom?: FooterLink[] };
  updatedAt: string;
};

// ---- Choose ONE of these implementations ----

// A) If you already expose global settings as JSON on prod:
const PROD_SETTINGS_URL =
  'https://mediabuyinglondon.co.uk/api/global-settings.json';

// B) OR if you store in Supabase (uncomment and configure):
// import { createClient } from '@supabase/supabase-js';
// const supabase = createClient(import.meta.env.VITE_SUPABASE_URL!, import.meta.env.VITE_SUPABASE_ANON_KEY!);

export async function fetchSiteSettings(): Promise<SiteSettings> {
  // A) Fetch from your prod JSON (recommended to keep preview in sync)
  const res = await fetch(PROD_SETTINGS_URL, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Settings fetch failed ${res.status}`);
  const json = (await res.json()) as SiteSettings;

  // Sanity checks (stop Lovable from rendering its own nav)
  if (!json?.header?.nav?.length) throw new Error('Missing header.nav');
  if (!json?.footer?.columns?.length) throw new Error('Missing footer.columns');

  return json;

  // B) Supabase example:
  // const { data, error } = await supabase.from('global_settings').select('*').single();
  // if (error) throw error;
  // return data as SiteSettings;
}
