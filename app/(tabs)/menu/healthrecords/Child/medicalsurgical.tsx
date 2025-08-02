import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import CustomTable from '@/components/ui/CustomTable';

const medicalHistoryData = [
  { condition: 'Asthma', notes: 'Diagnosed 2019' },
  { condition: 'Allergy', notes: 'Penicillin' },
];

const medicalColumns = [
  { title: 'Condition', dataIndex: 'condition', flex: 2 },
  { title: 'Notes', dataIndex: 'notes', flex: 3 },
];

const surgicalHistoryData = [
  { procedure: 'Appendectomy', notes: 'Done in 2018' },
];

const surgicalColumns = [
  { title: 'Procedure', dataIndex: 'procedure', flex: 2 },
  { title: 'Notes', dataIndex: 'notes', flex: 3 },
];

export default function MedicalSurgicalScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.infoBox}>
        <ThemedText type="subtitle" style={styles.title}>Medical & Surgical History</ThemedText>
        <ThemedText style={styles.subtitle}>
          Review your child's past medical conditions and surgical procedures.
        </ThemedText>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Medical History</ThemedText>
        <CustomTable columns={medicalColumns} data={medicalHistoryData} />
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Surgical History</ThemedText>
        <CustomTable columns={surgicalColumns} data={surgicalHistoryData} />
      </View>

      <View style={styles.noteBox}>
        <ThemedText style={styles.noteTitle}>Note:</ThemedText>
        <ThemedText style={styles.noteText}>
          Keeping an updated record of medical and surgical history helps healthcare providers give the best care for your child.
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
  section: {
    marginTop: 10,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 17,
    color: '#FF3D33',
    fontWeight: 'bold',
    marginLeft: 22,
    marginBottom: 2,
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