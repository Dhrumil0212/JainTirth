import { useNavigation } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
    FlatList,
    Image,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import { HeartIcon } from "react-native-heroicons/solid";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFavorites } from "../services/FavoritesContext"; // Import favorites context
import { getPlacesByState as getPlacesByStateEng } from "../services/getStateENG"; // Fetch places for the state (English)
import { getPlacesByState as getPlacesByStateHin } from "../services/getStateHIN"; // Fetch places for the state (Hindi)
import { useLanguage } from "../services/LanguageContext"; // Import language context

// Function to fetch image mapping data from Google Sheets
const fetchImageMappingFromGoogleSheets = async (language) => {
  try {
    const apiKey = "AIzaSyC1Fv_yJ-w7ifM4HIYr0GOG7Z5472GW1ZE"; // Your API key
    const spreadsheetId = "1CIfzUskea7CaZg9H5f8bi_ABjPMVrgUF29tmyeXkXyg";
    const range = "ImageMapping!A1:Z100000"; // Adjust the range if needed

    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`
    );
    const data = await response.json();

    if (!data.values) {
      console.error("No data found in the Google Sheets response");
      return {};
    }

    const imageMapping = {};
    const headerRow = data.values[0];
    const stateColumnIndex = headerRow.indexOf("State");
    const rajyaColumnIndex = headerRow.indexOf("Rajya"); // Hindi equivalent of State
    const placeColumnIndex = headerRow.indexOf("Place");
    const tirthColumnIndex = headerRow.indexOf("Tirth"); // Hindi equivalent of Place
    const imageColumnIndex = headerRow.indexOf("Link");

    if (
      stateColumnIndex === -1 ||
      rajyaColumnIndex === -1 ||
      placeColumnIndex === -1 ||
      tirthColumnIndex === -1 ||
      imageColumnIndex === -1
    ) {
      console.error("Required columns not found in the sheet.");
      return {};
    }

    data.values.slice(1).forEach((row) => {
      const stateName = language === 'en' ? row[stateColumnIndex] : row[rajyaColumnIndex]; // Use Rajya for Hindi
      const placeName = language === 'en' ? row[placeColumnIndex] : row[tirthColumnIndex]; // Use Tirth for Hindi
      const imageUrl = row[imageColumnIndex];

      if (stateName && placeName && imageUrl) {
        if (!imageMapping[stateName]) {
          imageMapping[stateName] = {};
        }
        if (!imageMapping[stateName][placeName]) {
          imageMapping[stateName][placeName] = [];
        }
        imageMapping[stateName][placeName].push(imageUrl);
      }
    });

    // console.log("Image Mapping:", imageMapping); // Debug log
    return imageMapping;
  } catch (error) {
    console.error("Error fetching image mapping from Google Sheets:", error);
    return {};
  }
};


const PlacesGrid = ({ route }) => {
  const { stateName } = route.params;
  const { language } = useLanguage(); // Access language context
  const { favorites, toggleFavorite } = useFavorites(); // Use favorites context
  const [places, setPlaces] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [imageMapping, setImageMapping] = useState({});
  const navigation = useNavigation();

  // Dynamically select the correct function based on language
  const getPlacesByState = language === 'en' ? getPlacesByStateEng : getPlacesByStateHin;

  useEffect(() => {
    // Fetch image mapping data
    const fetchData = async () => {
      const imageMappingData = await fetchImageMappingFromGoogleSheets(language);
      setImageMapping(imageMappingData);
  
      // Fetch places data
      const placesData = await getPlacesByState(stateName);
      if (Array.isArray(placesData) && placesData.length > 0) {
        const transformedData = placesData.map((placeName) => {
          const decodedPlaceName = decodeURIComponent(placeName);
          const placeImage = imageMappingData[stateName]?.[decodedPlaceName]?.[0] || null;
          return {
            name: decodedPlaceName,
            image: placeImage ? decodeURIComponent(placeImage) : null,
          };
        });
  
        const uniquePlacesMap = new Map();
        transformedData.forEach((place) => {
          const name = place.name;
          if (name && !uniquePlacesMap.has(name)) {
            uniquePlacesMap.set(name, place);
          }
        });
  
        const uniquePlaces = Array.from(uniquePlacesMap.values());
        setPlaces(uniquePlaces);
      }
    };
  
    fetchData();
  }, [stateName, language]);

  const filteredPlaces = places.filter((place) =>
    place.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderPlaceCard = ({ item }) => {
    const isFavorite = favorites.tirth.includes(item.name); // Check if place is in tirth favorites
    console.log('🔍 Rendering place card:', { name: item.name, isFavorite, favorites });

    return (
      <TouchableOpacity
        style={styles.cardContainer}
        onPress={() =>
          navigation.navigate("PlaceDetails", { // Use "PlaceDetails" for both English and Hindi
            placeName: item.name,
            stateName: stateName,
            language: language, // Pass the current language to PlaceDetails
          })
        }
      >
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.cardImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>Image not available</Text>
          </View>
        )}
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <TouchableOpacity 
            onPress={() => {
              console.log('🔍 Toggle favorite pressed for:', item.name);
              toggleFavorite(item.name, 'tirth');
            }} 
            style={styles.favoriteButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <HeartIcon size={24} color={isFavorite ? "red" : "gray"} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const sortedPlaces = filteredPlaces.sort((a, b) => {
    const isAFavorite = favorites.tirth.includes(a.name);
    const isBFavorite = favorites.tirth.includes(b.name);
    if (isAFavorite && !isBFavorite) {
      return -1; // Move favorites to the top
    }
    if (!isAFavorite && isBFavorite) {
      return 1; // Keep non-favorites below
    }
    return 0; // Keep the order unchanged if both are either favorite or non-favorite
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeAreaView}>
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <View style={styles.content}>
            <Text style={styles.heading}>{stateName} {language === 'en' ? 'Tirthkshetras' : 'तीर्थक्षेत्र'}</Text>

            {/* Search Bar */}
            <TextInput
              style={styles.searchBar}
              placeholder={language === 'en' ? "Search" : "तीर्थक्षेत्र खोजें"}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />

            {/* List */}
            <View style={styles.listContainer}>
              {filteredPlaces.length === 0 && searchQuery.length > 0 ? (
                <Text style={styles.noResults}>{language === 'en' ? 'No places found' : 'कोई स्थान नहीं मिला'}</Text>
              ) : (
                <FlatList
                  data={sortedPlaces}
                  renderItem={renderPlaceCard}
                  numColumns={2}
                  keyExtractor={(item) => item.name}
                  contentContainerStyle={styles.grid}
                />
              )}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    paddingHorizontal: wp(4),
  },
  safeAreaView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  heading: {
    fontSize: wp(6),
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: hp(2),
    color: "#343a40",
  },
  grid: {
    alignItems: "flex-start",
    justifyContent: "flex-start",
    marginTop: hp(2),
  },
  cardContainer: {
    backgroundColor: "#fff",
    borderRadius: wp(3),
    margin: wp(2),
    width: wp(42),
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: wp(2),
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cardImage: {
    width: "100%",
    height: hp(20),
    resizeMode: "cover",
  },
  placeholderImage: {
    width: "100%",
    height: hp(20),
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e9ecef",
  },
  placeholderText: {
    color: "#6c757d",
    fontSize: wp(4),
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: wp(2),
    paddingVertical: hp(1),
  },
  cardTitle: {
    fontSize: wp(4),
    fontWeight: "600",
    color: "#343a40",
    textAlign: "left",
    flexWrap: "wrap",
    flex: 1,
    marginRight: wp(2),
    paddingBottom: hp(0.5),
  },
  favoriteButton: {
    justifyContent: "center",
    alignItems: "center",
  },
  searchBar: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginVertical: hp(2),
    fontSize: wp(4),
  },
  noResults: {
    fontSize: wp(4),
    color: "#6c757d",
    textAlign: "center",
    marginTop: hp(2),
  },
  listContainer: {
    flex: 1,
    marginTop: hp(2),
  },
});

export default PlacesGrid;