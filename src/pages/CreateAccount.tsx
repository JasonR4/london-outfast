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

export default function CreateAccount() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const quoteId = searchParams.get('quote');
  
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
    
    const fetchQuoteData = async () => {
      // First check if we have quote data in localStorage
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
      
      // If we have a quoteId parameter, fetch the quote from database
      if (quoteId) {
        console.log('🔍 Fetching quote for session ID:', quoteId);
        try {
          const { data: quote, error } = await supabase
            .from('quotes')
            .select(`
              *,
              quote_items (
                id,
                format_name,
                format_slug,
                quantity,
                selected_areas,
                selected_periods,
                base_cost,
                production_cost,
                creative_cost,
                total_cost,
                subtotal,
                vat_amount,
                total_inc_vat
              )
            `)
            .eq('user_session_id', quoteId)
            .eq('status', 'submitted')
            .single();

          if (error) {
            console.error('Error fetching quote:', error);
            return;
          }

          if (quote) {
            console.log('✅ Found quote:', quote);
            
            // Pre-populate form with quote contact details
            const nameParts = quote.contact_name?.split(' ') || [];
            setFormData(prev => ({
              ...prev,
              email: quote.contact_email || '',
              firstName: nameParts[0] || '',
              lastName: nameParts.slice(1).join(' ') || '',
              company: quote.contact_company || ''
            }));
            
            // Set quote details for display
            setQuoteDetails(quote);
            setHasQuoteData(true);
          }
        } catch (error) {
          console.error('Error fetching quote data:', error);
        }
      }
    };
    
    fetchQuoteData();
  }, [quoteId]);

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
                  Secure Your Quote, 
                  <span className="bg-gradient-primary bg-clip-text text-transparent">{formData.firstName}</span>
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
                // Show Comprehensive Quote Summary
                <div className="space-y-6">
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
                      <div className="space-y-6">
                        {/* Quote Items Details */}
                        <div className="space-y-4">
                          <h4 className="font-semibold text-foreground">Campaign Components:</h4>
                          {quoteDetails.quote_items?.map((item: any, index: number) => (
                            <div key={index} className="border border-border rounded-lg p-4 space-y-3">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h5 className="font-semibold text-lg">{item.format_name}</h5>
                                  <p className="text-sm text-muted-foreground">{item.format_slug}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-lg font-bold text-primary">£{item.total_inc_vat?.toLocaleString()}</p>
                                  <p className="text-xs text-muted-foreground">inc VAT</p>
                                </div>
                              </div>
                              
                              {/* Quantity and Locations */}
                              <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Quantity & Coverage</p>
                                  <p className="font-medium">{item.quantity} units</p>
                                  <p className="text-sm text-muted-foreground">{item.selected_areas?.length || 0} location areas</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Campaign Periods</p>
                                  <p className="font-medium">{item.selected_periods?.length || 0} periods selected</p>
                                  {item.selected_periods && item.selected_periods.length > 0 && (
                                    <p className="text-sm text-muted-foreground">
                                      P{Math.min(...item.selected_periods)} - P{Math.max(...item.selected_periods)}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Selected Areas */}
                              {item.selected_areas && item.selected_areas.length > 0 && (
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground mb-2">Selected Areas:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {item.selected_areas.map((area: string, areaIndex: number) => (
                                      <span
                                        key={areaIndex}
                                        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary"
                                      >
                                        {area}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Cost Breakdown */}
                              <div className="border-t pt-3 space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Media Cost:</span>
                                  <span className="font-medium">£{item.base_cost?.toLocaleString()}</span>
                                </div>
                                {item.production_cost > 0 && (
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Production Cost:</span>
                                    <span className="font-medium">£{item.production_cost?.toLocaleString()}</span>
                                  </div>
                                )}
                                {item.creative_cost > 0 && (
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Creative Cost:</span>
                                    <span className="font-medium">£{item.creative_cost?.toLocaleString()}</span>
                                  </div>
                                )}
                                {item.discount_amount > 0 && (
                                  <div className="flex justify-between text-sm text-green-600">
                                    <span>Discount ({item.discount_percentage}%):</span>
                                    <span className="font-medium">-£{item.discount_amount?.toLocaleString()}</span>
                                  </div>
                                )}
                                <div className="flex justify-between text-sm border-t pt-2">
                                  <span className="text-muted-foreground">Subtotal:</span>
                                  <span className="font-medium">£{item.subtotal?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">VAT ({item.vat_rate || 20}%):</span>
                                  <span className="font-medium">£{item.vat_amount?.toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Campaign Details */}
                        {(quoteDetails.timeline || quoteDetails.additional_requirements) && (
                          <div className="border-t pt-4">
                            <h4 className="font-semibold text-foreground mb-3">Campaign Requirements:</h4>
                            <div className="space-y-2">
                              {quoteDetails.timeline && (
                                <div>
                                  <span className="text-sm font-medium text-muted-foreground">Timeline: </span>
                                  <span className="text-sm">{quoteDetails.timeline}</span>
                                </div>
                              )}
                              {quoteDetails.additional_requirements && (
                                <div>
                                  <span className="text-sm font-medium text-muted-foreground">Additional Requirements: </span>
                                  <span className="text-sm">{quoteDetails.additional_requirements}</span>
                                </div>
                              )}
                              {quoteDetails.website && (
                                <div>
                                  <span className="text-sm font-medium text-muted-foreground">Website: </span>
                                  <span className="text-sm">{quoteDetails.website}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Total Summary */}
                        <div className="border-t pt-4 space-y-3">
                          <div className="flex justify-between items-center text-lg">
                            <span className="font-semibold">Campaign Subtotal:</span>
                            <span className="font-bold">£{quoteDetails.subtotal?.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">VAT ({quoteDetails.vat_rate || 20}%):</span>
                            <span className="font-medium">£{quoteDetails.vat_amount?.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center p-4 bg-primary/5 rounded-lg border border-primary/10">
                            <span className="font-semibold text-xl">Total Campaign Cost:</span>
                            <span className="text-2xl font-bold text-primary">£{quoteDetails.total_inc_vat?.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
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
                  <CardTitle>{hasQuoteData ? 'Secure Your Quote' : 'Create Your Account'}</CardTitle>
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