import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  MapPin, 
  FileText, 
  Phone, 
  Mail, 
  Building, 
  Globe,
  MessageSquare,
  Copy,
  Check
} from 'lucide-react';
import { toast } from 'sonner';

interface QuoteItem {
  id: string;
  format_name: string;
  format_slug: string;
  quantity: number;
  selected_areas: string[];
  selected_periods: number[];
  total_cost: number;
  base_cost: number;
  production_cost: number;
  creative_cost: number;
  discount_percentage?: number;
  discount_amount?: number;
  original_cost?: number;
  campaign_start_date?: string;
  campaign_end_date?: string;
  creative_needs?: string;
}

interface QuoteDetails {
  id: string;
  total_cost: number;
  status: string;
  created_at: string;
  updated_at: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  contact_company?: string;
  website?: string;
  additional_requirements?: string;
  timeline?: string;
  quote_items: QuoteItem[];
}

interface QuoteDetailsModalProps {
  quote: QuoteDetails | null;
  isOpen: boolean;
  onClose: () => void;
}

export function QuoteDetailsModal({ quote, isOpen, onClose }: QuoteDetailsModalProps) {
  const [copiedId, setCopiedId] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'secondary';
      case 'submitted': return 'default';
      case 'approved': return 'default';
      case 'active': return 'default';
      default: return 'secondary';
    }
  };

  const copyQuoteId = async () => {
    if (quote?.id) {
      await navigator.clipboard.writeText(quote.id);
      setCopiedId(true);
      toast.success('Quote ID copied to clipboard');
      setTimeout(() => setCopiedId(false), 2000);
    }
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

  if (!quote) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <FileText className="h-5 w-5" />
            Quote Details
            <Badge variant={getStatusColor(quote.status)}>
              {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Complete details of your campaign quote submission
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quote Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Quote Summary</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyQuoteId}
                    className="text-xs"
                  >
                    {copiedId ? (
                      <Check className="h-3 w-3 mr-1" />
                    ) : (
                      <Copy className="h-3 w-3 mr-1" />
                    )}
                    ID: {quote.id.slice(0, 8)}...
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Submitted:</span>
                    <span>{formatDate(quote.created_at)}</span>
                  </div>
                  {quote.updated_at !== quote.created_at && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Last Updated:</span>
                      <span>{formatDate(quote.updated_at)}</span>
                    </div>
                  )}
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

          {/* Contact Information */}
          {quote.contact_name && (
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Name:</span>
                      <span>{quote.contact_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Email:</span>
                      <span>{quote.contact_email}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {quote.contact_phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Phone:</span>
                        <span>{quote.contact_phone}</span>
                      </div>
                    )}
                    {quote.contact_company && (
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Company:</span>
                        <span>{quote.contact_company}</span>
                      </div>
                    )}
                    {quote.website && (
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Website:</span>
                        <span>{quote.website}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Campaign Components */}
          <Card>
            <CardHeader>
              <CardTitle>Campaign Components</CardTitle>
              <CardDescription>
                Detailed breakdown of your selected media formats and costs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {quote.quote_items.map((item, index) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-lg">{item.format_name}</h4>
                      <div className="text-right">
                        <div className="font-semibold text-primary">
                          {formatCurrency(item.total_cost)}
                        </div>
                        <div className="text-xs text-muted-foreground">Total Cost</div>
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
                          <span className="font-medium">Periods:</span>
                          <span>{item.selected_periods.length} periods</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-xs text-muted-foreground">Cost Breakdown:</div>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span>Base Cost:</span>
                            <span>{formatCurrency(item.base_cost)}</span>
                          </div>
                          {item.production_cost > 0 && (
                            <div className="flex justify-between">
                              <span>Production:</span>
                              <span>{formatCurrency(item.production_cost)}</span>
                            </div>
                          )}
                          {item.creative_cost > 0 && (
                            <div className="flex justify-between">
                              <span>Creative:</span>
                              <span>{formatCurrency(item.creative_cost)}</span>
                            </div>
                          )}
                          {item.discount_percentage && item.discount_percentage > 0 && (
                            <>
                              <div className="flex justify-between text-muted-foreground">
                                <span>Subtotal:</span>
                                <span>{formatCurrency((item.original_cost || item.total_cost) + (item.discount_amount || 0))}</span>
                              </div>
                              <div className="flex justify-between text-green-600">
                                <span>Discount ({item.discount_percentage}%):</span>
                                <span>-{formatCurrency(item.discount_amount || 0)}</span>
                              </div>
                              <Separator className="my-1" />
                            </>
                          )}
                          <div className="flex justify-between font-medium border-t pt-1">
                            <span>Total:</span>
                            <span>{formatCurrency(item.total_cost)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {item.selected_areas.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="text-sm font-medium mb-2">Selected Areas:</div>
                        <div className="flex flex-wrap gap-1">
                          {item.selected_areas.map((area, areaIndex) => (
                            <Badge key={areaIndex} variant="secondary" className="text-xs">
                              {area}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {item.creative_needs && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="text-sm font-medium mb-2">Creative Requirements:</div>
                        <div className="text-sm text-muted-foreground">{item.creative_needs}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Additional Requirements */}
          {quote.additional_requirements && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Additional Requirements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {quote.additional_requirements}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          {quote.timeline && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Timeline Requirements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {quote.timeline}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}