import Hero from "@/components/Hero";
import Services from "@/components/Services";
import ConfiguratorTeaser from "@/components/ConfiguratorTeaser";
import WhyChooseUs from "@/components/WhyChooseUs";

import PlanningTools from "@/components/PlanningTools";
import FormatLinks from "@/components/FormatLinks";
const Index = () => {
  return (
    <>
      <Hero />
      <div className="space-y-24 md:space-y-32">
        <Services />
        <ConfiguratorTeaser />
        <WhyChooseUs />
        
        <PlanningTools />
        <FormatLinks />

        <section aria-label="About Media Buying London" className="px-4">
          <div className="max-w-3xl mx-auto text-sm text-muted-foreground leading-7">
            <p>
              Media Buying London is a dedicated out-of-home buying specialist.
              We focus solely on London formats: 6-sheets, D48 billboards, Tube
              advertising, bus media, and digital OOH. Every schedule is built
              for precision reach and cost efficiency, with all rates clearly
              published and quotes turned around the same day.
            </p>
          </div>
        </section>
      </div>
    </>
  );
};

export default Index;
