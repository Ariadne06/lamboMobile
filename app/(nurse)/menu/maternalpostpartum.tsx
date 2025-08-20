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

type PostpartumRecord = {
  id: string;
  date: string;
  height: number; // in cm
  weight: number; // in kg
  vitals: {
    bloodPressure: string;
    temperature: string;
    pulseRate: string;
    respiratoryRate: string;
  };
  notes: string;
  checkedBy: string;
  micronutrientSupplement: {
    supplementType: string;
    dateGiven: string;
    givenDuring: string;
    numberOfTablets: number;
  };
};

const postpartumRecords: PostpartumRecord[] = [
  {
    id: '1',
    date: '2024-02-05',
    height: 158,
    weight: 58,
    vitals: {
      bloodPressure: '120/80',
      temperature: '36.5°C',
      pulseRate: '72 bpm',
      respiratoryRate: '18/min',
    },
    notes: 'Patient is recovering well. No signs of infection. Breastfeeding established.',
    checkedBy: 'Dr. Maria Santos',
    micronutrientSupplement: {
      supplementType: 'Iron + Folic Acid',
      dateGiven: '2024-02-05',
      givenDuring: '1 week postpartum',
      numberOfTablets: 60,
    },
  },
  {
    id: '2',
    date: '2024-02-20',
    height: 158,
    weight: 56,
    vitals: {
      bloodPressure: '115/75',
      temperature: '36.2°C',
      pulseRate: '68 bpm',
      respiratoryRate: '16/min',
    },
    notes: 'Good progress. Weight returning to pre-pregnancy level. Continue breastfeeding.',
    checkedBy: 'Nurse Ana Garcia',
    micronutrientSupplement: {
      supplementType: 'Multivitamins',
      dateGiven: '2024-02-20',
      givenDuring: '3 weeks postpartum',
      numberOfTablets: 30,
    },
  },
  {
    id: '3',
    date: '2024-03-15',
    height: 158,
    weight: 54,
    vitals: {
      bloodPressure: '110/70',
      temperature: '36.4°C',
      pulseRate: '70 bpm',
      respiratoryRate: '18/min',
    },
    notes: 'Final postpartum check-up. Mother is healthy and well. Baby is thriving.',
    checkedBy: 'Dr. Carlos Martinez',
    micronutrientSupplement: {
      supplementType: 'Calcium + Vitamin D',
      dateGiven: '2024-03-15',
      givenDuring: '6 weeks postpartum',
      numberOfTablets: 30,
    },
  },
];

const PostpartumCard = ({ record, onPress }: { record: PostpartumRecord; onPress: () => void }) => (
  <Pressable style={styles.postpartumCard} onPress={onPress}>
    <View style={styles.cardHeader}>
      <View style={styles.iconContainer}>
        <Ionicons name="heart" size={24} color="#FF3D33" />
      </View>
      <View style={styles.visitInfo}>
        <ThemedText type="defaultSemiBold" style={styles.visitDate}>
          {new Date(record.date).toLocaleDateString()}
        </ThemedText>
        <ThemedText style={styles.visitType}>
          Postpartum Visit
        </ThemedText>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </View>
    
    <View style={styles.vitalsGrid}>
      <View style={styles.vitalItem}>
        <Ionicons name="resize" size={16} color="#3B82F6" />
        <View style={styles.vitalInfo}>
          <ThemedText style={styles.vitalLabel}>Height</ThemedText>
          <ThemedText style={styles.vitalValue}>{record.height} cm</ThemedText>
        </View>
      </View>
      
      <View style={styles.vitalItem}>
        <Ionicons name="scale" size={16} color="#10B981" />
        <View style={styles.vitalInfo}>
          <ThemedText style={styles.vitalLabel}>Weight</ThemedText>
          <ThemedText style={styles.vitalValue}>{record.weight} kg</ThemedText>
        </View>
      </View>
      
      <View style={styles.vitalItem}>
        <Ionicons name="pulse" size={16} color="#EF4444" />
        <View style={styles.vitalInfo}>
          <ThemedText style={styles.vitalLabel}>BP</ThemedText>
          <ThemedText style={styles.vitalValue}>{record.vitals.bloodPressure}</ThemedText>
        </View>
      </View>
    </View>
    
    <View style={styles.tapIndicator}>
      <ThemedText style={styles.tapText}>Tap to view micronutrient supplement details</ThemedText>
    </View>
  </Pressable>
);

const MicronutrientModal = ({ 
  visible, 
  record, 
  onClose 
}: { 
  visible: boolean; 
  record: PostpartumRecord | null; 
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
            Micronutrients Supplement
          </ThemedText>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </Pressable>
        </View>
        
        <View style={styles.modalContent}>
          <View style={styles.supplementCard}>
            <View style={styles.supplementHeader}>
              <View style={styles.supplementIconContainer}>
                <Ionicons name="nutrition" size={32} color="#FF3D33" />
              </View>
              <View style={styles.supplementInfo}>
                <ThemedText type="defaultSemiBold" style={styles.supplementType}>
                  {record.micronutrientSupplement.supplementType}
                </ThemedText>
                <ThemedText style={styles.supplementGiven}>
                  {record.micronutrientSupplement.numberOfTablets} tablets
                </ThemedText>
              </View>
            </View>
            
            <View style={styles.supplementDetails}>
              <View style={styles.detailRow}>
                <ThemedText style={styles.detailLabel}>Date Given</ThemedText>
                <ThemedText style={styles.detailValue}>
                  {new Date(record.micronutrientSupplement.dateGiven).toLocaleDateString()}
                </ThemedText>
              </View>
              <View style={styles.detailRow}>
                <ThemedText style={styles.detailLabel}>Given During</ThemedText>
                <ThemedText style={styles.detailValue}>
                  {record.micronutrientSupplement.givenDuring}
                </ThemedText>
              </View>
              <View style={styles.detailRow}>
                <ThemedText style={styles.detailLabel}>Number of Tablets</ThemedText>
                <ThemedText style={styles.detailValue}>
                  {record.micronutrientSupplement.numberOfTablets}
                </ThemedText>
              </View>
            </View>
          </View>
          
          <View style={styles.visitDetails}>
            <ThemedText type="defaultSemiBold" style={styles.visitDetailsTitle}>
              Visit Details
            </ThemedText>
            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Checked by</ThemedText>
              <ThemedText style={styles.detailValue}>{record.checkedBy}</ThemedText>
            </View>
            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Temperature</ThemedText>
              <ThemedText style={styles.detailValue}>{record.vitals.temperature}</ThemedText>
            </View>
            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Pulse Rate</ThemedText>
              <ThemedText style={styles.detailValue}>{record.vitals.pulseRate}</ThemedText>
            </View>
            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Respiratory Rate</ThemedText>
              <ThemedText style={styles.detailValue}>{record.vitals.respiratoryRate}</ThemedText>
            </View>
            <View style={[styles.detailRow, styles.notesRow]}>
              <ThemedText style={styles.detailLabel}>Notes</ThemedText>
              <ThemedText style={styles.detailValue}>{record.notes}</ThemedText>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default function MaternalPostpartum() {
  const { maternalData } = useLocalSearchParams();
  const maternal = JSON.parse(maternalData as string);
  const [selectedRecord, setSelectedRecord] = useState<PostpartumRecord | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleRecordPress = (record: PostpartumRecord) => {
    setSelectedRecord(record);
    setModalVisible(true);
  };

  const renderPostpartum = ({ item }: { item: PostpartumRecord }) => (
    <PostpartumCard record={item} onPress={() => handleRecordPress(item)} />
  );

  // Sort by date (newest first)
  const sortedRecords = [...postpartumRecords].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
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
            Postpartum Visit
          </ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            {maternal.firstName} - {maternal.residentId}
          </ThemedText>
        </View>
      </View>

      <FlatList
        data={sortedRecords}
        keyExtractor={(item) => item.id}
        renderItem={renderPostpartum}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={48} color="#D1D5DB" />
            <ThemedText style={styles.emptyText}>No postpartum visit records found</ThemedText>
          </View>
        }
      />

      <MicronutrientModal
        visible={modalVisible}
        record={selectedRecord}
        onClose={() => setModalVisible(false)}
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
  postpartumCard: {
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
    marginBottom: 16,
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
  visitInfo: {
    flex: 1,
  },
  visitDate: {
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 2,
  },
  visitType: {
    fontSize: 12,
    color: '#6B7280',
  },
  vitalsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  vitalItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 8,
    borderRadius: 8,
    marginHorizontal: 2,
  },
  vitalInfo: {
    marginLeft: 6,
  },
  vitalLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 2,
  },
  vitalValue: {
    fontSize: 11,
    color: '#1F2937',
    fontWeight: '600',
  },
  tapIndicator: {
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  tapText: {
    fontSize: 12,
    color: '#9CA3AF',
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
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  supplementCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  supplementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  supplementIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  supplementInfo: {
    flex: 1,
  },
  supplementType: {
    fontSize: 18,
    color: '#1F2937',
    marginBottom: 4,
  },
  supplementGiven: {
    fontSize: 14,
    color: '#6B7280',
  },
  supplementDetails: {
    gap: 8,
  },
  visitDetails: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
  },
  visitDetailsTitle: {
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  notesRow: {
    borderBottomWidth: 0,
    alignItems: 'flex-start',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
});