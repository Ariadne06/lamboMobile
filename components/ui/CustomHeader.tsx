import NotificationBell from '@/components/NotificationBell';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Platform, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';

type CustomHeaderProps = {
  title: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  showNotificationBell?: boolean;
};

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 24;
const HEADER_HEIGHT = 56;

export default function CustomHeader({ 
  title, 
  showBackButton = true,
  onBackPress,
  showNotificationBell = false,
}: CustomHeaderProps) {
  const router = useRouter();

 
  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      // Fallback: navigate to menu if no history
      router.back();
    }
  };

  return (
    <View style={styles.safeArea}>
      <StatusBar 
        backgroundColor="#FF3D33" 
        barStyle="light-content" 
        translucent={true}
      />
      <View style={styles.container}>
        <View style={styles.header}>
          {showBackButton ? (
            <TouchableOpacity
              onPress={handleBackPress} 
              style={styles.backButton}
              accessibilityLabel="Go back"
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          ) : (
            <View style={styles.iconPlaceholder} />
          )}
          <View style={styles.titleContainer}>
            <ThemedText type="default" style={styles.title} numberOfLines={1} ellipsizeMode="tail">
              {title}
            </ThemedText>
          </View>
          {showNotificationBell ? (
            <NotificationBell size={24} color="#fff" />
          ) : (
            <View style={styles.iconPlaceholder} />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#f9fafb', 
    zIndex: 1,
  },
  container: {
    height: STATUSBAR_HEIGHT + HEADER_HEIGHT,
    backgroundColor: '#FF3D33',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    paddingTop: STATUSBAR_HEIGHT,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  header: {
    height: HEADER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    textAlign: 'center',
  },
  iconPlaceholder: {
    width: 40,
  }
});