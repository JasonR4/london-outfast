import { useEffect, useState } from 'react';
import Navigation from './Navigation';
import Footer from './Footer';
import { fetchSiteShellData, type SiteShellData } from '@/lib/siteShell';

interface SiteLayoutProps {
  children: React.ReactNode;
}

export const SiteLayout = ({ children }: SiteLayoutProps) => {
  const [shellData, setShellData] = useState<SiteShellData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadShellData = async () => {
      try {
        const data = await fetchSiteShellData();
        setShellData(data);
      } catch (error) {
        console.error('Failed to load site shell data:', error);
        // Fallback data is handled in fetchSiteShellData
        const data = await fetchSiteShellData();
        setShellData(data);
      } finally {
        setLoading(false);
      }
    };

    loadShellData();
  }, []);

  if (loading || !shellData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <Navigation items={shellData.navigation} />
      {children}
      <Footer data={shellData.footer} />
    </>
  );
};