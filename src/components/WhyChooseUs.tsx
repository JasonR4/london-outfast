import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const WhyChooseUs = () => {
  const features = [
    {
      title: "Fast Turnarounds",
      description: "Quotes within hours. Book today, live next week.",
      highlight: "Same-day quotes"
    },
    {
      title: "Best Price Guarantee",
      description: "We beat any agency quote. No middleman fees.",
      highlight: "Unbeatable rates"
    },
    {
      title: "100% London Coverage",
      description: "From Croydon to Camden. Full TfL access.",
      highlight: "Complete coverage"
    },
    {
      title: "All Budgets Welcome",
      description: "From £500 local buys to £500K takeovers.",
      highlight: "No minimum spend"
    },
    {
      title: "Performance Focused",
      description: "Plan by audience, postcode, footfall & WMI (Weighted Media Index).",
      highlight: "Data-driven planning"
    }
  ];

  const clients = [
    "Local businesses launching in London",
    "National brands running metro-led activity", 
    "Event promoters (clubs, gigs, activations)",
    "Retail chains pushing store traffic",
    "PR & media agencies outsourcing fast-turn buys",
    "Start-ups making noise with lean budgets"
  ];

  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        {/* Why Choose Us */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 text-lg px-6 py-2">
            THE ALTERNATIVE TO SLOW-MOVING RETAINERS
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            We're Media Buyers. That's the Point.
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12">
            No meetings about meetings. No fluff. No retainers. We don't build brands — we get them seen. 
            You bring the brief, we bring the space.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
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
            WHO USES US?
          </Badge>
          <h3 className="text-3xl md:text-4xl font-bold mb-8">
            From Startups to Enterprise
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {clients.map((client, index) => (
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