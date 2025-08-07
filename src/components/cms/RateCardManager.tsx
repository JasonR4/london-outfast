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
  const [discountTiers, setDiscountTiers] = useState<any[]>([]);
  const [quantityDiscountTiers, setQuantityDiscountTiers] = useState<any[]>([]);
  const [productionTiers, setProductionTiers] = useState<any[]>([]);
  const [creativeTiers, setCreativeTiers] = useState<any[]>([]);
  const [inchargePeriods, setInchargePeriods] = useState<any[]>([]);
  const [rateCardPeriods, setRateCardPeriods] = useState<any[]>([]);
  const [selectedPeriods, setSelectedPeriods] = useState<string[]>([]);
  const [isDateSpecific, setIsDateSpecific] = useState(false);
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>();
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [editingRate, setEditingRate] = useState<RateCard | null>(null);
  const [editingDiscount, setEditingDiscount] = useState<any>(null);
  const [editingQuantityDiscount, setEditingQuantityDiscount] = useState<any>(null);
  const [editingProduction, setEditingProduction] = useState<any>(null);
  const [editingCreative, setEditingCreative] = useState<any>(null);
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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // First fetch media formats
      const formatsRes = await supabase
        .from('media_formats')
        .select('*')
        .order('format_name');

      if (formatsRes.error) {
        throw formatsRes.error;
      }
      
      setMediaFormats(formatsRes.data);
      
      // Then fetch other data
      const [ratesRes, discountsRes, quantityDiscountsRes, productionRes, creativeRes, periodsRes, rateCardPeriodsRes] = await Promise.all([
        supabase.from('rate_cards').select('*, media_formats(format_name)').order('location_area'),
        supabase.from('discount_tiers').select('*, media_formats(format_name)').order('min_periods'),
        supabase.from('quantity_discount_tiers').select('*').order('min_quantity'),
        supabase.from('production_cost_tiers').select('*, media_formats(format_name)').order('min_quantity'),
        supabase.from('creative_design_cost_tiers').select('*, media_formats(format_name)').order('min_quantity'),
        supabase.from('incharge_periods').select('*').order('period_number'),
        supabase.from('rate_card_periods').select('*, incharge_periods(*)')
      ]);

      if (ratesRes.error) throw ratesRes.error;
      if (discountsRes.error) throw discountsRes.error;
      if (quantityDiscountsRes.error) {
        console.warn('Failed to fetch quantity discount tiers:', quantityDiscountsRes.error);
      }
      if (productionRes.error) throw productionRes.error;
      if (creativeRes.error) throw creativeRes.error;
      if (periodsRes.error) throw periodsRes.error;
      if (rateCardPeriodsRes.error) throw rateCardPeriodsRes.error;

      setRateCards(ratesRes.data || []);
      setDiscountTiers(discountsRes.data || []);
      setQuantityDiscountTiers(quantityDiscountsRes.data || []);
      setProductionTiers(productionRes.data || []);
      setCreativeTiers(creativeRes.data || []);
      setInchargePeriods(periodsRes.data || []);
      setRateCardPeriods(rateCardPeriodsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load rate card data');
    } finally {
      setIsLoading(false);
    }
  };

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

  const downloadComprehensiveTemplate = () => {
    if (!mediaFormats || mediaFormats.length === 0) {
      toast.error('Media formats not loaded yet. Please wait and try again.');
      return;
    }

    try {
      const workbook = XLSX.utils.book_new();
      
      // Sheet 1: Rate Cards
      const rateCardsData = mediaFormats.map(format => ({
        'Media Format ID': format.id,
        'Media Format Name': format.format_name,
        'Location Area': '',
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

      const rateCardsSheet = XLSX.utils.json_to_sheet(rateCardsData);
      XLSX.utils.book_append_sheet(workbook, rateCardsSheet, 'Rate Cards');

      // Sheet 2: Volume Discounts
      const volumeDiscountsData = mediaFormats.map(format => ({
        'Media Format ID': format.id,
        'Media Format Name': format.format_name,
        'Min Periods': '1',
        'Max Periods': '',
        'Discount Percentage': '10.00',
        'Is Active': 'TRUE'
      }));

      const volumeDiscountsSheet = XLSX.utils.json_to_sheet(volumeDiscountsData);
      XLSX.utils.book_append_sheet(workbook, volumeDiscountsSheet, 'Volume Discounts');

      // Add other sheets...
      
      XLSX.writeFile(workbook, 'comprehensive-rate-cards-template.xlsx');
      toast.success('Comprehensive template downloaded successfully');
    } catch (error) {
      console.error('Error generating comprehensive template:', error);
      toast.error('Failed to generate comprehensive template');
    }
  };

  const analyzeUploadedFile = async () => {
    if (!uploadedFile) return;

    setIsAnalyzing(true);
    try {
      const data = await uploadedFile.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const validRows: any[] = [];
      const invalidRows: any[] = [];

      jsonData.forEach((row: any, index) => {
        const errors: string[] = [];
        
        // Skip empty rows
        const hasAnyData = Object.values(row).some(value => value && value.toString().trim() !== '');
        if (!hasAnyData) return;

        // Basic validation
        if (!row['Media Format ID']) {
          errors.push('Media format ID is required');
        }

        if (errors.length > 0) {
          invalidRows.push({ ...row, rowNumber: index + 1, errors });
        } else {
          validRows.push({ ...row, rowNumber: index + 1 });
        }
      });

      setAnalysisResults({
        validRows,
        invalidRows,
        totalRows: jsonData.length,
        validCount: validRows.length,
        invalidCount: invalidRows.length
      });

      toast.success(`Analysis complete: ${validRows.length} valid rows, ${invalidRows.length} invalid rows`);
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
      const dataToInsert = [];

      for (const row of analysisResults.validRows) {
        const mediaFormatId = row['Media Format ID'];
        if (!mediaFormatId) continue;

        let dataEntry: any = {};

        switch (bulkUploadType) {
          case 'rates':
            dataEntry = {
              media_format_id: mediaFormatId,
              location_area: row['Location Area'] || '',
              base_rate_per_incharge: parseFloat(row['Base Rate Per Incharge']) || 0,
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
        }

        dataToInsert.push(dataEntry);
      }

      // Insert data
      const { error } = await supabase.from('rate_cards').insert(dataToInsert);
      if (error) throw error;

      toast.success(`Successfully imported ${dataToInsert.length} rate cards`);
      setUploadedFile(null);
      setAnalysisResults(null);
      fetchData();
    } catch (error) {
      console.error('Error processing bulk upload:', error);
      toast.error('Failed to import data');
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
                      Download a comprehensive Excel file with all pricing data in one place. Note: For now, each sheet needs to be uploaded separately.
                    </p>
                    <Button onClick={downloadComprehensiveTemplate} className="flex items-center gap-2" size="lg">
                      <Download className="w-4 h-4" />
                      Download Complete Package
                    </Button>
                  </div>

                  {/* Step 2: Upload File */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Step 2: Upload Completed File</h3>
                    <p className="text-muted-foreground">
                      Upload your completed Excel file for analysis and validation. For comprehensive templates, upload each sheet separately by selecting the appropriate data type above.
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
                        {isAnalyzing ? 'Analyzing...' : 
                          uploadedFile?.name?.includes('comprehensive') ? 
                          'Analyze Comprehensive Template' : 
                          `Analyze ${bulkUploadType.charAt(0).toUpperCase() + bulkUploadType.slice(1).replace('-', ' ')} File`}
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

            <TabsContent value="rates">
              <div className="text-center p-8 text-muted-foreground">
                Rate Cards tab content...
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
