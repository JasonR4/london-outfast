import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Mail, ArrowRight, Clock } from 'lucide-react';

export default function AccountCreated() {
  useEffect(() => {
    document.title = 'Account Created - Media Buying London';
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
          
          <h1 className="text-3xl font-bold mb-4">Account Created Successfully!</h1>
          
          <p className="text-lg text-muted-foreground mb-8">
            We've sent a verification email to confirm your account. Please check your inbox and click the verification link to activate your client portal.
          </p>

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