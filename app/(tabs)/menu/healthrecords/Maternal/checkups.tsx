import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';

const checkupData = [
  {
    trimester: '1',
    date: '05/05/25',
    aog: '20',
    height: '160cm',
    weight: '45kg',
    bp: '36.7',
    notes: 'None',
  },
  {
    trimester: '2',
    date: '',
    aog: '',
    height: '',
    weight: '',
    bp: '',
    notes: '',
  },
  {
    trimester: '3',
    date: '',
    aog: '',
    height: '',
    weight: '',
    bp: '',
    notes: '',
  },
];

export default function CheckupsScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.infoBox}>
        <ThemedText type="subtitle" style={styles.title}>Maternal Checkups</ThemedText>
        <ThemedText style={styles.subtitle}>
          Track your checkup details for each trimester.
        </ThemedText>
      </View>
      {checkupData.map((item, idx) => (
        <View style={styles.card} key={idx}>
          <View style={styles.row}>
            <ThemedText style={styles.label}>Trimester</ThemedText>
            <ThemedText style={styles.value}>{item.trimester}</ThemedText>
          </View>
          <View style={styles.row}>
            <ThemedText style={styles.label}>Date</ThemedText>
            <ThemedText style={styles.value}>{item.date || '-'}</ThemedText>
          </View>
          <View style={styles.row}>
            <ThemedText style={styles.label}>AOG</ThemedText>
            <ThemedText style={styles.value}>{item.aog || '-'}</ThemedText>
          </View>
          <View style={styles.row}>
            <ThemedText style={styles.label}>Height</ThemedText>
            <ThemedText style={styles.value}>{item.height || '-'}</ThemedText>
          </View>
          <View style={styles.row}>
            <ThemedText style={styles.label}>Weight</ThemedText>
            <ThemedText style={styles.value}>{item.weight || '-'}</ThemedText>
          </View>
          <View style={styles.row}>
            <ThemedText style={styles.label}>BP</ThemedText>
            <ThemedText style={styles.value}>{item.bp || '-'}</ThemedText>
          </View>
          <View style={styles.row}>
            <ThemedText style={styles.label}>Notes</ThemedText>
            <ThemedText style={styles.value}>{item.notes || '-'}</ThemedText>
          </View>
        </View>
      ))}
      <View style={styles.noteBox}>
        <ThemedText style={styles.noteTitle}>Note:</ThemedText>
        <ThemedText style={styles.noteText}>
          Regular checkups help ensure a healthy pregnancy for you and your baby.
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
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginHorizontal: 18,
    marginBottom: 18,
    padding: 18,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  label: {
    fontSize: 15,
    color: '#64748b',
    fontFamily: 'PoppinsRegular',
    flex: 2,
  },
  value: {
    fontSize: 16,
    color: '#FF3D33',
    fontFamily: 'PoppinsBold',
    flex: 1,
    textAlign: 'right',
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