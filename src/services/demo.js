const fetchPlaceDataFromGoogleSheets = async (placeName, language) => {
  try {
    const apiKey = "AIzaSyC1Fv_yJ-w7ifM4HIYr0GOG7Z5472GW1ZE"; // Your API key
    const spreadsheetId = "1CIfzUskea7CaZg9H5f8bi_ABjPMVrgUF29tmyeXkXyg";
    const range = "Sheet1!A1:Z600000"; // Adjust the range if needed

    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`
    );

    const data = await response.json();
    console.log("API Response:", data); // Log the full API response for debugging

    // Ensure data.values exists before trying to process
    if (!data.values) {
      console.error("No data found in the Google Sheets response");
      return;
    }

    // Find the header row
    const headerRow = data.values[0];

    // Map column indices for the required fields
    const nameColumnIndex = language === 'en' ? headerRow.indexOf('Name teerth') : headerRow.indexOf('Naam');
    const latitudeColumnIndex = headerRow.indexOf('latitude');
    const longitudeColumnIndex = headerRow.indexOf('longitude');
    const stateColumnIndex = headerRow.indexOf('State');
    const rajyaColumnIndex = headerRow.indexOf('Rajya');

    if (nameColumnIndex === -1 || latitudeColumnIndex === -1 || longitudeColumnIndex === -1) {
      console.error("Required columns not found in the sheet.");
      return;
    }

    // Filter data for the matching placeName
    const placeData = data.values.filter(
      (row) => row[nameColumnIndex] === placeName
    );

    if (placeData.length > 0) {
      const placeDetails = placeData[0];
      const placeInfo = {
        name: placeDetails[nameColumnIndex],
        latitude: placeDetails[latitudeColumnIndex],
        longitude: placeDetails[longitudeColumnIndex],
        state: placeDetails[stateColumnIndex],
        rajya: placeDetails[rajyaColumnIndex],
      };
      return placeInfo;
    } else {
      console.log(`No data found for place: ${placeName}`);
    }
  } catch (error) {
    console.error("Error fetching place data from Google Sheets:", error);
  }
};

fetchPlaceDataFromGoogleSheets("Pratibhasthali Jabalpur", "en")
  .then(placeInfo => console.log(placeInfo))
  .catch(error => console.log(error));

// For Hindi
fetchPlaceDataFromGoogleSheets("प्रतिभास्थली जबलपुर", "hi")
  .then(placeInfo => console.log(placeInfo))
  .catch(error => console.log(error));