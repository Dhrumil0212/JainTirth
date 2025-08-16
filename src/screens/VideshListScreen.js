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
import { useLanguage } from '../services/LanguageContext';
import { debugVideshService, getTestVideshData, getVideshCountries } from '../services/videshDataService';
import CustomDrawer from './DrawerMenu';

const VideshListScreen = () => {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [countries, setCountries] = useState([]);
  const [filteredCountries, setFilteredCountries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const navigation = useNavigation();

  const fetchData = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Fetching Videsh countries data...');
      
      // Debug the service first
      console.log('🔍 Debugging videsh service...');
      const debugResult = await debugVideshService();
      console.log('Debug result:', debugResult);
      
      // Use the new caching service
      const countriesData = await getVideshCountries(language);
      
      console.log(`✅ Loaded ${countriesData.length} Videsh countries`);
      console.log('Sample countries:', countriesData.slice(0, 3).map(s => s.name));
      console.log('All countries:', countriesData.map(c => c.name));
      
      // If no countries loaded, use test data
      if (countriesData.length === 0) {
        console.log('⚠️ No countries loaded, using test data');
        const testData = getTestVideshData()[language] || [];
        setCountries(testData);
        setFilteredCountries(testData);
      } else {
        setCountries(countriesData);
        setFilteredCountries(countriesData);
      }
    } catch (error) {
      console.error("Error fetching Videsh data:", error);
      // Set test data on error to show the UI works
      console.log('⚠️ Using test data due to error');
      const testData = getTestVideshData()[language] || [];
      setCountries(testData);
      setFilteredCountries(testData);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    console.log('🔄 Force refreshing videsh data...');
    try {
      setIsLoading(true);
      const refreshedData = await shouldRefreshVideshData(language);
      setCountries(refreshedData);
      setFilteredCountries(refreshedData);
      console.log(`✅ Refreshed ${refreshedData.length} countries`);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [language]);

  const handleSearch = (text) => {
    setSearchQuery(text);
    const filtered = countries.filter(country =>
      country.name.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredCountries(filtered);
  };

  const renderCountryCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.countryCard}
      onPress={() => navigation.navigate('VideshStatesList', {
        countryName: item.name
      })}
    >
      <Text style={styles.countryName}>{item.name}</Text>
      <Text style={styles.countryCount}>
        {language === 'en' ? `${item.places?.length || 0} places` : `${item.places?.length || 0} स्थान`}
      </Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <StatusBar style="dark" />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={() => setIsDrawerVisible(true)} 
              style={styles.menuButton}
            >
              <MaterialCommunityIcons name="menu" size={wp(6)} color="#fff" />
            </TouchableOpacity>

            <Text style={styles.title}>{language === 'en' ? 'Countries' : 'देश'}</Text>

            <View style={{ width: wp(10) }} />
          </View>

          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>
              {language === 'en' ? 'Loading countries...' : 'देश लोड हो रहे हैं...'}
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
            onPress={() => setIsDrawerVisible(true)} 
            style={styles.menuButton}
          >
            <MaterialCommunityIcons name="menu" size={wp(6)} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.title}>{language === 'en' ? 'Countries' : 'देश'}</Text>

          <TouchableOpacity 
            // onPress={handleRefresh} 
            // style={styles.refreshButton}
          >
            {/* <MaterialCommunityIcons name="refresh" size={wp(6)} color="#fff" /> */}
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.searchBar}
          placeholder={language === 'en' ? 'Search countries...' : 'देश खोजें...'}
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={handleSearch}
        />

        <FlatList
          data={filteredCountries}
          renderItem={renderCountryCard}
          keyExtractor={(item) => item.name}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {language === 'en' ? 'No countries found' : 'कोई देश नहीं मिला'}
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
  menuButton: {
    backgroundColor: '#007bff',
    padding: wp(2),
    borderRadius: wp(1),
  },
  title: {
    fontSize: wp(6),
    fontWeight: 'bold',
    color: '#343a40',
  },
  // refreshButton: {
  //   backgroundColor: '#007bff',
  //   padding: wp(2),
  //   borderRadius: wp(1),
  // },
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
  countryCard: {
    backgroundColor: '#ffffff',
    borderRadius: wp(2),
    padding: wp(4),
    marginBottom: hp(1.8),
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  countryName: {
    fontSize: wp(4.8),
    fontWeight: 'bold',
    color: '#000',
    marginBottom: hp(0.5),
  },
  countryCount: {
    fontSize: wp(3.5),
    color: '#6c757d',
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

export default VideshListScreen; 