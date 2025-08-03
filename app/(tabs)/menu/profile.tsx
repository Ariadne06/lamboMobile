import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, Pressable, Modal, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const mockProfile = {
  firstName: 'Adelaida',
  middleName: 'Mabanag',
  lastName: 'Villarta',
  dob: '1963-11-05',
  sex: 'Female',
  civilStatus: 'Married',
  religion: 'Catholic',
  educationalAttainment: 'College Graduate',
  residentStatus: 'Active',
  houseNumber: '123',
  street: 'Tanke',
  barangay: 'Talisay',
};

export default function ProfileScreen() {
  const [profile, setProfile] = useState(mockProfile);
  const [modalVisible, setModalVisible] = useState(false);
  const [editProfile, setEditProfile] = useState(profile);

  const handleSave = () => {
    setProfile(editProfile);
    setModalVisible(false);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        {/* Personal Info Section */}
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <View style={styles.section}>
          <View style={styles.detailRow}>
            <View style={styles.detailCol}>
              <Text style={styles.label}>First Name</Text>
              <Text style={styles.value}>{profile.firstName}</Text>
            </View>
            <View style={styles.detailCol}>
              <Text style={styles.label}>Middle Name</Text>
              <Text style={styles.value}>{profile.middleName}</Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <View style={styles.detailCol}>
              <Text style={styles.label}>Last Name</Text>
              <Text style={styles.value}>{profile.lastName}</Text>
            </View>
            <View style={styles.detailCol}>
              <Text style={styles.label}>Date of Birth</Text>
              <Text style={styles.value}>{profile.dob}</Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <View style={styles.detailCol}>
              <Text style={styles.label}>Sex</Text>
              <Text style={styles.value}>{profile.sex}</Text>
            </View>
            <View style={styles.detailCol}>
              <Text style={styles.label}>Civil Status</Text>
              <Text style={styles.value}>{profile.civilStatus}</Text>
            </View>
          </View>
        </View>

        {/* Other Info Section */}
        <Text style={styles.sectionTitle}>Other Information</Text>
        <View style={styles.section}>
          <View style={styles.detailRow}>
            <View style={styles.detailCol}>
              <Text style={styles.label}>Religion</Text>
              <Text style={styles.value}>{profile.religion}</Text>
            </View>
            <View style={styles.detailCol}>
              <Text style={styles.label}>Educational Attainment</Text>
              <Text style={styles.value}>{profile.educationalAttainment}</Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <View style={styles.detailCol}>
              <Text style={styles.label}>Resident Status</Text>
              <Text style={styles.value}>{profile.residentStatus}</Text>
            </View>
          </View>
        </View>

        {/* Address Section */}
        <Text style={styles.sectionTitle}>Address</Text>
        <View style={styles.section}>
          <View style={styles.detailRow}>
            <View style={styles.detailCol}>
              <Text style={styles.label}>House Number</Text>
              <Text style={styles.value}>{profile.houseNumber}</Text>
            </View>
            <View style={styles.detailCol}>
              <Text style={styles.label}>Street</Text>
              <Text style={styles.value}>{profile.street}</Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <View style={styles.detailCol}>
              <Text style={styles.label}>Barangay</Text>
              <Text style={styles.value}>{profile.barangay}</Text>
            </View>
          </View>
        </View>

        <Pressable style={styles.editBtn} onPress={() => { setEditProfile(profile); setModalVisible(true); }}>
          <MaterialIcons name="edit" size={20} color="#fff" style={{ marginRight: 6 }} />
          <Text style={styles.editBtnText}>Edit</Text>
        </Pressable>
      </View>

      {/* Modal for editing profile */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <ScrollView>
              {Object.entries(editProfile).map(([key, value], idx) => (
                <View style={styles.inputGroup} key={key}>
                  <Text style={styles.inputLabel}>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</Text>
                  <TextInput
                    value={value}
                    onChangeText={text => setEditProfile({ ...editProfile, [key]: text })}
                    style={styles.input}
                  />
                </View>
              ))}
              <Pressable style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>Save</Text>
              </Pressable>
              <Pressable style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF3D33',
    marginTop: 10,
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  section: {
    marginBottom: 10,
    paddingBottom: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailCol: {
    flex: 1,
    marginRight: 12,
  },
  label: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '600',
    marginBottom: 2,
  },
  value: {
    fontSize: 15,
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 2,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF3D33',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignSelf: 'flex-end',
    marginTop: 18,
    elevation: 2,
  },
  editBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    width: '90%',
    maxHeight: '90%',
    elevation: 4,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FF3D33',
    marginBottom: 12,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#f9fafb',
    fontSize: 15,
  },
  saveBtn: {
    backgroundColor: '#FF3D33',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelBtn: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelBtnText: {
    color: '#FF3D33',
    fontWeight: 'bold',
    fontSize: 15,
  },
}); 