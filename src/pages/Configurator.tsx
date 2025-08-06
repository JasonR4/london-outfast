import { useState } from 'react';
import { OOHConfigurator } from '@/components/OOHConfigurator';
import { QuoteSubmissionForm } from '@/components/QuoteSubmissionForm';
import { useQuotes } from '@/hooks/useQuotes';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Configurator() {
  const [showSubmission, setShowSubmission] = useState(false);
  const { currentQuote, loading } = useQuotes();

  const handleConfigurationComplete = () => {
    setShowSubmission(true);
  };

  const handleBackToConfigurator = () => {
    setShowSubmission(false);
  };

  if (showSubmission) {
    if (loading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 py-12">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </div>
        </div>
      );
    }

    if (!currentQuote || !currentQuote.quote_items || currentQuote.quote_items.length === 0) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 py-12">
          <div className="max-w-6xl mx-auto px-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-muted-foreground mb-4">No quote items found. Please complete the configurator first.</p>
                  <Button onClick={handleBackToConfigurator}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Configurator
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-4 mb-8">
            <Button 
              variant="outline" 
              onClick={handleBackToConfigurator}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Configurator
            </Button>
            <div>
              <h1 className="text-3xl font-bold">
                Submit Your <span className="bg-gradient-hero bg-clip-text text-transparent">OOH Plan</span>
              </h1>
              <p className="text-muted-foreground">
                Review your selections and submit for a detailed quote
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Your Configuration Summary</h2>
                  <div className="space-y-4">
                    {currentQuote.quote_items?.map((item, index) => (
                      <div key={index} className="border-b border-border pb-4 last:border-b-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{item.format_name}</h3>
                            <p className="text-sm text-muted-foreground">
                              Quantity: {item.quantity}
                            </p>
                            {item.selected_areas && item.selected_areas.length > 0 && (
                              <p className="text-sm text-muted-foreground">
                                Areas: {item.selected_areas.join(', ')}
                              </p>
                            )}
                            {item.selected_periods && item.selected_periods.length > 0 && (
                              <p className="text-sm text-muted-foreground">
                                Periods: {item.selected_periods.join(', ')}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-medium">£{item.total_cost.toFixed(2)}</p>
                            <p className="text-sm text-muted-foreground">+VAT</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <div className="pt-4 border-t border-border">
                      <div className="flex justify-between items-center text-lg font-semibold">
                        <span>Total Campaign Cost</span>
                        <span>£{currentQuote.total_cost.toFixed(2)} +VAT</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <QuoteSubmissionForm quote={currentQuote} />
            </div>
          </div>
        </div>
      </div>
    );
  }

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
        
        <OOHConfigurator onComplete={handleConfigurationComplete} />
      </div>
    </div>
  );
}