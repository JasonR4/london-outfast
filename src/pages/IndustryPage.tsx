import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import NotFound from "./NotFound";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";
import { updateMetaTags } from "@/utils/seo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface ContentSection {
  type: string;
  title?: string;
  subtitle?: string;
  image?: string;
  items?: Array<{
    title: string;
    description: string;
  }>;
  buttonText?: string;
  buttonLink?: string;
}

interface PageContent {
  sections: ContentSection[];
  description?: string;
}

export default function IndustryPage() {
  const { industrySlug } = useParams();
  const navigate = useNavigate();

  // Fetch page content
  const { data: pageData, isLoading: isPageLoading, error: pageError } = useQuery({
    queryKey: ["industryPage", industrySlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("content_pages")
        .select("*")
        .eq("slug", industrySlug)
        .eq("page_type", "general")
        .eq("status", "published")
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!industrySlug,
  });

  // Fetch SEO data
  const { data: seoData } = useQuery({
    queryKey: ["industrySEO", industrySlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("seo_pages")
        .select("*")
        .eq("page_slug", `/industries/${industrySlug}`)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!industrySlug,
  });

  // Update SEO tags when data is loaded
  useEffect(() => {
    if (seoData && pageData) {
      // Ensure canonical URL is absolute
      const canonicalUrl = seoData.canonical_url?.startsWith('http') 
        ? seoData.canonical_url 
        : `https://mediabuyinglondon.co.uk${seoData.canonical_url || `/industries/${industrySlug}`}`;
      
      updateMetaTags(
        seoData.meta_title,
        seoData.meta_description,
        canonicalUrl,
        seoData
      );
    } else if (pageData) {
      // Fallback when no SEO data exists
      const canonicalUrl = `https://mediabuyinglondon.co.uk/industries/${industrySlug}`;
      updateMetaTags(
        pageData.title,
        pageData.meta_description || '',
        canonicalUrl
      );
    }
  }, [seoData, pageData, industrySlug]);

  if (isPageLoading) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-16">
          <Skeleton className="h-8 w-3/4 mb-4" />
          <Skeleton className="h-4 w-1/2 mb-8" />
          <Skeleton className="h-64 w-full mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-20 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (pageError || !pageData) {
    return <NotFound />;
  }

  const content = pageData.content as unknown as PageContent;

  const renderSection = (section: ContentSection, index: number) => {
    switch (section.type) {
      case "hero":
        return (
          <section key={index} className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Background Image */}
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: section.image ? `url(${section.image})` : 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary-glow)))' }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/95" />
            </div>
            
            {/* Content */}
            <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
              <Badge variant="secondary" className="mb-6 text-lg px-6 py-2">
                {pageData.title}
              </Badge>
              
              <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-hero bg-clip-text text-transparent leading-tight">
                {section.title}
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-4xl mx-auto leading-relaxed">
                {section.subtitle}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  size="lg" 
                  className="text-lg px-8 py-6 shadow-glow"
                  onClick={() => navigate('/quote')}
                >
                  GET MY MEDIA QUOTE
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="text-lg px-8 py-6"
                  onClick={() => navigate('/quote')}
                >
                  REQUEST CALLBACK
                </Button>
              </div>
            </div>
          </section>
        );
      case "features":
        return (
          <section key={index} className="py-20 px-4">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <Badge variant="secondary" className="mb-4 text-lg px-6 py-2">
                  {section.title}
                </Badge>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  Why Choose Our Solutions
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {section.items?.map((item, itemIndex) => (
                  <div key={itemIndex} className="bg-gradient-card border border-border rounded-lg p-6 hover:shadow-card transition-all duration-300 hover:scale-105">
                    <h3 className="text-xl font-bold mb-3 text-foreground">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      case "cta":
        return (
          <section key={index} className="py-20 px-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10" />
            
            <div className="relative z-10 max-w-6xl mx-auto text-center">
              <Badge variant="secondary" className="mb-6 text-lg px-6 py-2">
                READY TO START?
              </Badge>
              
              <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-hero bg-clip-text text-transparent">
                {section.title}
              </h2>
              
              <p className="text-lg text-muted-foreground mb-12 max-w-3xl mx-auto">
                {section.subtitle}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Button 
                  size="lg" 
                  className="text-xl px-12 py-8 shadow-glow"
                  onClick={() => navigate(section.buttonLink || '/quote')}
                >
                  {section.buttonText || 'GET MY MEDIA QUOTE'}
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="text-xl px-12 py-8"
                  onClick={() => navigate('/quote')}
                >
                  REQUEST CALLBACK
                </Button>
              </div>
            </div>
          </section>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      {content.sections.map((section, index) => renderSection(section, index))}
      
      {/* Render description section if it exists */}
      {content.description && (
        <section className="py-20 px-4 bg-gradient-to-b from-background to-muted/10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6 text-lg px-6 py-2">
              INDUSTRY EXPERTISE
            </Badge>
            <div className="prose prose-lg max-w-none text-left">
              <p className="text-lg leading-relaxed whitespace-pre-line text-foreground">
                {content.description}
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}