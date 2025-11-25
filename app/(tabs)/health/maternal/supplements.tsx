import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import CustomTable from '@/components/ui/CustomTable';

const supplementData = [
  { type: 'Vitamin A', date: '01/02/2020', quantity: '4', trimester: '1' },
  { type: 'Vitamin B', date: '02/12/2020', quantity: '5', trimester: '2' },
  { type: 'Vitamin C', date: '03/05/2020', quantity: '6', trimester: '3' },
];

const columns = [
  { title: 'Type', dataIndex: 'type', flex: 2 },
  { title: 'Date', dataIndex: 'date', flex: 1 },
  { title: 'Quantity', dataIndex: 'quantity', flex: 1 },
  { title: 'Trimester', dataIndex: 'trimester', flex: 1 },
];

export default function SupplementsScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.infoBox}>
        <ThemedText type="subtitle" style={styles.title}>Maternal Supplements</ThemedText>
        <ThemedText style={styles.subtitle}>
          Track your supplement intake by trimester.
        </ThemedText>
      </View>
      <CustomTable columns={columns} data={supplementData} />
      <View style={styles.noteBox}>
        <ThemedText style={styles.noteTitle}>Note:</ThemedText>
        <ThemedText style={styles.noteText}>
          Proper supplementation supports a healthy pregnancy. Always consult your healthcare provider.
        </ThemedText>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  infoBox: {
    backgroundColor: '#fff',
    borderRadius: 14,
    margin: 18,
    marginBottom: 8,
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  title: {
    color: '#FF3D33',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#374151',
    opacity: 0.85,
    marginBottom: 2,
    fontFamily: 'PoppinsRegular',
  },
  noteBox: {
    backgroundColor: '#fff7ed',
    borderRadius: 10,
    margin: 18,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#FFA333',
    elevation: 1,
  },
  noteTitle: {
    fontWeight: 'bold',
    color: '#FF3D33',
    marginBottom: 2,
    fontSize: 15,
    fontFamily: 'PoppinsBold',
  },
  noteText: {
    color: '#374151',
    fontSize: 14,
    marginLeft: 4,
    marginBottom: 1,
    fontFamily: 'PoppinsRegular',
  },
});