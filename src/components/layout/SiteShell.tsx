import { useEffect, useState } from 'react';
import { fetchSiteSettings, SiteSettings } from '@/lib/siteSettings';
import Header from './header/Header';
import Footer from './footer/Footer';

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const s = await fetchSiteSettings();
        setSettings(s);
        (window as any).__MBL_NAV_HASH__ = hash(JSON.stringify(s.header.nav));
      } catch (e: any) {
        console.error('Global settings failed:', e);
        setError(e);
      }
    })();
  }, []);

  if (error) {
    // DO NOT RENDER ANY NAV/FOOTER FALLBACKS
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p style={{ opacity: 0.6 }}>Navigation is unavailable. Please refresh.</p>
      </div>
    );
  }
  if (!settings) {
    // Optional skeleton (still no fallback nav/footer)
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <>
      <Header nav={settings.header.nav} />
      <main>{children}</main>
      <Footer columns={settings.footer.columns} bottom={settings.footer.bottom} />
    </>
  );
}

function hash(input: string) {
  let h = 0, i = 0, len = input.length;
  while (i < len) h = (h << 5) - h + input.charCodeAt(i++) | 0;
  return h;
}