import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  CheckCircle, 
  Clock, 
  Save,
  FileText,
  MapPin,
  Calendar
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatCurrency } from '@/utils/money';

export function QuoteConfirmationManager() {
  const [searchQuoteId, setSearchQuoteId] = useState('');
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [confirmedDetails, setConfirmedDetails] = useState<any>({
    campaign_overview: '',
    delivery_schedule: '',
    reporting_schedule: '',
    creative_deadlines: '',
    items: []
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const searchQuote = async () => {
    if (!searchQuoteId.trim()) {
      toast.error('Please enter a quote ID');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('quotes')
        .select(`
          *,
          quote_items (*)
        `)
        .eq('id', searchQuoteId.trim())
        .eq('status', 'submitted')
        .maybeSingle();

      if (error) {
        if (error.code === 'PGRST116') {
          toast.error('Quote not found or not in submitted status');
        } else {
          throw error;
        }
        return;
      }

      setQuote(data);
      // Initialize confirmed details with empty structure for each item
      const existingDetails = data.confirmed_details as any || {};
      setConfirmedDetails({
        campaign_overview: existingDetails.campaign_overview || '',
        delivery_schedule: existingDetails.delivery_schedule || '',
        reporting_schedule: existingDetails.reporting_schedule || '',
        creative_deadlines: existingDetails.creative_deadlines || '',
        items: data.quote_items.map((item: any, index: number) => ({
          specific_locations: existingDetails.items?.[index]?.specific_locations || '',
          posting_dates: existingDetails.items?.[index]?.posting_dates || '',
          special_requirements: existingDetails.items?.[index]?.special_requirements || ''
        }))
      });

      toast.success('Quote loaded successfully');
    } catch (error) {
      console.error('Error searching quote:', error);
      toast.error('Failed to load quote');
    } finally {
      setLoading(false);
    }
  };

  const updateConfirmedDetails = (field: string, value: string) => {
    setConfirmedDetails((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const updateItemDetails = (itemIndex: number, field: string, value: string) => {
    setConfirmedDetails((prev: any) => ({
      ...prev,
      items: prev.items.map((item: any, index: number) => 
        index === itemIndex ? { ...item, [field]: value } : item
      )
    }));
  };

  const confirmQuote = async () => {
    if (!quote) return;

    setConfirming(true);
    try {
      const { error } = await supabase
        .from('quotes')
        .update({
          status: 'confirmed',
          confirmed_at: new Date().toISOString(),
          confirmed_details: confirmedDetails
        })
        .eq('id', quote.id);

      if (error) throw error;

      toast.success('Quote confirmed successfully! Customer will be notified.');
      setQuote({ ...quote, status: 'confirmed', confirmed_details: confirmedDetails });
    } catch (error) {
      console.error('Error confirming quote:', error);
      toast.error('Failed to confirm quote');
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Quote Confirmation Manager</CardTitle>
          <CardDescription>
            Search for submitted quotes by ID and add confirmed media schedule details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="quote-search">Quote ID</Label>
              <Input
                id="quote-search"
                value={searchQuoteId}
                onChange={(e) => setSearchQuoteId(e.target.value)}
                placeholder="Enter full quote ID (e.g., 123e4567-e89b-12d3-a456-426614174000)"
                className="mt-1"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={searchQuote} disabled={loading}>
                <Search className="h-4 w-4 mr-2" />
                {loading ? 'Searching...' : 'Search Quote'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {quote && (
        <>
          {/* Quote Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Quote #{quote.id.slice(0, 8)}
                  </CardTitle>
                  <CardDescription>
                    Submitted on {formatDate(quote.created_at)}
                  </CardDescription>
                </div>
                <Badge variant={quote.status === 'confirmed' ? 'default' : 'secondary'}>
                  {quote.status === 'confirmed' ? 'Confirmed' : 'Awaiting Confirmation'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <span className="font-medium">Customer:</span>
                    <span className="ml-2">{quote.contact_name}</span>
                  </div>
                  <div>
                    <span className="font-medium">Email:</span>
                    <span className="ml-2">{quote.contact_email}</span>
                  </div>
                  {quote.contact_company && (
                    <div>
                      <span className="font-medium">Company:</span>
                      <span className="ml-2">{quote.contact_company}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-end">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      {formatCurrency(quote.total_cost)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Quote Value</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quote Items */}
          <Card>
            <CardHeader>
              <CardTitle>Quote Items</CardTitle>
              <CardDescription>
                Original quote details and add specific confirmed information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {quote.quote_items?.map((item: any, index: number) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-lg">{item.format_name}</h4>
                      <div className="font-semibold text-primary">
                        {formatCurrency(item.total_cost)}
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <h5 className="font-medium text-muted-foreground">Original Details:</h5>
                        <div className="text-sm space-y-1">
                          <div><span className="font-medium">Quantity:</span> {item.quantity} units</div>
                          <div><span className="font-medium">Areas:</span> {item.selected_areas.join(', ')}</div>
                          <div><span className="font-medium">Periods:</span> {item.selected_periods.length} periods</div>
                          {item.creative_needs && (
                            <div><span className="font-medium">Creative:</span> {item.creative_needs}</div>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <h5 className="font-medium text-primary">Confirmed Details:</h5>
                        <div>
                          <Label htmlFor={`specific-locations-${index}`}>Specific Locations</Label>
                          <Input
                            id={`specific-locations-${index}`}
                            value={confirmedDetails.items[index]?.specific_locations || ''}
                            onChange={(e) => updateItemDetails(index, 'specific_locations', e.target.value)}
                            placeholder="Exact addresses, site numbers, etc."
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`posting-dates-${index}`}>Posting Dates</Label>
                          <Input
                            id={`posting-dates-${index}`}
                            value={confirmedDetails.items[index]?.posting_dates || ''}
                            onChange={(e) => updateItemDetails(index, 'posting_dates', e.target.value)}
                            placeholder="Exact posting schedule"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`special-requirements-${index}`}>Special Requirements</Label>
                          <Textarea
                            id={`special-requirements-${index}`}
                            value={confirmedDetails.items[index]?.special_requirements || ''}
                            onChange={(e) => updateItemDetails(index, 'special_requirements', e.target.value)}
                            placeholder="Any special installation, creative, or timing requirements"
                            rows={2}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Campaign Details */}
          <Card>
            <CardHeader>
              <CardTitle>Campaign Schedule & Details</CardTitle>
              <CardDescription>
                Add comprehensive campaign information for the customer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="campaign-overview">Campaign Overview</Label>
                    <Textarea
                      id="campaign-overview"
                      value={confirmedDetails.campaign_overview}
                      onChange={(e) => updateConfirmedDetails('campaign_overview', e.target.value)}
                      placeholder="Brief overview of the confirmed campaign strategy and objectives"
                      rows={3}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="delivery-schedule">Delivery Schedule</Label>
                    <Textarea
                      id="delivery-schedule"
                      value={confirmedDetails.delivery_schedule}
                      onChange={(e) => updateConfirmedDetails('delivery_schedule', e.target.value)}
                      placeholder="When and how campaign elements will be delivered"
                      rows={2}
                      className="mt-1"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="reporting-schedule">Reporting Schedule</Label>
                    <Textarea
                      id="reporting-schedule"
                      value={confirmedDetails.reporting_schedule}
                      onChange={(e) => updateConfirmedDetails('reporting_schedule', e.target.value)}
                      placeholder="When reports and updates will be provided"
                      rows={2}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="creative-deadlines">Creative Deadlines</Label>
                    <Textarea
                      id="creative-deadlines"
                      value={confirmedDetails.creative_deadlines}
                      onChange={(e) => updateConfirmedDetails('creative_deadlines', e.target.value)}
                      placeholder="When creative assets need to be submitted"
                      rows={3}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Requirements */}
          {quote.additional_requirements && (
            <Card>
              <CardHeader>
                <CardTitle>Customer Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/30 p-4 rounded-lg">
                  <p className="text-sm">{quote.additional_requirements}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Confirm Button */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">Ready to Confirm?</h4>
                  <p className="text-sm text-muted-foreground">
                    Once confirmed, the customer will be notified and can approve the schedule
                  </p>
                </div>
                <Button 
                  onClick={confirmQuote}
                  disabled={confirming || quote.status === 'confirmed'}
                  size="lg"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {confirming ? 'Confirming...' : quote.status === 'confirmed' ? 'Already Confirmed' : 'Confirm Quote'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}