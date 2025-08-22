import React, { useState, useEffect } from 'react';
import { formatCurrency } from '@/utils/money';
import { countPrintRuns } from '@/utils/periods';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useMediaFormats } from '@/hooks/useMediaFormats';
import { updateMetaTags, generateStructuredData, getSEODataForPage } from '@/utils/seo';
import { CheckCircle, MapPin, Users, Clock, Target, ArrowRight, Phone, CalendarIcon, AlertTriangle, Info } from 'lucide-react';
import { useRateCards } from '@/hooks/useRateCards';
import { useLocationSelector } from '@/hooks/useLocationSelector';
import { useQuotes } from '@/hooks/useQuotes';
import { useLocationCapacity } from '@/hooks/useLocationCapacity';
import { LocationCapacityIndicator } from '@/components/LocationCapacityIndicator';
import { UpsellModal } from '@/components/UpsellModal';
import { CreativeCapacityIndicator } from '@/components/CreativeCapacityIndicator';
import { CreativeUpsellModal } from '@/components/CreativeUpsellModal';
import { useCreativeCapacity } from '@/hooks/useCreativeCapacity';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { trackQuoteItemAdded } from '@/utils/analytics';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { QuoteBreakdown } from '@/components/QuoteBreakdown';

const FormatPage = () => {
  const { formatSlug } = useParams();
  const { getFormatBySlug, loading: formatsLoading, mediaFormats } = useMediaFormats();
  const navigate = useNavigate();
  const [format, setFormat] = useState<any>(null);
  const [cmsContent, setCmsContent] = useState<any>(null);
  const [seoData, setSeoData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedPeriods, setSelectedPeriods] = useState<number[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [needsCreative, setNeedsCreative] = useState<boolean>(false);
  const [creativeAssets, setCreativeAssets] = useState<number>(1);
  const [selectedStartDate, setSelectedStartDate] = useState<Date | undefined>();
  const [selectedEndDate, setSelectedEndDate] = useState<Date | undefined>();
  const [isDateSpecific, setIsDateSpecific] = useState<boolean>(false);
  const [showUpsellModal, setShowUpsellModal] = useState(false);
  const [upsellContext, setUpsellContext] = useState<{ zoneName?: string; requiredCapacity: number } | null>(null);
  const [showCreativeUpsellModal, setShowCreativeUpsellModal] = useState(false);
  
  // Helper function to check if periods are consecutive
  const arePeriodsConsecutive = (periods: number[]) => {
    if (periods.length <= 1) return true;
    const sortedPeriods = [...periods].sort((a, b) => a - b);
    for (let i = 1; i < sortedPeriods.length; i++) {
      if (sortedPeriods[i] - sortedPeriods[i - 1] !== 1) {
        return false;
      }
    }
    return true;
  };

  
  // Use rate cards hook
  const { 
    rateCards, 
    calculatePrice, 
    calculateProductionCost, 
    getAvailableLocations, 
    getAvailablePeriodsForLocation, 
    inchargePeriods,
    loading: rateLoading, 
    error: rateError 
  } = useRateCards(formatSlug);

  // Check if format uses period-specific dates (is_date_specific = true means use periods)
  useEffect(() => {
    if (rateCards.length > 0) {
      const usesPeriods = rateCards.some(rc => rc.is_date_specific === true);
      setIsDateSpecific(usesPeriods);
      console.log('🗓️ Date configuration:', { usesPeriods, rateCards: rateCards.map(rc => ({ id: rc.id, is_date_specific: rc.is_date_specific })) });
    }
  }, [rateCards]);
  
  // Use location selector hook for multiple area selection in pricing
  const {
    locationSearch,
    setLocationSearch,
    filteredAreas,
    handleLocationToggle: baseHandleLocationToggle,
    handleZoneToggle: baseHandleZoneToggle,
    isZoneFullySelected,
    isZonePartiallySelected,
    clearAllLocations: baseClearAllLocations,
    getSelectedLocationsByZone
  } = useLocationSelector(selectedAreas);

  const handleLocationToggle = (location: string) => {
    // Check capacity before allowing selection
    if (!selectedAreas.includes(location) && !canSelectLocation(location)) {
      const requiredCapacity = selectedAreas.length + 1;
      setUpsellContext({ requiredCapacity });
      setShowUpsellModal(true);
      return;
    }

    baseHandleLocationToggle(location);
    const newLocations = selectedAreas.includes(location) 
      ? selectedAreas.filter(l => l !== location)
      : [...selectedAreas, location];
    setSelectedAreas(newLocations);
  };

  const handleZoneToggle = (zoneName: string) => {
    const zone = filteredAreas.find(z => z.zone === zoneName);
    if (!zone) return;
    
    const allZoneAreasSelected = zone.areas.every(area => selectedAreas.includes(area));
    
    if (allZoneAreasSelected) {
      // Deselect all - this is always allowed
      baseHandleZoneToggle(zoneName);
      setSelectedAreas(prev => prev.filter(location => !zone.areas.includes(location)));
    } else {
      // Check capacity before selecting all
      const zoneInfo = getZoneSelectionInfo(zoneName);
      if (zoneInfo && !zoneInfo.canSelect) {
        const requiredCapacity = selectedAreas.length + zoneInfo.unselectedAreas;
        setUpsellContext({ zoneName, requiredCapacity });
        setShowUpsellModal(true);
        return;
      }

      // Select all areas in zone
      baseHandleZoneToggle(zoneName);
      setSelectedAreas(prev => {
        const newSelections = [...prev];
        zone.areas.forEach(area => {
          if (!newSelections.includes(area)) {
            newSelections.push(area);
          }
        });
        return newSelections;
      });
    }
  };

  const clearAllLocations = () => {
    baseClearAllLocations();
    setSelectedAreas([]);
  };

  const selectedByZone = getSelectedLocationsByZone();

  // Location capacity management
  const representativePrice = 1000; // Base price for calculations
  const {
    maxLocationCapacity,
    locationCapacityUsed,
    remainingCapacity,
    isOverCapacity,
    capacityStatus,
    canSelectLocation,
    canSelectZone,
    getZoneSelectionInfo,
    generateUpsellOptions,
    getSmartRecommendations
  } = useLocationCapacity({
    quantity,
    selectedPeriods,
    selectedAreas,
    basePrice: representativePrice
  });

  // Creative capacity management
  const {
    isOptimal: isCreativeOptimal,
    efficiency: creativeEfficiency,
    status: creativeStatus,
    recommendation: creativeRecommendation,
    creativesPerSite,
    generateCreativeUpsellOptions,
    getCreativeRecommendations
  } = useCreativeCapacity({
    sites: quantity,
    creativeAssets,
    needsCreative,
    creativeCostPerAsset: 85,
    siteCost: representativePrice
  });

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

      // Get format data - try both cached and fresh fetch
      let staticFormat = null;
      
      // First try to get from cache
      staticFormat = getFormatBySlug(formatSlug || '');
      
      // If not in cache, try direct lookup from media formats
      if (!staticFormat && !formatsLoading) {
        staticFormat = mediaFormats.find(f => f.format_slug === formatSlug);
      }
      
      console.log('Format lookup result:', { 
        formatSlug, 
        staticFormat: staticFormat ? staticFormat.format_name : null, 
        mediaFormatsCount: mediaFormats.length,
        formatsLoading
      });
      
      // If we have either static format OR CMS data, we can proceed
      if (!staticFormat && !cmsData && !formatsLoading) {
        console.log('No format found, redirecting to 404');
        navigate('/404');
        return;
      }

      // Use CMS content if available, otherwise use static data
      const finalFormat = staticFormat ? {
        ...staticFormat,
        name: staticFormat.format_name,
        physicalSize: staticFormat.dimensions,
        category: 'Outdoor Advertising',
        placement: 'Various locations across London',
        type: 'static',
        dwellTime: '3-8 seconds average viewing time',
        effectiveness: 'High impact advertising for brand awareness',
        priceRange: 'Competitive rates available',
        londonCoverage: 'Available across London',
        whoUsesIt: ['Brands', 'Retailers', 'Services', 'Entertainment', 'Financial Services', 'Technology Companies'],
        networks: ['Various outdoor advertising networks'],
        shortName: staticFormat.format_name.split(' ')[0] + ' ' + staticFormat.format_name.split(' ')[1],
        // Override with CMS content if available
        ...(cmsData && {
          id: cmsData.id,
          name: cmsData.title,
          format_name: cmsData.title,
          description: (cmsData.content as any)?.hero_description || staticFormat.description,
          category: (cmsData.content as any)?.category || 'Outdoor Advertising',
          placement: (cmsData.content as any)?.placement || 'Various locations across London',
          type: (cmsData.content as any)?.format_type || 'static',
          dwellTime: (cmsData.content as any)?.dwellTime || '3-8 seconds average viewing time',
          effectiveness: (cmsData.content as any)?.effectiveness || 'High impact advertising for brand awareness',
          priceRange: (cmsData.content as any)?.pricing || 'Competitive rates available',
          londonCoverage: (cmsData.content as any)?.coverage || 'Available across London',
          whoUsesIt: (cmsData.content as any)?.whoUsesThis || ['Brands', 'Retailers', 'Services'],
          networks: (cmsData.content as any)?.networks || ['Various outdoor advertising networks'],
          ...(cmsData.content as any)
        })
      } : null;

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

    // Only run when formatSlug changes or when formats finish loading
    if (formatSlug && !formatsLoading) {
      initializePage();
    }
  }, [formatSlug, formatsLoading]);

  const handleGetQuote = () => {
    navigate('/quote');
  };

  const handleCallNow = () => {
    window.location.href = 'tel:+442045243019';
  };

  const { addQuoteItem } = useQuotes();

  const handleBuildPlan = async () => {
    // Validate required selections
    if (selectedAreas.length === 0) {
      toast.error('Please select at least one location area');
      return;
    }

    // Validate date/period selection based on format type
    if (isDateSpecific) {
      // isDateSpecific = true means use period selection
      if (format?.category !== 'Bus' && format?.category !== 'Gorilla' && format?.category !== 'Ambient' && selectedPeriods.length === 0) {
        toast.error('Please select at least one campaign period');
        return;
      }
    } else {
      // isDateSpecific = false means use custom date selection
      if (!selectedStartDate || !selectedEndDate) {
        toast.error('Please select campaign start and end dates');
        return;
      }
    }

    // Check if over location capacity
    if (isOverCapacity) {
      setUpsellContext({ requiredCapacity: selectedAreas.length });
      setShowUpsellModal(true);
      return;
    }

    // Check if creative capacity is not optimal (and needs creative)
    if (needsCreative && !isCreativeOptimal) {
      setShowCreativeUpsellModal(true);
      return;
    }

    // Calculate costs for the quote item
    const representativeArea = selectedAreas[0];
    const availableLocations = getAvailableLocations();
    const matchingLocation = availableLocations.find(loc => 
      selectedAreas.some(area => 
        loc?.toLowerCase().includes(area?.toLowerCase() || '') || 
        area?.toLowerCase().includes(loc?.toLowerCase() || '')
      )
    ) || availableLocations[0];
    
    const locationForPricing = matchingLocation || representativeArea;
    
    // For custom dates, calculate based on date range
    let priceCalculation = null;
    let campaignStartDate = null;
    let campaignEndDate = null;
    
    if (isDateSpecific && selectedPeriods.length > 0) {
      // isDateSpecific = true means use period calculation
      priceCalculation = calculatePrice(locationForPricing, selectedPeriods);
      
      const sortedPeriods = [...selectedPeriods].sort((a, b) => a - b);
      const firstPeriod = inchargePeriods.find(p => p.period_number === sortedPeriods[0]);
      const lastPeriod = inchargePeriods.find(p => p.period_number === sortedPeriods[sortedPeriods.length - 1]);
      
      if (firstPeriod) campaignStartDate = firstPeriod.start_date;
      if (lastPeriod) campaignEndDate = lastPeriod.end_date;
    } else if (!isDateSpecific && selectedStartDate && selectedEndDate) {
      // isDateSpecific = false means use custom date range
      const diffTime = Math.abs(selectedEndDate.getTime() - selectedStartDate.getTime());
      const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
      const pseudoPeriods = Array.from({ length: diffWeeks }, (_, i) => i + 1);
      
      priceCalculation = calculatePrice(locationForPricing, pseudoPeriods);
      campaignStartDate = selectedStartDate.toISOString().split('T')[0];
      campaignEndDate = selectedEndDate.toISOString().split('T')[0];
    }
    
    if (!priceCalculation) {
      toast.error('Unable to calculate pricing for selected options');
      return;
    }

    
    const campaignTotal = priceCalculation.totalPrice * quantity;
    const originalCampaignTotal = priceCalculation.basePrice * priceCalculation.periodsCount * quantity;
    const discountAmount = (originalCampaignTotal - campaignTotal);
    const productionCostCalc = calculateProductionCost(quantity, selectedPeriods, format.category);
    const productionTotal = productionCostCalc ? productionCostCalc.totalCost : 0;
    const creativeTotal = needsCreative ? creativeAssets * 85 : 0;
    
    const grandTotal = campaignTotal + productionTotal + creativeTotal;

    // Create quote item
    const quoteItem = {
      format_name: format.name,
      format_slug: formatSlug || '',
      quantity,
      selected_periods: selectedPeriods,
      selected_areas: selectedAreas,
      production_cost: productionTotal,
      creative_cost: creativeTotal,
      base_cost: campaignTotal,
      total_cost: grandTotal,
      discount_percentage: priceCalculation.discount || 0,
      discount_amount: discountAmount || 0,
      original_cost: originalCampaignTotal || campaignTotal,
      campaign_start_date: campaignStartDate,
      campaign_end_date: campaignEndDate,
      creative_needs: needsCreative ? `${creativeAssets} creative asset${creativeAssets > 1 ? 's' : ''} needed` : 'Client has artwork ready'
    };

    const success = await addQuoteItem(quoteItem);
    
    if (success) {
      // Track analytics for quote item added
      try {
        trackQuoteItemAdded({
          formatName: format.name,
          quantity,
          value: grandTotal
        });
        console.log('📊 Analytics: Quote item tracked from outdoor-media', {
          formatName: format.name,
          quantity,
          value: grandTotal,
          source: 'outdoor-media'
        });
      } catch (trackingError) {
        console.error('📊 Analytics tracking error (non-blocking):', trackingError);
      }
      
      navigate('/quote-plan');
    }
  };

  // Show loading while data is being fetched
  if (loading || formatsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading format details...</div>
      </div>
    );
  }

  // Show error only if we're not loading and have no format
  if (!format && !formatsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Format Not Found</h1>
          <p>The outdoor advertising format you're looking for could not be found.</p>
          <p className="text-sm text-muted-foreground mt-2">Format slug: {formatSlug}</p>
        </div>
      </div>
    );
  }

  // Don't render if we don't have format data yet
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
              {format?.format_name || cmsContent?.content?.hero_title || cmsContent?.title || format?.name}
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 leading-relaxed text-white/90">
              {cmsContent?.content?.hero_description || format?.description || `Professional ${format?.format_name || 'outdoor advertising'} solutions across London.`}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={handleGetQuote} size="lg" className="bg-white text-primary hover:bg-white/90">
                Get Instant Quote
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button onClick={handleCallNow} variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                <Phone className="mr-2 h-4 w-4" />
                Call: +44 204 524 3019
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
              <h2 className="text-3xl font-bold mb-4">See {format?.shortName || format?.format_name} in Action</h2>
              <p className="text-lg text-muted-foreground">
                Real examples of {format?.name || format?.format_name} across London
              </p>
            </div>
            <div className="max-w-4xl mx-auto">
              <img 
                src={cmsContent?.content?.showcase_image || format.showcaseImage} 
                alt={`${format?.name || format?.format_name} example`}
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
                  {format?.name || format?.format_name} Costs & Coverage in London
                </h2>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                  Explore pricing and available locations for {format?.name?.toLowerCase() || format?.format_name?.toLowerCase() || 'outdoor'} advertising across London.
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

                    
                     {/* Incharge Periods Selection - for period-specific formats */}
                      {isDateSpecific && (
                      <div>
                         <div className="flex items-center gap-2">
                           <Label>Select Campaign Periods</Label>
                           {selectedPeriods.length > 1 && !arePeriodsConsecutive(selectedPeriods) && (
                             <TooltipProvider>
                               <Tooltip>
                                 <TooltipTrigger>
                                   <AlertTriangle className="h-4 w-4 text-amber-500" />
                                 </TooltipTrigger>
                                 <TooltipContent>
                                   <p>Non-consecutive periods selected.</p>
                                   <p>Additional production setup may apply.</p>
                                 </TooltipContent>
                               </Tooltip>
                             </TooltipProvider>
                           )}
                         </div>
                         
                         {Array.isArray(inchargePeriods) && inchargePeriods.length > 0 ? (
                           <div className="space-y-2 max-h-60 overflow-y-auto">
                             {inchargePeriods.map((period, index) => (
                               <div key={period.id || period.period_number || index} className="flex items-center space-x-2">
                                 <Checkbox
                                   id={`period-${period.period_number}`}
                                   checked={selectedPeriods.includes(period.period_number)}
                                   onCheckedChange={(checked) => {
                                     if (checked) {
                                       setSelectedPeriods(prev => [...prev, period.period_number]);
                                     } else {
                                       setSelectedPeriods(prev => prev.filter(p => p !== period.period_number));
                                     }
                                   }}
                                 />
                                 <Label htmlFor={`period-${period.period_number}`} className="text-sm">
                                   Period {period.period_number}: {new Date(period.start_date).toLocaleDateString()} - {new Date(period.end_date).toLocaleDateString()}
                                 </Label>
                               </div>
                             ))}
                           </div>
                         ) : (
                           <div className="text-sm text-muted-foreground p-4 bg-muted/50 rounded">
                             {rateLoading ? 'Loading periods...' : 'No periods available for this format'}
                           </div>
                         )}
                         
                         <div className="text-sm text-muted-foreground mt-2">
                           <span>Selected {selectedPeriods.length} period{selectedPeriods.length !== 1 ? 's' : ''}</span>
                             {countPrintRuns(selectedPeriods) > 1 && (
                                <div className="mt-1 text-xs opacity-70" role="note" aria-live="polite">
                                  Non-consecutive periods = {countPrintRuns(selectedPeriods)} print runs (production only).
                                </div>
                             )}
                         </div>
                      </div>
                    )}

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Location Areas
                        </Label>
                        {selectedAreas.length > 0 && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={clearAllLocations}
                            className="h-6 px-2 text-xs"
                          >
                            <X className="h-3 w-3 mr-1" />
                            Clear all
                          </Button>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Select areas for your campaign coverage
                      </p>
                      
                      {/* Location Capacity Indicator */}
                      {maxLocationCapacity > 0 && (
                        <div className="mb-3">
                          <LocationCapacityIndicator 
                            capacity={maxLocationCapacity}
                            used={locationCapacityUsed}
                            status={capacityStatus}
                          />
                        </div>
                      )}

                      {selectedAreas.length > 0 && (
                        <div className="mb-3 p-2 bg-muted/30 rounded">
                          <div className="text-xs font-medium mb-1">
                            {selectedAreas.length} area{selectedAreas.length !== 1 ? 's' : ''} selected
                          </div>
                          <div className="space-y-1">
                            {Object.entries(selectedByZone).map(([zone, areas]) => (
                              <div key={zone} className="text-xs">
                                <span className="font-medium text-muted-foreground">{zone}:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {areas.map(area => (
                                    <Badge key={area} variant="secondary" className="text-xs">
                                      {area}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Smart Recommendations */}
                      {getSmartRecommendations().length > 0 && (
                        <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
                          {getSmartRecommendations().map((rec, idx) => (
                            <p key={idx}>{rec}</p>
                          ))}
                        </div>
                      )}

                      <div className="relative mb-3">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          placeholder="Search London areas..."
                          value={locationSearch}
                          onChange={(e) => setLocationSearch(e.target.value)}
                          className="pl-9"
                        />
                      </div>

                      <ScrollArea className="rounded-md border h-48">
                        <div className="p-3 space-y-3">
                          {filteredAreas.map((zone) => (
                            <div key={zone.zone} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${zone.color}`} />
                                  <h4 className="font-medium text-xs">{zone.zone}</h4>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleZoneToggle(zone.zone)}
                                  className={`h-6 px-2 text-xs ${!canSelectZone(zone.zone) && !isZoneFullySelected(zone.zone) ? 'opacity-50' : ''}`}
                                >
                                  {isZoneFullySelected(zone.zone) ? (
                                    <>
                                      <X className="h-3 w-3 mr-1" />
                                      Deselect All
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      {canSelectZone(zone.zone) ? 'Select All' : `Select All (${zone.areas.length})`}
                                    </>
                                  )}
                                </Button>
                              </div>
                              
                              <div className="grid grid-cols-1 gap-1 ml-4">
                                {zone.areas.map((area) => (
                                  <div key={area} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`location-${area}`}
                                      checked={selectedAreas.includes(area)}
                                      disabled={!canSelectLocation(area) && !selectedAreas.includes(area)}
                                      onCheckedChange={() => handleLocationToggle(area)}
                                    />
                                    <label
                                      htmlFor={`location-${area}`}
                                      className={`text-xs font-medium leading-none cursor-pointer ${
                                        !canSelectLocation(area) && !selectedAreas.includes(area) 
                                          ? 'opacity-50 cursor-not-allowed' 
                                          : ''
                                      }`}
                                    >
                                      {area}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>

                      {!rateLoading && getAvailableLocations().length > 0 && selectedAreas.length > 0 && (
                        <div className="mt-3">
                          <Label className="text-xs">Pricing based on selected areas</Label>
                          <p className="text-xs text-muted-foreground mt-1">
                            Cost estimate using: {selectedAreas.slice(0, 3).join(', ')}{selectedAreas.length > 3 ? ` +${selectedAreas.length - 3} more` : ''}
                          </p>
                        </div>
                      )}
                    </div>
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

                     {/* Creative Capacity Indicator */}
                     <CreativeCapacityIndicator 
                       sites={quantity}
                       creativeAssets={creativeAssets}
                       needsCreative={needsCreative}
                       efficiency={creativeEfficiency}
                       status={creativeStatus}
                       creativesPerSite={creativesPerSite}
                       recommendations={getCreativeRecommendations()}
                       onOptimizeClick={() => setShowCreativeUpsellModal(true)}
                     />

                      {/* Date Selection - Custom Dates for Non-Incharge Media */}
                      {(!isDateSpecific || format.category === 'Bus' || format.category === 'Gorilla' || format.category === 'Ambient') && (
                       <div className="space-y-4">
                         <div>
                           <Label>Campaign Start Date</Label>
                           <Popover>
                             <PopoverTrigger asChild>
                               <Button
                                 variant="outline"
                                 className={cn(
                                   "w-full justify-start text-left font-normal",
                                   !selectedStartDate && "text-muted-foreground"
                                 )}
                               >
                                 <CalendarIcon className="mr-2 h-4 w-4" />
                                 {selectedStartDate ? format(selectedStartDate, "PPP") : <span>Pick start date</span>}
                               </Button>
                             </PopoverTrigger>
                             <PopoverContent className="w-auto p-0" align="start">
                               <Calendar
                                 mode="single"
                                 selected={selectedStartDate}
                                 onSelect={setSelectedStartDate}
                                 disabled={(date) => date < new Date()}
                                 initialFocus
                                 className={cn("p-3 pointer-events-auto")}
                               />
                             </PopoverContent>
                           </Popover>
                         </div>

                         <div>
                           <Label>Campaign End Date</Label>
                           <Popover>
                             <PopoverTrigger asChild>
                               <Button
                                 variant="outline"
                                 className={cn(
                                   "w-full justify-start text-left font-normal",
                                   !selectedEndDate && "text-muted-foreground"
                                 )}
                               >
                                 <CalendarIcon className="mr-2 h-4 w-4" />
                                 {selectedEndDate ? format(selectedEndDate, "PPP") : <span>Pick end date</span>}
                               </Button>
                             </PopoverTrigger>
                             <PopoverContent className="w-auto p-0" align="start">
                               <Calendar
                                 mode="single"
                                 selected={selectedEndDate}
                                 onSelect={setSelectedEndDate}
                                 disabled={(date) => date < (selectedStartDate || new Date())}
                                 initialFocus
                                 className={cn("p-3 pointer-events-auto")}
                               />
                             </PopoverContent>
                           </Popover>
                         </div>
                       </div>
                     )}

                     <div className="pt-4 border-t space-y-2">
                        {/* ALWAYS SHOW SELECTED PERIODS */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">Selected Periods:</span>
                            <span>{selectedPeriods.length} period{selectedPeriods.length !== 1 ? 's' : ''}</span>
                          </div>
                          {selectedPeriods.length > 0 ? (
                            <div className="space-y-2">
                              <div className="flex flex-wrap gap-1">
                                {selectedPeriods.map((period) => (
                                  <Badge key={period} variant="secondary" className="text-xs">
                                    P{period}
                                  </Badge>
                                ))}
                              </div>
                              {/* Show detailed period dates */}
                              <div className="text-xs space-y-1">
                                {selectedPeriods.slice(0, 3).map((periodNumber) => {
                                  const period = inchargePeriods?.find(p => p.period_number === periodNumber);
                                  return period ? (
                                    <div key={periodNumber} className="text-muted-foreground">
                                      Period {period.period_number}: {new Date(period.start_date).toLocaleDateString('en-GB')} - {new Date(period.end_date).toLocaleDateString('en-GB')}
                                    </div>
                                  ) : null;
                                })}
                                {selectedPeriods.length > 3 && (
                                  <div className="text-muted-foreground">
                                    +{selectedPeriods.length - 3} more periods
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="text-xs text-muted-foreground">No periods selected</div>
                          )}
                        </div>
                        <div className="flex justify-between text-sm">
                           <span>Campaign Duration:</span>
                           <span>{selectedPeriods.length} period{selectedPeriods.length !== 1 ? 's' : ''} ({selectedPeriods.length * 2} weeks)</span>
                         </div>
                       <div className="flex justify-between text-sm">
                         <span>Sites Selected:</span>
                         <span>{quantity}</span>
                       </div>
                       {selectedStartDate && selectedEndDate && (
                         <div className="flex justify-between text-sm">
                           <span>Campaign Dates:</span>
                           <span>{format(selectedStartDate, "MMM dd")} - {format(selectedEndDate, "MMM dd, yyyy")}</span>
                         </div>
                       )}
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
                  {selectedAreas.length > 0 && !rateLoading ? (
                    <>
                      {(() => {
                        // Use the first selected area for pricing calculation as a representative area
                        const representativeArea = selectedAreas[0];
                        const availableLocations = getAvailableLocations();
                        const matchingLocation = availableLocations.find(loc => 
                          selectedAreas.some(area => 
                            loc?.toLowerCase().includes(area?.toLowerCase() || '') || 
                            area?.toLowerCase().includes(loc?.toLowerCase() || '')
                          )
                        ) || availableLocations[0]; // Fallback to first available location
                        
                        const locationForPricing = matchingLocation || representativeArea;
                        
                        // Calculate pricing based on format type
                        let priceCalculation = null;
                        if (isDateSpecific && selectedPeriods.length > 0) {
                          // isDateSpecific = true means use standard incharge periods
                          priceCalculation = calculatePrice(locationForPricing, selectedPeriods);
                        } else if (!isDateSpecific && selectedStartDate && selectedEndDate) {
                          // isDateSpecific = false means use custom date range
                          const diffTime = Math.abs(selectedEndDate.getTime() - selectedStartDate.getTime());
                          const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
                          const pseudoPeriods = Array.from({ length: diffWeeks }, (_, i) => i + 1);
                          priceCalculation = calculatePrice(locationForPricing, pseudoPeriods);
                        }
                        
                         if (priceCalculation) {
                           // Standardized calculation inputs
                           const units = quantity;
                           const uniquePeriods = [...new Set(selectedPeriods)].length;
                           const saleRate = priceCalculation.basePrice; // Use the rate from price calculation

                           // Volume discount eligibility: 10% for 3+ in-charge periods
                           const qualifiesVolume = uniquePeriods >= 3;

                           // Media cost calculation
                           const mediaCost = saleRate * units * uniquePeriods;
                           const mediaDiscount = qualifiesVolume ? mediaCost * 0.10 : 0;
                           const showDiscount = qualifiesVolume && mediaCost > 0;
                           const mediaAfterDiscount = mediaCost - mediaDiscount;

                           // Production costs are always calculated
                           const productionCostCalc = calculateProductionCost(quantity, selectedPeriods, format.category);
                           const productionTotal = productionCostCalc ? productionCostCalc.totalCost : 0;
                           
                           const creativeTotal = needsCreative ? creativeAssets * 85 : 0;
                           const grandTotal = mediaAfterDiscount + productionTotal + creativeTotal;
                          
                          return (
                            <div className="space-y-3">
                              
                              {/* Standardized Media Cost Breakdown */}
                               <div className="space-y-1 mb-4">
                                <div className="flex justify-between">
                                   <span>Media rate (per in-charge)</span>
                                   <span>{formatCurrency(saleRate)}</span>
                                 </div>
                                 <div className="flex justify-between">
                                   <span>Media (before discount)</span>
                                   <span>{formatCurrency(mediaCost)}</span>
                                 </div>

                                {showDiscount && (
                                  <>
                                    <div className="flex justify-between text-green-600">
                                      <span>💰 Volume discount (10% for 3+ in-charge periods)</span>
                                      <span>−{formatCurrency(mediaDiscount)}</span>
                                    </div>
                                    <div className="text-xs opacity-70">
                                      That's −{formatCurrency(mediaDiscount / (units * uniquePeriods))} per unit per period ({units * uniquePeriods} in-charges).
                                    </div>
                                  </>
                                )}

                                <div className="flex justify-between font-medium">
                                  <span>Media (after discount)</span>
                                  <span>{formatCurrency(mediaAfterDiscount)}</span>
                                </div>
                              </div>
                              
                              {/* Production + Creative + Totals */}
                              <div className="mt-3 space-y-2">
                                <div className="flex justify-between">
                                  <span>Total Production Cost</span>
                                  <span>{formatCurrency(productionTotal)}</span>
                                </div>
                                {creativeTotal > 0 && (
                                  <div className="flex justify-between">
                                    <span>Total Creative Cost</span>
                                    <span>{formatCurrency(creativeTotal)}</span>
                                  </div>
                                )}
                              </div>

                              <hr className="my-2 opacity-20" />

                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span>Subtotal (exc VAT)</span>
                                  <span>{formatCurrency(grandTotal)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>VAT (20%)</span>
                                  <span>{formatCurrency(grandTotal * 0.20)}</span>
                                </div>
                                <div className="flex justify-between font-semibold">
                                  <span>Total inc VAT</span>
                                  <span>{formatCurrency(grandTotal * 1.20)} inc VAT</span>
                                </div>
                              </div>

                              <Button onClick={handleBuildPlan} size="lg" className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg font-semibold text-lg">
                                Build My Plan
                              </Button>
                            </div>
                          );
                        }
                        return (
                          <div className="text-center text-muted-foreground">
                            <p>Unable to calculate pricing for selected areas</p>
                          </div>
                        );
                      })()}
                    </>
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <p>Select location areas above to see pricing estimate</p>
                    </div>
                  )}
                </CardContent>
              </Card>

            </div>
          </section>

          {/* Who Uses This Format */}
          <section className="py-20 px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">
                Who Uses {format?.shortName || format?.format_name} Ads?
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

      {/* Detailed Content Section - Show if CMS has detailed_content */}
      {cmsContent?.content?.detailed_content && (
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div 
              className="prose prose-lg prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: cmsContent.content.detailed_content }}
            />
          </div>
        </section>
      )}
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

      {/* Upsell Modal */}
      {showUpsellModal && upsellContext && (
        <UpsellModal
          isOpen={showUpsellModal}
          onClose={() => setShowUpsellModal(false)}
          currentCapacity={maxLocationCapacity}
          requiredCapacity={upsellContext.requiredCapacity}
          selectedLocations={upsellContext.requiredCapacity}
          zoneName={upsellContext.zoneName}
          options={generateUpsellOptions(upsellContext.requiredCapacity)}
          onSelectOption={(option) => {
            if (option.type === 'quantity') {
              setQuantity(option.suggestedValue);
            } else if (option.type === 'periods') {
              // Add more periods to reach suggested value
              const additionalPeriods = option.suggestedValue - selectedPeriods.length;
              const availablePeriods = inchargePeriods
                .filter(p => !selectedPeriods.includes(p.period_number))
                .slice(0, additionalPeriods)
                .map(p => p.period_number);
              
              setSelectedPeriods(prev => [...prev, ...availablePeriods]);
            }
            setShowUpsellModal(false);
            toast.success(`Campaign upgraded! You now have ${option.suggestedValue} ${option.type === 'quantity' ? 'sites' : 'periods'}.`);
          }}
        />
      )}

      {/* Creative Upsell Modal */}
      {showCreativeUpsellModal && (
        <CreativeUpsellModal
          isOpen={showCreativeUpsellModal}
          onClose={() => setShowCreativeUpsellModal(false)}
          currentSites={quantity}
          currentCreatives={creativeAssets}
          efficiency={creativeEfficiency}
          status={creativeStatus}
          options={generateCreativeUpsellOptions()}
          onSelectOption={(option) => {
            if (option.type === 'sites') {
              setQuantity(option.suggestedValue);
            } else if (option.type === 'creatives') {
              setCreativeAssets(option.suggestedValue);
            }
            setShowCreativeUpsellModal(false);
            toast.success(`Creative strategy optimized! Updated to ${option.suggestedValue} ${option.type}.`);
          }}
        />
      )}
    </>
  );
};

export default FormatPage;