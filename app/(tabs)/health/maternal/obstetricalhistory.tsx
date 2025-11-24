import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';

const obstetricalData = [
  { label: 'Gravida (Pregnancies)', value: '1' },
  { label: 'Para (Live Births)', value: '0' },
  { label: 'Abortion (Miscarriages)', value: '0' },
  { label: 'Last Menstrual Period', value: '01/01/2020' },
  { label: 'Expected Delivery Date', value: '01/01/2020' },
];

export default function ObstetricalHistoryScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.infoBox}>
        <ThemedText type="subtitle" style={styles.title}>
          Obstetrical History
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Overview of your pregnancy and delivery history.
        </ThemedText>
      </View>
      <View style={styles.card}>
        {obstetricalData.map((item, idx) => (
          <View style={styles.row} key={item.label}>
            <ThemedText style={styles.label}>{item.label}</ThemedText>
            <ThemedText style={styles.value}>{item.value}</ThemedText>
          </View>
        ))}
      </View>
      <View style={styles.noteBox}>
        <ThemedText style={styles.noteTitle}>Why is this important?</ThemedText>
        <ThemedText style={styles.noteText}>
          Accurate obstetrical history helps your healthcare provider monitor your pregnancy and provide the best care for you and your baby.
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
    paddingVertical: 12,
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