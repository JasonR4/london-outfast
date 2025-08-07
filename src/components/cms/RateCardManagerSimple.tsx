import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface RateCard {
  id: string;
  media_format_id: string;
  location_area: string;
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

export function RateCardBulkManager() {
  const [rateCards, setRateCards] = useState<RateCard[]>([]);
  const [rateCardPeriods, setRateCardPeriods] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRateCardIds, setSelectedRateCardIds] = useState<string[]>([]);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);

  useEffect(() => {
    fetchRateCards();
  }, []);

  const fetchRateCards = async () => {
    try {
      const [ratesRes, rateCardPeriodsRes] = await Promise.all([
        supabase.from('rate_cards').select('*, media_formats(format_name)').order('location_area'),
        supabase.from('rate_card_periods').select('*, incharge_periods(*)')
      ]);

      if (ratesRes.error) throw ratesRes.error;
      if (rateCardPeriodsRes.error) throw rateCardPeriodsRes.error;

      setRateCards(ratesRes.data || []);
      setRateCardPeriods(rateCardPeriodsRes.data || []);
    } catch (error) {
      console.error('Error fetching rate cards:', error);
      toast.error('Failed to load rate cards');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedRateCardIds([]);
      setIsAllSelected(false);
    } else {
      setSelectedRateCardIds(rateCards.map(rate => rate.id));
      setIsAllSelected(true);
    }
  };

  const handleSelectRateCard = (rateCardId: string) => {
    const newSelected = selectedRateCardIds.includes(rateCardId)
      ? selectedRateCardIds.filter(id => id !== rateCardId)
      : [...selectedRateCardIds, rateCardId];
    
    setSelectedRateCardIds(newSelected);
    setIsAllSelected(newSelected.length === rateCards.length);
  };

  const handleBulkDelete = async () => {
    if (selectedRateCardIds.length === 0) return;
    
    const confirmed = confirm(`Are you sure you want to delete ${selectedRateCardIds.length} rate card${selectedRateCardIds.length > 1 ? 's' : ''}?`);
    if (!confirmed) return;

    setIsDeletingBulk(true);
    try {
      const { error } = await supabase
        .from('rate_cards')
        .delete()
        .in('id', selectedRateCardIds);
      
      if (error) throw error;
      
      toast.success(`Successfully deleted ${selectedRateCardIds.length} rate card${selectedRateCardIds.length > 1 ? 's' : ''}`);
      setSelectedRateCardIds([]);
      setIsAllSelected(false);
      fetchRateCards();
    } catch (error) {
      console.error('Error deleting rate cards:', error);
      toast.error('Failed to delete rate cards');
    } finally {
      setIsDeletingBulk(false);
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
      fetchRateCards();
    } catch (error) {
      console.error('Error deleting rate card:', error);
      toast.error('Failed to delete rate card');
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading rate cards...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Rate Cards with Bulk Operations</CardTitle>
          {selectedRateCardIds.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {selectedRateCardIds.length} selected
              </span>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                disabled={isDeletingBulk}
                className="flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {isDeletingBulk ? 'Deleting...' : `Delete ${selectedRateCardIds.length}`}
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all rate cards"
                />
              </TableHead>
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
                <TableCell>
                  <Checkbox
                    checked={selectedRateCardIds.includes(rate.id)}
                    onCheckedChange={() => handleSelectRateCard(rate.id)}
                    aria-label={`Select rate card for ${rate.media_formats?.format_name}`}
                  />
                </TableCell>
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
                        // Edit functionality would go here
                        toast.info('Edit functionality available in main rate card manager');
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

        {rateCards.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No rate cards found
          </div>
        )}
      </CardContent>
    </Card>
  );
}