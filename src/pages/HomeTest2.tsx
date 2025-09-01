import Hero from "@/components/Hero";
import Services from "@/components/Services";
import ConfiguratorTeaser from "@/components/ConfiguratorTeaser";
import WhyChooseUs from "@/components/WhyChooseUs";
import PlanningTools from "@/components/PlanningTools";
import FormatLinks from "@/components/FormatLinks";
import CTA from "@/components/CTA";

const HomeTest2 = () => {
  return (
    <div className="luxury-variant-2 min-h-screen">
      {/* Ultra-premium animated gradient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-london-navy/[0.02] via-transparent to-london-gold/[0.01]" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-london-gold/[0.008] rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-london-red/[0.006] rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10">
        <Hero />
        
        {/* Ultra-luxury spacing with premium visual hierarchy */}
        <div className="space-y-40 md:space-y-48">
          
          {/* Sophisticated section wrapper */}
          <div className="relative px-4">
            {/* Premium floating separator */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
              <div className="w-1 h-16 bg-gradient-to-b from-transparent via-london-gold/20 to-transparent" />
              <div className="w-3 h-3 rounded-full bg-london-gold/40 my-2" />
              <div className="w-1 h-16 bg-gradient-to-b from-transparent via-london-gold/20 to-transparent" />
            </div>
            
            <div className="pt-20">
              <Services />
            </div>
          </div>

          {/* Elegant floating configurator */}
          <div className="relative">
            {/* Floating accent line */}
            <div className="absolute top-0 left-0 right-0 flex justify-center">
              <div className="w-40 h-px bg-gradient-to-r from-transparent via-london-navy/30 to-transparent" />
            </div>
            
            <div className="pt-16 relative">
              {/* Subtle glow effect */}
              <div className="absolute inset-0 bg-gradient-radial from-london-blue/[0.02] via-transparent to-transparent rounded-full blur-3xl" />
              <ConfiguratorTeaser />
            </div>
          </div>

          {/* Premium showcase section */}
          <div className="relative overflow-hidden">
            {/* Luxury frame lines */}
            <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-london-gold/20 to-transparent" />
            <div className="absolute bottom-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-london-gold/20 to-transparent" />
            
            <div className="py-20">
              <WhyChooseUs />
            </div>
          </div>

          {/* Sophisticated tools section */}
          <div className="relative">
            {/* Corner flourishes */}
            <div className="absolute top-0 left-4 w-16 h-16">
              <div className="absolute top-4 left-4 w-8 h-8 border-l border-t border-london-red/20" />
            </div>
            <div className="absolute top-0 right-4 w-16 h-16">
              <div className="absolute top-4 right-4 w-8 h-8 border-r border-t border-london-red/20" />
            </div>
            
            <PlanningTools />
          </div>

          {/* Elevated format links */}
          <div className="relative">
            {/* Premium backdrop */}
            <div className="absolute inset-0 bg-gradient-to-r from-london-navy/[0.008] via-london-blue/[0.004] to-london-navy/[0.008] rounded-3xl mx-8" />
            <div className="relative py-16">
              <FormatLinks />
            </div>
          </div>

          {/* Luxury CTA with premium styling */}
          <div className="relative">
            {/* Elegant border treatment */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-london-gold/30 to-transparent" />
            
            <div className="pt-16">
              <CTA />
            </div>
          </div>

          {/* Ultra-premium about section */}
          <section aria-label="About Media Buying London" className="px-4 py-24">
            <div className="max-w-5xl mx-auto">
              {/* Luxury card with sophisticated styling */}
              <div className="relative group">
                {/* Premium gradient border */}
                <div className="absolute inset-0 bg-gradient-to-r from-london-gold/20 via-london-red/20 to-london-navy/20 rounded-3xl blur-sm opacity-30 group-hover:opacity-50 transition-opacity duration-700" />
                
                {/* Main content card */}
                <div className="relative bg-background/95 backdrop-blur-xl rounded-3xl p-16 border border-white/10">
                  {/* Decorative corner elements */}
                  <div className="absolute top-6 left-6 w-12 h-12 border-l-2 border-t-2 border-london-gold/30 rounded-tl-lg" />
                  <div className="absolute top-6 right-6 w-12 h-12 border-r-2 border-t-2 border-london-gold/30 rounded-tr-lg" />
                  <div className="absolute bottom-6 left-6 w-12 h-12 border-l-2 border-b-2 border-london-gold/30 rounded-bl-lg" />
                  <div className="absolute bottom-6 right-6 w-12 h-12 border-r-2 border-b-2 border-london-gold/30 rounded-br-lg" />
                  
                  {/* Center ornament */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rotate-45 bg-london-gold/20 border border-london-gold/30" />
                  
                  <p className="text-center text-lg leading-9 text-foreground/95 font-light tracking-wide max-w-4xl mx-auto">
                    Media Buying London is a dedicated out-of-home buying specialist.
                    We focus solely on London formats: 6-sheets, D48 billboards, Tube
                    advertising, bus media, and digital OOH. Every schedule is built
                    for precision reach and cost efficiency, with all rates clearly
                    published and quotes turned around the same day.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default HomeTest2;