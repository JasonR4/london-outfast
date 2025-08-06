import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuotes } from '@/hooks/useQuotes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Plus, Trash2, MapPin, Calendar, Package, User, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { QuoteSubmissionForm } from '@/components/QuoteSubmissionForm';
import { inchargePeriods } from '@/data/inchargePeriods';

export default function QuotePlan() {
  const { currentQuote, loading, removeQuoteItem, fetchCurrentQuote, recalculateDiscounts } = useQuotes();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCurrentQuote();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your plan...</p>
        </div>
      </div>
    );
  }

  if (!currentQuote || !currentQuote.quote_items?.length) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">No Plan Yet</h1>
          <p className="text-muted-foreground mb-6">
            You haven't added any formats to your plan yet. Browse our outdoor media formats to get started.
          </p>
          <Button asChild>
            <Link to="/outdoor-media">Browse Formats</Link>
          </Button>
        </div>
      </div>
    );
  }

  const handleRemoveItem = async (itemId: string) => {
    if (await removeQuoteItem(itemId)) {
      toast.success('Format removed from your plan');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Your Campaign Plan</h1>
              <p className="text-muted-foreground">
                Review and submit your outdoor media campaign
              </p>
            </div>
          </div>
          
          {/* Login Button */}
          <Card className="bg-gradient-to-r from-primary/10 to-blue-50 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">Save Your Campaign</h3>
                  <p className="text-xs text-muted-foreground">Login to save and manage your campaigns</p>
                </div>
                <Button asChild size="sm" className="bg-primary hover:bg-primary/90">
                  <Link to="/auth">
                    <Lock className="h-4 w-4 mr-1" />
                    Login
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Plan Items */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Selected Formats</CardTitle>
                      <CardDescription>
                        {currentQuote.quote_items?.length} format{currentQuote.quote_items?.length !== 1 ? 's' : ''} in your campaign
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={async () => {
                        await recalculateDiscounts?.();
                        toast.success('Discounts recalculated!');
                      }}>
                        Refresh Discounts
                      </Button>
                      <Button asChild variant="outline">
                        <Link to="/outdoor-media">
                          <Plus className="h-4 w-4 mr-2" />
                          Add More
                        </Link>
                      </Button>
                    </div>
                  </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentQuote.quote_items?.map((item, index) => (
                  <div key={item.id || index}>
                    <div className="flex items-start justify-between p-4 rounded-lg border">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{item.format_name}</h3>
                          <Badge variant="secondary">Qty: {item.quantity}</Badge>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{item.selected_areas.length} location{item.selected_areas.length !== 1 ? 's' : ''}</span>
                          </div>
                          <div className="font-semibold text-foreground">
                            {formatCurrency(item.total_cost)}
                          </div>
                        </div>

                        {/* Campaign Periods */}
                        <div className="mt-3">
                          <div className="flex items-center gap-1 mb-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Campaign Periods:</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {item.selected_periods.map((periodNum) => {
                              const period = inchargePeriods.find(p => p.period_number === periodNum);
                              return period ? (
                                <Badge key={periodNum} variant="outline" className="text-xs">
                                  {period.label}
                                </Badge>
                              ) : (
                                <Badge key={periodNum} variant="outline" className="text-xs">
                                  Period {periodNum}
                                </Badge>
                              );
                            })}
                          </div>
                        </div>

                        {(item.campaign_start_date || item.campaign_end_date) && (
                          <div className="mt-2">
                            <p className="text-sm font-medium mb-1">Campaign Dates:</p>
                            <div className="text-sm text-muted-foreground">
                              {item.campaign_start_date && item.campaign_end_date ? (
                                `${new Date(item.campaign_start_date).toLocaleDateString('en-GB', { 
                                  day: 'numeric', 
                                  month: 'short', 
                                  year: 'numeric' 
                                })} - ${new Date(item.campaign_end_date).toLocaleDateString('en-GB', { 
                                  day: 'numeric', 
                                  month: 'short', 
                                  year: 'numeric' 
                                })}`
                              ) : item.campaign_start_date ? (
                                `From ${new Date(item.campaign_start_date).toLocaleDateString('en-GB', { 
                                  day: 'numeric', 
                                  month: 'short', 
                                  year: 'numeric' 
                                })}`
                              ) : item.campaign_end_date ? (
                                `Until ${new Date(item.campaign_end_date).toLocaleDateString('en-GB', { 
                                  day: 'numeric', 
                                  month: 'short', 
                                  year: 'numeric' 
                                })}`
                              ) : ''}
                            </div>
                          </div>
                        )}

                        {item.selected_areas.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm font-medium mb-1">Locations:</p>
                            <div className="flex flex-wrap gap-1">
                              {item.selected_areas.slice(0, 3).map((area, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {area}
                                </Badge>
                              ))}
                              {item.selected_areas.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{item.selected_areas.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                        {item.creative_needs && (
                          <div className="mt-2">
                            <p className="text-sm font-medium">Creative needs:</p>
                            <p className="text-sm text-muted-foreground">{item.creative_needs}</p>
                          </div>
                        )}
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => item.id && handleRemoveItem(item.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    {index < (currentQuote.quote_items?.length || 0) - 1 && <Separator className="my-4" />}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Cost Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Cost Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {currentQuote.quote_items?.map((item, index) => (
                    <div key={item.id || index} className="flex justify-between text-sm">
                      <span>{item.format_name} (×{item.quantity})</span>
                      <span>{formatCurrency(item.total_cost)}</span>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total Campaign Cost</span>
                    <span>{formatCurrency(currentQuote.total_cost)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Submission Form */}
          <div className="lg:col-span-1">
            <QuoteSubmissionForm quote={currentQuote} />
          </div>
        </div>
      </div>
    </div>
  );
}