import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
}

export interface BlogPostListItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  cover_image_url: string | null;
  published_at: string | null;
  meta_title: string | null;
  meta_description: string | null;
  categories: { id: string; name: string; slug: string }[];
  media_formats: { id: string; format_name: string; format_slug: string }[];
}

export interface BlogFilters {
  formatSlug?: string;
  categorySlug?: string;
}

export const useBlog = (filters: BlogFilters = {}, pageSize = 9) => {
  const [posts, setPosts] = useState<BlogPostListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<BlogCategory[]>([]);

  const from = useMemo(() => (page - 1) * pageSize, [page, pageSize]);
  const to = useMemo(() => from + pageSize - 1, [from, pageSize]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [filters.formatSlug, filters.categorySlug]);

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filters.formatSlug, filters.categorySlug]);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('blog_categories')
      .select('id,name,slug')
      .eq('is_active', true)
      .order('name', { ascending: true });
    if (!error) setCategories((data || []) as BlogCategory[]);
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('blog_posts')
        .select(
          `id, slug, title, excerpt, cover_image_url, published_at, meta_title, meta_description,
           blog_post_categories:blog_post_categories(category_id, blog_categories:blog_categories(name, slug, id)),
           blog_post_media_formats:blog_post_media_formats(media_format_id, media_formats:media_formats(id, format_name, format_slug))`,
          { count: 'exact' }
        )
        .eq('status', 'published')
        .order('published_at', { ascending: false, nullsFirst: false })
        .range(from, to);

      if (filters.categorySlug) {
        query = query.contains('blog_post_categories.blog_categories', [{ slug: filters.categorySlug }]);
      }

      if (filters.formatSlug) {
        query = query.contains('blog_post_media_formats.media_formats', [{ format_slug: filters.formatSlug }]);
      }

      const { data, error, count } = await query;
      if (error) throw error;

      const mapped: BlogPostListItem[] = (data || []).map((row: any) => ({
        id: row.id,
        slug: row.slug,
        title: row.title,
        excerpt: row.excerpt,
        cover_image_url: row.cover_image_url,
        published_at: row.published_at,
        meta_title: row.meta_title,
        meta_description: row.meta_description,
        categories: (row.blog_post_categories || [])
          .map((j: any) => j.blog_categories)
          .filter(Boolean),
        media_formats: (row.blog_post_media_formats || [])
          .map((j: any) => j.media_formats)
          .filter(Boolean)
      }));

      setPosts(mapped);
      setTotal(count || 0);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { posts, total, page, setPage, pageSize, loading, error, categories };
};

export const useBlogPost = (slug?: string) => {
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    const fetch = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data, error } = await supabase
          .from('blog_posts')
          .select(
            `*,
             blog_post_categories:blog_post_categories(category_id, blog_categories:blog_categories(name, slug, id)),
             blog_post_media_formats:blog_post_media_formats(media_format_id, media_formats:media_formats(id, format_name, format_slug)),
             blog_media_assets(*)`
          )
          .eq('slug', slug)
          .limit(1)
          .maybeSingle();
        if (error) throw error;
        setPost(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [slug]);

  return { post, loading, error };
};
