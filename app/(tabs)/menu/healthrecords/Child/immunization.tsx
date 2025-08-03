import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import CustomTable from '@/components/ui/CustomTable';
import { ThemedText } from '@/components/ThemedText';

const vaccineData = [
  { vaccine: 'BCG', atBirth: '✓', firstDose: '', secondDose: '', thirdDose: '' },
  { vaccine: 'Hepa B', atBirth: '✓', firstDose: '', secondDose: '', thirdDose: '' },
  { vaccine: 'DPT-HepB-HiB', atBirth: '', firstDose: '✓', secondDose: '✓', thirdDose: '✓' },
  { vaccine: 'Oral Polio', atBirth: '', firstDose: '✓', secondDose: '✓', thirdDose: '✓' },
  { vaccine: 'IPV', atBirth: '', firstDose: '✓', secondDose: '✓', thirdDose: '' },
  { vaccine: 'MMR', atBirth: '', firstDose: '✓', secondDose: '', thirdDose: '' },
  { vaccine: 'PCV 13', atBirth: '', firstDose: '✓', secondDose: '✓', thirdDose: '✓' },
  { vaccine: 'Vit K', atBirth: '✓', firstDose: '', secondDose: '', thirdDose: '' },
];

const columns = [
  { title: 'Vaccine', dataIndex: 'vaccine', flex: 2 },
  { title: 'At Birth', dataIndex: 'atBirth', flex: 1 },
  { title: '1st Dose', dataIndex: 'firstDose', flex: 1 },
  { title: '2nd Dose', dataIndex: 'secondDose', flex: 1 },
  { title: '3rd Dose', dataIndex: 'thirdDose', flex: 1 },
];

export default function ImmunizationScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.infoBox}>
        <ThemedText type="subtitle" style={styles.title}>
          Child Immunization Record
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Track your child&apos;s immunization schedule and doses.
        </ThemedText>
      </View>
      <CustomTable columns={columns} data={vaccineData} />
      <View style={styles.noteBox}>
        <ThemedText style={styles.noteTitle}>Legend:</ThemedText>
        <ThemedText style={styles.noteText}>✓ — Dose given</ThemedText>
        <ThemedText style={styles.noteText}>Blank — Not yet given</ThemedText>
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
    fontSize: 20,
    color: '#FF3D33',
    marginBottom: 4,
    letterSpacing: 0.5,
    fontFamily: 'PoppinsBold',
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