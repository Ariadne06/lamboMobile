import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { router, useLocalSearchParams } from 'expo-router';

const DetailRow = ({ label, value, isLast = false }: { label: string; value: string; isLast?: boolean }) => (
  <View style={[styles.detailRow, !isLast && styles.detailRowBorder]}>
    <ThemedText style={styles.detailLabel}>{label}</ThemedText>
    <ThemedText style={styles.detailValue} numberOfLines={2}>
      {value}
    </ThemedText>
  </View>
);

const MenuButton = ({ 
  icon, 
  title, 
  subtitle, 
  onPress 
}: { 
  icon: string; 
  title: string; 
  subtitle: string; 
  onPress: () => void;
}) => (
  <Pressable style={styles.menuButton} onPress={onPress}>
    <View style={styles.menuIconContainer}>
      <Ionicons name={icon as any} size={24} color="#FF3D33" />
    </View>
    <View style={styles.menuContent}>
      <ThemedText type="defaultSemiBold" style={styles.menuTitle}>
        {title}
      </ThemedText>
      <ThemedText style={styles.menuSubtitle}>
        {subtitle}
      </ThemedText>
    </View>
    <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
  </Pressable>
);

export default function ChildDetails() {
  const { childData } = useLocalSearchParams();
  const child = JSON.parse(childData as string);

  const handleMenuPress = (screen: string) => {
    router.push({
      pathname: screen as any,
      params: { childData: JSON.stringify(child) }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </Pressable>
        <View style={styles.headerInfo}>
          <ThemedText type="title" style={styles.headerTitle}>
            {child.firstName}
          </ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            ID: {child.residentId}
          </ThemedText>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Basic Information */}
        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <Ionicons name="person" size={20} color="#FF3D33" />
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Basic Information
            </ThemedText>
          </View>
          <View style={styles.sectionContent}>
            <DetailRow label="Child Full Name" value={child.childFullName} />
            <DetailRow label="Mother's Full Name" value={child.motherFullName} />
            <DetailRow label="Father's Full Name" value={child.fatherFullName} />
            <DetailRow label="PhilHealth ID" value={child.philhealthId} />
            <DetailRow label="Phone Number" value={child.phoneNumber} />
            <DetailRow label="Sex" value={child.sex} />
            <DetailRow label="Date of Birth" value={new Date(child.dateOfBirth).toLocaleDateString()} />
            <DetailRow label="Time of Birth" value={child.timeOfBirth} />
            <DetailRow label="Age" value={`${child.age} months`} isLast />
          </View>
        </View>

        {/* Birth Information */}
        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <Ionicons name="medical" size={20} color="#FF3D33" />
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Birth Information
            </ThemedText>
          </View>
          <View style={styles.sectionContent}>
            <DetailRow label="Birth Weight" value={`${child.birthWeight} kg`} />
            <DetailRow label="Birth Height" value={`${child.birthHeight} cm`} />
            <DetailRow label="Place of Delivery" value={child.placeOfDelivery} />
            <DetailRow label="TT Status of Mother" value={child.ttStatusOfMother} />
            <DetailRow label="Date TT Status Assessed" value={new Date(child.dateTTStatusAssessed).toLocaleDateString()} />
            <DetailRow label="Newborn Screening Status" value={child.newbornScreeningStatus ? 'Done' : 'Pending'} />
            {child.newbornScreeningDate && (
              <DetailRow label="Screening Date" value={new Date(child.newbornScreeningDate).toLocaleDateString()} />
            )}
            <DetailRow label="Feeding Method" value={child.feedingMethod} isLast />
          </View>
        </View>

        {/* Health Records Menu */}
        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <Ionicons name="folder-open" size={20} color="#FF3D33" />
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Health Records
            </ThemedText>
          </View>
          <View style={styles.menuContainer}>
            <MenuButton
              icon="shield-checkmark"
              title="Immunization Records"
              subtitle="View vaccination history and schedule"
              onPress={() => handleMenuPress('/(nurse)/menu/childimmunization')}
            />
            <MenuButton
              icon="nutrition"
              title="Supplements"
              subtitle="Track vitamin and supplement intake"
              onPress={() => handleMenuPress('/(nurse)/menu/childsupplements')}
            />
            <MenuButton
              icon="trending-up"
              title="Growth Monitoring"
              subtitle="Height, weight, and development tracking"
              onPress={() => handleMenuPress('/(nurse)/menu/childgrowthmonitoring')}
            />
            <MenuButton
              icon="documents"
              title="Medical/Surgical History"
              subtitle="Medical conditions and procedures"
              onPress={() => handleMenuPress('/(nurse)/menu/childmedicalhistory')}
            />
          </View>
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
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#1F2937',
    marginLeft: 10,
    fontWeight: '600',
  },
  sectionContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  detailRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
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
  menuContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 20,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 4,
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
});