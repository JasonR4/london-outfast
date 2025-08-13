import React, { useState } from 'react';
import { sendInvestorLead } from '@/utils/investor';

interface InvestorFormProps {
  deadline: Date;
}

interface FormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  ticket: string;
  investor_type: string[];
  has_capital: boolean;
  accepts_nda: boolean;
}

export function InvestorForm({ deadline }: InvestorFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Handle checkboxes for investor_type
    const investorTypes: string[] = [];
    formData.getAll('investor_type').forEach(type => {
      if (typeof type === 'string') investorTypes.push(type);
    });

    const data: FormData = {
      first_name: formData.get('first_name') as string,
      last_name: formData.get('last_name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      ticket: formData.get('ticket') as string,
      investor_type: investorTypes,
      has_capital: formData.get('has_capital') === 'on',
      accepts_nda: formData.get('accepts_nda') === 'on'
    };

    setError(null);
    setSubmitting(true);
    
    try {
      await sendInvestorLead(data);
      setDone(true);
    } catch (e: any) {
      setError(e?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-lg border border-border p-6 bg-card text-center">
        <h4 className="text-xl font-semibold mb-2">Thanks — your declaration is received.</h4>
        <p className="text-sm text-muted-foreground">
          We've emailed you an NDA and next steps. Our team will contact you shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border p-6 bg-card">
      <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-1">
          <label className="block text-sm font-medium mb-1">First name *</label>
          <input 
            required 
            name="first_name" 
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" 
          />
        </div>
        
        <div className="md:col-span-1">
          <label className="block text-sm font-medium mb-1">Last name *</label>
          <input 
            required 
            name="last_name" 
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" 
          />
        </div>
        
        <div className="md:col-span-1">
          <label className="block text-sm font-medium mb-1">Email *</label>
          <input 
            required 
            type="email" 
            name="email" 
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" 
          />
        </div>
        
        <div className="md:col-span-1">
          <label className="block text-sm font-medium mb-1">Contact number *</label>
          <input 
            required 
            name="phone" 
            inputMode="tel" 
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" 
          />
        </div>
        
        <div className="md:col-span-1">
          <label className="block text-sm font-medium mb-1">Intended investment amount *</label>
          <select 
            name="ticket" 
            required 
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Select amount</option>
            <option value="£50k–£100k">£50k–£100k</option>
            <option value="£100k–£250k">£100k–£250k</option>
            <option value="£250k–£500k">£250k–£500k</option>
            <option value="£500k+">£500k+</option>
          </select>
        </div>
        
        <div className="md:col-span-1">
          <label className="block text-sm font-medium mb-1">Investor type *</label>
          <div className="mt-2 grid grid-cols-1 gap-2 text-sm">
            {['High Net Worth', 'Venture Capital', 'Family Office', 'Strategic Partner'].map(type => (
              <label key={type} className="inline-flex items-center gap-2">
                <input 
                  type="checkbox" 
                  name="investor_type" 
                  value={type}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span>{type}</span>
              </label>
            ))}
          </div>
        </div>
        
        <div className="md:col-span-2">
          <label className="inline-flex items-center gap-2 text-sm">
            <input 
              required 
              type="checkbox" 
              name="has_capital"
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span>I have capital available to invest now (minimum £50,000) *</span>
          </label>
        </div>
        
        <div className="md:col-span-2">
          <label className="inline-flex items-center gap-2 text-sm">
            <input 
              required 
              type="checkbox" 
              name="accepts_nda"
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span>I agree to the NDA terms *</span>
          </label>
        </div>
        
        {error && (
          <div className="md:col-span-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-md p-3">
            {error}
          </div>
        )}
        
        <div className="md:col-span-2 flex flex-col sm:flex-row gap-3 items-start">
          <button 
            disabled={submitting} 
            className="inline-flex items-center rounded-md bg-primary text-primary-foreground px-5 py-2 font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {submitting ? 'Submitting…' : 'Submit Declaration'}
          </button>
          <div className="text-xs text-muted-foreground">
            Funding closes 31 Oct 2025 or earlier if fully subscribed.
          </div>
        </div>
      </form>
    </div>
  );
}