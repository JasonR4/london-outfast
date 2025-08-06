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
            Thank you for your quote request. Follow these simple steps to ensure fast delivery and seamless campaign management.
          </p>

          {/* Step Guide */}
          <div className="space-y-6 mb-8">
            <div className="flex items-start gap-4 p-6 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">
                1
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Create Your Account</h3>
                <p className="text-muted-foreground mb-3">
                  Unlock premium access to manage your campaigns, track delivery, and access exclusive features.
                </p>
                <Button asChild size="sm">
                  <Link to="/create-account">
                    Create Account Now
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 bg-muted/30 rounded-lg">
              <div className="flex-shrink-0 w-8 h-8 bg-muted-foreground text-background rounded-full flex items-center justify-center font-semibold">
                2
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Review Your Media Plan</h3>
                <p className="text-muted-foreground">
                  You'll be emailed when your confirmed media plan is ready within your account for review. Access detailed campaign information, costs, and timelines.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 bg-muted/30 rounded-lg">
              <div className="flex-shrink-0 w-8 h-8 bg-muted-foreground text-background rounded-full flex items-center justify-center font-semibold">
                3
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Approve or Discuss</h3>
                <p className="text-muted-foreground">
                  Approve your campaign, request changes, or speak directly with your dedicated account manager to optimize your media plan.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 bg-muted/30 rounded-lg">
              <div className="flex-shrink-0 w-8 h-8 bg-muted-foreground text-background rounded-full flex items-center justify-center font-semibold">
                4
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Campaign Goes Live</h3>
                <p className="text-muted-foreground">
                  Once confirmed, your campaign launches with real-time tracking, proof of postings, and performance analytics in your portal.
                </p>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Mail className="h-5 w-5" />
                  Media Plan Access
                </CardTitle>
                <CardDescription>
                  View detailed campaign breakdowns, costs, and scheduling in your personal dashboard
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Phone className="h-5 w-5" />
                  Campaign Management
                </CardTitle>
                <CardDescription>
                  Real-time campaign tracking, performance metrics, and direct communication with your account team
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CheckCircle className="h-5 w-5" />
                  Proof of Postings
                </CardTitle>
                <CardDescription>
                  Receive photo evidence of your campaigns live, creative design support, and delivery confirmation
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/create-account">
                Create Account for Premium Access
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