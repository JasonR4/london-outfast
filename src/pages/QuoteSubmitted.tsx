import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, ArrowRight, Phone, Mail } from 'lucide-react';

export default function QuoteSubmitted() {
  const navigate = useNavigate();

  useEffect(() => {
    // Update page title
    document.title = 'Quote Submitted - OOH London';
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16 animate-fade-in">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full blur-2xl scale-150 animate-pulse"></div>
              <CheckCircle className="relative h-20 w-20 text-primary mx-auto drop-shadow-lg" />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Quote Submitted Successfully!
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Thank you for your quote request. Follow these simple steps to ensure fast delivery and seamless campaign management.
            </p>
          </div>

          {/* Step Guide */}
          <div className="space-y-8 mb-16">
            {/* Step 1 - Active */}
            <div className="group animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="relative p-8 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl border border-primary/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent rounded-t-2xl"></div>
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-xl flex items-center justify-center font-bold text-lg shadow-lg">
                    1
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-3 text-foreground">Create Your Account</h3>
                    <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
                      Unlock premium access to manage your campaigns, track delivery, and access exclusive features designed for professional media buyers.
                    </p>
                    <Button 
                      size="lg" 
                      className="bg-gradient-to-r from-primary to-accent hover:shadow-lg transition-all duration-300 hover:scale-105"
                      onClick={() => {
                        // Get the most recent submitted quote data from session storage
                        const sessionId = localStorage.getItem('quote_session_id_submitted') || localStorage.getItem('quote_session_id');
                        navigate(`/create-account${sessionId ? `?quote=${sessionId}` : ''}`);
                      }}
                    >
                      Create Account Now
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="group animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="relative p-8 bg-gradient-to-r from-muted/50 to-background rounded-2xl border border-border shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-muted-foreground to-muted-foreground/80 text-background rounded-xl flex items-center justify-center font-bold text-lg shadow-md">
                    2
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-3 text-foreground">Review Your Media Plan</h3>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                      You'll be emailed when your confirmed media plan is ready within your account for review. Access detailed campaign information, costs, and timelines all in one place.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="group animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="relative p-8 bg-gradient-to-r from-muted/50 to-background rounded-2xl border border-border shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-muted-foreground to-muted-foreground/80 text-background rounded-xl flex items-center justify-center font-bold text-lg shadow-md">
                    3
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-3 text-foreground">Approve or Discuss</h3>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                      Approve your campaign, request changes, or speak directly with your dedicated account manager to optimize your media plan for maximum impact.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="group animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="relative p-8 bg-gradient-to-r from-muted/50 to-background rounded-2xl border border-border shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-muted-foreground to-muted-foreground/80 text-background rounded-xl flex items-center justify-center font-bold text-lg shadow-md">
                    4
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-3 text-foreground">Campaign Goes Live</h3>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                      Once confirmed, your campaign launches with real-time tracking, proof of postings, and comprehensive performance analytics in your portal.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Premium Features Section */}
          <div className="mb-16 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Premium Account Benefits
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-0 bg-gradient-to-br from-background to-muted/20">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl mb-2">Media Plan Access</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    View detailed campaign breakdowns, costs, and scheduling in your personal dashboard with real-time updates
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-0 bg-gradient-to-br from-background to-muted/20">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-accent/20 to-accent/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Phone className="h-6 w-6 text-accent" />
                  </div>
                  <CardTitle className="text-xl mb-2">Campaign Management</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    Real-time campaign tracking, performance metrics, and direct communication with your dedicated account team
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-0 bg-gradient-to-br from-background to-muted/20">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <CheckCircle className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl mb-2">Proof of Postings</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    Receive photo evidence of your campaigns live, creative design support, and delivery confirmation reports
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-primary to-accent hover:shadow-lg transition-all duration-300 hover:scale-105"
              onClick={() => {
                // Get the most recent submitted quote data from session storage
                const sessionId = localStorage.getItem('quote_session_id_submitted') || localStorage.getItem('quote_session_id');
                navigate(`/create-account${sessionId ? `?quote=${sessionId}` : ''}`);
              }}
            >
              Create Account for Premium Access
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            
            <Button asChild variant="outline" size="lg" className="border-2 hover:bg-muted/50 transition-all duration-300 hover:scale-105">
              <Link to="/">
                Back to Homepage
              </Link>
            </Button>
          </div>

          {/* Contact Section */}
          <div className="text-center pt-8 border-t border-border/50 animate-fade-in" style={{ animationDelay: '0.7s' }}>
            <p className="text-muted-foreground">
              Need immediate assistance? Call us at{' '}
              <a href="tel:+442045243019" className="font-semibold text-primary hover:text-accent transition-colors duration-300 story-link">
                +44 204 524 3019
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}