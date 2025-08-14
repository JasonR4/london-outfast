import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useMediaFormats } from "@/hooks/useMediaFormats";
import { useBlog } from "@/hooks/useBlog";
import { updateMetaTags } from "@/utils/seo";

const HtmlSitemap = () => {
  const { mediaFormats, loading: formatsLoading } = useMediaFormats();
  // Fetch up to 500 posts for sitemap purposes
  const { posts, total, loading: blogLoading } = useBlog({}, 500);

  const staticRoutes = useMemo(() => [
    { path: "/", label: "Home" },
    { path: "/quote", label: "Get a Quote" },
    { path: "/brief", label: "Submit Brief" },
    { path: "/quote-plan", label: "Your Plan" },
    { path: "/configurator", label: "OOH Configurator" },
    { path: "/outdoor-media", label: "Formats Directory" },
    { path: "/industries", label: "Industries" },
    { path: "/how-we-work", label: "How We Work" },
    { path: "/about", label: "About" },
    { path: "/faqs", label: "FAQs" },
    { path: "/contact", label: "Contact" },
    { path: "/blog", label: "Blog" },
    { path: "/privacy-policy", label: "Privacy Policy" },
    { path: "/terms-of-service", label: "Terms of Service" },
    { path: "/cookie-policy", label: "Cookie Policy" },
    { path: "/disclaimer", label: "Disclaimer" },
  ], []);

  useEffect(() => {
    updateMetaTags(
      "HTML Sitemap | Media Buying London",
      "Browse all key pages, format pages, and blog posts on Media Buying London.",
      window.location.href
    );
  }, []);

  const totalLinks = staticRoutes.length + (mediaFormats?.length || 0) + (posts?.length || 0);

  return (
    <main className="min-h-screen bg-background px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">HTML Sitemap</h1>
        <p className="text-muted-foreground mb-8">Index of crawlable links for search engines and users.</p>
        <div className="text-sm text-muted-foreground mb-10">Total links: {totalLinks}</div>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Main Pages</h2>
          <ul className="list-disc pl-6 space-y-2">
            {staticRoutes.map(r => (
              <li key={r.path}><Link to={r.path} className="text-primary hover:underline">{r.label}</Link></li>
            ))}
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">OOH Formats</h2>
          {formatsLoading ? (
            <div>Loading formats…</div>
          ) : (
            <ul className="columns-1 sm:columns-2 lg:columns-3 [column-fill:_balance] gap-6">
              {mediaFormats.map((f) => (
                <li key={f.id} className="break-inside-avoid mb-2">
                  <Link to={`/outdoor-media/${f.format_slug}`} className="text-primary hover:underline">
                    {f.format_name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Blog Posts</h2>
          {blogLoading ? (
            <div>Loading posts…</div>
          ) : (
            <ul className="space-y-2">
              {posts.map((p) => (
                <li key={p.id}>
                  <Link to={`/blog/${p.slug}`} className="text-primary hover:underline">
                    {p.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <div className="text-xs text-muted-foreground mt-4">Showing {posts.length} of {total} posts.</div>
        </section>
      </div>
    </main>
  );
};

export default HtmlSitemap;
