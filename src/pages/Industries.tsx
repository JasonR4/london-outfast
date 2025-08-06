import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Building2, Car, Palette, Hammer, GraduationCap, Clapperboard, 
         Calendar, Shirt, CreditCard, UtensilsCrossed, Landmark, Heart, Home, 
         Users, ShoppingBag, Rocket, Monitor, Plane } from "lucide-react";
import { useEffect } from "react";
import { updateMetaTags } from "@/utils/seo";

interface Industry {
  slug: string;
  title: string;
  displayName: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
}

const industries: Industry[] = [
  { 
    slug: "automotive", 
    title: "Out-of-Home Advertising for Automotive Industry", 
    displayName: "Automotive",
    description: "Drive sales with targeted outdoor advertising campaigns for car dealerships, manufacturers, and automotive services.",
    icon: Car,
    color: "bg-blue-50 border-blue-200 hover:bg-blue-100"
  },
  { 
    slug: "agencies", 
    title: "Out-of-Home Advertising for Agencies & In-House Teams", 
    displayName: "Agencies & In-House Teams",
    description: "Partner with us for seamless OOH campaign execution and media planning expertise.",
    icon: Building2,
    color: "bg-purple-50 border-purple-200 hover:bg-purple-100"
  },
  { 
    slug: "beauty", 
    title: "Out-of-Home Advertising for Beauty & Wellness", 
    displayName: "Beauty & Wellness",
    description: "Showcase beauty brands and wellness services with stunning outdoor advertising displays.",
    icon: Palette,
    color: "bg-pink-50 border-pink-200 hover:bg-pink-100"
  },
  { 
    slug: "construction", 
    title: "Out-of-Home Advertising for Construction & Trade", 
    displayName: "Construction & Trade",
    description: "Build your brand presence with targeted advertising for construction and trade businesses.",
    icon: Hammer,
    color: "bg-orange-50 border-orange-200 hover:bg-orange-100"
  },
  { 
    slug: "education", 
    title: "Out-of-Home Advertising for Education Sector", 
    displayName: "Education",
    description: "Reach students and educators with strategic outdoor advertising for educational institutions.",
    icon: GraduationCap,
    color: "bg-green-50 border-green-200 hover:bg-green-100"
  },
  { 
    slug: "entertainment", 
    title: "Out-of-Home Advertising for Entertainment Industry", 
    displayName: "Entertainment",
    description: "Promote shows, films, and entertainment venues with high-impact outdoor advertising.",
    icon: Clapperboard,
    color: "bg-red-50 border-red-200 hover:bg-red-100"
  },
  { 
    slug: "events", 
    title: "Out-of-Home Advertising for Events & Entertainment", 
    displayName: "Events & Entertainment",
    description: "Create buzz for events and entertainment with strategic outdoor advertising campaigns.",
    icon: Calendar,
    color: "bg-yellow-50 border-yellow-200 hover:bg-yellow-100"
  },
  { 
    slug: "fashion", 
    title: "Out-of-Home Advertising for Fashion & Lifestyle", 
    displayName: "Fashion & Lifestyle",
    description: "Showcase fashion brands and lifestyle products with premium outdoor advertising spaces.",
    icon: Shirt,
    color: "bg-indigo-50 border-indigo-200 hover:bg-indigo-100"
  },
  { 
    slug: "financial-services", 
    title: "Out-of-Home Advertising for Financial Services", 
    displayName: "Financial Services",
    description: "Build trust and awareness for financial services with professional outdoor advertising.",
    icon: CreditCard,
    color: "bg-slate-50 border-slate-200 hover:bg-slate-100"
  },
  { 
    slug: "food", 
    title: "Out-of-Home Advertising for Food & Drink", 
    displayName: "Food & Drink",
    description: "Drive footfall to restaurants and food brands with appetizing outdoor advertising campaigns.",
    icon: UtensilsCrossed,
    color: "bg-amber-50 border-amber-200 hover:bg-amber-100"
  },
  { 
    slug: "government", 
    title: "Out-of-Home Advertising for Government & Public Sector", 
    displayName: "Government & Public Sector",
    description: "Communicate public messages effectively with outdoor advertising for government initiatives.",
    icon: Landmark,
    color: "bg-cyan-50 border-cyan-200 hover:bg-cyan-100"
  },
  { 
    slug: "healthcare", 
    title: "Out-of-Home Advertising for Healthcare Industry", 
    displayName: "Healthcare",
    description: "Promote healthcare services and medical facilities with trusted outdoor advertising solutions.",
    icon: Heart,
    color: "bg-rose-50 border-rose-200 hover:bg-rose-100"
  },
  { 
    slug: "property", 
    title: "Out-of-Home Advertising for Property & Real Estate", 
    displayName: "Property & Real Estate",
    description: "Showcase properties and real estate services with high-visibility outdoor advertising.",
    icon: Home,
    color: "bg-emerald-50 border-emerald-200 hover:bg-emerald-100"
  },
  { 
    slug: "recruitment", 
    title: "Out-of-Home Advertising for Recruitment Industry", 
    displayName: "Recruitment",
    description: "Attract top talent with strategic outdoor advertising for recruitment agencies and job opportunities.",
    icon: Users,
    color: "bg-violet-50 border-violet-200 hover:bg-violet-100"
  },
  { 
    slug: "retail", 
    title: "Out-of-Home Advertising for Retail Industry", 
    displayName: "Retail",
    description: "Drive store visits and sales with compelling outdoor advertising for retail brands.",
    icon: ShoppingBag,
    color: "bg-teal-50 border-teal-200 hover:bg-teal-100"
  },
  { 
    slug: "startups", 
    title: "Out-of-Home Advertising for Startups & Scaleups", 
    displayName: "Startups & Scaleups",
    description: "Build brand awareness for startups and growing companies with cost-effective outdoor advertising.",
    icon: Rocket,
    color: "bg-lime-50 border-lime-200 hover:bg-lime-100"
  },
  { 
    slug: "technology", 
    title: "Out-of-Home Advertising for Technology Sector", 
    displayName: "Technology",
    description: "Promote tech products and services with innovative outdoor advertising campaigns.",
    icon: Monitor,
    color: "bg-sky-50 border-sky-200 hover:bg-sky-100"
  },
  { 
    slug: "travel", 
    title: "Out-of-Home Advertising for Travel & Hospitality", 
    displayName: "Travel & Hospitality",
    description: "Inspire wanderlust and promote travel destinations with captivating outdoor advertising.",
    icon: Plane,
    color: "bg-fuchsia-50 border-fuchsia-200 hover:bg-fuchsia-100"
  },
];

const Industries = () => {
  const navigate = useNavigate();

  useEffect(() => {
    updateMetaTags(
      "Industries - Out-of-Home Advertising Solutions | Media Buying London",
      "Discover specialized out-of-home advertising solutions for your industry. From automotive to technology, we deliver targeted OOH campaigns across London.",
      "https://mediabuyinglondon.co.uk/industries"
    );
  }, []);

  const handleIndustryClick = (slug: string) => {
    navigate(`/industries/${slug}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="max-w-6xl mx-auto text-center">
          <Badge variant="secondary" className="mb-4">
            INDUSTRY SPECIALISTS
          </Badge>
          <h1 className="text-4xl lg:text-5xl font-bold mb-6">
            Out-of-Home Advertising by Industry
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Tailored outdoor advertising solutions for every sector. Our industry expertise ensures 
            your campaigns reach the right audience with maximum impact across London.
          </p>
        </div>
      </section>

      {/* Industries Grid */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {industries.map((industry) => {
              const IconComponent = industry.icon;
              return (
                <Card 
                  key={industry.slug} 
                  className={`cursor-pointer transition-all duration-300 ${industry.color} border-2 hover:shadow-lg hover:scale-105`}
                  onClick={() => handleIndustryClick(industry.slug)}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <IconComponent className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{industry.displayName}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                      {industry.description}
                    </p>
                    <Button variant="ghost" size="sm" className="group p-0 h-auto text-primary hover:text-primary">
                      Learn More 
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-muted/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Don't See Your Industry?
          </h2>
          <p className="text-muted-foreground mb-8 text-lg">
            We work with businesses across all sectors. Contact us to discuss your specific 
            outdoor advertising needs and see how we can help your industry stand out.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => navigate('/quote')}
              size="lg"
            >
              Get Custom Quote
            </Button>
            <Button 
              onClick={() => navigate('/about')}
              variant="outline"
              size="lg"
            >
              Learn About Us
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Industries;