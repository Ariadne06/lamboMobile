import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import CustomTable from '@/components/ui/CustomTable';

const immunizationData = [
  { vaccine: '1st Dose', date: '01/01/2024', fim: 'Complete' },
  { vaccine: '2nd Dose', date: '02/01/2024', fim: 'Complete' },
  { vaccine: '3rd Dose', date: '03/01/2024', fim: 'Pending' },
  { vaccine: '4th Dose', date: '', fim: 'Pending' },
  { vaccine: '5th Dose', date: '', fim: 'Pending' },
  { vaccine: 'FIM Status', date: '', fim: 'Incomplete' },
];

const columns = [
  { title: 'Vaccine', dataIndex: 'vaccine', flex: 2 },
  { title: 'Date', dataIndex: 'date', flex: 1 },
  { title: 'FIM Status', dataIndex: 'fim', flex: 1 },
];

export default function ImmunizationScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.infoBox}>
        <ThemedText type="subtitle" style={styles.title}>
          Maternal Immunization Record
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Track your immunization doses and FIM status.
        </ThemedText>
      </View>
      <CustomTable columns={columns} data={immunizationData} />
      <View style={styles.noteBox}>
        <ThemedText style={styles.noteTitle}>Note:</ThemedText>
        <ThemedText style={styles.noteText}>
          Keeping your immunization record up to date helps protect you and your baby.
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