import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useQuotes, Quote } from '@/hooks/useQuotes';
import { CheckCircle, User, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface QuoteSubmissionFormProps {
  quote: Quote;
}

export function QuoteSubmissionForm({ quote }: QuoteSubmissionFormProps) {
  const { submitQuote } = useQuotes();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    contact_email: '',
    contact_phone: '',
    company_name: '',
    website: '',
    additional_requirements: ''
  });

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Handle authenticated user submission
  const handleAuthenticatedSubmit = async () => {
    setIsSubmitting(true);
    
    const submissionData = {
      contact_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Unknown User',
      contact_email: user.email || '',
      contact_phone: user.user_metadata?.phone || '',
      contact_company: user.user_metadata?.company || '',
      additional_requirements: '',
      website: user.user_metadata?.website || ''
    };
    
    const success = await submitQuote(submissionData);
    
    if (success) {
      // Authenticated users go to client portal, not quote-submitted page
      navigate('/client-portal');
    }
    
    setIsSubmitting(false);
  };

  // Handle form submission for non-authenticated users
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.first_name || !formData.last_name || !formData.contact_email) {
      return;
    }

    setIsSubmitting(true);
    
    const submissionData = {
      contact_name: `${formData.first_name} ${formData.last_name}`.trim(),
      contact_email: formData.contact_email,
      contact_phone: formData.contact_phone,
      contact_company: formData.company_name,
      additional_requirements: formData.additional_requirements,
      website: formData.website
    };
    
    const success = await submitQuote(submissionData);
    
    if (success) {
      setIsSubmitted(true);
      // Redirect to success page after a delay
      setTimeout(() => {
        navigate('/quote-submitted');
      }, 2000);
    }
    
    setIsSubmitting(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <Card className="sticky top-8">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isSubmitted) {
    return (
      <Card className="sticky top-8">
        <CardContent className="pt-6">
          <div className="text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Quote Submitted!</h3>
            <p className="text-sm text-muted-foreground mb-4">
              We'll get back to you within 24 hours with your detailed quote.
            </p>
            <p className="text-xs text-muted-foreground">
              Redirecting to confirmation page...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Authenticated user - simple submit flow
  if (user) {
    return (
      <Card className="sticky top-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Submit Your Plan
          </CardTitle>
          <CardDescription>
            Ready to submit! Your plan will be processed within 24 hours.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Signed in as {user.email}
              </div>
            </div>
            
            <Button 
              onClick={handleAuthenticatedSubmit} 
              size="lg" 
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting Plan...' : 'Submit Plan'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            
            <p className="text-xs text-muted-foreground text-center">
              Your quote will be sent to {user.email}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Non-authenticated user - full form flow
  return (
    <Card className="sticky top-8">
      <CardHeader>
        <CardTitle>Submit Your Plan</CardTitle>
        <CardDescription>
          Get your detailed quote within 24 hours
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name *</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name *</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_email">Email Address *</Label>
            <Input
              id="contact_email"
              type="email"
              value={formData.contact_email}
              onChange={(e) => handleInputChange('contact_email', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_phone">Phone Number</Label>
            <Input
              id="contact_phone"
              type="tel"
              value={formData.contact_phone}
              onChange={(e) => handleInputChange('contact_phone', e.target.value)}
              placeholder="+44 20 1234 5678"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_name">Company Name</Label>
            <Input
              id="company_name"
              value={formData.company_name}
              onChange={(e) => handleInputChange('company_name', e.target.value)}
              placeholder="Your Company Ltd"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              placeholder="https://www.yourcompany.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="additional_requirements">Additional Requirements</Label>
            <Textarea
              id="additional_requirements"
              value={formData.additional_requirements}
              onChange={(e) => handleInputChange('additional_requirements', e.target.value)}
              placeholder="Tell us about your campaign objectives, target audience, creative requirements, or any specific needs..."
              rows={3}
            />
          </div>

          <Button 
            type="submit" 
            size="lg" 
            className="w-full" 
            disabled={isSubmitting || !formData.first_name || !formData.last_name || !formData.contact_email}
          >
            {isSubmitting ? 'Submitting Quote Request...' : 'Submit Quote Request'}
          </Button>

          <div className="text-center pt-2">
            <p className="text-sm text-muted-foreground">
              Have an account?{' '}
              <Button 
                variant="link" 
                className="p-0 h-auto font-semibold text-primary" 
                onClick={() => navigate('/auth')}
              >
                Sign in for faster checkout
              </Button>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}