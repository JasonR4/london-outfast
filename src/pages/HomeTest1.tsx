import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useHomepageContent } from "@/hooks/useHomepageContent";
import ConfiguratorTeaser from "@/components/ConfiguratorTeaser";
import WhyChooseUs from "@/components/WhyChooseUs";
import PlanningTools from "@/components/PlanningTools";
import FormatLinks from "@/components/FormatLinks";
import CTA from "@/components/CTA";
import londonHero from "@/assets/london-hero.jpg";

const HomeTest1 = () => {
  const navigate = useNavigate();
  const { content: heroContent, loading: heroLoading } = useHomepageContent('hero');
  const { content: servicesContent, loading: servicesLoading } = useHomepageContent('services');

  if (heroLoading || servicesLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const services = servicesContent?.services || [];

  return (
    <div className="luxury-variant-1 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      
      {/* LUXURY HERO - Minimal & Elegant */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
          style={{ backgroundImage: `url(${heroContent?.background_image || londonHero})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-slate-900/60 to-black/90" />
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto px-8 text-center">
          <div className="mb-8 inline-flex items-center px-6 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
            <div className="w-2 h-2 bg-london-gold rounded-full mr-3 animate-pulse"></div>
            <span className="text-white/90 font-light tracking-wide">London's Premier OOH Specialists</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-extralight mb-8 text-white leading-none tracking-tight">
            <span className="block text-4xl md:text-5xl font-light text-london-gold mb-4">Precision.</span>
            <span className="block">Media Buying</span>
            <span className="block text-4xl md:text-5xl font-light text-white/60">London</span>
          </h1>
          
          <p className="text-xl md:text-2xl font-light mb-12 text-white/80 leading-relaxed max-w-4xl mx-auto">
            From TfL to digital roadside, bus to rail — securing London's premium locations with transparent rates and same-day quotes.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button 
              size="lg" 
              className="bg-london-gold hover:bg-london-gold/90 text-black font-medium px-8 py-4 text-lg"
              onClick={() => navigate('/brief')}
            >
              Send My Brief
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg"
              onClick={() => navigate('/quote')}
            >
              Get Quote
            </Button>
          </div>
        </div>
      </section>

      {/* LUXURY SERVICES - Grid with Golden Accents */}
      <section className="py-32 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="flex items-center justify-center mb-6">
              <div className="w-20 h-px bg-gradient-to-r from-transparent via-london-gold to-transparent"></div>
              <div className="mx-6 px-6 py-2 bg-london-gold/10 border border-london-gold/30 rounded-full">
                <span className="text-london-gold font-light tracking-widest text-sm">FORMATS</span>
              </div>
              <div className="w-20 h-px bg-gradient-to-r from-transparent via-london-gold to-transparent"></div>
            </div>
            <h2 className="text-5xl md:text-6xl font-extralight mb-8 text-white">
              Premium <span className="text-london-gold">Placements</span>
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto font-light">
              Curated outdoor media across London's most prestigious locations
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service: any, index: number) => (
              <div key={index} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-london-gold/20 via-transparent to-london-red/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <Card className="relative bg-white/5 backdrop-blur-xl border border-white/10 hover:border-london-gold/30 transition-all duration-500 h-full">
                  <CardHeader className="pb-4">
                    <div className="w-12 h-12 bg-london-gold/20 rounded-xl flex items-center justify-center mb-4">
                      <div className="w-6 h-6 bg-london-gold rounded-sm"></div>
                    </div>
                    <CardTitle className="text-xl text-white font-light">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-white/70 mb-6 font-light leading-relaxed">{service.description}</p>
                    <div className="space-y-3 mb-8">
                      {service.formats?.slice(0, 3).map((format: string, formatIndex: number) => (
                        <div key={formatIndex} className="flex items-center text-sm text-white/60">
                          <div className="w-1 h-1 bg-london-gold rounded-full mr-3"></div>
                          {format}
                        </div>
                      ))}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full text-london-gold hover:bg-london-gold/10 border border-london-gold/20"
                      onClick={() => navigate('/outdoor-media')}
                    >
                      Explore
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rest of components with dark luxury theme */}
      <div className="space-y-32">
        <div className="px-8">
          <ConfiguratorTeaser />
        </div>
        <div className="px-8">
          <WhyChooseUs />
        </div>
        <div className="px-8">
          <PlanningTools />
        </div>
        <div className="px-8">
          <FormatLinks />
        </div>
        <div className="px-8">
          <CTA />
        </div>

        {/* Luxury About Section */}
        <section className="px-8 py-24">
          <div className="max-w-4xl mx-auto text-center">
            <div className="relative p-16 rounded-3xl bg-gradient-to-br from-white/5 to-white/[0.01] border border-london-gold/20 backdrop-blur-xl">
              <div className="absolute top-0 left-0 w-16 h-16 border-l-2 border-t-2 border-london-gold/40 rounded-tl-2xl"></div>
              <div className="absolute top-0 right-0 w-16 h-16 border-r-2 border-t-2 border-london-gold/40 rounded-tr-2xl"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 border-l-2 border-b-2 border-london-gold/40 rounded-bl-2xl"></div>
              <div className="absolute bottom-0 right-0 w-16 h-16 border-r-2 border-b-2 border-london-gold/40 rounded-br-2xl"></div>
              
              <p className="text-lg leading-8 text-white/80 font-light">
                Media Buying London is a dedicated out-of-home buying specialist.
                We focus solely on London formats: 6-sheets, D48 billboards, Tube
                advertising, bus media, and digital OOH. Every schedule is built
                for precision reach and cost efficiency, with all rates clearly
                published and quotes turned around the same day.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomeTest1;