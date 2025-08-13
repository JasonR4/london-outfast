import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Mail, ArrowRight, Clock, AlertCircle } from 'lucide-react';
import { restorePlanDraft, getAndClearReturnUrl } from '@/utils/auth';
import { trackAccountCreatedFromGate } from '@/utils/analytics';

export default function AccountCreated() {
  const [planRestored, setPlanRestored] = useState(false);
  const [returnUrl, setReturnUrl] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Account Created - Media Buying London';
    
    // Handle plan restoration and return URL
    const handlePostSignup = () => {
      const draft = restorePlanDraft();
      const returnTo = getAndClearReturnUrl();
      
      // Track analytics
      trackAccountCreatedFromGate(draft);
      
      if (draft) {
        setPlanRestored(true);
        // Store draft for the target page to pick up
        try {
          sessionStorage.setItem('restoredPlanDraft', JSON.stringify(draft));
        } catch (error) {
          console.error('Error storing restored plan draft:', error);
        }
      }
      
      if (returnTo) {
        setReturnUrl(returnTo);
        // Auto-redirect after 3 seconds
        setTimeout(() => {
          navigate(returnTo);
        }, 3000);
      }
    };
    
    handlePostSignup();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
          
          <h1 className="text-3xl font-bold mb-4">Account Created Successfully!</h1>
          
          <p className="text-lg text-muted-foreground mb-4">
            We've sent a verification email to confirm your account. Please check your inbox and click the verification link to activate your client portal.
          </p>

          {planRestored && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Your plan has been restored!</span>
              </div>
              <p className="text-sm text-green-700 mt-1">
                Your previous selections have been saved and will be available when you return.
              </p>
            </div>
          )}

          {returnUrl && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 text-blue-800">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">Redirecting you back...</span>
              </div>
              <p className="text-sm text-blue-700 mt-1">
                You'll be automatically returned to your previous page in 3 seconds.
              </p>
              <Button 
                onClick={() => navigate(returnUrl)} 
                size="sm" 
                className="mt-2"
              >
                Go back now
              </Button>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Check Your Email
                </CardTitle>
                <CardDescription>
                  Verification email sent to your inbox
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Quick Activation
                </CardTitle>
                <CardDescription>
                  Usually takes less than 5 minutes
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="bg-muted/50 rounded-lg p-6 mb-8">
            <h3 className="font-semibold mb-2">What happens next?</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Click the verification link in your email</li>
              <li>• Access your client portal automatically</li>
              <li>• View your submitted quote and campaign details</li>
              <li>• Start managing your OOH campaigns with premium features</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/auth">
                Sign In to Portal
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
              Didn't receive the email? Check your spam folder or{' '}
              <a href="mailto:support@mediabuyinglondon.co.uk" className="font-medium text-foreground hover:underline">
                contact support
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}