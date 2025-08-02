import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import CustomTable from '@/components/ui/CustomTable';

const columns = [
  { title: 'Test Type', dataIndex: 'testType', flex: 2 },
  { title: 'Date', dataIndex: 'date', flex: 1 },
  { title: 'Result', dataIndex: 'result', flex: 1 },
  { title: 'Iron Given', dataIndex: 'ironGiven', flex: 1 },
];

const data: any[] = [];

export default function LabScreeningIronScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.infoBox}>
        <ThemedText type="subtitle" style={styles.title}>
          Iron Laboratory Screening
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          View your iron laboratory screening results and iron supplementation records.
        </ThemedText>
      </View>
      <CustomTable columns={columns} data={data} />
      <View style={styles.noteBox}>
        <ThemedText style={styles.noteTitle}>Note:</ThemedText>
        <ThemedText style={styles.noteText}>
          Regular iron screening helps monitor your health during pregnancy. Please consult your healthcare provider for interpretation of results.
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