// src/components/CustomDrawer.js
import { useNavigation } from '@react-navigation/native';
import {
  Linking,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const DrawerMenu = ({ isVisible, onClose }) => {
  const navigation = useNavigation();

  const handleShare = async () => {
    try {
      await Share.share({
        message:
          'Check out this amazing app: https://play.google.com/store/apps/details?id=com.dhrumil212.jaintirthdigdershika',
      });
    } catch (error) {
      console.error('Error sharing app link:', error);
    }
  };

  const handleRateApp = () => {
    const playStoreUrl = 'market://details?id=com.dhrumil212.jaintirthdigdershika';
    Linking.openURL(playStoreUrl).catch(() =>
      Linking.openURL('https://play.google.com/store/apps/details?id=com.dhrumil212.jaintirthdigdershika')
    );
  };

  const openFeedbackForm = () => {
    Linking.openURL('https://forms.gle/7WRtpuU8BCRfybPC7');
  };

  const openFeedbackForm1 = () => {
    Linking.openURL('https://docs.google.com/forms/d/1tdYawUJEOsfy6Px7FXZvzlJxnhTMH59v3spGIaJ1s4w/viewform');
  };

  if (!isVisible) return null;

  return (
    <View style={styles.drawerContainer}>
      <TouchableOpacity onPress={onClose} style={styles.overlay} />
      <View style={styles.drawerContent}>
        {/* Home */}
        <TouchableOpacity
          style={styles.drawerItemContainer}
          onPress={() => {
            navigation.navigate('TirthMandirGrid');
            onClose();
          }}
        >
          <Icon name="home" size={24} color="#007bff" style={styles.icon} />
          <Text style={styles.drawerItem}>Home</Text>
        </TouchableOpacity>

        {/* Calendar */}
        <TouchableOpacity
          style={styles.drawerItemContainer}
          onPress={() => {
            navigation.navigate('CalendarScreen');
            onClose();
          }}
        >
          <Icon name="event" size={24} color="#28a745" style={styles.icon} />
          <Text style={styles.drawerItem}>Calendar</Text>
        </TouchableOpacity>

        {/* Feedback Form */}
        <TouchableOpacity
          style={styles.drawerItemContainer}
          onPress={() => {
            openFeedbackForm();
            onClose();
          }}
        >
          <Icon name="feedback" size={24} color="#17a2b8" style={styles.icon} />
          <Text style={styles.drawerItem}>Tirth Vivaran Form</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.drawerItemContainer}
          onPress={() => {
            openFeedbackForm1();
            onClose();
          }}
        >
          <Icon name="feedback" size={24} color="#17a2b8" style={styles.icon} />
          <Text style={styles.drawerItem}>Mandir Vivaran Form</Text>
        </TouchableOpacity>

        {/* Share */}
        <TouchableOpacity
          style={styles.drawerItemContainer}
          onPress={() => {
            handleShare();
            onClose();
          }}
        >
          <Icon name="share" size={24} color="#ffc107" style={styles.icon} />
          <Text style={styles.drawerItem}>Share App</Text>
        </TouchableOpacity>

        {/* Rate */}
        <TouchableOpacity
          style={styles.drawerItemContainer}
          onPress={() => {
            handleRateApp();
            onClose();
          }}
        >
          <Icon name="star-rate" size={24} color="#ff5722" style={styles.icon} />
          <Text style={styles.drawerItem}>Rate App</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  drawerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  drawerContent: {
    width: 260,
    backgroundColor: '#ffffff',
    height: '100%',
    paddingTop: 50,
    paddingLeft: 20,
    paddingRight: 10,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    elevation: 10,
  },
  drawerItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 5,
    borderBottomWidth: 0.5,
    borderColor: '#ddd',
  },
  drawerItem: {
    fontSize: 18,
    marginLeft: 15,
    color: '#343a40',
    fontWeight: '500',
  },
  icon: {
    width: 28,
  },
});

export default DrawerMenu;
