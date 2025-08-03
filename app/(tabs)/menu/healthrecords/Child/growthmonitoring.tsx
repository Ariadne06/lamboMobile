import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import CustomTable from '@/components/ui/CustomTable';
import { ThemedText } from '@/components/ThemedText';

const growthData = [
  { hw: '80kg/30cm', date: '01/02/2020', age: '4', temp: '36.7', note: 'None' },
  { hw: '78kg/29cm', date: '03/02/2021', age: '6', temp: '35.7', note: 'None' },
  { hw: '82kg/31cm', date: '01/04/2021', age: '7', temp: '35.7', note: 'None' },
];

const columns = [
  { title: 'Height/Weight', dataIndex: 'hw', flex: 2 },
  { title: 'Date', dataIndex: 'date', flex: 1 },
  { title: 'Age (mos)', dataIndex: 'age', flex: 1 },
  { title: 'Temp', dataIndex: 'temp', flex: 1 },
  { title: 'Note', dataIndex: 'note', flex: 2 },
];

export default function GrowthMonitoringScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.infoBox}>
        <ThemedText type="subtitle" style={styles.title}>Growth Monitoring</ThemedText>
        <ThemedText style={styles.subtitle}>
          Track your child&apos;s height, weight, temperature, and growth notes.
        </ThemedText>
      </View>
      <CustomTable columns={columns} data={growthData} />
      <View style={styles.noteBox}>
        <ThemedText style={styles.noteTitle}>Note:</ThemedText>
        <ThemedText style={styles.noteText}>
          Regular monitoring helps ensure your child&apos;s healthy development.
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