import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { updateMetaTags } from '@/utils/seo';
import { useBlogPost } from '@/hooks/useBlog';

const BlogPost: React.FC = () => {
  const { slug } = useParams();
  const { post, loading } = useBlogPost(slug);

  useEffect(() => {
    if (!post) return;
    const title = post.meta_title || `${post.title} | Media Buying London`;
    const description = post.meta_description || post.excerpt || 'Read our latest insights on OOH advertising.';
    updateMetaTags(title, description, window.location.href);
  }, [post]);

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-16 text-center text-muted-foreground">Loading...</div>;
  if (!post) return <div className="max-w-3xl mx-auto px-4 py-16 text-center text-muted-foreground">Post not found.</div>;

  return (
    <main>
      <article>
        <header className="border-b border-border">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <nav className="text-sm text-muted-foreground mb-6">
              <Link to="/blog" className="hover:underline">Blog</Link>
              <span className="mx-2">/</span>
              <span className="text-foreground">{post.title}</span>
            </nav>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">{post.title}</h1>
            {post.published_at && (
              <p className="text-sm text-muted-foreground mb-6">
                Published {new Date(post.published_at).toLocaleDateString()}
              </p>
            )}
            {(post.blog_post_categories?.length > 0 || post.blog_post_media_formats?.length > 0) && (
              <div className="flex flex-wrap gap-2 mb-8">
                {(post.blog_post_categories || []).map((c: any) => (
                  <Badge key={c.category_id} variant="secondary">{c.blog_categories?.name}</Badge>
                ))}
                {(post.blog_post_media_formats || []).map((f: any) => (
                  <Badge key={f.media_format_id} variant="outline">{f.media_formats?.format_name}</Badge>
                ))}
              </div>
            )}
          </div>
          {post.cover_image_url && (
            <img
              src={post.cover_image_url}
              alt={post.meta_title || post.title}
              className="w-3/4 max-h-[500px] object-cover mx-auto"
              loading="lazy"
            />
          )}
        </header>

        <section className="max-w-4xl mx-auto px-4 py-12">
          <div className="prose prose-lg max-w-none blog-content">
            {post.content?.html ? (
              <div dangerouslySetInnerHTML={{ __html: post.content.html }} />
            ) : post.content?.text ? (
              <div dangerouslySetInnerHTML={{ __html: post.content.text }} />
            ) : post.body_html ? (
              <div dangerouslySetInnerHTML={{ __html: post.body_html }} />
            ) : (
              <p className="text-muted-foreground">No content available.</p>
            )}
          </div>
        </section>

        {post.blog_media_assets?.length > 0 && (
          <section className="max-w-5xl mx-auto px-4 pb-16">
            <h2 className="text-2xl font-semibold mb-6">Media Gallery</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {post.blog_media_assets
                .sort((a: any, b: any) => a.order_index - b.order_index)
                .map((m: any) => (
                  <Card key={m.id}>
                    <CardContent className="p-0">
                      {m.file_type === 'video' ? (
                        <video controls className="w-full h-full">
                          <source src={m.storage_path} />
                        </video>
                      ) : (
                        <img src={m.storage_path} alt={m.alt_text || post.title} loading="lazy" />
                      )}
                    </CardContent>
                  </Card>
                ))}
            </div>
          </section>
        )}
      </article>
    </main>
  );
};

export default BlogPost;
