// src/screens/FavoritesScreen.js
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
  FlatList,
  LayoutAnimation,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View
} from 'react-native';
import { HeartIcon } from 'react-native-heroicons/solid';
import { useFavorites } from '../services/FavoritesContext';
import { useLanguage } from '../services/LanguageContext';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FavoritesScreen = () => {
  const [expanded, setExpanded] = useState({ tirth: true, mandir: true, videsh: true });
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();
  const { language } = useLanguage();
  const { favorites, toggleFavorite } = useFavorites();

  // Load favorites from context (which handles file storage)
  const loadFavorites = async () => {
    try {
      // The FavoritesContext already handles loading favorites from file storage
      // We just need to ensure it's up to date
      console.log('📋 Loading favorites from context...');
    } catch (error) {
      console.log('Error loading favorites:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [])
  );

  const toggleSection = (k) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((p) => ({ ...p, [k]: !p[k] }));
  };

  /* ------------------------------------------------------------------ */
  /* card renderer                                                      */
  /* ------------------------------------------------------------------ */
  const renderCard = (item, category) => {
    const onPress = async () => {
      console.log('FavoritesScreen - onPress called with:', { item, category, language });
      
      if (category === 'mandir') {
        // For mandir, we need to navigate to MandirPlaceDetails
        // We need to get the place data first, but for now we'll navigate with just the name
        navigation.navigate('MandirPlaceDetails', { 
          placeName: item,
          language 
        });
      } else if (category === 'videsh') {
        // For videsh, we need to navigate to VideshPlaceDetails
        // The item should be the place name
        navigation.navigate('VideshPlaceDetails', { 
          placeName: item,
          language 
        });
      } else {
        navigation.navigate('PlaceDetails', { placeName: item, language });
      }
    };

    return (
      <TouchableOpacity style={styles.cardContainer} onPress={onPress} disabled={isLoading}>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{item}</Text>
        </View>
        <TouchableOpacity
          onPress={() => toggleFavorite(item, category)}
          style={styles.favoriteButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <HeartIcon size={24} color="red" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderSection = (title, data, key) => (
    <View>
      <TouchableOpacity onPress={() => toggleSection(key)} style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {language === 'en' ? title : key === 'tirth' ? 'तीर्थ' : key === 'mandir' ? 'मंदिर' : 'विदेश'}
        </Text>
        <Text style={styles.expandIcon}>{expanded[key] ? '−' : '+'}</Text>
      </TouchableOpacity>

      {expanded[key] && data.length ? (
        <FlatList
          data={data}
          keyExtractor={(it, idx) => it + idx}
          renderItem={({ item }) => renderCard(item, key)}
        />
      ) : (
        expanded[key] && (
          <Text style={styles.noFavoritesText}>
            {language === 'en' ? 'No Favorites Yet' : 'अभी तक कोई पसंदीदा नहीं'}
          </Text>
        )
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {language === 'en' ? 'Favorites' : 'पसंदीदा'}
        </Text>
      </View>

      <FlatList
        data={[
          { title: language === 'en' ? 'Tirth' : 'तीर्थ', data: favorites.tirth, key: 'tirth' },
          { title: language === 'en' ? 'Mandir' : 'मंदिर', data: favorites.mandir, key: 'mandir' },
          { title: language === 'en' ? 'Videsh' : 'विदेश', data: favorites.videsh, key: 'videsh' },
        ]}
        renderItem={({ item }) => renderSection(item.title, item.data, item.key)}
        keyExtractor={(item) => item.key}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

/* ------------------------------------------------------------------ */
/* styles                                                             */
/* ------------------------------------------------------------------ */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#f8f9fa',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  listContainer: {
    paddingBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#e0e0e0',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 6,
    marginTop: 10,
  },
  sectionTitle: { fontSize: 20, fontWeight: '600' },
  expandIcon: { fontSize: 20, fontWeight: 'bold' },
  cardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    marginVertical: 5,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 2,
    alignItems: 'center',
  },
  cardContent: { flexDirection: 'row', alignItems: 'center'},
  cardTitle: { fontSize: 18, fontWeight: '500', marginLeft: 10, marginRight: 10, textAlign: 'center', flex: 1 },
  favoriteButton: {
    width: 0,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnail: { width: 40, height: 40, borderRadius: 4, backgroundColor: '#ddd' },
  noFavoritesText: {
    fontSize: 16,
    color: '#6c757d',
    padding: 15,
    textAlign: 'center',
  },
  debugButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  debugButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default FavoritesScreen;
