import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';

export default function BusinessInfoScreen() {
  // Dummy data
  const ownerName = 'Juan Dela Cruz';
  const ownerAddress = '123 Main St, Barangay Uno, City';
  const businessType = 'Sari-Sari Store';
  const businessName = 'Dela Cruz Store';
  const businessAddress = '456 Market Rd, Barangay Uno, City';
  const contactNumber = '0917-123-4567';
  const isActive = true;

  return (
    <ScrollView style={styles.container}>
      {/* Owner's Information */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Owner's Information</ThemedText>
        <View style={styles.infoRow}>
          <Ionicons name="person-circle" size={24} color="#FF3D33" style={styles.icon} />
          <ThemedText style={styles.infoText}>{ownerName}</ThemedText>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="location-sharp" size={22} color="#FFA333" style={styles.icon} />
          <ThemedText style={styles.infoText}>{ownerAddress}</ThemedText>
        </View>
      </View>

      {/* Business Information */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Business Information</ThemedText>
        <View style={styles.infoRow}>
          <FontAwesome5 name="store" size={20} color="#FF3D33" style={styles.icon} />
          <ThemedText style={styles.infoText}>{businessType}</ThemedText>
        </View>
        <View style={styles.infoRow}>
          <MaterialIcons name="business-center" size={22} color="#FFA333" style={styles.icon} />
          <ThemedText style={styles.infoText}>{businessName}</ThemedText>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={22} color="#FF3D33" style={styles.icon} />
          <ThemedText style={styles.infoText}>{businessAddress}</ThemedText>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="call" size={20} color="#FFA333" style={styles.icon} />
          <ThemedText style={styles.infoText}>{contactNumber}</ThemedText>
        </View>
        <View style={styles.infoRow}>
          <Ionicons
            name={isActive ? 'checkmark-circle' : 'close-circle'}
            size={22}
            color={isActive ? '#22c55e' : '#ef4444'}
            style={styles.icon}
          />
          <ThemedText style={[styles.infoText, { color: isActive ? '#22c55e' : '#ef4444', fontWeight: 'bold' }]}>
            {isActive ? 'Active' : 'Inactive'}
          </ThemedText>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginHorizontal: 16,
    marginTop: 18,
    marginBottom: 12,
    padding: 18,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#FF3D33',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  icon: {
    marginRight: 10,
  },
  infoText: {
    fontSize: 15,
    color: '#374151',
    flexShrink: 1,
  },
});