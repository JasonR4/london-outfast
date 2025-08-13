import React, { useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Phone } from 'lucide-react';
import { formatCurrency } from '@/utils/money';
import { formatCurrencyWithVAT } from '@/utils/vat';
import { getCurrentUser } from '@/utils/auth';
import { trackRateGateViewed, trackRateGateCTAClicked } from '@/utils/analytics';
import { useNavigate } from 'react-router-dom';

interface GatedCostPanelProps {
  isAuthenticated: boolean;
  pricing: {
    mediaPrice: number;
    productionCost: number;
    creativeCost: number;
    totalCost: number;
    mediaDiscount: number;
    qualifiesVolume: boolean;
    mediaAfterDiscount: number;
  };
  formatName?: string;
  className?: string;
}

export const GatedCostPanel: React.FC<GatedCostPanelProps> = ({
  isAuthenticated,
  pricing,
  formatName,
  className = ""
}) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      // Track rate gate viewed
      trackRateGateViewed('/outdoor-media', formatName);
    }
  }, [isAuthenticated, formatName]);

  const handleRevealRates = () => {
    trackRateGateCTAClicked('costs_card');
    const currentUrl = window.location.href;
    navigate(`/create-account?return=${encodeURIComponent(currentUrl)}#reveal=costs`);
  };

  const handleContactSpecialist = () => {
    trackRateGateCTAClicked('costs_card');
    navigate('/contact');
  };

  if (isAuthenticated) {
    // Show real pricing for authenticated users
    return (
      <Card className={`border border-border bg-gradient-card ${className}`}>
        <CardHeader>
          <CardTitle className="text-xl">Estimated Campaign Costs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Media Cost</span>
              <span className="font-medium">{formatCurrency(pricing.mediaPrice)}</span>
            </div>
            
            {pricing.qualifiesVolume && (
              <div className="flex justify-between items-center text-green-600">
                <span className="text-sm">Volume Discount (10%)</span>
                <span className="font-medium">-{formatCurrency(pricing.mediaDiscount)}</span>
              </div>
            )}
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Media Subtotal</span>
              <span className="font-medium">{formatCurrency(pricing.mediaAfterDiscount)}</span>
            </div>
            
            {pricing.productionCost > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Production</span>
                <span className="font-medium">{formatCurrency(pricing.productionCost)}</span>
              </div>
            )}
            
            {pricing.creativeCost > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Creative</span>
                <span className="font-medium">{formatCurrency(pricing.creativeCost)}</span>
              </div>
            )}
            
            <div className="border-t pt-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total (ex VAT)</span>
                <span className="font-bold text-lg">{formatCurrency(pricing.totalCost)}</span>
              </div>
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>Total (inc VAT)</span>
                <span>{formatCurrencyWithVAT(pricing.totalCost)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show masked panel for unauthenticated users
  return (
    <Card className={`border border-border bg-gradient-card ${className}`}>
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="secondary" className="text-xs">
            Account Required
          </Badge>
        </div>
        <CardTitle className="text-xl">Estimated Campaign Costs</CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          Create a free account to reveal live rates, save plans, and access your client portal with full media schedules and exact locations.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Media Cost</span>
            <span className="font-medium text-muted-foreground">—</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Production</span>
            <span className="font-medium text-muted-foreground">—</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Creative</span>
            <span className="font-medium text-muted-foreground">—</span>
          </div>
          
          <div className="border-t pt-3">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Total (ex VAT)</span>
              <span className="font-bold text-lg text-muted-foreground">—</span>
            </div>
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>Total (inc VAT)</span>
              <span>—</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-2 pt-4">
          <Button 
            onClick={handleRevealRates}
            className="w-full bg-gradient-primary hover:opacity-90"
          >
            <Eye className="h-4 w-4 mr-2" />
            Reveal my live rates
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleContactSpecialist}
            className="w-full"
          >
            <Phone className="h-4 w-4 mr-2" />
            Speak to a specialist
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default GatedCostPanel;