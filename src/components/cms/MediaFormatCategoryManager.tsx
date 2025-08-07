import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Pencil, Plus, Trash2, Tags } from 'lucide-react';
import { useCentralizedMediaFormats } from '@/hooks/useCentralizedMediaFormats';
import { MediaFormat } from '@/services/mediaFormatsService';
// Categories constants - Location and Format categories are managed separately
const LOCATION_CATEGORIES = ['Transport', 'Retail', 'Rail', 'Supermarket', 'Roadside', 'London Underground'];
const FORMAT_CATEGORIES = ['Digital', 'Paper & Paste', 'Backlight', 'Illuminated', 'Premium', 'HD', 'Vynl', 'WRB'];

export function MediaFormatCategoryManager() {
  const { 
    mediaFormats, 
    loading, 
    error, 
    updateFormat 
  } = useCentralizedMediaFormats(true); // Include inactive for admin management
  
  const [selectedFormat, setSelectedFormat] = useState<MediaFormat | null>(null);
  const [selectedLocationCategories, setSelectedLocationCategories] = useState<string[]>([]);
  const [selectedFormatCategories, setSelectedFormatCategories] = useState<string[]>([]);
  const [editingFormatName, setEditingFormatName] = useState<string | null>(null);
  const [newFormatName, setNewFormatName] = useState<string>('');
  const [editingDescription, setEditingDescription] = useState<string | null>(null);
  const [newDescription, setNewDescription] = useState<string>('');
  const [editingDimensions, setEditingDimensions] = useState<string | null>(null);
  const [newDimensions, setNewDimensions] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Handle errors from the hook
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);


  const handleEditCategories = (format: MediaFormat) => {
    setSelectedFormat(format);
    setSelectedLocationCategories(format.categories?.location || []);
    setSelectedFormatCategories(format.categories?.format || []);
    setIsDialogOpen(true);
  };

  const handleSaveCategories = async () => {
    if (!selectedFormat) return;

    try {
      await updateFormat(selectedFormat.id, {
        categories: {
          location: selectedLocationCategories,
          format: selectedFormatCategories
        }
      });
      
      toast.success('Categories updated successfully');
      setIsDialogOpen(false);
      setSelectedFormat(null);
      setSelectedLocationCategories([]);
      setSelectedFormatCategories([]);
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
      await updateFormat(formatId, { format_name: newFormatName });
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

  const handleEditDescription = (format: MediaFormat) => {
    setEditingDescription(format.id);
    setNewDescription(format.description || '');
  };

  const handleSaveDescription = async (formatId: string) => {
    try {
      await updateFormat(formatId, { description: newDescription });
      setEditingDescription(null);
      setNewDescription('');
      toast.success('Description updated successfully');
    } catch (error) {
      console.error('Error updating description:', error);
      toast.error('Failed to update description');
    }
  };

  const handleCancelEditDescription = () => {
    setEditingDescription(null);
    setNewDescription('');
  };

  const handleEditDimensions = (format: MediaFormat) => {
    setEditingDimensions(format.id);
    setNewDimensions(format.dimensions || '');
  };

  const handleSaveDimensions = async (formatId: string) => {
    try {
      await updateFormat(formatId, { dimensions: newDimensions });
      setEditingDimensions(null);
      setNewDimensions('');
      toast.success('Dimensions updated successfully');
    } catch (error) {
      console.error('Error updating dimensions:', error);
      toast.error('Failed to update dimensions');
    }
  };

  const handleCancelEditDimensions = () => {
    setEditingDimensions(null);
    setNewDimensions('');
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      // Location categories
      'Transport': 'bg-accent/20 text-accent-foreground border-accent/40',
      'Retail': 'bg-primary/20 text-primary-foreground border-primary/40',
      'Rail': 'bg-secondary/20 text-secondary-foreground border-secondary/40',
      'Supermarket': 'bg-muted/30 text-muted-foreground border-muted/50',
      'Roadside': 'bg-london-red/20 text-foreground border-london-red/40',
      'London Underground': 'bg-london-blue/20 text-foreground border-london-blue/40',
      // Format categories
      'Digital': 'bg-accent/10 text-accent-foreground border-accent/30',
      'Paper & Paste': 'bg-primary/10 text-primary-foreground border-primary/30',
      'Backlight': 'bg-secondary/10 text-secondary-foreground border-secondary/30',
      'Illuminated': 'bg-muted/20 text-muted-foreground border-muted/40',
      'Premium': 'bg-london-red/10 text-foreground border-london-red/30',
      'HD': 'bg-london-blue/10 text-foreground border-london-blue/30',
      'Vynl': 'bg-steel-blue/20 text-foreground border-steel-blue/40',
      'WRB': 'bg-muted/40 text-muted-foreground border-muted/60'
    };
    return colors[category as keyof typeof colors] || 'bg-muted/30 text-muted-foreground border-muted/50';
  };

  if (loading) {
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
            Click on format names, descriptions, or dimensions to edit them. Use the pencil icon to manage categories. This is the source of truth for all format data across the site.
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
                         {editingDescription === format.id ? (
                           <div className="space-y-2">
                             <Input
                               value={newDescription}
                               onChange={(e) => setNewDescription(e.target.value)}
                               placeholder="Enter description"
                               onKeyDown={(e) => {
                                 if (e.key === 'Enter') {
                                   handleSaveDescription(format.id);
                                 } else if (e.key === 'Escape') {
                                   handleCancelEditDescription();
                                 }
                               }}
                               autoFocus
                             />
                             <div className="flex gap-1">
                               <Button
                                 size="sm"
                                 onClick={() => handleSaveDescription(format.id)}
                               >
                                 Save
                               </Button>
                               <Button
                                 size="sm"
                                 variant="outline"
                                 onClick={handleCancelEditDescription}
                               >
                                 Cancel
                               </Button>
                             </div>
                           </div>
                         ) : (
                           <div 
                             className="cursor-pointer hover:bg-muted/50 p-1 rounded max-w-xs"
                             onClick={() => handleEditDescription(format)}
                           >
                             {format.description || 'No description'}
                           </div>
                         )}
                       </TableCell>
                       <TableCell>
                         {editingDimensions === format.id ? (
                           <div className="space-y-2">
                             <Input
                               value={newDimensions}
                               onChange={(e) => setNewDimensions(e.target.value)}
                               placeholder="Enter dimensions"
                               onKeyDown={(e) => {
                                 if (e.key === 'Enter') {
                                   handleSaveDimensions(format.id);
                                 } else if (e.key === 'Escape') {
                                   handleCancelEditDimensions();
                                 }
                               }}
                               autoFocus
                             />
                             <div className="flex gap-1">
                               <Button
                                 size="sm"
                                 onClick={() => handleSaveDimensions(format.id)}
                               >
                                 Save
                               </Button>
                               <Button
                                 size="sm"
                                 variant="outline"
                                 onClick={handleCancelEditDimensions}
                               >
                                 Cancel
                               </Button>
                             </div>
                           </div>
                         ) : (
                           <div 
                             className="cursor-pointer hover:bg-muted/50 p-1 rounded"
                             onClick={() => handleEditDimensions(format)}
                           >
                             {format.dimensions || 'Not specified'}
                           </div>
                         )}
                       </TableCell>
                       <TableCell>
                         <div className="space-y-2">
                           <div className="flex flex-wrap gap-1">
                             <span className="text-xs font-medium text-muted-foreground">Location:</span>
                              {format.categories?.location && format.categories.location.length > 0 ? (
                                format.categories.location.map((category) => (
                                 <Badge
                                   key={category}
                                   variant="secondary"
                                   className={`text-xs ${getCategoryColor(category)}`}
                                 >
                                   {category}
                                 </Badge>
                               ))
                             ) : (
                               <span className="text-xs text-muted-foreground">None</span>
                             )}
                           </div>
                           <div className="flex flex-wrap gap-1">
                             <span className="text-xs font-medium text-muted-foreground">Format:</span>
                              {format.categories?.format && format.categories.format.length > 0 ? (
                                format.categories.format.map((category) => (
                                 <Badge
                                   key={category}
                                   variant="secondary"
                                   className={`text-xs ${getCategoryColor(category)}`}
                                 >
                                   {category}
                                 </Badge>
                               ))
                             ) : (
                               <span className="text-xs text-muted-foreground">None</span>
                             )}
                           </div>
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
              <Label>Location Categories</Label>
              <div className="grid grid-cols-1 gap-2 mt-2">
                {LOCATION_CATEGORIES.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                     <Checkbox
                       id={`location-${category}`}
                       checked={selectedLocationCategories.includes(category)}
                       onCheckedChange={(checked) => {
                         if (checked) {
                           setSelectedLocationCategories([...selectedLocationCategories, category]);
                         } else {
                           setSelectedLocationCategories(selectedLocationCategories.filter(c => c !== category));
                         }
                       }}
                     />
                     <Label htmlFor={`location-${category}`} className="text-sm">
                       {category}
                     </Label>
                   </div>
                 ))}
               </div>
             </div>
            
            <div>
              <Label>Format Categories</Label>
              <div className="grid grid-cols-1 gap-2 mt-2">
                {FORMAT_CATEGORIES.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                     <Checkbox
                       id={`format-${category}`}
                       checked={selectedFormatCategories.includes(category)}
                       onCheckedChange={(checked) => {
                         if (checked) {
                           setSelectedFormatCategories([...selectedFormatCategories, category]);
                         } else {
                           setSelectedFormatCategories(selectedFormatCategories.filter(c => c !== category));
                         }
                       }}
                     />
                     <Label htmlFor={`format-${category}`} className="text-sm">
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
                   setSelectedLocationCategories([]);
                   setSelectedFormatCategories([]);
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