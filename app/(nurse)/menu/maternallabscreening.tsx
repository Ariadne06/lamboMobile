import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  FlatList,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { router, useLocalSearchParams } from 'expo-router';

type LabScreeningRecord = {
  id: string;
  date: string;
  result: string;
  testDetails: {
    testType: string;
    date: string;
    result: string;
    ironGiven: boolean;
    ironType?: string;
    ironQuantity?: string;
    notes?: string;
  };
};

const labScreeningRecords: LabScreeningRecord[] = [
  {
    id: '1',
    date: '2023-08-20',
    result: 'Normal',
    testDetails: {
      testType: 'Complete Blood Count (CBC)',
      date: '2023-08-20',
      result: 'Hgb: 11.5 g/dL, Hct: 34%, Normal WBC and platelets',
      ironGiven: true,
      ironType: 'Ferrous Sulfate',
      ironQuantity: '60mg daily',
      notes: 'Mild anemia detected. Iron supplementation started.',
    },
  },
  {
    id: '2',
    date: '2023-09-25',
    result: 'Normal',
    testDetails: {
      testType: 'Urinalysis',
      date: '2023-09-25',
      result: 'No protein, glucose, or bacteria detected',
      ironGiven: false,
      notes: 'Routine urinalysis - all parameters within normal limits',
    },
  },
  {
    id: '3',
    date: '2023-11-10',
    result: 'Improved',
    testDetails: {
      testType: 'Follow-up CBC',
      date: '2023-11-10',
      result: 'Hgb: 12.2 g/dL, Hct: 36%, Normal WBC and platelets',
      ironGiven: true,
      ironType: 'Ferrous Sulfate',
      ironQuantity: '60mg daily',
      notes: 'Hemoglobin levels improved with iron supplementation. Continue iron.',
    },
  },
  {
    id: '4',
    date: '2023-12-15',
    result: 'Normal',
    testDetails: {
      testType: 'Glucose Tolerance Test (GTT)',
      date: '2023-12-15',
      result: 'Fasting: 85 mg/dL, 1hr: 140 mg/dL, 2hr: 120 mg/dL',
      ironGiven: false,
      notes: 'Glucose tolerance test normal. No gestational diabetes.',
    },
  },
];

const LabScreeningCard = ({ 
  record, 
  onPress 
}: { 
  record: LabScreeningRecord; 
  onPress: () => void;
}) => (
  <Pressable style={styles.labCard} onPress={onPress}>
    <View style={styles.cardHeader}>
      <View style={styles.iconContainer}>
        <Ionicons name="flask" size={24} color="#FF3D33" />
      </View>
      <View style={styles.labInfo}>
        <ThemedText type="defaultSemiBold" style={styles.labDate}>
          {new Date(record.date).toLocaleDateString()}
        </ThemedText>
        <ThemedText style={styles.testType}>
          {record.testDetails.testType}
        </ThemedText>
      </View>
      <View style={styles.resultContainer}>
        <ThemedText style={styles.resultText}>{record.result}</ThemedText>
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      </View>
    </View>
    
    {record.testDetails.ironGiven && (
      <View style={styles.ironIndicator}>
        <Ionicons name="nutrition" size={16} color="#10B981" />
        <ThemedText style={styles.ironText}>Iron supplementation given</ThemedText>
      </View>
    )}
  </Pressable>
);

const DetailModal = ({ 
  visible, 
  record, 
  onClose 
}: { 
  visible: boolean; 
  record: LabScreeningRecord | null; 
  onClose: () => void;
}) => {
  if (!record) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <ThemedText type="title" style={styles.modalTitle}>
            Lab Test Details
          </ThemedText>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </Pressable>
        </View>
        
        <View style={styles.modalContent}>
          <View style={styles.detailSection}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Test Information
            </ThemedText>
            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Test Type</ThemedText>
              <ThemedText style={styles.detailValue}>{record.testDetails.testType}</ThemedText>
            </View>
            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Date</ThemedText>
              <ThemedText style={styles.detailValue}>
                {new Date(record.testDetails.date).toLocaleDateString()}
              </ThemedText>
            </View>
            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Result</ThemedText>
              <ThemedText style={styles.detailValue}>{record.testDetails.result}</ThemedText>
            </View>
          </View>
          
          {record.testDetails.ironGiven && (
            <View style={styles.detailSection}>
              <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                Iron Supplementation
              </ThemedText>
              <View style={styles.detailRow}>
                <ThemedText style={styles.detailLabel}>Iron Type</ThemedText>
                <ThemedText style={styles.detailValue}>{record.testDetails.ironType}</ThemedText>
              </View>
              <View style={styles.detailRow}>
                <ThemedText style={styles.detailLabel}>Quantity</ThemedText>
                <ThemedText style={styles.detailValue}>{record.testDetails.ironQuantity}</ThemedText>
              </View>
            </View>
          )}
          
          {record.testDetails.notes && (
            <View style={styles.detailSection}>
              <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                Notes
              </ThemedText>
              <ThemedText style={styles.notesText}>{record.testDetails.notes}</ThemedText>
            </View>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default function MaternalLabScreening() {
  const { maternalData } = useLocalSearchParams();
  const maternal = JSON.parse(maternalData as string);
  const [selectedRecord, setSelectedRecord] = useState<LabScreeningRecord | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleRecordPress = (record: LabScreeningRecord) => {
    setSelectedRecord(record);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedRecord(null);
  };

  const renderRecord = ({ item }: { item: LabScreeningRecord }) => (
    <LabScreeningCard
      record={item}
      onPress={() => handleRecordPress(item)}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </Pressable>
        <View style={styles.headerInfo}>
          <ThemedText type="title" style={styles.headerTitle}>
            Lab Screening + Iron
          </ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            {maternal.firstName} - {maternal.residentId}
          </ThemedText>
        </View>
      </View>

      <FlatList
        data={labScreeningRecords}
        keyExtractor={(item) => item.id}
        renderItem={renderRecord}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="flask-outline" size={48} color="#D1D5DB" />
            <ThemedText style={styles.emptyText}>No lab screening records found</ThemedText>
          </View>
        }
      />

      <DetailModal
        visible={modalVisible}
        record={selectedRecord}
        onClose={closeModal}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  listContainer: {
    padding: 20,
  },
  labCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  labInfo: {
    flex: 1,
  },
  labDate: {
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 2,
  },
  testType: {
    fontSize: 12,
    color: '#6B7280',
  },
  resultContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultText: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
    marginRight: 8,
  },
  ironIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 8,
    borderRadius: 8,
  },
  ironText: {
    fontSize: 12,
    color: '#10B981',
    marginLeft: 6,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    color: '#1F2937',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  detailSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
    flex: 2,
    textAlign: 'right',
  },
  notesText: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    color: '#9CA3AF',
    marginTop: 16,
    fontWeight: '600',
  },
});