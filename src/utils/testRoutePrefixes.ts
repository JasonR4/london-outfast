// Test new route prefix functionality
import { supabase } from '@/integrations/supabase/client';

console.log('🧪 TESTING FIXED ROUTE PREFIXES...');

// Test all three sources with route prefixes
const tests = [
  {
    name: 'outdoor-media (format pages)',
    payload: {
      quoteSessionId: 'test-format-session-001',
      contact: {
        firstName: 'Test Route',
        lastName: 'Outdoor Media',
        email: 'test.route.outdoor@example.com',
        phone: '+442045243019',
        company: 'Test Route Outdoor Media Co',
        website: 'https://test-route-outdoor.com',
        notes: 'Testing [outdoor-media] route prefix in deal name'
      },
      source: 'outdoor-media'
    }
  },
  {
    name: 'configurator',
    payload: {
      quoteSessionId: 'test-config-session-002',
      contact: {
        firstName: 'Test Route',
        lastName: 'Configurator',
        email: 'test.route.configurator@example.com',
        phone: '+442045243019',
        company: 'Test Route Configurator Co',
        website: 'https://test-route-config.com',
        notes: 'Testing [configurator] route prefix in deal name'
      },
      source: 'configurator'
    }
  },
  {
    name: 'smart-quote',
    payload: {
      quoteSessionId: 'test-smart-session-003',
      contact: {
        firstName: 'Test Route',
        lastName: 'Smart Quote',
        email: 'test.route.smart@example.com',
        phone: '+442045243019',
        company: 'Test Route Smart Quote Co',
        website: 'https://test-route-smart.com',
        notes: 'Testing [smart-quote] route prefix in deal name'
      },
      source: 'smart-quote'
    }
  }
];

// Execute all tests
tests.forEach(async (test, index) => {
  setTimeout(async () => {
    console.log(`🚀 Testing ${test.name}...`);
    
    try {
      const { data, error } = await supabase.functions.invoke('submit-quote', {
        body: test.payload
      });
      
      if (error) {
        console.error(`❌ ${test.name} failed:`, error);
      } else {
        console.log(`✅ ${test.name} success:`, data);
      }
    } catch (e) {
      console.error(`💥 ${test.name} exception:`, e);
    }
  }, index * 2000); // Stagger by 2 seconds
});

console.log('🎯 All route prefix tests initiated!');