import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Phone } from "lucide-react";
import { useState } from "react";
import useGlobalSettings from '@/hooks/useGlobalSettings';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { navigation, loading } = useGlobalSettings();

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
              className="flex items-center"
            >
              <img 
                src="/lovable-uploads/169f13ce-765c-47ab-8d8c-9ebc3ea0f24f.png" 
                alt="Media Buying London"
                className="h-10 w-auto"
              />
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
            className="flex items-center"
          >
            <img 
              src="/lovable-uploads/169f13ce-765c-47ab-8d8c-9ebc3ea0f24f.png" 
              alt="Media Buying London"
              className="h-10 w-auto"
            />
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
                {navigation.menu_items?.map((item: any, index: number) => (
                  <button
                    key={index}
                    onClick={() => handleNavigation(item.url)}
                    className={`text-left text-lg font-medium transition-colors hover:text-primary ${
                      isActive(item.url) ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
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