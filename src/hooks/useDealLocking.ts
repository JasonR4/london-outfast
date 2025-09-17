import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Deal, calcDeal } from '@/utils/dealCalculations';
import { track } from '@/utils/analytics';
import { useToast } from '@/hooks/use-toast';

export function useDealLocking() {
  const [isLocking, setIsLocking] = useState(false);
  const { toast } = useToast();

  const lockDeal = async (deal: Deal, userId?: string, onShowContactForm?: () => void) => {
    if (!userId) {
      // Save deal for after authentication
      sessionStorage.setItem('deal_draft', JSON.stringify(deal));
      window.location.href = `/auth?return=${encodeURIComponent(`/london-ooh-deals#${deal.slug}`)}`;
      return;
    }

    // Show the contact form instead of processing the deal immediately
    if (onShowContactForm) {
      onShowContactForm();
      return;
    }

    // Fallback for backwards compatibility
    setIsLocking(true);
    
    try {
      const calc = calcDeal(deal);
      
      // Create draft quote
      const { data: quote, error: quoteError } = await supabase
        .from('quotes')
        .insert({
          user_id: userId,
          status: 'draft',
          user_session_id: deal.slug, // Use deal slug as session identifier
          contact_name: '', // Will be filled in contact form
          contact_email: '', // Will be filled in contact form
          subtotal: calc.totals.mediaDeal,
          total_cost: calc.totals.grandTotal,
          total_inc_vat: calc.totals.grandTotal * 1.2, // Assuming 20% VAT
          vat_amount: calc.totals.grandTotal * 0.2,
          additional_requirements: `Deal: ${deal.title}. Periods: ${deal.periods.map(p => p.code).join(', ')}`
        })
        .select()
        .single();

      if (quoteError) throw quoteError;

      // Create quote items
      const itemsPayload = calc.lines.map(line => ({
        quote_id: quote.id,
        format_name: line.format_name,
        format_slug: line.format_slug,
        quantity: line.qty,
        selected_areas: [line.area],
        selected_periods: deal.periods.map((_, i) => i + 1), // Simple period numbering
        base_cost: line.perPanelRateCard,
        production_cost: line.productionTotal,
        total_cost: line.lineSubtotal,
        creative_needs: `${line.media_owner} - ${line.area}`
      }));

      const { error: itemsError } = await supabase
        .from('quote_items')
        .insert(itemsPayload);

      if (itemsError) throw itemsError;

      // Save for brief prefill
      localStorage.setItem('quote_session_id', quote.id);
      sessionStorage.setItem('brief_prefill', JSON.stringify({
        budget: calc.totals.grandTotal,
        message: `I want to lock "${deal.title}" for periods ${deal.periods.map(p => p.code).join(', ')}.\n\nLine items:\n${calc.lines.map(l => 
          `- ${l.format_name} (${l.media_owner}): ${l.qty} panels in ${l.area}`
        ).join('\n')}`,
        deal_slug: deal.slug
      }));

      // Analytics
      track('deal_locked', { 
        deal_slug: deal.slug, 
        value: calc.totals.grandTotal,
        discount_pct: deal.discount_pct,
        periods_count: deal.periods.length
      });

      // Redirect to brief
      window.location.href = `/brief?deal=${deal.slug}&budget=${calc.totals.grandTotal}`;

      toast({
        title: "Deal locked!",
        description: "Redirecting to complete your brief...",
      });

    } catch (error) {
      console.error('Error locking deal:', error);
      toast({
        title: "Error",
        description: "Failed to lock deal. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLocking(false);
    }
  };

  return { lockDeal, isLocking };
}