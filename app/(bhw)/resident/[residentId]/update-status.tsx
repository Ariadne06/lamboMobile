// import React, { useState, useEffect } from 'react';
// import { SafeAreaView, TextInput, TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { useRoute } from 'expo-router';  // For accessing the route params
// import axios from 'axios';
// import { API_BASE_URL } from '@/constants/apiConfig';  // Ensure correct API URL

// const UpdateStatus: React.FC = () => {
//   const router = useRoute();
  
//   // Access residentId from the URL using router.query
//   const { residentId } = router.query as { residentId: string };  // Ensure it's a string

//   const [newStatusId, setNewStatusId] = useState<number>(2); // Default value for status
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     if (residentId) {
//       // You can fetch current status or details for the resident here if needed
//     }
//   }, [residentId]);

//   const handleUpdateStatus = async () => {
//     const residentIdInt = parseInt(residentId, 10);  // Convert residentId to an integer

//     if (isNaN(residentIdInt)) {
//       console.error('Invalid residentId');
//       alert('Invalid residentId');
//       return;
//     }

//     setLoading(true);
//     try {
//       const response = await axios.post(`${API_BASE_URL}/household_api/residents/${residentIdInt}/update-status/`, {
//         status_id: newStatusId,
//       });

//       if (response.data.success) {
//         alert('Status updated successfully!');
//         router.push('/(bhw)/resident');  // Navigate back to the resident list
//       } else {
//         alert('Failed to update status');
//       }
//     } catch (error) {
//       console.error('Error updating status:', error);
//       alert('Error updating status');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       {/* Back Button */}
//       <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
//         <Ionicons name="chevron-back" size={24} color="#fff" />
//         <Text style={styles.backButtonText}>Back</Text>
//       </TouchableOpacity>

//       <Text style={styles.cardTitle}>Update Resident Status</Text>

//       {/* Input for new status */}
//       <TextInput
//         style={styles.input}
//         value={newStatusId.toString()}
//         onChangeText={(text) => setNewStatusId(parseInt(text))}
//         keyboardType="numeric"
//         placeholder="Enter status ID (e.g., 1 for Active)"
//       />

//       {/* Update Button */}
//       <TouchableOpacity
//         style={styles.updateButton}
//         onPress={handleUpdateStatus}
//         disabled={loading}
//       >
//         {loading ? (
//           <Text style={styles.updateButtonText}>Updating...</Text>
//         ) : (
//           <Text style={styles.updateButtonText}>Update Status</Text>
//         )}
//       </TouchableOpacity>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 16,
//     backgroundColor: '#fff',
//   },
//   backButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#EF4444',  // Red background for back button
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     borderRadius: 8,
//     marginBottom: 20,
//   },
//   backButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '600',
//     marginLeft: 10,
//   },
//   cardTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#333',
//     marginBottom: 8,
//   },
//   input: {
//     backgroundColor: '#f0f0f0',
//     padding: 12,
//     marginBottom: 12,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: '#ddd',
//   },
//   updateButton: {
//     backgroundColor: '#EF4444',
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   updateButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '600',
//   },
// });

// export default UpdateStatus;
