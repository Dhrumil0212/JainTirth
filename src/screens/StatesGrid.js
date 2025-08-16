import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { MaterialCommunityIcons } from 'react-native-vector-icons';
import { useLanguage } from '../services/LanguageContext';
import { getStates, initializeData } from '../services/comprehensiveDataService';
import CustomDrawer from './DrawerMenu';

const StatesGrid = ({ useNewDataSource = false }) => {
  const [states, setStates] = useState([]);
  const [allPlaces, setAllPlaces] = useState([]);
  const [filteredStates, setFilteredStates] = useState([]);
  const [filteredPlaces, setFilteredPlaces] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const { language } = useLanguage();
  const navigation = useNavigation();

  const fetchStatesAndPlaces = async () => {
    try {
      setLoading(true);
      
      // Initialize data (fetch if needed)
      await initializeData();
      
      // Load states from local storage
      const statesData = await getStates(language);
      setStates(statesData);
      
      // Collect all places for search
      const allPlacesList = [];
      statesData.forEach(state => {
        if (state.places) {
          allPlacesList.push(...state.places);
        }
      });
      setAllPlaces(allPlacesList);
      
      setFilteredStates(statesData);
    } catch (error) {
      console.error('Error loading states:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatesAndPlaces();
  }, [language]);

  const handleSearch = (text) => {
    setSearchQuery(text);
    
    if (!text.trim()) {
      setFilteredStates(states);
      setFilteredPlaces([]);
      return;
    }

    const query = text.toLowerCase();
    
    // Search in places
    const matchingPlaces = allPlaces.filter(place =>
      place.toLowerCase().includes(query)
    );
    setFilteredPlaces(matchingPlaces);

    // Search in states
    const matchingStates = states.filter(state =>
      state.name.toLowerCase().includes(query)
    );
    setFilteredStates(matchingStates);
  };



  const renderStateCard = ({ item }) => (
    <TouchableOpacity
      style={[styles.cardContainer, searchQuery ? styles.cardContainerList : styles.cardContainerGrid]}
      onPress={() => navigation.navigate("PlacesGrid", { stateName: item.name, language })}
    >
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.cardImage} />
      ) : (
        <View style={styles.placeholderImage}>
          <Text style={styles.placeholderText}>{item.name}</Text>
        </View>
      )}
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.name}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderPlaceCard = ({ item }) => (
    <TouchableOpacity
      style={[styles.cardContainer, styles.cardContainerList]}
      onPress={() => navigation.navigate("PlaceDetails", { placeName: item, language })}
    >
      <View style={styles.cardContent}>
        <Text style={styles.placeCardTitle}>{item}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeAreaView}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => setIsDrawerVisible(true)} 
            style={styles.hamburgerIcon}
          >
            <MaterialCommunityIcons name="menu" size={wp(6)} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.heading}>{language === 'en' ? 'Bharat' : 'भारत'}</Text>

          <View style={{ width: wp(10) }} />
        </View>

        <TextInput
          style={styles.searchInput}
          placeholder={language === 'en' ? "Search" : "राज्य या स्थान खोजें"}
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={handleSearch}
        />

        {searchQuery ? (
          <View>
            {filteredPlaces.slice(0, 5).length > 0 && (
              <FlatList
                data={filteredPlaces.slice(0, 5)}
                renderItem={renderPlaceCard}
                keyExtractor={(item, index) => item + index}
                contentContainerStyle={styles.listWrapper}
              />
            )}
          </View>
        ) : (
          filteredStates.length > 0 && (
            <FlatList
              data={filteredStates}
              renderItem={renderStateCard}
              numColumns={2}
              keyExtractor={(item, index) => item.name || index.toString()}
              contentContainerStyle={styles.grid}
            />
          )
        )}
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
    backgroundColor: '#f8f9fa',
    marginTop: hp(3),

  },
  safeAreaView: {
    flex: 1,
    paddingHorizontal: wp(4),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: hp(2),
    marginBottom: hp(1),
  },
  heading: {
    fontSize: wp(6),
    fontWeight: 'bold',
    color: '#343a40',
    textAlign: 'center',
    flex: 1,
  },
  hamburgerIcon: {
    backgroundColor: '#007bff',
    padding: wp(2),
    borderRadius: wp(1),
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: wp(3),
    paddingVertical: wp(2),
    borderRadius: wp(1),
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleButtonText: {
    color: '#fff',
    fontSize: wp(4.5),
    fontWeight: 'bold',
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: wp(1),
    padding: wp(3),
    marginVertical: hp(1),
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: wp(4),
    color: '#333',
  },
  listWrapper: {
    paddingBottom: hp(2),
  },
  grid: {
    paddingBottom: hp(2),
  },
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: wp(2),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: wp(1),
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cardContainerGrid: {
    width: wp(42),
    height: hp(27),
    margin: wp(2),
  },
  cardContainerList: {
    width: '100%',
    height: hp(6),
    marginBottom: hp(1),
    justifyContent: 'center',
  },
  cardImage: {
    width: '100%',
    height: hp(20),
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: hp(20),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e9ecef',
  },
  placeholderText: {
    color: '#6c757d',
    fontSize: wp(3.5),
    fontWeight: 'bold',
  },
  cardContent: {
    padding: wp(2),
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: wp(4.5),
    color: '#343a40',
    textAlign: 'center',
    fontWeight: 'bold',
    maxWidth: '100%',
    marginTop: hp(1)
  },
  placeCardTitle: {
    fontSize: wp(4.5),
    fontWeight: '600',
    color: '#343a40',
    textAlign: 'center',
    paddingHorizontal: wp(2),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
});

export default StatesGrid;