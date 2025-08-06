import { SmartQuoteForm } from "@/components/SmartQuoteForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";

interface QuoteFormSectionProps {
  prefilledFormats: string[];
  budgetRange: string;
  campaignObjective: string;
  targetAudience: string;
  onBack: () => void;
}

const QuoteFormSection = ({ 
  prefilledFormats, 
  budgetRange, 
  campaignObjective, 
  targetAudience, 
  onBack 
}: QuoteFormSectionProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <Button
            onClick={onBack}
            variant="outline"
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Results
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">
              Build Your <span className="bg-gradient-hero bg-clip-text text-transparent">Smart Quote</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Based on your configurator results, use our smart quote builder to get real-time pricing and create your detailed campaign plan.
            </p>
          </div>
        </div>

        {/* Configurator Results Summary */}
        <div className="mb-8">
          <Card className="bg-gradient-card border-border">
            <CardHeader>
              <CardTitle className="text-xl">Your Configurator Results</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-4 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Recommended Formats</h3>
                <div className="flex flex-wrap gap-2">
                  {prefilledFormats.map((format, index) => (
                    <Badge key={index} variant="outline" className="text-sm">
                      {format}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {budgetRange && (
                <div>
                  <h3 className="font-semibold mb-2">Budget Range</h3>
                  <Badge variant="secondary">{budgetRange}</Badge>
                </div>
              )}
              
              {campaignObjective && (
                <div>
                  <h3 className="font-semibold mb-2">Campaign Objective</h3>
                  <p className="text-sm text-muted-foreground">{campaignObjective}</p>
                </div>
              )}
              
              {targetAudience && (
                <div>
                  <h3 className="font-semibold mb-2">Target Audience</h3>
                  <p className="text-sm text-muted-foreground">{targetAudience}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Smart Quote Form */}
        <SmartQuoteForm onQuoteSubmitted={() => {
          // Handle successful quote submission
        }} />
      </div>
    </div>
  );
};

export default QuoteFormSection;