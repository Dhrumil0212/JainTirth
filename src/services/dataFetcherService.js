import { getDistricts as getDistrictsComprehensive } from './comprehensiveDataService';
import databaseService from './databaseService';

const SPREADSHEET_ID = '1EoLwxEGXKhjzzH6v_WFr5KBajdQfu9eO8ap4djUUrg0';
const API_KEY = 'AIzaSyC1Fv_yJ-w7ifM4HIYr0GOG7Z5472GW1ZE';
const RANGE = 'Sheet1!A1:Z10000';

class DataFetcherService {
  constructor() {
    this.isInitialized = false;
  }

  async init() {
    if (this.isInitialized) return;
    
    try {
      await this.ensureDataIsAvailable();
      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing DataFetcherService:', error);
      throw error;
    }
  }

  async ensureDataIsAvailable() {
    try {
      const shouldFetch = await databaseService.shouldFetchData();
      if (shouldFetch) {
        console.log('Data needs to be fetched, calling fetchAndStoreData...');
        await this.fetchAndStoreData();
      } else {
        console.log('Using cached data');
      }
    } catch (error) {
      console.error('Error ensuring data availability:', error);
      throw error;
    }
  }

  async fetchAndStoreData() {
    try {
      await this.init();
      
      console.log('Fetching data from Google Sheets...');
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}?key=${API_KEY}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.values || data.values.length === 0) {
        throw new Error('No data received from Google Sheets');
      }

      console.log(`Received ${data.values.length} rows from Google Sheets`);
      
      // Process the data
      const processedData = this.processSheetData(data.values);
      
      // Store in database
      await databaseService.insertPlaces(processedData);
      
      console.log('Data successfully fetched and stored');
      return processedData;
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
  }

  processSheetData(rows) {
    if (rows.length < 2) {
      throw new Error('Invalid data: insufficient rows');
    }

    const header = rows[0];
    console.log('Processing sheet data with headers:', header);

    // Find column indices
    const columnMap = this.findColumnIndices(header);
    
    const processedData = [];
    
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row.length === 0) continue; // Skip empty rows
      
      const place = {
        name_en: this.getCellValue(row, columnMap.name_en),
        name_hi: this.getCellValue(row, columnMap.name_hi),
        state_en: this.getCellValue(row, columnMap.state_en),
        state_hi: this.getCellValue(row, columnMap.state_hi),
        district_en: this.getCellValue(row, columnMap.district_en),
        district_hi: this.getCellValue(row, columnMap.district_hi),
        city_en: this.getCellValue(row, columnMap.city_en),
        city_hi: this.getCellValue(row, columnMap.city_hi),
        address_en: this.getCellValue(row, columnMap.address_en),
        address_hi: this.getCellValue(row, columnMap.address_hi),
        phone: this.getCellValue(row, columnMap.phone),
        zip: this.getCellValue(row, columnMap.zip),
        lat: this.getCellValue(row, columnMap.lat),
        lng: this.getCellValue(row, columnMap.lng)
      };
      
      processedData.push(place);
    }
    
    console.log(`Processed ${processedData.length} places`);
    return processedData;
  }

  findColumnIndices(header) {
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
          console.log(`Found column "${name}" for field "${field}" at index ${index}`);
          break;
        }
      }
    }
    
    console.log('Column mapping:', columnMap);
    return columnMap;
  }

  getCellValue(row, columnIndex) {
    if (columnIndex === -1 || !row[columnIndex]) return '';
    return row[columnIndex].trim();
  }

  async getDistricts(stateName, language = 'en') {
    try {
      await this.ensureDataIsAvailable();
      return await getDistrictsComprehensive(stateName, language);
    } catch (error) {
      console.error('Error getting districts:', error);
      return [];
    }
  }

  async getPlacesByDistrict(districtName, language = 'en') {
    try {
      await this.ensureDataIsAvailable();
      return await databaseService.getPlacesByDistrict(districtName, language);
    } catch (error) {
      console.error('Error getting places by district:', error);
      return [];
    }
  }

  async getPlaceByName(placeName, language = 'en') {
    try {
      await this.ensureDataIsAvailable();
      return await databaseService.getPlaceByName(placeName, language);
    } catch (error) {
      console.error('Error getting place by name:', error);
      return null;
    }
  }

  async getDistrictForPlace(placeName, language = 'en') {
    try {
      await this.ensureDataIsAvailable();
      return await databaseService.getDistrictForPlace(placeName, language);
    } catch (error) {
      console.error('Error getting district for place:', error);
      return null;
    }
  }

  async getAllPlaces(language = 'en') {
    try {
      await this.ensureDataIsAvailable();
      return await databaseService.getAllPlaces(language);
    } catch (error) {
      console.error('Error getting all places:', error);
      return [];
    }
  }
}

export default new DataFetcherService(); 