const CACHE_KEY = 'sheets_data_hi_combined';

const fetchDataFromGoogleSheets = async () => {
  try {
    const apiKey = "AIzaSyC1Fv_yJ-w7ifM4HIYr0GOG7Z5472GW1ZE";
    const spreadsheetId = "1CIfzUskea7CaZg9H5f8bi_ABjPMVrgUF29tmyeXkXyg";
    const ranges = [
      "Sheet1!A1:Z600000", 
      "ImageMapping!A1:Z1000",
      "YouTube Links!A1:Z10000" // Added YouTubeLinks range
    ];

    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchGet?ranges=${ranges[0]}&ranges=${ranges[1]}&ranges=${ranges[2]}&key=${apiKey}`
    );

    const data = await response.json();
    if (!data.valueRanges || data.valueRanges.length < 3) {
      return { sheet1: [], imageMapping: [], youtubeLinks: [] };
    }

    const [sheet1Values, imageMapValues, youtubeLinksValues] = 
      data.valueRanges.map(range => range.values || []);

    // Process YouTube links
    const youtubeHeader = youtubeLinksValues[0] || [];
    const placeNameCol = youtubeHeader.indexOf('PlaceHin');
    const videoCol = youtubeHeader.indexOf('Video');
    
    const youtubeMap = {};
    if (placeNameCol !== -1 && videoCol !== -1) {
      youtubeLinksValues.slice(1).forEach(row => {
        const place = row[placeNameCol];
        const link = row[videoCol];
        if (place && link) {
          if (!youtubeMap[place]) youtubeMap[place] = [];
          youtubeMap[place].push(link);
        }
      });
    }

    const result = {
      sheet1: sheet1Values,
      imageMapping: imageMapValues,
      youtubeLinks: youtubeMap
    };

    return result;

  } catch (error) {
    console.error("Error fetching Google Sheets data:", error);
    return { sheet1: [], imageMapping: [], youtubeLinks: [] };
  }
};

export const getStates = async () => {
  const { sheet1, imageMapping } = await fetchDataFromGoogleSheets();

  const headerRow = sheet1[0];
  const stateCol = headerRow.indexOf('Rajya');
  const placeCol = headerRow.indexOf('Naam');

  if (stateCol === -1 || placeCol === -1) return [];

  // Create a mapping from state to image
  const imageHeader = imageMapping[0];
  const stateIndex = imageHeader.indexOf("Rajya");
  const imageIndex = imageHeader.indexOf("Image");

  const imageMap = {};
  if (stateIndex !== -1 && imageIndex !== -1) {
    imageMapping.slice(1).forEach((row) => {
      const state = row[stateIndex];
      const image = row[imageIndex];
      if (state && image) {
        imageMap[state] = image;
      }
    });
  }

  const stateMap = {};

  sheet1.slice(1).forEach((row) => {
    const state = row[stateCol];
    const place = row[placeCol];

    if (!state || !place) return;

    if (!stateMap[state]) {
      stateMap[state] = {
        name: state,
        image: imageMap[state] || null,
        places: [],
      };
    }

    stateMap[state].places.push(place);
  });

  return Object.values(stateMap);
};

export const getPlacesByState = async (stateName) => {
  const { sheet1 } = await fetchDataFromGoogleSheets();
  const headerRow = sheet1[0];
  const stateCol = headerRow.indexOf('Rajya');
  const placeCol = headerRow.indexOf('Naam');

  if (stateCol === -1 || placeCol === -1) return [];

  return sheet1.slice(1)
    .filter((row) => row[stateCol] === stateName)
    .map((row) => row[placeCol]);
};


export const getPlaceByName = async (placeName) => {
  const { sheet1, youtubeLinks } = await fetchDataFromGoogleSheets();
  
  const headerRow = sheet1[0] || [];
  const placeCol = headerRow.indexOf('Naam');
  
  if (placeCol === -1) return null;

  const placeData = sheet1.slice(1).find(row => row[placeCol] === placeName);
  
  if (!placeData) return null;

  // Add YouTube links to the response
  return {
    ...placeData,
    youtubeLinks: youtubeLinks[placeName] || []
  };
};