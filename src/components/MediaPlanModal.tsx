import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { GeneratedMediaPlan } from '@/services/MediaPlanGenerator';
import { formatCurrencyWithVAT } from '@/utils/vat';
import { MapPin, Calendar, Target, Users, TrendingUp, CheckCircle } from 'lucide-react';

interface MediaPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitPlan: () => void;
  mediaPlan: GeneratedMediaPlan | null;
  isSubmitting?: boolean;
}

export const MediaPlanModal = ({ 
  isOpen, 
  onClose, 
  onSubmitPlan, 
  mediaPlan, 
  isSubmitting = false 
}: MediaPlanModalProps) => {
  if (!mediaPlan) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Your Personalized <span className="bg-gradient-hero bg-clip-text text-transparent">Media Plan</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Campaign Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Campaign Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Objective</p>
                  <p className="font-medium">{mediaPlan.campaignObjective}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Target Audience</p>
                  <p className="font-medium">{mediaPlan.targetAudience}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Start Date</p>
                  <p className="font-medium">{mediaPlan.startDate || 'TBC'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">End Date</p>
                  <p className="font-medium">{mediaPlan.endDate || 'TBC'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Campaign Duration</p>
                  <p className="font-medium">{mediaPlan.campaignDuration}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estimated Reach</p>
                  <p className="font-medium">{mediaPlan.estimatedReach}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Budget Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Budget Allocation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium">Total Budget</span>
                  <span className="text-lg font-bold text-primary">
                    {formatCurrencyWithVAT(mediaPlan.totalBudget)}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div 
                    className="bg-gradient-hero h-3 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${(mediaPlan.totalAllocatedBudget / mediaPlan.totalBudget) * 100}%` 
                    }}
                  />
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Allocated: {formatCurrencyWithVAT(mediaPlan.totalAllocatedBudget)}</span>
                  <span>Remaining: {formatCurrencyWithVAT(mediaPlan.remainingBudget)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommended Media Formats */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Recommended Media Mix</h3>
            {mediaPlan.items.map((item, index) => (
              <Card key={index} className="border-l-4 border-l-primary">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{item.formatName}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary">{item.budgetAllocation.toFixed(0)}% of budget</Badge>
                        <Badge variant="outline">{item.recommendedQuantity} units</Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">
                        {formatCurrencyWithVAT(item.totalCost)}
                      </p>
                      <p className="text-sm text-muted-foreground">+VAT</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Target Areas</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {item.selectedAreas.map((area, areaIndex) => (
                          <Badge key={areaIndex} variant="outline" className="text-xs">
                            {area}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Campaign Periods</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {item.selectedPeriods.map((period, periodIndex) => (
                          <Badge key={periodIndex} variant="outline" className="text-xs">
                            Period {period}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div>
                    <h4 className="text-sm font-medium mb-2">Why this format?</h4>
                    <ul className="space-y-1">
                      {item.reasonForRecommendation.map((reason, reasonIndex) => (
                        <li key={reasonIndex} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Separator className="my-4" />

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Media Cost</p>
                      <p className="font-medium">{formatCurrencyWithVAT(item.baseCost)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Production</p>
                      <p className="font-medium">{formatCurrencyWithVAT(item.productionCost)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Creative</p>
                      <p className="font-medium">{formatCurrencyWithVAT(item.creativeCost)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onClose}>
              Modify Plan
            </Button>
            <Button 
              onClick={onSubmitPlan}
              disabled={isSubmitting}
              className="bg-gradient-hero hover:opacity-90"
            >
              {isSubmitting ? 'Submitting...' : 'Submit This Plan'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};