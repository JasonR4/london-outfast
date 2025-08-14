import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { syncQuoteToHubSpot } from '@/utils/hubspotSync';
import { calculateVAT } from '@/utils/vat';

export interface QuoteItem {
  id?: string;
  quote_id?: string;
  format_name: string;
  format_slug: string;
  quantity: number;
  selected_periods: number[];
  selected_areas: string[];
  production_cost: number;
  creative_cost: number;
  base_cost: number;
  total_cost: number;
  discount_percentage?: number;
  discount_amount?: number;
  original_cost?: number;
  campaign_start_date?: string;
  campaign_end_date?: string;
  creative_needs?: string;
}

export interface Quote {
  id?: string;
  user_session_id: string;
  user_id?: string;
  total_cost: number;
  status: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  contact_company?: string;
  additional_requirements?: string;
  timeline?: string;
  created_at?: string;
  updated_at?: string;
  quote_items?: QuoteItem[];
}

// Generate a session ID for anonymous users
const getSessionId = () => {
  let sessionId = localStorage.getItem('quote_session_id');
  if (!sessionId) {
    sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('quote_session_id', sessionId);
  }
  return sessionId;
};

export const useQuotes = () => {
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sessionId = getSessionId();

  // Link session quotes to authenticated user
  const linkSessionQuotesToUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        console.log('🔗 Linking session quotes to user:', user.id);
        console.log('📝 Current session ID:', sessionId);
        
        // Also check for quotes from previous sessions that might have been created before login
        const storedSessionIds = [sessionId];
        
        // Check if there's a stored session ID from before authentication
        const preAuthSessionId = localStorage.getItem('quote_session_id_pre_auth');
        if (preAuthSessionId && preAuthSessionId !== sessionId) {
          storedSessionIds.push(preAuthSessionId);
        }
        
        for (const sid of storedSessionIds) {
          console.log('🔍 Checking session ID:', sid);
          
          // First check what quotes exist for this session
          const { data: existingQuotes } = await supabase
            .from('quotes')
            .select('id, total_cost, quote_items(id)')
            .eq('user_session_id', sid)
            .is('user_id', null);
            
          console.log('📊 Found quotes for session:', existingQuotes);
          
          // Update existing session-based quotes to include the user_id
          const { error } = await supabase
            .from('quotes')
            .update({ user_id: user.id })
            .eq('user_session_id', sid)
            .is('user_id', null);

          if (error) {
            console.error('Error linking session quotes to user:', error);
          } else {
            console.log('✅ Successfully linked quotes from session:', sid);
          }
        }
        
        // Clean up the pre-auth session ID
        localStorage.removeItem('quote_session_id_pre_auth');
      }
    } catch (err) {
      console.error('Error linking quotes:', err);
    }
  };

  // Fetch current quote for this session
  const fetchCurrentQuote = async (): Promise<Quote | null> => {
    try {
      setLoading(true);
      setError(null);

      // First, try to link any session quotes to the authenticated user
      await linkSessionQuotesToUser();
      
      const { data: { user } } = await supabase.auth.getUser();
      console.log('👤 Current user when fetching quote:', user?.email || 'anonymous');

      let query = supabase
        .from('quotes')
        .select(`
          *,
          quote_items (*)
        `)
        .eq('status', 'draft')
        .order('created_at', { ascending: false })
        .limit(1);

      // If user is authenticated, look for their quotes (including recently linked ones)
      if (user) {
        query = query.eq('user_id', user.id);
      } else {
        // If not authenticated, look for session-based quotes
        query = query.eq('user_session_id', sessionId);
      }

      const { data, error } = await query.maybeSingle();

      if (error) throw error;
      
      console.log('🔍 fetchCurrentQuote result:', {
        hasData: !!data,
        dataId: data?.id,
        itemsCount: data?.quote_items?.length,
        totalCost: data?.total_cost,
        isAuthenticated: !!user,
        sessionId: sessionId,
        userId: user?.id
      });
      
      setCurrentQuote(data);

      // If we have a quote with items, recalculate discounts
      if (data?.id && data.quote_items?.length > 0) {
        await updateQuoteTotalCost(data.id);
      }

      return data;
    } catch (err: any) {
      console.error('Error fetching current quote:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Create a new quote or get existing draft quote
  const createOrGetQuote = async (): Promise<string | null> => {
    try {
      // First check if there's already a draft quote
      if (currentQuote?.id) {
        return currentQuote.id;
      }

      console.log('🔍 No current quote found, creating new one...');
      
      const { data: { user } } = await supabase.auth.getUser();
      console.log('👤 Current user:', user?.email || 'anonymous');

      const quoteData: any = {
        user_session_id: sessionId,
        status: 'draft'
      };

      // If user is authenticated, include user_id
      if (user) {
        quoteData.user_id = user.id;
      }

      console.log('💾 Creating quote with data:', quoteData);

      const { data, error } = await supabase
        .from('quotes')
        .insert(quoteData)
        .select()
        .maybeSingle();

      if (error) {
        console.error('❌ Database error creating quote:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      if (!data) {
        throw new Error('No data returned from quote creation');
      }

      console.log('✅ Created new quote:', data);

      const newQuote = { ...data, quote_items: [] };
      setCurrentQuote(newQuote);
      return data.id;
    } catch (err: any) {
      console.error('💥 Error creating quote:', err);
      setError(err.message);
      
      // More specific error message
      const errorMessage = err.message.includes('Load failed')
        ? 'Network connection error - please check your internet and try again'
        : `Unable to create quote: ${err.message}`;
        
      toast.error(errorMessage);
      return null;
    }
  };

  // Add an item to the current quote
  const addQuoteItem = async (item: Omit<QuoteItem, 'id' | 'quote_id'>): Promise<boolean> => {
    try {
      console.log('🎯 addQuoteItem called with:', item);
      
      // First try to fetch/restore current quote
      await fetchCurrentQuote();
      
      const quoteId = await createOrGetQuote();
      if (!quoteId) {
        console.error('❌ Failed to get quote ID');
        throw new Error('Unable to create or access quote. Please try refreshing the page.');
      }
      
      console.log('✅ Got quote ID:', quoteId);

      // Calculate VAT for the item
      const vatCalc = calculateVAT(item.total_cost);
      
      const itemToInsert = {
        quote_id: quoteId,
        ...item,
        subtotal: vatCalc.subtotal,
        vat_rate: vatCalc.vatRate,
        vat_amount: vatCalc.vatAmount,
        total_inc_vat: vatCalc.totalIncVat
      };
      
      console.log('💾 Inserting quote item:', itemToInsert);
      
      const { data, error } = await supabase
        .from('quote_items')
        .insert(itemToInsert)
        .select()
        .maybeSingle();

      if (error) {
        console.error('❌ Error inserting quote item:', error);
        throw new Error(`Failed to save item: ${error.message}`);
      }
      
      console.log('✅ Quote item inserted successfully:', data);

      // Update current quote with new item
      setCurrentQuote(prev => {
        if (!prev) return null;
        const updatedQuote = {
          ...prev,
          quote_items: [...(prev.quote_items || []), data],
          total_cost: (prev.total_cost || 0) + item.total_cost
        };
        console.log('🔄 Updated current quote state:', updatedQuote);
        return updatedQuote;
      });

      // Update quote total cost
      await updateQuoteTotalCost(quoteId);
      
      toast.success('Added to your plan!');
      return true;
    } catch (err: any) {
      console.error('💥 Error adding quote item:', err);
      setError(err.message);
      
      // Provide more specific error messages
      const errorMessage = err.message.includes('Load failed') 
        ? 'Network error - please check your connection and try again'
        : err.message || 'Failed to add item to plan';
        
      toast.error(errorMessage);
      return false;
    }
  };

  // Update quote total cost and recalculate bulk discounts
  const updateQuoteTotalCost = async (quoteId: string) => {
    try {
      const { data: items, error } = await supabase
        .from('quote_items')
        .select('*')
        .eq('quote_id', quoteId);

      if (error) throw error;

      console.log('🔍 All quote items for discount calculation:', items);

      // Group items by format to calculate total periods per format
      const formatGroups: Record<string, QuoteItem[]> = {};
      items?.forEach(item => {
        if (!formatGroups[item.format_slug]) {
          formatGroups[item.format_slug] = [];
        }
        formatGroups[item.format_slug].push(item);
      });

      console.log('📊 Format groups:', formatGroups);

      // Recalculate discounts for each format group
      const updatedItems: QuoteItem[] = [];
      for (const [formatSlug, formatItems] of Object.entries(formatGroups)) {
        const totalPeriods = formatItems.reduce((sum, item) => sum + item.selected_periods.length, 0);
        
        console.log(`🎯 Format ${formatSlug}: ${formatItems.length} items, ${totalPeriods} total periods`);
        
        // Get discount tier for this format
        const { data: discountTiers, error: discountError } = await supabase
          .from('discount_tiers')
          .select('*')
          .eq('is_active', true)
          .order('discount_percentage', { ascending: false });

        if (discountError) {
          console.error('Error fetching discount tiers:', discountError);
          continue;
        }

        const applicableDiscount = discountTiers
          ?.filter(d => d.min_periods <= totalPeriods && (!d.max_periods || totalPeriods <= d.max_periods))
          ?.sort((a, b) => b.discount_percentage - a.discount_percentage)[0];

        console.log(`💰 Applicable discount for ${formatSlug}:`, applicableDiscount);

        // Update each item in this format group with the bulk discount
        for (const item of formatItems) {
          const baseItemCost = (item.original_cost && item.original_cost > 0) ? 
            item.original_cost - item.production_cost - item.creative_cost : 
            item.base_cost;
          
          let newBaseCost = baseItemCost;
          let discountPercentage = 0;
          let discountAmount = 0;
          const originalCost = baseItemCost + item.production_cost + item.creative_cost;

          if (applicableDiscount && applicableDiscount.discount_percentage > 0) {
            discountPercentage = applicableDiscount.discount_percentage;
            discountAmount = baseItemCost * (discountPercentage / 100);
            newBaseCost = baseItemCost - discountAmount;
          }

          const newTotalCost = newBaseCost + item.production_cost + item.creative_cost;

          console.log(`🔧 Updating item ${item.id}:`, {
            originalBaseCost: baseItemCost,
            discountPercentage,
            discountAmount,
            newBaseCost,
            newTotalCost
          });

          // Calculate VAT for the updated total cost
          const vatCalc = calculateVAT(newTotalCost);
          
          // Update the item in the database
          await supabase
            .from('quote_items')
            .update({
              base_cost: newBaseCost,
              total_cost: newTotalCost,
              discount_percentage: discountPercentage,
              discount_amount: discountAmount,
              original_cost: originalCost,
              subtotal: vatCalc.subtotal,
              vat_rate: vatCalc.vatRate,
              vat_amount: vatCalc.vatAmount,
              total_inc_vat: vatCalc.totalIncVat
            })
            .eq('id', item.id);

          updatedItems.push({
            ...item,
            base_cost: newBaseCost,
            total_cost: newTotalCost,
            discount_percentage: discountPercentage,
            discount_amount: discountAmount,
            original_cost: originalCost
          });
        }
      }

      const totalCost = updatedItems.reduce((sum, item) => sum + Number(item.total_cost), 0);
      
      // Calculate VAT for the total quote
      const quoteTotalVAT = calculateVAT(totalCost);

      await supabase
        .from('quotes')
        .update({ 
          total_cost: totalCost,
          subtotal: quoteTotalVAT.subtotal,
          vat_rate: quoteTotalVAT.vatRate,
          vat_amount: quoteTotalVAT.vatAmount,
          total_inc_vat: quoteTotalVAT.totalIncVat
        })
        .eq('id', quoteId);

      console.log('✅ Discount recalculation complete. Total cost:', totalCost);

      // Update the current quote state with recalculated items
      setCurrentQuote(prev => prev ? {
        ...prev,
        quote_items: updatedItems,
        total_cost: totalCost
      } : null);

    } catch (err: any) {
      console.error('Error updating quote total:', err);
    }
  };

  // Remove an item from the quote
  const removeQuoteItem = async (itemId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('quote_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      // Get the quote ID from current quote to recalculate discounts
      if (currentQuote?.id) {
        await updateQuoteTotalCost(currentQuote.id);
      }

      toast.success('Removed from plan');
      return true;
    } catch (err: any) {
      console.error('Error removing quote item:', err);
      setError(err.message);
      toast.error('Failed to remove item');
      return false;
    }
  };

  // Submit the quote with contact details
  const submitQuote = async (contactDetails: {
    contact_name: string;
    contact_email: string;
    contact_phone?: string;
    contact_company?: string;
    additional_requirements?: string;
    website?: string;
  }): Promise<boolean> => {
    try {
      if (!currentQuote?.id) {
        throw new Error('No quote to submit');
      }

      // Use the submit-quote edge function for ALL submissions to ensure HubSpot sync with deals
      const submitPayload = {
        quoteSessionId: currentQuote.user_session_id,
        contact: {
          firstName: contactDetails.contact_name?.split(' ')[0] || '',
          lastName: contactDetails.contact_name?.split(' ').slice(1).join(' ') || '',
          email: contactDetails.contact_email,
          phone: contactDetails.contact_phone,
          company: contactDetails.contact_company,
          website: contactDetails.website,
          notes: contactDetails.additional_requirements
        },
        source: 'outdoor-media' as const
      };

      console.log('📤 Calling submit-quote edge function with:', submitPayload);

      const { data, error } = await supabase.functions.invoke('submit-quote', {
        body: submitPayload
      });

      if (error) {
        console.error('❌ Error from submit-quote function:', error);
        throw error;
      }

      console.log('✅ Quote submitted successfully via edge function:', data);
      
      // Update local quote status
      const { error: updateError } = await supabase
        .from('quotes')
        .update({
          ...contactDetails,
          status: 'submitted'
        })
        .eq('id', currentQuote.id);

      if (updateError) {
        console.warn('⚠️ Warning: Failed to update local quote status:', updateError);
      }

      setCurrentQuote(prev => prev ? { ...prev, status: 'submitted', ...contactDetails } : null);
      
      // Store submitted quote data AND quote details for account creation
      localStorage.setItem('quote_session_id_submitted', sessionId);
      localStorage.setItem('submitted_quote_data', JSON.stringify(contactDetails));
      if (currentQuote) {
        localStorage.setItem('submitted_quote_details', JSON.stringify({
          total_cost: currentQuote.total_cost,
          quote_items: currentQuote.quote_items || [],
          id: currentQuote.id
        }));
      }
      
      // Clear current session for new quotes
      localStorage.removeItem('quote_session_id');
      
      toast.success('Quote submitted successfully and synced to HubSpot with deal!');
      return true;
    } catch (err: any) {
      console.error('Error submitting quote:', err);
      setError(err.message);
      toast.error('Failed to submit quote');
      return false;
    }
  };

  useEffect(() => {
    fetchCurrentQuote();
  }, [sessionId]);

  // Listen for auth state changes to refresh quotes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 Auth state changed:', event, !!session);
      if (event === 'SIGNED_IN') {
        console.log('👤 User signed in, linking session quotes...');
        // Link session quotes to the newly authenticated user
        await linkSessionQuotesToUser();
        // Small delay to ensure auth state is fully updated, then refresh
        setTimeout(() => {
          fetchCurrentQuote();
        }, 100);
      } else if (event === 'SIGNED_OUT') {
        console.log('👋 User signed out, refreshing quotes...');
        // Small delay to ensure auth state is fully updated
        setTimeout(() => {
          fetchCurrentQuote();
        }, 100);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    currentQuote,
    quotes,
    loading,
    error,
    createOrGetQuote,
    addQuoteItem,
    removeQuoteItem,
    submitQuote,
    fetchCurrentQuote,
    // Add a manual recalculation function for debugging
    recalculateDiscounts: async () => {
      if (currentQuote?.id) {
        await updateQuoteTotalCost(currentQuote.id);
        await fetchCurrentQuote();
      }
    }
  };
};

// Server-side totals recalculator: sums item totals and updates the quote totals
export async function recalcQuoteTotals(quoteId: string) {
  const { data: items, error } = await supabase
    .from('quote_items')
    .select('total_cost, base_cost, production_cost, creative_cost')
    .eq('quote_id', quoteId);

  if (error) throw error;

  const exVat = (items || []).reduce((s, i) =>
    s + (Number(i.total_cost ?? 0) || ((i.base_cost || 0) + (i.production_cost || 0) + (i.creative_cost || 0))), 0);

  const vatRate = 20; // percent
  const vatAmount = Math.round(exVat * (vatRate / 100) * 100) / 100;
  const totalIncVat = Math.round((exVat + vatAmount) * 100) / 100;

  await supabase
    .from('quotes')
    .update({
      total_cost: exVat,
      subtotal: exVat,
      vat_rate: vatRate,
      vat_amount: vatAmount,
      total_inc_vat: totalIncVat,
    })
    .eq('id', quoteId);
}

// Fetch a fresh quote by ID, including items
export async function getQuoteById(quoteId: string) {
  const { data, error } = await supabase
    .from('quotes')
    .select('*, quote_items(*)')
    .eq('id', quoteId)
    .maybeSingle();
  if (error) throw error;
  return data;
}