import React from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const otherDevelopers = [
  { id: '3', name: 'आचार्य श्री विद्यासागर जी महाराज', image: 'https://i.imgur.com/qRiNAvr.png' },
  { id: '4', name: 'आशीर्वाद :आचार्य श्री समय सागर जी महाराज', image: 'https://i.imgur.com/l46EH2N.jpeg' },
  { id: '1', name: 'मार्गदर्शन: निर्यापक श्रमण मुनि श्री अभय सागर जी महाराज', image: 'https://vidyasagarmedia.s3.us-east-2.amazonaws.com/monthly_2023_02/large.(12).JPG.e9b47927b0e219572d0876f9d7980f0b.JPG' },
  { id: '2', name: 'प्रेरणा स्रोत : ब्र.अनिल कुमार जैन', image: 'https://i.imgur.com/myI1zBY.jpeg' },
];

const { width } = Dimensions.get('window');

const InfoScreen = () => {
  const handleOpenLink = (url) => {
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>Contact Information</Text>

        <View style={styles.verticalGrid}>
          {otherDevelopers.slice(0, 1).map((item) => (
            <View key={item.id} style={styles.photoCard}>
              <Image source={{ uri: item.image }} style={styles.photoImage} />
              <Text style={styles.photoName}>{item.name}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.namostuText}>
          आचार्य श्री विद्यासागर जी महाराज के प्रथम समाधि दिवस के पावन प्रसंग पर
        </Text>

        <View style={styles.verticalGrid}>
          {otherDevelopers.slice(1, 2).map((item) => (
            <View key={item.id} style={styles.photoCard}>
              <Image source={{ uri: item.image }} style={styles.photoImage} />
              <Text style={styles.photoName}>{item.name}</Text>
            </View>
          ))}
        </View>

        <FlatList
          data={otherDevelopers.slice(2)}
          renderItem={({ item }) => (
            <View style={styles.photoCard}>
              <Image source={{ uri: item.image }} style={styles.photoImage} />
              <Text style={styles.photoName}>{item.name}</Text>
            </View>
          )}
          keyExtractor={(item) => item.id}
          horizontal={true}
          contentContainerStyle={styles.photoGrid}
          showsHorizontalScrollIndicator={false}
        />

        <View style={styles.contactInfoContainer}>
          <View style={styles.contactTextContainer}>
            <Text style={styles.developerName}>निर्माता: ध्रुमिल जैन</Text>
            <Text style={styles.developerEmail}>Email: dhrumil0212@gmail.com</Text>
          </View>
        </View>

        <Text style={styles.additionalText}>
          ब्र अनिल कुमार जैन : अधिष्ठाता एवं ट्रस्टी श्री दिगम्बर जैन उदासीन आश्रम इन्दौर। मोबाइल - 9770872087
        </Text>
      </ScrollView>

      {/* ✅ Combined both buttons in a single linksContainer */}
      <View style={styles.linksContainer}>
        <TouchableOpacity
          onPress={() => handleOpenLink('https://forms.gle/7WRtpuU8BCRfybPC7')}
          style={styles.linkButton}
        >
          <Text style={styles.linkText}>तीर्थ स्थल विवरण फॉर्म</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            handleOpenLink(
              'https://docs.google.com/forms/d/1tdYawUJEOsfy6Px7FXZvzlJxnhTMH59v3spGIaJ1s4w/viewform'
            )
          }
          style={styles.linkButton}
        >
          <Text style={styles.linkText}>मंदिर विवरण फॉर्म</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120, // Leave space for the buttons
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
  contactInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    alignItems: 'center',
  },
  contactTextContainer: {
    flex: 1,
    marginLeft: 10,
  },
  developerName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  developerEmail: {
    fontSize: 16,
    color: '#555',
    marginTop: 3,
  },
  verticalGrid: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  photoGrid: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginLeft: 20,
    marginTop: 11,
  },
  photoCard: {
    marginBottom: 4,
    alignItems: 'center',
    marginRight: 16,
    width: width * 0.4,
  },
  photoImage: {
    width: '100%',
    height: 150,
    borderRadius: 25,
    objectFit: 'contain',
  },
  photoName: {
    marginTop: 7,
    fontWeight: '600',
    color: '#333',
    fontSize: 14,
    textAlign: 'center',
    maxWidth: width * 0.4,
    overflow: 'hidden',
  },
  namostuText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  additionalText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginVertical: 10,
    fontWeight: '600',
    marginTop: 30,
  },
  linksContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#f8f9fa',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  linkButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 5,
    marginHorizontal: 4,
  },
  linkText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default InfoScreen;
