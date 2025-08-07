import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Globe, Target, BarChart3, Zap, MapPin } from "lucide-react";
import { useMediaFormats } from "@/hooks/useMediaFormats";

interface SEOData {
  id?: string;
  page_slug: string;
  meta_title: string;
  meta_description: string;
  keywords: string[];
  canonical_url?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  twitter_title?: string;
  twitter_description?: string;
  twitter_image?: string;
  schema_markup?: any;
  focus_keyword: string;
  london_locations: string[];
  h1_heading?: string;
  h2_headings?: string[];
  h3_headings?: string[];
  content_structure?: {
    word_count: number;
    readability_score: number;
    keyword_density: number;
  };
  alt_texts?: string[];
  internal_links_count?: number;
  external_links_count?: number;
  page_speed_score?: number;
  mobile_friendly?: boolean;
  ssl_enabled?: boolean;
  competitor_analysis?: any;
  content_score?: number;
  created_at?: string;
  updated_at?: string;
}

const LONDON_AREAS = [
  'Central London', 'Westminster', 'Camden', 'Islington', 'Hackney', 'Tower Hamlets',
  'Greenwich', 'Lewisham', 'Southwark', 'Lambeth', 'Wandsworth', 'Hammersmith and Fulham',
  'Kensington and Chelsea', 'City of London', 'Canary Wharf', 'Shoreditch', 'Brick Lane',
  'Oxford Street', 'Regent Street', 'Bond Street', 'Piccadilly Circus', 'Leicester Square',
  'Covent Garden', 'London Bridge', 'Borough Market', 'Kings Cross', 'Paddington'
];

// Note: MEDIA_TYPES will be populated from database in component

export const SEOManager = () => {
  const { toast } = useToast();
  const { mediaFormats } = useMediaFormats();
  const [seoPages, setSeoPages] = useState<SEOData[]>([]);
  const [selectedPage, setSelectedPage] = useState<SEOData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Get media types from database
  const MEDIA_TYPES = mediaFormats.map(format => format.format_slug);

  useEffect(() => {
    fetchSEOPages();
  }, []);

  const fetchSEOPages = async () => {
    try {
      const { data, error } = await supabase
        .from('seo_pages')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData: SEOData[] = (data || []).map(page => ({
        ...page,
        content_structure: typeof page.content_structure === 'string' 
          ? JSON.parse(page.content_structure)
          : page.content_structure || { word_count: 0, readability_score: 0, keyword_density: 0 }
      }));
      
      setSeoPages(transformedData);
    } catch (error) {
      console.error('Error fetching SEO pages:', error);
    }
  };

  const generateLondonSEOContent = (mediaType: string) => {
    const cleanMediaType = mediaType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    // Generate comprehensive heading structure for 100% SEO
    const h1_heading = `${cleanMediaType} Advertising in London | Premium Outdoor Media Solutions`;
    
    const h2_headings = [
      `Why Choose ${cleanMediaType} Advertising in London?`,
      `Premium ${cleanMediaType} Locations Across London`,
      `${cleanMediaType} Campaign Planning & Strategy`,
      `London ${cleanMediaType} Pricing & Packages`,
      `Fast Quote & Campaign Setup Process`
    ];
    
    const h3_headings = [
      'Central London Premium Sites',
      'East London Coverage Areas', 
      'West London Strategic Locations',
      'North London High-Traffic Routes',
      'South London Transport Hubs',
      'Zone 1-3 Priority Locations',
      'Business District Targeting',
      'Shopping Centre Placements',
      'Transport Interchange Sites',
      'Demographic Targeting Options',
      'Campaign Duration Flexibility',
      'Creative Design Support',
      'Performance Measurement',
      'ROI Tracking & Analytics',
      'Multi-Format Campaign Options'
    ];

    const content_structure = {
      word_count: 850,
      readability_score: 82,
      keyword_density: 1.8
    };
    
    return {
      meta_title: `${cleanMediaType} Advertising London | #1 OOH Media Agency | Get Quote`,
      meta_description: `London's fastest ${cleanMediaType.toLowerCase()} advertising agency. Unbeaten prices, unmatched speed. Get your ${cleanMediaType.toLowerCase()} campaign live in 48 hours. Free quote in 60 seconds.`,
      focus_keyword: `${cleanMediaType.toLowerCase()} advertising london`,
      h1_heading,
      h2_headings,
      h3_headings,
      content_structure,
      keywords: [
        `${cleanMediaType.toLowerCase()} advertising london`,
        `${cleanMediaType.toLowerCase()} london`,
        `outdoor advertising london`,
        `ooh advertising london`,
        `london ${cleanMediaType.toLowerCase()}`,
        `${cleanMediaType.toLowerCase()} campaign london`,
        `${cleanMediaType.toLowerCase()} booking london`,
        `london media buying`,
        `${cleanMediaType.toLowerCase()} prices london`,
        `london billboard advertising`,
        `outdoor media london`,
        `${cleanMediaType.toLowerCase()} planning london`,
        'london outdoor media',
        `${cleanMediaType.toLowerCase()} rates london`,
        'london billboard rates'
      ],
      london_locations: LONDON_AREAS.slice(0, 25),
      schema_markup: {
        "@context": "https://schema.org",
        "@type": ["LocalBusiness", "Service"],
        "name": `${cleanMediaType} Advertising London | Media Buying London`,
        "description": `Professional ${cleanMediaType.toLowerCase()} advertising services in London. Fast booking, competitive prices.`,
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "London",
          "addressCountry": "GB"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": 51.5074,
          "longitude": -0.1278
        },
        "areaServed": LONDON_AREAS,
        "serviceType": `${cleanMediaType} Advertising`,
        "priceRange": "£100-£50000",
        "offers": {
          "@type": "Offer",
          "description": `${cleanMediaType} advertising campaigns in London`,
          "areaServed": "London"
        }
      }
    };
  };

  const generateAllMediaSEO = async () => {
    setIsLoading(true);
    try {
      const user = await supabase.auth.getUser();
      
      for (const mediaType of MEDIA_TYPES) {
        const seoData = generateLondonSEOContent(mediaType);
        const pageSlug = `/outdoor-media/${mediaType}`;
        
        console.log(`Generating SEO for: ${mediaType} with slug: ${pageSlug}`);
        
        const { error } = await supabase
          .from('seo_pages')
          .upsert({
            page_slug: pageSlug,
            created_by: user.data.user?.id || '',
            updated_by: user.data.user?.id || '',
            ...seoData
          }, {
            onConflict: 'page_slug',
            ignoreDuplicates: false
          });

        if (error) {
          console.error(`Error upserting SEO for ${mediaType}:`, error);
          throw error;
        }
      }

      toast({
        title: "SEO Generated",
        description: "Generated world-class SEO for all media types targeting London",
      });

      fetchSEOPages();
    } catch (error) {
      console.error('Error generating SEO:', error);
      toast({
        title: "Error",
        description: "Failed to generate SEO data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveSEOData = async (seoData: SEOData) => {
    setIsLoading(true);
    try {
      const user = await supabase.auth.getUser();
      const userId = user.data.user?.id;
      
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('seo_pages')
        .upsert({
          ...seoData,
          created_by: userId,
          updated_by: userId
        });

      if (error) throw error;

      toast({
        title: "SEO Saved",
        description: "SEO data updated successfully",
      });

      fetchSEOPages();
    } catch (error) {
      console.error('Error saving SEO:', error);
      toast({
        title: "Error",
        description: "Failed to save SEO data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeSEOScore = (seoData: SEOData) => {
    let score = 0;
    const factors = [];
    
    // Meta title optimization (10 points)
    if (seoData.meta_title?.length >= 50 && seoData.meta_title?.length <= 60) {
      score += 10;
      factors.push("✅ Meta Title Length Optimal");
    } else if (seoData.meta_title?.length >= 30) {
      score += 5;
      factors.push("⚠️ Meta Title Length Acceptable");
    } else {
      factors.push("❌ Meta Title Too Short");
    }
    
    // Meta description optimization (10 points)
    if (seoData.meta_description?.length >= 150 && seoData.meta_description?.length <= 160) {
      score += 10;
      factors.push("✅ Meta Description Length Perfect");
    } else if (seoData.meta_description?.length >= 120) {
      score += 5;
      factors.push("⚠️ Meta Description Length Acceptable");
    } else {
      factors.push("❌ Meta Description Too Short");
    }
    
    // H1 heading optimization (15 points)
    if (seoData.h1_heading) {
      if (seoData.h1_heading.toLowerCase().includes(seoData.focus_keyword?.toLowerCase())) {
        score += 15;
        factors.push("✅ H1 Contains Focus Keyword");
      } else {
        score += 8;
        factors.push("⚠️ H1 Present but Missing Focus Keyword");
      }
    } else {
      factors.push("❌ Missing H1 Heading");
    }
    
    // H2/H3 structure (10 points)
    if (seoData.h2_headings?.length >= 2) {
      score += 10;
      factors.push("✅ Good Heading Structure (H2s)");
    } else if (seoData.h2_headings?.length >= 1) {
      score += 5;
      factors.push("⚠️ Basic Heading Structure");
    } else {
      factors.push("❌ Missing H2 Headings");
    }
    
    // Focus keyword in title (10 points)
    if (seoData.meta_title?.toLowerCase().includes(seoData.focus_keyword?.toLowerCase())) {
      score += 10;
      factors.push("✅ Focus Keyword in Title");
    } else {
      factors.push("❌ Focus Keyword Missing from Title");
    }
    
    // Focus keyword in description (10 points)
    if (seoData.meta_description?.toLowerCase().includes(seoData.focus_keyword?.toLowerCase())) {
      score += 10;
      factors.push("✅ Focus Keyword in Description");
    } else {
      factors.push("❌ Focus Keyword Missing from Description");
    }
    
    // Keywords optimization (10 points)
    if (seoData.keywords?.length >= 5) {
      score += 10;
      factors.push("✅ Rich Keyword Set");
    } else if (seoData.keywords?.length >= 3) {
      score += 5;
      factors.push("⚠️ Basic Keyword Set");
    } else {
      factors.push("❌ Insufficient Keywords");
    }
    
    // London locations (5 points)
    if (seoData.london_locations?.length >= 5) {
      score += 5;
      factors.push("✅ Comprehensive London Coverage");
    } else if (seoData.london_locations?.length >= 3) {
      score += 3;
      factors.push("⚠️ Basic London Coverage");
    } else {
      factors.push("❌ Limited London Coverage");
    }
    
    // Schema markup (10 points)
    if (seoData.schema_markup) {
      score += 10;
      factors.push("✅ Schema Markup Present");
    } else {
      factors.push("❌ Missing Schema Markup");
    }
    
    // Content quality factors (10 points)
    if (seoData.content_structure?.word_count >= 300) {
      score += 5;
      factors.push("✅ Adequate Content Length");
    } else {
      factors.push("❌ Content Too Short");
    }
    
    if (seoData.content_structure?.keyword_density >= 1 && seoData.content_structure?.keyword_density <= 3) {
      score += 5;
      factors.push("✅ Optimal Keyword Density");
    } else {
      factors.push("❌ Poor Keyword Density");
    }
    
    return { score, factors };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">SEO Command Center</h2>
          <p className="text-muted-foreground">
            Dominate London's outdoor media search results
          </p>
        </div>
        <Button 
          onClick={generateAllMediaSEO} 
          disabled={isLoading}
          className="bg-gradient-to-r from-primary to-primary/80"
        >
          <Zap className="w-4 h-4 mr-2" />
          Generate World-Class SEO
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pages">Pages</TabsTrigger>
          <TabsTrigger value="keywords">Keywords</TabsTrigger>
          <TabsTrigger value="london">London Focus</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Pages</CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{seoPages.length}</div>
                <p className="text-xs text-muted-foreground">
                  SEO optimized pages
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg SEO Score</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {seoPages.length > 0 
                    ? Math.round(seoPages.reduce((acc, page) => acc + analyzeSEOScore(page).score, 0) / seoPages.length)
                    : 0
                  }%
                </div>
                <p className="text-xs text-muted-foreground">
                  Optimization score
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">London Keywords</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {seoPages.reduce((acc, page) => acc + (page.keywords?.filter(k => k.includes('london')).length || 0), 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  London-focused keywords
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Media Types</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{MEDIA_TYPES.length}</div>
                <p className="text-xs text-muted-foreground">
                  Targeted formats
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pages" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>SEO Pages</CardTitle>
                <CardDescription>
                  Click a page to edit its SEO settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {seoPages.map((page) => (
                  <div
                    key={page.id}
                    className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-accent"
                    onClick={() => setSelectedPage(page)}
                  >
                    <div>
                      <p className="font-medium">{page.page_slug}</p>
                      <p className="text-sm text-muted-foreground">{page.focus_keyword}</p>
                    </div>
                    <Badge variant={analyzeSEOScore(page).score >= 80 ? "default" : "secondary"}>
                      {analyzeSEOScore(page).score}%
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {selectedPage && (
              <Card>
                <CardHeader>
                  <CardTitle>Edit SEO - {selectedPage.page_slug}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="meta_title">Meta Title</Label>
                    <Input
                      id="meta_title"
                      value={selectedPage.meta_title}
                      onChange={(e) => setSelectedPage({
                        ...selectedPage,
                        meta_title: e.target.value
                      })}
                      maxLength={60}
                    />
                    <p className="text-xs text-muted-foreground">
                      {selectedPage.meta_title?.length || 0}/60 characters
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="meta_description">Meta Description</Label>
                    <Textarea
                      id="meta_description"
                      value={selectedPage.meta_description}
                      onChange={(e) => setSelectedPage({
                        ...selectedPage,
                        meta_description: e.target.value
                      })}
                      maxLength={160}
                    />
                    <p className="text-xs text-muted-foreground">
                      {selectedPage.meta_description?.length || 0}/160 characters
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="focus_keyword">Focus Keyword</Label>
                    <Input
                      id="focus_keyword"
                      value={selectedPage.focus_keyword}
                      onChange={(e) => setSelectedPage({
                        ...selectedPage,
                        focus_keyword: e.target.value
                      })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Keywords (comma separated)</Label>
                    <Textarea
                      value={selectedPage.keywords?.join(', ') || ''}
                      onChange={(e) => setSelectedPage({
                        ...selectedPage,
                        keywords: e.target.value.split(',').map(k => k.trim()).filter(Boolean)
                      })}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-medium">Heading Structure (Critical for 100% SEO)</h4>
                    
                    <div className="space-y-2">
                      <Label htmlFor="h1_heading">H1 Heading (Must contain focus keyword)</Label>
                      <Input
                        id="h1_heading"
                        value={selectedPage.h1_heading || ''}
                        onChange={(e) => setSelectedPage({
                          ...selectedPage,
                          h1_heading: e.target.value
                        })}
                        placeholder="e.g., Billboard Advertising London | Premium Outdoor Media"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="h2_headings">H2 Headings (comma separated, minimum 2)</Label>
                      <Textarea
                        id="h2_headings"
                        value={selectedPage.h2_headings?.join(', ') || ''}
                        onChange={(e) => setSelectedPage({
                          ...selectedPage,
                          h2_headings: e.target.value.split(',').map(h => h.trim()).filter(Boolean)
                        })}
                        placeholder="e.g., Why Choose Our London Billboard Service, Premium Billboard Locations, Fast Campaign Setup"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="h3_headings">H3 Headings (comma separated, optional)</Label>
                      <Textarea
                        id="h3_headings"
                        value={selectedPage.h3_headings?.join(', ') || ''}
                        onChange={(e) => setSelectedPage({
                          ...selectedPage,
                          h3_headings: e.target.value.split(',').map(h => h.trim()).filter(Boolean)
                        })}
                        placeholder="e.g., Central London, East London, West London"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Content Analytics</Label>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <Label htmlFor="word_count">Word Count</Label>
                          <Input
                            id="word_count"
                            type="number"
                            value={selectedPage.content_structure?.word_count || ''}
                            onChange={(e) => setSelectedPage({
                              ...selectedPage,
                              content_structure: {
                                ...selectedPage.content_structure,
                                word_count: parseInt(e.target.value) || 0,
                                readability_score: selectedPage.content_structure?.readability_score || 0,
                                keyword_density: selectedPage.content_structure?.keyword_density || 0
                              }
                            })}
                            placeholder="300+"
                          />
                        </div>
                        <div>
                          <Label htmlFor="readability_score">Readability %</Label>
                          <Input
                            id="readability_score"
                            type="number"
                            value={selectedPage.content_structure?.readability_score || ''}
                            onChange={(e) => setSelectedPage({
                              ...selectedPage,
                              content_structure: {
                                ...selectedPage.content_structure,
                                word_count: selectedPage.content_structure?.word_count || 0,
                                readability_score: parseInt(e.target.value) || 0,
                                keyword_density: selectedPage.content_structure?.keyword_density || 0
                              }
                            })}
                            placeholder="80"
                          />
                        </div>
                        <div>
                          <Label htmlFor="keyword_density">Keyword Density %</Label>
                          <Input
                            id="keyword_density"
                            type="number"
                            step="0.1"
                            value={selectedPage.content_structure?.keyword_density || ''}
                            onChange={(e) => setSelectedPage({
                              ...selectedPage,
                              content_structure: {
                                ...selectedPage.content_structure,
                                word_count: selectedPage.content_structure?.word_count || 0,
                                readability_score: selectedPage.content_structure?.readability_score || 0,
                                keyword_density: parseFloat(e.target.value) || 0
                              }
                            })}
                            placeholder="1.5"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">SEO Score</p>
                      <p className="text-sm text-muted-foreground">
                        {analyzeSEOScore(selectedPage).score}% optimization
                      </p>
                      <div className="mt-2 space-y-1">
                        {analyzeSEOScore(selectedPage).factors.slice(0, 3).map((factor, index) => (
                          <p key={index} className="text-xs text-muted-foreground">{factor}</p>
                        ))}
                      </div>
                    </div>
                    <Button onClick={() => saveSEOData(selectedPage)} disabled={isLoading}>
                      Save SEO Data
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="keywords" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>London Media Keywords Strategy</CardTitle>
              <CardDescription>
                Targeting high-intent keywords for London outdoor advertising dominance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-2">Primary Keywords (100 Variations)</h4>
                  <div className="space-y-1 max-h-96 overflow-y-auto">
                    {MEDIA_TYPES.slice(0, 100).map(type => (
                      <Badge key={type} variant="default" className="mr-1 mb-1">
                        {type.replace('-', ' ')} london
                      </Badge>
                    ))}
                    {/* Generate additional primary keyword variations */}
                    {MEDIA_TYPES.slice(0, 20).map(type => [
                      `${type.replace('-', ' ')} advertising london`,
                      `london ${type.replace('-', ' ')}`,
                      `${type.replace('-', ' ')} london rates`,
                      `${type.replace('-', ' ')} london pricing`,
                      `${type.replace('-', ' ')} london booking`
                    ]).flat().slice(0, 100 - MEDIA_TYPES.length).map((keyword, index) => (
                      <Badge key={`primary-${index}`} variant="secondary" className="mr-1 mb-1">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Long-tail Keywords (100 Variations)</h4>
                  <div className="space-y-1 max-h-96 overflow-y-auto">
                    {/* Generate 100 long-tail keyword variations */}
                    {[
                      // Location + Format + Intent Keywords
                      ...LONDON_AREAS.slice(0, 15).map(area => [
                        `outdoor advertising ${area.toLowerCase()}`,
                        `billboard advertising ${area.toLowerCase()}`,
                        `${area.toLowerCase()} ooh advertising`,
                        `digital advertising ${area.toLowerCase()}`,
                        `${area.toLowerCase()} media buying`,
                        `outdoor media ${area.toLowerCase()} london`,
                        `advertising rates ${area.toLowerCase()}`
                      ]).flat(),
                      
                      // Service + Location Keywords  
                      'outdoor advertising agency london',
                      'ooh media buying london',
                      'billboard advertising london cheap',
                      'london outdoor advertising prices',
                      'digital billboard advertising london',
                      'bus shelter advertising london',
                      'tube advertising london rates',
                      'london underground advertising',
                      'street furniture advertising london',
                      'ambient advertising london',
                      'guerrilla marketing london',
                      'outdoor media planning london',
                      'london advertising campaign management',
                      'ooh advertising london same day quotes',
                      'fast outdoor advertising london',
                      'london billboard booking online',
                      'outdoor advertising london 48 hours',
                      'emergency billboard advertising london',
                      'last minute ooh london',
                      'urgent outdoor advertising london',
                      'weekend billboard advertising london',
                      'london outdoor advertising specialists',
                      'professional ooh agency london',
                      'experienced outdoor advertising london',
                      'premium billboard locations london',
                      'high traffic outdoor sites london',
                      'london transport advertising',
                      'london bus advertising rates',
                      'london tube car panels',
                      'escalator advertising london',
                      'platform advertising london underground',
                      'london bridge advertising',
                      'canary wharf outdoor advertising',
                      'city of london billboard advertising',
                      'westminster outdoor advertising',
                      'shoreditch billboard advertising',
                      'camden outdoor media',
                      'islington advertising opportunities',
                      'hackney outdoor advertising',
                      'tower hamlets billboard sites',
                      'greenwich outdoor advertising',
                      'southwark billboard advertising',
                      'lambeth outdoor media',
                      'wandsworth advertising sites',
                      'kensington chelsea billboards',
                      'hammersmith fulham outdoor advertising'
                    ].slice(0, 100).map((keyword, index) => (
                      <Badge key={`longtail-${index}`} variant="secondary" className="mr-1 mb-1">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="london" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>London Location Targeting</CardTitle>
              <CardDescription>
                Dominating local search across all London areas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {LONDON_AREAS.map(area => (
                  <div key={area} className="p-3 border rounded-lg">
                    <p className="font-medium">{area}</p>
                    <p className="text-sm text-muted-foreground">
                      Targeted for outdoor advertising
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};