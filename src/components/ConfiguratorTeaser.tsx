import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Brain, Target, Clock, Zap } from "lucide-react";
import { useHomepageContent } from "@/hooks/useHomepageContent";

const ConfiguratorTeaser = () => {
  const navigate = useNavigate();
  const { content, loading } = useHomepageContent('configurator_teaser');

  if (loading) {
    return <div className="py-20 px-4 text-center">Loading...</div>;
  }

  const features = [
    { icon: Brain, text: "AI-powered recommendations" },
    { icon: Target, text: "Audience-matched formats" },
    { icon: Clock, text: "5-minute questionnaire" },
    { icon: Zap, text: "Instant results" }
  ];

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4 text-lg px-6 py-2">
            {content?.badge_text || "UNSURE WHICH FORMAT?"}
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            {content?.title || "Let Our Smart Tool Choose For You"}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {content?.description || "Answer 5 quick questions and get personalized OOH recommendations based on your goals, budget, and target audience"}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="space-y-6">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <feature.icon className="w-6 h-6 text-primary" />
                      </div>
                      <span className="text-lg text-foreground">{feature.text}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center md:text-left">
            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-4">Perfect for:</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• First-time OOH advertisers</li>
                <li>• Multiple format considerations</li>
                <li>• Budget optimization</li>
                <li>• Strategic media planning</li>
              </ul>
            </div>
            
            <Button 
              size="lg" 
              className="text-lg px-8 py-6 shadow-glow"
              onClick={() => navigate('/configurator')}
            >
              {content?.button_text || "Find My Perfect Format"}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ConfiguratorTeaser;