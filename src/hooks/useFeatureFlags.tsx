import { useState, useEffect } from 'react';
import { useGlobalSettings } from '@/hooks/useGlobalSettings';

interface FeatureFlags {
  gated_quotes: boolean;
  // Add other feature flags here as needed
}

export const useFeatureFlags = () => {
  const [flags, setFlags] = useState<FeatureFlags>({
    gated_quotes: true // Default to true in production
  });
  const [loading, setLoading] = useState(true);

  // You can extend this to fetch from global settings if needed
  // For now, we'll use static configuration
  useEffect(() => {
    // In the future, this could fetch from CMS/global settings
    // const { settings } = useGlobalSettings();
    
    // For now, set default flags
    setFlags({
      gated_quotes: false // TEMP OFF to restore planner immediately
    });
    
    setLoading(false);
  }, []);

  return { flags, loading };
};

export default useFeatureFlags;