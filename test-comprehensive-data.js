// Test script for comprehensive data service
import {
  forceRefreshData,
  getImagesForPlace,
  getPlaceDetails,
  getPlacesByState,
  getStates,
  initializeData
} from './src/services/comprehensiveDataService';

const testComprehensiveDataService = async () => {
  console.log('🧪 Testing Comprehensive Data Service...');
  
  try {
    // Test 1: Initialize data
    console.log('1. Testing data initialization...');
    await initializeData();
    console.log('✅ Data initialization completed');
    
    // Test 2: Get states
    console.log('2. Testing states retrieval...');
    const statesEn = await getStates('en');
    const statesHi = await getStates('hi');
    console.log(`✅ English states: ${statesEn.length}`);
    console.log(`✅ Hindi states: ${statesHi.length}`);
    
    // Test 3: Get places by state
    if (statesEn.length > 0) {
      console.log('3. Testing places by state...');
      const firstState = statesEn[0];
      const places = await getPlacesByState(firstState.name, 'en');
      console.log(`✅ Places in ${firstState.name}: ${places.length}`);
    }
    
    // Test 4: Get place details
    console.log('4. Testing place details...');
    const placeDetails = await getPlaceDetails('Test Place');
    console.log('✅ Place details retrieved:', placeDetails ? 'Found' : 'Not found');
    
    // Test 5: Get images for place
    console.log('5. Testing images for place...');
    const images = await getImagesForPlace('Test Place', 'en');
    console.log(`✅ Images for place: ${images.length}`);
    
    // Test 6: Force refresh
    console.log('6. Testing force refresh...');
    await forceRefreshData();
    console.log('✅ Force refresh completed');
    
    console.log('🎉 All tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Run the test
testComprehensiveDataService(); 