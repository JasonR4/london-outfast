import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useHomepageContent } from "@/hooks/useHomepageContent";
import { useCentralizedMediaFormats } from "@/hooks/useCentralizedMediaFormats";

const FormatLinks = () => {
  const navigate = useNavigate();
  const { content, loading: contentLoading } = useHomepageContent('format_links');
  const { mediaFormats, loading: formatsLoading } = useCentralizedMediaFormats(false);

  if (contentLoading || formatsLoading) {
    console.log('🔄 FormatLinks: Loading states - content:', contentLoading, 'formats:', formatsLoading);
    return <div className="py-16 px-4 text-center">Loading formats...</div>;
  }

  console.log('✅ FormatLinks: Data loaded - formats:', mediaFormats.length);

  // Use formats from centralized service if content doesn't have them, otherwise use content formats
  const popularFormats = content?.formats?.length > 0 
    ? content.formats 
    : mediaFormats.slice(0, 6).map(format => ({ 
        slug: format.format_slug, 
        name: format.format_name 
      }));

  return (
    <section className="py-16 px-4 bg-muted/20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            {content?.badge_text || "POPULAR OOH FORMATS"}
          </Badge>
          <h2 className="text-3xl font-bold mb-4">
            {content?.title || "Quick Links to London OOH Advertising"}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {content?.description || "Explore our most popular Out-of-Home advertising formats across London"}
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {popularFormats.map((format: any) => (
            <Button
              key={format.slug}
              variant="outline"
              className="h-auto p-4 justify-start hover:bg-primary hover:text-primary-foreground transition-colors"
              onClick={() => navigate(`/outdoor-media/${format.slug}`)}
            >
              {format.name} Advertising in London
            </Button>
          ))}
        </div>
        
        <div className="text-center mt-8">
          <Button 
            onClick={() => navigate('/outdoor-media')}
            variant="default"
          >
            {content?.view_all_text || "View All Format Options"}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FormatLinks;