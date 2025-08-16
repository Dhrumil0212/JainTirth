import * as FileSystem from 'expo-file-system';

// Mandir-specific configuration
const MANDIR_SPREADSHEET_ID = "1EoLwxEGXKhjzzH6v_WFr5KBajdQfu9eO8ap4djUUrg0";
const MAIN_SPREADSHEET_ID = "1CIfzUskea7CaZg9H5f8bi_ABjPMVrgUF29tmyeXkXyg";
const API_KEY = "AIzaSyC1Fv_yJ-w7ifM4HIYr0GOG7Z5472GW1ZE";
const MANDIR_DATA_FILE = FileSystem.documentDirectory + 'mandir_data.json';
const MANDIR_LAST_FETCH_FILE = FileSystem.documentDirectory + 'mandir_last_fetch.json';

// File storage utilities
async function saveJsonFile(filename, data) {
  const filePath = FileSystem.documentDirectory + filename;
  await FileSystem.writeAsStringAsync(filePath, JSON.stringify(data));
}

async function readJsonFile(filename) {
  const filePath = FileSystem.documentDirectory + filename;
  const fileInfo = await FileSystem.getInfoAsync(filePath);
  if (!fileInfo.exists) return null;
  const content = await FileSystem.readAsStringAsync(filePath);
  return JSON.parse(content);
}

// Check if mandir data should be refreshed (once per day)
async function shouldRefreshMandirData() {
  try {
    const lastFetch = await readJsonFile('mandir_last_fetch.json');
    if (!lastFetch) return true;
    
    const oneDay = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    const timeSinceLastFetch = Date.now() - lastFetch.timestamp;
    
    return timeSinceLastFetch > oneDay;
  } catch (error) {
    console.log('Error checking mandir refresh status:', error);
    return true;
  }
}

// Mark mandir data as fetched
async function markMandirDataFetched() {
  await saveJsonFile('mandir_last_fetch.json', { timestamp: Date.now() });
}

// Fetch mandir data from Google Sheets
async function fetchMandirData() {
  console.log('🔄 Fetching mandir data from Google Sheets...');
  console.log('Mandir Spreadsheet ID:', MANDIR_SPREADSHEET_ID);
  console.log('Main Spreadsheet ID:', MAIN_SPREADSHEET_ID);
  
  try {
    // Fetch main mandir data
    console.log('📥 Fetching mandir main data...');
    const mainResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${MANDIR_SPREADSHEET_ID}/values/Sheet1!A1:Z10000?key=${API_KEY}`
    );
    
    console.log('Main response status:', mainResponse.status);
    
    if (!mainResponse.ok) {
      throw new Error(`HTTP error! status: ${mainResponse.status}`);
    }
    
    const mainData = await mainResponse.json();
    console.log('Main data response:', {
      hasValues: !!mainData.values,
      valuesLength: mainData.values ? mainData.values.length : 0,
      firstRow: mainData.values ? mainData.values[0] : 'No data'
    });
    
    if (!mainData.values || mainData.values.length === 0) {
      throw new Error('No data received from Google Sheets');
    }
    
    // Fetch image mapping data from main spreadsheet (same as StatesGrid)
    console.log('📥 Fetching image mapping data...');
    const imageResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${MAIN_SPREADSHEET_ID}/values/ImageMapping!A1:Z1000?key=${API_KEY}`
    );
    
    console.log('Image response status:', imageResponse.status);
    
    let imageData = [];
    if (imageResponse.ok) {
      const imageDataResponse = await imageResponse.json();
      imageData = imageDataResponse.values || [];
      console.log('Image data response:', {
        hasValues: !!imageDataResponse.values,
        valuesLength: imageData.length,
        firstRow: imageData.length > 0 ? imageData[0] : 'No data'
      });
    } else {
      console.warn('Image response not ok:', imageResponse.status);
    }
    
    console.log(`✅ Received ${mainData.values.length} rows from Mandir Google Sheets`);
    console.log(`✅ Received ${imageData.length} rows from Main Image Mapping (same as StatesGrid)`);
    
    return {
      mainData: mainData.values,
      imageData: imageData
    };
  } catch (error) {
    console.error('❌ Error fetching mandir data:', error);
    throw error;
  }
}

// Process mandir data into states format
function processMandirData(rows, imageData = []) {
  if (rows.length < 2) {
    throw new Error('Invalid mandir data: insufficient rows');
  }

  const header = rows[0];
  console.log('Processing mandir data with headers:', header);

  // Find column indices
  const columnMap = findMandirColumnIndices(header);
  
  // Debug: Check if we found the required columns
  const requiredColumns = ['state_en', 'name_en'];
  const missingColumns = requiredColumns.filter(col => columnMap[col] === -1);
  if (missingColumns.length > 0) {
    console.warn('Missing required columns:', missingColumns);
    console.log('Available headers:', header);
  }
  
  // Process image mapping
  const imageMapping = {};
  if (imageData && imageData.length > 1) {
    const imageHeader = imageData[0];
    const stateColImg = imageHeader.indexOf('State');
    const rajyaColImg = imageHeader.indexOf('Rajya');
    const imageCol = imageHeader.indexOf('Image');
    
    console.log('Processing mandir image mapping with headers:', imageHeader);
    
    imageData.slice(1).forEach(row => {
      const stateEn = stateColImg >= 0 ? row[stateColImg] : '';
      const stateHi = rajyaColImg >= 0 ? row[rajyaColImg] : '';
      const image = imageCol >= 0 ? row[imageCol] : '';
      
      if (stateEn && image) {
        imageMapping[stateEn] = image;
        // console.log(`Mapped image for state: ${stateEn}`);
      }
      if (stateHi && image) {
        imageMapping[stateHi] = image;
        // console.log(`Mapped image for state: ${stateHi}`);
      }
    });
  }
  
  const states = {
    en: {},
    hi: {}
  };
  
  // Process each row
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length === 0) continue; // Skip empty rows
    
    const stateEn = getCellValue(row, columnMap.state_en);
    const stateHi = getCellValue(row, columnMap.state_hi);
    const placeEn = getCellValue(row, columnMap.name_en);
    const placeHi = getCellValue(row, columnMap.name_hi);
    
    if (stateEn && placeEn) {
      if (!states.en[stateEn]) {
        states.en[stateEn] = {
          name: stateEn,
          image: imageMapping[stateEn] || null,
          places: []
        };
      }
      states.en[stateEn].places.push(placeEn);
    }
    
    if (stateHi && placeHi) {
      if (!states.hi[stateHi]) {
        states.hi[stateHi] = {
          name: stateHi,
          image: imageMapping[stateHi] || null,
          places: []
        };
      }
      states.hi[stateHi].places.push(placeHi);
    }
  }
  
  console.log(`Processed mandir data into ${Object.keys(states.en).length} English states and ${Object.keys(states.hi).length} Hindi states`);
  console.log('Sample English states:', Object.keys(states.en).slice(0, 3));
  console.log('Sample Hindi states:', Object.keys(states.hi).slice(0, 3));
  return states;
}

function findMandirColumnIndices(header) {
  const columnMap = {};
  
  // Define possible column names for each field
  const columnDefinitions = {
    name_en: ['Name', 'Place', 'Temple', 'Mandir'],
    name_hi: ['Naam', 'Tirth', 'Place', 'Temple', 'Mandir'],
    state_en: ['State', 'Rajya'],
    state_hi: ['Rajya', 'State'],
    district_en: ['District', 'Jilla', 'Zila'],
    district_hi: ['Jilla', 'District', 'Zila'],
    city_en: ['City', 'Shahar', 'Town'],
    city_hi: ['Shahar', 'City', 'Town'],
    address_en: ['Address', 'Pata', 'Location'],
    address_hi: ['Pata', 'Address', 'Location'],
    phone: ['Phone', 'Contact', 'Mobile', 'Phone Number'],
    zip: ['ZIP', 'Pincode', 'Postal Code'],
    lat: ['Lat', 'Latitude', 'Latitude'],
    lng: ['Lng', 'Longitude', 'Longitude']
  };
  
  // Find each column
  for (const [field, possibleNames] of Object.entries(columnDefinitions)) {
    columnMap[field] = -1;
    for (const name of possibleNames) {
      const index = header.indexOf(name);
      if (index !== -1) {
        columnMap[field] = index;
        console.log(`Found mandir column "${name}" for field "${field}" at index ${index}`);
        break;
      }
    }
  }
  
  console.log('Mandir column mapping:', columnMap);
  return columnMap;
}

function getCellValue(row, columnIndex) {
  if (columnIndex === -1 || !row[columnIndex]) {
    return '';
  }
  return row[columnIndex].trim();
}

// Process and store all mandir data
async function processAndStoreMandirData() {
  try {
    console.log('🔄 Fetching and processing mandir data...');
    const rawData = await fetchMandirData();
    const processedData = processMandirData(rawData.mainData, rawData.imageData);
    
    // Store both processed data and raw data
    const dataToStore = {
      processed: processedData,
      raw: rawData.mainData
    };
    
    await saveJsonFile('mandir_data.json', dataToStore);
    await markMandirDataFetched();
    console.log('✅ Mandir data processed and stored successfully');
    
    return dataToStore;
  } catch (error) {
    console.error('Error processing mandir data:', error);
    throw error;
  }
}

// Clear old cache and ensure proper structure
async function clearOldCache() {
  try {
    console.log('🧹 Clearing old cache format...');
    await FileSystem.deleteAsync(FileSystem.documentDirectory + 'mandir_data.json');
    await FileSystem.deleteAsync(FileSystem.documentDirectory + 'mandir_last_fetch.json');
    console.log('✅ Old cache cleared');
  } catch (error) {
    console.log('No old cache to clear or error clearing:', error);
  }
}

// Get mandir states data
export async function getMandirStates(language = 'en') {
  try {
    console.log(`🔄 Fetching Mandir states for language: ${language}`);
    
    // Try to get cached data first
    console.log('📂 Checking for cached mandir data...');
    let mandirData = await readJsonFile('mandir_data.json');
    
    // Check if cache has the new structure
    if (!mandirData || !mandirData.processed || !mandirData.raw) {
      console.log('❌ Cache missing or has old format, clearing and fetching fresh data...');
      await clearOldCache();
      console.log('🔄 Processing and storing fresh mandir data...');
      mandirData = await processAndStoreMandirData();
    } else {
      console.log('✅ Using cached mandir data');
    }
    
    // Debug: Check the structure of mandirData
    // console.log('📊 Mandir data structure:', {
    //   hasProcessed: !!mandirData.processed,
    //   hasRaw: !!mandirData.raw,
    //   processedKeys: mandirData.processed ? Object.keys(mandirData.processed) : 'undefined',
    //   languageData: mandirData.processed ? mandirData.processed[language] : 'undefined'
    // });
    
    if (!mandirData.processed) {
      throw new Error('Processed data is missing from cache');
    }
    
    if (!mandirData.processed[language]) {
      console.log(`⚠️ No data for language: ${language}, available languages:`, Object.keys(mandirData.processed));
      return [];
    }
    
    // Get states and sort them in ascending order
    const statesData = Object.values(mandirData.processed[language] || {});
    statesData.sort((a, b) => a.name.localeCompare(b.name));
    
    console.log(`✅ Loaded ${statesData.length} Mandir states (sorted alphabetically)`);
    console.log('Sample states:', statesData.slice(0, 3).map(s => ({ name: s.name, hasImage: !!s.image })));
    return statesData;
  } catch (error) {
    console.error('❌ Error fetching Mandir states:', error);
    throw error;
  }
}

// Force refresh mandir data
export async function forceRefreshMandirData(language = 'en') {
  try {
    console.log('🔄 Force refreshing Mandir data...');
    
    // Force fetch fresh data
    const mandirData = await processAndStoreMandirData();
    
    // Get refreshed states data
    const statesData = Object.values(mandirData.processed[language] || {});
    
    console.log(`✅ Refreshed ${statesData.length} Mandir states`);
    return statesData;
  } catch (error) {
    console.error('Error force refreshing Mandir data:', error);
    throw error;
  }
}

// Get mandir places by district
export async function getMandirPlacesByDistrict(districtName, language = 'en') {
  try {
    console.log(`🔄 Fetching mandir places for district: ${districtName}`);
    
    // Try to get cached data first
    let mandirData = await readJsonFile('mandir_data.json');
    
    // Check if cache has the new structure
    if (!mandirData || !mandirData.processed || !mandirData.raw) {
      console.log('Cache missing or has old format, clearing and fetching fresh data...');
      await clearOldCache();
      mandirData = await processAndStoreMandirData();
    }
    
    // Debug: Check if raw data exists
    if (!mandirData.raw) {
      console.error('Raw data is missing from cache, fetching fresh data...');
      mandirData = await processAndStoreMandirData();
    }
    
    if (!mandirData.raw || !Array.isArray(mandirData.raw)) {
      throw new Error('Raw data is invalid or missing');
    }
    
    // Use cached raw data to process places
    const places = processMandirPlaces(mandirData.raw, districtName, language);
    
    console.log(`✅ Loaded ${places.length} mandir places for district ${districtName}`);
    return places;
  } catch (error) {
    console.error('Error fetching mandir places by district:', error);
    throw error;
  }
}

// Get mandir place by name
export async function getMandirPlaceByName(placeName, language = 'en') {
  try {
    console.log(`🔄 Fetching mandir place by name: ${placeName}`);
    
    // Try to get cached data first
    let mandirData = await readJsonFile('mandir_data.json');
    
    // Check if cache has the new structure
    if (!mandirData || !mandirData.processed || !mandirData.raw) {
      console.log('Cache missing or has old format, clearing and fetching fresh data...');
      await clearOldCache();
      mandirData = await processAndStoreMandirData();
    }
    
    // Debug: Check if raw data exists
    if (!mandirData.raw) {
      console.error('Raw data is missing from cache, fetching fresh data...');
      mandirData = await processAndStoreMandirData();
    }
    
    if (!mandirData.raw || !Array.isArray(mandirData.raw)) {
      throw new Error('Raw data is invalid or missing');
    }
    
    // Use cached raw data to process places
    const place = processMandirPlaceByName(mandirData.raw, placeName, language);
    
    console.log(`✅ Found mandir place: ${place ? place.name : 'Not found'}`);
    return place;
  } catch (error) {
    console.error('Error fetching mandir place by name:', error);
    throw error;
  }
}

// Process mandir places for a specific district
function processMandirPlaces(rows, districtName, language = 'en') {
  if (rows.length < 2) return [];
  
  const header = rows[0];
  const columnMap = findMandirColumnIndices(header);
  const places = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length === 0) continue;
    
    const placeDistrict = getCellValue(row, columnMap.district_en);
    const placeDistrictHi = getCellValue(row, columnMap.district_hi);
    
    // Check if this place belongs to the requested district
    const isMatchingDistrict = language === 'en' 
      ? placeDistrict.toLowerCase() === districtName.toLowerCase()
      : placeDistrictHi.toLowerCase() === districtName.toLowerCase();
    
    if (isMatchingDistrict) {
      const place = {
        name: language === 'en' 
          ? getCellValue(row, columnMap.name_en)
          : getCellValue(row, columnMap.name_hi),
        district: language === 'en' 
          ? getCellValue(row, columnMap.district_en)
          : getCellValue(row, columnMap.district_hi),
        city: language === 'en' 
          ? getCellValue(row, columnMap.city_en)
          : getCellValue(row, columnMap.city_hi),
        address: language === 'en' 
          ? getCellValue(row, columnMap.address_en)
          : getCellValue(row, columnMap.address_hi),
        phone: getCellValue(row, columnMap.phone),
        zip: getCellValue(row, columnMap.zip),
        lat: getCellValue(row, columnMap.lat),
        lng: getCellValue(row, columnMap.lng)
      };
      
      if (place.name) {
        places.push(place);
      }
    }
  }
  
  return places;
}

// Process mandir place by name
function processMandirPlaceByName(rows, placeName, language = 'en') {
  if (rows.length < 2) return null;
  
  const header = rows[0];
  const columnMap = findMandirColumnIndices(header);
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length === 0) continue;
    
    const currentPlaceName = language === 'en' 
      ? getCellValue(row, columnMap.name_en)
      : getCellValue(row, columnMap.name_hi);
    
    if (currentPlaceName.toLowerCase() === placeName.toLowerCase()) {
      return {
        name: currentPlaceName,
        district: language === 'en' 
          ? getCellValue(row, columnMap.district_en)
          : getCellValue(row, columnMap.district_hi),
        city: language === 'en' 
          ? getCellValue(row, columnMap.city_en)
          : getCellValue(row, columnMap.city_hi),
        address: language === 'en' 
          ? getCellValue(row, columnMap.address_en)
          : getCellValue(row, columnMap.address_hi),
        phone: getCellValue(row, columnMap.phone),
        zip: getCellValue(row, columnMap.zip),
        lat: getCellValue(row, columnMap.lat),
        lng: getCellValue(row, columnMap.lng)
      };
    }
  }
  
  return null;
} 

// Test function to debug column mapping
export async function debugMandirColumns() {
  try {
    console.log('🔍 Debugging mandir column mapping...');
    const rawData = await fetchMandirData();
    const header = rawData.mainData[0];
    
    console.log('📋 Available headers in mandir spreadsheet:', header);
    
    const columnMap = findMandirColumnIndices(header);
    console.log('🗂️ Column mapping result:', columnMap);
    
    // Check which required columns are missing
    const requiredColumns = ['state_en', 'name_en'];
    const missingColumns = requiredColumns.filter(col => columnMap[col] === -1);
    
    if (missingColumns.length > 0) {
      console.warn('❌ Missing required columns:', missingColumns);
      console.log('💡 Available headers that might match:', header.filter(h => 
        h.toLowerCase().includes('state') || 
        h.toLowerCase().includes('name') || 
        h.toLowerCase().includes('rajya') || 
        h.toLowerCase().includes('naam')
      ));
    } else {
      console.log('✅ All required columns found');
    }
    
    return { header, columnMap, missingColumns };
  } catch (error) {
    console.error('❌ Error debugging columns:', error);
    throw error;
  }
} 