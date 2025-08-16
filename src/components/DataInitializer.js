import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { initializeData } from '../services/comprehensiveDataService';

const DataInitializer = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeAppData = async () => {
      try {
        setLoading(true);
        console.log('🚀 Initializing app data...');
        await initializeData();
        console.log('✅ App data initialized successfully');
        setIsInitialized(true);
      } catch (err) {
        console.error('❌ Error initializing app data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initializeAppData();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading app data...</Text>
        <Text style={styles.subText}>This may take a few moments on launch</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error loading data</Text>
        <Text style={styles.errorSubText}>{error}</Text>
        <Text style={styles.retryText}>Please check your internet connection and try again</Text>
      </View>
    );
  }

  if (!isInitialized) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Failed to initialize app</Text>
      </View>
    );
  }

  return children;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    color: '#333',
  },
  subText: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#dc3545',
    marginBottom: 10,
  },
  errorSubText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryText: {
    fontSize: 14,
    color: '#007bff',
    textAlign: 'center',
  },
});

export default DataInitializer; 