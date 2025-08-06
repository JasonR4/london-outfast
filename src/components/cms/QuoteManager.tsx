import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Edit, 
  Calendar, 
  MapPin, 
  User,
  Phone,
  Mail,
  Building
} from 'lucide-react';

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
  campaign_start_date?: string;
  campaign_end_date?: string;
  creative_needs?: string;
}

interface Quote {
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
  confirmed_at?: string;
  approved_at?: string;
  rejected_at?: string;
  rejection_reason?: string;
  quote_items: QuoteItem[];
}

export function QuoteManager() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [showQuoteDetails, setShowQuoteDetails] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('quotes')
        .select(`
          id,
          total_cost,
          status,
          created_at,
          updated_at,
          contact_name,
          contact_email,
          contact_phone,
          contact_company,
          website,
          additional_requirements,
          timeline,
          confirmed_at,
          approved_at,
          rejected_at,
          rejection_reason,
          quote_items (
            id,
            format_name,
            format_slug,
            quantity,
            selected_areas,
            selected_periods,
            total_cost,
            base_cost,
            production_cost,
            creative_cost,
            discount_percentage,
            discount_amount,
            campaign_start_date,
            campaign_end_date,
            creative_needs
          )
        `)
        .neq('status', 'draft')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuotes(data || []);
    } catch (err) {
      console.error('Error fetching quotes:', err);
      toast.error('Failed to load quotes');
    } finally {
      setLoading(false);
    }
  };

  const updateQuoteStatus = async (quoteId: string, newStatus: string, reason?: string) => {
    try {
      const updateData: any = { 
        status: newStatus,
        [`${newStatus}_at`]: new Date().toISOString()
      };

      if (reason && newStatus === 'rejected') {
        updateData.rejection_reason = reason;
      }

      const { error } = await supabase
        .from('quotes')
        .update(updateData)
        .eq('id', quoteId);

      if (error) throw error;

      toast.success(`Quote ${newStatus} successfully`);
      await fetchQuotes();
      setShowQuoteDetails(false);
      setStatusUpdate('');
      setRejectionReason('');
    } catch (err) {
      console.error('Error updating quote:', err);
      toast.error('Failed to update quote status');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'contract': return 'bg-purple-100 text-purple-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted': return <FileText className="h-4 w-4" />;
      case 'confirmed': return <Clock className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'contract': return <FileText className="h-4 w-4" />;
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  // Group quotes by status
  const submittedQuotes = quotes.filter(q => q.status === 'submitted');
  const confirmedQuotes = quotes.filter(q => q.status === 'confirmed');
  const approvedQuotes = quotes.filter(q => ['approved', 'contract'].includes(q.status));
  const activeQuotes = quotes.filter(q => q.status === 'active');
  const rejectedQuotes = quotes.filter(q => q.status === 'rejected');

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Quote Management</h2>
          <p className="text-muted-foreground">
            Manage and process client quotes through every stage
          </p>
        </div>
        <Button onClick={fetchQuotes} variant="outline">
          Refresh
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{submittedQuotes.length}</div>
            <p className="text-xs text-muted-foreground">New Submissions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">{confirmedQuotes.length}</div>
            <p className="text-xs text-muted-foreground">Confirmed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{approvedQuotes.length}</div>
            <p className="text-xs text-muted-foreground">Approved</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-700">{activeQuotes.length}</div>
            <p className="text-xs text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{rejectedQuotes.length}</div>
            <p className="text-xs text-muted-foreground">Rejected</p>
          </CardContent>
        </Card>
      </div>

      {/* Quote Management Tabs */}
      <Tabs defaultValue="submitted" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="submitted">
            New ({submittedQuotes.length})
          </TabsTrigger>
          <TabsTrigger value="confirmed">
            Confirmed ({confirmedQuotes.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({approvedQuotes.length})
          </TabsTrigger>
          <TabsTrigger value="active">
            Active ({activeQuotes.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({rejectedQuotes.length})
          </TabsTrigger>
        </TabsList>

        {/* Submitted Quotes */}
        <TabsContent value="submitted" className="space-y-4">
          {submittedQuotes.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No New Submissions</h3>
                <p className="text-muted-foreground">New quote submissions will appear here</p>
              </CardContent>
            </Card>
          ) : (
            submittedQuotes.map((quote) => (
              <QuoteCard 
                key={quote.id} 
                quote={quote} 
                onViewDetails={(q) => {
                  setSelectedQuote(q);
                  setShowQuoteDetails(true);
                }} 
              />
            ))
          )}
        </TabsContent>

        {/* Confirmed Quotes */}
        <TabsContent value="confirmed" className="space-y-4">
          {confirmedQuotes.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Confirmed Quotes</h3>
                <p className="text-muted-foreground">Confirmed quotes will appear here</p>
              </CardContent>
            </Card>
          ) : (
            confirmedQuotes.map((quote) => (
              <QuoteCard 
                key={quote.id} 
                quote={quote} 
                onViewDetails={(q) => {
                  setSelectedQuote(q);
                  setShowQuoteDetails(true);
                }} 
              />
            ))
          )}
        </TabsContent>

        {/* Approved Quotes */}
        <TabsContent value="approved" className="space-y-4">
          {approvedQuotes.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Approved Quotes</h3>
                <p className="text-muted-foreground">Approved quotes will appear here</p>
              </CardContent>
            </Card>
          ) : (
            approvedQuotes.map((quote) => (
              <QuoteCard 
                key={quote.id} 
                quote={quote} 
                onViewDetails={(q) => {
                  setSelectedQuote(q);
                  setShowQuoteDetails(true);
                }} 
              />
            ))
          )}
        </TabsContent>

        {/* Active Quotes */}
        <TabsContent value="active" className="space-y-4">
          {activeQuotes.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Active Campaigns</h3>
                <p className="text-muted-foreground">Active campaigns will appear here</p>
              </CardContent>
            </Card>
          ) : (
            activeQuotes.map((quote) => (
              <QuoteCard 
                key={quote.id} 
                quote={quote} 
                onViewDetails={(q) => {
                  setSelectedQuote(q);
                  setShowQuoteDetails(true);
                }} 
              />
            ))
          )}
        </TabsContent>

        {/* Rejected Quotes */}
        <TabsContent value="rejected" className="space-y-4">
          {rejectedQuotes.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <XCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Rejected Quotes</h3>
                <p className="text-muted-foreground">Rejected quotes will appear here</p>
              </CardContent>
            </Card>
          ) : (
            rejectedQuotes.map((quote) => (
              <QuoteCard 
                key={quote.id} 
                quote={quote} 
                onViewDetails={(q) => {
                  setSelectedQuote(q);
                  setShowQuoteDetails(true);
                }} 
              />
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Quote Details Modal */}
      <Dialog open={showQuoteDetails} onOpenChange={setShowQuoteDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedQuote && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle>Quote #{selectedQuote.id.slice(0, 8)}</DialogTitle>
                    <DialogDescription>
                      Submitted on {new Date(selectedQuote.created_at).toLocaleDateString('en-GB')}
                    </DialogDescription>
                  </div>
                  <Badge className={getStatusColor(selectedQuote.status)}>
                    {getStatusIcon(selectedQuote.status)}
                    <span className="ml-1 capitalize">{selectedQuote.status}</span>
                  </Badge>
                </div>
              </DialogHeader>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Client Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Client Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{selectedQuote.contact_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedQuote.contact_email}</span>
                    </div>
                    {selectedQuote.contact_phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedQuote.contact_phone}</span>
                      </div>
                    )}
                    {selectedQuote.contact_company && (
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedQuote.contact_company}</span>
                      </div>
                    )}
                    {selectedQuote.additional_requirements && (
                      <div>
                        <p className="font-medium text-sm mb-1">Additional Requirements:</p>
                        <p className="text-sm text-muted-foreground">{selectedQuote.additional_requirements}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quote Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quote Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-2">
                      {formatCurrency(selectedQuote.total_cost)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      {selectedQuote.quote_items.length} format{selectedQuote.quote_items.length !== 1 ? 's' : ''} in campaign
                    </p>
                    
                    {/* Status Update Actions */}
                    <div className="space-y-3">
                      <Label>Update Status</Label>
                      <Select value={statusUpdate} onValueChange={setStatusUpdate}>
                        <SelectTrigger>
                          <SelectValue placeholder="Change status..." />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedQuote.status === 'submitted' && (
                            <>
                              <SelectItem value="confirmed">Confirm Quote</SelectItem>
                              <SelectItem value="rejected">Reject Quote</SelectItem>
                            </>
                          )}
                          {selectedQuote.status === 'confirmed' && (
                            <>
                              <SelectItem value="approved">Approve for Contract</SelectItem>
                              <SelectItem value="rejected">Reject Quote</SelectItem>
                            </>
                          )}
                          {selectedQuote.status === 'approved' && (
                            <SelectItem value="active">Mark as Active</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      
                      {statusUpdate === 'rejected' && (
                        <div className="space-y-2">
                          <Label>Rejection Reason</Label>
                          <Textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Please provide a reason for rejection..."
                          />
                        </div>
                      )}
                      
                      {statusUpdate && (
                        <Button 
                          onClick={() => updateQuoteStatus(selectedQuote.id, statusUpdate, rejectionReason)}
                          className="w-full"
                          disabled={statusUpdate === 'rejected' && !rejectionReason.trim()}
                        >
                          {statusUpdate === 'confirmed' && 'Confirm Quote'}
                          {statusUpdate === 'approved' && 'Approve Quote'}
                          {statusUpdate === 'active' && 'Mark as Active'}
                          {statusUpdate === 'rejected' && 'Reject Quote'}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quote Items */}
              <Card>
                <CardHeader>
                  <CardTitle>Campaign Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedQuote.quote_items.map((item, index) => (
                      <div key={item.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-lg">{item.format_name}</h4>
                            <Badge variant="secondary">Qty: {item.quantity}</Badge>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">{formatCurrency(item.total_cost)}</div>
                            {item.discount_percentage && item.discount_percentage > 0 && (
                              <div className="text-sm text-green-600">
                                {item.discount_percentage}% discount
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="flex items-center gap-1 mb-2">
                              <MapPin className="h-4 w-4" />
                              <span className="font-medium">Locations ({item.selected_areas.length}):</span>
                            </div>
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
                          
                          <div>
                            <div className="flex items-center gap-1 mb-2">
                              <Calendar className="h-4 w-4" />
                              <span className="font-medium">Campaign Duration:</span>
                            </div>
                            <div className="space-y-1">
                              <div className="text-sm font-medium">
                                {item.selected_periods?.length > 0 ? (
                                  <>
                                    {item.selected_periods.length} period{item.selected_periods.length !== 1 ? 's' : ''} ({item.selected_periods.length * 2} weeks)
                                  </>
                                ) : (
                                  <span className="text-destructive">No periods selected</span>
                                )}
                              </div>
                              
                              {item.selected_periods?.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {item.selected_periods.slice(0, 6).map((period) => (
                                    <Badge key={period} variant="secondary" className="text-xs font-medium">
                                      Period {period}
                                    </Badge>
                                  ))}
                                  {item.selected_periods.length > 6 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{item.selected_periods.length - 6} more
                                    </Badge>
                                  )}
                                </div>
                              )}
                              
                              {item.campaign_start_date && item.campaign_end_date && (
                                <div className="text-xs text-muted-foreground">
                                  {new Date(item.campaign_start_date).toLocaleDateString('en-GB')} - {new Date(item.campaign_end_date).toLocaleDateString('en-GB')}
                                </div>
                              )}
                              
                              {/* Debug info - remove after testing */}
                              <div className="text-xs text-muted-foreground bg-muted/50 p-1 rounded">
                                Debug: periods = {JSON.stringify(item.selected_periods)}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {item.creative_needs && (
                          <div className="mt-3">
                            <p className="font-medium text-sm">Creative Requirements:</p>
                            <p className="text-sm text-muted-foreground">{item.creative_needs}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Quote Card Component
function QuoteCard({ quote, onViewDetails }: { quote: Quote; onViewDetails: (quote: Quote) => void }) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'contract': return 'bg-purple-100 text-purple-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => onViewDetails(quote)}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg">Quote #{quote.id.slice(0, 8)}</h3>
            <p className="text-sm text-muted-foreground">
              {quote.contact_name} • {quote.contact_company}
            </p>
            <p className="text-xs text-muted-foreground">
              {new Date(quote.created_at).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
          <div className="text-right">
            <div className="font-bold text-xl">{formatCurrency(quote.total_cost)}</div>
            <Badge className={getStatusColor(quote.status)}>
              {quote.status}
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{quote.quote_items.length} format{quote.quote_items.length !== 1 ? 's' : ''}</span>
          <Button variant="ghost" size="sm">
            <Eye className="h-4 w-4 mr-1" />
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}