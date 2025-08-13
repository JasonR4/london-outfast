import { supabase } from '@/integrations/supabase/client';

interface InvestorLead {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  ticket: string;
  investor_type: string[];
  has_capital: boolean;
  accepts_nda: boolean;
}

export async function sendInvestorLead(payload: InvestorLead) {
  try {
    const { data, error } = await supabase.functions.invoke('send-investor', {
      body: payload
    });

    if (error) {
      throw new Error(error.message || 'Failed to submit investor lead');
    }

    if (!data?.ok) {
      throw new Error(data?.error || 'Submission failed');
    }

    return data;
  } catch (error: any) {
    console.error('Error sending investor lead:', error);
    throw error;
  }
}