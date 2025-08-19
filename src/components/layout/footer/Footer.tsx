import { FooterLink } from '@/lib/siteSettings';
import { Link } from 'react-router-dom';

export default function Footer({
  columns,
  bottom = []
}: {
  columns: { title: string; links: FooterLink[] }[];
  bottom?: FooterLink[];
}) {
  return (
    <footer className="bg-gradient-to-r from-slate-900 to-slate-800 text-white">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Company Info */}
          <div className="lg:col-span-1">
            <h3 className="text-xl font-bold mb-4 bg-gradient-hero bg-clip-text text-transparent">
              Media Buying London
            </h3>
            <p className="text-gray-300 mb-6">
              London's premier out-of-home advertising specialists. We help brands reach their audience through strategic OOH placements across the capital.
            </p>
            <div className="space-y-2">
              <p className="text-gray-300">
                <strong>Phone:</strong> +44 204 524 3019
              </p>
            </div>
          </div>

          {/* Dynamic Columns */}
          {columns.map(col => (
            <div key={col.title}>
              <h4 className="text-lg font-semibold mb-4 text-white">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map(l => (
                  <li key={l.href}>
                    <FooterA href={l.href}>{l.label}</FooterA>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          
        </div>
        
        {/* Bottom Section */}
        <div className="border-t border-gray-700 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2024 Media Buying London. All rights reserved.
            </p>
            {!!bottom.length && (
              <div className="flex flex-wrap gap-6">
                {bottom.map(b => (
                  <FooterA key={b.href} href={b.href} className="text-sm">
                    {b.label}
                  </FooterA>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterA({ href, children, className = "" }: { href: string; children: React.ReactNode; className?: string }) {
  const isExternal = href.startsWith('http') || href.startsWith('tel:') || href.startsWith('mailto:');
  const baseClasses = `text-gray-300 hover:text-white transition-colors ${className}`;
  
  if (isExternal) {
    return <a href={href} className={baseClasses}>{children}</a>;
  }
  
  return <Link to={href} className={baseClasses}>{children}</Link>;
}