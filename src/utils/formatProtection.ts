/**
 * Format Protection Utilities
 * Ensures format data integrity and prevents loading failures
 */

import { MediaFormat } from '@/services/mediaFormatsService';

export const validateFormat = (format: any): format is MediaFormat => {
  return (
    format &&
    typeof format.id === 'string' &&
    typeof format.format_slug === 'string' &&
    typeof format.format_name === 'string' &&
    typeof format.is_active === 'boolean'
  );
};

export const sanitizeFormats = (formats: any[]): MediaFormat[] => {
  if (!Array.isArray(formats)) {
    console.warn('Invalid formats data received:', formats);
    return [];
  }
  
  return formats.filter(validateFormat);
};

export const createFallbackFormat = (slug: string): MediaFormat => ({
  id: `fallback-${slug}`,
  format_slug: slug,
  format_name: slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
  description: 'Format details temporarily unavailable',
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  categories: {
    location: [],
    format: []
  }
});

export const withFormatProtection = <T extends (...args: any[]) => any>(
  fn: T,
  fallbackValue: any = []
): T => {
  return ((...args: any[]) => {
    try {
      return fn(...args);
    } catch (error) {
      console.error('Format function error:', error);
      return fallbackValue;
    }
  }) as T;
};