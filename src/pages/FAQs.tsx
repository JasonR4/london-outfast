import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Link } from 'react-router-dom';

interface ContentPage {
  id: string;
  slug: string;
  title: string;
  meta_description: string | null;
  content: any;
  status: string;
}

const FAQs = () => {
  const [pageData, setPageData] = useState<ContentPage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFAQsPage();
  }, []);

  const fetchFAQsPage = async () => {
    try {
      const { data, error } = await supabase
        .from('content_pages')
        .select('*')
        .eq('slug', 'faqs')
        .eq('status', 'published')
        .single();

      if (error) {
        console.error('Error fetching FAQs page:', error);
      } else {
        setPageData(data);
      }
    } catch (error) {
      console.error('Error fetching FAQs page:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!pageData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
          <p>The FAQs page content could not be loaded.</p>
        </div>
      </div>
    );
  }

  const { content } = pageData;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/10 to-secondary/5">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            {content.hero_title?.split('\n').map((line: string, idx: number) => (
              <span key={idx} className={idx > 0 ? 'block' : ''}>
                {line}
              </span>
            )) || 'FAQs'}
          </h1>
          <div className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {content.hero_description?.split('\n').map((line: string, idx: number) => (
              <p key={idx} className={line.trim() === '' ? 'mb-4' : ''}>
                {line}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <div className="py-16 px-4">
        <div className="max-w-4xl mx-auto space-y-20">
          {content.sections?.map((section: any, index: number) => (
            <div key={section.id || index}>
              {section.type === 'text_with_media' && (
                <div className="text-center max-w-4xl mx-auto">
                  <h2 className="text-3xl font-bold mb-6">{section.title}</h2>
                  <div className="text-lg text-muted-foreground leading-relaxed mb-6">
                    {section.content?.split('\n').map((line: string, idx: number) => (
                      <p key={idx} className={line.trim() === '' ? 'mb-4' : ''}>
                        {line}
                      </p>
                    ))}
                  </div>
                  {section.cta_buttons && (
                    <div className="flex flex-wrap gap-4 justify-center">
                      {section.cta_buttons.map((cta: any, idx: number) => (
                        <Button
                          key={idx}
                          asChild
                          variant={cta.style === 'primary' ? 'default' : 'outline'}
                          size="lg"
                        >
                          <Link to={cta.url}>{cta.text}</Link>
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {section.type === 'faq_accordion' && (
                <div className="max-w-4xl mx-auto">
                  <h2 className="text-3xl font-bold mb-12 text-center">{section.title}</h2>
                  <Accordion type="single" collapsible className="w-full space-y-4">
                    {section.faqs?.map((faq: any, idx: number) => (
                      <AccordionItem key={faq.id || idx} value={faq.id || `item-${idx}`} className="border rounded-lg px-6">
                        <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground pt-4">
                          <div className="prose prose-sm max-w-none">
                            {faq.answer.split('\n').map((line: string, lineIdx: number) => {
                              if (line.trim() === '') {
                                return <br key={lineIdx} />;
                              }
                              if (line.startsWith('•')) {
                                return (
                                  <div key={lineIdx} className="ml-4">
                                    {line}
                                  </div>
                                );
                              }
                              return <p key={lineIdx}>{line}</p>;
                            })}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQs;