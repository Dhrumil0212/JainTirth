import React, { useRef, useState } from 'react';
import {
    Dimensions,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { ResumableZoom, useImageResolution } from 'react-native-zoom-toolkit';

const { width, height } = Dimensions.get('window');
const IMAGE_CONTAINER_WIDTH = width;
const ITEM_WIDTH = width;

const ZoomableImage = ({ uri, setParentScroll }) => {
  const { isFetching, resolution } = useImageResolution({ uri });

  if (isFetching || resolution === undefined) {
    return (
      <View style={[styles.zoomContainer, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: 'white', fontSize: 16 }}>Loading image...</Text>
      </View>
    );
  }

  // Calculate the appropriate height to maintain aspect ratio
  const aspectRatio = resolution.width / resolution.height;
  const imageHeight = IMAGE_CONTAINER_WIDTH / aspectRatio;

  return (
    <View style={styles.zoomContainer}>
      <ResumableZoom
        maxScale={3} // Reduced to prevent excessive blur
        onZoomStart={() => setParentScroll(false)}
        onZoomEnd={() => setParentScroll(true)}
        minScale={1}
        doubleTapScale={1.5} // Reduced double tap scale
        enablePanGesture={true}
        enablePinchGesture={true}
        enableDoubleTapGesture={true}
      >
        <Image
          source={{ 
            uri,
            // Request higher quality image
            headers: {
              'Accept': 'image/webp,image/*,*/*;q=0.8'
            }
          }}
          style={{
            width: IMAGE_CONTAINER_WIDTH,
            height: Math.min(imageHeight, height * 0.8),
            resizeMode: 'contain',
          }}
          // Improved image quality settings
          progressiveRenderingEnabled={false}
          fadeDuration={0}
          cachePolicy="memory"
          resizeMethod="resize"
          // Additional quality improvements
          blurRadius={0}
          defaultSource={null}
        />
      </ResumableZoom>
    </View>
  );
};

const YearDetailScreen = ({ route, navigation }) => {
  const { yearData } = route.params;
  const [showFront, setShowFront] = useState(true);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef();

  const scrollToIndex = (index) => {
    if (index >= 0 && index < yearData.calendar_data.length) {
      flatListRef.current.scrollToIndex({ index, animated: true });
      setCurrentIndex(index);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.imageContainer}>
      <ZoomableImage
        uri={showFront ? item.front_url : item.back_url}
        setParentScroll={setScrollEnabled}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      <FlatList
        ref={flatListRef}
        data={yearData.calendar_data}
        renderItem={renderItem}
        keyExtractor={(_, index) => index.toString()}
        pagingEnabled
        scrollEnabled={scrollEnabled}
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={ITEM_WIDTH}
        snapToAlignment="center"
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / ITEM_WIDTH);
          setCurrentIndex(index);
        }}
        initialNumToRender={1}
        maxToRenderPerBatch={1}
        windowSize={3}
      />

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => scrollToIndex(currentIndex - 1)}
          disabled={currentIndex === 0}
        >
          <Text style={[
            styles.toggleButtonText,
            currentIndex === 0 && styles.disabledButton
          ]}>Previous</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => setShowFront(!showFront)}
        >
          <Text style={styles.toggleButtonText}>
            {showFront ? 'Show Back' : 'Show Front'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => scrollToIndex(currentIndex + 1)}
          disabled={currentIndex === yearData.calendar_data.length - 1}
        >
          <Text style={[
            styles.toggleButtonText,
            currentIndex === yearData.calendar_data.length - 1 && styles.disabledButton
          ]}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  imageContainer: {
    width: ITEM_WIDTH,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  zoomContainer: {
    width: '100%',
    height: height * 0.8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
    // Ensure crisp rendering
    overflow: 'hidden',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 15,
    borderRadius: 25,
    zIndex: 2,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
  },
  buttonRow: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButton: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 25,
    marginHorizontal: 10,
  },
  toggleButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default YearDetailScreen;