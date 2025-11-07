import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Zap, FileText, BarChart3, Calendar, Camera, Palette, Shield, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatCurrency } from '@/utils/money';
import { trackAccountCreated } from '@/utils/analytics';

export default function CreateAccount() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const quoteId = searchParams.get('quote_id');
  
  const [isLoading, setIsLoading] = useState(false);
  const [hasQuoteData, setHasQuoteData] = useState(false);
  const [quoteDetails, setQuoteDetails] = useState<any>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    company: ''
  });

  useEffect(() => {
    document.title = 'Secure Your Quote - Set Your Password - Media Buying London';
    
    // Check if we have quote data to pre-populate
    const submittedQuoteData = localStorage.getItem('submitted_quote_data');
    const submittedQuoteDetails = localStorage.getItem('submitted_quote_details');
    
    if (submittedQuoteData) {
      try {
        const quoteData = JSON.parse(submittedQuoteData);
        const nameParts = quoteData.contact_name?.split(' ') || [];
        
        setFormData(prev => ({
          ...prev,
          email: quoteData.contact_email || '',
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          company: quoteData.contact_company || ''
        }));
        setHasQuoteData(true);

        // Also load quote details if available
        if (submittedQuoteDetails) {
          const details = JSON.parse(submittedQuoteDetails);
          setQuoteDetails(details);
        }
      } catch (error) {
        console.error('Error parsing quote data:', error);
      }
    }
  }, []);

  // Always fetch the latest quote by query param to avoid stale totals
  useEffect(() => {
    const qid = searchParams.get('quote_id');
    if (!qid) return;
    (async () => {
      try {
        console.debug('🔄 Fetching fresh quote for CreateAccount', qid);
        const { data, error } = await supabase
          .from('quotes')
          .select('*, quote_items(*)')
          .eq('id', qid)
          .maybeSingle();
        if (error) throw error;
        if (data) {
          setQuoteDetails(data);
          setHasQuoteData(true);
        }
      } catch (e) {
        console.error('❌ Failed to fetch quote by id', e);
      }
    })();
  }, [searchParams]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/client-portal`;
      
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: `${formData.firstName} ${formData.lastName}`.trim(),
            first_name: formData.firstName,
            last_name: formData.lastName,
            company: formData.company
          }
        }
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      if (data.user) {
        // Link the submitted quote to the user account
        if (quoteId || hasQuoteData) {
          const sessionId = quoteId || localStorage.getItem('quote_session_id_submitted');
          if (sessionId) {
            localStorage.setItem('pending_quote_link', sessionId);
          }
        }
        
        // Track account creation before cleanup
        if (quoteDetails) {
          trackAccountCreated({
            plan_value: quoteDetails.total_cost || 0,
            formats_count: quoteDetails.quote_items?.length || 0,
            location: "London"
          });
        }

        // Clean up quote data
        localStorage.removeItem('submitted_quote_data');
        localStorage.removeItem('submitted_quote_details');
        localStorage.removeItem('quote_session_id_submitted');
        
        toast.success('Account created! Please check your email to verify your account.');
        navigate('/account-created');
      }
    } catch (err: any) {
      toast.error('Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const benefits = [
    {
      icon: Zap,
      title: 'Lightning-Fast Delivery',
      description: 'Priority processing for all your campaigns with expedited timelines'
    },
    {
      icon: FileText,
      title: 'Comprehensive Media Plans',
      description: 'Access detailed campaign strategies, site locations, and performance analytics'
    },
    {
      icon: BarChart3,
      title: 'Rate Management',
      description: 'Exclusive client rates, volume discounts, and transparent pricing control'
    },
    {
      icon: Calendar,
      title: 'Campaign Management',
      description: 'Full visibility and control over all your active and upcoming campaigns'
    },
    {
      icon: Camera,
      title: 'Proof of Posting',
      description: 'Real-time photo verification when your ads go live across London'
    },
    {
      icon: Palette,
      title: 'Creative Design Services',
      description: 'Professional artwork creation and optimization for maximum impact'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Hero Section */}
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">
              <CheckCircle className="h-4 w-4 mr-2" />
              {hasQuoteData ? 'Quote Submitted Successfully' : 'Ready to Create Account'}
            </Badge>
            <h1 className="text-4xl font-bold mb-4">
              {hasQuoteData ? (
                <>
                  Secure Your Quote - 
                  <span className="bg-gradient-primary bg-clip-text text-transparent"> Set Your Password</span>
                </>
              ) : (
                <>
                  Create Your Client Account for
                  <span className="bg-gradient-primary bg-clip-text text-transparent"> Premium Access</span>
                </>
              )}
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {hasQuoteData 
                ? "Just set your password to secure access to your quote and premium client portal features."
                : "Unlock exclusive benefits, real-time campaign management, and priority support with your dedicated client portal."
              }
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Quote Summary or Benefits Section */}
            <div className="lg:col-span-2 space-y-6">
              {hasQuoteData && quoteDetails ? (
                // Show Quote Summary
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      Your Quote Summary
                    </CardTitle>
                    <CardDescription>
                      Review your submitted campaign details before securing your account
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-4 bg-primary/5 rounded-lg border border-primary/10">
                        <span className="font-semibold text-lg">Total Campaign Cost</span>
                        <span className="text-2xl font-bold text-primary">{formatCurrency((quoteDetails?.total_cost && quoteDetails.total_cost > 0) ? quoteDetails.total_cost : (quoteDetails?.quote_items || []).reduce((s: number, i: any) => s + (i.total_cost ?? ((i.base_cost||0)+(i.production_cost||0)+(i.creative_cost||0))), 0))}</span>
                      </div>
                      
                      <div className="space-y-3">
                        <h4 className="font-semibold text-foreground">Campaign Components:</h4>
                        {quoteDetails.quote_items?.map((item: any, index: number) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                            <div>
                              <p className="font-medium">{item.format_name}</p>
                              <p className="text-sm text-muted-foreground">
                                {item.quantity} units • {item.selected_areas?.length || 0} areas
                              </p>
                            </div>
                            <span className="font-semibold">{formatCurrency(item.total_cost || 0)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                // Show Benefits Section
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      Why Create an Account?
                    </CardTitle>
                    <CardDescription>
                      Join hundreds of successful brands managing their OOH campaigns through our platform
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      {benefits.map((benefit, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <benefit.icon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold mb-1">{benefit.title}</h3>
                            <p className="text-sm text-muted-foreground">{benefit.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Social Proof */}
              <Card className="bg-gradient-to-r from-primary/5 to-accent/5">
                <CardContent className="pt-6">
                  <div className="grid md:grid-cols-3 gap-6 text-center">
                    <div>
                      <div className="text-2xl font-bold text-primary mb-1">24hr</div>
                      <div className="text-sm text-muted-foreground">Average Quote Response</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary mb-1">500+</div>
                      <div className="text-sm text-muted-foreground">Successful Campaigns</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary mb-1">98%</div>
                      <div className="text-sm text-muted-foreground">Client Satisfaction</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Account Creation Form */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle>{hasQuoteData ? 'Secure Your Brief' : 'Create Your Account'}</CardTitle>
                  <CardDescription>
                    {hasQuoteData 
                      ? 'Your details are pre-filled from your quote submission'
                      : 'Get instant access to your client portal'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {hasQuoteData && (
                    <div className="mb-6 p-4 bg-primary/5 border border-primary/10 rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-primary font-medium mb-2">
                        <CheckCircle className="h-4 w-4" />
                        Your quote submission details
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p><span className="font-medium">Name:</span> {formData.firstName} {formData.lastName}</p>
                        <p><span className="font-medium">Email:</span> {formData.email}</p>
                        {formData.company && <p><span className="font-medium">Company:</span> {formData.company}</p>}
                      </div>
                    </div>
                  )}
                  
                  <form onSubmit={handleSignUp} className="space-y-4">
                    {!hasQuoteData && (
                      <>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                              id="firstName"
                              value={formData.firstName}
                              onChange={(e) => handleInputChange('firstName', e.target.value)}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                              id="lastName"
                              value={formData.lastName}
                              onChange={(e) => handleInputChange('lastName', e.target.value)}
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="company">Company Name</Label>
                          <Input
                            id="company"
                            value={formData.company}
                            onChange={(e) => handleInputChange('company', e.target.value)}
                            placeholder="Your Company Ltd"
                          />
                        </div>
                      </>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        required
                        minLength={6}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        required
                        minLength={6}
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isLoading}
                    >
                      {isLoading 
                        ? 'Creating Account...' 
                        : hasQuoteData 
                          ? 'Secure My Quote' 
                          : 'Create Account'
                      }
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>

                    <div className="text-xs text-muted-foreground text-center">
                      By creating an account, you agree to our terms of service and privacy policy.
                    </div>
                  </form>

                  <div className="mt-6 pt-6 border-t">
                    <p className="text-sm text-muted-foreground text-center mb-3">
                      Already have an account?
                    </p>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => navigate('/auth')}
                    >
                      Sign In Instead
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}