import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";

interface Industry {
  slug: string;
  title: string;
  displayName: string;
}

const industries: Industry[] = [
  { slug: "automotive", title: "Out-of-Home Advertising for Automotive Industry", displayName: "Automotive" },
  { slug: "agencies", title: "Out-of-Home Advertising for Agencies & In-House Teams", displayName: "Agencies & In-House Teams" },
  { slug: "beauty", title: "Out-of-Home Advertising for Beauty & Wellness", displayName: "Beauty & Wellness" },
  { slug: "construction", title: "Out-of-Home Advertising for Construction & Trade", displayName: "Construction & Trade" },
  { slug: "education", title: "Out-of-Home Advertising for Education Sector", displayName: "Education" },
  { slug: "entertainment", title: "Out-of-Home Advertising for Entertainment Industry", displayName: "Entertainment" },
  { slug: "events", title: "Out-of-Home Advertising for Events & Entertainment", displayName: "Events & Entertainment" },
  { slug: "fashion", title: "Out-of-Home Advertising for Fashion & Lifestyle", displayName: "Fashion & Lifestyle" },
  { slug: "financial-services", title: "Out-of-Home Advertising for Financial Services", displayName: "Financial Services" },
  { slug: "food", title: "Out-of-Home Advertising for Food & Drink", displayName: "Food & Drink" },
  { slug: "government", title: "Out-of-Home Advertising for Government & Public Sector", displayName: "Government & Public Sector" },
  { slug: "healthcare", title: "Out-of-Home Advertising for Healthcare Industry", displayName: "Healthcare" },
  { slug: "property", title: "Out-of-Home Advertising for Property & Real Estate", displayName: "Property & Real Estate" },
  { slug: "recruitment", title: "Out-of-Home Advertising for Recruitment Industry", displayName: "Recruitment" },
  { slug: "retail", title: "Out-of-Home Advertising for Retail Industry", displayName: "Retail" },
  { slug: "startups", title: "Out-of-Home Advertising for Startups & Scaleups", displayName: "Startups & Scaleups" },
  { slug: "technology", title: "Out-of-Home Advertising for Technology Sector", displayName: "Technology" },
  { slug: "travel", title: "Out-of-Home Advertising for Travel & Hospitality", displayName: "Travel & Hospitality" },
];

const IndustriesDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleIndustryClick = (slug: string) => {
    navigate(`/industries/${slug}`);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 font-semibold mb-4 hover:text-primary transition-colors text-left"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        Industries
        <ChevronDown 
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>
      
      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-64 bg-background border border-border rounded-lg shadow-lg z-50">
          <div className="max-h-80 overflow-y-auto">
            <div className="space-y-1 p-2">
              {industries.map((industry) => (
                <button
                  key={industry.slug}
                  onClick={() => handleIndustryClick(industry.slug)}
                  className="block w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
                >
                  {industry.displayName}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IndustriesDropdown;