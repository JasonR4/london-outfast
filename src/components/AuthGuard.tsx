import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogIn, UserPlus } from 'lucide-react';
import { getCurrentUser } from '@/utils/auth';
import { trackRateGateCTAClicked } from '@/utils/analytics';
import { useNavigate } from 'react-router-dom';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectPath?: string;
  source?: 'summary_guard' | 'add_to_plan' | 'costs_card';
  className?: string;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  fallback,
  redirectPath = '/create-account',
  source = 'summary_guard',
  className = ""
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const user = await getCurrentUser();
      setIsAuthenticated(!!user);
    };
    
    checkAuth();
  }, []);

  const handleLogin = () => {
    trackRateGateCTAClicked(source);
    const currentUrl = window.location.href;
    navigate(`/auth?return=${encodeURIComponent(currentUrl)}`);
  };

  const handleCreateAccount = () => {
    trackRateGateCTAClicked(source);
    const currentUrl = window.location.href;
    navigate(`${redirectPath}?return=${encodeURIComponent(currentUrl)}`);
  };

  // Loading state
  if (isAuthenticated === null) {
    return (
      <div className="min-h-[200px] flex items-center justify-center">
        <div className="text-sm text-muted-foreground">Checking access...</div>
      </div>
    );
  }

  // Authenticated - show children
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Not authenticated - show fallback or default guard
  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <Card className={`border border-border bg-gradient-card ${className}`}>
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="secondary" className="text-xs">
            Account Required
          </Badge>
        </div>
        <CardTitle className="text-lg">Access Client Portal</CardTitle>
        <p className="text-sm text-muted-foreground">
          Sign in to submit quotes and manage campaigns in your client portal.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button 
          onClick={handleCreateAccount}
          className="w-full bg-gradient-primary hover:opacity-90"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Create Free Account
        </Button>
        
        <Button 
          variant="outline" 
          onClick={handleLogin}
          className="w-full"
        >
          <LogIn className="h-4 w-4 mr-2" />
          Login
        </Button>
      </CardContent>
    </Card>
  );
};

export default AuthGuard;