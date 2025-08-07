// DEPRECATED: Use useCentralizedMediaFormats instead
// This hook is maintained for backward compatibility
import { useCentralizedMediaFormats } from './useCentralizedMediaFormats';

export interface MediaFormat {
  id: string;
  format_slug: string;
  format_name: string;
  description?: string;
  dimensions?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useMediaFormats = () => {
  const {
    mediaFormats,
    loading,
    error,
    refetch,
    getFormatBySlugSync,
    getFormatsBySearch
  } = useCentralizedMediaFormats(false); // Only active formats for public use

  // Transform the data to match the old interface (remove categories)
  const transformedFormats = mediaFormats.map(({ categories, ...format }) => format);

  return {
    mediaFormats: transformedFormats,
    loading,
    error,
    refetch,
    getFormatBySlug: (slug: string) => {
      const format = getFormatBySlugSync(slug);
      if (!format) return undefined;
      const { categories, ...transformed } = format;
      return transformed as MediaFormat;
    },
    getFormatsBySearch: (searchQuery: string) => {
      const formats = getFormatsBySearch(searchQuery);
      return formats.map(({ categories, ...format }) => format);
    }
  };
};