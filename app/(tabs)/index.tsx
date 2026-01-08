import { ThemedText } from '@/components/ThemedText';
import CustomHeader from '@/components/ui/CustomHeader';
import { showLogoutConfirmation } from '@/utils/auth';
import { fetchResidentProfile, ResidentProfile } from '@/utils/profileService';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Dimensions, SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
  const { width } = Dimensions.get('window');
  const BUTTON_WIDTH = Math.min(width * 0.92, 400);
  const [profile, setProfile] = useState<ResidentProfile | null>(null);
  const [isResident, setIsResident] = useState(true); // Show all by default

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const profileData = await fetchResidentProfile();
      if (profileData) {
        setProfile(profileData);
        // Hide features if status is "Relocated" or "Non-Resident"
        const allowedStatuses = ['Resident'];
        setIsResident(allowedStatuses.includes(profileData.resident_status));
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <ScrollView style={styles.scroll}>
        <CustomHeader title="Menu" showBackButton={false} showNotificationBell={true} />
        <View style={styles.container}>        
          <ThemedText style={styles.sectionTitle}>Services</ThemedText>
          <View style={styles.section}>
            {isResident && (
              <TouchableOpacity 
                style={[styles.button, { width: BUTTON_WIDTH }]} 
                onPress={() => router.push('/(tabs)/household/household')}>
                <View style={styles.buttonContent}>
                  <Ionicons name="home-outline" size={24} color="#1e293b" />
                  <ThemedText style={styles.buttonText}>Household Information</ThemedText>
                </View>
              </TouchableOpacity>
            )}

            <TouchableOpacity 
              style={[styles.button, { width: BUTTON_WIDTH }]} 
              onPress={() => router.push('/(tabs)/transactions' as any)}>
              <View style={styles.buttonContent}>
                <Ionicons name="receipt-outline" size={24} color="#1e293b" />
                <ThemedText style={styles.buttonText}>Transaction History</ThemedText>
              </View>
            </TouchableOpacity>

            {isResident && (
              <TouchableOpacity 
                style={[styles.button, { width: BUTTON_WIDTH }]} 
                onPress={() => router.push('/(tabs)/health')}>
                <View style={styles.buttonContent}>
                  <Ionicons name="medkit-outline" size={22} color="#1e293b" />
                  <ThemedText style={styles.buttonText}>Health Records</ThemedText>
                </View>
              </TouchableOpacity>
            )}

            <TouchableOpacity 
              style={[styles.button, { width: BUTTON_WIDTH }]} 
              onPress={() => router.push('/(tabs)/business/business')}>
              <View style={styles.buttonContent}>
                <Ionicons name="storefront-outline" size={24} color="#1e293b" />
                <ThemedText style={styles.buttonText}>Business Info</ThemedText>
              </View>
            </TouchableOpacity>

            {isResident && (
              <TouchableOpacity 
                style={[styles.button, { width: BUTTON_WIDTH }]} 
                onPress={() => router.push('/(tabs)/documents')}>
                <View style={styles.buttonContent}>
                  <Ionicons name="documents-outline" size={24} color="#1e293b" />
                  <ThemedText style={styles.buttonText}>Certificate & Clearance Request</ThemedText>
                </View>
              </TouchableOpacity>
            )}
          </View>

          <ThemedText style={styles.sectionTitle}>Account</ThemedText>
          <View style={styles.section}>
            <TouchableOpacity 
              style={[styles.button, { width: BUTTON_WIDTH }]} 
              onPress={() => router.push('/(tabs)/profile/profile')}>
              <View style={styles.buttonContent}>
                <Ionicons name="person-outline" size={24} color="#1e293b" />
                <ThemedText style={styles.buttonText}>Profile</ThemedText>
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[styles.button, styles.logoutButton, { width: BUTTON_WIDTH * 0.5 }]} 
            onPress={showLogoutConfirmation}>
            <View style={styles.buttonContent}>
              <Ionicons name="log-out-outline" size={24} color="#FF3D33" />
              <ThemedText style={[styles.buttonText, { color: '#FF3D33' }]}>Logout</ThemedText>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
    alignSelf: 'flex-start',
    marginLeft: 12,
    marginTop: 8,
    marginBottom: 12,
  },
  section: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 18,
    marginBottom: 12,
    alignItems: 'flex-start',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 16,
    flexShrink: 1,
  },
  logoutButton: {
    marginTop: 12,
    borderColor: '#FF3D33',
    borderRadius: 20,
  },
});
