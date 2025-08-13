import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import useGlobalSettings from '@/hooks/useGlobalSettings';
import IndustriesDropdown from './IndustriesDropdown';

const Footer = () => {
  
  const { navigation, footer, loading } = useGlobalSettings();

  if (loading || !footer) {
    return (
      <footer className="bg-muted/30 border-t border-border py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Media Buying London. All rights reserved.</p>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-gradient-to-br from-muted/20 via-muted/30 to-muted/40 border-t border-border">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 lg:gap-8">
          
          {/* Company Info - Spans 2 columns */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h3 className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent mb-4">
                {footer.company?.name || 'Media Buying London'}
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-6 max-w-sm">
                <strong className="text-foreground">Media Buying London — Specialist OOH Media Buyers</strong><br />
                Same-day quotes and unbeatable rates for London Underground (TfL), roadside billboards, buses, taxis, rail, retail & leisure, airports, street furniture, programmatic DOOH, and ambient formats. No retainers. No delays. Just the fastest route to market in London.
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary">📞</span>
                </div>
                <a href="tel:+442045243019" className="font-medium hover:text-primary transition-colors">+44 204 524 3019</a>
              </div>
              {footer.company?.email && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary">✉️</span>
                  </div>
                  <span className="font-medium">{footer.company.email}</span>
                </div>
              )}
            </div>
          </div>

          {/* Services Links */}
          {footer.links?.services && (
            <div>
              <h4 className="text-lg font-bold mb-6 text-foreground">Services</h4>
              <div className="space-y-3">
                {footer.links.services.map((link: any, index: number) => (
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
          )}

          {/* Industries Dropdown */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-foreground">Industries</h4>
            <IndustriesDropdown />
          </div>

          {/* Company Links */}
          {footer.links?.company && (
            <div>
              <h4 className="text-lg font-bold mb-6 text-foreground">Company</h4>
              <div className="space-y-3">
                <Link 
                  to="/what-is-media-buying-in-london"
                  className="block text-sm text-muted-foreground hover:text-primary transition-colors duration-200 text-left font-medium"
                >
                  What is Media Buying in London?
                </Link>
                {footer.links.company.map((link: any, index: number) => (
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
          )}

          {/* Legal Links */}
          {footer.links?.legal && (
            <div>
              <h4 className="text-lg font-bold mb-6 text-foreground">Legal</h4>
              <div className="space-y-3">
                {footer.links.legal.map((link: any, index: number) => (
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
          )}

        </div>
        
        {/* Bottom Section */}
        <div className="mt-16 pt-8 border-t border-border/50">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              {footer.copyright || '© 2024 Media Buying London. All rights reserved.'}
            </div>
            <div className="flex items-center gap-6">
              <Link 
                to={'/cms'}
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