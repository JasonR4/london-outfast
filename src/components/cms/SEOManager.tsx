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

const MEDIA_TYPES = [
  '6-sheet-poster', '48-sheet-billboard', '96-sheet-billboard', 'bus-advertising',
  'tube-advertising', 'taxi-advertising', 'digital-billboard', 'street-furniture',
  'transit-advertising', 'retail-advertising', 'ambient-advertising', 'experiential'
];

export const SEOManager = () => {
  const { toast } = useToast();
  const [seoPages, setSeoPages] = useState<SEOData[]>([]);
  const [selectedPage, setSelectedPage] = useState<SEOData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
      setSeoPages(data || []);
    } catch (error) {
      console.error('Error fetching SEO pages:', error);
    }
  };

  const generateLondonSEOContent = (mediaType: string) => {
    const cleanMediaType = mediaType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    return {
      meta_title: `${cleanMediaType} Advertising London | #1 OOH Media Agency | Get Quote`,
      meta_description: `London's fastest ${cleanMediaType.toLowerCase()} advertising agency. Unbeaten prices, unmatched speed. Get your ${cleanMediaType.toLowerCase()} campaign live in 48 hours. Free quote in 60 seconds.`,
      focus_keyword: `${cleanMediaType.toLowerCase()} advertising london`,
      keywords: [
        `${cleanMediaType.toLowerCase()} advertising london`,
        `${cleanMediaType.toLowerCase()} london`,
        `outdoor advertising london`,
        `ooh advertising london`,
        `london ${cleanMediaType.toLowerCase()}`,
        `${cleanMediaType.toLowerCase()} campaign london`,
        `${cleanMediaType.toLowerCase()} booking london`,
        `london media buying`,
        `${cleanMediaType.toLowerCase()} prices london`
      ],
      london_locations: LONDON_AREAS.slice(0, 10),
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
        "areaServed": LONDON_AREAS,
        "serviceType": `${cleanMediaType} Advertising`,
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
      for (const mediaType of MEDIA_TYPES) {
        const seoData = generateLondonSEOContent(mediaType);
        
        const { error } = await supabase
          .from('seo_pages')
          .upsert({
            page_slug: `/outdoor-media/${mediaType}`,
            created_by: (await supabase.auth.getUser()).data.user?.id || '',
            updated_by: (await supabase.auth.getUser()).data.user?.id || '',
            ...seoData
          });

        if (error) throw error;
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
                  <h4 className="font-medium mb-2">Primary Keywords</h4>
                  <div className="space-y-1">
                    {MEDIA_TYPES.slice(0, 6).map(type => (
                      <Badge key={type} variant="default" className="mr-1 mb-1">
                        {type.replace('-', ' ')} london
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Long-tail Keywords</h4>
                  <div className="space-y-1">
                    <Badge variant="secondary" className="mr-1 mb-1">outdoor advertising agency london</Badge>
                    <Badge variant="secondary" className="mr-1 mb-1">ooh media buying london</Badge>
                    <Badge variant="secondary" className="mr-1 mb-1">billboard advertising london cheap</Badge>
                    <Badge variant="secondary" className="mr-1 mb-1">london outdoor advertising prices</Badge>
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