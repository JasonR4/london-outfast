import Hero from "@/components/Hero";
import Services from "@/components/Services";
import WhyChooseUs from "@/components/WhyChooseUs";
import HowItWorks from "@/components/HowItWorks";
import FormatLinks from "@/components/FormatLinks";
import CTA from "@/components/CTA";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Hero />
      <Services />
      <WhyChooseUs />
      <HowItWorks />
      <FormatLinks />
      <CTA />
    </div>
  );
};

export default Index;
