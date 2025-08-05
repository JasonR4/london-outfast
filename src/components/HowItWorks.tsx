import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const HowItWorks = () => {
  const steps = [
    {
      number: "01",
      title: "Submit your brief",
      description: "Format, location, timing, budget",
      icon: "📝"
    },
    {
      number: "02", 
      title: "Get a quote same-day",
      description: "We'll show you what's live and what performs",
      icon: "⚡"
    },
    {
      number: "03",
      title: "Approve & book",
      description: "We handle all logistics and confirmations", 
      icon: "✅"
    },
    {
      number: "04",
      title: "Go live",
      description: "With full Proof of Posting (POP) and campaign support",
      icon: "🚀"
    }
  ];

  const addOns = [
    "🚀 Creative production (print or motion)",
    "📊 Audience targeting by postcode, footfall or Mosaic type", 
    "🔄 Programmatic DOOH campaigns with live optimisation"
  ];

  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* How It Works */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 text-lg px-6 py-2">
            ⚙️ HOW IT WORKS
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Simple. Fast. Effective.
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From brief to billboard in record time
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {steps.map((step, index) => (
            <Card key={index} className="bg-gradient-card border-border hover:shadow-card transition-all duration-300 relative overflow-hidden group">
              <div className="absolute top-4 right-4 text-6xl font-bold text-london-red/20 group-hover:text-london-red/40 transition-colors">
                {step.number}
              </div>
              <CardHeader className="relative z-10">
                <div className="text-4xl mb-4">{step.icon}</div>
                <CardTitle className="text-xl text-foreground">{step.title}</CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-muted-foreground">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add-ons */}
        <div className="bg-muted/30 rounded-2xl p-8 md:p-12">
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Optional Add-ons
            </h3>
            <p className="text-muted-foreground">
              Enhanced services to maximise your campaign performance
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {addOns.map((addon, index) => (
              <div key={index} className="bg-card p-6 rounded-lg border border-border hover:border-accent transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{addon}</span>
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