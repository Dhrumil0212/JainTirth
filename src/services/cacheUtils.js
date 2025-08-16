// utils/cacheUtils.js
import { clearPlacesJson, readPlacesJson, savePlacesJson } from './fileStorage';

// Only export the functions, do not run them at the top level.
// Remove all top-level await and example code.

export { clearPlacesJson, readPlacesJson, savePlacesJson };

// Simple in-memory cache
const cache = new Map();

// Cache utilities for storing and retrieving data
export const getCachedData = async (key) => {
  try {
    const cached = cache.get(key);
    if (cached) {
      // Check if cache is still valid (24 hours)
      const oneDay = 24 * 60 * 60 * 1000;
      if (Date.now() - cached.timestamp < oneDay) {
        return cached.data;
      } else {
        // Remove expired cache
        cache.delete(key);
      }
    }
    return null;
  } catch (error) {
    console.error('Error getting cached data:', error);
    return null;
  }
};

export const setCachedData = async (key, data) => {
  try {
    const cacheData = {
      data,
      timestamp: Date.now()
    };
    cache.set(key, cacheData);
  } catch (error) {
    console.error('Error setting cached data:', error);
  }
};

