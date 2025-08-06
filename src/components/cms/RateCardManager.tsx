import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { londonAreas } from '@/data/londonAreas';

interface MediaFormat {
  id: string;
  format_name: string;
  format_slug: string;
  description: string | null;
  dimensions: string | null;
  is_active: boolean;
}

interface RateCard {
  id: string;
  media_format_id: string;
  location_area: string;
  base_rate_per_incharge: number;
  sale_price: number | null;
  reduced_price: number | null;
  location_markup_percentage: number;
  is_active: boolean;
  media_formats?: {
    format_name: string;
  };
}

interface DiscountTier {
  id: string;
  media_format_id: string;
  min_incharges: number;
  max_incharges: number | null;
  discount_percentage: number;
  is_active: boolean;
  media_formats?: {
    format_name: string;
  };
}

interface ProductionCostTier {
  id: string;
  media_format_id: string;
  min_quantity: number;
  max_quantity: number | null;
  cost_per_unit: number;
  is_active: boolean;
  media_formats?: {
    format_name: string;
  };
}

export function RateCardManager() {
  const [mediaFormats, setMediaFormats] = useState<MediaFormat[]>([]);
  const [rateCards, setRateCards] = useState<RateCard[]>([]);
  const [discountTiers, setDiscountTiers] = useState<DiscountTier[]>([]);
  const [productionTiers, setProductionTiers] = useState<ProductionCostTier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingRate, setEditingRate] = useState<RateCard | null>(null);
  const [editingDiscount, setEditingDiscount] = useState<DiscountTier | null>(null);
  const [editingProduction, setEditingProduction] = useState<ProductionCostTier | null>(null);
  const [isRateDialogOpen, setIsRateDialogOpen] = useState(false);
  const [isDiscountDialogOpen, setIsDiscountDialogOpen] = useState(false);
  const [isProductionDialogOpen, setIsProductionDialogOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [formatsRes, ratesRes, discountsRes, productionRes] = await Promise.all([
        supabase.from('media_formats').select('*').order('format_name'),
        supabase.from('rate_cards').select('*, media_formats(format_name)').order('location_area'),
        supabase.from('discount_tiers').select('*, media_formats(format_name)').order('min_incharges'),
        supabase.from('production_cost_tiers').select('*, media_formats(format_name)').order('min_quantity')
      ]);

      if (formatsRes.error) throw formatsRes.error;
      if (ratesRes.error) throw ratesRes.error;
      if (discountsRes.error) throw discountsRes.error;
      if (productionRes.error) throw productionRes.error;

      setMediaFormats(formatsRes.data);
      setRateCards(ratesRes.data);
      setDiscountTiers(discountsRes.data);
      setProductionTiers(productionRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load rate card data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveRateCard = async (formData: FormData) => {
    try {
      const rateData = {
        media_format_id: formData.get('media_format_id') as string,
        location_area: formData.get('location_area') as string,
        base_rate_per_incharge: parseFloat(formData.get('base_rate_per_incharge') as string),
        sale_price: formData.get('sale_price') ? parseFloat(formData.get('sale_price') as string) : null,
        reduced_price: formData.get('reduced_price') ? parseFloat(formData.get('reduced_price') as string) : null,
        location_markup_percentage: parseFloat(formData.get('location_markup_percentage') as string) || 0,
        is_active: formData.get('is_active') === 'true'
      };

      if (editingRate) {
        const { error } = await supabase
          .from('rate_cards')
          .update(rateData)
          .eq('id', editingRate.id);
        if (error) throw error;
        toast.success('Rate card updated successfully');
      } else {
        const { error } = await supabase
          .from('rate_cards')
          .insert(rateData);
        if (error) throw error;
        toast.success('Rate card created successfully');
      }

      setIsRateDialogOpen(false);
      setEditingRate(null);
      fetchData();
    } catch (error) {
      console.error('Error saving rate card:', error);
      toast.error('Failed to save rate card');
    }
  };

  const handleSaveDiscountTier = async (formData: FormData) => {
    try {
      const discountData = {
        media_format_id: formData.get('media_format_id') as string,
        min_incharges: parseInt(formData.get('min_incharges') as string),
        max_incharges: formData.get('max_incharges') ? parseInt(formData.get('max_incharges') as string) : null,
        discount_percentage: parseFloat(formData.get('discount_percentage') as string),
        is_active: formData.get('is_active') === 'true'
      };

      if (editingDiscount) {
        const { error } = await supabase
          .from('discount_tiers')
          .update(discountData)
          .eq('id', editingDiscount.id);
        if (error) throw error;
        toast.success('Discount tier updated successfully');
      } else {
        const { error } = await supabase
          .from('discount_tiers')
          .insert(discountData);
        if (error) throw error;
        toast.success('Discount tier created successfully');
      }

      setIsDiscountDialogOpen(false);
      setEditingDiscount(null);
      fetchData();
    } catch (error) {
      console.error('Error saving discount tier:', error);
      toast.error('Failed to save discount tier');
    }
  };

  const handleSaveProductionTier = async (formData: FormData) => {
    try {
      const productionData = {
        media_format_id: formData.get('media_format_id') as string,
        min_quantity: parseInt(formData.get('min_quantity') as string),
        max_quantity: formData.get('max_quantity') ? parseInt(formData.get('max_quantity') as string) : null,
        cost_per_unit: parseFloat(formData.get('cost_per_unit') as string),
        is_active: formData.get('is_active') === 'true'
      };

      if (editingProduction) {
        const { error } = await supabase
          .from('production_cost_tiers')
          .update(productionData)
          .eq('id', editingProduction.id);
        if (error) throw error;
        toast.success('Production cost tier updated successfully');
      } else {
        const { error } = await supabase
          .from('production_cost_tiers')
          .insert(productionData);
        if (error) throw error;
        toast.success('Production cost tier created successfully');
      }

      setIsProductionDialogOpen(false);
      setEditingProduction(null);
      fetchData();
    } catch (error) {
      console.error('Error saving production cost tier:', error);
      toast.error('Failed to save production cost tier');
    }
  };

  const handleDeleteRateCard = async (id: string) => {
    if (!confirm('Are you sure you want to delete this rate card?')) return;
    
    try {
      const { error } = await supabase
        .from('rate_cards')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast.success('Rate card deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting rate card:', error);
      toast.error('Failed to delete rate card');
    }
  };

  const handleDeleteDiscountTier = async (id: string) => {
    if (!confirm('Are you sure you want to delete this discount tier?')) return;
    
    try {
      const { error } = await supabase
        .from('discount_tiers')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast.success('Discount tier deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting discount tier:', error);
      toast.error('Failed to delete discount tier');
    }
  };

  const handleDeleteProductionTier = async (id: string) => {
    if (!confirm('Are you sure you want to delete this production cost tier?')) return;
    
    try {
      const { error } = await supabase
        .from('production_cost_tiers')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast.success('Production cost tier deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting production cost tier:', error);
      toast.error('Failed to delete production cost tier');
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading rate cards...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Rate Card Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="rates" className="w-full">
            <TabsList>
              <TabsTrigger value="rates">Rate Cards</TabsTrigger>
              <TabsTrigger value="discounts">Discount Tiers</TabsTrigger>
              <TabsTrigger value="production">Production Costs</TabsTrigger>
            </TabsList>

            <TabsContent value="rates" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">OOH Media Rate Cards</h3>
                <Dialog open={isRateDialogOpen} onOpenChange={setIsRateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setEditingRate(null)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Rate Card
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>
                        {editingRate ? 'Edit Rate Card' : 'Add New Rate Card'}
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      handleSaveRateCard(new FormData(e.currentTarget));
                    }} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="media_format_id">Media Format</Label>
                          <Select name="media_format_id" defaultValue={editingRate?.media_format_id} required>
                            <SelectTrigger>
                              <SelectValue placeholder="Select format" />
                            </SelectTrigger>
                            <SelectContent>
                              {mediaFormats.map((format) => (
                                <SelectItem key={format.id} value={format.id}>
                                  {format.format_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="location_area">Location Area</Label>
                          <Select name="location_area" defaultValue={editingRate?.location_area} required>
                            <SelectTrigger>
                              <SelectValue placeholder="Select location area" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="GD">GD (General Distribution)</SelectItem>
                              {londonAreas.flatMap(area => 
                                area.areas.map(borough => (
                                  <SelectItem key={borough} value={borough}>{borough}</SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="base_rate_per_incharge">Base Rate per Incharge (£)</Label>
                          <Input
                            name="base_rate_per_incharge"
                            type="number"
                            step="0.01"
                            defaultValue={editingRate?.base_rate_per_incharge}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="location_markup_percentage">Location Markup (%)</Label>
                          <Input
                            name="location_markup_percentage"
                            type="number"
                            step="0.01"
                            defaultValue={editingRate?.location_markup_percentage || 0}
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <Label htmlFor="sale_price">Sale Price (£)</Label>
                          <Input
                            name="sale_price"
                            type="number"
                            step="0.01"
                            defaultValue={editingRate?.sale_price || ''}
                            placeholder="Optional special sale price"
                          />
                        </div>
                        <div>
                          <Label htmlFor="reduced_price">Reduced Price (£)</Label>
                          <Input
                            name="reduced_price"
                            type="number"
                            step="0.01"
                            defaultValue={editingRate?.reduced_price || ''}
                            placeholder="Optional reduced price"
                          />
                        </div>
                        <div>
                          <Label htmlFor="is_active">Status</Label>
                          <Select name="is_active" defaultValue={editingRate?.is_active ? 'true' : 'false'}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="true">Active</SelectItem>
                              <SelectItem value="false">Inactive</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setIsRateDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit">
                          {editingRate ? 'Update' : 'Create'} Rate Card
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Format</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Base Rate</TableHead>
                    <TableHead>Location Markup</TableHead>
                    <TableHead>Sale Price</TableHead>
                    <TableHead>Reduced Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rateCards.map((rate) => (
                    <TableRow key={rate.id}>
                      <TableCell>{rate.media_formats?.format_name}</TableCell>
                      <TableCell>{rate.location_area}</TableCell>
                      <TableCell>£{rate.base_rate_per_incharge}</TableCell>
                      <TableCell>{rate.location_markup_percentage}%</TableCell>
                      <TableCell>{rate.sale_price ? `£${rate.sale_price}` : '-'}</TableCell>
                      <TableCell>{rate.reduced_price ? `£${rate.reduced_price}` : '-'}</TableCell>
                      <TableCell>
                        <Badge variant={rate.is_active ? 'default' : 'secondary'}>
                          {rate.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingRate(rate);
                              setIsRateDialogOpen(true);
                            }}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteRateCard(rate.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="discounts" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Discount Tiers by Incharge Quantity</h3>
                <Dialog open={isDiscountDialogOpen} onOpenChange={setIsDiscountDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setEditingDiscount(null)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Discount Tier
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingDiscount ? 'Edit Discount Tier' : 'Add New Discount Tier'}
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      handleSaveDiscountTier(new FormData(e.currentTarget));
                    }} className="space-y-4">
                      <div>
                        <Label htmlFor="media_format_id">Media Format</Label>
                        <Select name="media_format_id" defaultValue={editingDiscount?.media_format_id} required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select format" />
                          </SelectTrigger>
                          <SelectContent>
                            {mediaFormats.map((format) => (
                              <SelectItem key={format.id} value={format.id}>
                                {format.format_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="min_incharges">Min Incharges</Label>
                          <Input
                            name="min_incharges"
                            type="number"
                            defaultValue={editingDiscount?.min_incharges}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="max_incharges">Max Incharges</Label>
                          <Input
                            name="max_incharges"
                            type="number"
                            defaultValue={editingDiscount?.max_incharges || ''}
                            placeholder="Leave empty for unlimited"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="discount_percentage">Discount Percentage (%)</Label>
                        <Input
                          name="discount_percentage"
                          type="number"
                          step="0.01"
                          defaultValue={editingDiscount?.discount_percentage}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="is_active">Status</Label>
                        <Select name="is_active" defaultValue={editingDiscount?.is_active ? 'true' : 'false'}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">Active</SelectItem>
                            <SelectItem value="false">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setIsDiscountDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit">
                          {editingDiscount ? 'Update' : 'Create'} Discount Tier
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Format</TableHead>
                    <TableHead>Min Incharges</TableHead>
                    <TableHead>Max Incharges</TableHead>
                    <TableHead>Discount %</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {discountTiers.map((discount) => (
                    <TableRow key={discount.id}>
                      <TableCell>{discount.media_formats?.format_name}</TableCell>
                      <TableCell>{discount.min_incharges}</TableCell>
                      <TableCell>{discount.max_incharges || 'Unlimited'}</TableCell>
                      <TableCell>{discount.discount_percentage}%</TableCell>
                      <TableCell>
                        <Badge variant={discount.is_active ? 'default' : 'secondary'}>
                          {discount.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingDiscount(discount);
                              setIsDiscountDialogOpen(true);
                            }}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteDiscountTier(discount.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="production" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Production Cost Tiers by Quantity</h3>
                <Dialog open={isProductionDialogOpen} onOpenChange={setIsProductionDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setEditingProduction(null)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Production Cost Tier
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingProduction ? 'Edit Production Cost Tier' : 'Add New Production Cost Tier'}
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      handleSaveProductionTier(new FormData(e.currentTarget));
                    }} className="space-y-4">
                      <div>
                        <Label htmlFor="media_format_id">Media Format</Label>
                        <Select name="media_format_id" defaultValue={editingProduction?.media_format_id} required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select format" />
                          </SelectTrigger>
                          <SelectContent>
                            {mediaFormats.map((format) => (
                              <SelectItem key={format.id} value={format.id}>
                                {format.format_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="min_quantity">Min Quantity</Label>
                          <Input
                            name="min_quantity"
                            type="number"
                            defaultValue={editingProduction?.min_quantity}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="max_quantity">Max Quantity</Label>
                          <Input
                            name="max_quantity"
                            type="number"
                            defaultValue={editingProduction?.max_quantity || ''}
                            placeholder="Leave empty for unlimited"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="cost_per_unit">Cost per Unit (£)</Label>
                        <Input
                          name="cost_per_unit"
                          type="number"
                          step="0.01"
                          defaultValue={editingProduction?.cost_per_unit}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="is_active">Status</Label>
                        <Select name="is_active" defaultValue={editingProduction?.is_active ? 'true' : 'false'}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">Active</SelectItem>
                            <SelectItem value="false">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setIsProductionDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit">
                          {editingProduction ? 'Update' : 'Create'} Production Cost Tier
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Format</TableHead>
                    <TableHead>Min Quantity</TableHead>
                    <TableHead>Max Quantity</TableHead>
                    <TableHead>Cost per Unit</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productionTiers.map((production) => (
                    <TableRow key={production.id}>
                      <TableCell>{production.media_formats?.format_name}</TableCell>
                      <TableCell>{production.min_quantity}</TableCell>
                      <TableCell>{production.max_quantity || 'Unlimited'}</TableCell>
                      <TableCell>£{production.cost_per_unit}</TableCell>
                      <TableCell>
                        <Badge variant={production.is_active ? 'default' : 'secondary'}>
                          {production.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingProduction(production);
                              setIsProductionDialogOpen(true);
                            }}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteProductionTier(production.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}