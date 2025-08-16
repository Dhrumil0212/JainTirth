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
import { getDistricts, initializeData } from '../services/comprehensiveDataService';
import CustomDrawer from './DrawerMenu';

const DistrictList = ({ route }) => {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [districts, setDistricts] = useState([]);
  const [filteredDistricts, setFilteredDistricts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const navigation = useNavigation();
  
  const { stateName } = route.params || {};

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        console.log(`🔄 Fetching districts for state: ${stateName}`);
        
        // Initialize data (fetch if needed)
        await initializeData();
        
        // Use comprehensive data service instead of database service
        const districtsData = await getDistricts(stateName, language);
        
        console.log(`✅ Loaded ${districtsData.length} districts`);
        setDistricts(districtsData);
        setFilteredDistricts(districtsData);
      } catch (error) {
        console.error("Error fetching districts data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (stateName) {
      fetchData();
    }
  }, [stateName, language]);

  const handleSearch = (text) => {
    setSearchQuery(text);
    const filtered = districts.filter(district =>
      district.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredDistricts(filtered);
  };

  const renderDistrictItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.districtCard}
      onPress={() => navigation.navigate('MandirDetails', {
        districtName: item,
        stateName: stateName
      })}
    >
      <Text style={styles.districtName}>{item}</Text>
    </TouchableOpacity>
  );

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
              {language === 'en' ? `${stateName} - Districts` : `${stateName} - जिले`}
            </Text>

            <View style={{ width: wp(10) }} />
          </View>

          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>
              {language === 'en' ? 'Loading districts...' : 'जिले लोड हो रहे हैं...'}
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
            {language === 'en' ? `${stateName} - Districts` : `${stateName} - जिले`}
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
          placeholder={language === 'en' ? 'Search districts...' : 'जिले खोजें...'}
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={handleSearch}
        />

        <FlatList
          data={filteredDistricts}
          renderItem={renderDistrictItem}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {language === 'en' ? 'No districts found' : 'कोई जिला नहीं मिला'}
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
  districtCard: {
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
  districtName: {
    fontSize: wp(4.8),
    fontWeight: 'bold',
    color: '#000',
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

export default DistrictList;
