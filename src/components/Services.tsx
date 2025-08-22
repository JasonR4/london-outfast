import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useHomepageContent } from "@/hooks/useHomepageContent";

const Services = () => {
  const navigate = useNavigate();
  const { content, loading } = useHomepageContent('services');

  if (loading) {
    return <div className="py-20 px-4 text-center">Loading services...</div>;
  }

  const services = content?.services || [];

  return (
    <section className="py-20 px-4 bg-muted/20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 text-lg px-6 py-2">
            {content?.badge_text || "OOH ADVERTISING FORMATS"}
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            {content?.title || "Out-of-Home Media That Gets Noticed"}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12">
            {content?.description || "From tube panels to digital billboards — we cover every format across London"}
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {services.map((service: any, index: number) => (
            <Card key={index} className="bg-card border-border hover:shadow-card transition-all duration-300 group">
              <CardHeader>
                <CardTitle className="text-xl text-foreground">{service.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{service.description}</p>
                <ul className="space-y-2 mb-6">
                  {service.formats?.map((format: string, formatIndex: number) => (
                    <li key={formatIndex} className="text-sm text-muted-foreground flex items-center">
                      <div className="w-2 h-2 bg-london-blue rounded-full mr-3 flex-shrink-0"></div>
                      {format}
                    </li>
                  ))}
                </ul>
                <div className="flex flex-col gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => navigate('/outdoor-media')}
                  >
                    Learn More
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mb-8">
          <p className="text-muted-foreground mb-4">
            Not sure which category fits your needs?
          </p>
          <Button 
            variant="ghost"
            onClick={() => navigate('/configurator')}
            className="text-accent hover:text-accent-foreground"
          >
            Try Our Format Finder →
          </Button>
        </div>
        
        <div className="text-center space-y-4">
          {/* Weekly Deals CTA */}
          <Card className="max-w-md mx-auto bg-gradient-to-r from-accent/10 to-primary/10 border-accent/20">
            <CardContent className="p-6 text-center">
              <Badge variant="secondary" className="mb-2">
                NEW · REFRESHES WEEKLY
              </Badge>
              <h3 className="text-xl font-bold mb-2">London OOH Deals of the Week</h3>
              <p className="text-sm text-muted-foreground mb-4">
                4 hand-picked packages across London. Rates end Friday 4pm.
              </p>
              <Button 
                onClick={() => navigate('/london-ooh-deals')}
                className="w-full"
              >
                View this week's deals →
              </Button>
            </CardContent>
          </Card>
          
          <Button 
            onClick={() => navigate('/outdoor-media')}
            size="lg"
            variant="outline"
          >
            View All Formats
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Services;