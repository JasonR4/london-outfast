import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Calculator, Map, Calendar, Settings } from "lucide-react";
import { useHomepageContent } from "@/hooks/useHomepageContent";

const PlanningTools = () => {
  const navigate = useNavigate();
  const { content, loading } = useHomepageContent('planning_tools');

  if (loading) {
    return <div className="py-20 px-4 text-center">Loading...</div>;
  }

  const tools = [
    {
      icon: Settings,
      title: "Format Configurator",
      description: "Get personalized format recommendations based on your campaign goals",
      action: "Start Configurator",
      route: "/configurator",
      color: "bg-primary/10 text-primary"
    },
    {
      icon: Calculator,
      title: "Budget Calculator",
      description: "Estimate costs across different formats and campaign durations",
      action: "Calculate Budget",
      route: "/quote",
      color: "bg-accent/10 text-accent"
    },
    {
      icon: Map,
      title: "Coverage Visualizer",
      description: "See reach and frequency across London's key areas",
      action: "View Coverage",
      route: "/outdoor-media",
      color: "bg-green-500/10 text-green-600"
    },
    {
      icon: Calendar,
      title: "Timeline Planner",
      description: "Plan your campaign timeline and booking deadlines",
      action: "Plan Timeline",
      route: "/quote",
      color: "bg-blue-500/10 text-blue-600"
    }
  ];

  return (
    <section className="py-20 px-4 bg-muted/20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 text-lg px-6 py-2">
            {content?.badge_text || "SELF-SERVICE TOOLS"}
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            {content?.title || "Plan Your Campaign Your Way"}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {content?.description || "Use our free planning tools to explore options, estimate costs, and prepare your brief before speaking with our team"}
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tools.map((tool, index) => (
            <Card key={index} className="bg-card border-border hover:shadow-card transition-all duration-300 group cursor-pointer">
              <CardHeader className="text-center pb-4">
                <div className={`w-16 h-16 ${tool.color} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                  <tool.icon className="w-8 h-8" />
                </div>
                <CardTitle className="text-xl text-foreground">{tool.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-6 text-sm leading-relaxed">{tool.description}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => navigate(tool.route)}
                >
                  {tool.action}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">Need help choosing the right tool?</p>
          <Button 
            variant="ghost" 
            className="text-accent hover:text-accent-foreground"
            onClick={() => navigate('/configurator')}
          >
            Take Our Quick Assessment →
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PlanningTools;