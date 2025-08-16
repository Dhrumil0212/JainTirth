import { createContext, useContext, useEffect, useState } from "react";
import { useLanguage } from "../services/LanguageContext";
import { readJsonFile, saveJsonFile } from "./comprehensiveDataService";

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const { language } = useLanguage();
  const [favorites, setFavorites] = useState({
    en: {
      tirth: [],
      mandir: [],
      videsh: []
    },
    hi: {
      tirth: [],
      mandir: [],
      videsh: []
    }
  });

  // Load favorites from file storage on mount
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        console.log('🔍 Loading favorites from file...');
        const savedFavorites = await readJsonFile('favorites.json');
        if (savedFavorites) {
          console.log('🔍 Loaded favorites:', savedFavorites);
          // Ensure videsh category exists for backward compatibility
          const updatedFavorites = {
            en: {
              tirth: savedFavorites.en?.tirth || [],
              mandir: savedFavorites.en?.mandir || [],
              videsh: savedFavorites.en?.videsh || []
            },
            hi: {
              tirth: savedFavorites.hi?.tirth || [],
              mandir: savedFavorites.hi?.mandir || [],
              videsh: savedFavorites.hi?.videsh || []
            }
          };
          setFavorites(updatedFavorites);
        } else {
          console.log('🔍 No saved favorites found, using default structure');
        }
      } catch (error) {
        console.log('🔍 Error loading favorites:', error);
      }
    };

    loadFavorites();
  }, []);

  // Save favorites to file storage whenever they change
  const saveFavorites = async (newFavorites) => {
    try {
      console.log('🔍 Saving favorites:', newFavorites);
      await saveJsonFile('favorites.json', newFavorites);
      console.log('🔍 Favorites saved successfully');
    } catch (error) {
      console.error('🔍 Error saving favorites:', error);
    }
  };

  const toggleFavorite = (item, category) => {
    console.log('🔍 Toggle favorite called:', { item, category, language });
    
    setFavorites(prev => {
      // Ensure the language structure exists
      const currentLangFavorites = prev[language] || { tirth: [], mandir: [], videsh: [] };
      const currentCategory = currentLangFavorites[category] || [];
      
      const isFavorite = currentCategory.includes(item);
      const updatedCategory = isFavorite 
        ? currentCategory.filter(i => i !== item)
        : [...currentCategory, item];
      
      const updated = {
        ...prev,
        [language]: {
          ...currentLangFavorites,
          [category]: updatedCategory
        }
      };
      
      console.log('🔍 Updated favorites:', updated);
      
      // Save to file storage
      saveFavorites(updated);
      
      return updated;
    });
  };

  // Get current language favorites
  const getCurrentLanguageFavorites = () => {
    const currentFavorites = favorites[language] || { tirth: [], mandir: [], videsh: [] };
    console.log('🔍 Getting favorites for language:', language, currentFavorites);
    return currentFavorites;
  };

  return (
    <FavoritesContext.Provider value={{ 
      favorites: getCurrentLanguageFavorites(), 
      toggleFavorite,
      allFavorites: favorites 
    }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => useContext(FavoritesContext);
