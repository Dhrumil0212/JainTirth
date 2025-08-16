import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useLanguage } from '../services/LanguageContext';
import { getVideshPlaceByName } from '../services/videshDataService';
import DrawerMenu from './DrawerMenu';

// Helper functions to detect URLs and emails
const isURL = (text) => {
  if (!text) return false;
  const urlPattern = /^(https?:\/\/|www\.)/i;
  return urlPattern.test(text.trim());
};

const isEmail = (text) => {
  if (!text) return false;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(text.trim());
};

const isMapURL = (text) => {
  if (!text) return false;
  const lowerText = text.toLowerCase();
  return lowerText.includes('map') || lowerText.includes('maps.google') || lowerText.includes('maps?');
};

const VideshPlaceDetails = ({ route }) => {
  const navigation = useNavigation();
  const { language } = useLanguage();
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const { place: routePlace, placeName } = route.params || {};
  const [place, setPlace] = useState(routePlace || null);
  const [isLoading, setIsLoading] = useState(false);

  const FIELD_ORDER = ['country', 'state', 'district', 'city', 'address', 'phone', 'zip'];
  const FIELD_LABELS = {
    country: { en: 'Country', hi: 'देश' },
    state: { en: 'State', hi: 'राज्य' },
    district: { en: 'District', hi: 'जिला' },
    city: { en: 'City', hi: 'शहर' },
    address: { en: 'Address', hi: 'पता' },
    phone: { en: 'Phone', hi: 'संपर्क' },
    zip: { en: 'ZIP Code', hi: 'पिन कोड' }
  };
  const FIELD_ICONS = {
    country: 'earth',
    state: 'map-marker',
    district: 'map-marker-radius',
    city: 'city',
    address: 'map-marker-outline',
    phone: 'phone',
    zip: 'map-marker-check'
  };

  useEffect(() => {
    const loadPlace = async () => {
      if (!place && placeName) {
        try {
          setIsLoading(true);
          const fetched = await getVideshPlaceByName(placeName, language);
          setPlace(fetched);
        } catch (error) {
          console.log('Error loading videsh place by name:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadPlace();
  }, [placeName, language, place]);

  const handleCall = () => {
    if (place?.phone) {
      Linking.openURL(`tel:${place.phone}`);
    } else {
      Alert.alert(
        language === 'en' ? 'No Phone Number' : 'कोई फोन नंबर नहीं',
        language === 'en' ? 'Phone number not available' : 'फोन नंबर उपलब्ध नहीं है'
      );
    }
  };

  const handleMap = () => {
    if (place?.lat && place?.lng) {
      const url = `https://www.google.com/maps?q=${place.lat},${place.lng}`;
      Linking.openURL(url);
    } else {
      Alert.alert(
        language === 'en' ? 'Location Not Available' : 'स्थान उपलब्ध नहीं',
        language === 'en' ? 'Location coordinates not available' : 'स्थान के निर्देशांक उपलब्ध नहीं हैं'
      );
    }
  };

  const renderInfoRow = (label, value, icon) => {
    if (!value) return null;
    
    const isUrlValue = isURL(value);
    const isEmailValue = isEmail(value);
    const isMapUrlValue = isMapURL(value);
    
    // Skip rendering if it's a map URL
    if (isMapUrlValue) return null;
    
    return (
      <View style={styles.infoRow}>
        <View style={styles.infoLabelContainer}>
          <MaterialCommunityIcons name={icon} size={wp(4)} color="#007bff" />
          <Text style={styles.infoLabel}>{label}</Text>
        </View>
        {isEmailValue ? (
          <TouchableOpacity onPress={() => Linking.openURL(`mailto:${value}`)}>
            <Text style={[styles.infoValue, styles.linkText]}>{value}</Text>
          </TouchableOpacity>
        ) : isUrlValue ? (
          <TouchableOpacity onPress={() => {
            const url = value.startsWith('www.') ? `https://${value}` : value;
            Linking.openURL(url);
          }}>
            <Text style={[styles.infoValue, styles.linkText]}>{value}</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.infoValue}>{value}</Text>
        )}
      </View>
    );
  };

  const renderAllInfoRows = () => {
    if (!place) return null;

    const rows = [];

    // Known fields in desired order
    FIELD_ORDER.forEach((key) => {
      const value = place[key];
      if (value) {
        const label = FIELD_LABELS[key]?.[language] || key;
        const icon = FIELD_ICONS[key] || 'information-outline';
        const row = renderInfoRow(label, value, icon);
        if (row) rows.push(row);
      }
    });

    // Any additional fields present in data (excluding name/lat/lng and already rendered ones)
    Object.keys(place).forEach((key) => {
      if (key === 'name' || key === 'lat' || key === 'lng' || FIELD_ORDER.includes(key)) return;
      const value = place[key];
      if (!value) return;
      // Skip map URL fields
      if (isMapURL(value)) return;
      const humanLabel = key
        .replace(/_/g, ' ')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/\b\w/g, (c) => c.toUpperCase());
      const row = renderInfoRow(humanLabel, value, 'information-outline');
      if (row) rows.push(row);
    });

    return rows;
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeAreaView}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons name="arrow-left" size={wp(6)} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.heading}>
            {language === 'en' ? 'Place Details' : 'स्थान का विवरण'}
          </Text>

          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setIsDrawerVisible(true)}
          >
            <MaterialCommunityIcons name="menu" size={wp(6)} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {!place && (isLoading ? (
            <View style={{ padding: wp(4) }}>
              <Text style={{ textAlign: 'center' }}>
                {language === 'en' ? 'Loading place details...' : 'स्थान विवरण लोड हो रहा है...'}
              </Text>
            </View>
          ) : (
            <View style={{ padding: wp(4) }}>
              <Text style={{ textAlign: 'center' }}>
                {language === 'en' ? 'Place not found.' : 'स्थान नहीं मिला।'}
              </Text>
            </View>
          ))}

          {place && (
          <View>
          <View style={styles.card}>
            <Text style={styles.placeName}>{place?.name}</Text>
            
            {renderAllInfoRows()}
          </View>
          <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
                <MaterialCommunityIcons name="phone" size={wp(5)} color="#fff" />
                <Text style={styles.actionButtonText}>
                  {language === 'en' ? 'Call' : 'कॉल करें'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton} onPress={handleMap}>
                <MaterialCommunityIcons name="map-marker" size={wp(5)} color="#fff" />
                <Text style={styles.actionButtonText}>
                  {language === 'en' ? 'View on Map' : 'मानचित्र पर देखें'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          )}
        </ScrollView>
      </SafeAreaView>

      <DrawerMenu isVisible={isDrawerVisible} onClose={() => setIsDrawerVisible(false)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa'
  },
  safeAreaView: {
    flex: 1,
    paddingHorizontal: wp(4)
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: hp(2),
    marginBottom: hp(2)
  },
  backButton: {
    backgroundColor: '#007bff',
    padding: wp(2),
    borderRadius: wp(1)
  },
  heading: {
    fontSize: wp(5),
    fontWeight: 'bold',
    color: '#343a40',
    flex: 1,
    textAlign: 'center'
  },
  menuButton: {
    backgroundColor: '#007bff',
    padding: wp(2),
    borderRadius: wp(1)
  },
  content: {
    flex: 1
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: wp(2),
    padding: wp(4),
    marginBottom: hp(2),
    elevation: 3
  },
  placeName: {
    fontSize: wp(5.5),
    fontWeight: 'bold',
    color: '#343a40',
    marginBottom: hp(2),
    textAlign: 'center'
  },
  infoRow: {
    marginBottom: hp(2),
    paddingBottom: hp(1),
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef'
  },
  infoLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(0.5)
  },
  infoLabel: {
    fontSize: wp(3.5),
    fontWeight: '600',
    color: '#495057',
    marginLeft: wp(1)
  },
  infoValue: {
    fontSize: wp(4),
    color: '#343a40',
    lineHeight: hp(2.5)
  },
  linkText: {
    color: '#007bff',
    textDecorationLine: 'underline'
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp(2)
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#007bff',
    paddingVertical: hp(2),
    paddingHorizontal: wp(3),
    borderRadius: wp(2),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: wp(1)
  },
  actionButtonText: {
    color: '#fff',
    fontSize: wp(4),
    fontWeight: '600',
    marginLeft: wp(1)
  }
});

export default VideshPlaceDetails; 