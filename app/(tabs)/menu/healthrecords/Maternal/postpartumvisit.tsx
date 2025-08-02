import React, { useState } from 'react';
import { ScrollView, View, StyleSheet, Modal, Pressable } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import CustomTable from '@/components/ui/CustomTable';

const postpartumData = [
  { hw: '80kg/30cm', date: '01/02/2020', vitals: '4', note: 'None' },
  { hw: '80kg/30cm', date: '01/02/2020', vitals: '5', note: 'Fever' },
  { hw: '80kg/30cm', date: '01/02/2020', vitals: '6', note: 'None' },
  { hw: '80kg/30cm', date: '01/02/2020', vitals: '7', note: 'Fever' },
];

export default function PostPartumVisitScreen() {
  const [modalVisible, setModalVisible] = useState(false);

    const columns = [
    { title: 'Height/Weight', dataIndex: 'hw', flex: 2 },
    { title: 'Date', dataIndex: 'date', flex: 1 },
    { title: 'Vitals', dataIndex: 'vitals', flex: 1 },
    { title: 'Note', dataIndex: 'note', flex: 2 },
    {
        title: 'Action',
        dataIndex: 'action',
        flex: 1,
        render: (_: any, row: any) => (
        <Pressable onPress={() => setModalVisible(true)}>
            <ThemedText style={styles.actionDots}>●●●</ThemedText>
        </Pressable>
        ),
    },
];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.infoBox}>
        <ThemedText type="subtitle" style={styles.title}>
          Postpartum Visit
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Review your postpartum checkup and supplement details.
        </ThemedText>
      </View>
      <CustomTable columns={columns} data={postpartumData} />
      <View style={styles.noteBox}>
        <ThemedText style={styles.noteTitle}>Note:</ThemedText>
        <ThemedText style={styles.noteText}>
          Regular postpartum visits help ensure your recovery and your baby's health. Contact your healthcare provider if you notice any unusual symptoms.
        </ThemedText>
      </View>
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ThemedText type="subtitle" style={styles.modalTitle}>
              Micronutrients Supplement
            </ThemedText>
            <View style={styles.modalRow}>
              <ThemedText style={styles.modalLabel}>Supplement type:</ThemedText>
              <ThemedText style={styles.modalValue}>Iron</ThemedText>
            </View>
            <View style={styles.modalRow}>
              <ThemedText style={styles.modalLabel}>Date Given:</ThemedText>
              <ThemedText style={styles.modalValue}>01/01/2021</ThemedText>
            </View>
            <View style={styles.modalRow}>
              <ThemedText style={styles.modalLabel}>Given During:</ThemedText>
              <ThemedText style={styles.modalValue}>Postpartum</ThemedText>
            </View>
            <View style={styles.modalRow}>
              <ThemedText style={styles.modalLabel}>Number of Tablet:</ThemedText>
              <ThemedText style={styles.modalValue}>10</ThemedText>
            </View>
            <Pressable style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <ThemedText style={styles.closeButtonText}>Close</ThemedText>
            </Pressable>
          </View>
        </View>
      </Modal>
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
  actionDots: {
    fontSize: 18,
    color: '#374151',
    textAlign: 'center',
    paddingVertical: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    elevation: 4,
  },
  modalTitle: {
    color: '#FF3D33',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  modalLabel: {
    color: '#64748b',
    fontSize: 15,
    fontFamily: 'PoppinsRegular',
    flex: 2,
  },
  modalValue: {
    color: '#FF3D33',
    fontSize: 15,
    fontFamily: 'PoppinsBold',
    flex: 1,
    textAlign: 'right',
  },
  closeButton: {
    marginTop: 18,
    backgroundColor: '#FF3D33',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
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