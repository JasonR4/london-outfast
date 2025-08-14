console.log('🔧 TESTING FIXED BRIEF SYNC');
console.log('==============================');

// Test the budget parsing with the actual data from the real submission
const realBudget = "50000000";
const parsedBudget = Math.max(1000, parseFloat(String(realBudget).replace(/[£,\s]/g, '')) || 30000);

console.log('Budget parsing test:');
console.log('Input:', realBudget);
console.log('Parsed:', parsedBudget);

// This should now be £50,000,000 which will create a huge deal in HubSpot
// The real submission should have created:
// Contact: Matt BillingBullshit 
// Deal: [brief] Brief Quote Request - OOH MBL (£50,000,000)
// Line Items: Cross Track Projection, Full Station Takeovers, Train Wraps, Tube Car Panels

console.log('');
console.log('🔍 CHECK HUBSPOT NOW FOR:');
console.log('👤 CONTACT: Matt BillingBullshit');  
console.log('🏢 COMPANY: Bullshitty');
console.log('📧 EMAIL: Billy@bullshit.crack');
console.log('🤝 DEAL: [brief] Brief Quote Request - OOH MBL');
console.log('💷 AMOUNT: £50,000,000');
console.log('📦 LINE ITEMS: Cross Track Projection (XTPs), Full Station Takeovers, Train Wraps, Tube Car Panels');
console.log('📍 LOCATIONS: Westminster, Mayfair');
console.log('📋 TASK: Assigned to Matt @ r4advertising.agency');
console.log('');
console.log('🚨 If nothing appears, check the edge function logs for errors!');