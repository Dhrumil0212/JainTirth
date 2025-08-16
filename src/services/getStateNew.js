
const CACHE_KEY = 'new_sheets_data_combined';
const MAIN_DATA_CACHE_KEY = 'main_sheets_data_v2'; // Separate cache with longer duration
const SPREADSHEET_ID = '1EoLwxEGXKhjzzH6v_WFr5KBajdQfu9eO8ap4djUUrg0';
const API_KEY = 'AIzaSyC1Fv_yJ-w7ifM4HIYr0GOG7Z5472GW1ZE';
const RANGE = 'Sheet1!A1:Z10000';

const fetchDataFromSheet = async () => {
  try {
    console.log('Fetching fresh data from Google Sheets...');
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}?key=${API_KEY}`
    );

    const data = await response.json();
    if (!data.values) {
      console.error('No data received from Google Sheets');
      return [];
    }

    console.log(`Received ${data.values.length} rows from Google Sheets`);
    
    return data.values;
  } catch (error) {
    console.error("Error fetching sheet data:", error);
    return [];
  }
};

export const getStates = async (language = 'en') => {
  const rows = await fetchDataFromSheet();
  const header = rows[0];
  console.log('getStates - Available headers:', header);
  
  const stateKey = language === 'en' ? 'State' : 'Rajya';
  const stateCol = header.indexOf(stateKey);
  console.log(`getStates - Looking for column "${stateKey}" at index ${stateCol}`);
  
  if (stateCol === -1) {
    console.error(`getStates - Could not find column "${stateKey}" in header`);
    return [];
  }

  const uniqueStates = new Map();

  rows.slice(1).forEach(row => {
    const state = row[stateCol];
    if (state && !uniqueStates.has(state)) {
      uniqueStates.set(state, { name: state });
    }
  });

  return Array.from(uniqueStates.values()).sort((a, b) => a.name.localeCompare(b.name));
};

export const getPlacesByState = async (stateName, language = 'en') => {
  const rows = await fetchDataFromSheet();
  const header = rows[0];
  const stateKey = language === 'en' ? 'State' : 'Rajya';
  const stateCol = header.indexOf(stateKey);
  if (stateCol === -1) return [];

  return rows.slice(1)
    .filter(row => row[stateCol] === stateName);
};

// New function to get unique districts from the sheet
export const getDistricts = async (stateName, language = 'en') => {
  const rows = await fetchDataFromSheet();
  const header = rows[0];
  console.log('getDistricts - Available headers:', header);
  
  const stateKey = language === 'en' ? 'State' : 'Rajya';
  const districtKey = language === 'en' ? 'District' : 'Jilla'; // Assuming "District" or "Zila" is the column header for districts
  const stateCol = header.indexOf(stateKey);
  const districtCol = header.indexOf(districtKey);

  console.log(`getDistricts - Looking for state column "${stateKey}" at index ${stateCol}`);
  console.log(`getDistricts - Looking for district column "${districtKey}" at index ${districtCol}`);

  if (stateCol === -1 || districtCol === -1) {
    console.error(`getDistricts - Could not find required columns. State: ${stateCol}, District: ${districtCol}`);
    return [];
  }

  const districts = new Set();

  rows.slice(1).forEach((row) => {
    if (row[stateCol] === stateName) {
      const district = row[districtCol];
      if (district) {
        districts.add(district); // Adding unique districts to the Set
      }
    }
  });

  return Array.from(districts); // Return as an array
};


export const getPlacesByDistrict = async (districtName, language = 'en') => {
  // Your implementation for fetching places by district
  const rows = await fetchDataFromSheet();
  const header = rows[0];
  const districtKey = language === 'en' ? 'District' : 'Jilla';
  const districtCol = header.indexOf(districtKey);
  if (districtCol === -1) return [];

  return rows.slice(1).filter(row => row[districtCol] === districtName);
};

// New function to get a specific place by name
export const getPlaceByName = async (placeName, language = 'en') => {
  const rows = await fetchDataFromSheet();
  const header = rows[0];
  
  console.log('Header:', header);
  console.log('Looking for place:', placeName);
  console.log('Language:', language);
  
  // Use correct column names from Excel sheet
  const nameKey = language === 'en' ? 'Name' : 'Naam';
  const nameCol = header.indexOf(nameKey);
  
  console.log(`Looking for column "${nameKey}" at index ${nameCol}`);
  
  if (nameCol === -1) {
    console.error(`Could not find column "${nameKey}" in header. Available columns:`, header);
    return null;
  }

  // Log first few rows to understand structure
  console.log('First 3 data rows:', rows.slice(1, 4));

  const place = rows.slice(1).find(row => {
    const name = row[nameCol];
    const trimmedName = name ? name.trim() : '';
    const trimmedPlaceName = placeName.trim();
    console.log(`Comparing: "${trimmedName}" with "${trimmedPlaceName}"`);
    return trimmedName === trimmedPlaceName;
  });

  if (!place) {
    console.log('Exact match not found. Trying partial matching...');
    
    // Try partial matching as fallback
    const partialMatch = rows.slice(1).find(row => {
      const name = row[nameCol];
      const trimmedName = name ? name.trim() : '';
      const trimmedPlaceName = placeName.trim();
      return trimmedName.includes(trimmedPlaceName) || trimmedPlaceName.includes(trimmedName);
    });
    
    if (partialMatch) {
      console.log('Found partial match:', partialMatch);
      return {
        district: partialMatch[language === 'en' ? 2 : 3],
        city: partialMatch[language === 'en' ? 4 : 5],
        name: partialMatch[language === 'en' ? 6 : 7],
        address: partialMatch[language === 'en' ? 8 : 9],
        phone: partialMatch[10],
        zip: partialMatch[12],
        lat: partialMatch[13],
        lng: partialMatch[14],
      };
    }
    
    console.log('Place not found in data. Available places in first 10 rows:');
    rows.slice(1, 11).forEach((row, index) => {
      const name = row[nameCol];
      if (name) console.log(`${index + 1}: "${name.trim()}"`);
    });
    return null;
  }

  console.log('Found place:', place);

  return {
    district: place[language === 'en' ? 2 : 3],
    city: place[language === 'en' ? 4 : 5],
    name: place[language === 'en' ? 6 : 7],
    address: place[language === 'en' ? 8 : 9],
    phone: place[10],
    zip: place[12],
    lat: place[13],
    lng: place[14],
  };
};

// New function to get district for a specific place
export const getDistrictForPlace = async (placeName, language = 'en') => {
  const place = await getPlaceByName(placeName, language);
  return place ? place.district : null;
};

// Debug function to understand data structure
export const debugDataStructure = async (language = 'en') => {
  const rows = await fetchDataFromSheet();
  const header = rows[0];
  
  console.log('=== DATA STRUCTURE DEBUG ===');
  console.log('Header:', header);
  console.log('Total rows:', rows.length);
  console.log('First 5 data rows:');
  rows.slice(1, 6).forEach((row, index) => {
    console.log(`Row ${index + 1}:`, row);
  });
  
  // Show all unique place names using correct column names
  const nameKey = language === 'en' ? 'Name' : 'Naam';
  const colIndex = header.indexOf(nameKey);
  
  if (colIndex !== -1) {
    console.log(`\nPlaces in column "${nameKey}" (index ${colIndex}):`);
    const places = new Set();
    rows.slice(1).forEach(row => {
      const name = row[colIndex];
      if (name && name.trim()) {
        places.add(name.trim());
      }
    });
    console.log(Array.from(places).slice(0, 10)); // Show first 10
  } else {
    console.log(`Column "${nameKey}" not found in header`);
  }
  
  console.log('=== END DEBUG ===');
};