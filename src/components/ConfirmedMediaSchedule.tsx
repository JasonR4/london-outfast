import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  MessageSquare, 
  Calendar,
  MapPin,
  FileText,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Edit
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ConfirmedMediaScheduleProps {
  quote: any;
  onStatusUpdate: () => void;
}

export function ConfirmedMediaSchedule({ quote, onStatusUpdate }: ConfirmedMediaScheduleProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showRejectionForm, setShowRejectionForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleApproval = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('quotes')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString()
        })
        .eq('id', quote.id);

      if (error) throw error;

      toast.success('Media schedule approved successfully!');
      onStatusUpdate();
    } catch (error) {
      console.error('Error approving quote:', error);
      toast.error('Failed to approve media schedule');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejection = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('quotes')
        .update({
          status: 'rejected',
          rejected_at: new Date().toISOString(),
          rejection_reason: rejectionReason
        })
        .eq('id', quote.id);

      if (error) throw error;

      toast.success('Feedback submitted successfully');
      setShowRejectionForm(false);
      setRejectionReason('');
      onStatusUpdate();
    } catch (error) {
      console.error('Error rejecting quote:', error);
      toast.error('Failed to submit feedback');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestChanges = () => {
    setShowRejectionForm(true);
  };

  const confirmedDetails = quote.confirmed_details || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Confirmed Media Schedule
              </CardTitle>
              <CardDescription>
                Your detailed campaign plan prepared by our media planning team
              </CardDescription>
            </div>
            <Badge variant="default" className="bg-blue-500">
              Awaiting Your Approval
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Confirmed:</span>
                <span>{formatDate(quote.confirmed_at)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Quote ID:</span>
                <span className="font-mono">{quote.id.slice(0, 8)}...</span>
              </div>
            </div>
            <div className="flex items-center justify-end">
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">
                  {formatCurrency(quote.total_cost)}
                </div>
                <div className="text-sm text-muted-foreground">Total Campaign Cost</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirmed Campaign Details */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Details</CardTitle>
          <CardDescription>
            Detailed breakdown of your confirmed media campaign
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Campaign Overview */}
            {confirmedDetails.campaign_overview && (
              <div>
                <h4 className="font-semibold mb-2">Campaign Overview</h4>
                <p className="text-muted-foreground">{confirmedDetails.campaign_overview}</p>
              </div>
            )}

            {/* Media Formats */}
            <div>
              <h4 className="font-semibold mb-3">Selected Media Formats</h4>
              <div className="space-y-4">
                {quote.quote_items?.map((item: any, index: number) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-semibold text-lg">{item.format_name}</h5>
                      <div className="text-right">
                        <div className="font-semibold text-primary">
                          {formatCurrency(item.total_cost)}
                        </div>
                        {item.discount_percentage > 0 && (
                          <div className="text-xs text-green-600">
                            {item.discount_percentage}% discount applied
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Quantity:</span>
                          <span>{item.quantity} units</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Areas:</span>
                          <span>{item.selected_areas.length} locations</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Duration:</span>
                          <span>{item.selected_periods.length} periods</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {item.campaign_start_date && (
                          <div className="text-xs">
                            <span className="font-medium">Start:</span> {new Date(item.campaign_start_date).toLocaleDateString('en-GB')}
                          </div>
                        )}
                        {item.campaign_end_date && (
                          <div className="text-xs">
                            <span className="font-medium">End:</span> {new Date(item.campaign_end_date).toLocaleDateString('en-GB')}
                          </div>
                        )}
                        {item.creative_needs && (
                          <div className="text-xs">
                            <span className="font-medium">Creative:</span> {item.creative_needs}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Confirmed specific details */}
                    {confirmedDetails.items?.[index] && (
                      <div className="mt-4 pt-4 border-t">
                        <h6 className="font-medium mb-2 text-blue-600">Confirmed Details:</h6>
                        <div className="space-y-1 text-sm">
                          {confirmedDetails.items[index].specific_locations && (
                            <div>
                              <span className="font-medium">Specific Locations:</span>
                              <span className="ml-2">{confirmedDetails.items[index].specific_locations}</span>
                            </div>
                          )}
                          {confirmedDetails.items[index].posting_dates && (
                            <div>
                              <span className="font-medium">Posting Dates:</span>
                              <span className="ml-2">{confirmedDetails.items[index].posting_dates}</span>
                            </div>
                          )}
                          {confirmedDetails.items[index].special_requirements && (
                            <div>
                              <span className="font-medium">Special Requirements:</span>
                              <span className="ml-2">{confirmedDetails.items[index].special_requirements}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Confirmed Details */}
            {(confirmedDetails.delivery_schedule || confirmedDetails.reporting_schedule || confirmedDetails.creative_deadlines) && (
              <div>
                <h4 className="font-semibold mb-3">Schedule & Deliverables</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  {confirmedDetails.delivery_schedule && (
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <h6 className="font-medium mb-1">Delivery Schedule</h6>
                      <p className="text-sm text-muted-foreground">{confirmedDetails.delivery_schedule}</p>
                    </div>
                  )}
                  {confirmedDetails.reporting_schedule && (
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <h6 className="font-medium mb-1">Reporting Schedule</h6>
                      <p className="text-sm text-muted-foreground">{confirmedDetails.reporting_schedule}</p>
                    </div>
                  )}
                  {confirmedDetails.creative_deadlines && (
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <h6 className="font-medium mb-1">Creative Deadlines</h6>
                      <p className="text-sm text-muted-foreground">{confirmedDetails.creative_deadlines}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            Your Response Required
          </CardTitle>
          <CardDescription>
            Please review the confirmed media schedule and let us know your decision
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showRejectionForm ? (
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={handleApproval}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700"
                size="lg"
              >
                <ThumbsUp className="h-4 w-4 mr-2" />
                Approve Schedule
              </Button>
              
              <Button 
                variant="outline"
                onClick={handleRequestChanges}
                disabled={isLoading}
                size="lg"
              >
                <Edit className="h-4 w-4 mr-2" />
                Request Changes
              </Button>
              
              <Button 
                variant="destructive"
                onClick={() => setShowRejectionForm(true)}
                disabled={isLoading}
                size="lg"
              >
                <ThumbsDown className="h-4 w-4 mr-2" />
                Decline Schedule
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="rejection-reason">
                  Please tell us why you're declining or what changes you'd like to see:
                </Label>
                <Textarea
                  id="rejection-reason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please provide detailed feedback about what you'd like to change or why you're declining this schedule..."
                  rows={4}
                  className="mt-2"
                />
              </div>
              
              <div className="flex gap-3">
                <Button 
                  onClick={handleRejection}
                  disabled={isLoading || !rejectionReason.trim()}
                  variant="destructive"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Submit Feedback
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setShowRejectionForm(false);
                    setRejectionReason('');
                  }}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}