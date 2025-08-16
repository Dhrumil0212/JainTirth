import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import * as React from 'react';
import { useState } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Import unified screens
import FavoritesScreen from '../screens/FavoritesScreen'; // Unified FavoritesScreen
import InfoScreen from '../screens/InfoScreen'; // Unified InfoScreen
import PlacesGrid from '../screens/PlacesGrid'; // Unified PlacesGrid
import StatesGrid from '../screens/StatesGrid'; // Unified StatesGrid

// Define screen names for clarity
const homeName = "StatesGrid";
const placesName = "PlacesGrid";
const infoName = "Info";
const favoritesName = "Favorites";

const Tab = createBottomTabNavigator();

function MainContainer() {
  const [favorites, setFavorites] = useState([]); // State for storing favorites
  const [language, setLanguage] = useState('en'); // Default language is English

  // No AsyncStorage, just in-memory state for now

  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName={homeName}
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === homeName) iconName = focused ? 'home' : 'home-outline';
            else if (route.name === placesName) iconName = focused ? 'grid' : 'grid-outline';
            else if (route.name === infoName) iconName = focused ? 'information-circle' : 'information-circle-outline';
            else if (route.name === favoritesName) iconName = focused ? 'heart' : 'heart-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name={homeName} component={StatesGrid} />
        <Tab.Screen name={placesName} component={PlacesGrid} />
        <Tab.Screen name={favoritesName} component={FavoritesScreen} />
        <Tab.Screen name={infoName} component={InfoScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default MainContainer;