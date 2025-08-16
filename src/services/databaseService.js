import { clearPlacesJson, placesJsonExists, readPlacesJson, savePlacesJson } from './fileStorage';

class DatabaseService {
  constructor() {
    this.isInitialized = false;
  }

  async init() {
    if (this.isInitialized) return;
    this.isInitialized = true;
    console.log('Database service initialized (FileSystem mode)');
  }

  async shouldFetchData() {
    try {
      // Use file modification time to determine if we should fetch
      const exists = await placesJsonExists();
      if (!exists) return true;
      const fileInfo = await import('expo-file-system').then(m => m.default.getInfoAsync(FileSystem.documentDirectory + 'places.json'));
      if (!fileInfo.exists) return true;
      const lastModified = fileInfo.modificationTime * 1000; // seconds to ms
      const now = Date.now();
      const hoursSinceLastFetch = (now - lastModified) / (1000 * 60 * 60);
      return hoursSinceLastFetch >= 24;
    } catch (error) {
      console.error('Error checking file cache metadata:', error);
      return true;
    }
  }

  async updateCacheMetadata() {
    // No-op: file modification time is used
  }

  async clearAllData() {
    try {
      await clearPlacesJson();
      console.log('All data cleared from file storage');
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  }

  async insertPlaces(placesData) {
    try {
      await savePlacesJson(placesData);
      console.log(`Inserted ${placesData.length} places into file storage`);
    } catch (error) {
      console.error('Error inserting places:', error);
      throw error;
    }
  }

  async getStates(language = 'en') {
    try {
      const places = await readPlacesJson();
      if (!places) return [];
      const stateColumn = language === 'en' ? 'state_en' : 'state_hi';
      const states = [...new Set(places.map(p => p[stateColumn]).filter(Boolean))];
      return states.map(name => ({ name }));
    } catch (error) {
      console.error('Error getting states:', error);
      return [];
    }
  }

  async getDistricts(stateName, language = 'en') {
    try {
      const places = await readPlacesJson();
      if (!places) return [];
      const stateColumn = language === 'en' ? 'state_en' : 'state_hi';
      const districtColumn = language === 'en' ? 'district_en' : 'district_hi';
      const districts = [...new Set(
        places
          .filter(p => p[stateColumn] === stateName)
          .map(p => p[districtColumn])
          .filter(Boolean)
      )];
      return districts;
    } catch (error) {
      console.error('Error getting districts:', error);
      return [];
    }
  }

  async getPlacesByDistrict(districtName, language = 'en') {
    try {
      const places = await readPlacesJson();
      if (!places) return [];
      const districtColumn = language === 'en' ? 'district_en' : 'district_hi';
      const nameColumn = language === 'en' ? 'name_en' : 'name_hi';
      const cityColumn = language === 'en' ? 'city_en' : 'city_hi';
      const addressColumn = language === 'en' ? 'address_en' : 'address_hi';
      return places
        .filter(p => p[districtColumn] === districtName)
        .map(p => ({
          district: p[districtColumn],
          city: p[cityColumn],
          name: p[nameColumn],
          address: p[addressColumn],
          phone: p.phone,
          zip: p.zip,
          lat: p.lat,
          lng: p.lng
        }));
    } catch (error) {
      console.error('Error getting places by district:', error);
      return [];
    }
  }

  async getPlaceByName(placeName, language = 'en') {
    try {
      const places = await readPlacesJson();
      if (!places) return null;
      const nameColumn = language === 'en' ? 'name_en' : 'name_hi';
      const districtColumn = language === 'en' ? 'district_en' : 'district_hi';
      const cityColumn = language === 'en' ? 'city_en' : 'city_hi';
      const addressColumn = language === 'en' ? 'address_en' : 'address_hi';
      const trimmedName = placeName.trim();
      let place = places.find(p => p[nameColumn] === trimmedName);
      if (!place) {
        place = places.find(p => p[nameColumn] && p[nameColumn].includes(trimmedName));
      }
      if (place) {
        return {
          district: place[districtColumn],
          city: place[cityColumn],
          name: place[nameColumn],
          address: place[addressColumn],
          phone: place.phone,
          zip: place.zip,
          lat: place.lat,
          lng: place.lng
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting place by name:', error);
      return null;
    }
  }

  async getDistrictForPlace(placeName, language = 'en') {
    const place = await this.getPlaceByName(placeName, language);
    return place ? place.district : null;
  }

  async getAllPlaces(language = 'en') {
    try {
      const places = await readPlacesJson();
      if (!places) return [];
      const nameColumn = language === 'en' ? 'name_en' : 'name_hi';
      return places.map(p => p[nameColumn]).filter(Boolean);
    } catch (error) {
      console.error('Error getting all places:', error);
      return [];
    }
  }
}

export default new DatabaseService(); 