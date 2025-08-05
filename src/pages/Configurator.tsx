import { OOHConfigurator } from '@/components/OOHConfigurator';

export default function Configurator() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Find Your Perfect <span className="bg-gradient-hero bg-clip-text text-transparent">OOH Platform</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Not sure which outdoor advertising format is right for you? Our smart configurator will recommend the best options based on your specific needs and goals.
          </p>
        </div>
        
        <OOHConfigurator />
      </div>
    </div>
  );
}