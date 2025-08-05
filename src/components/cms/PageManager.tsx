import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, Globe } from 'lucide-react';
import { oohFormats } from '@/data/oohFormats';

interface ContentPage {
  id: string;
  slug: string;
  title: string;
  meta_description: string | null;
  content: any;
  status: string;
  page_type: string;
  created_at: string;
  updated_at: string;
}

export const PageManager = () => {
  const [pages, setPages] = useState<ContentPage[]>([]);
  const [filteredPages, setFilteredPages] = useState<ContentPage[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'ooh_format' | 'page'>('all');
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPages();
  }, []);

  useEffect(() => {
    filterPages();
  }, [pages, searchTerm, statusFilter, typeFilter]);

  const filterPages = () => {
    let filtered = [...pages];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(page => 
        page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        page.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (page.meta_description && page.meta_description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(page => page.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(page => page.page_type === typeFilter);
    }

    setFilteredPages(filtered);
  };

  const fetchPages = async () => {
    const { data, error } = await supabase
      .from('content_pages')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch pages",
        variant: "destructive"
      });
    } else {
      setPages(data || []);
    }
  };

  const syncOOHFormats = async () => {
    setSyncing(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      // Get existing pages to avoid duplicates
      const existingSlugs = pages.map(p => p.slug);
      
      for (const format of oohFormats) {
        if (!existingSlugs.includes(format.slug)) {
          const pageData = {
            slug: format.slug,
            title: format.name,
            meta_description: format.description.slice(0, 160),
            content: {
              hero_title: format.name,
              hero_description: format.description,
              category: format.category,
              type: format.type,
              placement: format.placement,
              dwellTime: format.dwellTime,
              effectiveness: format.effectiveness,
              pricing: format.priceRange,
              coverage: format.londonCoverage,
              whoUsesThis: format.whoUsesIt,
              networks: format.networks
            },
            status: 'published' as const,
            page_type: 'ooh_format' as const,
            created_by: user.id,
            updated_by: user.id
          };

          const { error } = await supabase
            .from('content_pages')
            .insert(pageData);

          if (error) {
            console.error(`Error creating page for ${format.name}:`, error);
          }
        }
      }

      await fetchPages();
      
      toast({
        title: "Success",
        description: "OOH format pages synchronized successfully"
      });
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }

    setSyncing(false);
  };

  const updatePageStatus = async (pageId: string, status: 'draft' | 'published') => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('content_pages')
      .update({ 
        status,
        updated_by: user.id
      })
      .eq('id', pageId);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: `Page ${status === 'published' ? 'published' : 'unpublished'} successfully`
      });
      fetchPages();
    }
  };

  const getPageStats = () => {
    const total = pages.length;
    const published = pages.filter(p => p.status === 'published').length;
    const draft = pages.filter(p => p.status === 'draft').length;
    const oohFormats = pages.filter(p => p.page_type === 'ooh_format').length;
    
    return { total, published, draft, oohFormats };
  };

  const stats = getPageStats();

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pages">All Pages</TabsTrigger>
          <TabsTrigger value="sync">Sync Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Pages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Published</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.published}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Drafts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.draft}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">OOH Formats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.oohFormats}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pages.slice(0, 5).map((page) => (
                  <div key={page.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{page.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Updated: {new Date(page.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={page.status === 'published' ? 'default' : 'secondary'}>
                      {page.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pages">
          <div className="space-y-6">
            {/* Filter Controls */}
            <Card>
              <CardHeader>
                <CardTitle>Filter & Search</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="search">Search Pages</Label>
                    <Input
                      id="search"
                      placeholder="Search by title, slug, or description..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="status-filter">Filter by Status</Label>
                    <Select value={statusFilter} onValueChange={(value: 'all' | 'draft' | 'published') => setStatusFilter(value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="type-filter">Filter by Type</Label>
                    <Select value={typeFilter} onValueChange={(value: 'all' | 'ooh_format' | 'page') => setTypeFilter(value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="ooh_format">OOH Formats</SelectItem>
                        <SelectItem value="page">General Pages</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Showing {filteredPages.length} of {pages.length} pages
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                      setTypeFilter('all');
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Pages List */}
            <div className="space-y-4">
              {filteredPages.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">No pages found matching your filters.</p>
                  </CardContent>
                </Card>
              ) : (
                filteredPages.map((page) => (
              <Card key={page.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold">{page.title}</h3>
                      <p className="text-sm text-muted-foreground">/{page.slug}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Type: {page.page_type} • Updated: {new Date(page.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={page.status === 'published' ? 'default' : 'secondary'}>
                        {page.status}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`/outdoor-media/${page.slug}`, '_blank')}
                      >
                        <Globe className="w-4 h-4" />
                      </Button>
                      <Select
                        value={page.status}
                        onValueChange={(value: 'draft' | 'published') => updatePageStatus(page.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="sync">
          <Card>
            <CardHeader>
              <CardTitle>Synchronization Tools</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">Sync OOH Format Pages</h3>
                  <p className="text-sm text-muted-foreground">
                    Create CMS pages for all OOH formats from your data file
                  </p>
                </div>
                <Button onClick={syncOOHFormats} disabled={syncing}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {syncing ? 'Syncing...' : 'Sync Now'}
                </Button>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Sync Information</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Creates pages for OOH formats that don't exist in CMS</li>
                  <li>• Uses data from your oohFormats.ts file</li>
                  <li>• Pages are published by default</li>
                  <li>• Existing pages won't be overwritten</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};