import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';

const supplementData = [
  { type: 'Vitamin A', date: '01/02/2020', age: '4', givenBy: 'Bugtai' },
  { type: 'Vitamin C', date: '01/02/2020', age: '6', givenBy: 'Villarta' },
  { type: 'Deworming', date: '01/02/2020', age: '7', givenBy: 'Arranchado' },
];

export default function SupplementsScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.infoBox}>
        <ThemedText type="subtitle" style={styles.title}>Supplements Record</ThemedText>
        <ThemedText style={styles.subtitle}>Track your child's supplement intake history.</ThemedText>
      </View>
      <View style={styles.tableContainer}>
        <View style={styles.tableHeader}>
          <ThemedText style={[styles.cell, styles.headerCell, { flex: 2 }]}>Type</ThemedText>
          <ThemedText style={[styles.cell, styles.headerCell]}>Date</ThemedText>
          <ThemedText style={[styles.cell, styles.headerCell]}>Age</ThemedText>
          <ThemedText style={[styles.cell, styles.headerCell, { flex: 2 }]}>Given By</ThemedText>
        </View>
        {supplementData.map((row, idx) => (
          <View style={styles.tableRow} key={idx}>
            <ThemedText style={[styles.cell, { flex: 2 }]}>{row.type}</ThemedText>
            <ThemedText style={styles.cell}>{row.date}</ThemedText>
            <ThemedText style={styles.cell}>{row.age}</ThemedText>
            <ThemedText style={[styles.cell, { flex: 2 }]}>{row.givenBy}</ThemedText>
          </View>
        ))}
      </View>
      <View style={styles.noteBox}>
        <ThemedText style={styles.noteTitle}>Note:</ThemedText>
        <ThemedText style={styles.noteText}>
          Supplements are important for your child's health. Please consult your health provider for more information.
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
  tableContainer: {
    backgroundColor: '#fff',
    borderRadius: 14,
    margin: 16,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingBottom: 6,
    marginBottom: 2,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f9fafb',
  },
  cell: {
    flex: 1,
    fontSize: 15,
    color: '#374151',
    textAlign: 'left',
    paddingHorizontal: 4,
    fontFamily: 'PoppinsRegular',
  },
  headerCell: {
    fontWeight: 'bold',
    color: '#FF3D33',
    fontSize: 15,
    fontFamily: 'PoppinsBold',
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