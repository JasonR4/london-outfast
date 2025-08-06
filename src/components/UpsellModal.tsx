import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { TrendingUp, MapPin, Calendar, Target, ArrowRight } from 'lucide-react';

interface UpsellOption {
  title: string;
  description: string;
  currentValue: number;
  suggestedValue: number;
  costIncrease: number;
  percentageIncrease: number;
  benefitText: string;
  type: 'quantity' | 'periods';
}

interface UpsellModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCapacity: number;
  requiredCapacity: number;
  selectedLocations: number;
  options: UpsellOption[];
  onSelectOption: (option: UpsellOption) => void;
  zoneName?: string;
}

export const UpsellModal: React.FC<UpsellModalProps> = ({
  isOpen,
  onClose,
  currentCapacity,
  requiredCapacity,
  selectedLocations,
  options,
  onSelectOption,
  zoneName
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Maximize Your Campaign Reach
          </DialogTitle>
          <DialogDescription>
            {zoneName ? (
              <>You want to select all {zoneName} locations ({selectedLocations} areas), but you only have {currentCapacity} location slots available.</>
            ) : (
              <>You've selected {selectedLocations} locations but only have capacity for {currentCapacity}. Upgrade your campaign to unlock more coverage.</>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Situation */}
          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Current Situation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Current Capacity:</span>
                  <div className="font-semibold">{currentCapacity} location slots</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Locations Needed:</span>
                  <div className="font-semibold text-orange-600">{selectedLocations} locations</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Upgrade Options */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Target className="h-4 w-4" />
              Smart Upgrade Options
            </h3>
            
            {options.map((option, index) => (
              <Card key={index} className="border hover:border-primary transition-colors cursor-pointer" onClick={() => onSelectOption(option)}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{option.title}</h4>
                        <Badge variant="outline">
                          +{option.percentageIncrease}% cost
                        </Badge>
                        <Badge variant="secondary">
                          {option.type === 'quantity' ? <MapPin className="h-3 w-3 mr-1" /> : <Calendar className="h-3 w-3 mr-1" />}
                          {option.type === 'quantity' ? 'More Sites' : 'More Periods'}
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
                      <div className="text-lg font-bold">+£{option.costIncrease.toLocaleString()}</div>
                      <Button size="sm" className="mt-2">
                        Upgrade
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* ROI Highlight */}
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="font-semibold text-green-700">ROI Insight</span>
              </div>
              <p className="text-sm text-green-700">
                Upgrading gives you {((selectedLocations / currentCapacity) * 100 - 100).toFixed(0)}% more location coverage 
                for typically 15-25% additional cost - excellent value for maximum market penetration.
              </p>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Keep Current Selection
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