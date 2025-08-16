import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
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

import DrawerMenu from './DrawerMenu';

const MandirPlaceDetails = ({ route }) => {
  const navigation = useNavigation();
  const { language } = useLanguage();
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  
  const { place, districtName, stateName } = route.params || {};

  const handleCall = () => {
    if (place.phone) {
      const cleaned = place.phone.replace(/[^\d-]/g, '');
      const numericPhone = cleaned.replace(/-/g, '');
      
      if (numericPhone.length >= 10) {
        Linking.openURL(`tel:${numericPhone}`);
      } else {
        Alert.alert(
          language === 'en' ? 'Invalid Phone Number' : 'अमान्य फोन नंबर',
          language === 'en' ? 'Phone number format is invalid' : 'फोन नंबर का प्रारूप अमान्य है'
        );
      }
    } else {
      Alert.alert(
        language === 'en' ? 'No Phone Number' : 'कोई फोन नंबर नहीं',
        language === 'en' ? 'Phone number not available' : 'फोन नंबर उपलब्ध नहीं है'
      );
    }
  };

  const handleMap = () => {
    if (place.lat && place.lng) {
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
    
    return (
      <View style={styles.infoRow}>
        <View style={styles.infoLabelContainer}>
          <MaterialCommunityIcons name={icon} size={wp(4)} color="#007bff" />
          <Text style={styles.infoLabel}>{label}</Text>
        </View>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    );
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
          <View style={styles.card}>
            <Text style={styles.placeName}>{place?.name}</Text>
            
            {renderInfoRow(
              language === 'en' ? 'State' : 'राज्य',
              stateName,
              'map-marker'
            )}
            
            {renderInfoRow(
              language === 'en' ? 'District' : 'जिला',
              place?.district,
              'map-marker-radius'
            )}
            
            {renderInfoRow(
              language === 'en' ? 'City' : 'शहर',
              place?.city,
              'city'
            )}
            
            {renderInfoRow(
              language === 'en' ? 'Address' : 'पता',
              place?.address,
              'map-marker-outline'
            )}
            
            {renderInfoRow(
              language === 'en' ? 'Phone' : 'फोन',
              place?.phone,
              'phone'
            )}
            
            {renderInfoRow(
              language === 'en' ? 'ZIP Code' : 'पिन कोड',
              place?.zip,
              'map-marker-check'
            )}
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

export default MandirPlaceDetails; 