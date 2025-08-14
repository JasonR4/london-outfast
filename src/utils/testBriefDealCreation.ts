// TEST BRIEF ROUTE DEAL CREATION NOW
import { supabase } from '@/integrations/supabase/client';

console.log('🚀 TESTING BRIEF ROUTE WITH DEAL CREATION...');

const timestamp = Date.now();

supabase.functions.invoke('submit-brief', {
  body: {
    firstname: 'Test Brief',
    lastname: 'Deal Creation',
    email: `test.brief.deal.${timestamp}@example.com`,
    phone: '+442045243019',
    company: 'Brief Deal Test Company',
    website: 'https://brief-deal-test.com',
    jobtitle: 'Marketing Director',
    budget_band: '30000', // This should create a £30,000 deal
    objective: 'Brand awareness',
    target_areas: ['Westminster', 'Camden', 'Shoreditch'],
    formats: ['48-sheet', '6-sheet', 'digital-48-sheet', 'bus-superside'],
    start_month: '2025-03-01',
    creative_status: 'Ready',
    notes: `DEAL CREATION TEST ${timestamp}: Brief route should now create [brief] deal with £30,000 value`,
    mbl: true,
    source_path: `/brief?test=deal-creation-${timestamp}`
  }
}).then(({ data, error }) => {
  console.log('=== BRIEF DEAL CREATION TEST RESULT ===');
  if (error) {
    console.error('❌ Brief deal test FAILED:', error);
  } else {
    console.log('✅ Brief deal test SUCCESS:', data);
    console.log('🎯 Expected in HubSpot:');
    console.log('   📞 Contact: Test Brief Deal Creation');
    console.log('   💰 Deal: [brief] Brief Quote Request - OOH MBL (£30,000)');
    console.log('   📋 Task: Work on brief: Brief Deal Test Company — Brief Request');
    console.log('   👤 Owner: Matt');
  }
  console.log('=== END BRIEF DEAL TEST ===');
});

console.log(`🔍 Brief deal test timestamp: ${timestamp}`);