import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { User, Session } from '@supabase/supabase-js';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ContentEditor } from '@/components/cms/ContentEditor';
import { MediaLibrary } from '@/components/cms/MediaLibrary';
import { PageManager } from '@/components/cms/PageManager';
import { TeamManager } from '@/components/cms/TeamManager';
import { LegalPagesEditor } from '@/components/cms/LegalPagesEditor';
import { GlobalSettings } from '@/components/cms/GlobalSettings';
import { SEOManager } from '@/components/cms/SEOManager';
import IndustryContentManager from '@/components/cms/IndustryContentManager';
import HomepageContentManager from '@/components/cms/HomepageContentManager';
import { RateCardManager } from '@/components/cms/RateCardManager';
import { QuoteManager } from '@/components/cms/QuoteManager';
import { AnalyticsManager } from '@/components/cms/AnalyticsManager';
import { LogOut, FileText, Image, Users, Settings, Globe, Search, ArrowLeft, Scale, Building, Home, Calculator, ClipboardList, BarChart3 } from 'lucide-react';

const CMS = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!session) {
          navigate('/auth');
        } else {
          // Fetch user profile
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      if (!session) {
        navigate('/auth');
      } else {
        fetchUserProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
    } else {
      setUserProfile(data);
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      navigate('/auth');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading CMS...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Check domain access first
  const currentDomain = window.location.hostname;
  const allowedDomains = ['r4advertising.agency', 'localhost', '127.0.0.1'];
  const isDomainAllowed = allowedDomains.some(domain => currentDomain.includes(domain)) || 
                         currentDomain.includes('lovableproject.com'); // Allow Lovable preview domains

  if (!isDomainAllowed) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center text-destructive">Domain Access Restricted</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              CMS access is only available from authorized domains.
            </p>
            <p className="text-sm text-muted-foreground">
              Current domain: <span className="font-medium">{currentDomain}</span>
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate('/')} className="flex-1">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Home
              </Button>
              <Button onClick={handleSignOut} variant="destructive" className="flex-1">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if user has admin/editor access
  if (userProfile && !['super_admin', 'admin', 'editor'].includes(userProfile.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center text-destructive">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              You don't have permission to access the Content Management System.
            </p>
            <p className="text-sm text-muted-foreground">
              Current role: <span className="font-medium">{userProfile.role}</span>
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate('/')} className="flex-1">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Home
              </Button>
              <Button onClick={handleSignOut} variant="destructive" className="flex-1">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Site
            </Button>
            <h1 className="text-2xl font-bold">Media Buying London CMS</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Welcome, {userProfile?.full_name || user.email}
            </span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="quotes" className="space-y-6">
          <TabsList className="grid w-full grid-cols-13">
            <TabsTrigger value="quotes" className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4" />
              Quotes
            </TabsTrigger>
            <TabsTrigger value="homepage" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              Homepage
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Content
            </TabsTrigger>
            <TabsTrigger value="blog" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Blog
            </TabsTrigger>
            <TabsTrigger value="industries" className="flex items-center gap-2">
              <Building className="w-4 h-4" />
              Industries
            </TabsTrigger>
            <TabsTrigger value="legal" className="flex items-center gap-2">
              <Scale className="w-4 h-4" />
              Legal
            </TabsTrigger>
            <TabsTrigger value="media" className="flex items-center gap-2">
              <Image className="w-4 h-4" />
              Media
            </TabsTrigger>
            <TabsTrigger value="pages" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Pages
            </TabsTrigger>
            <TabsTrigger value="rates" className="flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              Rates
            </TabsTrigger>
            <TabsTrigger value="seo" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              SEO
            </TabsTrigger>
            <TabsTrigger value="global" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Global
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="team" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Team
            </TabsTrigger>
          </TabsList>

          <TabsContent value="quotes">
            <QuoteManager />
          </TabsContent>

          <TabsContent value="homepage">
            <Card>
              <CardHeader>
                <CardTitle>Homepage Content Management</CardTitle>
              </CardHeader>
              <CardContent>
                <HomepageContentManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content">
            <Card>
              <CardHeader>
                <CardTitle>Content Management</CardTitle>
              </CardHeader>
              <CardContent>
                <ContentEditor />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="blog">
            <Card>
              <CardHeader>
                <CardTitle>Blog Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Blog management functionality coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="industries">
            <Card>
              <CardHeader>
                <CardTitle>Industry Content Management</CardTitle>
              </CardHeader>
              <CardContent>
                <IndustryContentManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="legal">
            <LegalPagesEditor />
          </TabsContent>

          <TabsContent value="media">
            <Card>
              <CardHeader>
                <CardTitle>Media Library</CardTitle>
              </CardHeader>
              <CardContent>
                <MediaLibrary />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pages">
            <Card>
              <CardHeader>
                <CardTitle>Page Management</CardTitle>
              </CardHeader>
              <CardContent>
                <PageManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rates">
            <RateCardManager />
          </TabsContent>

          <TabsContent value="seo">
            <Card>
              <CardHeader>
                <CardTitle>SEO Management</CardTitle>
              </CardHeader>
              <CardContent>
                <SEOManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="global">
            <Card>
              <CardHeader>
                <CardTitle>Global Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <GlobalSettings />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsManager />
          </TabsContent>

          <TabsContent value="team">
            <Card>
              <CardHeader>
                <CardTitle>Team Management</CardTitle>
              </CardHeader>
              <CardContent>
                <TeamManager userProfile={userProfile} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CMS;