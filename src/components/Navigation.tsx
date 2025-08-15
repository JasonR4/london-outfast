import { useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Menu, Phone, ChevronDown, ShoppingCart } from "lucide-react";
import { useState, useEffect } from "react";
import useGlobalSettings from '@/hooks/useGlobalSettings';
import { useQuotes } from '@/hooks/useQuotes';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { trackBriefCtaClicked } from '@/utils/analytics';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const { navigation, loading } = useGlobalSettings();
  
  // Debug logging
  console.log('Navigation Debug:', { navigation, loading });
  const { currentQuote } = useQuotes();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setUserProfile(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

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

  const isActive = (path: string) => location.pathname === path;

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  if (loading || !navigation) {
    return (
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link 
              to="/"
              className="font-bold text-xl bg-gradient-hero bg-clip-text text-transparent"
            >
              Media Buying London
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link 
            to={navigation.logo?.url || '/'}
            className="font-bold text-xl bg-gradient-hero bg-clip-text text-transparent"
          >
            {navigation.logo?.text || 'Media Buying London'}
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.menu_items?.map((item: any, index: number) => {
              if (item.type === 'dropdown' && item.submenu) {
                return (
                  <DropdownMenu key={index}>
                    <DropdownMenuTrigger asChild>
                      <button className={`flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary ${
                        item.submenu.some((subItem: any) => isActive(subItem.url)) ? 'text-primary' : 'text-muted-foreground'
                      }`}>
                        {item.label}
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-background border border-border shadow-lg z-50">
                      {(() => {
                        const isAbout = (item.label?.toLowerCase?.() === 'about') || item.url === '/about'
                        const enrichedSubmenu = isAbout
                          ? (() => {
                              const hasFAQs = item.submenu?.some((s: any) => s?.url === '/faqs' || s?.label?.toLowerCase?.().includes('faq'))
                              return hasFAQs ? item.submenu : [...item.submenu, { label: 'FAQs', url: '/faqs' }]
                            })()
                          : item.submenu

                        return enrichedSubmenu.map((subItem: any, subIndex: number) => (
                          <DropdownMenuItem asChild key={subIndex}>
                            <Link
                              to={subItem.url}
                              className={`cursor-pointer hover:bg-muted ${
                                isActive(subItem.url) ? 'bg-muted text-primary' : ''
                              }`}
                            >
                              {subItem.label}
                            </Link>
                          </DropdownMenuItem>
                        ))
                      })()}
                    </DropdownMenuContent>
                  </DropdownMenu>
                );
              }
              
              return (
                <Link
                  key={index}
                  to={item.url}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    isActive(item.url) ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            {!navigation.menu_items?.some((item: any) => item.url === '/media-buying-rates-london') && (
              <Link
                to={'/media-buying-rates-london'}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive('/media-buying-rates-london') ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                Rates
              </Link>
            )}
            {!navigation.menu_items?.some((item: any) => item.url === '/brief') && (
              <Button 
                asChild
                className="bg-london-blue hover:bg-london-blue/90 text-white"
                size="sm"
              >
                <Link
                  to={'/brief'}
                  onClick={() => trackBriefCtaClicked({ location: "London" })}
                >
                  Brief Us Today
                </Link>
              </Button>
            )}
            {!navigation.menu_items?.some((item: any) => item.url === '/blog') && (
              <Link
                to={'/blog'}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive('/blog') ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                Blog
              </Link>
            )}
            
            {/* Your Plan Button - Show if user is client or has active quote */}
            {(userProfile?.role === 'client' || (currentQuote && currentQuote.quote_items && currentQuote.quote_items.length > 0)) && (
              <Button 
                asChild
                variant={isActive('/quote-plan') ? "default" : "outline"}
                size="sm"
                className="relative"
              >
                <Link to="/quote-plan">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Your Plan
                  {currentQuote && currentQuote.quote_items && currentQuote.quote_items.length > 0 && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {currentQuote.quote_items.length}
                    </Badge>
                  )}
                </Link>
              </Button>
            )}
            
            <Button 
              asChild
              variant="outline"
              size="sm"
            >
              <a href='tel:+442045243019'>
                <Phone className="h-4 w-4 mr-2" />
                +44 204 524 3019
              </a>
            </Button>
          </div>

          {/* Mobile Nav */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex flex-col space-y-4 mt-8">
                {navigation.menu_items?.map((item: any, index: number) => {
                  if (item.type === 'dropdown' && item.submenu) {
                    return (
                      <Collapsible key={index}>
                        <CollapsibleTrigger asChild>
                          <button className="flex items-center justify-between w-full text-left text-lg font-medium transition-colors hover:text-primary text-muted-foreground">
                            {item.label}
                            <ChevronDown className="h-4 w-4" />
                          </button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pl-4 space-y-2 mt-2">
                          {(() => {
                            const isAbout = (item.label?.toLowerCase?.() === 'about') || item.url === '/about'
                            const enrichedSubmenu = isAbout
                              ? (() => {
                                  const hasFAQs = item.submenu?.some((s: any) => s?.url === '/faqs' || s?.label?.toLowerCase?.().includes('faq'))
                                  return hasFAQs ? item.submenu : [...item.submenu, { label: 'FAQs', url: '/faqs' }]
                                })()
                              : item.submenu

                            return enrichedSubmenu.map((subItem: any, subIndex: number) => (
                              <Link
                                key={subIndex}
                                to={subItem.url}
                                onClick={() => setIsOpen(false)}
                                className={`block w-full text-left text-base font-medium transition-colors hover:text-primary ${
                                  isActive(subItem.url) ? 'text-primary' : 'text-muted-foreground'
                                }`}
                              >
                                {subItem.label}
                              </Link>
                            ))
                          })()}
                        </CollapsibleContent>
                      </Collapsible>
                    );
                  }
                  
                  return (
                    <Link
                      key={index}
                      to={item.url}
                      onClick={() => setIsOpen(false)}
                      className={`text-left text-lg font-medium transition-colors hover:text-primary ${
                        isActive(item.url) ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
                {!navigation.menu_items?.some((item: any) => item.url === '/media-buying-rates-london') && (
                  <Link
                    to={'/media-buying-rates-london'}
                    onClick={() => setIsOpen(false)}
                    className={`text-left text-lg font-medium transition-colors hover:text-primary ${
                      isActive('/media-buying-rates-london') ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    Rates
                  </Link>
                )}
                {!navigation.menu_items?.some((item: any) => item.url === '/brief') && (
                  <Button 
                    asChild
                    className="bg-london-blue hover:bg-london-blue/90 text-white w-full mt-4"
                  >
                    <Link
                      to={'/brief'}
                      onClick={() => {
                        trackBriefCtaClicked({ location: "London" });
                        setIsOpen(false);
                      }}
                    >
                      Brief Us Today
                    </Link>
                  </Button>
                )}
                {!navigation.menu_items?.some((item: any) => item.url === '/blog') && (
                  <Link
                    to={'/blog'}
                    onClick={() => setIsOpen(false)}
                    className={`text-left text-lg font-medium transition-colors hover:text-primary ${
                      isActive('/blog') ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    Blog
                  </Link>
                )}
                
                {/* Mobile Your Plan Button - Show if user is client or has active quote */}
                {(userProfile?.role === 'client' || (currentQuote && currentQuote.quote_items && currentQuote.quote_items.length > 0)) && (
                <Button 
                  asChild
                  variant={isActive('/quote-plan') ? "default" : "outline"}
                  className="w-full mt-4"
                >
                  <Link to="/quote-plan" onClick={() => setIsOpen(false)}>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Your Plan {currentQuote && currentQuote.quote_items && currentQuote.quote_items.length > 0 && `(${currentQuote.quote_items.length})`}
                  </Link>
                </Button>
                )}
                
                {/* Client Portal / Sign in */}
                {user ? (
                <Button 
                  asChild
                  className="w-full mt-4"
                >
                  <Link to="/client-portal" onClick={() => setIsOpen(false)}>
                    Client Portal
                  </Link>
                </Button>
                ) : (
                <Button 
                  asChild
                  className="w-full mt-4"
                >
                  <Link to="/auth" onClick={() => setIsOpen(false)}>
                    Sign in
                  </Link>
                </Button>
                )}

                <Button 
                  asChild
                  className="w-full mt-4"
                >
                  <a href='tel:+442045243019' onClick={() => setIsOpen(false)}>
                    <Phone className="h-4 w-4 mr-2" />
                    +44 204 524 3019
                  </a>
                </Button>
              </div>
            </SheetContent>
          </Sheet>

        </div>
      </div>
    </nav>
  );
};

export default Navigation;
