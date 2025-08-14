// CRITICAL ASSOCIATION TEST WITH REAL QUOTE DATA
import { supabase } from '@/integrations/supabase/client';

console.log('🚨 CRITICAL ASSOCIATION TEST - WITH REAL QUOTE DATA');
console.log('=====================================================');

const timestamp = Date.now();

// Create a mock quote in database first to get real quote data
const mockQuote = {
  user_session_id: `association-test-${timestamp}`,
  contact_name: 'Test User',
  contact_email: `test.${timestamp}@example.com`,
  contact_phone: '+442045243019',
  contact_company: 'Association Test Ltd',
  website: 'https://test.com',
  total_cost: 15000.00,
  total_inc_vat: 18000.00,
  timeline: 'March 2025',
  additional_requirements: 'Need urgent quote with full details'
};

// Create quote items with detailed information
const mockQuoteItems = [
  {
    quote_id: `association-test-${timestamp}`,
    format_name: '48-Sheet Billboard',
    format_slug: '48-sheet',
    selected_areas: ['Westminster', 'Camden', 'Islington'],
    quantity: 5,
    base_cost: 8000,
    production_cost: 2000,
    creative_cost: 1500,
    total_cost: 11500,
    total_inc_vat: 13800,
    selected_periods: [1, 2, 3],
    campaign_start_date: '2025-03-01',
    campaign_end_date: '2025-03-21',
    creative_needs: 'Full creative design required'
  },
  {
    quote_id: `association-test-${timestamp}`,
    format_name: '6-Sheet Poster',
    format_slug: '6-sheet',
    selected_areas: ['King\'s Cross', 'Shoreditch'],
    quantity: 10,
    base_cost: 3000,
    production_cost: 500,
    creative_cost: 0,
    total_cost: 3500,
    total_inc_vat: 4200,
    selected_periods: [1, 2],
    campaign_start_date: '2025-03-01',
    campaign_end_date: '2025-03-14',
    creative_needs: 'Use existing creative'
  }
];

console.log('📝 Creating test quote with detailed items...');

// Insert mock data
Promise.all([
  supabase.from('quotes').insert(mockQuote),
  supabase.from('quote_items').insert(mockQuoteItems)
]).then(([quoteResult, itemsResult]) => {
  if (quoteResult.error || itemsResult.error) {
    console.error('Failed to create test data:', quoteResult.error || itemsResult.error);
    return;
  }

  console.log('✅ Test data created, now submitting to HubSpot...');

  // Submit with the created quote session
  supabase.functions.invoke('submit-quote', {
    body: {
      quoteSessionId: `association-test-${timestamp}`,
      contact: {
        firstName: 'Emma',
        lastName: 'Johnson',
        email: `emma.johnson.${timestamp}@associationtest.com`,
        phone: '+442045243019',
        company: 'Association Test Ltd',
        website: 'https://associationtest.com',
        notes: `CRITICAL TEST ${timestamp}: Must show contact-deal association + line items`
      },
      source: 'outdoor-media'
    }
  }).then(({ data, error }) => {
    console.log('🔗 ASSOCIATION TEST RESULT:', error ? `❌ ERROR: ${error.message}` : `✅ SUCCESS: ${JSON.stringify(data)}`);
    
    setTimeout(() => {
      console.log('=====================================================');
      console.log('🎯 CRITICAL TEST COMPLETED!');
      console.log('');
      console.log('📊 EXPECTED IN HUBSPOT:');
      console.log('👤 CONTACT: Emma Johnson');
      console.log('🤝 DEAL: [outdoor-media] Format Quote - MUST be linked to Emma');
      console.log('📋 TASK: Work on brief - Assigned to Matt');
      console.log('📝 LINE ITEMS: 48-Sheet Billboard (5x) + 6-Sheet Poster (10x)');
      console.log('💷 TOTAL: £18,000 inc VAT');
      console.log('');
      console.log('🚨 CHECK: Associations tab in both Contact and Deal records!');
      console.log(`🔍 Search: ${timestamp}`);
      console.log('=====================================================');
    }, 2000);
  });
});

console.log(`🔍 Critical test timestamp: ${timestamp}`);