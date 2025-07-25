import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, StatusBar } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';


export default function AnnounecmentScreen() {

  const announcements = [
    {
      id: 1,
      date: 'July 25, 2025',
      text: 'Barangay Cansaga will hold a community clean-up drive this Saturday at 7:00 AM. All residents are encouraged to participate.',
    },

    {
      id: 2,
      date: 'June 13, 2025',
      text: 'Ayuda',
    },
    {
      id: 3,
      date: 'May 30, 2025',
      text: 'Vaccine',
    },
    {
      id: 4,
      date: 'May 15, 2025',
      text: 'Pulong-pulong',
    },
    {
      id: 5,
      date: 'April 20, 2025',
      text: 'Scatter',
    },
    {
      id: 6,
      date: 'March 10, 2025',
      text: 'Bingo Plus my location',
    },

   
  ];
  
   return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <StatusBar backgroundColor="#1e40af" barStyle="light-content" />
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>Announcements</ThemedText>
          <ThemedText style={styles.subtitle}>Stay updated with Barangay Cansaga</ThemedText>
        </View>

        {announcements.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off" size={60} color="#d1d5db" />
            <ThemedText style={styles.emptyText}>No announcements yet!</ThemedText>
          </View>
        ) : (
          announcements.map((item) => (
            <View key={item.id} style={styles.announcementCard}>
              <View style={styles.cardHeader}>
                <Ionicons name="calendar" size={18} color="#FF3D33" />
                <Text style={styles.dateBadge}>{item.date}</Text>
              </View>
              {/* Removed image rendering */}
              <ThemedText style={styles.announcementText}>{item.text}</ThemedText>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 20,
    backgroundColor: '#1e40af',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#e0e7ff',
  },

  dateLineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
    marginHorizontal: 24,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#d1d5db',
  },
  dateText: {
    marginHorizontal: 12,
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '600',
  },
   cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateBadge: {
    backgroundColor: '#FF3D33',
    color: '#fff',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 2,
    marginLeft: 6,
    fontSize: 13,
    fontWeight: 'bold',
  },
  announcementCard: {
    backgroundColor: '#fff',
    marginHorizontal: 24,
    marginBottom: 24,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 16,
    marginTop: 12,
  },
  announcementText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 22,
  },

 

});
