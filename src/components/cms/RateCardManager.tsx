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
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Pencil, Plus, Trash2, CalendarIcon } from 'lucide-react';
import { londonAreas } from '@/data/londonAreas';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

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
  category?: string;
  base_rate_per_incharge: number;
  sale_price: number | null;
  reduced_price: number | null;
  location_markup_percentage: number;
  quantity_per_medium: number;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  incharge_period: number;
  is_date_specific: boolean;
  media_formats?: {
    format_name: string;
  };
}

interface DiscountTier {
  id: string;
  media_format_id: string;
  min_periods: number;
  max_periods: number | null;
  discount_percentage: number;
  is_active: boolean;
  media_formats?: {
    format_name: string;
  };
}

interface ProductionCostTier {
  id: string;
  media_format_id: string;
  location_area?: string | null;
  category?: string;
  min_quantity: number;
  max_quantity: number | null;
  cost_per_unit: number;
  is_active: boolean;
  media_formats?: {
    format_name: string;
  };
}

interface CreativeDesignCostTier {
  id: string;
  media_format_id: string;
  location_area?: string | null;
  category?: string;
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
  const [creativeTiers, setCreativeTiers] = useState<CreativeDesignCostTier[]>([]);
  const [inchargePeriods, setInchargePeriods] = useState<any[]>([]);
  const [rateCardPeriods, setRateCardPeriods] = useState<any[]>([]);
  const [selectedPeriods, setSelectedPeriods] = useState<string[]>([]);
  const [isDateSpecific, setIsDateSpecific] = useState(false);
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>();
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [editingRate, setEditingRate] = useState<RateCard | null>(null);
  const [editingDiscount, setEditingDiscount] = useState<DiscountTier | null>(null);
  const [editingProduction, setEditingProduction] = useState<ProductionCostTier | null>(null);
  const [editingCreative, setEditingCreative] = useState<CreativeDesignCostTier | null>(null);
  const [isRateDialogOpen, setIsRateDialogOpen] = useState(false);
  const [isDiscountDialogOpen, setIsDiscountDialogOpen] = useState(false);
  const [isProductionDialogOpen, setIsProductionDialogOpen] = useState(false);
  const [isCreativeDialogOpen, setIsCreativeDialogOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [formatsRes, ratesRes, discountsRes, productionRes, creativeRes, periodsRes, rateCardPeriodsRes] = await Promise.all([
        supabase.from('media_formats').select('*').order('format_name'),
        supabase.from('rate_cards').select('*, media_formats(format_name)').order('location_area'),
        supabase.from('discount_tiers').select('*, media_formats(format_name)').order('min_periods'),
        supabase.from('production_cost_tiers').select('*, media_formats(format_name)').order('min_quantity'),
        supabase.from('creative_design_cost_tiers').select('*, media_formats(format_name)').order('min_quantity'),
        supabase.from('incharge_periods').select('*').order('period_number'),
        supabase.from('rate_card_periods').select('*, incharge_periods(*)')
      ]);

      if (formatsRes.error) throw formatsRes.error;
      if (ratesRes.error) throw ratesRes.error;
      if (discountsRes.error) throw discountsRes.error;
      if (productionRes.error) throw productionRes.error;
      if (creativeRes.error) throw creativeRes.error;
      if (periodsRes.error) throw periodsRes.error;
      if (rateCardPeriodsRes.error) throw rateCardPeriodsRes.error;

      setMediaFormats(formatsRes.data || []);
      setRateCards(ratesRes.data || []);
      setDiscountTiers(discountsRes.data || []);
      setProductionTiers(productionRes.data || []);
      setCreativeTiers((creativeRes.data as any) || []);
      setInchargePeriods(periodsRes.data || []);
      setRateCardPeriods(rateCardPeriodsRes.data || []);
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
        category: formData.get('category') as string,
        base_rate_per_incharge: parseFloat(formData.get('base_rate_per_incharge') as string),
        sale_price: formData.get('sale_price') ? parseFloat(formData.get('sale_price') as string) : null,
        reduced_price: formData.get('reduced_price') ? parseFloat(formData.get('reduced_price') as string) : null,
        location_markup_percentage: parseFloat(formData.get('location_markup_percentage') as string) || 0,
        quantity_per_medium: parseInt(formData.get('quantity_per_medium') as string) || 1,
        is_active: formData.get('is_active') === 'true',
        is_date_specific: formData.get('is_date_specific') === 'true',
        start_date: !isDateSpecific && customStartDate ? customStartDate.toISOString().split('T')[0] : null,
        end_date: !isDateSpecific && customEndDate ? customEndDate.toISOString().split('T')[0] : null
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
        min_periods: parseInt(formData.get('min_periods') as string),
        max_periods: formData.get('max_periods') ? parseInt(formData.get('max_periods') as string) : null,
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
        location_area: formData.get('location_area') === 'global' ? null : formData.get('location_area') as string,
        category: formData.get('category') as string,
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

  const handleSaveCreativeTier = async (formData: FormData) => {
    try {
      const creativeData = {
        media_format_id: formData.get('media_format_id') as string,
        location_area: formData.get('location_area') === 'global' ? null : formData.get('location_area') as string,
        category: formData.get('category') as string,
        min_quantity: parseInt(formData.get('min_quantity') as string),
        max_quantity: formData.get('max_quantity') ? parseInt(formData.get('max_quantity') as string) : null,
        cost_per_unit: parseFloat(formData.get('cost_per_unit') as string),
        is_active: formData.get('is_active') === 'true'
      };

      if (editingCreative) {
        const { error } = await supabase
          .from('creative_design_cost_tiers')
          .update(creativeData)
          .eq('id', editingCreative.id);
        if (error) throw error;
        toast.success('Creative design cost tier updated successfully');
      } else {
        const { error } = await supabase
          .from('creative_design_cost_tiers')
          .insert(creativeData);
        if (error) throw error;
        toast.success('Creative design cost tier created successfully');
      }

      setIsCreativeDialogOpen(false);
      setEditingCreative(null);
      fetchData();
    } catch (error) {
      console.error('Error saving creative design cost tier:', error);
      toast.error('Failed to save creative design cost tier');
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

  const handleDeleteCreativeTier = async (id: string) => {
    if (!confirm('Are you sure you want to delete this creative design cost tier?')) return;
    
    try {
      const { error } = await supabase
        .from('creative_design_cost_tiers')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast.success('Creative design cost tier deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting creative design cost tier:', error);
      toast.error('Failed to delete creative design cost tier');
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
              <TabsTrigger value="creative">Creative Design</TabsTrigger>
            </TabsList>

            <TabsContent value="rates" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">OOH Media Rate Cards</h3>
                <Dialog open={isRateDialogOpen} onOpenChange={setIsRateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => {
                      setEditingRate(null);
                      setSelectedPeriods([]);
                      setIsDateSpecific(false);
                      setCustomStartDate(undefined);
                      setCustomEndDate(undefined);
                    }}>
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
                       </div>
                       <div>
                         <Label htmlFor="category">OOH Category</Label>
                         <Select name="category" defaultValue={editingRate?.category} required>
                           <SelectTrigger>
                             <SelectValue placeholder="Select category" />
                           </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Classic & Digital Roadside">Classic & Digital Roadside</SelectItem>
                              <SelectItem value="London Underground (TfL)">London Underground (TfL)</SelectItem>
                              <SelectItem value="National Rail & Commuter Rail">National Rail & Commuter Rail</SelectItem>
                              <SelectItem value="Bus Advertising">Bus Advertising</SelectItem>
                              <SelectItem value="Taxi Advertising">Taxi Advertising</SelectItem>
                              <SelectItem value="Retail & Leisure Environments">Retail & Leisure Environments</SelectItem>
                              <SelectItem value="Airports">Airports</SelectItem>
                              <SelectItem value="Street Furniture">Street Furniture</SelectItem>
                              <SelectItem value="Programmatic DOOH (pDOOH)">Programmatic DOOH (pDOOH)</SelectItem>
                              <SelectItem value="Ambient / Guerrilla OOH">Ambient / Guerrilla OOH</SelectItem>
                              <SelectItem value="Sampling, Stunts & Flash Mob Advertising">Sampling, Stunts & Flash Mob Advertising</SelectItem>
                              <SelectItem value="Brand Experience & Pop-Up Activations">Brand Experience & Pop-Up Activations</SelectItem>
                              <SelectItem value="Mobile Advertising Solutions">Mobile Advertising Solutions</SelectItem>
                              <SelectItem value="Aerial Advertising">Aerial Advertising</SelectItem>
                              <SelectItem value="Cinema Advertising">Cinema Advertising</SelectItem>
                              <SelectItem value="Sports Ground & Stadium Advertising">Sports Ground & Stadium Advertising</SelectItem>
                              <SelectItem value="Radio">Radio</SelectItem>
                            </SelectContent>
                         </Select>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
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
                            <Label htmlFor="quantity_per_medium">Quantity per Medium</Label>
                            <Input
                              name="quantity_per_medium"
                              type="number"
                              min="1"
                              defaultValue={editingRate?.quantity_per_medium || 1}
                              required
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
                         
                         {/* Date-specific checkbox */}
                         <div className="col-span-2">
                           <div className="flex items-center space-x-2">
                              <Checkbox 
                                id="is_date_specific" 
                                name="is_date_specific"
                                checked={isDateSpecific}
                                onCheckedChange={(checked) => setIsDateSpecific(checked as boolean)}
                                defaultChecked={editingRate?.is_date_specific}
                                value="true"
                             />
                             <Label htmlFor="is_date_specific">
                               This is date-specific media (incharge-based)
                             </Label>
                           </div>
                           <p className="text-sm text-muted-foreground mt-1">
                             Check this for media that requires specific start/end dates (not for guerrilla or ambient)
                            </p>
                          </div>

                          {/* Conditional rendering based on date-specific checkbox */}
                          {isDateSpecific ? (
                            /* Incharge Periods Selection - when checked */
                            <div>
                              <Label>Available Incharge Periods</Label>
                              <div className="space-y-2 max-h-60 overflow-y-auto border rounded-md p-3">
                                {inchargePeriods.map(period => (
                                  <div key={period.id} className="flex items-center space-x-2">
                                    <input
                                      type="checkbox"
                                      id={`period-${period.id}`}
                                      checked={selectedPeriods.includes(period.id)}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setSelectedPeriods(prev => [...prev, period.id]);
                                        } else {
                                          setSelectedPeriods(prev => prev.filter(p => p !== period.id));
                                        }
                                      }}
                                      className="h-4 w-4"
                                    />
                                    <Label htmlFor={`period-${period.id}`} className="text-sm">
                                      Period {period.period_number}: {new Date(period.start_date).toLocaleDateString()} - {new Date(period.end_date).toLocaleDateString()}
                                    </Label>
                                  </div>
                                ))}
                              </div>
                              <p className="text-sm text-muted-foreground mt-2">
                                Select which periods are available for this rate card
                              </p>
                            </div>
                          ) : (
                            /* Custom Date Selection - when unchecked */
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="start_date">Custom Start Date</Label>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="outline"
                                      className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !customStartDate && "text-muted-foreground"
                                      )}
                                    >
                                      <CalendarIcon className="mr-2 h-4 w-4" />
                                      {customStartDate ? format(customStartDate, "PPP") : <span>Pick start date</span>}
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                      mode="single"
                                      selected={customStartDate}
                                      onSelect={setCustomStartDate}
                                      initialFocus
                                      className={cn("p-3 pointer-events-auto")}
                                    />
                                  </PopoverContent>
                                </Popover>
                              </div>
                              
                              <div>
                                <Label htmlFor="end_date">Custom End Date</Label>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="outline"
                                      className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !customEndDate && "text-muted-foreground"
                                      )}
                                    >
                                      <CalendarIcon className="mr-2 h-4 w-4" />
                                      {customEndDate ? format(customEndDate, "PPP") : <span>Pick end date</span>}
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                      mode="single"
                                      selected={customEndDate}
                                      onSelect={setCustomEndDate}
                                      disabled={(date) => customStartDate ? date < customStartDate : false}
                                      initialFocus
                                      className={cn("p-3 pointer-events-auto")}
                                    />
                                  </PopoverContent>
                                </Popover>
                              </div>
                            </div>
                          )}
                          
                          
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
                      <TableHead>Period</TableHead>
                      <TableHead>Dates</TableHead>
                      <TableHead>Base Rate</TableHead>
                      <TableHead>Quantity</TableHead>
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
                        <TableCell>
                          {rate.is_date_specific ? `Period ${rate.incharge_period}` : '-'}
                        </TableCell>
                        <TableCell>
                          {rate.is_date_specific && rate.start_date && rate.end_date ? (
                            <div className="text-xs">
                              <div>{format(new Date(rate.start_date), 'MMM dd, yyyy')}</div>
                              <div>to {format(new Date(rate.end_date), 'MMM dd, yyyy')}</div>
                            </div>
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              {rate.is_date_specific ? 'No dates set' : 'Non-date media'}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>£{rate.base_rate_per_incharge}</TableCell>
                        <TableCell>{rate.quantity_per_medium}</TableCell>
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
                              setIsDateSpecific(rate.is_date_specific || false);
                              
                              if (rate.is_date_specific) {
                                // Load existing periods for this rate card
                                const existingPeriods = rateCardPeriods
                                  .filter(rcp => rcp.rate_card_id === rate.id)
                                  .map(rcp => rcp.incharge_period_id);
                                setSelectedPeriods(existingPeriods);
                                setCustomStartDate(undefined);
                                setCustomEndDate(undefined);
                              } else {
                                // Load custom dates
                                setSelectedPeriods([]);
                                setCustomStartDate(rate.start_date ? new Date(rate.start_date) : undefined);
                                setCustomEndDate(rate.end_date ? new Date(rate.end_date) : undefined);
                              }
                              
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
                          <Label htmlFor="min_periods">Min Periods</Label>
                          <Input
                            name="min_periods"
                            type="number"
                            defaultValue={editingDiscount?.min_periods}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="max_periods">Max Periods</Label>
                          <Input
                            name="max_periods"
                            type="number"
                            defaultValue={editingDiscount?.max_periods || ''}
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
                      <TableCell>{discount.min_periods}</TableCell>
                      <TableCell>{discount.max_periods || 'Unlimited'}</TableCell>
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
                          <Label htmlFor="location_area">Location Area (Optional)</Label>
                          <Select name="location_area" defaultValue={editingProduction?.location_area || 'global'}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select location area (leave empty for global)" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="global">Global (All Areas)</SelectItem>
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
                          <Label htmlFor="category">Production Category</Label>
                          <Select name="category" defaultValue={editingProduction?.category} required>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Classic & Digital Roadside">Classic & Digital Roadside</SelectItem>
                              <SelectItem value="London Underground (TfL)">London Underground (TfL)</SelectItem>
                              <SelectItem value="National Rail & Commuter Rail">National Rail & Commuter Rail</SelectItem>
                              <SelectItem value="Bus Advertising">Bus Advertising</SelectItem>
                              <SelectItem value="Taxi Advertising">Taxi Advertising</SelectItem>
                              <SelectItem value="Retail & Leisure Environments">Retail & Leisure Environments</SelectItem>
                              <SelectItem value="Airports">Airports</SelectItem>
                              <SelectItem value="Street Furniture">Street Furniture</SelectItem>
                              <SelectItem value="Programmatic DOOH (pDOOH)">Programmatic DOOH (pDOOH)</SelectItem>
                              <SelectItem value="Ambient / Guerrilla OOH">Ambient / Guerrilla OOH</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
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
                    <TableHead>Location Area</TableHead>
                    <TableHead>Category</TableHead>
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
                      <TableCell>{production.location_area || 'Global'}</TableCell>
                      <TableCell>{production.category}</TableCell>
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

            <TabsContent value="creative" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Creative Design Cost Tiers</h3>
                <Dialog open={isCreativeDialogOpen} onOpenChange={setIsCreativeDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setEditingCreative(null)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Creative Design Cost
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>
                        {editingCreative ? 'Edit Creative Design Cost Tier' : 'Add New Creative Design Cost Tier'}
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      handleSaveCreativeTier(new FormData(e.currentTarget));
                    }} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="media_format_id">Media Format</Label>
                          <Select name="media_format_id" defaultValue={editingCreative?.media_format_id} required>
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
                          <Label htmlFor="location_area">Location Area (Optional)</Label>
                          <Select name="location_area" defaultValue={editingCreative?.location_area || 'global'}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select location area (leave empty for global)" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="global">Global (All Areas)</SelectItem>
                              <SelectItem value="GD">GD (General Distribution)</SelectItem>
                              {londonAreas.flatMap(area => 
                                area.areas.map(borough => (
                                  <SelectItem key={borough} value={borough}>{borough}</SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="category">OOH Category</Label>
                        <Select name="category" defaultValue={editingCreative?.category} required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Classic & Digital Roadside">Classic & Digital Roadside</SelectItem>
                            <SelectItem value="London Underground (TfL)">London Underground (TfL)</SelectItem>
                            <SelectItem value="National Rail & Commuter Rail">National Rail & Commuter Rail</SelectItem>
                            <SelectItem value="Bus Advertising">Bus Advertising</SelectItem>
                            <SelectItem value="Taxi Advertising">Taxi Advertising</SelectItem>
                            <SelectItem value="Retail & Leisure Environments">Retail & Leisure Environments</SelectItem>
                            <SelectItem value="Airports">Airports</SelectItem>
                            <SelectItem value="Street Furniture">Street Furniture</SelectItem>
                            <SelectItem value="Programmatic DOOH (pDOOH)">Programmatic DOOH (pDOOH)</SelectItem>
                            <SelectItem value="Ambient / Guerrilla OOH">Ambient / Guerrilla OOH</SelectItem>
                            <SelectItem value="Sampling, Stunts & Flash Mob Advertising">Sampling, Stunts & Flash Mob Advertising</SelectItem>
                            <SelectItem value="Brand Experience & Pop-Up Activations">Brand Experience & Pop-Up Activations</SelectItem>
                            <SelectItem value="Mobile Advertising Solutions">Mobile Advertising Solutions</SelectItem>
                            <SelectItem value="Aerial Advertising">Aerial Advertising</SelectItem>
                            <SelectItem value="Cinema Advertising">Cinema Advertising</SelectItem>
                            <SelectItem value="Sports Ground & Stadium Advertising">Sports Ground & Stadium Advertising</SelectItem>
                            <SelectItem value="Radio">Radio</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="min_quantity">Minimum Quantity</Label>
                          <Input
                            name="min_quantity"
                            type="number"
                            defaultValue={editingCreative?.min_quantity}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="max_quantity">Maximum Quantity</Label>
                          <Input
                            name="max_quantity"
                            type="number"
                            defaultValue={editingCreative?.max_quantity || ''}
                            placeholder="Leave empty for unlimited"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="cost_per_unit">Cost per Unit (£)</Label>
                          <Input
                            name="cost_per_unit"
                            type="number"
                            step="0.01"
                            defaultValue={editingCreative?.cost_per_unit}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="is_active">Status</Label>
                          <Select name="is_active" defaultValue={editingCreative?.is_active ? 'true' : 'false'}>
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
                        <Button type="button" variant="outline" onClick={() => setIsCreativeDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit">
                          {editingCreative ? 'Update' : 'Create'} Creative Design Cost
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Media Format</TableHead>
                    <TableHead>Location Area</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Min Quantity</TableHead>
                    <TableHead>Max Quantity</TableHead>
                    <TableHead>Cost per Unit</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {creativeTiers.map((tier) => (
                    <TableRow key={tier.id}>
                      <TableCell>{tier.media_formats?.format_name || 'N/A'}</TableCell>
                      <TableCell>{tier.location_area || 'Global'}</TableCell>
                      <TableCell>{tier.category}</TableCell>
                      <TableCell>{tier.min_quantity}</TableCell>
                      <TableCell>{tier.max_quantity || 'Unlimited'}</TableCell>
                      <TableCell>£{tier.cost_per_unit}</TableCell>
                      <TableCell>
                        <Badge variant={tier.is_active ? 'default' : 'secondary'}>
                          {tier.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingCreative(tier);
                              setIsCreativeDialogOpen(true);
                            }}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteCreativeTier(tier.id)}
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