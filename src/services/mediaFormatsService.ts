import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface MediaFormat {
  id: string;
  format_slug: string;
  format_name: string;
  description?: string;
  dimensions?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  categories?: {
    location: string[];
    format: string[];
  };
}

export interface MediaFormatCategory {
  id: string;
  media_format_id: string;
  category_type: 'location' | 'format';
  category_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

class MediaFormatsService {
  private static instance: MediaFormatsService;
  private subscribers: Map<string, (formats: MediaFormat[]) => void> = new Map();
  private realtimeChannel: RealtimeChannel | null = null;
  private cachedFormats: MediaFormat[] = [];

  private constructor() {
    this.setupRealtimeSubscription();
  }

  static getInstance(): MediaFormatsService {
    if (!MediaFormatsService.instance) {
      MediaFormatsService.instance = new MediaFormatsService();
    }
    return MediaFormatsService.instance;
  }

  private setupRealtimeSubscription() {
    this.realtimeChannel = supabase
      .channel('media_formats_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'media_formats'
        },
        () => {
          this.refreshFormats();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'media_format_categories'
        },
        () => {
          this.refreshFormats();
        }
      )
      .subscribe();
  }

  private async refreshFormats() {
    try {
      const formats = await this.fetchFormats();
      this.cachedFormats = formats;
      this.notifySubscribers();
    } catch (error) {
      console.error('Error refreshing formats:', error);
    }
  }

  private notifySubscribers() {
    this.subscribers.forEach(callback => {
      callback(this.cachedFormats);
    });
  }

  subscribe(key: string, callback: (formats: MediaFormat[]) => void) {
    this.subscribers.set(key, callback);
    
    // If we have cached data, immediately call the callback
    if (this.cachedFormats.length > 0) {
      callback(this.cachedFormats);
    }
  }

  unsubscribe(key: string) {
    this.subscribers.delete(key);
  }

  async fetchFormats(includeInactive = false): Promise<MediaFormat[]> {
    try {
      console.log('🔍 MediaFormatsService: Starting fetchFormats, includeInactive:', includeInactive);
      
      // Build the query
      let query = supabase
        .from('media_formats')
        .select('*');

      if (!includeInactive) {
        query = query.eq('is_active', true);
      }

      const { data: formatsData, error: formatsError } = await query.order('format_name');
      
      console.log('📊 MediaFormatsService: Formats fetched:', formatsData?.length || 0, 'formats');
      
      if (formatsError) {
        console.error('❌ MediaFormatsService: Error fetching formats:', formatsError);
        throw formatsError;
      }

      // Fetch categories for each format - handle empty table gracefully
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('media_format_categories')
        .select('*')
        .eq('is_active', true);

      if (categoriesError) {
        console.warn('Could not fetch categories:', categoriesError);
        // Continue with empty categories instead of failing
      }

      // Combine formats with their categories
      const formatsWithCategories: MediaFormat[] = (formatsData || []).map(format => {
        const formatCategories = categoriesData?.filter(cat => cat.media_format_id === format.id) || [];
        
        const locationCategories = formatCategories
          .filter(cat => cat.category_type === 'location')
          .map(cat => cat.category_name);
        
        const formatTypeCategories = formatCategories
          .filter(cat => cat.category_type === 'format')
          .map(cat => cat.category_name);

        return {
          ...format,
          categories: {
            location: locationCategories,
            format: formatTypeCategories
          }
        };
      });

      console.log('✅ MediaFormatsService: Returning', formatsWithCategories.length, 'formats with categories');
      return formatsWithCategories;
    } catch (error) {
      console.error('❌ MediaFormatsService: Error in fetchFormats:', error);
      throw error;
    }
  }

  async updateFormat(formatId: string, updates: Partial<MediaFormat>): Promise<void> {
    try {
      const { categories, ...formatUpdates } = updates;
      
      // Update the format itself
      if (Object.keys(formatUpdates).length > 0) {
        const { error } = await supabase
          .from('media_formats')
          .update({
            ...formatUpdates,
            updated_at: new Date().toISOString()
          })
          .eq('id', formatId);

        if (error) throw error;
      }

      // Update categories if provided
      if (categories) {
        await this.updateFormatCategories(formatId, categories);
      }
    } catch (error) {
      console.error('Error updating format:', error);
      throw error;
    }
  }

  async updateFormatCategories(formatId: string, categories: { location: string[]; format: string[] }): Promise<void> {
    try {
      // Delete existing categories for this format
      await supabase
        .from('media_format_categories')
        .delete()
        .eq('media_format_id', formatId);

      // Insert new categories
      const categoriesToInsert: Omit<MediaFormatCategory, 'id' | 'created_at' | 'updated_at'>[] = [
        ...categories.location.map(cat => ({
          media_format_id: formatId,
          category_type: 'location' as const,
          category_name: cat,
          is_active: true,
          created_by: null,
          updated_by: null
        })),
        ...categories.format.map(cat => ({
          media_format_id: formatId,
          category_type: 'format' as const,
          category_name: cat,
          is_active: true,
          created_by: null,
          updated_by: null
        }))
      ];

      if (categoriesToInsert.length > 0) {
        const { error } = await supabase
          .from('media_format_categories')
          .insert(categoriesToInsert);

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error updating format categories:', error);
      throw error;
    }
  }

  async createFormat(format: Omit<MediaFormat, 'id' | 'created_at' | 'updated_at'>): Promise<MediaFormat> {
    try {
      const { categories, ...formatData } = format;
      
      const { data, error } = await supabase
        .from('media_formats')
        .insert([formatData])
        .select()
        .single();

      if (error) throw error;

      // Add categories if provided
      if (categories) {
        await this.updateFormatCategories(data.id, categories);
      }

      return {
        ...data,
        categories: categories || { location: [], format: [] }
      };
    } catch (error) {
      console.error('Error creating format:', error);
      throw error;
    }
  }

  async deleteFormat(formatId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('media_formats')
        .update({ is_active: false })
        .eq('id', formatId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting format:', error);
      throw error;
    }
  }

  async getFormatBySlugAsync(slug: string): Promise<MediaFormat | undefined> {
    // First check cache
    let format = this.cachedFormats.find(format => format.format_slug === slug);
    
    // If not in cache, fetch fresh data
    if (!format) {
      try {
        const formats = await this.fetchFormats(false);
        this.cachedFormats = formats;
        format = formats.find(format => format.format_slug === slug);
      } catch (error) {
        console.error('Error fetching format by slug:', error);
      }
    }
    
    return format;
  }

  getFormatBySlug(slug: string): MediaFormat | undefined {
    return this.cachedFormats.find(format => format.format_slug === slug);
  }

  getFormatsBySearch(searchQuery: string): MediaFormat[] {
    return this.cachedFormats.filter(format =>
      format.format_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (format.description && format.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }

  destroy() {
    if (this.realtimeChannel) {
      supabase.removeChannel(this.realtimeChannel);
    }
    this.subscribers.clear();
    this.cachedFormats = [];
  }
}

export default MediaFormatsService;