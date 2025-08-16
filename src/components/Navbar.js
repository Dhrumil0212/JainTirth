// components/Navbar.js

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const Navbar = () => {
  const navigation = useNavigation();

  // Handle navigation for each button
  const navigateToHome = () => {
    navigation.navigate('StatesGrid'); // Assuming you have a 'Home' screen
  };

  const navigateToFavorites = () => {
    navigation.navigate('Favorites'); // Assuming you have a 'Favorites' screen
  };

  const navigateToInfo = () => {
    navigation.navigate('Info'); // Assuming you have an 'Info' screen
  };

  return (
    <View style={styles.navbar}>
      {/* Home Button */}
      <TouchableOpacity onPress={navigateToHome} style={styles.navButton}>
        <Text style={styles.navButtonText}>Home</Text>
      </TouchableOpacity>

      {/* Favorites Button */}
      <TouchableOpacity onPress={navigateToFavorites} style={styles.navButton}>
        <Text style={styles.navButtonText}>Favorites</Text>
      </TouchableOpacity>

      {/* Info Button */}
      <TouchableOpacity onPress={navigateToInfo} style={styles.navButton}>
        <Text style={styles.navButtonText}>Info</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#007bff',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 5,
    elevation: 5, // For shadow on Android
    zIndex: 1, // Ensure it's on top of other content
  },
  navButton: {
    padding: 10,
  },
  navButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default Navbar;
