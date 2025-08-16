import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const CalendarScreen = () => {
  const [calendarData, setCalendarData] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    // Fetch the calendar data from the URL
    fetch('https://augmentic.in/calendar_data/calendar_api.json')
      .then((response) => response.json())
      .then((data) => {
        setCalendarData(data.calendars); // Set all available calendar years
      })
      .catch((error) => console.error('Error fetching calendar data:', error));
  }, []);

  // Function to handle year selection and navigate to the detail screen
  const handleYearSelect = (year) => {
    // Find the selected year's data
    const selectedYearData = calendarData.find(item => item.year === year);
    // Navigate to YearDetailScreen and pass the selected year's data
    navigation.navigate('YearDetailScreen', { yearData: selectedYearData });
  };

  // Render each year card in the grid
  const renderYearCard = ({ item }) => (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={() => handleYearSelect(item.year)}
    >
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.year}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Select a Year</Text>
      
      {/* Grid to display the years */}
      <FlatList
        data={calendarData}
        renderItem={renderYearCard}
        numColumns={3} // Number of columns in the grid
        keyExtractor={(item) => item.year}
        contentContainerStyle={styles.grid}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f4f4f4',
  },
  heading: {
    marginTop: 60,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  grid: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContainer: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  cardContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default CalendarScreen;
