import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Menu, Phone, ChevronDown, ShoppingCart } from "lucide-react";
import { useState } from "react";
import useGlobalSettings from '@/hooks/useGlobalSettings';
import { useQuotes } from '@/hooks/useQuotes';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { navigation, loading } = useGlobalSettings();
  const { currentQuote } = useQuotes();

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
            <button 
              onClick={() => handleNavigation('/')}
              className="font-bold text-xl bg-gradient-hero bg-clip-text text-transparent"
            >
              Media Buying London
            </button>
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
          <button 
            onClick={() => handleNavigation(navigation.logo?.url || '/')}
            className="font-bold text-xl bg-gradient-hero bg-clip-text text-transparent"
          >
            {navigation.logo?.text || 'Media Buying London'}
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.menu_items?.map((item: any, index: number) => (
              <button
                key={index}
                onClick={() => handleNavigation(item.url)}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive(item.url) ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </button>
            ))}
            
            {/* Your Plan Button */}
            {currentQuote && currentQuote.quote_items && currentQuote.quote_items.length > 0 && (
              <Button 
                onClick={() => handleNavigation('/quote-plan')}
                variant={isActive('/quote-plan') ? "default" : "outline"}
                size="sm"
                className="relative"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Your Plan
                <Badge variant="secondary" className="ml-2 text-xs">
                  {currentQuote.quote_items.length}
                </Badge>
              </Button>
            )}
            
            {navigation.phone && (
              <Button 
                onClick={() => window.location.href = `tel:${navigation.phone.replace(/\s/g, '')}`}
                variant="outline"
                size="sm"
              >
                <Phone className="h-4 w-4 mr-2" />
                {navigation.phone}
              </Button>
            )}
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
                          {item.submenu.map((subItem: any, subIndex: number) => (
                            <button
                              key={subIndex}
                              onClick={() => handleNavigation(subItem.url)}
                              className={`block w-full text-left text-base font-medium transition-colors hover:text-primary ${
                                isActive(subItem.url) ? 'text-primary' : 'text-muted-foreground'
                              }`}
                            >
                              {subItem.label}
                            </button>
                          ))}
                        </CollapsibleContent>
                      </Collapsible>
                    );
                  }
                  
                  return (
                    <button
                      key={index}
                      onClick={() => handleNavigation(item.url)}
                      className={`text-left text-lg font-medium transition-colors hover:text-primary ${
                        isActive(item.url) ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
                
                {/* Mobile Your Plan Button */}
                {currentQuote && currentQuote.quote_items && currentQuote.quote_items.length > 0 && (
                  <Button 
                    onClick={() => handleNavigation('/quote-plan')}
                    variant={isActive('/quote-plan') ? "default" : "outline"}
                    className="w-full mt-4"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Your Plan ({currentQuote.quote_items.length})
                  </Button>
                )}
                
                {navigation.phone && (
                  <Button 
                    onClick={() => window.location.href = `tel:${navigation.phone.replace(/\s/g, '')}`}
                    className="w-full mt-4"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    {navigation.phone}
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>

        </div>
      </div>
    </nav>
  );
};

export default Navigation;