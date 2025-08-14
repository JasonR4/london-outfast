console.log('🧪 MANUAL TEST OF ACTUAL QUOTE ROUTES');
console.log('=====================================');

// Create a test quote in the database first, then submit via proper route
const timestamp = Date.now();

// Test 1: Format Route (outdoor-media)
console.log('🏢 MANUAL TEST 1: Format Route');
console.log('Run this in browser console:');
console.log(`
const timestamp = ${timestamp};
const { supabase } = await import('@/integrations/supabase/client');

// First create a quote with items
const quoteData = {
  user_session_id: 'manual-test-' + timestamp,
  contact_name: 'Manual Test User',
  contact_email: 'manual.test.' + timestamp + '@example.com',
  contact_phone: '+442045243019',
  contact_company: 'Manual Test Company',
  total_cost: 12000,
  total_inc_vat: 14400,
  timeline: 'March 2025'
};

const quoteItems = [{
  format_name: '48-Sheet Billboard',
  format_slug: '48-sheet',
  selected_areas: ['Westminster', 'Camden', 'Islington'],
  quantity: 3,
  total_cost: 12000,
  total_inc_vat: 14400
}];

// Insert quote and items
await supabase.from('quotes').insert(quoteData);
await supabase.from('quote_items').insert(quoteItems);

// Now submit via proper route
const result = await supabase.functions.invoke('submit-quote', {
  body: {
    quoteSessionId: 'manual-test-' + timestamp,
    contact: {
      firstName: 'Manual',
      lastName: 'Test',
      email: 'manual.test.' + timestamp + '@example.com',
      phone: '+442045243019',
      company: 'Manual Test Company',
      notes: 'Manual test with real quote data and line items'
    },
    source: 'outdoor-media'
  }
});

console.log('🏢 FORMAT ROUTE RESULT:', result);
`);

console.log('');
console.log('📋 EXPECTED RESULT:');
console.log('👤 CONTACT: Manual Test');
console.log('🤝 DEAL: [outdoor-media] Format Quote');
console.log('📦 LINE ITEMS: 48-Sheet Billboard (3x)');
console.log('📍 LOCATIONS: Westminster, Camden, Islington');
console.log('💷 AMOUNT: £14,400');
console.log(`🔍 Search: ${timestamp}`);
console.log('');
console.log('🚨 THIS SHOULD WORK - Real quote data with proper field names!');