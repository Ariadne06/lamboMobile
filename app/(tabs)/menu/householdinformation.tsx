import React, { useState, useRef } from 'react';
import { ScrollView, View, StyleSheet, TextInput, Platform, Animated } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';

const quarters = ['Quarter 1', 'Quarter 2', 'Quarter 3', 'Quarter 4'];
const dummyMembers = [
  { name: 'Juan Dela Cruz', age: 45, relation: 'Head' },
  { name: 'Maria Dela Cruz', age: 42, relation: 'Spouse' },
  { name: 'Pedro Dela Cruz', age: 18, relation: 'Son' },
  { name: 'Ana Dela Cruz', age: 15, relation: 'Daughter' },
];

export default function HouseholdInformationScreen() {
  const [quarter, setQuarter] = useState('Quarter 1');
  const [householdNumber, setHouseholdNumber] = useState('123');
  const [householdId, setHouseholdId] = useState('HH-2025-001');
  const [familyNumber, setFamilyNumber] = useState('FAM-01');
  const [householdHead, setHouseholdHead] = useState('Juan Dela Cruz');
  const [sitio, setSitio] = useState('Sitio Uno');
  const [waterSource, setWaterSource] = useState('Point Source');
  const [toiletFacility, setToiletFacility] = useState('Septic & Sewage Tank');
  const [wasteManagement, setWasteManagement] = useState('Water Segregation');
  const [blincDrainage, setBlincDrainage] = useState('No');
  const [renter, setRenter] = useState('No');

  // Animation for quarter change (optional, can be removed if not needed)
  const quarterAnim = useRef(new Animated.Value(0)).current;
  const handleQuarterChange = (val: string) => {
    setQuarter(val);
    quarterAnim.setValue(1);
    Animated.timing(quarterAnim, {
      toValue: 0,
      duration: 600,
      useNativeDriver: false,
    }).start();
  };

  const quarterBg = quarterAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#fff', '#fff7ed'],
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>

      <Animated.View style={[styles.quarterBar, { backgroundColor: quarterBg }]}>
        <MaterialIcons name="filter-list" size={18} color="#FF3D33" style={{ marginRight: 6 }} />
        <ThemedText style={styles.quarterBarLabel}>Quarter:</ThemedText>
        <View style={styles.quarterBarPickerWrapper}>
          <Picker
            selectedValue={quarter}
            onValueChange={handleQuarterChange}
            style={styles.quarterBarPicker}
            dropdownIconColor="#FF3D33"
          >
            {quarters.map((item) => (
              <Picker.Item label={item} value={item} key={item} />
            ))}
          </Picker>
        </View>
      </Animated.View>

     
      <View style={styles.form}>
        
        <View style={styles.inputGroup}>
          <View style={styles.inputLabelRow}>
            <Ionicons name="list" size={18} color="#FF3D33" />
            <ThemedText style={styles.inputLabel}>Household Number</ThemedText>
          </View>
          <TextInput
            style={styles.input}
            value={householdNumber}
            onChangeText={setHouseholdNumber}
            placeholder="Enter household number"
            placeholderTextColor="#a1a1aa"
          />
        </View>
       
        <View style={styles.inputGroup}>
          <View style={styles.inputLabelRow}>
            <MaterialCommunityIcons name="identifier" size={18} color="#FF3D33" />
            <ThemedText style={styles.inputLabel}>Household ID</ThemedText>
          </View>
          <TextInput
            style={styles.input}
            value={householdId}
            onChangeText={setHouseholdId}
            placeholder="Enter household ID"
            placeholderTextColor="#a1a1aa"
          />
        </View>
        
        <View style={styles.inputGroup}>
          <View style={styles.inputLabelRow}>
            <Ionicons name="people" size={18} color="#FF3D33" />
            <ThemedText style={styles.inputLabel}>Family Number</ThemedText>
          </View>
          <TextInput
            style={styles.input}
            value={familyNumber}
            onChangeText={setFamilyNumber}
            placeholder="Enter family number"
            placeholderTextColor="#a1a1aa"
          />
        </View>
       
        <View style={styles.inputGroup}>
          <View style={styles.inputLabelRow}>
            <Ionicons name="person" size={18} color="#FF3D33" />
            <ThemedText style={styles.inputLabel}>Household Head</ThemedText>
          </View>
          <TextInput
            style={styles.input}
            value={householdHead}
            onChangeText={setHouseholdHead}
            placeholder="Enter household head"
            placeholderTextColor="#a1a1aa"
          />
        </View>
        
        <View style={styles.inputGroup}>
          <View style={styles.inputLabelRow}>
            <MaterialCommunityIcons name="map-marker-radius" size={18} color="#FF3D33" />
            <ThemedText style={styles.inputLabel}>Sitio / Purok</ThemedText>
          </View>
          <TextInput
            style={styles.input}
            value={sitio}
            onChangeText={setSitio}
            placeholder="Enter sitio/purok"
            placeholderTextColor="#a1a1aa"
          />
        </View>
       
        <View style={styles.inputGroup}>
          <View style={styles.inputLabelRow}>
            <Ionicons name="water" size={18} color="#FF3D33" />
            <ThemedText style={styles.inputLabel}>Water Source</ThemedText>
          </View>
          <TextInput
            style={styles.input}
            value={waterSource}
            onChangeText={setWaterSource}
            placeholder="Enter water source"
            placeholderTextColor="#a1a1aa"
          />
        </View>
       
        <View style={styles.inputGroup}>
          <View style={styles.inputLabelRow}>
            <MaterialCommunityIcons name="toilet" size={18} color="#FF3D33" />
            <ThemedText style={styles.inputLabel}>Toilet Facility</ThemedText>
          </View>
          <TextInput
            style={styles.input}
            value={toiletFacility}
            onChangeText={setToiletFacility}
            placeholder="Enter toilet facility"
            placeholderTextColor="#a1a1aa"
          />
        </View>
      
        <View style={styles.inputGroup}>
          <View style={styles.inputLabelRow}>
            <MaterialCommunityIcons name="trash-can" size={18} color="#FF3D33" />
            <ThemedText style={styles.inputLabel}>Waste Management</ThemedText>
          </View>
          <TextInput
            style={styles.input}
            value={wasteManagement}
            onChangeText={setWasteManagement}
            placeholder="Enter waste management"
            placeholderTextColor="#a1a1aa"
          />
        </View>
       
        <View style={styles.inputGroup}>
          <View style={styles.inputLabelRow}>
            <MaterialCommunityIcons name="water-pump" size={18} color="#FF3D33" />
            <ThemedText style={styles.inputLabel}>BLINC Drainage</ThemedText>
          </View>
          <TextInput
            style={styles.input}
            value={blincDrainage}
            onChangeText={setBlincDrainage}
            placeholder="Enter BLINC drainage"
            placeholderTextColor="#a1a1aa"
          />
        </View>
    
        <View style={styles.inputGroup}>
          <View style={styles.inputLabelRow}>
            <Ionicons name="person-circle" size={18} color="#FF3D33" />
            <ThemedText style={styles.inputLabel}>Renter</ThemedText>
          </View>
          <TextInput
            style={styles.input}
            value={renter}
            onChangeText={setRenter}
            placeholder="Enter renter status"
            placeholderTextColor="#a1a1aa"
          />
        </View>
      </View>

      
      <View style={styles.membersSection}>
        <ThemedText style={styles.membersTitle}>
          House No. {householdNumber} - Family No. {familyNumber}
        </ThemedText>
        <View style={styles.membersList}>
          {dummyMembers.map((member, idx) => (
            <View key={idx} style={styles.memberCard}>
              <Ionicons name="person-circle" size={32} color="#FFA333" style={{ marginRight: 12 }} />
              <View>
                <ThemedText style={styles.memberName}>{member.name}</ThemedText>
                <ThemedText style={styles.memberInfo}>{member.relation} • Age: {member.age}</ThemedText>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 20,
    backgroundColor: '#FF3D33',
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    marginBottom: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
  },
  // Modern, compact quarter bar
  quarterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#FFA333',
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginHorizontal: 16,   
    marginTop: 14,
    marginBottom: 10,
    alignSelf: 'flex-start',
    shadowColor: '#FFA333',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 1,
    elevation: 1,
  },
  quarterBarLabel: {
    fontSize: 15,
    color: '#FF3D33',
    fontWeight: '600',
    marginRight: 4,
  },
  quarterBarPickerWrapper: {
    flex: 1,
    minWidth: 120,
    marginLeft: 2,
  },
  quarterBarPicker: {
    width: '100%',
    color: '#1e293b',
    backgroundColor: 'transparent',
    marginLeft: -8,
    fontSize: 15,
    height: 36,
  },
  form: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 14,
    marginHorizontal: 12,
    marginBottom: 20,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  inputLabel: {
    fontSize: 15,
    color: '#64748b',
    fontWeight: '600',
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    fontSize: 16,
    color: '#1e293b',
  },
  pickerWrapper: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  picker: {
    width: '100%',
    color: '#1e293b',
  },
  membersSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderRadius: 14,
    marginHorizontal: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
  },
  membersTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#FF3D33',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  membersList: {
    gap: 10,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    padding: 10,
    marginBottom: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 1,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
  memberInfo: {
    fontSize: 13,
    color: '#64748b',
  },
});