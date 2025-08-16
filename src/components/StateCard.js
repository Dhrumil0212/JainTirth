import React from 'react';
import { StyleSheet, TouchableOpacity, Image, Text } from 'react-native';

const StateCard = ({ state, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <Image source={{ uri: state.image }} style={styles.image} />
    <Text style={styles.name}>{state.name}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 10,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  image: {
    width: 150,
    height: 100,
    borderRadius: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default StateCard;