import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, ArrowRight, Phone, Mail } from 'lucide-react';

export default function QuoteSubmitted() {
  useEffect(() => {
    // Update page title
    document.title = 'Quote Submitted - OOH London';
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
          
          <h1 className="text-3xl font-bold mb-4">Quote Submitted Successfully!</h1>
          
          <p className="text-lg text-muted-foreground mb-8">
            Thank you for your quote request. We've received your campaign plan and will get back to you with a detailed quote within 24 hours.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email Quote
                </CardTitle>
                <CardDescription>
                  You'll receive a detailed quote via email within 24 hours
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Expert Consultation
                </CardTitle>
                <CardDescription>
                  Our team may call to discuss your campaign requirements
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="bg-muted/50 rounded-lg p-6 mb-8">
            <h3 className="font-semibold mb-2">What happens next?</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• We'll review your campaign requirements</li>
              <li>• Check availability for your selected periods and locations</li>
              <li>• Prepare a detailed quote with all costs included</li>
              <li>• Send you the quote via email within 24 hours</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/outdoor-media">
                Browse More Formats
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            
            <Button asChild variant="outline" size="lg">
              <Link to="/">
                Back to Homepage
              </Link>
            </Button>
          </div>

          <div className="mt-8 pt-8 border-t">
            <p className="text-sm text-muted-foreground">
              Need immediate assistance? Call us at{' '}
              <a href="tel:+442012345678" className="font-medium text-foreground hover:underline">
                +44 20 1234 5678
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}