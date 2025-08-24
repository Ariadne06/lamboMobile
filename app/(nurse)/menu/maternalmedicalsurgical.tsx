import React from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { router, useLocalSearchParams } from 'expo-router';

type MedicalHistory = {
  id: string;
  condition: string;
  notes: string;
  dateRecorded: string;
  status: 'active' | 'resolved' | 'chronic';
};

type SurgicalHistory = {
  id: string;
  procedure: string;
  notes: string;
  datePerformed: string;
  hospital: string;
  surgeon: string;
};

const medicalHistoryRecords: MedicalHistory[] = [
  {
    id: '1',
    condition: 'Hypertension',
    notes: 'Mild hypertension diagnosed during pregnancy. Currently on medication and monitoring blood pressure regularly.',
    dateRecorded: '2023-08-15',
    status: 'active',
  },
  {
    id: '2',
    condition: 'Gestational Diabetes',
    notes: 'Diagnosed at 24 weeks gestation. Managing with diet and blood glucose monitoring.',
    dateRecorded: '2023-11-20',
    status: 'active',
  },
  {
    id: '3',
    condition: 'Anemia',
    notes: 'Iron deficiency anemia. Started on iron supplements and dietary counseling.',
    dateRecorded: '2023-09-10',
    status: 'resolved',
  },
];

const surgicalHistoryRecords: SurgicalHistory[] = [
  {
    id: '1',
    procedure: 'Appendectomy',
    notes: 'Emergency appendectomy performed due to acute appendicitis. No complications during surgery or recovery.',
    datePerformed: '2020-03-15',
    hospital: 'City General Hospital',
    surgeon: 'Dr. Roberto Martinez',
  },
  {
    id: '2',
    procedure: 'Cesarean Section',
    notes: 'Previous delivery via C-section due to fetal distress. Recovery was normal with no complications.',
    datePerformed: '2021-05-20',
    hospital: 'Maternal Care Hospital',
    surgeon: 'Dr. Maria Santos',
  },
];

const MedicalHistoryCard = ({ record }: { record: MedicalHistory }) => {
  const getStatusColor = () => {
    switch (record.status) {
      case 'active': return '#EF4444';
      case 'resolved': return '#10B981';
      case 'chronic': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = () => {
    switch (record.status) {
      case 'active': return 'alert-circle';
      case 'resolved': return 'checkmark-circle';
      case 'chronic': return 'time';
      default: return 'help-circle';
    }
  };

  return (
    <View style={styles.historyCard}>
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <Ionicons name="medical" size={20} color="#FF3D33" />
        </View>
        <View style={styles.conditionInfo}>
          <ThemedText type="defaultSemiBold" style={styles.conditionName}>
            {record.condition}
          </ThemedText>
          <ThemedText style={styles.recordDate}>
            Recorded: {new Date(record.dateRecorded).toLocaleDateString()}
          </ThemedText>
        </View>
        <View style={styles.statusContainer}>
          <Ionicons 
            name={getStatusIcon() as any} 
            size={16} 
            color={getStatusColor()} 
          />
          <ThemedText style={[styles.statusText, { color: getStatusColor() }]}>
            {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
          </ThemedText>
        </View>
      </View>
      
      <View style={styles.notesContainer}>
        <Ionicons name="document-text-outline" size={16} color="#6B7280" />
        <ThemedText style={styles.notesText}>
          {record.notes}
        </ThemedText>
      </View>
    </View>
  );
};

const SurgicalHistoryCard = ({ record }: { record: SurgicalHistory }) => (
  <View style={styles.historyCard}>
    <View style={styles.cardHeader}>
      <View style={styles.iconContainer}>
        <Ionicons name="cut" size={20} color="#FF3D33" />
      </View>
      <View style={styles.procedureInfo}>
        <ThemedText type="defaultSemiBold" style={styles.procedureName}>
          {record.procedure}
        </ThemedText>
        <ThemedText style={styles.procedureDate}>
          {new Date(record.datePerformed).toLocaleDateString()}
        </ThemedText>
      </View>
    </View>
    
    <View style={styles.surgicalDetails}>
      <View style={styles.detailRow}>
        <Ionicons name="business-outline" size={16} color="#6B7280" />
        <ThemedText style={styles.detailText}>
          Hospital: {record.hospital}
        </ThemedText>
      </View>
      <View style={styles.detailRow}>
        <Ionicons name="person-outline" size={16} color="#6B7280" />
        <ThemedText style={styles.detailText}>
          Surgeon: {record.surgeon}
        </ThemedText>
      </View>
    </View>
    
    <View style={styles.notesContainer}>
      <Ionicons name="document-text-outline" size={16} color="#6B7280" />
      <ThemedText style={styles.notesText}>
        {record.notes}
      </ThemedText>
    </View>
  </View>
);

export default function MaternalMedicalSurgical() {
  const { maternalData } = useLocalSearchParams();
  const maternal = JSON.parse(maternalData as string);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </Pressable>
        <View style={styles.headerInfo}>
          <ThemedText type="title" style={styles.headerTitle}>
            Medical/Surgical History
          </ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            {maternal.firstName} - {maternal.residentId}
          </ThemedText>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Medical History Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="medical" size={20} color="#FF3D33" />
              <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                Medical History
              </ThemedText>
            </View>
            <View style={styles.countBadge}>
              <ThemedText style={styles.countText}>
                {medicalHistoryRecords.length}
              </ThemedText>
            </View>
          </View>
          
          {medicalHistoryRecords.length > 0 ? (
            medicalHistoryRecords.map((record) => (
              <MedicalHistoryCard key={record.id} record={record} />
            ))
          ) : (
            <View style={styles.emptyCard}>
              <Ionicons name="medical-outline" size={32} color="#D1D5DB" />
              <ThemedText style={styles.emptyText}>
                No medical history recorded
              </ThemedText>
            </View>
          )}
        </View>

        {/* Surgical History Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="cut" size={20} color="#FF3D33" />
              <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                Surgical History
              </ThemedText>
            </View>
            <View style={styles.countBadge}>
              <ThemedText style={styles.countText}>
                {surgicalHistoryRecords.length}
              </ThemedText>
            </View>
          </View>
          
          {surgicalHistoryRecords.length > 0 ? (
            surgicalHistoryRecords.map((record) => (
              <SurgicalHistoryCard key={record.id} record={record} />
            ))
          ) : (
            <View style={styles.emptyCard}>
              <Ionicons name="cut-outline" size={32} color="#D1D5DB" />
              <ThemedText style={styles.emptyText}>
                No surgical history recorded
              </ThemedText>
            </View>
          )}
        </View>
      </ScrollView>
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
  content: {
    flex: 1,
  },
  section: {
    margin: 20,
    marginBottom: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    color: '#1F2937',
    marginLeft: 10,
    fontWeight: '600',
  },
  countBadge: {
    backgroundColor: '#FF3D33',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
  },
  countText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  conditionInfo: {
    flex: 1,
  },
  conditionName: {
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 2,
  },
  recordDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  procedureInfo: {
    flex: 1,
  },
  procedureName: {
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 2,
  },
  procedureDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  surgicalDetails: {
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  notesText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
    flex: 1,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
  },
});