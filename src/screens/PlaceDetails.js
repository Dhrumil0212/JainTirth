import NetInfo from "@react-native-community/netinfo";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Linking,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import YoutubePlayer from "react-native-youtube-iframe";
import { getCachedData, setCachedData } from "../services/cacheUtils";
import { styles } from "../styles/placeStyles";

const CACHE_KEY = 'place_details_data';

// Consolidated data fetching with caching
const fetchAllData = async () => {
  const cached = await getCachedData(CACHE_KEY);
  if (cached) return cached;

  try {
    const apiKey = "AIzaSyC1Fv_yJ-w7ifM4HIYr0GOG7Z5472GW1ZE";
    const spreadsheetId = "1CIfzUskea7CaZg9H5f8bi_ABjPMVrgUF29tmyeXkXyg";
    const ranges = [
      "Sheet1!A1:Z600000",
      "ImageMapping!A1:Z100000",
      "YouTube Links!A1:Z10000"
    ];

    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchGet?ranges=${ranges.map(encodeURIComponent).join('&ranges=')}&key=${apiKey}`
    );
    const data = await response.json();

    if (!data.valueRanges || data.valueRanges.length !== 3) {
      return {
        sheet1Data: [],
        imageMappingEn: {},
        imageMappingHi: {},
        youtubeMap: {}
      };
    }

    // Process sheet data
    const sheet1Data = data.valueRanges[0].values || [];
    const imageMapValues = data.valueRanges[1].values || [];
    const youtubeLinksValues = data.valueRanges[2].values || [];

    // Process image mapping
    const [imageMappingEn, imageMappingHi] = processImageMapping(imageMapValues);
    
    // Process YouTube links
    const youtubeMap = processYoutubeLinks(youtubeLinksValues);

    const result = {
      sheet1Data,
      imageMappingEn,
      imageMappingHi,
      youtubeMap
    };

    await setCachedData(CACHE_KEY, result);
    return result;

  } catch (error) {
    console.error("Error fetching all data:", error);
    return {
      sheet1Data: [],
      imageMappingEn: {},
      imageMappingHi: {},
      youtubeMap: {}
    };
  }
};

const processImageMapping = (imageMapValues) => {
  const imageMappingEn = {};
  const imageMappingHi = {};
  const header = imageMapValues[0] || [];

  const stateCol = header.indexOf('State');
  const placeCol = header.indexOf('Place');
  const tirthCol = header.indexOf('Tirth');
  const rajyaCol = header.indexOf('Rajya');
  const linkCol = header.indexOf('Link');

  imageMapValues.slice(1).forEach(row => {
    const state = stateCol >= 0 ? row[stateCol] : '';
    const place = placeCol >= 0 ? row[placeCol] : '';
    const tirth = tirthCol >= 0 ? row[tirthCol] : '';
    const rajya = rajyaCol >= 0 ? row[rajyaCol] : '';
    const link = linkCol >= 0 ? row[linkCol] : '';

    if (state && place && link) {
      imageMappingEn[state] = imageMappingEn[state] || {};
      imageMappingEn[state][place] = [...(imageMappingEn[state][place] || []), link];
    }

    if (rajya && tirth && link) {
      imageMappingHi[rajya] = imageMappingHi[rajya] || {};
      imageMappingHi[rajya][tirth] = [...(imageMappingHi[rajya][tirth] || []), link];
    }
  });

  return [imageMappingEn, imageMappingHi];
};

const processYoutubeLinks = (youtubeLinksValues) => {
  const youtubeMap = {};
  const header = youtubeLinksValues[0] || [];
  
  console.log('🔍 Processing YouTube links with header:', header);
  
  const placeEnCol = header.indexOf('Place');
  const placeHiCol = header.indexOf('PlaceHin');
  const videoCol = header.indexOf('Video');

  console.log('🔍 YouTube column indices:', { placeEnCol, placeHiCol, videoCol });

  if (placeEnCol === -1 || placeHiCol === -1 || videoCol === -1) {
    console.log('🔍 Could not find required YouTube columns');
    return youtubeMap;
  }

  youtubeLinksValues.slice(1).forEach((row, index) => {
    const placeEn = row[placeEnCol];
    const placeHi = row[placeHiCol];
    const link = row[videoCol];

    console.log(`🔍 Row ${index}:`, { placeEn, placeHi, link });

    if (placeEn && link) {
      youtubeMap[placeEn] = [...(youtubeMap[placeEn] || []), link];
      console.log('🔍 Added YouTube link for English place:', placeEn, link);
    }
    if (placeHi && link) {
      youtubeMap[placeHi] = [...(youtubeMap[placeHi] || []), link];
      console.log('🔍 Added YouTube link for Hindi place:', placeHi, link);
    }
  });

  console.log('🔍 Final YouTube map:', youtubeMap);
  return youtubeMap;
};

const PlaceDetails = ({ route }) => {
  const { placeName, language = "en" } = route.params;
  const [placeData, setPlaceData] = useState(null);
  const [images, setImages] = useState([]);
  const [youtubeLinks, setYoutubeLinks] = useState([]);
  const [isConnected, setIsConnected] = useState(true);
  const [loading, setLoading] = useState(true);
  const [sheet1Data, setSheet1Data] = useState([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    const { sheet1Data: data, imageMappingEn, imageMappingHi, youtubeMap } = await fetchAllData();
    setSheet1Data(data);

    const header = data[0] || [];
    console.log('Sheet header:', header);
    console.log('All available column names:', header.map((name, index) => `${index}: ${name}`));
    
    // Find the place name column based on language
    let nameCol;
    if (language === 'hi') {
      // For Hindi: use "Naam" column (column 6)
      nameCol = header.indexOf('Naam');
    } else {
      // For English: use "Name teerth" column (column 5)
      nameCol = header.indexOf('Name teerth');
    }
    
    if (nameCol === -1) {
      console.log('Could not find name column. Available columns:', header);
      setLoading(false);
      return;
    }
    
    console.log('Name column index:', nameCol, 'for place:', placeName);
    
    // Filter rows where the place name matches
    const filteredData = data.slice(1).filter(row => {
      const rowPlaceName = row[nameCol];
      return rowPlaceName && rowPlaceName.trim() === placeName.trim();
    });
    
    console.log('Filtered data length:', filteredData.length);
    if (filteredData.length > 0) {
      console.log('First row data:', filteredData[0]);
      console.log('All filtered rows:', filteredData.map((row, index) => 
        `Row ${index}: Key="${row[0]}", Translated Key="${row[1]}", Original Value="${row[2]}", Translated Value="${row[3]}"`
      ));
    }
    
    setPlaceData(filteredData.length > 0 ? filteredData : null);

    // For images and videos, we need to find the state/rajya column
    const stateKey = language === 'hi' ? 'Rajya' : 'State';
    const stateCol = header.indexOf(stateKey);
    const currentState = filteredData[0]?.[stateCol];
    const imageMapping = language === 'hi' ? imageMappingHi : imageMappingEn;
    setImages(currentState ? imageMapping[currentState]?.[placeName] || [] : []);
    const youtubeLinksForPlace = youtubeMap[placeName] || [];
    console.log('🔍 YouTube links for place:', placeName, youtubeLinksForPlace);
    setYoutubeLinks(youtubeLinksForPlace);
    setLoading(false);
  }, [placeName, language]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
    });

    if (placeName) loadData();
    return () => unsubscribe();
  }, [placeName, language, loadData]);

  // Helper functions for rendering
  const isEmail = (str) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(str);

  const isURL = (str) => {
    const urlPattern = /^(http|https):\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/[^\s]*)?$/;
    const wwwPattern = /^www\.[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/[^\s]*)?$/;
    return urlPattern.test(str) || wwwPattern.test(str);
  };

  const isPhoneList = (value) => {
    // Match for any valid phone numbers with exactly 10 digits separated by   
    const phoneRegex = /(?:\b\d[\d\s-]{8,}\d\b)/g;

  const matches = value.match(phoneRegex);
  
  // Further validate: remove spaces and hyphens, and check if total digit count ≥ 10
  if (!matches) return false;

  return matches.some(match => {
    const digitCount = match.replace(/[^\d]/g, '').length;
    return digitCount >= 10;
  });
  };

  const renderPhones = (phoneStr) => {
    const parts = phoneStr.split(/[,/;]/).map(p => p.trim()).filter(Boolean);
    return parts.map((p, idx) => {
      const cleaned = p.replace(/[^\d]/g, '');
      const isValid = cleaned.length >= 10;  // Only accept valid 10 digit numbers

      if (isValid) {
        return (
          <TouchableOpacity key={idx} onPress={() => Linking.openURL(`tel:${cleaned}`)}>
            <Text style={[styles.textContent, styles.linkText]}>
              {p}{idx < parts.length - 1 ? ', ' : ''}
            </Text>
          </TouchableOpacity>
        );
      } else {
        return (
          <Text key={idx} style={styles.textContent}>
            {p}{idx < parts.length - 1 ? ', ' : ''}
          </Text>
        );
      }
    });
  };

  const renderPlaceData = () => {
    if (!placeData || placeData.length === 0) return null;

    console.log('Rendering place data for', placeData.length, 'rows');
    
    // Each row in placeData represents a different field
    return placeData.map((row, rowIndex) => {
      const header = sheet1Data[0] || [];
      
      // Find the key and value columns based on language
      let keyCol, valueCol;
      
      if (language === 'hi') {
        // For Hindi: use original key (column 0) and original value (column 2)
        keyCol = 0; // "key" column
        valueCol = 2; // "Original Value" column
      } else {
        // For English: use translated key (column 1) and translated value (column 3)
        keyCol = 1; // "Translated Key" column
        valueCol = 3; // "Translated Value" column
      }
      
      const key = row[keyCol];
      const value = row[valueCol];
      
      if (!key || !value) return null;
      
      console.log(`Row ${rowIndex}: Key="${key}", Value="${value}"`);
      
      const isEmailValue = isEmail(value);
      const isUrlValue = isURL(value);
      const isPhoneValue = isPhoneList(value);

      return (
        <View key={rowIndex} style={styles.section}>
          <Text style={styles.sectionTitle}>{key}:</Text>
          {isEmailValue ? (
            <TouchableOpacity onPress={() => Linking.openURL(`mailto:${value}`)}>
              <Text style={[styles.textContent, styles.linkText]}>{value}</Text>
            </TouchableOpacity>
          ) : isUrlValue ? (
            <TouchableOpacity
              onPress={() =>
                Linking.openURL(
                  value.startsWith("www.")
                    ? `https://${value}`
                    : value
                )
              }
            >
              <Text style={[styles.textContent, styles.linkText]}>
                {value}
              </Text>
            </TouchableOpacity>
          ) : isPhoneValue ? (
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {renderPhones(value)}
            </View>
          ) : (
            <Text style={styles.textContent}>{value}</Text>
          )}
        </View>
      );
    }).filter(Boolean); // Remove null entries
  };

  const handleMapPress = () => {
    if (placeData?.[0]?.[10] && placeData?.[0]?.[11]) {
      const mapUrl = `https://www.google.com/maps?q=${placeData[0][10]},${placeData[0][11]}`;
      Linking.openURL(mapUrl).catch(console.error);
    } else {
      alert(language === 'hi' ? "मानचित्र निर्देशांक उपलब्ध नहीं हैं।" : "Map coordinates not available.");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#343a40" />
        <Text style={styles.loadingText}>
          {language === 'hi' ? "स्थान विवरण लोड हो रहा है..." : "Loading place details..."}
        </Text>
      </View>
    );
  }

  if (!isConnected) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          {language === 'hi' 
            ? "इंटरनेट कनेक्शन नहीं है। कृपया चित्र और वीडियो देखने के लिए इंटरनेट से कनेक्ट करें।" 
            : "No internet connection. Please connect to the internet to view images and videos."
          }
        </Text>
      </View>
    );
  }

  if (!placeData || placeData.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          {language === 'hi' 
            ? "स्थान नहीं मिला।" 
            : "Place not found."
          }
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>
        {placeData && placeData.length > 0 
          ? (language === 'hi' ? placeData[0][6] : placeData[0][5]) || placeName
          : placeName
        }
      </Text>

      <ScrollView horizontal style={styles.imageSlider}>
        {images.length > 0 ? (
          images.map((img, index) => (
            <Image key={index} source={{ uri: img }} style={styles.image} />
          ))
        ) : (
          <Text style={styles.noImageText}>
            {language === 'hi' ? "कोई चित्र उपलब्ध नहीं है" : "No images available"}
          </Text>
        )}
      </ScrollView>

      <View style={styles.infoContainer}>
        {renderPlaceData()}

        {youtubeLinks.length > 0 && (
          <ScrollView horizontal style={styles.videoSlider}>
            {youtubeLinks.map((link, index) => {
              console.log('🔍 Processing YouTube link:', link);
              
              // Extract video ID from various YouTube URL formats
              let videoId = null;
              if (link.includes('v=')) {
                videoId = link.split('v=')[1]?.split('&')[0];
              } else if (link.includes('youtu.be/')) {
                videoId = link.split('youtu.be/')[1]?.split('?')[0];
              } else if (link.includes('youtube.com/embed/')) {
                videoId = link.split('youtube.com/embed/')[1]?.split('?')[0];
              }
              
              console.log('🔍 Extracted video ID:', videoId);
              
              if (!videoId) {
                console.log('🔍 Could not extract video ID from:', link);
                return null;
              }
              
              return (
                <View key={index} style={styles.videoContainer}>
                  <YoutubePlayer
                    height={200}
                    width={300}
                    videoId={videoId}
                    play={false}
                    onError={(error) => console.log('🔍 YouTube player error:', error)}
                    onReady={() => console.log('🔍 YouTube player ready for video:', videoId)}
                  />
                </View>
              );
            })}
          </ScrollView>
        )}

        {placeData?.[0]?.[10] && placeData?.[0]?.[11] && (
          <TouchableOpacity style={styles.mapContainer} onPress={handleMapPress}>
            <Text style={styles.mapText}>
              {language === 'hi' ? "गूगल मैप्स में खोलें" : "Open in Google Maps"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

export default PlaceDetails;
