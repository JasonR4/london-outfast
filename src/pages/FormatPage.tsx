import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { getCurrentUser, requireAuth } from '@/utils/auth';
import { trackRateGateCTAClicked } from '@/utils/analytics';
import FormatPricingSection from '@/components/FormatPricingSection';
import { useMediaFormats } from '@/hooks/useMediaFormats';
import { useRateCards } from '@/hooks/useRateCards';

const FormatPage = () => {
  const { formatSlug } = useParams();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [format, setFormat] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const user = await getCurrentUser();
      setIsAuthenticated(!!user);
    };
    checkAuth();
  }, []);

  // Mock format data for now
  useEffect(() => {
    setFormat({
      format_name: formatSlug?.replace('-', ' ') || 'Outdoor Format',
      name: formatSlug?.replace('-', ' ') || 'Outdoor Format',
      description: 'Professional outdoor advertising format available across London.',
      category: 'Billboard'
    });
    setLoading(false);
  }, [formatSlug]);

  const handleGetQuote = () => {
    navigate('/quote');
  };

  const handleCallNow = () => {
    window.location.href = 'tel:+442012345678';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading format...</div>
      </div>
    );
  }

  if (!format) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Format not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-background via-muted/20 to-accent/10">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-hero bg-clip-text text-transparent">
            {format.format_name}
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            {format.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={async () => {
                if (!isAuthenticated) {
                  trackRateGateCTAClicked('add_to_plan');
                  const planDraft = {
                    formats: [formatSlug],
                    sitesSelected: 1,
                    periods: [],
                    locations: [],
                    lastStep: 'costs'
                  };
                  await requireAuth(
                    `${window.location.pathname}#action=build`,
                    () => handleGetQuote(),
                    planDraft
                  );
                } else {
                  handleGetQuote();
                }
              }}
              size="lg" 
              className="bg-gradient-primary hover:opacity-90"
            >
              Build My Plan
            </Button>
            <Button onClick={handleCallNow} variant="outline" size="lg">
              Speak to Specialist
            </Button>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <FormatPricingSection
            isAuthenticated={isAuthenticated}
            format={format}
            quantity={1}
            selectedAreas={['Central London']}
            selectedPeriods={[1, 2]}
            isDateSpecific={true}
            selectedStartDate={null}
            selectedEndDate={null}
            needsCreative={false}
            creativeAssets={0}
            rateLoading={false}
            getAvailableLocations={() => ['Central London', 'Zone 1', 'Zone 2']}
            calculatePrice={() => ({ basePrice: 800 })}
            calculateProductionCost={() => ({ totalCost: 150 })}
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/10 via-accent/10 to-background">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Launch Your {format.format_name} Campaign?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Get instant pricing and expert campaign planning for London's best locations
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={handleGetQuote} size="lg" className="bg-gradient-primary hover:opacity-90">
              GET QUOTE
            </Button>
            <Button onClick={handleCallNow} variant="outline" size="lg">
              SPEAK TO PLANNER
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FormatPage;