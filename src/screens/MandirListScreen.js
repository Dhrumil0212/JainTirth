import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
    FlatList,
    Image,
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
import { getMandirStates } from '../services/mandirDataService';
import CustomDrawer from './DrawerMenu';

const StatesGrid = () => {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [states, setStates] = useState([]);
  const [filteredStates, setFilteredStates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        console.log('🔄 Fetching Mandir states data...');
        
        // Use the new caching service
        const statesData = await getMandirStates(language);
        
        console.log(`✅ Loaded ${statesData.length} Mandir states`);
        console.log('Sample states:', statesData.slice(0, 3).map(s => s.name));
        setStates(statesData);
        setFilteredStates(statesData);
      } catch (error) {
        console.error("Error fetching Mandir data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [language]);

  const handleSearch = (text) => {
    setSearchQuery(text);
    const filtered = states.filter(state =>
      state.name.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredStates(filtered);
  };



  const renderStateCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.cardContainer}
      onPress={() => navigation.navigate('DistrictList', {
        stateName: item.name,
        stateImage: item.image
      })}
    >
      {item.image ? (
        <Image 
          source={{ uri: item.image }} 
          style={styles.cardImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>
            {language === 'en' ? 'No Image' : 'चित्र उपलब्ध नहीं'}
          </Text>
        </View>
      )}
      <Text style={styles.stateName}>{item.name}</Text>
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

            <Text style={styles.title}>{language === 'en' ? 'States' : 'राज्य'}</Text>

            <View style={{ width: wp(10) }} />
          </View>

          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>
              {language === 'en' ? 'Loading states...' : 'राज्य लोड हो रहे हैं...'}
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

          <Text style={styles.title}>{language === 'en' ? 'States' : 'राज्य'}</Text>

          <View style={{ width: wp(10) }} />
        </View>

        <TextInput
          style={styles.searchBar}
          placeholder={language === 'en' ? 'Search states...' : 'राज्य खोजें...'}
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={handleSearch}
        />

        <FlatList
          data={filteredStates}
          renderItem={renderStateCard}
          keyExtractor={(item) => item.name}
          numColumns={2}
          contentContainerStyle={styles.grid}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {language === 'en' ? 'No states found' : 'कोई राज्य नहीं मिला'}
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
    backgroundColor: '#f8f9fa',
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
  languageButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: wp(3),
    paddingVertical: wp(2),
    borderRadius: wp(1),
  },
  languageText: {
    color: '#fff',
    fontSize: wp(4.5),
    fontWeight: 'bold',
  },
  searchBar: {
    height: hp(6),
    backgroundColor: '#fff',
    borderRadius: wp(2),
    paddingHorizontal: wp(4),
    marginBottom: hp(2),
    fontSize: wp(4),
    // elevation: 2
  },
  cardContainer: {
    flex: 1,
    margin: wp(2),
    backgroundColor: '#fff',
    borderRadius: wp(2),
    overflow: 'hidden',
    elevation: 3
  },
  cardImage: {
    width: '100%',
    height: hp(20),
    resizeMode: 'cover',

  },
  placeholder: {
    width: '100%',
    height: hp(20),
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center'
  },
  placeholderText: {
    color: '#6c757d',
    fontSize: wp(3.5)
  },
  stateName: {
    padding: wp(3),
    fontSize: wp(4.2),
    textAlign: 'center',
    color: '#343a40',
    fontWeight: 'bold',
  },
  grid: {
    paddingBottom: hp(2),
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

export default StatesGrid;