import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { MaterialCommunityIcons } from 'react-native-vector-icons';
import { useFavorites } from '../services/FavoritesContext';
import { useLanguage } from '../services/LanguageContext';
import { getMandirPlaceByName, getMandirPlacesByDistrict } from '../services/mandirDataService';
import CustomDrawer from './DrawerMenu';

const MandirDetails = ({ route }) => {
  const { language } = useLanguage();
  const { toggleFavorite, favorites } = useFavorites();
  const [searchQuery, setSearchQuery] = useState('');
  const [places, setPlaces] = useState([]);
  const [filteredPlaces, setFilteredPlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const navigation = useNavigation();
  
  const { districtName, stateName, placeName } = route.params || {};

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // If we have a specific place name, fetch only that place
        if (placeName) {
          const place = await getMandirPlaceByName(placeName, language);
          if (place) {
            setPlaces([place]);
            setFilteredPlaces([place]);
          }
          return;
        }

        // Otherwise, fetch all places in the district
        const placesData = await getMandirPlacesByDistrict(districtName, language);
        console.log(`✅ Loaded ${placesData.length} mandir places for ${districtName}`);
        setPlaces(placesData);
        setFilteredPlaces(placesData);
      } catch (error) {
        console.error("Error fetching mandir places data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (districtName || placeName) {
      fetchData();
    }
  }, [districtName, placeName, language]);

  const handleSearch = (text) => {
    setSearchQuery(text);
    const filtered = places.filter(place =>
      place.name.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredPlaces(filtered);
  };

  const handleToggleFavorite = (placeName) => {
    toggleFavorite(placeName, 'mandir');
  };

  const renderPlaceItem = ({ item }) => {
    const isFavorite = favorites.mandir.includes(item.name);
    
    return (
      <TouchableOpacity 
        style={styles.placeCard}
        onPress={() => navigation.navigate('MandirPlaceDetails', {
          place: item,
          districtName: districtName,
          stateName: stateName
        })}
      >
        <View style={styles.placeInfo}>
          <Text style={styles.placeName}>{item.name}</Text>
          {item.city && (
            <Text style={styles.placeCity}>{item.city}</Text>
          )}
          {item.address && (
            <Text style={styles.placeAddress} numberOfLines={2}>
              {item.address}
            </Text>
          )}
        </View>
        
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => handleToggleFavorite(item.name)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialCommunityIcons 
            name={isFavorite ? "heart" : "heart-outline"} 
            size={wp(5)} 
            color={isFavorite ? "#ff4757" : "#6c757d"} 
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <StatusBar style="dark" />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()} 
              style={styles.backButton}
            >
              <MaterialCommunityIcons name="arrow-left" size={wp(6)} color="#fff" />
            </TouchableOpacity>

            <Text style={styles.title}>
              {language === 'en' ? `${districtName} - Places` : `${districtName} - स्थान`}
            </Text>

            <View style={{ width: wp(10) }} />
          </View>

          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>
              {language === 'en' ? 'Loading places...' : 'स्थान लोड हो रहे हैं...'}
            </Text>
          </View>
        </SafeAreaView>

        <CustomDrawer
          isVisible={isDrawerVisible}
          onClose={() => setIsDrawerVisible(false)}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.backButton}
          >
            <MaterialCommunityIcons name="arrow-left" size={wp(6)} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.title}>
            {language === 'en' ? `${districtName} - Places` : `${districtName} - स्थान`}
          </Text>

          <TouchableOpacity 
            onPress={() => setIsDrawerVisible(true)} 
            style={styles.menuButton}
          >
            <MaterialCommunityIcons name="menu" size={wp(6)} color="#fff" />
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.searchBar}
          placeholder={language === 'en' ? 'Search places...' : 'स्थान खोजें...'}
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={handleSearch}
        />

        <FlatList
          data={filteredPlaces}
          renderItem={renderPlaceItem}
          keyExtractor={(item) => item.name}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {language === 'en' ? 'No places found' : 'कोई स्थान नहीं मिला'}
            </Text>
          }
        />
      </SafeAreaView>

      <CustomDrawer
        isVisible={isDrawerVisible}
        onClose={() => setIsDrawerVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f3f6',
    marginTop: hp(3),
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: wp(4)
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: hp(2),
    marginBottom: hp(1),
  },
  backButton: {
    backgroundColor: '#007bff',
    padding: wp(2),
    borderRadius: wp(1),
  },
  menuButton: {
    backgroundColor: '#007bff',
    padding: wp(2),
    borderRadius: wp(1),
  },
  title: {
    fontSize: wp(5),
    fontWeight: 'bold',
    color: '#343a40',
    flex: 1,
    textAlign: 'center',
  },
  searchBar: {
    height: hp(6),
    backgroundColor: '#fff',
    borderRadius: wp(2),
    paddingHorizontal: wp(4),
    marginBottom: hp(2),
    fontSize: wp(4),
  },
  list: {
    paddingBottom: hp(2),
  },
  placeCard: {
    backgroundColor: '#ffffff',
    borderRadius: wp(2),
    padding: wp(4),
    marginBottom: hp(1.8),
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  placeInfo: {
    flex: 1,
  },
  placeName: {
    fontSize: wp(4.8),
    fontWeight: 'bold',
    color: '#000',
    marginBottom: hp(0.5),
  },
  placeCity: {
    fontSize: wp(3.5),
    color: '#6c757d',
    marginBottom: hp(0.5),
  },
  placeAddress: {
    fontSize: wp(3.5),
    color: '#6c757d',
  },
  favoriteButton: {
    padding: wp(1),
  },
  emptyText: {
    textAlign: 'center',
    fontSize: wp(4),
    color: '#6c757d',
    marginTop: hp(10),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: wp(4.5),
    color: '#6c757d',
    textAlign: 'center',
  },
});

export default MandirDetails;