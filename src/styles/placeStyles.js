// styles.js

import { StyleSheet } from "react-native";
import {
    heightPercentageToDP as hp,
    widthPercentageToDP as wp,
} from "react-native-responsive-screen";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    paddingHorizontal: wp(4),    
    paddingTop: hp(4), // Add padding to push everything downwards

  },
  heading: {
    fontSize: wp(6),
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: hp(2),
    color: "#343a40",
  },
  imageSlider: {
    marginBottom: hp(2),
  },
  image: {
    width: wp(70),
    height: hp(25),
    borderRadius: wp(3),
    marginRight: wp(2),
  },
  noImageText: {
    fontSize: wp(4),
    color: "#6c757d",
    textAlign: "center",
  },
  infoContainer: {
    backgroundColor: "#fff",
    borderRadius: wp(3),
    padding: wp(4),
    marginBottom: hp(2),
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: wp(2),
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  section: {
    marginBottom: hp(2),
  },
  sectionTitle: {
    fontSize: wp(4.5),
    fontWeight: "bold",
    color: "#343a40",
  },
  textContent: {
    fontSize: wp(4),
    color: "#495057",
    marginTop: hp(0.5),
  },
  value: {
    fontSize: wp(4),
    color: "#495057",
  },
  mapContainer: {
    marginVertical: hp(2),
  },
  map: {
    height: hp(30),
    borderRadius: wp(3),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    textAlign: "center",
    fontSize: wp(5),
    marginTop: hp(1),
    color: "#6c757d",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  errorText: {
    textAlign: "center",
    fontSize: wp(5),
    color: "#dc3545",
  },
  webviewMap: {
    width: '100%',
    height: 600, // Set a height to ensure it's visible
  },
  mapContainer: {
    backgroundColor: '#4CAF50', // Green background for the button
    paddingVertical: 12, // Vertical padding to make the button more clickable
    paddingHorizontal: 20, // Horizontal padding for better touch area
    borderRadius: 30, // Rounded corners for the button
    alignItems: 'center', // Center text horizontally
    justifyContent: 'center', // Center text vertically
    marginTop: 15,
    marginBottom: 5, // Space above the button
     // Space above the button
    shadowColor: '#000', // Shadow effect for depth
    shadowOffset: { width: 0, height: 4 }, // Shadow positioning
    shadowOpacity: 0.3, // Light shadow opacity
    shadowRadius: 5, // Shadow blur
    elevation: 6, // Android shadow
  },
  mapText: {
    // color: '#fff', // White text for contrast on the green background
    fontSize: 17, // Text size that’s readable
    fontWeight: 'bold', // Bold text for emphasis
    textAlign: 'center', // Center the text
    letterSpacing: 1, // Slightly increase spacing for clarity
  },

  linkText: {
    color: 'lightblue', // Light blue color
    textDecorationLine: 'underline', // Underline the text
  },
  videoSlider: {
    marginTop: hp(2),
    marginBottom: hp(2),
  },
  videoContainer: {
    marginRight: wp(2),
    borderRadius: wp(2),
    overflow: "hidden",
    backgroundColor: "#000",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
});
