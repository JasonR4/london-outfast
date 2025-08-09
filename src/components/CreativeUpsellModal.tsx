import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Palette, TrendingUp, Target, ArrowRight, Lightbulb, MapPin, PaintBucket } from 'lucide-react';
import { formatCurrency } from '@/utils/money';

interface CreativeUpsellOption {
  title: string;
  description: string;
  currentValue: number;
  suggestedValue: number;
  costIncrease: number;
  percentageIncrease: number;
  benefitText: string;
  type: 'sites' | 'creatives';
}

interface CreativeUpsellModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSites: number;
  currentCreatives: number;
  efficiency: number;
  status: string;
  options: CreativeUpsellOption[];
  onSelectOption: (option: CreativeUpsellOption) => void;
}

export const CreativeUpsellModal: React.FC<CreativeUpsellModalProps> = ({
  isOpen,
  onClose,
  currentSites,
  currentCreatives,
  efficiency,
  status,
  options,
  onSelectOption
}) => {
  const getStatusInfo = () => {
    switch (status) {
      case 'under-creative':
        return {
          title: 'Optimize Your Creative Strategy',
          description: `You have ${currentCreatives} creative${currentCreatives !== 1 ? 's' : ''} for ${currentSites} sites. This ratio may limit campaign effectiveness.`,
          color: 'orange'
        };
      case 'over-creative':
        return {
          title: 'Maximize Creative Investment',
          description: `You have ${currentCreatives} creatives for only ${currentSites} sites. Let's optimize for better ROI.`,
          color: 'blue'
        };
      default:
        return {
          title: 'Optimize Creative Performance',
          description: `Fine-tune your creative strategy for maximum campaign impact.`,
          color: 'purple'
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            {statusInfo.title}
          </DialogTitle>
          <DialogDescription>
            {statusInfo.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Situation */}
          <Card className={`border-l-4 border-l-${statusInfo.color}-500`}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Current Creative Setup</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Sites:</span>
                  <div className="font-semibold flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {currentSites}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Creatives:</span>
                  <div className="font-semibold flex items-center gap-1">
                    <PaintBucket className="h-3 w-3" />
                    {currentCreatives}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Efficiency:</span>
                  <div className={`font-semibold ${efficiency < 70 ? 'text-orange-600' : efficiency > 90 ? 'text-green-600' : 'text-yellow-600'}`}>
                    {efficiency}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Optimization Options */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Target className="h-4 w-4" />
              Smart Optimization Options
            </h3>
            
            {options.map((option, index) => (
              <Card key={index} className="border hover:border-primary transition-colors cursor-pointer" onClick={() => onSelectOption(option)}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{option.title}</h4>
                        <Badge variant={option.costIncrease < 0 ? "secondary" : "outline"}>
                          {option.costIncrease < 0 ? '-' : '+'}{Math.abs(option.percentageIncrease)}% cost
                        </Badge>
                        <Badge variant="secondary">
                          {option.type === 'sites' ? <MapPin className="h-3 w-3 mr-1" /> : <PaintBucket className="h-3 w-3 mr-1" />}
                          {option.type === 'sites' ? 'Site Change' : 'Creative Change'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{option.description}</p>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Change: </span>
                        <span className="font-medium">{option.currentValue} → {option.suggestedValue}</span>
                      </div>
                      <div className="text-sm text-green-600 font-medium">
                        {option.benefitText}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${option.costIncrease < 0 ? 'text-green-600' : ''}`}>
                        {option.costIncrease < 0 ? '-' : '+'}{formatCurrency(Math.abs(option.costIncrease))}
                      </div>
                      <Button size="sm" className="mt-2">
                        {option.costIncrease < 0 ? 'Optimize' : 'Upgrade'}
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Industry Insight */}
          <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="h-4 w-4 text-purple-600" />
                <span className="font-semibold text-purple-700">Industry Best Practice</span>
              </div>
              <p className="text-sm text-purple-700">
                The optimal creative-to-site ratio is 0.5-1.0 creatives per site. This ensures adequate variety 
                without oversaturation, maximizing both reach and frequency for optimal campaign performance.
              </p>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Keep Current Setup
            </Button>
            <Button 
              onClick={() => onSelectOption(options[0])} 
              className="flex-1"
              disabled={options.length === 0}
            >
              Apply Best Option
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};