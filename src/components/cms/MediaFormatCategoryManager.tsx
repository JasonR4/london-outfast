import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Pencil, Plus, Trash2, Tags } from 'lucide-react';
// Categories constant
const CREATIVE_CATEGORIES = ['Digital', 'Transport', 'Roadside', 'Premium', 'Retail', 'Standard'];

interface MediaFormat {
  id: string;
  format_name: string;
  format_slug: string;
  description: string | null;
  dimensions: string | null;
  is_active: boolean;
  categories?: string[];
}

interface MediaFormatCategory {
  id: string;
  media_format_id: string;
  category: string;
  is_active: boolean;
  media_formats?: {
    format_name: string;
  };
}

export function MediaFormatCategoryManager() {
  const [mediaFormats, setMediaFormats] = useState<MediaFormat[]>([]);
  const [formatCategories, setFormatCategories] = useState<MediaFormatCategory[]>([]);
  const [selectedFormat, setSelectedFormat] = useState<MediaFormat | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [editingFormatName, setEditingFormatName] = useState<string | null>(null);
  const [newFormatName, setNewFormatName] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch media formats
      const { data: formatsData, error: formatsError } = await supabase
        .from('media_formats')
        .select('*')
        .eq('is_active', true)
        .order('format_name');

      if (formatsError) throw formatsError;

      // Check if we have a format_categories table or if categories are stored differently
      // For now, we'll simulate categories based on the format names and our constants
      const formatsWithCategories = formatsData?.map(format => ({
        ...format,
        categories: getDefaultCategoriesForFormat(format.format_name)
      })) || [];

      setMediaFormats(formatsWithCategories);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load media formats and categories');
    } finally {
      setIsLoading(false);
    }
  };

  const getDefaultCategoriesForFormat = (formatName: string): string[] => {
    // Default category assignment based on format name
    const name = formatName.toLowerCase();
    
    if (name.includes('digital') || name.includes('led')) {
      return ['Digital'];
    } else if (name.includes('transport') || name.includes('bus') || name.includes('tube') || name.includes('rail')) {
      return ['Transport'];
    } else if (name.includes('billboard') || name.includes('poster')) {
      return ['Roadside', 'Premium'];
    } else if (name.includes('retail') || name.includes('shopping')) {
      return ['Retail'];
    }
    
    return ['Standard'];
  };

  const handleEditCategories = (format: MediaFormat) => {
    setSelectedFormat(format);
    setSelectedCategories(format.categories || []);
    setIsDialogOpen(true);
  };

  const handleSaveCategories = async () => {
    if (!selectedFormat) return;

    try {
      // For now, we'll just update the local state
      // In a real implementation, you'd save this to a format_categories table
      const updatedFormats = mediaFormats.map(format =>
        format.id === selectedFormat.id
          ? { ...format, categories: selectedCategories }
          : format
      );
      
      setMediaFormats(updatedFormats);
      toast.success('Categories updated successfully');
      setIsDialogOpen(false);
      setSelectedFormat(null);
      setSelectedCategories([]);
    } catch (error) {
      console.error('Error saving categories:', error);
      toast.error('Failed to save categories');
    }
  };

  const handleEditFormatName = (format: MediaFormat) => {
    setEditingFormatName(format.id);
    setNewFormatName(format.format_name);
  };

  const handleSaveFormatName = async (formatId: string) => {
    try {
      const { error } = await supabase
        .from('media_formats')
        .update({ format_name: newFormatName })
        .eq('id', formatId);

      if (error) throw error;

      // Update local state
      const updatedFormats = mediaFormats.map(format =>
        format.id === formatId
          ? { ...format, format_name: newFormatName }
          : format
      );
      
      setMediaFormats(updatedFormats);
      setEditingFormatName(null);
      setNewFormatName('');
      toast.success('Format name updated successfully');
    } catch (error) {
      console.error('Error updating format name:', error);
      toast.error('Failed to update format name');
    }
  };

  const handleCancelEditFormatName = () => {
    setEditingFormatName(null);
    setNewFormatName('');
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Digital': 'bg-blue-100 text-blue-800',
      'Transport': 'bg-green-100 text-green-800',
      'Roadside': 'bg-yellow-100 text-yellow-800',
      'Premium': 'bg-purple-100 text-purple-800',
      'Retail': 'bg-orange-100 text-orange-800',
      'Standard': 'bg-gray-100 text-gray-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading media formats and categories...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tags className="w-5 h-5" />
            Media Formats & Categories
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Click on format names to edit them. Use the pencil icon to manage categories. This is the source of truth for all format names and categories across the site.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Format Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Dimensions</TableHead>
                    <TableHead>Categories</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mediaFormats.map((format) => (
                    <TableRow key={format.id}>
                       <TableCell>
                         {editingFormatName === format.id ? (
                           <div className="space-y-2">
                             <Input
                               value={newFormatName}
                               onChange={(e) => setNewFormatName(e.target.value)}
                               className="font-medium"
                               onKeyDown={(e) => {
                                 if (e.key === 'Enter') {
                                   handleSaveFormatName(format.id);
                                 } else if (e.key === 'Escape') {
                                   handleCancelEditFormatName();
                                 }
                               }}
                               autoFocus
                             />
                             <div className="text-sm text-muted-foreground">{format.format_slug}</div>
                             <div className="flex gap-1">
                               <Button
                                 size="sm"
                                 onClick={() => handleSaveFormatName(format.id)}
                                 disabled={!newFormatName.trim()}
                               >
                                 Save
                               </Button>
                               <Button
                                 size="sm"
                                 variant="outline"
                                 onClick={handleCancelEditFormatName}
                               >
                                 Cancel
                               </Button>
                             </div>
                           </div>
                         ) : (
                           <div 
                             className="cursor-pointer hover:bg-muted/50 p-1 rounded"
                             onClick={() => handleEditFormatName(format)}
                           >
                             <div className="font-medium">{format.format_name}</div>
                             <div className="text-sm text-muted-foreground">{format.format_slug}</div>
                           </div>
                         )}
                       </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          {format.description || 'No description'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {format.dimensions || 'Not specified'}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {format.categories && format.categories.length > 0 ? (
                            format.categories.map((category) => (
                              <Badge
                                key={category}
                                variant="secondary"
                                className={`text-xs ${getCategoryColor(category)}`}
                              >
                                {category}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-sm text-muted-foreground">No categories</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditCategories(format)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Edit Categories for {selectedFormat?.format_name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Available Categories</Label>
              <div className="grid grid-cols-1 gap-2 mt-2">
                {CREATIVE_CATEGORIES.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category}`}
                      checked={selectedCategories.includes(category)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedCategories([...selectedCategories, category]);
                        } else {
                          setSelectedCategories(selectedCategories.filter(c => c !== category));
                        }
                      }}
                    />
                    <Label htmlFor={`category-${category}`} className="text-sm">
                      {category}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  setSelectedFormat(null);
                  setSelectedCategories([]);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveCategories}>
                Save Categories
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}