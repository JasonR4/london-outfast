import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

  // Fetch current quote for this session
  const fetchCurrentQuote = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('quotes')
        .select(`
          *,
          quote_items (*)
        `)
        .eq('user_session_id', sessionId)
        .eq('status', 'draft')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      
      setCurrentQuote(data);
    } catch (err: any) {
      console.error('Error fetching current quote:', err);
      setError(err.message);
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

      const { data, error } = await supabase
        .from('quotes')
        .insert({
          user_session_id: sessionId,
          status: 'draft'
        })
        .select()
        .single();

      if (error) throw error;

      const newQuote = { ...data, quote_items: [] };
      setCurrentQuote(newQuote);
      return data.id;
    } catch (err: any) {
      console.error('Error creating quote:', err);
      setError(err.message);
      toast.error('Failed to create quote');
      return null;
    }
  };

  // Add an item to the current quote
  const addQuoteItem = async (item: Omit<QuoteItem, 'id' | 'quote_id'>): Promise<boolean> => {
    try {
      const quoteId = await createOrGetQuote();
      if (!quoteId) return false;

      const { data, error } = await supabase
        .from('quote_items')
        .insert({
          quote_id: quoteId,
          ...item
        })
        .select()
        .single();

      if (error) throw error;

      // Update current quote with new item
      setCurrentQuote(prev => {
        if (!prev) return null;
        return {
          ...prev,
          quote_items: [...(prev.quote_items || []), data],
          total_cost: (prev.total_cost || 0) + item.total_cost
        };
      });

      // Update quote total cost
      await updateQuoteTotalCost(quoteId);
      
      toast.success('Added to your plan!');
      return true;
    } catch (err: any) {
      console.error('Error adding quote item:', err);
      setError(err.message);
      toast.error('Failed to add to plan');
      return false;
    }
  };

  // Update quote total cost
  const updateQuoteTotalCost = async (quoteId: string) => {
    try {
      const { data: items, error } = await supabase
        .from('quote_items')
        .select('total_cost')
        .eq('quote_id', quoteId);

      if (error) throw error;

      const totalCost = items?.reduce((sum, item) => sum + Number(item.total_cost), 0) || 0;

      await supabase
        .from('quotes')
        .update({ total_cost: totalCost })
        .eq('id', quoteId);

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

      // Update current quote
      setCurrentQuote(prev => {
        if (!prev) return null;
        const updatedItems = prev.quote_items?.filter(item => item.id !== itemId) || [];
        const newTotalCost = updatedItems.reduce((sum, item) => sum + item.total_cost, 0);
        return {
          ...prev,
          quote_items: updatedItems,
          total_cost: newTotalCost
        };
      });

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

      const { error } = await supabase
        .from('quotes')
        .update({
          ...contactDetails,
          status: 'submitted'
        })
        .eq('id', currentQuote.id);

      if (error) throw error;

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
      
      toast.success('Quote submitted successfully!');
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

  return {
    currentQuote,
    quotes,
    loading,
    error,
    createOrGetQuote,
    addQuoteItem,
    removeQuoteItem,
    submitQuote,
    fetchCurrentQuote
  };
};