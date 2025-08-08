import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { User, Session } from '@supabase/supabase-js';
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
import { LogOut, FileText, Image, Users, Settings, Globe, Search, ArrowLeft, Scale, Building, Home, Calculator, ClipboardList, BarChart3, BookOpen, Menu } from 'lucide-react';
import { BlogManager } from '@/components/cms/BlogManager';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

const CMS = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [activeSection, setActiveSection] = useState('quotes');
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

  const menuItems = [
    { id: 'quotes', label: 'Quotes', icon: ClipboardList },
    { id: 'homepage', label: 'Homepage', icon: Home },
    { id: 'content', label: 'Content', icon: FileText },
    { id: 'industries', label: 'Industries', icon: Building },
    { id: 'legal', label: 'Legal', icon: Scale },
    { id: 'media', label: 'Media', icon: Image },
    { id: 'pages', label: 'Pages', icon: Settings },
    { id: 'rates', label: 'Rates', icon: Calculator },
    { id: 'blog', label: 'Blog', icon: BookOpen },
    { id: 'seo', label: 'SEO', icon: Search },
    { id: 'global', label: 'Global', icon: Globe },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'team', label: 'Team', icon: Users },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'quotes':
        return <QuoteManager />;
      case 'homepage':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Homepage Content Management</CardTitle>
            </CardHeader>
            <CardContent>
              <HomepageContentManager />
            </CardContent>
          </Card>
        );
      case 'content':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Content Management</CardTitle>
            </CardHeader>
            <CardContent>
              <ContentEditor />
            </CardContent>
          </Card>
        );
      case 'industries':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Industry Content Management</CardTitle>
            </CardHeader>
            <CardContent>
              <IndustryContentManager />
            </CardContent>
          </Card>
        );
      case 'legal':
        return <LegalPagesEditor />;
      case 'media':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Media Library</CardTitle>
            </CardHeader>
            <CardContent>
              <MediaLibrary />
            </CardContent>
          </Card>
        );
      case 'pages':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Page Management</CardTitle>
            </CardHeader>
            <CardContent>
              <PageManager />
            </CardContent>
          </Card>
        );
      case 'rates':
        return <RateCardManager />;
      case 'blog':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Blog Management</CardTitle>
            </CardHeader>
            <CardContent>
              <BlogManager />
            </CardContent>
          </Card>
        );
      case 'seo':
        return (
          <Card>
            <CardHeader>
              <CardTitle>SEO Management</CardTitle>
            </CardHeader>
            <CardContent>
              <SEOManager />
            </CardContent>
          </Card>
        );
      case 'global':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Global Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <GlobalSettings />
            </CardContent>
          </Card>
        );
      case 'analytics':
        return <AnalyticsManager />;
      case 'team':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Team Management</CardTitle>
            </CardHeader>
            <CardContent>
              <TeamManager userProfile={userProfile} />
            </CardContent>
          </Card>
        );
      default:
        return <QuoteManager />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar className="border-r">
          <SidebarContent>
            <div className="p-4 border-b">
              <div className="flex items-center gap-2 mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/')}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Site
                </Button>
              </div>
              <h1 className="text-lg font-bold text-foreground">MBL CMS</h1>
            </div>
            
            <SidebarGroup>
              <SidebarGroupLabel>Management</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => setActiveSection(item.id)}
                        className={cn(
                          "w-full justify-start",
                          activeSection === item.id && "bg-accent text-accent-foreground"
                        )}
                      >
                        <item.icon className="w-4 h-4 mr-2" />
                        {item.label}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <div className="flex-1 flex flex-col">
          <header className="border-b bg-card">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <h2 className="text-xl font-semibold">
                  {menuItems.find(item => item.id === activeSection)?.label || 'Dashboard'}
                </h2>
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

          <main className="flex-1 p-6 overflow-auto">
            {renderContent()}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default CMS;