import * as FileSystem from 'expo-file-system';

// File paths for different data types
const STATES_FILE = FileSystem.documentDirectory + 'states.json';
const PLACES_FILE = FileSystem.documentDirectory + 'places.json';
const PLACE_DETAILS_FILE = FileSystem.documentDirectory + 'place_details.json';
const IMAGES_FILE = FileSystem.documentDirectory + 'images.json';
const LAST_FETCH_FILE = FileSystem.documentDirectory + 'last_fetch.json';

// API Configuration
const API_KEY = "AIzaSyC1Fv_yJ-w7ifM4HIYr0GOG7Z5472GW1ZE";
const SPREADSHEET_ID = "1CIfzUskea7CaZg9H5f8bi_ABjPMVrgUF29tmyeXkXyg";
const NEW_SPREADSHEET_ID = "1EoLwxEGXKhjzzH6v_WFr5KBajdQfu9eO8ap4djUUrg0";

// File storage utilities
export async function saveJsonFile(filename, data) {
  const filePath = FileSystem.documentDirectory + filename;
  await FileSystem.writeAsStringAsync(filePath, JSON.stringify(data));
}

export async function readJsonFile(filename) {
  const filePath = FileSystem.documentDirectory + filename;
  const fileInfo = await FileSystem.getInfoAsync(filePath);
  if (!fileInfo.exists) return null;
  const content = await FileSystem.readAsStringAsync(filePath);
  return JSON.parse(content);
}

export async function fileExists(filename) {
  const filePath = FileSystem.documentDirectory + filename;
  const fileInfo = await FileSystem.getInfoAsync(filePath);
  return fileInfo.exists;
}

// Check if data should be refreshed (once per day)
export async function shouldRefreshData() {
  try {
    const lastFetch = await readJsonFile('last_fetch.json');
    if (!lastFetch) return true;
    
    const oneDay = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    const timeSinceLastFetch = Date.now() - lastFetch.timestamp;
    
    return timeSinceLastFetch > oneDay;
  } catch (error) {
    console.log('Error checking refresh status:', error);
    return true;
  }
}

// Mark data as fetched
export async function markDataFetched() {
  await saveJsonFile('last_fetch.json', { timestamp: Date.now() });
}

// Fetch all data from Google Sheets
export async function fetchAllData() {
  console.log('🔄 Fetching all data from Google Sheets...');
  
  try {
    // Fetch main data from old spreadsheet (for states and other data)
    const mainResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Sheet1!A1:Z10000?key=${API_KEY}`
    );
    const mainData = await mainResponse.json();
    
    // Fetch image mapping
    const imageResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/ImageMapping!A1:Z1000?key=${API_KEY}`
    );
    const imageData = await imageResponse.json();
    
    // Fetch YouTube links
    const youtubeResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/YouTube%20Links!A1:Z1000?key=${API_KEY}`
    );
    const youtubeData = await youtubeResponse.json();
    
    // Fetch places data from new spreadsheet (for districts)
    const placesDataResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${NEW_SPREADSHEET_ID}/values/Sheet1!A1:Z10000?key=${API_KEY}`
    );
    const placesData = await placesDataResponse.json();
    
    return {
      mainData: mainData.values || [],
      imageData: imageData.values || [],
      youtubeData: youtubeData.values || [],
      placesData: placesData.values || []
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}

// Process and store all data
export async function processAndStoreAllData() {
  console.log('📊 Processing and storing all data...');
  
  try {
    const rawData = await fetchAllData();
    
    // Process states data
    const states = processStatesData(rawData.mainData, rawData.imageData);
    await saveJsonFile('states.json', states);
    console.log('✅ States data stored');
    
    // Process places data from new spreadsheet
    const places = processPlacesData(rawData.placesData);
    console.log('📊 Places data to be stored:', places);
    await saveJsonFile('places.json', places);
    console.log('✅ Places data stored');
    
    // Process place details
    const placeDetails = processPlaceDetails(rawData.mainData, rawData.youtubeData);
    await saveJsonFile('place_details.json', placeDetails);
    console.log('✅ Place details stored');
    
    // Process images
    const images = processImagesData(rawData.imageData);
    await saveJsonFile('images.json', images);
    console.log('✅ Images data stored');
    
    // Mark as fetched
    await markDataFetched();
    console.log('✅ All data processed and stored successfully');
    
    return true;
  } catch (error) {
    console.error('Error processing data:', error);
    throw error;
  }
}

// Process states data
function processStatesData(mainData, imageData) {
  const states = {
    en: {},
    hi: {}
  };
  
  if (!mainData || mainData.length === 0) return states;
  
  const header = mainData[0];
  const stateColEn = header.indexOf('State');
  const stateColHi = header.indexOf('Rajya');
  const placeColEn = header.indexOf('Name teerth');
  const placeColHi = header.indexOf('Naam');
  
  // Process image mapping
  const imageMapping = {};
  if (imageData && imageData.length > 1) {
    const imageHeader = imageData[0];
    const stateColImg = imageHeader.indexOf('State');
    const rajyaColImg = imageHeader.indexOf('Rajya');
    const imageCol = imageHeader.indexOf('Image');
    
    imageData.slice(1).forEach(row => {
      const stateEn = stateColImg >= 0 ? row[stateColImg] : '';
      const stateHi = rajyaColImg >= 0 ? row[rajyaColImg] : '';
      const image = imageCol >= 0 ? row[imageCol] : '';
      
      if (stateEn && image) imageMapping[stateEn] = image;
      if (stateHi && image) imageMapping[stateHi] = image;
    });
  }
  
  // Process main data
  mainData.slice(1).forEach(row => {
    const stateEn = stateColEn >= 0 ? row[stateColEn] : '';
    const stateHi = stateColHi >= 0 ? row[stateColHi] : '';
    const placeEn = placeColEn >= 0 ? row[placeColEn] : '';
    const placeHi = placeColHi >= 0 ? row[placeColHi] : '';
    
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
  });
  
  return states;
}

// Process places data
function processPlacesData(mainData) {
  const places = {
    en: {},
    hi: {}
  };
  
  if (!mainData || mainData.length === 0) return places;
  
  const header = mainData[0];
  console.log('🔍 Processing places data with headers:', header);
  console.log('🔍 Available columns:', header.map((name, index) => `${index}: ${name}`));
  
  // Use correct column indices based on actual data structure from new spreadsheet
  const stateColEn = header.indexOf('State'); // Column A
  const stateColHi = header.indexOf('Rajya'); // Column B
  const districtColEn = header.indexOf('District'); // Column C
  const districtColHi = header.indexOf('Jilla'); // Column D
  
  console.log('🔍 Column indices found:');
  console.log('  State (EN):', stateColEn);
  console.log('  Rajya (HI):', stateColHi);
  console.log('  District (EN):', districtColEn);
  console.log('  Jilla (HI):', districtColHi);
  
  let processedCount = 0;
  
  mainData.slice(1).forEach((row, index) => {
    const stateEn = stateColEn >= 0 ? row[stateColEn] : '';
    const stateHi = stateColHi >= 0 ? row[stateColHi] : '';
    const districtEn = districtColEn >= 0 ? row[districtColEn] : '';
    const districtHi = districtColHi >= 0 ? row[districtColHi] : '';
    
    if (stateEn && districtEn) {
      if (!places.en[stateEn]) places.en[stateEn] = [];
      if (!places.en[stateEn].includes(districtEn)) {
        places.en[stateEn].push(districtEn);
        processedCount++;
      }
    }
    
    if (stateHi && districtHi) {
      if (!places.hi[stateHi]) places.hi[stateHi] = [];
      if (!places.hi[stateHi].includes(districtHi)) {
        places.hi[stateHi].push(districtHi);
        processedCount++;
      }
    }
  });
  
  console.log('🔍 Processed places data:');
  console.log('  Total processed rows:', processedCount);
  console.log('  English states with districts:', Object.keys(places.en).length);
  console.log('  Hindi states with districts:', Object.keys(places.hi).length);
  console.log('  Sample English data:', Object.keys(places.en).slice(0, 3));
  console.log('  Sample Hindi data:', Object.keys(places.hi).slice(0, 3));
  
  return places;
}

// Process place details
function processPlaceDetails(mainData, youtubeData) {
  const details = {};
  
  if (!mainData || mainData.length === 0) return details;
  
  const header = mainData[0];
  const nameColEn = header.indexOf('Name teerth');
  const nameColHi = header.indexOf('Naam');
  const addressCol = header.indexOf('Address');
  const phoneCol = header.indexOf('Phone');
  const latCol = header.indexOf('Lat');
  const lngCol = header.indexOf('Lng');
  
  // Process YouTube links
  const youtubeMap = {};
  if (youtubeData && youtubeData.length > 1) {
    const youtubeHeader = youtubeData[0];
    const placeCol = youtubeHeader.indexOf('Place');
    const placeHiCol = youtubeHeader.indexOf('PlaceHin');
    const videoCol = youtubeHeader.indexOf('Video');
    
    youtubeData.slice(1).forEach(row => {
      const placeEn = placeCol >= 0 ? row[placeCol] : '';
      const placeHi = placeHiCol >= 0 ? row[placeHiCol] : '';
      const video = videoCol >= 0 ? row[videoCol] : '';
      
      if (placeEn && video) {
        if (!youtubeMap[placeEn]) youtubeMap[placeEn] = [];
        youtubeMap[placeEn].push(video);
      }
      if (placeHi && video) {
        if (!youtubeMap[placeHi]) youtubeMap[placeHi] = [];
        youtubeMap[placeHi].push(video);
      }
    });
  }
  
  // Process main data
  mainData.slice(1).forEach(row => {
    const nameEn = nameColEn >= 0 ? row[nameColEn] : '';
    const nameHi = nameColHi >= 0 ? row[nameColHi] : '';
    const address = addressCol >= 0 ? row[addressCol] : '';
    const phone = phoneCol >= 0 ? row[phoneCol] : '';
    const lat = latCol >= 0 ? row[latCol] : '';
    const lng = lngCol >= 0 ? row[lngCol] : '';
    
    if (nameEn) {
      details[nameEn] = {
        name: nameEn,
        address: address,
        phone: phone,
        lat: lat,
        lng: lng,
        youtubeLinks: youtubeMap[nameEn] || []
      };
    }
    
    if (nameHi) {
      details[nameHi] = {
        name: nameHi,
        address: address,
        phone: phone,
        lat: lat,
        lng: lng,
        youtubeLinks: youtubeMap[nameHi] || []
      };
    }
  });
  
  return details;
}

// Process images data
function processImagesData(imageData) {
  const images = {
    en: {},
    hi: {}
  };
  
  if (!imageData || imageData.length === 0) return images;
  
  const header = imageData[0];
  const stateCol = header.indexOf('State');
  const rajyaCol = header.indexOf('Rajya');
  const placeCol = header.indexOf('Place');
  const tirthCol = header.indexOf('Tirth');
  const linkCol = header.indexOf('Link');
  
  imageData.slice(1).forEach(row => {
    const state = stateCol >= 0 ? row[stateCol] : '';
    const rajya = rajyaCol >= 0 ? row[rajyaCol] : '';
    const place = placeCol >= 0 ? row[placeCol] : '';
    const tirth = tirthCol >= 0 ? row[tirthCol] : '';
    const link = linkCol >= 0 ? row[linkCol] : '';
    
    if (state && place && link) {
      if (!images.en[state]) images.en[state] = {};
      if (!images.en[state][place]) images.en[state][place] = [];
      images.en[state][place].push(link);
    }
    
    if (rajya && tirth && link) {
      if (!images.hi[rajya]) images.hi[rajya] = {};
      if (!images.hi[rajya][tirth]) images.hi[rajya][tirth] = [];
      images.hi[rajya][tirth].push(link);
    }
  });
  
  return images;
}

// Load data from local storage
export async function loadStatesData(language = 'en') {
  const states = await readJsonFile('states.json');
  return states ? states[language] : {};
}

export async function loadPlacesData(language = 'en') {
  console.log(`🔍 Loading places data for language: "${language}"`);
  
  const places = await readJsonFile('places.json');
  console.log('🔍 Raw places data from file:', places);
  
  const result = places ? places[language] : {};
  console.log(`🔍 Returning places data for "${language}":`, result);
  
  return result;
}

export async function loadPlaceDetails() {
  return await readJsonFile('place_details.json') || {};
}

export async function loadImagesData(language = 'en') {
  const images = await readJsonFile('images.json');
  return images ? images[language] : {};
}

// Initialize data (fetch if needed)
export async function initializeData() {
  console.log('🚀 Initializing data...');
  
  const shouldRefresh = await shouldRefreshData();
  const dataExists = await fileExists('states.json');
  
  if (!dataExists || shouldRefresh) {
    console.log('📥 Fetching fresh data...');
    await processAndStoreAllData();
  } else {
    console.log('✅ Using cached data');
  }
}

// Force refresh data
export async function forceRefreshData() {
  console.log('🔄 Force refreshing data...');
  await processAndStoreAllData();
}

// Get states for a specific language
export async function getStates(language = 'en') {
  const states = await loadStatesData(language);
  const statesArray = Object.values(states);
  // Sort states in ascending order by name
  statesArray.sort((a, b) => a.name.localeCompare(b.name));
  return statesArray;
}

// Get places for a specific state
export async function getPlacesByState(stateName, language = 'en') {
  const states = await loadStatesData(language);
  return states[stateName] ? states[stateName].places : [];
}

// Get districts for a specific state
export async function getDistricts(stateName, language = 'en') {
  console.log(`🔍 Getting districts for state: "${stateName}" in language: "${language}"`);
  
  const places = await loadPlacesData(language);
  console.log('🔍 Loaded places data:', places);
  console.log('🔍 Available states:', Object.keys(places));
  
  const districts = places[stateName] || [];
  console.log(`🔍 Found ${districts.length} districts for "${stateName}":`, districts);
  
  return districts;
}

// Get place details
export async function getPlaceDetails(placeName) {
  const details = await loadPlaceDetails();
  return details[placeName] || null;
}

// Get images for a place
export async function getImagesForPlace(placeName, language = 'en') {
  const images = await loadImagesData(language);
  
  // Search through all states for the place
  for (const state in images) {
    if (images[state][placeName]) {
      return images[state][placeName];
    }
  }
  
  return [];
} 

// Get all places by district
export async function getPlacesByDistrict(districtName, language = 'en') {
  const placeDetails = await loadPlaceDetails();
  const places = [];
  
  for (const placeName in placeDetails) {
    const place = placeDetails[placeName];
    if (place.district === districtName) {
      places.push(place);
    }
  }
  
  return places;
}

// Get all places (for internal use)
export async function getAllPlaces() {
  const placeDetails = await loadPlaceDetails();
  return Object.values(placeDetails);
} 