import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useHomepageContent } from "@/hooks/useHomepageContent";
import { trackAccountCtaClicked } from "@/utils/analytics";

const CTA = () => {
  const navigate = useNavigate();
  const { content, loading } = useHomepageContent('cta');

  if (loading) {
    return <div className="py-20 px-4 text-center">Loading...</div>;
  }

  return (
    <section className="py-20 px-4 bg-gradient-cta">
      <div className="max-w-4xl mx-auto text-center">
        <Badge variant="secondary" className="mb-6 text-lg px-6 py-2">
          {content?.badge_text || "READY TO GET STARTED?"}
        </Badge>
        
        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
          {content?.title || "Get Your London OOH Quote Today"}
        </h2>
        
        <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
          {content?.description || "Join hundreds of brands who trust us with their Out-of-Home media buying in London"}
        </p>
        
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="text-lg px-8 py-6 shadow-glow"
              onClick={() => {
                trackAccountCtaClicked({ location: "London" });
                navigate('/brief');
              }}
            >
              I Know What I Want
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-lg px-8 py-6"
              onClick={() => navigate('/brief')}
            >
              I Need Guidance
            </Button>
            <Button 
              variant="ghost" 
              size="lg" 
              className="text-lg px-8 py-6 text-accent hover:text-accent-foreground"
              onClick={() => navigate('/outdoor-media')}
            >
              I'm Just Exploring
            </Button>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Choose your path: Direct quote • Smart recommendations • Browse options
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;