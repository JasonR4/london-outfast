import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, Search } from "lucide-react";
import { Helmet } from "react-helmet-async";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <>
      <Helmet>
        <title>Page Not Found | Media Buying London</title>
        <meta name="description" content="The page you're looking for doesn't exist. Explore our outdoor media formats and advertising solutions." />
        <meta name="robots" content="noindex,follow" />
      </Helmet>
      
      <div className="min-h-screen flex items-center justify-center px-4 py-16">
        <div className="max-w-2xl text-center">
          <div className="mb-8">
            <h1 className="text-9xl font-bold text-primary mb-4">404</h1>
            <h2 className="text-3xl font-bold mb-4">Page Not Found</h2>
            <p className="text-lg text-muted-foreground mb-8">
              The page you're looking for doesn't exist or has been moved. 
              Explore our outdoor advertising solutions below.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button asChild size="lg">
              <Link to="/">
                <Home className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/outdoor-media">
                <Search className="mr-2 h-4 w-4" />
                Browse Formats
              </Link>
            </Button>
          </div>

          <div className="border-t border-border pt-8">
            <h3 className="text-xl font-semibold mb-4">Popular Pages</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              <Link 
                to="/outdoor-media" 
                className="p-4 border border-border rounded-lg hover:bg-accent transition-colors"
              >
                <h4 className="font-semibold mb-1">Outdoor Media Formats</h4>
                <p className="text-sm text-muted-foreground">Browse all available OOH formats</p>
              </Link>
              <Link 
                to="/quote" 
                className="p-4 border border-border rounded-lg hover:bg-accent transition-colors"
              >
                <h4 className="font-semibold mb-1">Get a Quote</h4>
                <p className="text-sm text-muted-foreground">Request pricing for your campaign</p>
              </Link>
              <Link 
                to="/ooh" 
                className="p-4 border border-border rounded-lg hover:bg-accent transition-colors"
              >
                <h4 className="font-semibold mb-1">OOH Hub</h4>
                <p className="text-sm text-muted-foreground">Learn about outdoor advertising</p>
              </Link>
              <Link 
                to="/contact" 
                className="p-4 border border-border rounded-lg hover:bg-accent transition-colors"
              >
                <h4 className="font-semibold mb-1">Contact Us</h4>
                <p className="text-sm text-muted-foreground">Get in touch with our team</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFound;
