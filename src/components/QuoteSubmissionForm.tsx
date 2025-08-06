import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuotes, Quote } from '@/hooks/useQuotes';
import { CheckCircle } from 'lucide-react';

interface QuoteSubmissionFormProps {
  quote: Quote;
}

export function QuoteSubmissionForm({ quote }: QuoteSubmissionFormProps) {
  const { submitQuote } = useQuotes();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    contact_email: '',
    contact_phone: '',
    company_name: '',
    website: '',
    additional_requirements: ''
  });

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
            <Label htmlFor="additional_requirements">Campaign Details & Requirements</Label>
            <Textarea
              id="additional_requirements"
              value={formData.additional_requirements}
              onChange={(e) => handleInputChange('additional_requirements', e.target.value)}
              placeholder="Tell us about your campaign objectives, target audience, creative requirements, or any specific needs..."
              rows={3}
            />
          </div>

          {/* Disclaimer */}
          <div className="bg-muted/50 rounded-lg p-4 border border-border">
            <div className="flex items-start gap-2">
              <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="h-2 w-2 rounded-full bg-primary/60"></div>
              </div>
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">Important Quote Information:</p>
                <ul className="space-y-1 text-xs">
                  <li>• This quote is subject to validation based on precise media location selection and availability</li>
                  <li>• Final pricing may vary depending on specific site availability and campaign dates</li>
                  <li>• This quote is valid for 30 days from the date of issue</li>
                  <li>• No booking is confirmed until a signed contract is returned and deposit received</li>
                  <li>• All campaigns are subject to our standard terms and conditions</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting || !formData.first_name || !formData.last_name || !formData.contact_email}
            >
              {isSubmitting ? 'Submitting Quote Request...' : 'Submit Quote Request'}
            </Button>
          </div>

          <div className="text-xs text-muted-foreground text-center">
            By submitting this request, you agree to receive communication regarding your quote and our services.
          </div>
        </form>
      </CardContent>
    </Card>
  );
}