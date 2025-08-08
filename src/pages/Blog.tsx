import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination, PaginationContent, PaginationItem } from '@/components/ui/pagination';
import { useBlog } from '@/hooks/useBlog';
import { useCentralizedMediaFormats } from '@/hooks/useCentralizedMediaFormats';
import { updateMetaTags } from '@/utils/seo';

const Blog: React.FC = () => {
  const { mediaFormats } = useCentralizedMediaFormats(false);
  const [formatSlug, setFormatSlug] = useState<string | undefined>(undefined);
  const [categorySlug, setCategorySlug] = useState<string | undefined>(undefined);
  const { posts, total, page, setPage, pageSize, loading, categories } = useBlog({ formatSlug, categorySlug }, 9);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  useEffect(() => {
    updateMetaTags(
      'OOH Advertising Blog | Media Buying London',
      'Insights, tips, and case studies across all outdoor media formats in London.',
      window.location.origin + '/blog'
    );
  }, []);

  return (
    <main>
      <header className="bg-gradient-hero/10 border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <h1 className="text-3xl md:text-4xl font-bold">OOH Advertising Blog</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Expert insights, buying guides, and real-world results across billboards, transport media, street furniture and more.
          </p>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-muted-foreground">Filter by Format</label>
            <Select value={formatSlug || 'all-formats'} onValueChange={(v) => setFormatSlug(v === 'all-formats' ? undefined : v)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="All formats" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-formats">All formats</SelectItem>
                {mediaFormats.map((f) => (
                  <SelectItem key={f.id} value={f.format_slug}>{f.format_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Filter by Category</label>
            <Select value={categorySlug || 'all-categories'} onValueChange={(v) => setCategorySlug(v === 'all-categories' ? undefined : v)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-categories">All categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-12">
        {loading ? (
          <div className="py-20 text-center text-muted-foreground">Loading posts...</div>
        ) : posts.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">No posts found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Card key={post.id} className="overflow-hidden hover:shadow-md transition-shadow">
                {post.cover_image_url && (
                  <Link to={`/blog/${post.slug}`} className="block">
                    <img
                      src={post.cover_image_url}
                      alt={post.meta_title || post.title}
                      loading="lazy"
                      className="w-full h-48 object-cover"
                    />
                  </Link>
                )}
                <CardHeader>
                  <CardTitle className="text-xl">
                    <Link to={`/blog/${post.slug}`} className="hover:underline">
                      {post.title}
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {post.excerpt && (
                    <p className="text-sm text-muted-foreground line-clamp-3">{post.excerpt}</p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {post.categories?.slice(0, 3).map((c) => (
                      <Badge key={c.id} variant="secondary">{c.name}</Badge>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {post.media_formats?.slice(0, 3).map((f) => (
                      <Badge key={f.id} variant="outline">{f.format_name}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <Pagination>
              <PaginationContent>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <PaginationItem key={i}>
                    <button
                      className={`px-3 py-1 rounded border border-border ${page === i + 1 ? 'bg-primary/10' : ''}`}
                      onClick={() => setPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  </PaginationItem>
                ))}
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </section>
    </main>
  );
};

export default Blog;
