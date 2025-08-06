import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useHomepageContent } from "@/hooks/useHomepageContent";

const WhyChooseUs = () => {
  const { content, loading } = useHomepageContent('why_choose_us');

  if (loading) {
    return <div className="py-20 px-4 text-center">Loading...</div>;
  }

  const features = content?.features || [];
  const clients = content?.clients || [];

  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        {/* Why Choose Us */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 text-lg px-6 py-2">
            {content?.badge_text || "THE ALTERNATIVE TO SLOW-MOVING RETAINERS"}
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            {content?.title || "We're Media Buyers. That's the Point."}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12">
            {content?.description || "No meetings about meetings. No fluff. No retainers. We don't build brands — we get them seen. You bring the brief, we bring the space."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature: any, index: number) => (
            <Card key={index} className="bg-card border-border hover:shadow-card transition-all duration-300 group">
              <CardHeader className="text-center">
                <CardTitle className="text-xl text-foreground mb-4">{feature.title}</CardTitle>
                <Badge variant="outline" className="text-accent border-accent mx-auto">
                  {feature.highlight}
                </Badge>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Who Uses Us */}
        <div className="text-center">
          <Badge variant="secondary" className="mb-4 text-lg px-6 py-2">
            {content?.clients_badge || "WHO USES US?"}
          </Badge>
          <h3 className="text-3xl md:text-4xl font-bold mb-8">
            {content?.clients_title || "From Startups to Enterprise"}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {clients.map((client: string, index: number) => (
              <div key={index} className="bg-gradient-card p-6 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-london-blue rounded-full flex-shrink-0"></div>
                  <span className="text-foreground font-medium">{client}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;