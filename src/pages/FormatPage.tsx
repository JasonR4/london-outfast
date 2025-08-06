import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { getFormatBySlug } from '@/data/oohFormats';
import { updateMetaTags, generateStructuredData, getSEODataForPage } from '@/utils/seo';
import { CheckCircle, MapPin, Users, Clock, Target, ArrowRight, Phone } from 'lucide-react';
import { LocationSelector } from '@/components/LocationSelector';
import { useRateCards } from '@/hooks/useRateCards';

const FormatPage = () => {
  const { formatSlug } = useParams();
  const navigate = useNavigate();
  const [format, setFormat] = useState<any>(null);
  const [cmsContent, setCmsContent] = useState<any>(null);
  const [seoData, setSeoData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [quantity, setQuantity] = useState<number>(1);
  const [incharges, setIncharges] = useState<number>(1);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [needsCreative, setNeedsCreative] = useState<boolean>(false);
  const [creativeAssets, setCreativeAssets] = useState<number>(1);
  
  // Use rate cards hook
  const { rateCards, calculatePrice, calculateProductionCost, getAvailableLocations, loading: rateLoading, error: rateError } = useRateCards(formatSlug);

  useEffect(() => {
    const initializePage = async () => {
      if (!formatSlug) {
        navigate('/404');
        return;
      }

      // Fetch SEO data first
      const seoPageData = await getSEODataForPage(`/outdoor-media/${formatSlug}`);
      setSeoData(seoPageData);

      // Check for CMS content
      const { data: cmsData } = await supabase
        .from('content_pages')
        .select('*')
        .eq('slug', formatSlug)
        .eq('status', 'published')
        .maybeSingle();

      setCmsContent(cmsData);

      // Get static format data as fallback
      const staticFormat = getFormatBySlug(formatSlug);
      
      if (!staticFormat && !cmsData) {
        navigate('/404');
        return;
      }

      // Use CMS content if available, otherwise use static data
      const finalFormat = cmsData ? {
        ...staticFormat,
        name: cmsData.title,
        description: (cmsData.content as any)?.hero_description || staticFormat?.description,
        ...(cmsData.content as any)
      } : staticFormat;

      setFormat(finalFormat);
      setLoading(false);

      // Update meta tags with SEO data priority
      if (finalFormat) {
        const title = seoPageData?.meta_title || cmsData?.title || finalFormat.metaTitle;
        const description = seoPageData?.meta_description || cmsData?.meta_description || finalFormat.metaDescription;
        const currentUrl = `https://mediabuyinglondon.co.uk/outdoor-media/${formatSlug}`;
        
        updateMetaTags(title, description, currentUrl, seoPageData);

        // Add structured data
        const structuredData = generateStructuredData(finalFormat);
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.text = JSON.stringify(structuredData);
        document.head.appendChild(script);

        return () => {
          const existingScript = document.querySelector('script[type="application/ld+json"]');
          if (existingScript) {
            document.head.removeChild(existingScript);
          }
        };
      }
    };

    initializePage();
  }, [formatSlug, navigate]);

  const handleGetQuote = () => {
    navigate('/quote');
  };

  const handleCallNow = () => {
    window.location.href = 'tel:+442080680220';
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!format) {
    return null;
  }

  return (
    <>
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary to-primary-foreground text-white">
        {/* Hero Image */}
        {(cmsContent?.content?.hero_image || format.heroImage) && (
          <div className="absolute inset-0 z-0">
            <img 
              src={cmsContent?.content?.hero_image || format.heroImage} 
              alt={format.name}
              className="w-full h-full object-cover opacity-30"
            />
          </div>
        )}
        <div className="relative z-10 container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl">
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                {format.category}
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                {format.type === 'static' ? 'Classic' : 'Digital'}
              </Badge>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              {cmsContent?.content?.hero_title || format.name}
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 leading-relaxed text-white/90">
              {cmsContent?.content?.hero_description || format.description}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={handleGetQuote} size="lg" className="bg-white text-primary hover:bg-white/90">
                Get Instant Quote
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button onClick={handleCallNow} variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                <Phone className="mr-2 h-4 w-4" />
                Call: 020 8068 0220
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Format Showcase Image Section */}
      {(cmsContent?.content?.showcase_image || format.showcaseImage) && (
        <section className="py-16 px-4 bg-muted/20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">See {format.shortName} in Action</h2>
              <p className="text-lg text-muted-foreground">
                Real examples of {format.name} across London
              </p>
            </div>
            <div className="max-w-4xl mx-auto">
              <img 
                src={cmsContent?.content?.showcase_image || format.showcaseImage} 
                alt={`${format.name} example`}
                className="w-full h-auto rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </section>
      )}

      {/* Custom Content Sections */}
      {cmsContent?.content?.sections && cmsContent.content.sections.length > 0 && (
        <div className="container mx-auto px-4 py-16">
          <div className="space-y-12">
            {cmsContent.content.sections.map((section: any, index: number) => (
              <div key={section.id || index} className="max-w-4xl mx-auto">
                {section.type === 'text' && (
                  <div className="prose prose-lg max-w-none">
                    {section.title && <h2 className="text-3xl font-bold mb-6">{section.title}</h2>}
                    <div className="text-lg leading-relaxed whitespace-pre-line">
                      {section.content}
                    </div>
                  </div>
                )}
                
                {section.type === 'image' && (
                  <div className="text-center">
                    {section.title && <h2 className="text-3xl font-bold mb-6">{section.title}</h2>}
                    {section.image && (
                      <img 
                        src={section.image} 
                        alt={section.title || 'Content image'} 
                        className="max-w-full h-auto rounded-lg shadow-lg mx-auto"
                      />
                    )}
                    {section.content && (
                      <p className="mt-4 text-lg text-muted-foreground">{section.content}</p>
                    )}
                  </div>
                )}
                
                {section.type === 'video' && (
                  <div className="text-center">
                    {section.title && <h2 className="text-3xl font-bold mb-6">{section.title}</h2>}
                    {section.image && (
                      <video 
                        src={section.image} 
                        controls
                        className="max-w-full h-auto rounded-lg shadow-lg mx-auto"
                      />
                    )}
                    {section.content && (
                      <p className="mt-4 text-lg text-muted-foreground">{section.content}</p>
                    )}
                  </div>
                )}
                
                {section.type === 'text_image' && (
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div>
                      {section.title && <h2 className="text-3xl font-bold mb-6">{section.title}</h2>}
                      <div className="text-lg leading-relaxed whitespace-pre-line">
                        {section.content}
                      </div>
                    </div>
                    {section.image && (
                      <div>
                        <img 
                          src={section.image} 
                          alt={section.title || 'Content image'} 
                          className="w-full h-auto rounded-lg shadow-lg"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Image Gallery */}
      {cmsContent?.content?.gallery && cmsContent.content.gallery.length > 0 && (
        <div className="container mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-center mb-12">Gallery</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {cmsContent.content.gallery.map((imageUrl: string, index: number) => (
              <div key={index} className="aspect-video">
                <img 
                  src={imageUrl} 
                  alt={`Gallery image ${index + 1}`} 
                  className="w-full h-full object-cover rounded-lg shadow-lg"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Original Static Content - Only show if no CMS sections */}
      {!cmsContent?.content?.sections && (
        <>
          {/* About This Format */}
          <section className="py-20 px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2">
                  <h2 className="text-3xl font-bold mb-6">
                    What Is {format.name}?
                  </h2>
                  <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                    {format.description}
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    {format.physicalSize && (
                      <div className="bg-muted/30 p-6 rounded-lg">
                        <h3 className="font-semibold mb-2">Physical Size</h3>
                        <p className="text-muted-foreground">{format.physicalSize}</p>
                      </div>
                    )}
                    <div className="bg-muted/30 p-6 rounded-lg">
                      <h3 className="font-semibold mb-2">Format Type</h3>
                      <Badge variant={format.type === 'digital' ? 'default' : 'secondary'}>
                        {format.type === 'digital' ? 'Digital' : 'Static'}
                      </Badge>
                    </div>
                    <div className="bg-muted/30 p-6 rounded-lg">
                      <h3 className="font-semibold mb-2">Placement</h3>
                      <p className="text-muted-foreground">{format.placement}</p>
                    </div>
                    <div className="bg-muted/30 p-6 rounded-lg">
                      <h3 className="font-semibold mb-2">Dwell Time</h3>
                      <p className="text-muted-foreground">{format.dwellTime}</p>
                    </div>
                  </div>

                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {format.effectiveness}
                  </p>
                </div>

                <div>
                  <Card className="bg-gradient-card border-border sticky top-6">
                    <CardHeader>
                      <CardTitle>Quick Quote</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Get instant pricing for {format.shortName} campaigns across London
                      </p>
                      <Button onClick={handleGetQuote} className="w-full">
                        Request Custom Quote
                      </Button>
                      <Button onClick={handleCallNow} variant="outline" className="w-full">
                        Speak to a Planner
                      </Button>
                      <div className="pt-4 border-t border-border">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Same-day quotes
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Best price guarantee
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Full London coverage
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </section>

          {/* Combined Pricing & Coverage Section */}
          <section className="py-20 px-4 bg-muted/20">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">
                  {format.name} Costs & Coverage in London
                </h2>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                  Explore pricing and available locations for {format.name.toLowerCase()} advertising across London.
                </p>
              </div>

              {/* Rate Card in Two Columns */}
              <div className="grid lg:grid-cols-2 gap-8 mb-8">
                {/* Left Column - Configuration */}
                <Card className="p-6">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl">Campaign Configuration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="quantity">Quantity</Label>
                      <Select value={quantity.toString()} onValueChange={(value) => setQuantity(parseInt(value))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select quantity" />
                        </SelectTrigger>
                        <SelectContent>
                          {[1,2,3,4,5,6,7,8,9,10,15,20,25,30].map(num => (
                            <SelectItem key={num} value={num.toString()}>{num} site{num > 1 ? 's' : ''}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="incharges">Number of Incharges (2-week periods)</Label>
                      <Select value={incharges.toString()} onValueChange={(value) => setIncharges(parseInt(value))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select incharges" />
                        </SelectTrigger>
                        <SelectContent>
                          {[1,2,3,4,6,8,10,12,16,20,24,26].map(num => (
                            <SelectItem key={num} value={num.toString()}>{num} incharge{num > 1 ? 's' : ''} ({num * 2} weeks)</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {!rateLoading && getAvailableLocations().length > 0 && (
                      <div>
                        <Label htmlFor="location">Location Area</Label>
                        <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select location area" />
                          </SelectTrigger>
                          <SelectContent>
                            {getAvailableLocations().map(location => (
                              <SelectItem key={location} value={location}>{location}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Right Column - Creative & Production */}
                <Card className="p-6">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl">Creative & Production</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Do you have artwork or need creative?</Label>
                      <RadioGroup 
                        value={needsCreative ? "need-creative" : "have-artwork"} 
                        onValueChange={(value) => setNeedsCreative(value === "need-creative")}
                        className="mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="have-artwork" id="have-artwork" />
                          <Label htmlFor="have-artwork">I have artwork ready</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="need-creative" id="need-creative" />
                          <Label htmlFor="need-creative">I need creative design</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {needsCreative && (
                      <div>
                        <Label htmlFor="creative-assets">Number of creative assets needed</Label>
                        <Select value={creativeAssets.toString()} onValueChange={(value) => setCreativeAssets(parseInt(value))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select assets" />
                          </SelectTrigger>
                          <SelectContent>
                            {[1,2,3,4,5,6,7,8,9,10].map(num => (
                              <SelectItem key={num} value={num.toString()}>{num} asset{num > 1 ? 's' : ''}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-sm text-muted-foreground mt-1">
                          £85 per creative asset
                        </p>
                      </div>
                    )}

                    <div className="pt-4 border-t space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Campaign Duration:</span>
                        <span>{incharges} incharge{incharges > 1 ? 's' : ''} ({incharges * 2} weeks)</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Sites Selected:</span>
                        <span>{quantity}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Lead Time:</span>
                        <span>5-10 working days</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Cost Output Box */}
              <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-2">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl text-center">Estimated Campaign Costs</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedLocation && !rateLoading ? (
                    <>
                      {(() => {
                        const priceCalculation = calculatePrice(selectedLocation, incharges);
                        
                        if (priceCalculation) {
                          const campaignTotal = priceCalculation.totalPrice * quantity;
                          
                          // Production costs are always calculated
                          const productionCostCalc = calculateProductionCost(selectedLocation, quantity);
                          const productionTotal = productionCostCalc ? productionCostCalc.totalCost : 0;
                          
                          const creativeTotal = needsCreative ? creativeAssets * 85 : 0;
                          const grandTotal = campaignTotal + productionTotal + creativeTotal;
                          
                          return (
                            <div className="space-y-3">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span>Base Rate per Incharge:</span>
                                    <span>£{priceCalculation.basePrice.toFixed(2)}</span>
                                  </div>
                                  {priceCalculation.locationMarkup > 0 && (
                                    <div className="flex justify-between text-sm text-blue-600">
                                      <span>Location Markup ({priceCalculation.locationMarkup}%):</span>
                                      <span>+£{((priceCalculation.adjustedRate - priceCalculation.basePrice) * incharges * quantity).toFixed(2)}</span>
                                    </div>
                                  )}
                                  {priceCalculation.discount > 0 && (
                                    <div className="flex justify-between text-sm text-green-600">
                                      <span>Volume Discount ({priceCalculation.discount}%):</span>
                                      <span>-£{((priceCalculation.adjustedRate - (priceCalculation.totalPrice / incharges)) * incharges * quantity).toFixed(2)}</span>
                                    </div>
                                  )}
                                </div>
                                <div className="space-y-2">
                                  {priceCalculation.isOnSale && (
                                    <div className="flex justify-between text-sm text-green-600">
                                      <span>⚡ Special Offer:</span>
                                      <span>Sale Price Applied</span>
                                    </div>
                                  )}
                                  {priceCalculation.isReduced && (
                                    <div className="flex justify-between text-sm text-blue-600">
                                      <span>💰 Reduced Rate:</span>
                                      <span>Lower Price Applied</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="border-t pt-3 space-y-2">
                                <div className="flex justify-between text-base">
                                  <span>Campaign Cost ({quantity} × {incharges} incharges):</span>
                                  <span>£{campaignTotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-base">
                                  <span>Production Cost ({quantity} units):</span>
                                  <span>£{productionTotal.toFixed(2)}</span>
                                </div>
                                {needsCreative && (
                                  <div className="flex justify-between text-base">
                                    <span>Creative Assets ({creativeAssets}):</span>
                                    <span>£{creativeTotal.toFixed(2)}</span>
                                  </div>
                                )}
                                <div className="flex justify-between font-bold text-lg border-t pt-3 bg-primary/10 -mx-2 px-2 py-2 rounded">
                                  <span>Estimated Total:</span>
                                  <span>£{grandTotal.toFixed(2)}</span>
                                </div>
                              </div>

                              <Button onClick={handleGetQuote} size="lg" className="w-full mt-4 bg-gradient-primary hover:opacity-90">
                                Request Custom Quote ({quantity} site{quantity > 1 ? 's' : ''}{needsCreative ? ` + ${creativeAssets} creative${creativeAssets > 1 ? 's' : ''}` : ''})
                              </Button>
                            </div>
                          );
                        }
                        return (
                          <div className="text-center text-muted-foreground">
                            <p>Select all options above to see pricing estimate</p>
                          </div>
                        );
                      })()}
                    </>
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <p>Select location and configuration to see pricing estimate</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Coverage Areas - Separate Section */}
              <div className="mt-12">
                <LocationSelector
                  selectedLocations={selectedAreas}
                  onSelectionChange={setSelectedAreas}
                  title={`${format.shortName} Coverage Areas`}
                  description="Select areas to explore availability"
                  showSelectedSummary={true}
                  maxHeight="400px"
                />

                {selectedAreas.length > 0 && (
                  <Card className="p-6 mt-6">
                    <h4 className="text-lg font-semibold mb-3">Coverage in Selected Areas</h4>
                    <p className="text-muted-foreground text-sm mb-4">
                      {format.shortName} advertising is available in {selectedAreas.length} selected area{selectedAreas.length !== 1 ? 's' : ''}. 
                      Our network provides excellent reach and frequency across these locations.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button onClick={handleGetQuote} className="flex-1">
                        Get Quote for Selected Areas
                      </Button>
                      <Button variant="outline" onClick={handleCallNow}>
                        <Phone className="w-4 h-4 mr-2" />
                        Discuss Coverage
                      </Button>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </section>

          {/* Who Uses This Format */}
          <section className="py-20 px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">
                Who Uses {format.shortName} Ads?
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {format.whoUsesIt?.map((use: string, index: number) => (
                  <Card key={index} className="text-center">
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-2">{use}</h3>
                      <p className="text-sm text-muted-foreground">
                        Perfect for targeting London audiences
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/10 via-accent/10 to-background">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Launch Your {format.shortName || format.name} Campaign?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Get instant pricing and expert campaign planning for London's best locations
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={handleGetQuote} size="lg" className="bg-gradient-primary hover:opacity-90">
              GET QUOTE
            </Button>
            <Button onClick={handleCallNow} variant="outline" size="lg">
              SPEAK TO PLANNER
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};

export default FormatPage;