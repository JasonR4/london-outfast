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
        .maybeSingle();

      if (error) {
        console.error('Error fetching about page:', error);
      } else {
        console.log('About page data fetched:', data);
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
      case 'dollar-sign':
        return <DollarSign className="h-8 w-8 text-primary" />;
      case 'users':
        return <Users className="h-8 w-8 text-primary" />;
      case 'settings':
        return <Settings className="h-8 w-8 text-primary" />;
      default:
        return <Building className="h-8 w-8 text-primary" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-muted-foreground">Loading epic content...</div>
        </div>
      </div>
    );
  }

  if (!pageData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
          <p className="text-muted-foreground">The about page could not be found.</p>
        </div>
      </div>
    );
  }

  const { content } = pageData;

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Epic Hero Section */}
      <section className="relative py-32 px-4 bg-gradient-to-br from-primary via-primary/90 to-secondary overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full mix-blend-multiply animate-[pulse_4s_ease-in-out_infinite]"></div>
          <div className="absolute top-32 right-10 w-96 h-96 bg-white rounded-full mix-blend-multiply animate-[pulse_6s_ease-in-out_infinite]"></div>
          <div className="absolute bottom-10 left-1/2 w-80 h-80 bg-white rounded-full mix-blend-multiply animate-[pulse_5s_ease-in-out_infinite]"></div>
        </div>
        
        <div className="relative max-w-6xl mx-auto text-center">
          <div className="animate-fade-in">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 text-white leading-tight">
              <span className="block animate-[fade-in_0.6s_ease-out]">
                {content.hero_title || 'About Us'}
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto leading-relaxed animate-[fade-in_0.8s_ease-out_0.2s_both]">
              {content.hero_description || 'Learn more about our company'}
            </p>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-[fade-in_1s_ease-out_1s_both]">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-[pulse_2s_ease-in-out_infinite]"></div>
          </div>
        </div>
      </section>

      {/* Epic Sections Container */}
      <div className="relative bg-gradient-to-b from-background via-background/95 to-background">
        {content.sections?.map((section: any, index: number) => (
          <div 
            key={section.id || index}
            className={`py-24 px-4 relative overflow-hidden animate-[fade-in_0.8s_ease-out_${index * 0.2}s_both]`}
          >
            {/* Section Background Effects */}
            <div className="absolute inset-0 opacity-5">
              <div className={`absolute ${index % 2 === 0 ? 'top-0 right-0' : 'bottom-0 left-0'} w-96 h-96 bg-gradient-to-br from-primary to-secondary rounded-full blur-3xl`}></div>
            </div>

            <div className="relative max-w-6xl mx-auto">
              {(section.type === 'text_with_media' || section.type === 'text') && (
                <div className={`${
                  section.layout === 'text_only' || !section.layout ? 'text-center max-w-5xl mx-auto' : 
                  `grid lg:grid-cols-2 gap-16 items-center ${
                    section.layout === 'media_left_text_right' ? 'lg:grid-cols-2' : ''
                  }`
                }`}>
                  <div className={`${section.layout === 'media_left_text_right' ? 'lg:order-2' : ''} hover-scale`}>
                    {/* Epic Title with Gradient */}
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent leading-tight">
                      {section.title}
                    </h2>
                    
                    {/* Enhanced Content */}
                    <div className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8 space-y-4">
                      {section.content?.split('\n').map((line: string, idx: number) => (
                         <p 
                           key={idx} 
                           className={`${line.trim() === '' ? 'mb-6' : ''} animate-[fade-in_0.6s_ease-out_${idx * 0.1}s_both] hover:text-foreground transition-colors duration-300`}
                         >
                           {line}
                         </p>
                      ))}
                    </div>
                    
                    {/* Epic CTA Buttons */}
                    {section.cta_buttons && (
                      <div className="flex flex-wrap gap-6 justify-center">
                        {section.cta_buttons.map((cta: any, idx: number) => (
                          <Button
                            key={idx}
                            asChild
                            variant={cta.style === 'primary' ? 'default' : 'outline'}
                            size="lg"
                            className={`
                              group relative overflow-hidden px-8 py-6 text-lg font-semibold
                              ${cta.style === 'primary' ? 
                                'bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl' : 
                                'border-2 hover:bg-primary hover:text-primary-foreground hover:border-primary'
                              }
                              transition-all duration-300 hover:scale-105 hover:-translate-y-1
                              animate-[scale-in_0.6s_ease-out_${idx * 0.1}s_both]
                            `}
                          >
                            <Link to={cta.url} className="story-link">
                              {cta.text}
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                            </Link>
                          </Button>
                        ))}
                      </div>
                    )}

                    {/* Add Industries CTA Button after "Who We Work With" section */}
                    {section.title === "Who We Work With" && (
                      <div className="mt-12 flex justify-center">
                        <Button
                          asChild
                          variant="outline"
                          size="lg"
                          className="group relative overflow-hidden px-12 py-6 text-xl font-semibold border-2 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 hover:scale-105 hover:-translate-y-1 animate-[scale-in_0.8s_ease-out_1s_both]"
                        >
                          <Link to="/industries" className="story-link">
                            Explore All Industries
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {/* Epic Media Container */}
                  {(section.layout !== 'text_only' && section.layout && section.media_url) && (
                    <div className={`${section.layout === 'media_left_text_right' ? 'lg:order-1' : ''} group`}>
                      <div className="relative aspect-video bg-gradient-to-br from-muted to-muted/50 rounded-2xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105">
                        {section.media_url ? (
                          section.media_type === 'video' ? (
                            <video 
                              src={section.media_url} 
                              controls 
                              className="w-full h-full object-cover rounded-2xl group-hover:scale-110 transition-transform duration-700" 
                            />
                          ) : (
                            <img 
                              src={section.media_url} 
                              alt={section.title} 
                              className="w-full h-full object-cover rounded-2xl group-hover:scale-110 transition-transform duration-700" 
                            />
                          )
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <p className="text-2xl text-muted-foreground font-medium">
                              {section.media_type === 'video' ? '🎬 Video Placeholder' : '🖼️ Image Placeholder'}
                            </p>
                          </div>
                        )}
                        
                        {/* Overlay Effect */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Epic Industries Accordion */}
              {section.type === 'industries_accordion' && (
                <div className="text-center max-w-5xl mx-auto">
                  <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                    {section.title}
                  </h2>
                  <p className="text-xl text-muted-foreground mb-16">
                    {section.subtitle}
                  </p>
                  
                  <Accordion type="multiple" className="space-y-4">
                    {section.industries?.map((industry: any, idx: number) => (
                      <AccordionItem 
                        key={industry.id || idx} 
                        value={industry.id || idx.toString()}
                        className={`
                          border-2 border-muted rounded-2xl px-6 py-2 
                          hover:border-primary/50 hover:shadow-lg
                          transition-all duration-300 hover:scale-[1.02]
                          animate-[fade-in_0.6s_ease-out_${idx * 0.1}s_both]
                        `}
                      >
                        <AccordionTrigger className="text-left text-lg font-semibold hover:text-primary transition-colors duration-300 hover:no-underline">
                          <div className="flex items-center gap-4">
                            {industry.icon && getIcon(industry.icon)}
                            <span className="story-link">{industry.title}</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed pt-4 animate-accordion-down">
                          <p>{industry.description}</p>
                          {industry.url && (
                            <Link 
                              to={industry.url} 
                              className="inline-flex items-center gap-2 mt-4 text-primary hover:text-primary/80 font-medium story-link transition-colors duration-300"
                            >
                              Learn More →
                            </Link>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              )}

              {/* Epic Media Gallery */}
              {section.type === 'media_gallery' && (
                <div className="text-center">
                  <h2 className="text-4xl md:text-5xl font-bold mb-8 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                    {section.title}
                  </h2>
                  <p className="text-xl text-muted-foreground mb-16 max-w-3xl mx-auto">
                    {section.content}
                  </p>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {section.gallery?.length > 0 ? (
                      section.gallery.map((image: string, idx: number) => (
                        <div 
                          key={idx} 
                          className={`
                            group aspect-square bg-gradient-to-br from-muted to-muted/50 rounded-2xl overflow-hidden 
                            shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105
                            animate-[scale-in_0.6s_ease-out_${idx * 0.1}s_both]
                          `}
                        >
                          <img 
                            src={image} 
                            alt={`Team member ${idx + 1}`} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                          />
                        </div>
                      ))
                    ) : (
                      <>
                        {[1, 2, 3].map((idx) => (
                          <div 
                            key={idx} 
                            className={`
                              aspect-square bg-gradient-to-br from-muted via-muted/80 to-muted/50 rounded-2xl 
                              flex items-center justify-center shadow-lg hover:shadow-xl
                              transition-all duration-500 hover:scale-105 group
                              animate-[scale-in_0.6s_ease-out_${idx * 0.1}s_both]
                            `}
                          >
                            <p className="text-muted-foreground text-lg font-medium group-hover:text-foreground transition-colors duration-300">
                              📸 Team Photo {idx}
                            </p>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Epic Video Section */}
              {section.type === 'video_section' && (
                <div className="text-center">
                  <h2 className="text-4xl md:text-5xl font-bold mb-8 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                    {section.title}
                  </h2>
                  <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto">
                    {section.content}
                  </p>
                  <div className="group max-w-5xl mx-auto">
                    <div className="relative aspect-video bg-gradient-to-br from-muted to-muted/50 rounded-2xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105">
                      {section.video_url ? (
                        <video 
                          src={section.video_url} 
                          controls 
                          className="w-full h-full rounded-2xl group-hover:scale-110 transition-transform duration-700" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <p className="text-2xl text-muted-foreground font-medium">🎬 Office Tour Video Placeholder</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Epic Testimonial Carousel */}
              {section.type === 'testimonial_carousel' && (
                <div className="text-center">
                  <h2 className="text-4xl md:text-5xl font-bold mb-16 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                    {section.title}
                  </h2>
                  <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {section.testimonials?.map((testimonial: any, idx: number) => (
                      <Card 
                        key={idx} 
                        className={`
                          group p-8 bg-gradient-to-br from-card via-card/95 to-card/90 
                          border-2 hover:border-primary/50 shadow-lg hover:shadow-2xl 
                          transition-all duration-500 hover:scale-105 hover:-translate-y-2
                          animate-[scale-in_0.6s_ease-out_${idx * 0.2}s_both]
                        `}
                      >
                        <CardContent className="space-y-6">
                          <blockquote className="text-lg md:text-xl italic leading-relaxed text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                            "{testimonial.quote}"
                          </blockquote>
                          <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 hover:scale-110">
                              {testimonial.avatar ? (
                                <img 
                                  src={testimonial.avatar} 
                                  alt={testimonial.author} 
                                  className="w-full h-full rounded-full object-cover" 
                                />
                              ) : (
                                <span className="text-lg font-bold text-white">
                                  {testimonial.author?.charAt(0) || 'T'}
                                </span>
                              )}
                            </div>
                            <div className="text-left">
                              <p className="font-semibold text-lg group-hover:text-primary transition-colors duration-300">
                                {testimonial.author}
                              </p>
                              <p className="text-muted-foreground">
                                {testimonial.company}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Epic Footer CTA */}
      <section className="py-32 px-4 bg-gradient-to-r from-primary via-primary/95 to-secondary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.3),transparent_70%)]"></div>
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-8 text-white animate-[fade-in_0.8s_ease-out]">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-white/90 mb-12 animate-[fade-in_0.8s_ease-out_0.2s_both]">
            Join the revolution of epic media buying
          </p>
          <div className="flex flex-wrap gap-6 justify-center animate-[fade-in_0.8s_ease-out_0.4s_both]">
            <Button 
              asChild 
              size="lg" 
              variant="secondary"
              className="px-12 py-6 text-lg font-semibold hover:scale-105 hover:-translate-y-1 transition-all duration-300 shadow-xl hover:shadow-2xl"
            >
              <Link to="/quote">Get Your Quote</Link>
            </Button>
            <Button 
              asChild 
              size="lg" 
              variant="outline"
              className="px-12 py-6 text-lg font-semibold border-2 border-white text-white hover:bg-white hover:text-primary hover:scale-105 hover:-translate-y-1 transition-all duration-300"
            >
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;