import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuotes } from '@/hooks/useQuotes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Plus, Trash2, MapPin, Calendar, Package, User, Lock, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { QuoteSubmissionForm } from '@/components/QuoteSubmissionForm';
import { inchargePeriods } from '@/data/inchargePeriods';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { formatCurrency } from '@/utils/money';
import { countPrintRuns } from '@/utils/periods';
import { enrichQuoteItem, groupByFormat, type QuoteItem } from '@/utils/quote';

export default function QuotePlan() {
  const { currentQuote, loading, removeQuoteItem, fetchCurrentQuote, recalculateDiscounts } = useQuotes();
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    fetchCurrentQuote();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setUserProfile(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
    } else {
      setUserProfile(data);
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Error signing out');
    } else {
      toast.success('Signed out successfully');
    }
  };


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
          
          {/* Auth Section */}
          {user ? (
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-full">
                    <User className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm text-green-800">
                      Welcome, {userProfile?.full_name || user.email}
                    </h3>
                    <p className="text-xs text-green-700">
                      {userProfile?.role === 'client' ? 'Access your client portal' : 'You are signed in'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {userProfile?.role === 'client' && (
                      <Button asChild size="sm" variant="outline" className="border-green-300 text-green-700 hover:bg-green-100">
                        <Link to="/client-portal">
                          Client Portal
                        </Link>
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={handleSignOut}
                      className="text-green-700 hover:bg-green-100"
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-gradient-to-r from-primary/10 to-blue-50 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">Access Client Portal</h3>
                    <p className="text-xs text-foreground/80">Sign in to submit quotes and manage campaigns</p>
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
          )}
        </div>

        {/* Campaign KPIs */}
        {(() => {
          const planItems: QuoteItem[] = currentQuote.quote_items?.map(item => ({
            formatName: item.format_name,
            sites: item.quantity,
            selectedPeriods: item.selected_periods,
            saleRate: item.base_cost / item.selected_periods.length / item.quantity,
            productionCost: item.production_cost || 0,
            creativeCost: item.creative_cost || 0,
          })) || [];

          const enrichedItems = planItems.map(enrichQuoteItem);
          const totalSites = enrichedItems.reduce((acc, it) => acc + it.sites, 0);
          const totalUniquePeriods = new Set(enrichedItems.flatMap(it => it.selectedPeriods)).size;
          const totalIncharges = enrichedItems.reduce((acc, it) => acc + it.incharges, 0);

          return (
            <div className="bg-gradient-to-r from-primary/5 to-blue-50 p-6 rounded-lg border mb-8">
              <h2 className="text-xl font-semibold mb-4 text-primary">Campaign Summary</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{new Set(enrichedItems.map(it => it.formatName)).size}</div>
                  <div className="text-sm text-muted-foreground">Format{new Set(enrichedItems.map(it => it.formatName)).size !== 1 ? 's' : ''} Selected</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{totalSites}</div>
                  <div className="text-sm text-muted-foreground">Total Sites</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{totalUniquePeriods}</div>
                  <div className="text-sm text-muted-foreground">Campaign Period{totalUniquePeriods !== 1 ? 's' : ''}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{totalIncharges}</div>
                  <div className="text-sm text-muted-foreground">Total In-charges</div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Format Breakdown Cards */}
        {(() => {
          const planItems: QuoteItem[] = currentQuote.quote_items?.map(item => ({
            formatName: item.format_name,
            sites: item.quantity,
            selectedPeriods: item.selected_periods,
            saleRate: item.base_cost / item.selected_periods.length / item.quantity,
            productionCost: item.production_cost || 0,
            creativeCost: item.creative_cost || 0,
          })) || [];

          const formatGroups = groupByFormat(planItems.map(enrichQuoteItem));

          return (
            <div className="space-y-4 mb-8">
              <h2 className="text-xl font-semibold">Format Breakdown</h2>
              {formatGroups.map(group => (
                <Card key={group.formatName} className="border-l-4 border-l-primary">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{group.formatName}</CardTitle>
                        <CardDescription>
                          {group.sites} sites • {group.uniquePeriods} periods • {group.incharges} in-charges
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">Sale rate (per in-charge): {formatCurrency(group.saleRate)}</div>
                        <div className="text-sm text-muted-foreground">≈ {group.share.toFixed(0)}% of campaign</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span>Media cost at sale rate:</span>
                      <span className="font-medium">{formatCurrency(group.mediaCost)}</span>
                    </div>

                    {group.volumeDiscount > 0 && (
                      <div className="bg-green-50 p-3 rounded-lg space-y-1">
                        <div className="flex justify-between text-green-700">
                          <span>💰 Volume discount (10% for 3+ in-charge periods):</span>
                          <span className="font-medium">−{formatCurrency(group.volumeDiscount)}</span>
                        </div>
                        <div className="text-xs text-green-600">
                          That's −{formatCurrency(group.volumeDiscount / group.incharges)} per unit per period ({group.incharges} in-charges).
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span>Media cost after discount:</span>
                      <span className="font-medium">{formatCurrency(group.mediaAfterDiscount)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Total Production Cost:</span>
                      <span className="font-medium">{formatCurrency(group.productionCost)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Total Creative Cost:</span>
                      <span className="font-medium">{formatCurrency(group.creativeCost)}</span>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between text-lg font-bold text-primary">
                      <span>Format subtotal (exc VAT):</span>
                      <span>{formatCurrency(group.subtotal)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          );
        })()}

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
                        
                        {/* Detailed Cost Breakdown */}
                        <div className="bg-muted/30 p-4 rounded-lg mb-4">
                          <h4 className="font-semibold mb-3 text-primary">Estimated Campaign Costs</h4>
                          
                          {/* Base Rate and Sale Price */}
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="space-y-2">
                              {(() => {
                                const baseRatePerPeriod = item.original_cost ? (item.original_cost / item.selected_periods.length / item.quantity) : (item.base_cost / item.selected_periods.length / item.quantity);
                                const saleRatePerPeriod = item.base_cost / item.selected_periods.length / item.quantity;
                                const isOnSale = baseRatePerPeriod !== saleRatePerPeriod;
                                
                                return (
                                  <>
                                    <div className="flex justify-between text-sm">
                                      <span>Base Rate per Incharge:</span>
                                      <span className={isOnSale ? "line-through text-muted-foreground" : "font-medium"}>{formatCurrency(baseRatePerPeriod)}</span>
                                    </div>
                                    {isOnSale && (
                                      <>
                                        <div className="flex justify-between text-sm text-green-600 font-medium">
                                          <span>⚡ Special Offer:</span>
                                          <span className="bg-green-100 px-2 py-1 rounded text-xs">Sale Price Applied</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-green-600 font-medium">
                                          <span>Sale Price per Incharge:</span>
                                          <span>{formatCurrency(saleRatePerPeriod)}</span>
                                        </div>
                                        <div className="flex justify-between text-xs text-green-700 bg-green-50 px-2 py-1 rounded">
                                          <span>You Save:</span>
                                          <span className="font-semibold">{formatCurrency(baseRatePerPeriod - saleRatePerPeriod)} per Incharge</span>
                                        </div>
                                      </>
                                    )}
                                     {item.discount_percentage > 0 && (
                                       <div className="flex justify-between text-xs text-green-600">
                                         <span>💰 Volume discount (10% for 3+ in-charge periods):</span>
                                         <span>−{formatCurrency(item.discount_amount || 0)}</span>
                                       </div>
                                     )}
                                  </>
                                );
                              })()}
                            </div>
                             <div className="space-y-2">
                               <div className="text-sm text-muted-foreground">
                                 <div className="flex justify-between">
                                   <span>Campaign Cost ({item.quantity} × {item.selected_periods.length} period{item.selected_periods.length !== 1 ? 's' : ''}):</span>
                                   <span className="font-medium text-foreground">{formatCurrency(item.base_cost)}</span>
                                 </div>
                                 <div className="flex justify-between">
                                   <span>Production Cost ({item.quantity} unit{item.quantity !== 1 ? 's' : ''}):</span>
                                   <span className="font-medium text-foreground">{formatCurrency(item.production_cost || 0)}</span>
                                 </div>
                                 {item.creative_cost > 0 && (
                                   <div className="flex justify-between">
                                     <span>Creative Assets:</span>
                                     <span className="font-medium text-foreground">{formatCurrency(item.creative_cost)}</span>
                                   </div>
                                 )}
                               </div>
                             </div>
                          </div>

                           {/* Subtotal and VAT */}
                           <div className="border-t pt-3 space-y-2">
                             {(() => {
                                const subtotalExcVat = (item.base_cost + (item.production_cost || 0) + (item.creative_cost || 0));
                                const vatAmount = subtotalExcVat * 0.2;
                               
                               return (
                                 <>
                                   <div className="flex justify-between font-medium">
                                     <span>Subtotal (exc VAT):</span>
                                     <span>{formatCurrency(subtotalExcVat)}</span>
                                   </div>
                                   <div className="flex justify-between text-sm text-muted-foreground">
                                     <span>VAT (20%):</span>
                                     <span>{formatCurrency(vatAmount)}</span>
                                   </div>
                                   <div className="flex justify-between text-lg font-bold text-primary border-t pt-2">
                                     <span>Total inc VAT:</span>
                                     <span>{formatCurrency(subtotalExcVat + vatAmount)}</span>
                                   </div>
                                 </>
                               );
                             })()}
                           </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{item.selected_areas.length} location{item.selected_areas.length !== 1 ? 's' : ''}</span>
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
                          {item.selected_periods.length > 1 && countPrintRuns(item.selected_periods) > 1 && (
                            <p className="text-xs text-amber-600 mt-2">
                              Note: Non-consecutive in-charge periods will require additional print runs. This affects production costs only and does not change your media rate.
                            </p>
                          )}
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
                <div className="space-y-3">
                  {currentQuote.quote_items?.map((item, index) => (
                    <div key={item.id || index} className="space-y-1">
                       <div className="flex justify-between text-sm">
                         <span>{item.format_name} (×{item.quantity})</span>
                         <span>{(() => {
                            const subtotalExcVat = (item.base_cost + (item.production_cost || 0) + (item.creative_cost || 0));
                            const correctedTotal = subtotalExcVat * 1.2; // Add 20% VAT
                           return formatCurrency(correctedTotal);
                         })()}</span>
                       </div>
                      
                      {/* Show discount breakdown if discount exists */}
                      {item.discount_percentage && item.discount_percentage > 0 && (
                        <div className="ml-4 space-y-1 text-xs text-muted-foreground border-l-2 border-green-200 pl-2">
                          <div className="flex justify-between">
                            <span>Original cost:</span>
                            <span>{formatCurrency(item.original_cost || item.base_cost + item.production_cost + item.creative_cost)}</span>
                          </div>
                          <div className="flex justify-between text-green-600">
                            <span>Volume discount ({item.discount_percentage}%):</span>
                            <span>-{formatCurrency(item.discount_amount || 0)}</span>
                          </div>
                          <div className="flex justify-between font-medium">
                            <span>After discount:</span>
                            <span>{formatCurrency(item.total_cost)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  <Separator />
                  
                  {/* Overall Campaign Breakdown */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-lg">Campaign Cost Breakdown</h4>
                    
                     {/* Calculate totals */}
                     {(() => {
                       const totalBaseCost = currentQuote.quote_items?.reduce((sum, item) => sum + (item.base_cost || 0), 0) || 0;
                       const totalProductionCost = currentQuote.quote_items?.reduce((sum, item) => sum + (item.production_cost || 0), 0) || 0;
                       const totalCreativeCost = currentQuote.quote_items?.reduce((sum, item) => sum + (item.creative_cost || 0), 0) || 0;
                       const totalDiscountAmount = currentQuote.quote_items?.reduce((sum, item) => sum + (item.discount_amount || 0), 0) || 0;
                       const totalSaleDiscount = currentQuote.quote_items?.reduce((sum, item) => {
                         const originalCost = item.original_cost || 0;
                         const baseCost = item.base_cost || 0;
                         return sum + Math.max(0, originalCost - baseCost);
                       }, 0) || 0;
                       
                       return (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Base Campaign Cost:</span>
                            <span>{formatCurrency(totalBaseCost)}</span>
                          </div>
                          
                          {totalSaleDiscount > 0 && (
                            <div className="flex justify-between text-sm text-orange-600">
                              <span>Sale Price Savings:</span>
                              <span>-{formatCurrency(totalSaleDiscount)}</span>
                            </div>
                          )}
                          
                           <div className="flex justify-between text-sm">
                             <span>Production Costs:</span>
                             <span>{formatCurrency(totalProductionCost)}</span>
                           </div>
                           
                           
                           <div className="flex justify-between text-sm">
                             <span>Creative Costs:</span>
                             <span>{formatCurrency(totalCreativeCost)}</span>
                           </div>
                          
                          {totalDiscountAmount > 0 && (
                            <div className="flex justify-between text-sm text-green-600">
                              <span>Volume Discount:</span>
                              <span>-{formatCurrency(totalDiscountAmount)}</span>
                            </div>
                          )}
                          
                          <Separator />
                          
                           <div className="flex justify-between text-sm font-medium">
                             <span>Subtotal (exc VAT):</span>
                             <span>{formatCurrency((totalBaseCost + totalProductionCost + totalCreativeCost - totalDiscountAmount))}</span>
                           </div>
                           
                           <div className="flex justify-between text-sm">
                             <span>VAT (20%):</span>
                             <span>{formatCurrency((totalBaseCost + totalProductionCost + totalCreativeCost - totalDiscountAmount) * 0.2)}</span>
                           </div>
                        </div>
                      );
                    })()}
                  </div>
                  
                  {/* Volume discount summary if applicable */}
                  {currentQuote.quote_items?.some(item => item.discount_percentage && item.discount_percentage > 0) && (
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="text-sm font-medium text-green-800 mb-1">
                        🎉 Volume Discount Applied!
                      </div>
                      <div className="text-xs text-green-700">
                        Total periods: {currentQuote.quote_items?.reduce((sum, item) => sum + item.selected_periods.length, 0)} periods
                        {currentQuote.quote_items?.reduce((sum, item) => sum + item.selected_periods.length, 0) >= 4 && (
                          <span className="ml-1">(4+ periods qualifies for bulk pricing)</span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <Separator />
                   <div className="flex justify-between font-bold text-xl text-primary">
                     <span>Total Campaign Cost</span>
                     <span>{(() => {
                       const totalBaseCost = currentQuote.quote_items?.reduce((sum, item) => sum + (item.base_cost || 0), 0) || 0;
                       const totalProductionCost = currentQuote.quote_items?.reduce((sum, item) => sum + (item.production_cost || 0), 0) || 0;
                       const totalCreativeCost = currentQuote.quote_items?.reduce((sum, item) => sum + (item.creative_cost || 0), 0) || 0;
                       const totalDiscountAmount = currentQuote.quote_items?.reduce((sum, item) => sum + (item.discount_amount || 0), 0) || 0;
                        
                        const subtotalExcVat = totalBaseCost + totalProductionCost + totalCreativeCost - totalDiscountAmount;
                        const finalTotal = subtotalExcVat * 1.2; // Add 20% VAT
                       
                       return formatCurrency(finalTotal);
                     })()}</span>
                   </div>
                  <div className="text-xs text-muted-foreground text-center">
                    All prices include VAT
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