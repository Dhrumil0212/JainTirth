import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp
} from 'react-native-responsive-screen';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useLanguage } from '../services/LanguageContext';

import DrawerMenu from './DrawerMenu'; // Import custom drawer

const TirthMandirGrid = () => {
  const navigation = useNavigation();
  const { language, toggleLanguage } = useLanguage();
  const [isDrawerVisible, setIsDrawerVisible] = useState(false); // Drawer state

  // Create categories dynamically based on current language
  const categories = [
    {
      name: language === 'en' ? 'Tirthkshetra' : 'तीर्थक्षेत्र',
      image: 'https://thedesigngesture.com/wp-content/uploads/2024/08/Designer-2024-08-30T162807.414-900x900.jpeg.webp',
      screen: 'StatesGrid',
      useNewDataSource: false // Use new source
    },
    {
      name: language === 'en' ? 'Mandir' : 'मंदिर',
      image: 'https://yometro.com/images/places/digambar-jain-temple.jpg',
      screen: 'MandirListScreen',
      useNewDataSource: true // Use new source
    },
    {
      name: language === 'en' ? 'Videsh' : 'विदेश',
      image: 'https://i.ibb.co/2YsR50rV/dc0c5acd-ad2a-448c-ad92-621b38c8cddd.png',
      screen: 'VideshListScreen',
      useNewDataSource: true // Use new source
    }
  ];

  const renderCategoryCard = ({ item }) => (
    <TouchableOpacity
      style={styles.cardContainer}
    onPress={() => navigation.navigate(item.screen, { useNewDataSource: item.useNewDataSource })}
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
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeAreaView}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.hamburgerIcon}
            onPress={() => setIsDrawerVisible(true)}
          >
            <MaterialCommunityIcons name="menu" size={wp(6)} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.heading}>
            {language === 'en' ? 'Explore' : 'अन्वेषण करें'}
          </Text>

          <TouchableOpacity
            style={styles.toggleButton}
            onPress={toggleLanguage}
          >
            <Text style={styles.toggleButtonText}>
              {language === 'en' ? 'HI' : 'EN'}
            </Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={categories}
          renderItem={renderCategoryCard}
          numColumns={2}
          keyExtractor={(item, index) => item.name + index}
          contentContainerStyle={styles.grid}
          key={language} // Force re-render when language changes
        />
      </SafeAreaView>

      {/* Custom Drawer Component */}
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
    marginBottom: hp(1)
  },
  heading: {
    fontSize: wp(6),
    fontWeight: 'bold',
    color: '#343a40',
    textAlign: 'center'
  },
  hamburgerIcon: {
    backgroundColor: '#007bff',
    padding: wp(2),
    borderRadius: wp(1)
  },
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: wp(2),
    width: wp(42),
    height: hp(27),
    margin: wp(2),
    overflow: 'hidden',
    elevation: 3
  },
  cardImage: {
    width: '100%',
    height: hp(20),
    resizeMode: 'cover'
  },
  placeholderImage: {
    width: '100%',
    height: hp(20),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e9ecef'
  },
  placeholderText: {
    color: '#6c757d',
    fontSize: wp(3.5)
  },
  cardContent: {
    padding: wp(2),
    justifyContent: 'center',
    alignItems: 'center'
  },
  cardTitle: {
    fontSize: wp(4.5),
    fontWeight: '600',
    color: '#343a40',
    textAlign: 'center'
  },
  grid: {
    paddingBottom: hp(2)
  },
  toggleButton: {
    backgroundColor: '#007bff',
    padding: wp(2),
    borderRadius: wp(1)
    // paddingVertical: wp(1.5),
    // paddingHorizontal: wp(3),
    // borderRadius: wp(1),
    // minWidth: wp(12)
  },
  toggleButtonText: {
    color: '#fff',
    fontSize: wp(4.5),
    fontWeight: 'bold',
    textAlign: 'center'
  }
});

export default TirthMandirGrid;
