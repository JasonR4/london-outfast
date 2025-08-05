import { useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import useGlobalSettings from '@/hooks/useGlobalSettings';

const Footer = () => {
  const navigate = useNavigate();
  const { footer, loading } = useGlobalSettings();

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
    <footer className="bg-muted/30 border-t border-border py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Company Info */}
          <div>
            <h3 className="font-bold text-lg mb-4">{footer.company?.name || 'Media Buying London'}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {footer.company?.description || 'London\'s fastest OOH media buying agency. Unbeaten on price, unmatched on speed.'}
            </p>
            {footer.company?.phone && (
              <p className="text-sm">📞 {footer.company.phone}</p>
            )}
            {footer.company?.email && (
              <p className="text-sm">✉️ {footer.company.email}</p>
            )}
          </div>

          {/* Services Links */}
          {footer.links?.services && (
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <div className="space-y-2 text-sm">
                {footer.links.services.map((link: any, index: number) => (
                  <button 
                    key={index}
                    onClick={() => navigate(link.url)}
                    className="block hover:text-primary text-left"
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Company Links */}
          {footer.links?.company && (
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <div className="space-y-2 text-sm">
                {footer.links.company.map((link: any, index: number) => (
                  <button 
                    key={index}
                    onClick={() => navigate(link.url)}
                    className="block hover:text-primary text-left"
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Legal Links */}
          {footer.links?.legal && (
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <div className="space-y-2 text-sm">
                {footer.links.legal.map((link: any, index: number) => (
                  <button 
                    key={index}
                    onClick={() => navigate(link.url)}
                    className="block hover:text-primary text-left"
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
        
        <Separator className="my-8" />
        
        <div className="text-center text-sm text-muted-foreground">
          <p>{footer.copyright || '© 2024 Media Buying London. All rights reserved.'}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;