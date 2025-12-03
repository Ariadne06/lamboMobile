import React from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import CustomHeader from '@/components/ui/CustomHeader';
import { showLogoutConfirmation } from '@/utils/auth';

export default function BHWMenu() {
  const router = useRouter();
  const { width } = Dimensions.get('window');
  const BUTTON_WIDTH = Math.min(width * 0.92, 400);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <ScrollView style={styles.scroll}>
        <CustomHeader title="BHW Menu" showBackButton={false} />
        <View style={styles.container}>        
          
          <ThemedText style={styles.sectionTitle}>Community Management</ThemedText>
          <View style={styles.section}>
            <TouchableOpacity style={[styles.button, { width: BUTTON_WIDTH }]} 
              onPress={() => router.push('/menu/householdmenu')}>
              <View style={styles.buttonContent}>
                <Ionicons name="home-outline" size={24} color="#1e293b" />
                <ThemedText style={styles.buttonText}>Household Record</ThemedText>
              </View>
            </TouchableOpacity>
          </View>

          <ThemedText style={styles.sectionTitle}>Health Records</ThemedText>
          <View style={styles.section}>
            <TouchableOpacity style={[styles.button, { width: BUTTON_WIDTH }]}
             onPress={() => router.push('/(bhw)/maternal-health')}>
              <View style={styles.buttonContent}>
                <Ionicons name="heart-outline" size={24} color="#1e293b" />
                <ThemedText style={styles.buttonText}>Maternal Health Record</ThemedText>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, { width: BUTTON_WIDTH }]}
              onPress={() => router.push('/(bhw)/child-health')}
            >
              <View style={styles.buttonContent}>
                <Ionicons name="medical-outline" size={24} color="#1e293b" />
                <ThemedText style={styles.buttonText}>Child Health Record</ThemedText>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, { width: BUTTON_WIDTH }]}
              onPress={() => router.push('/(bhw)/immunization-schedule')}
            >
              <View style={styles.buttonContent}>
                <Ionicons name="calendar-outline" size={24} color="#1e293b" />
                <ThemedText style={styles.buttonText}>Immunization Schedule</ThemedText>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, { width: BUTTON_WIDTH }]}
              onPress={() => router.push('/(bhw)/general-health')}
            >
              <View style={styles.buttonContent}>
                <Ionicons name="clipboard-outline" size={24} color="#1e293b" />
                <ThemedText style={styles.buttonText}>General Health Information</ThemedText>
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