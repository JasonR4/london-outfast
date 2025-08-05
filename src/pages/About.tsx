import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Building, Cross, Ticket, ShoppingBag, Briefcase, Clock, DollarSign, Users, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ContentPage {
  id: string;
  slug: string;
  title: string;
  meta_description: string | null;
  content: any;
  status: string;
}

const About = () => {
  const [pageData, setPageData] = useState<ContentPage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAboutPage();
  }, []);

  const fetchAboutPage = async () => {
    try {
      const { data, error } = await supabase
        .from('content_pages')
        .select('*')
        .eq('slug', 'about')
        .eq('status', 'published')
        .single();

      if (error) {
        console.error('Error fetching about page:', error);
      } else {
        setPageData(data);
      }
    } catch (error) {
      console.error('Error fetching about page:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'building':
        return <Building className="h-8 w-8 text-primary" />;
      case 'cross':
        return <Cross className="h-8 w-8 text-primary" />;
      case 'ticket':
        return <Ticket className="h-8 w-8 text-primary" />;
      case 'shopping-bag':
        return <ShoppingBag className="h-8 w-8 text-primary" />;
      case 'briefcase':
        return <Briefcase className="h-8 w-8 text-primary" />;
      case 'clock':
        return <Clock className="h-8 w-8 text-primary" />;
      case 'pound':
        return <DollarSign className="h-8 w-8 text-primary" />;
      case 'users':
        return <Users className="h-8 w-8 text-primary" />;
      case 'service':
        return <Settings className="h-8 w-8 text-primary" />;
      default:
        return <div className="h-8 w-8 bg-primary/20 rounded" />;
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
          <p>The about page content could not be loaded.</p>
        </div>
      </div>
    );
  }

  const { content } = pageData;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/10 to-secondary/5">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            {content.hero_title || 'About Us'}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {content.hero_description || 'Learn more about our company'}
          </p>
        </div>
      </section>

      {/* Sections */}
      <div className="py-16 px-4">
        <div className="max-w-6xl mx-auto space-y-20">
          {content.sections?.map((section: any, index: number) => (
            <div key={section.id || index}>
              {section.type === 'text_with_media' && (
                <div className={`${
                  section.layout === 'text_only' ? 'text-center max-w-4xl mx-auto' : 
                  `grid md:grid-cols-2 gap-12 items-center ${
                    section.layout === 'media_left_text_right' ? 'md:grid-cols-2' : ''
                  }`
                }`}>
                  <div className={section.layout === 'media_left_text_right' ? 'md:order-2' : ''}>
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
                  {section.layout !== 'text_only' && (
                    <div className={section.layout === 'media_left_text_right' ? 'md:order-1' : ''}>
                      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                        {section.media_url ? (
                          section.media_type === 'video' ? (
                            <video src={section.media_url} controls className="w-full h-full rounded-lg" />
                          ) : (
                            <img src={section.media_url} alt={section.title} className="w-full h-full object-cover rounded-lg" />
                          )
                        ) : (
                          <p className="text-muted-foreground">
                            {section.media_type === 'video' ? 'Video Placeholder' : 'Image Placeholder'}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {section.type === 'industries_accordion' && (
                <div className="max-w-4xl mx-auto">
                  <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold mb-2">{section.title}</h2>
                    <p className="text-lg text-muted-foreground">{section.subtitle}</p>
                  </div>
                  <Accordion type="single" collapsible className="w-full space-y-4">
                    {section.industries?.map((industry: any, idx: number) => (
                      <AccordionItem key={industry.id || idx} value={industry.id || `industry-${idx}`} className="border rounded-lg px-6">
                        <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline">
                          <div className="flex items-center gap-3">
                            {industry.icon && industry.icon.trim() !== '' && (
                              <span className="text-2xl">{industry.icon}</span>
                            )}
                            <span>{industry.title}</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground pt-4">
                          <div className="flex justify-between items-start gap-4">
                            <p className="flex-1">{industry.description}</p>
                            {industry.url && industry.url !== '/quote' && (
                              <Button asChild variant="outline" size="sm">
                                <Link to={industry.url}>Learn More</Link>
                              </Button>
                            )}
                            {industry.url === '/quote' && (
                              <Button asChild variant="default" size="sm">
                                <Link to={industry.url}>Get Quote</Link>
                              </Button>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              )}

              {section.type === 'feature_grid' && (
                <div className="text-center">
                  <h2 className="text-3xl font-bold mb-12">{section.title}</h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {section.features?.map((feature: any, idx: number) => (
                      <Card key={idx} className="p-6">
                        <CardContent className="text-center space-y-4">
                          <div className="flex justify-center">
                            {getIcon(feature.icon)}
                          </div>
                          <h3 className="font-semibold text-lg">{feature.title}</h3>
                          <p className="text-muted-foreground text-sm">
                            {feature.description}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {section.type === 'media_gallery' && (
                <div className="text-center">
                  <h2 className="text-3xl font-bold mb-6">{section.title}</h2>
                  <p className="text-lg text-muted-foreground mb-12">
                    {section.content}
                  </p>
                  <div className="grid md:grid-cols-3 gap-6">
                    {section.gallery?.length > 0 ? (
                      section.gallery.map((image: string, idx: number) => (
                        <div key={idx} className="aspect-square bg-muted rounded-lg overflow-hidden">
                          <img src={image} alt={`Team member ${idx + 1}`} className="w-full h-full object-cover" />
                        </div>
                      ))
                    ) : (
                      <>
                        {[1, 2, 3].map((idx) => (
                          <div key={idx} className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                            <p className="text-muted-foreground">Team Photo {idx}</p>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              )}

              {section.type === 'video_section' && (
                <div className="text-center">
                  <h2 className="text-3xl font-bold mb-6">{section.title}</h2>
                  <p className="text-lg text-muted-foreground mb-8">
                    {section.content}
                  </p>
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center max-w-4xl mx-auto">
                    {section.video_url ? (
                      <video src={section.video_url} controls className="w-full h-full rounded-lg" />
                    ) : (
                      <p className="text-muted-foreground">Office Tour Video Placeholder</p>
                    )}
                  </div>
                </div>
              )}

              {section.type === 'testimonial_carousel' && (
                <div className="text-center">
                  <h2 className="text-3xl font-bold mb-12">{section.title}</h2>
                  <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {section.testimonials?.map((testimonial: any, idx: number) => (
                      <Card key={idx} className="p-6">
                        <CardContent className="space-y-4">
                          <blockquote className="text-lg italic">
                            "{testimonial.quote}"
                          </blockquote>
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                              {testimonial.avatar ? (
                                <img src={testimonial.avatar} alt={testimonial.author} className="w-full h-full rounded-full" />
                              ) : (
                                <span className="text-sm font-semibold">
                                  {testimonial.author?.charAt(0) || 'T'}
                                </span>
                              )}
                            </div>
                            <div className="text-left">
                              <p className="font-semibold">{testimonial.author}</p>
                              <p className="text-sm text-muted-foreground">{testimonial.company}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default About;