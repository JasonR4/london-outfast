import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { GeneratedMediaPlan } from '@/services/MediaPlanGenerator';
import { formatCurrency } from '@/utils/money';
import { MapPin, Calendar, Target, Users, TrendingUp, CheckCircle } from 'lucide-react';
import { formatGBP, uniquePeriodsCount, countPrintRuns } from '@/lib/pricingMath';
import SubmitGate from '@/components/SubmitGate';

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
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-lg font-medium">
                    <span>Total Budget Breakdown</span>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    {(() => {
                      // Period-based roll-up across items
                      const rollup = mediaPlan.items.reduce(
                        (acc: { media: number; production: number; creative: number; discount: number }, it: any) => {
                          const pCount = uniquePeriodsCount(it?.selectedPeriods ?? []);
                          const base = Number(it?.baseCost ?? 0);
                          acc.media += base;
                          acc.production += Number(it?.productionCost ?? 0);
                          acc.creative += Number(it?.creativeCost ?? 0);
                          if (pCount >= 3 && base > 0) acc.discount += base * 0.10;
                          return acc;
                        },
                        { media: 0, production: 0, creative: 0, discount: 0 }
                      );
                      return (
                        <>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Media Costs:</span>
                            <span>{formatGBP(rollup.media)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Production Costs:</span>
                            <span>{formatGBP(rollup.production)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Creative Development:</span>
                            <span>{formatGBP(rollup.creative)}</span>
                          </div>
                          {rollup.discount > 0 && (
                            <div className="flex justify-between text-emerald-400">
                              <span>💰 Volume discount (10% for 3+ in-charge periods)</span>
                              <span>-{formatGBP(rollup.discount)}</span>
                            </div>
                          )}
                        </>
                      );
                    })()}
                    
                    {(() => {
                      // Totals with period-based discount roll-up
                      const rollup = mediaPlan.items.reduce(
                        (acc: { media: number; production: number; creative: number; discount: number }, it: any) => {
                          const pCount = uniquePeriodsCount(it?.selectedPeriods ?? []);
                          const base = Number(it?.baseCost ?? 0);
                          acc.media += base;
                          acc.production += Number(it?.productionCost ?? 0);
                          acc.creative += Number(it?.creativeCost ?? 0);
                          if (pCount >= 3 && base > 0) acc.discount += base * 0.10;
                          return acc;
                        },
                        { media: 0, production: 0, creative: 0, discount: 0 }
                      );
                      const subtotalExVat = rollup.media - rollup.discount + rollup.production + rollup.creative;
                      const vatAmount = subtotalExVat * 0.2;
                      const totalIncVat = subtotalExVat + vatAmount;
                      return (
                        <>
                          <div className="flex justify-between font-medium pt-2 border-t border-border/50">
                            <span>Subtotal (exc VAT):</span>
                            <span>{formatGBP(subtotalExVat)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">VAT (20%):</span>
                            <span>{formatGBP(vatAmount)}</span>
                          </div>
                          <div className="flex justify-between text-lg font-bold text-primary pt-2 border-t border-border/50">
                            <span>Total inc VAT:</span>
                            <span>{formatGBP(totalIncVat)}</span>
                          </div>
                          {rollup.discount > 0 && (
                            <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                              <div className="text-sm text-green-700 dark:text-green-300 font-medium">
                                🎉 Volume discounts applied! Total savings: {formatGBP(rollup.discount * 1.2)} inc VAT
                              </div>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                  
                  <div className="w-full bg-muted rounded-full h-3 mt-4">
                    <div 
                      className="bg-gradient-hero h-3 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${(mediaPlan.totalAllocatedBudget / mediaPlan.totalBudget) * 100}%` 
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Allocated: {formatCurrency(mediaPlan.totalAllocatedBudget)}</span>
                    <span>Remaining: {formatCurrency(mediaPlan.remainingBudget)}</span>
                  </div>
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
                        {(() => {
                          // Percent-of-plan: after-discount media + production + creative (ex VAT)
                          const totals = mediaPlan.items.map((it) => {
                            const pCount = uniquePeriodsCount(it.selectedPeriods || []);
                            const base = Number(it.baseCost || 0);
                            const discount = pCount >= 3 && base > 0 ? base * 0.10 : 0;
                            const mediaAfter = base - discount;
                            const production = Number(it.productionCost || 0);
                            const creative = Number(it.creativeCost || 0);
                            return { subtotal: mediaAfter + production + creative, mediaBefore: base };
                          });
                          const planEx = totals.reduce((s, t) => s + t.subtotal, 0) || 1;
                          const myP = uniquePeriodsCount(item.selectedPeriods || []);
                          const myBase = Number(item.baseCost || 0);
                          const myDiscount = myP >= 3 && myBase > 0 ? myBase * 0.10 : 0;
                          const myAfter = myBase - myDiscount;
                          const myProduction = Number(item.productionCost || 0);
                          const myCreative = Number(item.creativeCost || 0);
                          const mySubtotal = myAfter + myProduction + myCreative;
                          const shareOfPlan = mySubtotal / planEx;
                          const mediaShareBefore = myBase / planEx;
                          return (
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary">{`${(shareOfPlan * 100).toFixed(0)}% of plan`}</Badge>
                                <Badge variant="outline">{item.recommendedQuantity} units</Badge>
                              </div>
                              <div className="text-[10px] text-muted-foreground">
                                Media share (before discount): {(mediaShareBefore * 100).toFixed(0)}%
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                    <div className="text-right">
                    <p className="text-lg font-bold text-primary">
                      {formatCurrency(item.baseCost + item.productionCost + item.creativeCost)}
                    </p>
                    <p className="text-sm text-muted-foreground">exc VAT</p>
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
                      {item.selectedPeriods.length > 1 && countPrintRuns(item.selectedPeriods) > 1 && (
                        <div className="mt-1 text-xs opacity-70">
                          Non-consecutive periods = {countPrintRuns(item.selectedPeriods)} print runs (production only).
                        </div>
                      )}
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

                  <div className="space-y-1 text-sm mb-2">
                    {(() => {
                      const pCount = uniquePeriodsCount(item.selectedPeriods);
                      const sites = item.recommendedQuantity || 0;
                      const rate = sites && pCount ? item.baseCost / (sites * pCount) : 0;
                      const showDiscount = pCount >= 3 && item.baseCost > 0;
                      const discount = showDiscount ? item.baseCost * 0.10 : 0;
                      const after = item.baseCost - discount;
                      return (
                        <>
                          <div className="flex justify-between"><span className="text-muted-foreground">Media rate (per in-charge)</span><span>{formatGBP(rate)}</span></div>
                          <div className="flex justify-between"><span className="text-muted-foreground">Media (before discount)</span><span>{formatGBP(item.baseCost)}</span></div>
                          {showDiscount && (
                            <div className="flex justify-between text-emerald-400"><span>💰 Volume discount (10% for 3+ in-charge periods)</span><span>-{formatGBP(discount)}</span></div>
                          )}
                          <div className="flex justify-between"><span className="text-muted-foreground">Media (after discount)</span><span>{formatGBP(after)}</span></div>
                        </>
                      );
                    })()}
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Media (after discount)</p>
                      <p className="font-medium">{(() => { const pCount = uniquePeriodsCount(item.selectedPeriods); const discount = pCount >= 3 ? item.baseCost * 0.10 : 0; return formatGBP(item.baseCost - discount); })()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Production</p>
                      <p className="font-medium">{formatCurrency(item.productionCost)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Creative</p>
                      <p className="font-medium">{formatCurrency(item.creativeCost)}</p>
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
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Signal the configurator to open the submit gate, then close the modal
                try { window.location.hash = '#submit-gate'; } catch {}
                window.dispatchEvent(new Event('reveal-submit-gate'));
                onClose();
              }}
              className="bg-gradient-hero hover:opacity-90 pointer-events-auto"
            >
              Submit This Plan
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};