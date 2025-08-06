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
  production_cost: number;
  sale_price: number | null;
  reduced_price: number | null;
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

export function RateCardManager() {
  const [mediaFormats, setMediaFormats] = useState<MediaFormat[]>([]);
  const [rateCards, setRateCards] = useState<RateCard[]>([]);
  const [discountTiers, setDiscountTiers] = useState<DiscountTier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingRate, setEditingRate] = useState<RateCard | null>(null);
  const [editingDiscount, setEditingDiscount] = useState<DiscountTier | null>(null);
  const [isRateDialogOpen, setIsRateDialogOpen] = useState(false);
  const [isDiscountDialogOpen, setIsDiscountDialogOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [formatsRes, ratesRes, discountsRes] = await Promise.all([
        supabase.from('media_formats').select('*').order('format_name'),
        supabase.from('rate_cards').select('*, media_formats(format_name)').order('location_area'),
        supabase.from('discount_tiers').select('*, media_formats(format_name)').order('min_incharges')
      ]);

      if (formatsRes.error) throw formatsRes.error;
      if (ratesRes.error) throw ratesRes.error;
      if (discountsRes.error) throw discountsRes.error;

      setMediaFormats(formatsRes.data);
      setRateCards(ratesRes.data);
      setDiscountTiers(discountsRes.data);
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
        production_cost: parseFloat(formData.get('production_cost') as string) || 0,
        sale_price: formData.get('sale_price') ? parseFloat(formData.get('sale_price') as string) : null,
        reduced_price: formData.get('reduced_price') ? parseFloat(formData.get('reduced_price') as string) : null,
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
                          <Input
                            name="location_area"
                            defaultValue={editingRate?.location_area}
                            placeholder="e.g., Central London"
                            required
                          />
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
                          <Label htmlFor="production_cost">Production Cost (£)</Label>
                          <Input
                            name="production_cost"
                            type="number"
                            step="0.01"
                            defaultValue={editingRate?.production_cost}
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
                    <TableHead>Production</TableHead>
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
                      <TableCell>£{rate.production_cost}</TableCell>
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
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}