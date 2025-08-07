import { manualHubSpotSync } from './hubspotSync';

// Manually sync the Sarah Jones quote that was missed
const syncSarahJonesQuote = async () => {
  const quoteId = '1102fa9e-7b28-4306-bc83-2c47c7dc0d50';
  console.log('Manually syncing Sarah Jones quote to HubSpot...');
  
  const success = await manualHubSpotSync(quoteId);
  
  if (success) {
    console.log('✅ Successfully synced Sarah Jones quote to HubSpot');
  } else {
    console.error('❌ Failed to sync Sarah Jones quote to HubSpot');
  }
  
  return success;
};

// Auto-execute on import (for immediate sync)
syncSarahJonesQuote();

export { syncSarahJonesQuote };