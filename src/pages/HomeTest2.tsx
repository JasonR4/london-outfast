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

const HomeTest2 = () => {
  const navigate = useNavigate();
  const { content: heroContent, loading: heroLoading } = useHomepageContent('hero');
  const { content: servicesContent, loading: servicesLoading } = useHomepageContent('services');

  if (heroLoading || servicesLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const services = servicesContent?.services || [];

  return (
    <div className="luxury-variant-2 bg-gradient-to-br from-white via-slate-50 to-white">
      
      {/* ULTRA-LUXURY HERO - Bright & Airy */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10"
          style={{ backgroundImage: `url(${heroContent?.background_image || londonHero})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/90 via-slate-50/80 to-white/95" />
        </div>
        
        {/* Floating design elements */}
        <div className="absolute top-20 left-20 w-32 h-32 border border-london-gold/20 rounded-full animate-pulse"></div>
        <div className="absolute bottom-32 right-24 w-24 h-24 bg-london-red/5 rounded-full blur-xl"></div>
        <div className="absolute top-1/3 right-16 w-2 h-40 bg-gradient-to-b from-london-gold/30 to-transparent"></div>
        
        <div className="relative z-10 max-w-6xl mx-auto px-8 text-center">
          <Badge className="mb-8 bg-london-gold/10 text-london-gold border-london-gold/20 px-8 py-3 text-base">
            AWARD-WINNING SPECIALISTS
          </Badge>
          
          <h1 className="text-7xl md:text-9xl font-black mb-8 text-slate-900 leading-none">
            <span className="block text-london-gold">MEDIA</span>
            <span className="block">BUYING</span>
            <span className="block text-3xl md:text-4xl font-light text-slate-600 tracking-[0.2em] mt-4">LONDON</span>
          </h1>
          
          <div className="w-24 h-1 bg-london-gold mx-auto mb-8"></div>
          
          <p className="text-2xl md:text-3xl font-medium mb-12 text-slate-700 leading-relaxed max-w-5xl mx-auto">
            Premium out-of-home campaigns across London's most exclusive locations
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Button 
              size="lg" 
              className="bg-slate-900 hover:bg-slate-800 text-white py-6 text-lg font-medium"
              onClick={() => navigate('/brief')}
            >
              Send Brief
            </Button>
            <Button 
              size="lg" 
              className="bg-london-gold hover:bg-london-gold/90 text-black py-6 text-lg font-medium"
              onClick={() => navigate('/brief')}
            >
              Get Quote
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-2 border-slate-300 text-slate-700 hover:bg-slate-100 py-6 text-lg font-medium"
              onClick={() => navigate('/brief')}
            >
              Explore
            </Button>
          </div>
        </div>
      </section>

      {/* LUXURY SERVICES - Magazine Style Layout */}
      <section className="py-32 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center mb-20">
            <div>
              <Badge className="mb-6 bg-slate-100 text-slate-700 px-6 py-2">
                PREMIUM FORMATS
              </Badge>
              <h2 className="text-6xl md:text-7xl font-black text-slate-900 leading-tight mb-8">
                London's
                <span className="block text-london-gold">Finest</span>
                <span className="block text-4xl font-light text-slate-600">Locations</span>
              </h2>
            </div>
            <div>
              <p className="text-xl text-slate-600 leading-relaxed">
                Hand-selected premium placements across London's most prestigious districts. From Mayfair to Canary Wharf, we secure the locations that matter.
              </p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12">
            {services.map((service: any, index: number) => (
              <div key={index} className="group">
                <Card className="bg-white border-0 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden">
                  <div className="relative">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-london-gold via-london-red to-london-blue"></div>
                    <CardHeader className="p-12 pb-8">
                      <div className="flex items-center justify-between mb-6">
                        <div className="w-16 h-16 bg-slate-900 rounded-xl flex items-center justify-center">
                          <div className="w-8 h-8 bg-london-gold rounded"></div>
                        </div>
                        <Badge variant="outline" className="text-slate-600 border-slate-300">
                          0{index + 1}
                        </Badge>
                      </div>
                      <CardTitle className="text-3xl font-black text-slate-900 mb-4">
                        {service.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-12 pb-12">
                      <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                        {service.description}
                      </p>
                      <div className="grid grid-cols-1 gap-4 mb-8">
                        {service.formats?.slice(0, 4).map((format: string, formatIndex: number) => (
                          <div key={formatIndex} className="flex items-center p-3 bg-slate-50 rounded-lg">
                            <div className="w-3 h-3 bg-london-gold rounded-full mr-4"></div>
                            <span className="text-slate-700 font-medium">{format}</span>
                          </div>
                        ))}
                      </div>
                      <Button 
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 font-medium"
                        onClick={() => navigate('/outdoor-media')}
                      >
                        View Details
                      </Button>
                    </CardContent>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rest of components with bright luxury theme */}
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

        {/* Ultra-Luxury About Section */}
        <section className="px-8 py-32">
          <div className="max-w-6xl mx-auto">
            <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-20 text-center overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 left-0 w-32 h-32 border-l-4 border-t-4 border-london-gold/30"></div>
              <div className="absolute top-0 right-0 w-32 h-32 border-r-4 border-t-4 border-london-gold/30"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 border-l-4 border-b-4 border-london-gold/30"></div>
              <div className="absolute bottom-0 right-0 w-32 h-32 border-r-4 border-b-4 border-london-gold/30"></div>
              
              <Badge className="mb-8 bg-london-gold/20 text-london-gold border-london-gold/30 px-8 py-3">
                ABOUT MBL
              </Badge>
              
              <h3 className="text-4xl md:text-5xl font-black text-white mb-8">
                London's Premier
                <span className="block text-london-gold">OOH Specialists</span>
              </h3>
              
              <div className="w-32 h-1 bg-london-gold mx-auto mb-12"></div>
              
              <p className="text-xl leading-relaxed text-white/90 max-w-4xl mx-auto">
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

export default HomeTest2;