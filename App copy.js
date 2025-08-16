import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useState } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Context Providers
import { FavoritesProvider } from './src/services/FavoritesContext';
import { LanguageProvider, useLanguage } from './src/services/LanguageContext';
import { SearchProvider } from './src/services/SearchContext';

// Screens
import DistrictList from './src/screens/MandirDetails';
import MandirListScreen from './src/screens/MandirListScreen';
import PlaceDetails from './src/screens/PlaceDetails';
import PlacesGrid from './src/screens/PlacesGrid';
import StatesGrid from './src/screens/StatesGrid';
import TirthMandirGrid from './src/screens/TirthMandirGrid';
// import MandirDetails from './src/screens/MandirListScreen';

import CalendarScreen from './src/screens/CalendarScreen';
import MandirDetails from './src/screens/DistrictList';
import DrawerMenu from './src/screens/DrawerMenu';
import FavoritesScreen from './src/screens/FavoritesScreen';
import InfoScreen from './src/screens/InfoScreen';
import YearDetailScreen from './src/screens/YearDetailScreen';

// Create Navigators
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const FavoritesStack = createStackNavigator();
const HomeStack = createStackNavigator();


// Home Stack - includes all screens that belong to the "Home" section
const AppNavigator = () => {
  const { language } = useLanguage();

  return (
    <HomeStack.Navigator initialRouteName="TirthMandirGrid" screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="TirthMandirGrid" component={TirthMandirGrid} />
      <HomeStack.Screen
        name="StatesGrid"
        component={StatesGrid}
        key={`StatesGrid-${language}`}
      />
      <HomeStack.Screen
        name="PlacesGrid"
        component={PlacesGrid}
        key={`PlacesGrid-${language}`}
      />
      <HomeStack.Screen
        name="PlaceDetails"
        component={PlaceDetails}
        key={`PlaceDetails-${language}`}
      />
      <HomeStack.Screen name="DistrictList" component={DistrictList} />
      <HomeStack.Screen name="MandirListScreen" component={MandirListScreen} />
      <HomeStack.Screen
        name="MandirDetails"
        component={MandirDetails}
        options={({ route }) => ({ title: route.params?.districtName })}
      />
      <HomeStack.Screen name="CalendarScreen" component={CalendarScreen} />
      <HomeStack.Screen name="YearDetailScreen" component={YearDetailScreen} />
    </HomeStack.Navigator>
  );
};


// Favorites Stack - wrap Favorites so it can navigate to PlaceDetails and MandirListScreen
const FavoritesNavigator = () => (
  <FavoritesStack.Navigator screenOptions={{ headerShown: false }}>
    <FavoritesStack.Screen name="FavoritesScreen" component={FavoritesScreen} />
    <FavoritesStack.Screen name="PlaceDetails" component={PlaceDetails} />
    <FavoritesStack.Screen name="MandirDetails" component={MandirDetails} />
  </FavoritesStack.Navigator>
);


// Bottom Tabs
const BottomTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Favorites') iconName = 'heart';
          else if (route.name === 'Info') iconName = 'information-circle';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={AppNavigator} />
      <Tab.Screen name="Favorites" component={FavoritesNavigator} />
      <Tab.Screen name="Info" component={InfoScreen} />
    </Tab.Navigator>
  );
};


// Main App
const App = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const toggleDrawer = () => setDrawerVisible(!drawerVisible);

  return (
    <LanguageProvider>
      <FavoritesProvider>
        <SearchProvider>
          <NavigationContainer>
            <DrawerMenu isVisible={drawerVisible} onClose={toggleDrawer} />
            <BottomTabs />
          </NavigationContainer>
        </SearchProvider>
      </FavoritesProvider>
    </LanguageProvider>
  );
};

export default App;
