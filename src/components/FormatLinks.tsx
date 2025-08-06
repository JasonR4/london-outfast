import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useHomepageContent } from "@/hooks/useHomepageContent";

const FormatLinks = () => {
  const navigate = useNavigate();
  const { content, loading } = useHomepageContent('format_links');

  if (loading) {
    return <div className="py-16 px-4 text-center">Loading formats...</div>;
  }

  const popularFormats = content?.formats || [];

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