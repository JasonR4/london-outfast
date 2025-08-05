import { useNavigate } from "react-router-dom";
import { oohFormats } from "@/data/oohFormats";
import { Separator } from "@/components/ui/separator";

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-muted/30 border-t border-border py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Company Info */}
          <div>
            <h3 className="font-bold text-lg mb-4">Media Buying London</h3>
            <p className="text-sm text-muted-foreground mb-4">
              London's fastest OOH media buying agency. Unbeaten on price, unmatched on speed.
            </p>
            <p className="text-sm">📞 020 8068 0220</p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <div className="space-y-2 text-sm">
              <button onClick={() => navigate('/')} className="block hover:text-primary">Home</button>
              <button onClick={() => navigate('/quote')} className="block hover:text-primary">Get Quote</button>
              <button onClick={() => navigate('/outdoor-media')} className="block hover:text-primary">All OOH Formats</button>
            </div>
          </div>

          {/* OOH Media - First Half */}
          <div>
            <h4 className="font-semibold mb-4">OOH Media</h4>
            <div className="space-y-2 text-sm">
              {oohFormats.slice(0, Math.ceil(oohFormats.length / 2)).map((format) => (
                <button 
                  key={format.id}
                  onClick={() => navigate(`/outdoor-media/${format.slug}`)}
                  className="block hover:text-primary text-left"
                >
                  {format.shortName}
                </button>
              ))}
            </div>
          </div>

          {/* OOH Media - Second Half */}
          <div>
            <h4 className="font-semibold mb-4 opacity-0">OOH Media</h4>
            <div className="space-y-2 text-sm">
              {oohFormats.slice(Math.ceil(oohFormats.length / 2)).map((format) => (
                <button 
                  key={format.id}
                  onClick={() => navigate(`/outdoor-media/${format.slug}`)}
                  className="block hover:text-primary text-left"
                >
                  {format.shortName}
                </button>
              ))}
            </div>
          </div>

        </div>
        
        <Separator className="my-8" />
        
        <div className="text-center text-sm text-muted-foreground">
          <p>&copy; 2024 Media Buying London. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;