import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
  FlatList,
  Image,
  LayoutAnimation,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import { HeartIcon } from 'react-native-heroicons/solid';
import { useLanguage } from '../services/LanguageContext';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FavoritesScreen = () => {
  const [favorites, setFavorites] = useState({ tirth: [], mandir: [] });
  const [expanded, setExpanded] = useState({ tirth: true, mandir: true });
  const [imageMapping, setImageMapping] = useState({});
  const navigation = useNavigation();
  const { language } = useLanguage();

  const favoritesKey = language === 'en' ? 'favorites_en' : 'favorites_hi';
  const mandirKey = language === 'en' ? 'favorites_mandir_en' : 'favorites_mandir_hi';

  const fetchImageMapping = async () => {
    try {
      const apiKey = "AIzaSyC1Fv_yJ-w7ifM4HIYr0GOG7Z5472GW1ZE";
      const spreadsheetId = "1CIfzUskea7CaZg9H5f8bi_ABjPMVrgUF29tmyeXkXyg";
      const range = "ImageMapping!A1:Z100000";

      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`
      );
      const data = await response.json();

      if (!data.values) return;

      const mapping = {};
      const headers = data.values[0];
      const stateIndex = headers.indexOf(language === 'en' ? "State" : "Rajya");
      const placeIndex = headers.indexOf(language === 'en' ? "Place" : "Tirth");
      const imageIndex = headers.indexOf("Link");

      data.values.slice(1).forEach((row) => {
        const state = row[stateIndex];
        const place = row[placeIndex];
        const link = row[imageIndex];

        if (!state || !place || !link) return;

        if (!mapping[state]) mapping[state] = {};
        if (!mapping[state][place]) mapping[state][place] = [];

        mapping[state][place].push(link);
      });

      setImageMapping(mapping);
    } catch (e) {
      console.error("Error loading image mapping:", e);
    }
  };

  const loadFavorites = async () => {
    try {
      const [storedTirth, storedMandir] = await Promise.all([
        AsyncStorage.getItem(favoritesKey),
        AsyncStorage.getItem(mandirKey)
      ]);

      setFavorites({
        tirth: storedTirth ? JSON.parse(storedTirth) : [],
        mandir: storedMandir ? JSON.parse(storedMandir) : []
      });
    } catch (error) {
      console.error("Failed to load favorites:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchImageMapping();
      loadFavorites();
    }, [language])
  );

  const toggleSection = (key) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getImageUrlForPlace = (placeName) => {
    for (const state in imageMapping) {
      if (imageMapping[state][placeName]?.[0]) {
        return imageMapping[state][placeName][0];
      }
    }
    return null;
  };

  const renderCard = (item, category) => {
    const imageUrl = getImageUrlForPlace(item);

    const navigateToDetails = () => {
      console.log(`Navigating to ${category === 'mandir' ? 'MandirDetails' : 'PlaceDetails'} with:`, item);
      if (category === 'mandir') {
        navigation.navigate('MandirDetails', { districtName: item,  scrollTo: item, language });
      } else {
        navigation.navigate('PlaceDetails', { placeName: item, language });
      }
    };

    return (
      <TouchableOpacity style={styles.cardContainer} onPress={navigateToDetails}>
        <View style={styles.cardContent}>
          {imageUrl && <Image source={{ uri: imageUrl }} style={styles.thumbnail} />}
          <Text style={styles.cardTitle}>{item}</Text>
        </View>
        <HeartIcon size={24} color="red" />
      </TouchableOpacity>
    );
  };

  const renderSection = (title, data, key) => (
    <View>
      <TouchableOpacity onPress={() => toggleSection(key)} style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {language === 'en' ? title : (key === 'tirth' ? 'तीर्थ' : 'मंदिर')}
        </Text>
        <Text style={styles.expandIcon}>{expanded[key] ? '−' : '+'}</Text>
      </TouchableOpacity>

      {expanded[key] && data.length > 0 ? (
        <FlatList
          data={data}
          keyExtractor={(item, index) => item + index}
          renderItem={({ item }) => renderCard(item, key)}
        />
      ) : expanded[key] && (
        <Text style={styles.noFavoritesText}>
          {language === 'en' ? 'No Favorites Yet' : 'अभी तक कोई पसंदीदा नहीं'}
        </Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>
        {language === 'en' ? 'Favorites' : 'पसंदीदा'}
      </Text>

      {renderSection("Tirth", favorites.tirth, "tirth")}
      {renderSection("Mandir", favorites.mandir, "mandir")}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
    backgroundColor: "#f8f9fa",
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#e0e0e0",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 6,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  expandIcon: {
    fontSize: 20,
    fontWeight: "bold",
  },
  cardContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    marginVertical: 5,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 2,
    alignItems: 'center',
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "500",
    marginLeft: 10,
  },
  thumbnail: {
    width: 40,
    height: 40,
    borderRadius: 4,
    backgroundColor: '#ddd',
  },
  noFavoritesText: {
    fontSize: 16,
    color: "#6c757d",
    padding: 15,
    textAlign: "center",
  },
});

export default FavoritesScreen;
