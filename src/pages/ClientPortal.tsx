import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, FileText, Calendar, BarChart3, Camera, Palette, User, Plus, Eye, Clock, CheckCircle, FileCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { QuoteDetailsModal } from '@/components/QuoteDetailsModal';
import { ConfirmedMediaSchedule } from '@/components/ConfirmedMediaSchedule';
import { ContractAgreements } from '@/components/ContractAgreements';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';

interface UserQuote {
  id: string;
  total_cost: number;
  status: string;
  created_at: string;
  updated_at: string;
  confirmed_at?: string;
  confirmed_by?: string;
  approved_at?: string;
  rejected_at?: string;
  rejection_reason?: string;
  confirmed_details?: any;
  contract_details?: any;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  contact_company?: string;
  website?: string;
  additional_requirements?: string;
  timeline?: string;
  quote_items: Array<{
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
  }>;
}

export default function ClientPortal() {
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [quotes, setQuotes] = useState<UserQuote[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<UserQuote | null>(null);
  const [showQuoteDetails, setShowQuoteDetails] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Client Portal - Media Buying London';

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!session?.user) {
          navigate('/auth');
        } else {
          // Link any pending quotes and fetch user quotes
          setTimeout(() => {
            linkPendingQuote(session.user.id);
            fetchUserQuotes(session.user.id);
          }, 0);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (!session?.user) {
        navigate('/auth');
      } else {
        linkPendingQuote(session.user.id);
        fetchUserQuotes(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const linkPendingQuote = async (userId: string) => {
    const pendingQuoteId = localStorage.getItem('pending_quote_link');
    if (pendingQuoteId) {
      try {
        // Link quote by session ID (which is what we stored)
        const { error } = await supabase
          .from('quotes')
          .update({ user_id: userId })
          .eq('user_session_id', pendingQuoteId)
          .eq('status', 'submitted');

        if (!error) {
          localStorage.removeItem('pending_quote_link');
          toast.success('Your quote has been linked to your account!');
          // Refresh quotes after linking
          fetchUserQuotes(userId);
        } else {
          console.error('Error linking quote:', error);
        }
      } catch (err) {
        console.error('Error linking quote:', err);
      }
    }
  };

  const fetchUserQuotes = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('quotes')
        .select(`
          id,
          total_cost,
          status,
          created_at,
          updated_at,
          confirmed_at,
          confirmed_by,
          approved_at,
          rejected_at,
          rejection_reason,
          confirmed_details,
          contract_details,
          contact_name,
          contact_email,
          contact_phone,
          contact_company,
          website,
          additional_requirements,
          timeline,
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
            original_cost,
            campaign_start_date,
            campaign_end_date,
            creative_needs
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setQuotes(data || []);
    } catch (err) {
      console.error('Error fetching quotes:', err);
      toast.error('Failed to load your quotes');
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Failed to sign out');
    } else {
      toast.success('Signed out successfully');
      navigate('/');
    }
  };

  const handleQuoteStatusUpdate = () => {
    if (user) {
      fetchUserQuotes(user.id);
    }
  };

  // Group quotes by status
  const submittedQuotes = quotes.filter(q => q.status === 'submitted');
  const confirmedQuotes = quotes.filter(q => q.status === 'confirmed');
  const approvedQuotes = quotes.filter(q => q.status === 'approved' || q.status === 'contract');
  const activeQuotes = quotes.filter(q => q.status === 'active');

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

  const handleViewQuote = (quote: UserQuote) => {
    setSelectedQuote(quote);
    setShowQuoteDetails(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your portal...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {user.user_metadata?.first_name || 'there'}!</h1>
            <p className="text-muted-foreground">
              Manage your campaigns and access premium features
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate('/')}>
              <Plus className="h-4 w-4 mr-2" />
              New Campaign
            </Button>
            <Button variant="ghost" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          
          {/* Quick Actions */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Account
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium">{user.user_metadata?.full_name || user.email}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                  {user.user_metadata?.company && (
                    <p className="text-xs text-muted-foreground">{user.user_metadata.company}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/outdoor-media')}>
                  <FileText className="h-4 w-4 mr-2" />
                  Browse Formats
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/configurator')}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Campaign Planner
                </Button>
                <Button variant="outline" className="w-full justify-start" disabled>
                  <Camera className="h-4 w-4 mr-2" />
                  Proof Gallery
                </Button>
                <Button variant="outline" className="w-full justify-start" disabled>
                  <Palette className="h-4 w-4 mr-2" />
                  Creative Studio
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Stats Overview */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{quotes.length}</div>
                  <p className="text-xs text-muted-foreground">Total Quotes</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">
                    {formatCurrency(quotes.reduce((sum, quote) => sum + quote.total_cost, 0))}
                  </div>
                  <p className="text-xs text-muted-foreground">Total Campaign Value</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">
                    {quotes.filter(q => q.status === 'active').length}
                  </div>
                  <p className="text-xs text-muted-foreground">Active Campaigns</p>
                </CardContent>
              </Card>
            </div>

            {/* Tabbed Quotes and Campaigns */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Your Quotes & Campaigns</CardTitle>
                    <CardDescription>
                      Track your quotes through every stage of the process
                    </CardDescription>
                  </div>
                  <Button onClick={() => navigate('/outdoor-media')}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Quote
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="submitted" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="submitted" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Submitted ({submittedQuotes.length})
                    </TabsTrigger>
                    <TabsTrigger value="confirmed" className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Media Schedule ({confirmedQuotes.length})
                    </TabsTrigger>
                    <TabsTrigger value="contracts" className="flex items-center gap-2">
                      <FileCheck className="h-4 w-4" />
                      Contracts ({approvedQuotes.length})
                    </TabsTrigger>
                    <TabsTrigger value="active" className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Active ({activeQuotes.length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="submitted" className="mt-6">
                    {submittedQuotes.length === 0 ? (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No submitted quotes</h3>
                        <p className="text-muted-foreground mb-4">
                          Your submitted quotes will appear here while they're being reviewed
                        </p>
                        <Button onClick={() => navigate('/outdoor-media')}>
                          Create Your First Quote
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {submittedQuotes.map((quote) => (
                          <div 
                            key={quote.id} 
                            className="border rounded-lg p-4 hover:bg-muted/30 transition-colors cursor-pointer"
                            onClick={() => handleViewQuote(quote)}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <h3 className="font-semibold">Quote #{quote.id.slice(0, 8)}</h3>
                                <Badge variant="secondary">Under Review</Badge>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="text-right">
                                  <div className="font-semibold">{formatCurrency(quote.total_cost)}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {new Date(quote.created_at).toLocaleDateString('en-GB')}
                                  </div>
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewQuote(quote);
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="font-medium mb-1">Formats:</p>
                                <ul className="text-muted-foreground">
                                  {quote.quote_items?.map((item, idx) => (
                                    <li key={idx}>
                                      {item.quantity}× {item.format_name}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <p className="font-medium mb-1">Total Locations:</p>
                                <p className="text-muted-foreground">
                                  {quote.quote_items?.reduce((sum, item) => sum + item.selected_areas.length, 0)} areas
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="confirmed" className="mt-6">
                    {confirmedQuotes.length === 0 ? (
                      <div className="text-center py-8">
                        <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No confirmed media schedules</h3>
                        <p className="text-muted-foreground">
                          Once our team confirms your media plan details, they'll appear here for your approval
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {confirmedQuotes.map((quote) => (
                          <ConfirmedMediaSchedule 
                            key={quote.id} 
                            quote={quote} 
                            onStatusUpdate={handleQuoteStatusUpdate}
                          />
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="contracts" className="mt-6">
                    {approvedQuotes.length === 0 ? (
                      <div className="text-center py-8">
                        <FileCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No contracts ready</h3>
                        <p className="text-muted-foreground">
                          After approving your media schedule, contracts and payment details will appear here
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {approvedQuotes.map((quote) => (
                          <ContractAgreements 
                            key={quote.id} 
                            quote={quote} 
                            onStatusUpdate={handleQuoteStatusUpdate}
                          />
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="active" className="mt-6">
                    {activeQuotes.length === 0 ? (
                      <div className="text-center py-8">
                        <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No active campaigns</h3>
                        <p className="text-muted-foreground">
                          Your live campaigns will appear here with tracking and reporting
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {activeQuotes.map((quote) => (
                          <div 
                            key={quote.id} 
                            className="border rounded-lg p-4 bg-green-50 border-green-200"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <h3 className="font-semibold">Campaign #{quote.id.slice(0, 8)}</h3>
                                <Badge className="bg-green-500">Live</Badge>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold text-green-700">{formatCurrency(quote.total_cost)}</div>
                                <div className="text-xs text-green-600">Campaign Value</div>
                              </div>
                            </div>
                            <div className="text-sm text-green-700">
                              Campaign is currently live and being tracked
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Quote Details Modal */}
      <QuoteDetailsModal
        quote={selectedQuote}
        isOpen={showQuoteDetails}
        onClose={() => {
          setShowQuoteDetails(false);
          setSelectedQuote(null);
        }}
      />
    </div>
  );
}