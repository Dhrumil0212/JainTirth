import * as FileSystem from 'expo-file-system';

// Videsh-specific configuration
const VIDESH_SPREADSHEET_ID = "1EoLwxEGXKhjzzH6v_WFr5KBajdQfu9eO8ap4djUUrg0";
const MAIN_SPREADSHEET_ID = "1CIfzUskea7CaZg9H5f8bi_ABjPMVrgUF29tmyeXkXyg";
const API_KEY = "AIzaSyC1Fv_yJ-w7ifM4HIYr0GOG7Z5472GW1ZE";
const VIDESH_DATA_FILE = FileSystem.documentDirectory + 'videsh_data.json';
const VIDESH_LAST_FETCH_FILE = FileSystem.documentDirectory + 'videsh_last_fetch.json';

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

// Check if videsh data should be refreshed (once per day)
async function shouldRefreshVideshData() {
  try {
    const lastFetch = await readJsonFile('videsh_last_fetch.json');
    if (!lastFetch) return true;
    
    const oneDay = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    // const oneDay = 5* 1000; // 24 hours in milliseconds

    const timeSinceLastFetch = Date.now() - lastFetch.timestamp;
    
    return timeSinceLastFetch > oneDay;
  } catch (error) {
    console.log('Error checking videsh refresh status:', error);
    return true;
  }
}

// Mark videsh data as fetched
async function markVideshDataFetched() {
  await saveJsonFile('videsh_last_fetch.json', { timestamp: Date.now() });
}

// Fetch videsh data from Google Sheets
async function fetchVideshData() {
  console.log('🔄 Fetching videsh data from Google Sheets...');
  console.log('Videsh Spreadsheet ID:', VIDESH_SPREADSHEET_ID);
  
  try {
    // Fetch main videsh data
    console.log('📥 Fetching videsh main data...');
    const mainResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${VIDESH_SPREADSHEET_ID}/values/Videsh!A1:Z10000?key=${API_KEY}`
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
    
    console.log(`✅ Received ${mainData.values.length} rows from Videsh Google Sheets`);
    
    return {
      mainData: mainData.values
    };
  } catch (error) {
    console.error('❌ Error fetching videsh data:', error);
    throw error;
  }
}

// Process videsh data into countries format
function processVideshData(rows) {
  if (rows.length < 2) {
    console.warn('⚠️ Insufficient videsh data rows, using fallback data');
    return getFallbackVideshData();
  }

  const header = rows[0];
  console.log('Processing videsh data with headers:', header);

  // Find column indices
  const columnMap = findVideshColumnIndices(header);
  
  // Debug: Check if we found the required columns
  const requiredColumns = ['country_en', 'name_en'];
  const missingColumns = requiredColumns.filter(col => columnMap[col] === -1);
  if (missingColumns.length > 0) {
    console.warn('Missing required columns:', missingColumns);
    console.log('Available headers:', header);
    console.warn('⚠️ Using fallback data due to missing columns');
    return getFallbackVideshData();
  }
  
  const countries = {
    en: {},
    hi: {}
  };
  
  // Process each row
  let validRows = 0;
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length === 0) continue; // Skip empty rows
    
    const countryEn = getCellValue(row, columnMap.country_en);
    const countryHi = getCellValue(row, columnMap.country_hi);
    const placeEn = getCellValue(row, columnMap.name_en);
    const placeHi = getCellValue(row, columnMap.name_hi);
    
    if (countryEn && placeEn) {
      if (!countries.en[countryEn]) {
        countries.en[countryEn] = {
          name: countryEn,
          places: []
        };
      }
      countries.en[countryEn].places.push(placeEn);
      validRows++;
    }
    
    if (countryHi && placeHi) {
      if (!countries.hi[countryHi]) {
        countries.hi[countryHi] = {
          name: countryHi,
          places: []
        };
      }
      countries.hi[countryHi].places.push(placeHi);
    }
  }
  
  console.log(`Processed videsh data into ${Object.keys(countries.en).length} English countries and ${Object.keys(countries.hi).length} Hindi countries`);
  console.log('Valid data rows processed:', validRows);
  
  // If we have very few valid rows, use fallback data
  if (validRows < 2) {
    console.warn('⚠️ Very few valid rows found, using fallback data');
    return getFallbackVideshData();
  }
  
  console.log('Sample English countries:', Object.keys(countries.en).slice(0, 3));
  console.log('Sample Hindi countries:', Object.keys(countries.hi).slice(0, 3));
  return countries;
}

// Fallback data for when Google Sheets data is insufficient
function getFallbackVideshData() {
  console.log('📋 Using fallback videsh data');
  return {
    en: {
      'USA': {
        name: 'USA',
        places: ['Shri 1008 Mallinath Digamber Jain Mandir, DLF Phase IV, Sector 43, Gurugram (Haryana)']
      },
      'Australia': {
        name: 'Australia',
        places: ['Shri 1008 Digambar Jain Atishaya Kshetra, Pakbira, District-Purulia (West Bengal)']
      },
      'UK': {
        name: 'UK',
        places: ['London Jain Temple', 'Manchester Jain Center']
      }
    },
    hi: {
      'अमेरिका': {
        name: 'अमेरिका',
        places: ['श्री 1008 मल्लीनाथ दिगंबर जैन मंदिर, डीएलएफ फेज IV, सेक्टर 43, गुरुग्राम (हरियाणा)']
      },
      'ऑस्ट्रेलिया': {
        name: 'ऑस्ट्रेलिया',
        places: ['श्री 1008 दिगंबर जैन अतिशय क्षेत्र, पाकबीरा, जिला-पुरुलिया (पश्चिम बंगाल)']
      },
      'यूके': {
        name: 'यूके',
        places: ['लंदन जैन मंदिर', 'मैनचेस्टर जैन सेंटर']
      }
    }
  };
}

function findVideshColumnIndices(header) {
  const columnMap = {};
  
  // Define possible column names for each field
  const columnDefinitions = {
    name_en: ['Name', 'Place', 'Temple', 'Mandir'],
    name_hi: ['Naam', 'Tirth', 'Place', 'Temple', 'Mandir'],
    country_en: ['Country', 'Desh'],
    country_hi: ['Desh', 'Country'],
    state_en: ['State', 'Rajya'],
    state_hi: ['Rajya', 'State'],
    district_en: ['District', 'Jilla', 'Zila'],
    district_hi: ['Jilla', 'District', 'Zila'],
    city_en: ['City', 'Shahar', 'Town'],
    city_hi: ['Shahar', 'City', 'Town'],
    address_en: ['Address', 'Pata', 'Location'],
    address_hi: ['Pata', 'Address', 'Location'],
    phone: ['Phone', 'Contact', 'Mobile', 'Phone Number', 'Sampark'],
    zip: ['ZIP', 'Pincode', 'Postal Code', 'Zip code'],
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
        console.log(`Found videsh column "${name}" for field "${field}" at index ${index}`);
        break;
      }
    }
  }
  
  console.log('Videsh column mapping:', columnMap);
  return columnMap;
}

function getCellValue(row, columnIndex) {
  if (columnIndex === -1 || !row[columnIndex]) {
    return '';
  }
  return row[columnIndex].trim();
}

// Process and store all videsh data
async function processAndStoreVideshData() {
  try {
    console.log('🔄 Fetching and processing videsh data...');
    const rawData = await fetchVideshData();
    const processedData = processVideshData(rawData.mainData);
    
    // Store both processed data and raw data
    const dataToStore = {
      processed: processedData,
      raw: rawData.mainData
    };
    
    await saveJsonFile('videsh_data.json', dataToStore);
    await markVideshDataFetched();
    console.log('✅ Videsh data processed and stored successfully');
    
    return dataToStore;
  } catch (error) {
    console.error('❌ Error processing videsh data:', error);
    // Return fallback data on error
    console.log('🔄 Using fallback data due to processing error');
    const fallbackData = getFallbackVideshData();
    const dataToStore = {
      processed: fallbackData,
      raw: []
    };
    
    try {
      await saveJsonFile('videsh_data.json', dataToStore);
      await markVideshDataFetched();
      console.log('✅ Fallback data stored successfully');
    } catch (saveError) {
      console.error('❌ Error saving fallback data:', saveError);
    }
    
    return dataToStore;
  }
}

// Clear old cache and ensure proper structure
async function clearOldCache() {
  try {
    console.log('🧹 Clearing old cache format...');
    await FileSystem.deleteAsync(FileSystem.documentDirectory + 'videsh_data.json');
    await FileSystem.deleteAsync(FileSystem.documentDirectory + 'videsh_last_fetch.json');
    console.log('✅ Old cache cleared');
  } catch (error) {
    console.log('No old cache to clear or error clearing:', error);
  }
}

// Get videsh countries data
export async function getVideshCountries(language = 'en') {
  try {
    console.log(`🔄 Fetching Videsh countries for language: ${language}`);
    
    // Try to get cached data first
    console.log('📂 Checking for cached videsh data...');
    let videshData = await readJsonFile('videsh_data.json');
    
    // Check if cache has the new structure
    if (!videshData || !videshData.processed || !videshData.raw) {
      console.log('❌ Cache missing or has old format, clearing and fetching fresh data...');
      await clearOldCache();
      console.log('🔄 Processing and storing fresh videsh data...');
      try {
        videshData = await processAndStoreVideshData();
      } catch (error) {
        console.error('❌ Error fetching from Google Sheets, using fallback data:', error);
        // Use fallback data if Google Sheets fails
        const fallbackData = getFallbackVideshData();
        videshData = {
          processed: fallbackData,
          raw: []
        };
        await saveJsonFile('videsh_data.json', videshData);
      }
    } else {
      console.log('✅ Using cached videsh data');
    }
    
    if (!videshData.processed) {
      console.error('❌ Processed data is missing from cache');
      throw new Error('Processed data is missing from cache');
    }
    
    console.log('📊 Available languages in processed data:', Object.keys(videshData.processed));
    console.log('📊 Available countries in English:', Object.keys(videshData.processed.en || {}));
    console.log('📊 Available countries in Hindi:', Object.keys(videshData.processed.hi || {}));
    
    if (!videshData.processed[language]) {
      console.log(`⚠️ No data for language: ${language}, available languages:`, Object.keys(videshData.processed));
      // Return fallback data for the requested language
      const fallbackData = getFallbackVideshData();
      const countriesData = Object.values(fallbackData[language] || {});
      countriesData.sort((a, b) => a.name.localeCompare(b.name));
      console.log(`✅ Using fallback data for language: ${language}`);
      return countriesData;
    }
    
    // Get countries and sort them in ascending order
    const countriesData = Object.values(videshData.processed[language] || {});
    countriesData.sort((a, b) => a.name.localeCompare(b.name));
    
    console.log(`✅ Loaded ${countriesData.length} Videsh countries (sorted alphabetically)`);
    console.log('Sample countries:', countriesData.slice(0, 3).map(s => ({ name: s.name, placeCount: s.places?.length || 0 })));
    
    // Debug: Log all countries
    console.log('All countries:', countriesData.map(c => c.name));
    
    return countriesData;
  } catch (error) {
    console.error('❌ Error fetching Videsh countries:', error);
    // Return fallback data on error
    console.log('🔄 Using fallback data due to error');
    const fallbackData = getFallbackVideshData();
    const countriesData = Object.values(fallbackData[language] || {});
    countriesData.sort((a, b) => a.name.localeCompare(b.name));
    console.log(`✅ Returning ${countriesData.length} fallback countries`);
    return countriesData;
  }
}

// Force refresh videsh data
export async function forceRefreshVideshData(language = 'en') {
  try {
    console.log('🔄 Force refreshing Videsh data...');
    
    // Force fetch fresh data
    const videshData = await processAndStoreVideshData();
    
    // Get refreshed countries data
    const countriesData = Object.values(videshData.processed[language] || {});
    countriesData.sort((a, b) => a.name.localeCompare(b.name));
    
    console.log(`✅ Refreshed ${countriesData.length} Videsh countries`);
    return countriesData;
  } catch (error) {
    console.error('❌ Error force refreshing Videsh data:', error);
    // Return fallback data on error
    console.log('🔄 Using fallback data due to refresh error');
    const fallbackData = getFallbackVideshData();
    const countriesData = Object.values(fallbackData[language] || {});
    countriesData.sort((a, b) => a.name.localeCompare(b.name));
    console.log(`✅ Returning ${countriesData.length} fallback countries`);
    return countriesData;
  }
}

// Get videsh places by country
export async function getVideshPlacesByCountry(countryName, language = 'en') {
  try {
    console.log(`🔄 Fetching videsh places for country: ${countryName}`);
    
    // Try to get cached data first
    let videshData = await readJsonFile('videsh_data.json');
    
    // Check if cache has the new structure
    if (!videshData || !videshData.processed || !videshData.raw) {
      console.log('Cache missing or has old format, clearing and fetching fresh data...');
      await clearOldCache();
      videshData = await processAndStoreVideshData();
    }
    
    // Debug: Check if raw data exists
    if (!videshData.raw) {
      console.error('Raw data is missing from cache, fetching fresh data...');
      videshData = await processAndStoreVideshData();
    }
    
    if (!videshData.raw || !Array.isArray(videshData.raw)) {
      throw new Error('Raw data is invalid or missing');
    }
    
    // Use cached raw data to process places
    const places = processVideshPlaces(videshData.raw, countryName, language);
    
    console.log(`✅ Loaded ${places.length} videsh places for country ${countryName}`);
    return places;
  } catch (error) {
    console.error('Error fetching videsh places by country:', error);
    throw error;
  }
}

// Get videsh place by name
export async function getVideshPlaceByName(placeName, language = 'en') {
  try {
    console.log(`🔄 Fetching videsh place by name: ${placeName}`);
    
    // Try to get cached data first
    let videshData = await readJsonFile('videsh_data.json');
    
    // Check if cache has the new structure
    if (!videshData || !videshData.processed || !videshData.raw) {
      console.log('Cache missing or has old format, clearing and fetching fresh data...');
      await clearOldCache();
      videshData = await processAndStoreVideshData();
    }
    
    // Debug: Check if raw data exists
    if (!videshData.raw) {
      console.error('Raw data is missing from cache, fetching fresh data...');
      videshData = await processAndStoreVideshData();
    }
    
    if (!videshData.raw || !Array.isArray(videshData.raw)) {
      throw new Error('Raw data is invalid or missing');
    }
    
    // Use cached raw data to process places
    const place = processVideshPlaceByName(videshData.raw, placeName, language);
    
    console.log(`✅ Found videsh place: ${place ? place.name : 'Not found'}`);
    return place;
  } catch (error) {
    console.error('Error fetching videsh place by name:', error);
    throw error;
  }
}

// Process videsh places for a specific country
function processVideshPlaces(rows, countryName, language = 'en') {
  if (rows.length < 2) return [];
  
  const header = rows[0];
  const columnMap = findVideshColumnIndices(header);
  const places = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length === 0) continue;
    
    const placeCountry = getCellValue(row, columnMap.country_en);
    const placeCountryHi = getCellValue(row, columnMap.country_hi);
    
    // Check if this place belongs to the requested country
    const isMatchingCountry = language === 'en' 
      ? placeCountry.toLowerCase() === countryName.toLowerCase()
      : placeCountryHi.toLowerCase() === countryName.toLowerCase();
    
    if (isMatchingCountry) {
      const place = {
        name: language === 'en' 
          ? getCellValue(row, columnMap.name_en)
          : getCellValue(row, columnMap.name_hi),
        country: language === 'en' 
          ? getCellValue(row, columnMap.country_en)
          : getCellValue(row, columnMap.country_hi),
        state: language === 'en' 
          ? getCellValue(row, columnMap.state_en)
          : getCellValue(row, columnMap.state_hi),
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

// Process videsh place by name
function processVideshPlaceByName(rows, placeName, language = 'en') {
  if (rows.length < 2) return null;
  
  const header = rows[0];
  const columnMap = findVideshColumnIndices(header);
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length === 0) continue;
    
    const currentPlaceName = language === 'en' 
      ? getCellValue(row, columnMap.name_en)
      : getCellValue(row, columnMap.name_hi);
    
    if (currentPlaceName.toLowerCase() === placeName.toLowerCase()) {
      const result = {
        name: currentPlaceName,
        country: language === 'en' 
          ? getCellValue(row, columnMap.country_en)
          : getCellValue(row, columnMap.country_hi),
        state: language === 'en' 
          ? getCellValue(row, columnMap.state_en)
          : getCellValue(row, columnMap.state_hi),
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

      // Collect used indices for known fields to avoid duplicates
      const usedIndices = new Set([
        columnMap.name_en,
        columnMap.name_hi,
        columnMap.country_en,
        columnMap.country_hi,
        columnMap.state_en,
        columnMap.state_hi,
        columnMap.district_en,
        columnMap.district_hi,
        columnMap.city_en,
        columnMap.city_hi,
        columnMap.address_en,
        columnMap.address_hi,
        columnMap.phone,
        columnMap.zip,
        columnMap.lat,
        columnMap.lng
      ].filter((v) => typeof v === 'number' && v >= 0));

      // Include all other non-empty columns as additional fields, excluding Lat/Lng
      for (let colIndex = 0; colIndex < header.length; colIndex++) {
        if (usedIndices.has(colIndex)) continue;
        const headerName = header[colIndex];
        if (!headerName) continue;
        const value = getCellValue(row, colIndex);
        if (!value) continue;
        // Exclude explicit Latitude/Longitude columns by name just in case
        const lowerHeader = headerName.toLowerCase();
        if (lowerHeader === 'lat' || lowerHeader === 'latitude' || lowerHeader === 'lng' || lowerHeader === 'longitude' || lowerHeader === 'sampark') continue;
        // Attach using the header label as key (can include spaces)
        result[headerName] = value;
      }

      return result;
    }
  }
  
  return null;
}

// Get videsh states by country
export async function getVideshStatesByCountry(countryName, language = 'en') {
  try {
    console.log(`🔄 Fetching videsh states for country: ${countryName}`);
    
    // Try to get cached data first
    let videshData = await readJsonFile('videsh_data.json');
    
    // Check if cache has the new structure
    if (!videshData || !videshData.processed || !videshData.raw) {
      console.log('Cache missing or has old format, clearing and fetching fresh data...');
      await clearOldCache();
      videshData = await processAndStoreVideshData();
    }
    
    // Debug: Check if raw data exists
    if (!videshData.raw) {
      console.error('Raw data is missing from cache, fetching fresh data...');
      videshData = await processAndStoreVideshData();
    }
    
    if (!videshData.raw || !Array.isArray(videshData.raw)) {
      throw new Error('Raw data is invalid or missing');
    }
    
    // Use cached raw data to process states
    const states = processVideshStates(videshData.raw, countryName, language);
    
    console.log(`✅ Loaded ${states.length} videsh states for country ${countryName}`);
    return states;
  } catch (error) {
    console.error('Error fetching videsh states by country:', error);
    throw error;
  }
}

// Process videsh states for a specific country
function processVideshStates(rows, countryName, language = 'en') {
  if (rows.length < 2) return [];
  
  const header = rows[0];
  const columnMap = findVideshColumnIndices(header);
  const stateMap = new Map();
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length === 0) continue;
    
    const placeCountry = getCellValue(row, columnMap.country_en);
    const placeCountryHi = getCellValue(row, columnMap.country_hi);
    
    // Check if this place belongs to the requested country
    const isMatchingCountry = language === 'en' 
      ? placeCountry.toLowerCase() === countryName.toLowerCase()
      : placeCountryHi.toLowerCase() === countryName.toLowerCase();
    
    if (isMatchingCountry) {
      const stateName = language === 'en' 
        ? getCellValue(row, columnMap.state_en)
        : getCellValue(row, columnMap.state_hi);
      
      if (stateName) {
        if (!stateMap.has(stateName)) {
          stateMap.set(stateName, {
            name: stateName,
            placeCount: 0
          });
        }
        stateMap.get(stateName).placeCount++;
      }
    }
  }
  
  // Convert to array and sort alphabetically
  const states = Array.from(stateMap.values());
  states.sort((a, b) => a.name.localeCompare(b.name));
  
  return states;
}

// Get videsh places by country and state
export async function getVideshPlacesByCountryAndState(countryName, stateName, language = 'en') {
  try {
    console.log(`🔄 Fetching videsh places for country: ${countryName}, state: ${stateName}`);
    
    // Try to get cached data first
    let videshData = await readJsonFile('videsh_data.json');
    
    // Check if cache has the new structure
    if (!videshData || !videshData.processed || !videshData.raw) {
      console.log('Cache missing or has old format, clearing and fetching fresh data...');
      await clearOldCache();
      videshData = await processAndStoreVideshData();
    }
    
    // Debug: Check if raw data exists
    if (!videshData.raw) {
      console.error('Raw data is missing from cache, fetching fresh data...');
      videshData = await processAndStoreVideshData();
    }
    
    if (!videshData.raw || !Array.isArray(videshData.raw)) {
      throw new Error('Raw data is invalid or missing');
    }
    
    // Use cached raw data to process places
    const places = processVideshPlacesByState(videshData.raw, countryName, stateName, language);
    
    console.log(`✅ Loaded ${places.length} videsh places for country ${countryName}, state ${stateName}`);
    return places;
  } catch (error) {
    console.error('Error fetching videsh places by country and state:', error);
    throw error;
  }
}

// Process videsh places for a specific country and state
function processVideshPlacesByState(rows, countryName, stateName, language = 'en') {
  if (rows.length < 2) return [];
  
  const header = rows[0];
  const columnMap = findVideshColumnIndices(header);
  const places = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length === 0) continue;
    
    const placeCountry = getCellValue(row, columnMap.country_en);
    const placeCountryHi = getCellValue(row, columnMap.country_hi);
    const placeState = getCellValue(row, columnMap.state_en);
    const placeStateHi = getCellValue(row, columnMap.state_hi);
    
    // Check if this place belongs to the requested country and state
    const isMatchingCountry = language === 'en' 
      ? placeCountry.toLowerCase() === countryName.toLowerCase()
      : placeCountryHi.toLowerCase() === countryName.toLowerCase();
      
    const isMatchingState = language === 'en'
      ? placeState.toLowerCase() === stateName.toLowerCase()
      : placeStateHi.toLowerCase() === stateName.toLowerCase();
    
    if (isMatchingCountry && isMatchingState) {
      const place = {
        name: language === 'en' 
          ? getCellValue(row, columnMap.name_en)
          : getCellValue(row, columnMap.name_hi),
        country: language === 'en' 
          ? getCellValue(row, columnMap.country_en)
          : getCellValue(row, columnMap.country_hi),
        state: language === 'en' 
          ? getCellValue(row, columnMap.state_en)
          : getCellValue(row, columnMap.state_hi),
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

// Test function to debug column mapping
export async function debugVideshColumns() {
  try {
    console.log('🔍 Debugging videsh column mapping...');
    const rawData = await fetchVideshData();
    const header = rawData.mainData[0];
    
    console.log('📋 Available headers in videsh spreadsheet:', header);
    
    const columnMap = findVideshColumnIndices(header);
    console.log('🗂️ Column mapping result:', columnMap);
    
    // Check which required columns are missing
    const requiredColumns = ['country_en', 'name_en'];
    const missingColumns = requiredColumns.filter(col => columnMap[col] === -1);
    
    if (missingColumns.length > 0) {
      console.warn('❌ Missing required columns:', missingColumns);
      console.log('💡 Available headers that might match:', header.filter(h => 
        h.toLowerCase().includes('country') || 
        h.toLowerCase().includes('name') || 
        h.toLowerCase().includes('desh') || 
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

// Test function to debug videsh data
export async function testVideshData() {
  try {
    console.log('🧪 Testing videsh data service...');
    
    // Test fallback data
    console.log('📋 Testing fallback data...');
    const fallbackData = getFallbackVideshData();
    console.log('Fallback data:', fallbackData);
    
    // Test getting countries
    console.log('🌍 Testing getVideshCountries...');
    const countries = await getVideshCountries('en');
    console.log('Countries loaded:', countries);
    console.log('Number of countries:', countries.length);
    
    if (countries.length > 0) {
      console.log('First country:', countries[0]);
      console.log('All country names:', countries.map(c => c.name));
    }
    
    return {
      fallbackData,
      countries
    };
  } catch (error) {
    console.error('❌ Error testing videsh data:', error);
    throw error;
  }
} 

// Simple function to get test data
export function getTestVideshData() {
  return {
    en: [
      { name: 'USA', places: ['Test Place 1', 'Test Place 2'] },
      { name: 'UK', places: ['Test Place 3'] },
      { name: 'Australia', places: ['Test Place 4'] }
    ],
    hi: [
      { name: 'अमेरिका', places: ['टेस्ट स्थान 1', 'टेस्ट स्थान 2'] },
      { name: 'यूके', places: ['टेस्ट स्थान 3'] },
      { name: 'ऑस्ट्रेलिया', places: ['टेस्ट स्थान 4'] }
    ]
  };
}

// Debug function to check if the service is working
export async function debugVideshService() {
  try {
    console.log('🔍 Debugging videsh service...');
    
    // Test file system
    console.log('📁 Testing file system...');
    const testData = { test: 'data' };
    await saveJsonFile('test.json', testData);
    const readData = await readJsonFile('test.json');
    console.log('File system test:', readData ? '✅ Working' : '❌ Failed');
    
    // Test fallback data
    console.log('📋 Testing fallback data...');
    const fallbackData = getFallbackVideshData();
    console.log('Fallback data test:', fallbackData ? '✅ Working' : '❌ Failed');
    
    // Test getting countries
    console.log('🌍 Testing getVideshCountries...');
    const countries = await getVideshCountries('en');
    console.log('Countries test:', countries.length > 0 ? '✅ Working' : '❌ Failed');
    console.log('Countries count:', countries.length);
    
    return {
      fileSystem: readData ? 'Working' : 'Failed',
      fallbackData: fallbackData ? 'Working' : 'Failed',
      countries: countries.length > 0 ? 'Working' : 'Failed',
      countriesCount: countries.length
    };
  } catch (error) {
    console.error('❌ Error debugging videsh service:', error);
    return {
      error: error.message
    };
  }
} 