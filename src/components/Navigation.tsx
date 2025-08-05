import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useState } from "react";

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Get Quote", path: "/quote" },
    { name: "OOH Formats", path: "/outdoor-media" }
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <button 
            onClick={() => handleNavigation('/')}
            className="font-bold text-xl bg-gradient-hero bg-clip-text text-transparent"
          >
            Media Buying London
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive(item.path) ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {item.name}
              </button>
            ))}
            <Button 
              onClick={() => window.location.href = "tel:+442080680220"}
              variant="outline"
              size="sm"
            >
              Call: 020 8068 0220
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
                {navItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className={`text-left text-lg font-medium transition-colors hover:text-primary ${
                      isActive(item.path) ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
                <Button 
                  onClick={() => window.location.href = "tel:+442080680220"}
                  className="w-full mt-4"
                >
                  Call: 020 8068 0220
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