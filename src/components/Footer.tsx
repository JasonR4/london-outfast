import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import IndustriesDropdown from './IndustriesDropdown';

interface FooterProps {
  data: {
    company: { 
      name: string;
      description: string;
      phone: string;
      email: string;
    };
    links: {
      services: Array<{ label: string; url: string }>;
      company: Array<{ label: string; url: string }>;
      legal: Array<{ label: string; url: string }>;
    };
    copyright: string;
  };
}

const Footer = ({ data }: FooterProps) => {
  return (
    <footer className="bg-gradient-to-br from-muted/20 via-muted/30 to-muted/40 border-t border-border">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 lg:gap-8">
          
          {/* Company Info - Spans 2 columns */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h3 className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent mb-4">
                {data.company.name}
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-6 max-w-sm">
                {data.company.description}
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary">📞</span>
                </div>
                <a href={`tel:${data.company.phone}`} className="font-medium hover:text-primary transition-colors">{data.company.phone}</a>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary">✉️</span>
                </div>
                <span className="font-medium">{data.company.email}</span>
              </div>
            </div>
          </div>

          {/* Services Links */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-foreground">Services</h4>
            <div className="space-y-3">
              {data.links.services.map((link, index) => (
                <Link 
                  key={index}
                  to={link.url}
                  className="block text-sm text-muted-foreground hover:text-primary transition-colors duration-200 text-left font-medium"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Industries Dropdown */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-foreground">Industries</h4>
            <IndustriesDropdown />
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-foreground">Company</h4>
            <div className="space-y-3">
              <Link 
                to="/ooh"
                className="block text-sm text-muted-foreground hover:text-primary transition-colors duration-200 text-left font-medium"
              >
                OOH Environments Hub
              </Link>
              <Link 
                to="/what-is-media-buying-in-london"
                className="block text-sm text-muted-foreground hover:text-primary transition-colors duration-200 text-left font-medium"
              >
                What is Media Buying in London?
              </Link>
              <Link 
                to="/ooh-advertising-london"
                className="block text-sm text-muted-foreground hover:text-primary transition-colors duration-200 text-left font-medium"
              >
                OOH Advertising London
              </Link>
              <Link 
                to="/corporate-investment"
                className="block text-sm text-muted-foreground hover:text-primary transition-colors duration-200 text-left font-medium"
              >
                Corporate Investment
              </Link>
              {data.links.company.map((link, index) => (
                <Link 
                  key={index}
                  to={link.url}
                  className="block text-sm text-muted-foreground hover:text-primary transition-colors duration-200 text-left font-medium"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-foreground">Legal</h4>
            <div className="space-y-3">
              {data.links.legal.map((link, index) => (
                <Link 
                  key={index}
                  to={link.url}
                  className="block text-sm text-muted-foreground hover:text-primary transition-colors duration-200 text-left font-medium"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

        </div>

        {/* Get Quote CTA Section */}
        <div className="mt-16 py-12 text-center bg-gradient-cta rounded-2xl">
          <h3 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">
            Ready to Get Your London OOH Quote?
          </h3>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Same-day quotes and unbeatable rates for all London OOH formats
          </p>
          <Button asChild size="lg" className="text-lg px-8 py-6 shadow-glow">
            <Link to="/quote">Get My Quote</Link>
          </Button>
        </div>
        
        {/* Bottom Section */}
        <div className="mt-16 pt-8 border-t border-border/50">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              {data.copyright}
            </div>
            <div className="flex items-center gap-6">
              <Link 
                to="/cms"
                className="text-xs text-muted-foreground hover:text-primary transition-colors duration-200 font-medium"
              >
                Admin
              </Link>
              <div className="text-xs text-muted-foreground">
                Built with ❤️ in London
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;