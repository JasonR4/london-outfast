import Hero from "@/components/Hero";
import Services from "@/components/Services";
import ConfiguratorTeaser from "@/components/ConfiguratorTeaser";
import WhyChooseUs from "@/components/WhyChooseUs";
import PlanningTools from "@/components/PlanningTools";
import FormatLinks from "@/components/FormatLinks";
import CTA from "@/components/CTA";

const HomeTest1 = () => {
  return (
    <div className="luxury-variant-1">
      {/* Luxury gradient background overlay */}
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none bg-gradient-to-br from-london-gold via-transparent to-london-red" />
      
      <Hero />
      
      {/* Luxury spacing and elegant sectioning */}
      <div className="space-y-32 md:space-y-40 relative">
        {/* Premium glass morphism separator */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-20 bg-gradient-to-b from-transparent via-london-gold/30 to-transparent" />
        
        <div className="luxury-section">
          <Services />
        </div>

        {/* Elegant divider */}
        <div className="flex items-center justify-center py-8">
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-london-gold/40 to-transparent" />
          <div className="mx-6 w-2 h-2 rounded-full bg-london-gold/30" />
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-london-gold/40 to-transparent" />
        </div>

        <div className="luxury-section">
          <ConfiguratorTeaser />
        </div>

        {/* Premium spacing */}
        <div className="py-12">
          <div className="flex items-center justify-center">
            <div className="w-32 h-px bg-gradient-to-r from-transparent via-london-red/30 to-transparent" />
          </div>
        </div>

        <div className="luxury-section relative">
          {/* Subtle background accent */}
          <div className="absolute inset-0 bg-gradient-to-r from-london-blue/[0.01] via-transparent to-london-gold/[0.01] rounded-3xl" />
          <WhyChooseUs />
        </div>

        <div className="luxury-section">
          <PlanningTools />
        </div>

        <div className="luxury-section">
          <FormatLinks />
        </div>

        {/* Luxury CTA section */}
        <div className="luxury-section">
          <CTA />
        </div>

        {/* Premium about section with luxury styling */}
        <section aria-label="About Media Buying London" className="px-4 py-20">
          <div className="max-w-4xl mx-auto">
            {/* Elegant frame */}
            <div className="relative p-12 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-sm">
              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-london-gold/30" />
              <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-london-gold/30" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-london-gold/30" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-london-gold/30" />
              
              <p className="text-center text-base leading-8 text-foreground/90 font-light tracking-wide">
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