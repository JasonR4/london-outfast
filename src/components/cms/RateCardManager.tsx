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
import { Pencil, Plus, Trash2, CalendarIcon, Download, Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { londonAreas } from '@/data/londonAreas';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import * as XLSX from 'xlsx';

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

interface QuantityDiscountTier {
  id: string;
  media_format_id: string;
  location_area?: string | null;
  min_quantity: number;
  max_quantity: number | null;
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
  const [quantityDiscountTiers, setQuantityDiscountTiers] = useState<QuantityDiscountTier[]>([]);
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
  const [editingQuantityDiscount, setEditingQuantityDiscount] = useState<QuantityDiscountTier | null>(null);
  const [editingProduction, setEditingProduction] = useState<ProductionCostTier | null>(null);
  const [editingCreative, setEditingCreative] = useState<CreativeDesignCostTier | null>(null);
  const [isRateDialogOpen, setIsRateDialogOpen] = useState(false);
  const [isDiscountDialogOpen, setIsDiscountDialogOpen] = useState(false);
  const [isQuantityDiscountDialogOpen, setIsQuantityDiscountDialogOpen] = useState(false);
  const [isProductionDialogOpen, setIsProductionDialogOpen] = useState(false);
  const [isCreativeDialogOpen, setIsCreativeDialogOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isBulkUploading, setIsBulkUploading] = useState(false);
  const [bulkUploadType, setBulkUploadType] = useState<'rates' | 'discounts' | 'quantity-discounts' | 'production' | 'creative'>('rates');
  const [selectedMediaFormat, setSelectedMediaFormat] = useState<MediaFormat | null>(null);
  const [editingPeriod, setEditingPeriod] = useState<any | null>(null);
  const [isPeriodDialogOpen, setIsPeriodDialogOpen] = useState(false);
  const [selectedMediaFormats, setSelectedMediaFormats] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [bulkPeriodData, setBulkPeriodData] = useState({
    period_number: '',
    start_date: undefined as Date | undefined,
    end_date: undefined as Date | undefined,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      console.log('Starting data fetch...');
      
      // First, try to fetch just media formats to isolate the issue
      const formatsRes = await supabase.from('media_formats').select('*').order('format_name');
      console.log('Media formats query result:', formatsRes);
      
      if (formatsRes.error) {
        console.error('Media formats query error:', formatsRes.error);
        throw formatsRes.error;
      }
      
      if (!formatsRes.data || formatsRes.data.length === 0) {
        console.error('No media formats found in database');
        toast.error('No media formats found in database');
        return;
      }
      
      console.log('Successfully fetched', formatsRes.data.length, 'media formats');
      setMediaFormats(formatsRes.data);
      
      // Now fetch the rest of the data
      const [ratesRes, discountsRes, quantityDiscountsRes, productionRes, creativeRes, periodsRes, rateCardPeriodsRes] = await Promise.all([
        supabase.from('rate_cards').select('*, media_formats(format_name)').order('location_area'),
        supabase.from('discount_tiers').select('*, media_formats(format_name)').order('min_periods'),
        supabase.from('quantity_discount_tiers').select('*, media_formats(format_name)').order('min_quantity'),
        supabase.from('production_cost_tiers').select('*, media_formats(format_name)').order('min_quantity'),
        supabase.from('creative_design_cost_tiers').select('*, media_formats(format_name)').order('min_quantity'),
        supabase.from('incharge_periods').select('*').order('period_number'),
        supabase.from('rate_card_periods').select('*, incharge_periods(*)')
      ]);

      if (ratesRes.error) throw ratesRes.error;
      if (discountsRes.error) throw discountsRes.error;
      if (quantityDiscountsRes.error) throw quantityDiscountsRes.error;
      if (productionRes.error) throw productionRes.error;
      if (creativeRes.error) throw creativeRes.error;
      if (periodsRes.error) throw periodsRes.error;
      if (rateCardPeriodsRes.error) throw rateCardPeriodsRes.error;

      setRateCards(ratesRes.data || []);
      setDiscountTiers(discountsRes.data || []);
      setQuantityDiscountTiers((quantityDiscountsRes.data as any) || []);
      setProductionTiers(productionRes.data || []);
      setCreativeTiers((creativeRes.data as any) || []);
      setInchargePeriods(periodsRes.data || []);
      setRateCardPeriods(rateCardPeriodsRes.data || []);
      
      console.log('All data loaded successfully');
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load rate card data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveRateCard = async (formData: FormData) => {
    try {
      const isDateSpecificValue = formData.get('is_date_specific') === 'true';
      
      const rateData = {
        media_format_id: formData.get('media_format_id') as string,
        location_area: formData.get('location_area') as string,
        base_rate_per_incharge: parseFloat(formData.get('base_rate_per_incharge') as string),
        sale_price: formData.get('sale_price') ? parseFloat(formData.get('sale_price') as string) : null,
        reduced_price: formData.get('reduced_price') ? parseFloat(formData.get('reduced_price') as string) : null,
        location_markup_percentage: parseFloat(formData.get('location_markup_percentage') as string) || 0,
        quantity_per_medium: parseInt(formData.get('quantity_per_medium') as string) || 1,
        is_active: formData.get('is_active') === 'true',
        is_date_specific: isDateSpecificValue,
        start_date: !isDateSpecificValue && customStartDate ? customStartDate.toISOString().split('T')[0] : null,
        end_date: !isDateSpecificValue && customEndDate ? customEndDate.toISOString().split('T')[0] : null
      };

      let rateCardId: string;

      if (editingRate) {
        const { error } = await supabase
          .from('rate_cards')
          .update(rateData)
          .eq('id', editingRate.id);
        if (error) throw error;
        rateCardId = editingRate.id;
        
        // Delete existing rate card periods for this rate card
        await supabase
          .from('rate_card_periods')
          .delete()
          .eq('rate_card_id', rateCardId);
      } else {
        const { data, error } = await supabase
          .from('rate_cards')
          .insert(rateData)
          .select()
          .single();
        if (error) throw error;
        rateCardId = data.id;
      }

      // Save selected incharge periods if date-specific
      if (isDateSpecificValue && selectedPeriods.length > 0) {
        const periodInserts = selectedPeriods.map(periodId => ({
          rate_card_id: rateCardId,
          incharge_period_id: periodId
        }));

        const { error: periodsError } = await supabase
          .from('rate_card_periods')
          .insert(periodInserts);
        
        if (periodsError) throw periodsError;
      }

      toast.success(editingRate ? 'Rate card updated successfully' : 'Rate card created successfully');
      setIsRateDialogOpen(false);
      setEditingRate(null);
      setSelectedPeriods([]);
      setIsDateSpecific(false);
      setCustomStartDate(undefined);
      setCustomEndDate(undefined);
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

  const handleSaveQuantityDiscountTier = async (formData: FormData) => {
    try {
      const quantityDiscountData = {
        media_format_id: formData.get('media_format_id') as string,
        location_area: formData.get('location_area') === 'global' ? null : formData.get('location_area') as string,
        min_quantity: parseInt(formData.get('min_quantity') as string),
        max_quantity: formData.get('max_quantity') ? parseInt(formData.get('max_quantity') as string) : null,
        discount_percentage: parseFloat(formData.get('discount_percentage') as string),
        is_active: formData.get('is_active') === 'true'
      };

      if (editingQuantityDiscount) {
        const { error } = await supabase
          .from('quantity_discount_tiers')
          .update(quantityDiscountData)
          .eq('id', editingQuantityDiscount.id);
        if (error) throw error;
        toast.success('Quantity discount tier updated successfully');
      } else {
        const { error } = await supabase
          .from('quantity_discount_tiers')
          .insert(quantityDiscountData);
        if (error) throw error;
        toast.success('Quantity discount tier created successfully');
      }

      setIsQuantityDiscountDialogOpen(false);
      setEditingQuantityDiscount(null);
      fetchData();
    } catch (error) {
      console.error('Error saving quantity discount tier:', error);
      toast.error('Failed to save quantity discount tier');
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

  const handleDeleteQuantityDiscountTier = async (id: string) => {
    if (!confirm('Are you sure you want to delete this quantity discount tier?')) return;
    
    try {
      const { error } = await supabase
        .from('quantity_discount_tiers')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast.success('Quantity discount tier deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting quantity discount tier:', error);
      toast.error('Failed to delete quantity discount tier');
    }
  };

  // Bulk upload functionality
  const downloadTemplate = (type: 'rates' | 'discounts' | 'quantity-discounts' | 'production' | 'creative' = 'rates') => {
    console.log('Download function called with type:', type);
    console.log('Media formats loaded:', mediaFormats.length);
    console.log('Media formats:', mediaFormats.slice(0, 3)); // Log first 3 for debugging
    
    // Check if media formats are loaded
    if (!mediaFormats || mediaFormats.length === 0) {
      console.error('No media formats available for download');
      toast.error('Media formats not loaded yet. Please wait and try again.');
      return;
    }

    let templateData: any[] = [];
    let filename = '';

    switch (type) {
      case 'rates':
        templateData = mediaFormats.map(format => ({
          'Media Format ID': format.id,
          'Media Format Name': format.format_name,
          'Location Area': '', // Leave blank - configure in CMS
          'Base Rate Per Incharge': '0.00',
          'Sale Price': '0.00',
          'Reduced Price': '0.00',
          'Location Markup Percentage': '0.00',
          'Quantity Per Medium': '1',
          'Is Active': 'TRUE',
          'Is Date Specific': 'FALSE',
          'Start Date': '',
          'End Date': '',
          'Incharge Period': '1'
        }));
        filename = 'rate-cards-template.xlsx';
        break;
        
      case 'discounts':
        templateData = mediaFormats.map(format => ({
          'Media Format ID': format.id,
          'Media Format Name': format.format_name,
          'Min Periods': '1',
          'Max Periods': '',
          'Discount Percentage': '10.00',
          'Is Active': 'TRUE'
        }));
        filename = 'discount-tiers-template.xlsx';
        break;
        
      case 'quantity-discounts':
        templateData = mediaFormats.map(format => ({
          'Media Format ID': format.id,
          'Media Format Name': format.format_name,
          'Location Area': '', // Leave blank - configure in CMS
          'Min Quantity': '1',
          'Max Quantity': '',
          'Discount Percentage': '5.00',
          'Is Active': 'TRUE'
        }));
        filename = 'quantity-discount-tiers-template.xlsx';
        break;
        
      case 'production':
        templateData = mediaFormats.map(format => ({
          'Media Format ID': format.id,
          'Media Format Name': format.format_name,
          'Location Area': '', // Leave blank - configure in CMS
          'Category': '', // Leave blank - configure in CMS
          'Min Quantity': '1',
          'Max Quantity': '',
          'Cost Per Unit': '50.00',
          'Is Active': 'TRUE'
        }));
        filename = 'production-costs-template.xlsx';
        break;
        
      case 'creative':
        templateData = mediaFormats.map(format => ({
          'Media Format ID': format.id,
          'Media Format Name': format.format_name,
          'Location Area': '', // Leave blank - configure in CMS
          'Category': '', // Leave blank - configure in CMS
          'Min Quantity': '1',
          'Max Quantity': '',
          'Cost Per Unit': '85.00',
          'Is Active': 'TRUE'
        }));
        filename = 'creative-design-template.xlsx';
        break;
    }
    
    // Check if we have template data
    if (!templateData || templateData.length === 0) {
      console.error('Template data generation failed');
      toast.error('No template data generated. Please try again.');
      return;
    }

    console.log('Template data created:', templateData.length, 'rows');
    console.log('First template row:', templateData[0]);

    try {
      const worksheet = XLSX.utils.json_to_sheet(templateData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, `${type.charAt(0).toUpperCase() + type.slice(1)} Template`);
      
      // Set column widths - safely check if templateData[0] exists
      if (templateData[0]) {
        const colWidths = Array(Object.keys(templateData[0]).length).fill({ wch: 20 });
        worksheet['!cols'] = colWidths;
      }

      console.log('About to download file:', filename);
      XLSX.writeFile(workbook, filename);
      console.log('File download triggered successfully');
      toast.success('Template downloaded successfully');
    } catch (error) {
      console.error('Error during file generation/download:', error);
      toast.error('Failed to generate template file');
    }
  };

  // Comprehensive download with all pricing data in one file, organized by London areas
  const downloadComprehensiveTemplate = () => {
    console.log('Comprehensive download function called');
    console.log('Media formats loaded:', mediaFormats.length);
    
    // Check if media formats are loaded
    if (!mediaFormats || mediaFormats.length === 0) {
      console.error('No media formats available for download');
      toast.error('Media formats not loaded yet. Please wait and try again.');
      return;
    }

    try {
      const workbook = XLSX.utils.book_new();
      
      // Sheet 1: Rate Cards (location area left blank for manual entry)
      const rateCardsData = mediaFormats.map(format => ({
        'Media Format ID': format.id,
        'Media Format Name': format.format_name,
        'Location Area': '', // Leave blank - configure manually
        'Base Rate Per Incharge': '0.00',
        'Sale Price': '0.00',
        'Reduced Price': '0.00',
        'Location Markup Percentage': '0.00',
        'Quantity Per Medium': '1',
        'Is Active': 'TRUE',
        'Is Date Specific': 'FALSE',
        'Start Date': '',
        'End Date': '',
        'Incharge Period': '1'
      }));
      const rateCardsWS = XLSX.utils.json_to_sheet(rateCardsData);
      rateCardsWS['!cols'] = Array(Object.keys(rateCardsData[0]).length).fill({ wch: 20 });
      XLSX.utils.book_append_sheet(workbook, rateCardsWS, 'Rate Cards');

      // Sheet 2: Volume Discounts
      const discountsData = mediaFormats.map(format => ({
        'Media Format ID': format.id,
        'Media Format Name': format.format_name,
        'Min Periods': '1',
        'Max Periods': '',
        'Discount Percentage': '10.00',
        'Is Active': 'TRUE'
      }));
      const discountsWS = XLSX.utils.json_to_sheet(discountsData);
      discountsWS['!cols'] = Array(Object.keys(discountsData[0]).length).fill({ wch: 20 });
      XLSX.utils.book_append_sheet(workbook, discountsWS, 'Volume Discounts');

      // Sheet 3: Quantity Discounts
      const quantityDiscountsData = mediaFormats.map(format => ({
        'Media Format ID': format.id,
        'Media Format Name': format.format_name,
        'Location Area': '', // Leave blank - configure manually
        'Min Quantity': '1',
        'Max Quantity': '',
        'Discount Percentage': '5.00',
        'Is Active': 'TRUE'
      }));
      const quantityDiscountsWS = XLSX.utils.json_to_sheet(quantityDiscountsData);
      quantityDiscountsWS['!cols'] = Array(Object.keys(quantityDiscountsData[0]).length).fill({ wch: 20 });
      XLSX.utils.book_append_sheet(workbook, quantityDiscountsWS, 'Quantity Discounts');

      // Sheet 4: Production Costs
      const productionData = mediaFormats.map(format => ({
        'Media Format ID': format.id,
        'Media Format Name': format.format_name,
        'Location Area': '', // Leave blank - configure manually
        'Category': '', // Leave blank - configure manually
        'Min Quantity': '1',
        'Max Quantity': '',
        'Cost Per Unit': '50.00',
        'Is Active': 'TRUE'
      }));
      const productionWS = XLSX.utils.json_to_sheet(productionData);
      productionWS['!cols'] = Array(Object.keys(productionData[0]).length).fill({ wch: 20 });
      XLSX.utils.book_append_sheet(workbook, productionWS, 'Production Costs');

      // Sheet 5: Creative Design Costs
      const creativeData = mediaFormats.map(format => ({
        'Media Format ID': format.id,
        'Media Format Name': format.format_name,
        'Location Area': '', // Leave blank - configure manually
        'Category': '', // Leave blank - configure manually
        'Min Quantity': '1',
        'Max Quantity': '',
        'Cost Per Unit': '85.00',
        'Is Active': 'TRUE'
      }));
      const creativeWS = XLSX.utils.json_to_sheet(creativeData);
      creativeWS['!cols'] = Array(Object.keys(creativeData[0]).length).fill({ wch: 20 });
      XLSX.utils.book_append_sheet(workbook, creativeWS, 'Creative Design Costs');

      // Sheet 6: Media Formats Reference
      const formatsData = mediaFormats.map(format => ({
        'Format ID': format.id,
        'Format Name': format.format_name,
        'Format Slug': format.format_slug,
        'Description': format.description,
        'Dimensions': format.dimensions,
        'Is Active': format.is_active ? 'TRUE' : 'FALSE'
      }));
      const formatsWS = XLSX.utils.json_to_sheet(formatsData);
      formatsWS['!cols'] = Array(Object.keys(formatsData[0]).length).fill({ wch: 25 });
      XLSX.utils.book_append_sheet(workbook, formatsWS, 'Media Formats Reference');

      // Sheet 7: London Areas Reference
      const areasData = londonAreas.flatMap(zone => 
        zone.areas.map(area => ({
          'Area Name': area,
          'Zone': zone.zone,
          'Zone Color': zone.color
        }))
      );
      const areasWS = XLSX.utils.json_to_sheet(areasData);
      areasWS['!cols'] = Array(Object.keys(areasData[0]).length).fill({ wch: 25 });
      XLSX.utils.book_append_sheet(workbook, areasWS, 'London Areas Reference');

      // Download the comprehensive file
      const filename = `comprehensive-rate-cards-template-${new Date().toISOString().split('T')[0]}.xlsx`;
      console.log('About to download comprehensive file:', filename);
      XLSX.writeFile(workbook, filename);
      console.log('Comprehensive file download triggered successfully');
      toast.success('Comprehensive rate cards template downloaded successfully');
    } catch (error) {
      console.error('Error during comprehensive file generation/download:', error);
      toast.error('Failed to generate comprehensive template file');
    }
  };

  const analyzeUploadedFile = async () => {
    if (!uploadedFile) return;

    setIsAnalyzing(true);
    try {
      const data = await uploadedFile.arrayBuffer();
      const workbook = XLSX.read(data);
      
      console.log('Available sheets:', workbook.SheetNames);
      
      let allValidRows: any[] = [];
      let allInvalidRows: any[] = [];
      let totalRowsProcessed = 0;

      // Process each sheet
      for (const sheetName of workbook.SheetNames) {
        console.log(`Processing sheet: ${sheetName}`);
        
        // Skip only actual reference sheets that aren't for data upload
        if (['Media Formats Reference', 'London Areas Reference'].includes(sheetName)) {
          console.log(`Skipping reference sheet: ${sheetName}`);
          continue;
        }
        
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        if (jsonData.length === 0) {
          console.log(`Sheet ${sheetName} is empty, skipping`);
          continue;
        }

        console.log(`Sheet ${sheetName} has ${jsonData.length} rows`);

        // Validate data against existing formats and areas
        const formatNames = mediaFormats.map(f => f.format_name.toLowerCase());
        const validAreas = londonAreas.flatMap(zone => zone.areas).map(area => area.toLowerCase());
        
        const validRows: any[] = [];
        const invalidRows: any[] = [];

        // Determine upload type based on sheet name
        let currentUploadType = bulkUploadType;
        if (sheetName === 'Volume Discounts') currentUploadType = 'discounts';
        else if (sheetName === 'Quantity Discounts') currentUploadType = 'quantity-discounts';
        else if (sheetName === 'Production Costs') currentUploadType = 'production';
        else if (sheetName === 'Creative Design Costs') currentUploadType = 'creative';
        else if (sheetName === 'Rate Cards') currentUploadType = 'rates';

        jsonData.forEach((row: any, index) => {
          const errors: string[] = [];
          
          // Skip header/example row
          if (index === 0 && (
            row['Media Format']?.includes('Select from') ||
            (row['Min Periods']?.toString().includes('1') && currentUploadType === 'discounts') ||
            (row['Min Quantity']?.toString().includes('1') && (currentUploadType === 'quantity-discounts' || currentUploadType === 'production' || currentUploadType === 'creative'))
          )) return;

          // Skip completely empty rows
          const hasAnyData = Object.values(row).some(value => value && value.toString().trim() !== '');
          if (!hasAnyData) return;

          // Validate pre-populated format fields (read-only)
          if (!row['Media Format ID']) {
            errors.push('Media format ID is required (row data: ' + JSON.stringify(Object.keys(row)) + ')');
          }
          if (!row['Media Format Name']) {
            errors.push('Media format name is required');
          }

          // For rate card sheets, validate that there's actual rate data
          if (currentUploadType === 'rates') {
            // Validate location area for rates - allow empty for template
            if (row['Location Area'] && !validAreas.includes(row['Location Area'].toLowerCase()) && row['Location Area'].toLowerCase() !== 'gd') {
              errors.push('Invalid location area (use valid London area or "GD")');
            }
            // Validate numeric fields
            if (!row['Base Rate Per Incharge'] || isNaN(parseFloat(row['Base Rate Per Incharge']))) {
              errors.push('Invalid base rate');
            }
            
            // Skip rows with default/empty rate data
            if (row['Base Rate Per Incharge'] === '0.00' || row['Base Rate Per Incharge'] === 0) {
              return; // Skip template rows with no actual data
            }
          }

          // Type-specific validation for other types
          switch (currentUploadType) {
            case 'discounts':
              // Validate periods
              if (!row['Min Periods'] || isNaN(parseInt(row['Min Periods'])) || parseInt(row['Min Periods']) < 1) {
                errors.push('Invalid min periods');
              }
              if (row['Max Periods'] && (isNaN(parseInt(row['Max Periods'])) || parseInt(row['Max Periods']) < parseInt(row['Min Periods']))) {
                errors.push('Invalid max periods');
              }
              if (!row['Discount Percentage'] || isNaN(parseFloat(row['Discount Percentage']))) {
                errors.push('Invalid discount percentage');
              }
              break;
              
            case 'quantity-discounts':
              // Validate location area (can be empty, global or valid area)
              if (row['Location Area'] && row['Location Area'].toLowerCase() !== 'global' && 
                  row['Location Area'].toLowerCase() !== 'gd' && !validAreas.includes(row['Location Area'].toLowerCase())) {
                errors.push('Invalid location area (use "global", "GD", or valid London area)');
              }
              // Validate quantity ranges
              if (!row['Min Quantity'] || isNaN(parseInt(row['Min Quantity'])) || parseInt(row['Min Quantity']) < 1) {
                errors.push('Invalid min quantity');
              }
              if (row['Max Quantity'] && (isNaN(parseInt(row['Max Quantity'])) || parseInt(row['Max Quantity']) < parseInt(row['Min Quantity']))) {
                errors.push('Invalid max quantity');
              }
              if (!row['Discount Percentage'] || isNaN(parseFloat(row['Discount Percentage']))) {
                errors.push('Invalid discount percentage');
              }
              break;
              
            case 'production':
            case 'creative':
              // Validate location area (can be empty, global, or valid area)
              if (row['Location Area'] && row['Location Area'].toLowerCase() !== 'global' && 
                  row['Location Area'].toLowerCase() !== 'gd' && !validAreas.includes(row['Location Area'].toLowerCase())) {
                errors.push('Invalid location area (use "global", "GD", or valid London area)');
              }
              // Validate quantity ranges
              if (!row['Min Quantity'] || isNaN(parseInt(row['Min Quantity'])) || parseInt(row['Min Quantity']) < 1) {
                errors.push('Invalid min quantity');
              }
              if (row['Max Quantity'] && (isNaN(parseInt(row['Max Quantity'])) || parseInt(row['Max Quantity']) < parseInt(row['Min Quantity']))) {
                errors.push('Invalid max quantity');
              }
              if (!row['Cost Per Unit'] || isNaN(parseFloat(row['Cost Per Unit']))) {
                errors.push('Invalid cost per unit');
              }
              break;
          }

          // Validate boolean fields (common)
          if (row['Is Active'] && !['TRUE', 'FALSE', true, false].includes(row['Is Active'])) {
            errors.push('Invalid Is Active value (must be TRUE or FALSE)');
          }

          if (errors.length > 0) {
            console.log('Row', index + 1, 'in sheet', sheetName, 'errors:', errors, 'data:', row);
            invalidRows.push({ ...row, rowNumber: index + 1, sheetName, uploadType: currentUploadType, errors });
          } else {
            validRows.push({ ...row, rowNumber: index + 1, sheetName, uploadType: currentUploadType });
          }
        });

        allValidRows = allValidRows.concat(validRows);
        allInvalidRows = allInvalidRows.concat(invalidRows);
        totalRowsProcessed += jsonData.length;
        
        console.log(`Sheet ${sheetName} processed: ${validRows.length} valid, ${invalidRows.length} invalid`);
      }

      setAnalysisResults({
        validRows: allValidRows,
        invalidRows: allInvalidRows,
        totalRows: totalRowsProcessed,
        validCount: allValidRows.length,
        invalidCount: allInvalidRows.length
      });

      console.log(`Total analysis complete: ${allValidRows.length} valid rows, ${allInvalidRows.length} invalid rows from ${workbook.SheetNames.length} sheets`);
      toast.success(`Analysis complete: ${allValidRows.length} valid rows, ${allInvalidRows.length} invalid rows from ${workbook.SheetNames.length} sheets`);
    } catch (error) {
      console.error('Error analyzing file:', error);
      toast.error('Failed to analyze uploaded file');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const processBulkUpload = async () => {
    if (!analysisResults?.validRows.length) return;

    setIsBulkUploading(true);
    try {
      // Group rows by upload type
      const rowsByType = analysisResults.validRows.reduce((acc: any, row: any) => {
        const type = row.uploadType || 'rates';
        if (!acc[type]) acc[type] = [];
        acc[type].push(row);
        return acc;
      }, {});

      let totalInserted = 0;
      let errors: any[] = [];

      // Process each upload type separately
      for (const [uploadType, rows] of Object.entries(rowsByType)) {
        console.log(`Processing ${(rows as any[]).length} rows for type: ${uploadType}`);
        
        const dataToInsert = [];

        for (const row of rows as any[]) {
          const mediaFormatId = row['Media Format ID'];
          if (!mediaFormatId) continue;

          let dataEntry: any = {};

          switch (uploadType) {
            case 'rates':
              dataEntry = {
                media_format_id: mediaFormatId,
                location_area: row['Location Area'] || null,
                base_rate_per_incharge: row['Base Rate Per Incharge'] ? parseFloat(row['Base Rate Per Incharge']) : null,
                sale_price: row['Sale Price'] ? parseFloat(row['Sale Price']) : null,
                reduced_price: row['Reduced Price'] ? parseFloat(row['Reduced Price']) : null,
                location_markup_percentage: parseFloat(row['Location Markup Percentage']) || 0,
                quantity_per_medium: parseInt(row['Quantity Per Medium']) || 1,
                is_active: row['Is Active'] === 'TRUE' || row['Is Active'] === true,
                is_date_specific: row['Is Date Specific'] === 'TRUE' || row['Is Date Specific'] === true,
                start_date: row['Start Date'] && row['Start Date'] !== '' ? row['Start Date'] : null,
                end_date: row['End Date'] && row['End Date'] !== '' ? row['End Date'] : null,
                incharge_period: row['Incharge Period'] ? parseInt(row['Incharge Period']) : 1
              };
              break;
              
            case 'quantity-discounts':
              dataEntry = {
                media_format_id: mediaFormatId,
                location_area: row['Location Area'] && row['Location Area'].toLowerCase() === 'global' ? null : row['Location Area'],
                min_quantity: parseInt(row['Min Quantity']),
                max_quantity: row['Max Quantity'] ? parseInt(row['Max Quantity']) : null,
                discount_percentage: parseFloat(row['Discount Percentage']),
                is_active: row['Is Active'] === 'TRUE' || row['Is Active'] === true
              };
              break;
              
            case 'discounts':
              dataEntry = {
                media_format_id: mediaFormatId,
                min_periods: parseInt(row['Min Periods']),
                max_periods: row['Max Periods'] ? parseInt(row['Max Periods']) : null,
                discount_percentage: parseFloat(row['Discount Percentage']),
                is_active: row['Is Active'] === 'TRUE' || row['Is Active'] === true
              };
              break;
              
            case 'production':
              dataEntry = {
                media_format_id: mediaFormatId,
                location_area: row['Location Area'] && row['Location Area'].toLowerCase() === 'global' ? null : row['Location Area'],
                category: row['Category'] || null,
                min_quantity: parseInt(row['Min Quantity']),
                max_quantity: row['Max Quantity'] ? parseInt(row['Max Quantity']) : null,
                cost_per_unit: parseFloat(row['Cost Per Unit']),
                is_active: row['Is Active'] === 'TRUE' || row['Is Active'] === true
              };
              break;
              
            case 'creative':
              dataEntry = {
                media_format_id: mediaFormatId,
                location_area: row['Location Area'] && row['Location Area'].toLowerCase() === 'global' ? null : row['Location Area'],
                category: row['Category'] || null,
                min_quantity: parseInt(row['Min Quantity']),
                max_quantity: row['Max Quantity'] ? parseInt(row['Max Quantity']) : null,
                cost_per_unit: parseFloat(row['Cost Per Unit']),
                is_active: row['Is Active'] === 'TRUE' || row['Is Active'] === true
              };
              break;
          }

          dataToInsert.push(dataEntry);
        }

        // Insert data for this type in smaller batches
        const batchSize = 20;
        
        for (let i = 0; i < dataToInsert.length; i += batchSize) {
          const batch = dataToInsert.slice(i, i + batchSize);
          let error: any = null;
          
          switch (uploadType) {
            case 'rates':
              ({ error } = await supabase.from('rate_cards').insert(batch));
              break;
            case 'discounts':
              ({ error } = await supabase.from('discount_tiers').insert(batch));
              break;
            case 'quantity-discounts':
              ({ error } = await supabase.from('quantity_discount_tiers').insert(batch));
              break;
            case 'production':
              ({ error } = await supabase.from('production_cost_tiers').insert(batch));
              break;
            case 'creative':
              ({ error } = await supabase.from('creative_design_cost_tiers').insert(batch));
              break;
          }
          
          if (error) {
            console.error(`Error inserting batch for ${uploadType}:`, error);
            errors.push({ type: uploadType, batch: i / batchSize + 1, error });
          } else {
            totalInserted += batch.length;
            console.log(`Successfully inserted batch ${i / batchSize + 1} for ${uploadType}: ${batch.length} records`);
          }
        }
      }

      if (errors.length > 0) {
        console.error('Some batches failed:', errors);
        toast.error(`Partial upload completed. ${totalInserted} records inserted, but ${errors.length} batches failed.`);
      } else {
        toast.success(`Successfully uploaded ${totalInserted} records across all data types!`);
      }

      fetchData(); // Refresh all data
      setAnalysisResults(null);
      setUploadedFile(null);
    } catch (error) {
      console.error('Error processing bulk upload:', error);
      toast.error('Failed to process bulk upload');
    } finally {
      setIsBulkUploading(false);
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
              <TabsTrigger value="periods">In-Charge Periods</TabsTrigger>
              <TabsTrigger value="bulk-upload">Bulk Upload</TabsTrigger>
              <TabsTrigger value="discounts">Period Discounts</TabsTrigger>
              <TabsTrigger value="quantity-discounts">Quantity Discounts</TabsTrigger>
              <TabsTrigger value="production">Production Costs</TabsTrigger>
              <TabsTrigger value="creative">Creative Design</TabsTrigger>
            </TabsList>

            <TabsContent value="bulk-upload" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5" />
                    Bulk Upload Data
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Type Selection */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Select Data Type</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { value: 'rates', label: 'Rate Cards' },
                        { value: 'discounts', label: 'Period Discounts' },
                        { value: 'quantity-discounts', label: 'Quantity Discounts' },
                        { value: 'production', label: 'Production Costs' },
                        { value: 'creative', label: 'Creative Design' }
                      ].map((type) => (
                        <Button
                          key={type.value}
                          variant={bulkUploadType === type.value ? 'default' : 'outline'}
                          onClick={() => {
                            setBulkUploadType(type.value as any);
                            setUploadedFile(null);
                            setAnalysisResults(null);
                          }}
                          className="h-12"
                        >
                          {type.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Comprehensive Download Option */}
                  <div className="space-y-4 p-4 bg-primary/5 rounded-lg border-2 border-primary/20">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <FileSpreadsheet className="w-5 h-5 text-primary" />
                      Complete Rate Cards Package
                    </h3>
                    <p className="text-muted-foreground">
                      Download a comprehensive Excel file with all pricing data in one place: rate cards, volume discounts, quantity discounts, production costs, creative costs, plus reference sheets for all media formats and London areas.
                    </p>
                    <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                      <span className="px-2 py-1 bg-background rounded">Rate Cards</span>
                      <span className="px-2 py-1 bg-background rounded">Volume Discounts</span>
                      <span className="px-2 py-1 bg-background rounded">Quantity Discounts</span>
                      <span className="px-2 py-1 bg-background rounded">Production Costs</span>
                      <span className="px-2 py-1 bg-background rounded">Creative Costs</span>
                      <span className="px-2 py-1 bg-background rounded">Media Formats</span>
                      <span className="px-2 py-1 bg-background rounded">London Areas</span>
                    </div>
                    <Button onClick={downloadComprehensiveTemplate} className="flex items-center gap-2" size="lg">
                      <Download className="w-4 h-4" />
                      Download Complete Package
                    </Button>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">or download individual templates</span>
                    </div>
                  </div>

                  {/* Step 1: Download Individual Template */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Individual Template Download</h3>
                    <p className="text-muted-foreground">
                      Download a specific template for one data type only.
                    </p>
                    <Button onClick={() => downloadTemplate(bulkUploadType)} variant="outline" className="flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Download {bulkUploadType.charAt(0).toUpperCase() + bulkUploadType.slice(1).replace('-', ' ')} Template
                    </Button>
                  </div>

                  {/* Step 2: Upload File */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Step 2: Upload Completed File</h3>
                    <p className="text-muted-foreground">
                      Upload your completed Excel file for analysis and validation.
                    </p>
                    <div className="border-2 border-dashed border-border rounded-lg p-6">
                      <Input
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setUploadedFile(file);
                            setAnalysisResults(null);
                          }
                        }}
                        className="mb-4"
                      />
                      {uploadedFile && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <FileSpreadsheet className="w-4 h-4" />
                          {uploadedFile.name} ({(uploadedFile.size / 1024).toFixed(1)} KB)
                        </div>
                      )}
                    </div>
                    {uploadedFile && (
                      <Button 
                        onClick={analyzeUploadedFile} 
                        disabled={isAnalyzing}
                        className="flex items-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        {isAnalyzing ? 'Analyzing...' : `Analyze ${bulkUploadType.charAt(0).toUpperCase() + bulkUploadType.slice(1).replace('-', ' ')} File`}
                      </Button>
                    )}
                  </div>

                  {/* Step 3: Analysis Results */}
                  {analysisResults && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Step 3: Analysis Results</h3>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <Card>
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-blue-600">{analysisResults.totalRows}</div>
                            <div className="text-sm text-muted-foreground">Total Rows</div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-green-600">{analysisResults.validCount}</div>
                            <div className="text-sm text-muted-foreground">Valid Rows</div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-red-600">{analysisResults.invalidCount}</div>
                            <div className="text-sm text-muted-foreground">Invalid Rows</div>
                          </CardContent>
                        </Card>
                      </div>

                      {analysisResults.invalidRows.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-red-600">
                              <AlertCircle className="w-5 h-5" />
                              Invalid Rows ({analysisResults.invalidCount})
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="max-h-60 overflow-y-auto">
                              {analysisResults.invalidRows.map((row: any, index: number) => (
                                <div key={index} className="border-b pb-2 mb-2 last:border-b-0">
                                  <div className="font-medium">Row {row.rowNumber}</div>
                                  <div className="text-sm text-red-600">
                                    {row.errors.join(', ')}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {analysisResults.validCount > 0 && (
                        <div className="space-y-4">
                          <h4 className="font-semibold text-green-600">
                            Ready to Import {analysisResults.validCount} {bulkUploadType.charAt(0).toUpperCase() + bulkUploadType.slice(1)} Records
                          </h4>
                          <Button 
                            onClick={processBulkUpload}
                            disabled={isBulkUploading}
                            className="flex items-center gap-2"
                          >
                            <Upload className="w-4 h-4" />
                            {isBulkUploading ? 'Importing...' : `Import ${analysisResults.validCount} ${bulkUploadType.charAt(0).toUpperCase() + bulkUploadType.slice(1)} Records`}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="periods" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5" />
                    In-Charge Periods Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Bulk Period Creation */}
                  <div className="p-6 bg-primary/5 rounded-lg border-2 border-primary/20">
                    <h3 className="text-lg font-semibold mb-4">Bulk Period Setup</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <Label htmlFor="period_number">Period Number</Label>
                        <Input
                          type="number"
                          value={bulkPeriodData.period_number}
                          onChange={(e) => setBulkPeriodData(prev => ({ ...prev, period_number: e.target.value }))}
                          placeholder="e.g. 27"
                        />
                      </div>
                      <div>
                        <Label>Start Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !bulkPeriodData.start_date && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {bulkPeriodData.start_date ? format(bulkPeriodData.start_date, "PPP") : "Select date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={bulkPeriodData.start_date}
                              onSelect={(date) => setBulkPeriodData(prev => ({ ...prev, start_date: date }))}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div>
                        <Label>End Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !bulkPeriodData.end_date && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {bulkPeriodData.end_date ? format(bulkPeriodData.end_date, "PPP") : "Select date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={bulkPeriodData.end_date}
                              onSelect={(date) => setBulkPeriodData(prev => ({ ...prev, end_date: date }))}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    {/* Media Format Bulk Selection */}
                    <div className="mb-4">
                      <Label className="text-base font-semibold">Select Media Formats</Label>
                      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto border rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Checkbox
                            id="select-all-formats"
                            checked={selectedMediaFormats.length === mediaFormats.length}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedMediaFormats(mediaFormats.map(f => f.id));
                              } else {
                                setSelectedMediaFormats([]);
                              }
                            }}
                          />
                          <Label htmlFor="select-all-formats" className="font-medium">Select All</Label>
                        </div>
                        {mediaFormats.map((format) => (
                          <div key={format.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`format-${format.id}`}
                              checked={selectedMediaFormats.includes(format.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedMediaFormats(prev => [...prev, format.id]);
                                } else {
                                  setSelectedMediaFormats(prev => prev.filter(id => id !== format.id));
                                }
                              }}
                            />
                            <Label htmlFor={`format-${format.id}`} className="text-sm">
                              {format.format_name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Category Bulk Selection */}
                    <div className="mb-4">
                      <Label className="text-base font-semibold">Select Categories</Label>
                      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-32 overflow-y-auto border rounded-lg p-4">
                        {[
                          "Classic & Digital Roadside",
                          "London Underground (TfL)",
                          "National Rail & Commuter Rail",
                          "Bus Advertising",
                          "Taxi Advertising",
                          "Retail & Leisure Environments",
                          "Airports",
                          "Street Furniture",
                          "Programmatic DOOH (pDOOH)",
                          "Ambient / Guerrilla OOH"
                        ].map((category) => (
                          <div key={category} className="flex items-center space-x-2">
                            <Checkbox
                              id={`category-${category}`}
                              checked={selectedCategories.includes(category)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedCategories(prev => [...prev, category]);
                                } else {
                                  setSelectedCategories(prev => prev.filter(cat => cat !== category));
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

                    <Button 
                      onClick={() => {
                        // Handle bulk period creation
                        console.log('Bulk period creation:', {
                          period: bulkPeriodData,
                          mediaFormats: selectedMediaFormats,
                          categories: selectedCategories
                        });
                        toast.success('Bulk period creation functionality will be implemented');
                      }}
                      disabled={!bulkPeriodData.period_number || !bulkPeriodData.start_date || !bulkPeriodData.end_date}
                      className="w-full"
                    >
                      Create Period & Apply to Selected Items
                    </Button>
                  </div>

                  {/* Individual Period Management */}
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Existing In-Charge Periods</h3>
                    <Dialog open={isPeriodDialogOpen} onOpenChange={setIsPeriodDialogOpen}>
                      <DialogTrigger asChild>
                        <Button onClick={() => setEditingPeriod(null)}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Individual Period
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>
                            {editingPeriod ? 'Edit' : 'Create'} In-Charge Period
                          </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          const formData = new FormData(e.currentTarget);
                          console.log('Individual period form:', Object.fromEntries(formData));
                          toast.success('Individual period creation functionality will be implemented');
                          setIsPeriodDialogOpen(false);
                        }} className="space-y-4">
                          <div>
                            <Label htmlFor="period_number">Period Number</Label>
                            <Input
                              name="period_number"
                              type="number"
                              defaultValue={editingPeriod?.period_number}
                              required
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="start_date">Start Date</Label>
                              <Input
                                name="start_date"
                                type="date"
                                defaultValue={editingPeriod?.start_date}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="end_date">End Date</Label>
                              <Input
                                name="end_date"
                                type="date"
                                defaultValue={editingPeriod?.end_date}
                                required
                              />
                            </div>
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => setIsPeriodDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button type="submit">
                              {editingPeriod ? 'Update' : 'Create'} Period
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Period Number</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead>End Date</TableHead>
                        <TableHead>Duration (Days)</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inchargePeriods.map((period) => (
                        <TableRow key={period.id}>
                          <TableCell className="font-medium">Period {period.period_number}</TableCell>
                          <TableCell>{format(new Date(period.start_date), 'PPP')}</TableCell>
                          <TableCell>{format(new Date(period.end_date), 'PPP')}</TableCell>
                          <TableCell>
                            {Math.ceil((new Date(period.end_date).getTime() - new Date(period.start_date).getTime()) / (1000 * 60 * 60 * 24))} days
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingPeriod(period);
                                  setIsPeriodDialogOpen(true);
                                }}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  console.log('Delete period:', period.id);
                                  toast.success('Delete functionality will be implemented');
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
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
                           {rate.is_date_specific ? (
                             (() => {
                               const ratePeriods = rateCardPeriods
                                 .filter(rcp => rcp.rate_card_id === rate.id)
                                 .map(rcp => rcp.incharge_periods)
                                 .filter(Boolean);
                               
                               if (ratePeriods.length > 0) {
                                 return (
                                   <div className="text-xs">
                                     {ratePeriods.map((period, index) => (
                                       <div key={index}>
                                         Period {period.period_number}: {format(new Date(period.start_date), 'MMM dd')} - {format(new Date(period.end_date), 'MMM dd, yyyy')}
                                       </div>
                                     ))}
                                   </div>
                                 );
                               } else {
                                 return (
                                   <Badge variant="outline" className="text-xs">
                                     No periods selected
                                   </Badge>
                                 );
                               }
                             })()
                           ) : rate.start_date && rate.end_date ? (
                             <div className="text-xs">
                               <div>{format(new Date(rate.start_date), 'MMM dd, yyyy')}</div>
                               <div>to {format(new Date(rate.end_date), 'MMM dd, yyyy')}</div>
                             </div>
                           ) : (
                             <Badge variant="outline" className="text-xs">
                               Custom dates
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

            <TabsContent value="quantity-discounts" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Quantity Discount Tiers</h3>
                <Dialog open={isQuantityDiscountDialogOpen} onOpenChange={setIsQuantityDiscountDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setEditingQuantityDiscount(null)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Quantity Discount Tier
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingQuantityDiscount ? 'Edit Quantity Discount Tier' : 'Add New Quantity Discount Tier'}
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      handleSaveQuantityDiscountTier(new FormData(e.currentTarget));
                    }} className="space-y-4">
                      <div>
                        <Label htmlFor="media_format_id">Media Format</Label>
                        <Select name="media_format_id" defaultValue={editingQuantityDiscount?.media_format_id} required>
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
                        <Select name="location_area" defaultValue={editingQuantityDiscount?.location_area || 'global'}>
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
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="min_quantity">Min Quantity</Label>
                          <Input
                            name="min_quantity"
                            type="number"
                            min="1"
                            defaultValue={editingQuantityDiscount?.min_quantity}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="max_quantity">Max Quantity</Label>
                          <Input
                            name="max_quantity"
                            type="number"
                            defaultValue={editingQuantityDiscount?.max_quantity || ''}
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
                          min="0"
                          max="100"
                          defaultValue={editingQuantityDiscount?.discount_percentage}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="is_active">Status</Label>
                        <Select name="is_active" defaultValue={editingQuantityDiscount?.is_active ? 'true' : 'false'}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">Active</SelectItem>
                            <SelectItem value="false">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button type="submit" className="w-full">
                        {editingQuantityDiscount ? 'Update Quantity Discount Tier' : 'Create Quantity Discount Tier'}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Media Format</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Quantity Range</TableHead>
                    <TableHead>Discount %</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quantityDiscountTiers.map((tier) => (
                    <TableRow key={tier.id}>
                      <TableCell>
                        <Badge variant="outline">
                          {tier.media_formats?.format_name || 'Unknown Format'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {tier.location_area || 'Global'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">
                            Min: {tier.min_quantity} units
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Max: {tier.max_quantity ? `${tier.max_quantity} units` : 'Unlimited'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">
                          {tier.discount_percentage}%
                        </Badge>
                      </TableCell>
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
                              setEditingQuantityDiscount(tier);
                              setIsQuantityDiscountDialogOpen(true);
                            }}
                          >
                            <Pencil className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteQuantityDiscountTier(tier.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
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