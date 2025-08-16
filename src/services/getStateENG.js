// services/getStateHIN.js

const CACHE_KEY = 'sheets_data_en_combined';

const fetchDataFromGoogleSheets = async () => {
  try {
    const apiKey = "AIzaSyC1Fv_yJ-w7ifM4HIYr0GOG7Z5472GW1ZE";
    const spreadsheetId = "1CIfzUskea7CaZg9H5f8bi_ABjPMVrgUF29tmyeXkXyg";
    const ranges = ["Sheet1!A1:Z600000", "ImageMapping!A1:Z1000"];

    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchGet?ranges=${ranges[0]}&ranges=${ranges[1]}&key=${apiKey}`
    );

    const data = await response.json();
    if (!data.valueRanges || data.valueRanges.length < 2) return { sheet1: [], imageMapping: [] };

    const [sheet1Values, imageMapValues] = data.valueRanges.map(range => range.values || []);

    const result = {
      sheet1: sheet1Values,
      imageMapping: imageMapValues,
    };

    return result;
  } catch (error) {
    console.error("Error fetching combined Google Sheets data:", error);
    return { sheet1: [], imageMapping: [] };
  }
};

export const getStates = async () => {
  const { sheet1, imageMapping } = await fetchDataFromGoogleSheets();

  const headerRow = sheet1[0];
  const stateCol = headerRow.indexOf('State');
  const placeCol = headerRow.indexOf('Name teerth');

  if (stateCol === -1 || placeCol === -1) return [];

  // Create a mapping from state to image
  const imageHeader = imageMapping[0];
  const stateIndex = imageHeader.indexOf("State");
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
  const stateCol = headerRow.indexOf('State');
  const placeCol = headerRow.indexOf('Name teerth');

  if (stateCol === -1 || placeCol === -1) return [];

  return sheet1.slice(1)
    .filter((row) => row[stateCol] === stateName)
    .map((row) => row[placeCol]);
};

export const getPlaceByName = async (placeName) => {
  const { sheet1 } = await fetchDataFromGoogleSheets();
  const headerRow = sheet1[0];
  const placeCol = headerRow.indexOf('Name teerth');

  if (placeCol === -1) return null;

  return sheet1.slice(1).find((row) => row[placeCol] === placeName) || null;
};
