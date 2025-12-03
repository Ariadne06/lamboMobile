import React, { useState, useEffect } from 'react';
import { SafeAreaView, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Text, View } from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';  // Use Expo Router for navigation
import { Ionicons } from '@expo/vector-icons';  // For Back button
import { API_BASE_URL } from '@/constants/apiConfig';  // Ensure correct API URL

interface Resident {
  resident_id: number;
  resident_code: string;
  full_name: string;
  sex: string;
  status_name: string;
  family_code: string | null;
}

const ResidentListScreen: React.FC = () => {
  const [residents, setResidents] = useState<Resident[]>([]);  // State to hold resident data
  const [loading, setLoading] = useState(true);  // State for loading status
  const router = useRouter();  // Initialize the router

  useEffect(() => {
    fetchResidents();  // Fetch data when the component mounts
  }, []);

  // Function to fetch residents from the backend API
  const fetchResidents = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/household_api/residents/`);
      setResidents(response.data.residents);  // Update residents state with fetched data
    } catch (error) {
      console.error('Error fetching residents:', error);
    } finally {
      setLoading(false);  // Set loading to false after fetching
    }
  };

  // Function to handle the back navigation to (bhw)/menu
  const handleBackPress = () => {
    router.push('/(bhw)/menu');  // Navigate to the (bhw)/menu screen
  };

  // Function to get color based on the status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Deceased':
        return '#EF4444';  // Red for Deceased
      case 'Pending':
        return '#F59E0B';  // Yellow for Pending
      case 'Relocated':
        return '#3B82F6';  // Blue for Relocated
      case 'Non-Resident':
        return '#9CA3AF';  // Gray for Non-Resident      
      default:
        return '#4CAF50';  // Green for other statuses (e.g., Active)
    }
  };

  // Function to render each resident's card
  const renderResidentCard = ({ item }: { item: Resident }) => {
    const statusColor = getStatusColor(item.status_name);

    return (
      <TouchableOpacity
        style={[styles.card, { borderColor: statusColor }]}  // Add color to the card border
      >
        <Text style={styles.cardTitle}>Resident Code: <Text style={[styles.redText, { color: statusColor }]}>{item.resident_code}</Text></Text>
        <Text style={styles.cardText}>Full Name: {item.full_name}</Text>
        <Text style={styles.cardText}>Sex: {item.sex}</Text>
        <Text style={styles.cardText}>Status: <Text style={[styles.cardText, { color: statusColor }]}>{item.status_name}</Text></Text>
      </TouchableOpacity>
    );
  };

  // Show loading indicator while fetching data
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#EF4444" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Back Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Residents</Text>
      </View>

      <FlatList
        data={residents}  // Pass the fetched resident data to FlatList
        renderItem={renderResidentCard}  // Render each resident in a card
        keyExtractor={(item) => item.resident_id.toString()}  // Unique key for each item
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',  // Red header background
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 6,
  },
  redText: {
    color: '#EF4444',  // Red color accent for important text
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ResidentListScreen;
