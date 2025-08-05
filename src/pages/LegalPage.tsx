import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { updateMetaTags } from '@/utils/seo';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const LegalPage = () => {
  const navigate = useNavigate();
  const legalSlug = window.location.pathname.slice(1); // Remove leading slash
  const [pageData, setPageData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializePage = async () => {
      if (!legalSlug) {
        navigate('/404');
        return;
      }

      try {
        // Fetch the legal page content
        const { data, error } = await supabase
          .from('content_pages')
          .select('*')
          .eq('slug', legalSlug)
          .eq('status', 'published')
          .maybeSingle();

        if (error) throw error;

        if (!data) {
          navigate('/404');
          return;
        }

        setPageData(data);

        // Update SEO meta tags
        updateMetaTags(
          data.title,
          data.meta_description || `${data.title} - Media Buying London`,
          `https://mediabuyinglondon.co.uk/${legalSlug}`
        );

      } catch (error) {
        console.error('Error loading legal page:', error);
        navigate('/404');
      } finally {
        setLoading(false);
      }
    };

    initializePage();
  }, [legalSlug, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!pageData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">Legal</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            {pageData.title}
          </h1>
          {pageData.meta_description && (
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {pageData.meta_description}
            </p>
          )}
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-8">
              <div className="prose prose-lg max-w-none">
                {pageData.content?.sections?.map((section: any, index: number) => (
                  <div key={index} className="mb-8">
                    {section.heading && (
                      <h2 className="text-2xl font-semibold mb-4 text-foreground">
                        {section.heading}
                      </h2>
                    )}
                    <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {section.content}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="mt-12 text-center">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Questions?</h3>
                <p className="text-muted-foreground mb-4">
                  If you have any questions about this {pageData.title.toLowerCase()}, please contact us:
                </p>
                <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
                  <a 
                    href="mailto:hello@mediabuyinglondon.co.uk" 
                    className="text-primary hover:underline"
                  >
                    hello@mediabuyinglondon.co.uk
                  </a>
                  <span className="hidden md:inline text-muted-foreground">|</span>
                  <a 
                    href="tel:+442079460465" 
                    className="text-primary hover:underline"
                  >
                    020 7946 0465
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalPage;