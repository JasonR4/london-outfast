import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useHomepageContent } from "@/hooks/useHomepageContent";

const HowItWorks = () => {
  const { content, loading } = useHomepageContent('how_it_works');

  if (loading) {
    return <div className="py-20 px-4 text-center">Loading...</div>;
  }

  const steps = content?.steps || [];
  const addons = content?.addons || [];

  return (
    <section className="py-20 px-4 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 text-lg px-6 py-2">
            {content?.badge_text || "SIMPLE 4-STEP PROCESS"}
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            {content?.title || "How We Get Your Campaign Live"}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {content?.description || "From brief to live campaign in record time"}
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {steps.map((step: any, index: number) => (
            <Card key={index} className="bg-card border-border hover:shadow-card transition-all duration-300 text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary-foreground">{step.number}</span>
                </div>
                <CardTitle className="text-xl text-foreground">{step.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-8 text-foreground">
            {content?.addons_title || "Optional Add-Ons"}
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {addons.map((addon: string, index: number) => (
              <div key={index} className="bg-muted/30 p-4 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full flex-shrink-0"></div>
                  <span className="text-foreground">{addon}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;