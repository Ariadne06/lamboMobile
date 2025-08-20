import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, Pressable, Modal, TextInput, ActivityIndicator, Alert, Image } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { fetchResidentProfile, ResidentProfile } from '@/utils/profileService';
import { updateResidentProfile, ProfileUpdateData } from '@/utils/profileUpdateService';
import { useRegister } from '@/context/registercontext';
import { getUserSession } from '@/utils/session';

export default function ProfileScreen() {
  const [profile, setProfile] = useState<ResidentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [userSession, setUserSession] = useState<any>(null);
  const [isNonResident, setIsNonResident] = useState(false);
  
  // Edit form state
  const [editData, setEditData] = useState<any>({});
  const [selectedImage, setSelectedImage] = useState<any>(null);

  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  
  // Get dropdown options from context with null checks
  const registerContext = useRegister();
  const civilStatusOptions = registerContext?.civilStatusOptions || [];
  const educationOptions = registerContext?.educationOptions || [];
  const religionOptions = registerContext?.religionOptions || [];

  useEffect(() => {
    loadProfile();
    loadUserSession();
  }, []);


  const loadUserSession = async () => {
    const session = await getUserSession();
    setUserSession(session);
  };

  const loadProfile = async () => {
    try {
      setLoading(true);
      setImageError(false);
      const profileData = await fetchResidentProfile();
      
      if (profileData) {
        setProfile(profileData);
        setEditData({
          email: profileData.email,
          phone_number: profileData.phone_number,
          civil_stat_id: getCivilStatusIdByName(profileData.civil_status),
          educational_attain_id: getEducationIdByName(profileData.educational_attainment),
          religion_cat_id: getReligionIdByName(profileData.religion),
          gender: profileData.gender,
          house_number: profileData.house_number,
          street: profileData.street,
          barangay: profileData.barangay,
          city_municipality: profileData.city_municipality,
          
        });
        
        // Check if user is non-resident
        setIsNonResident(profileData.resident_status?.toLowerCase() === 'non-resident');
      } else {
        Alert.alert('Error', 'Failed to load profile data');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  // Helper functions to get IDs from names - Add safety checks
  const getCivilStatusIdByName = (name: string) => {
    if (!civilStatusOptions || civilStatusOptions.length === 0) return null;
    const item = civilStatusOptions.find((cs: any) => cs.civil_name === name);
    return item?.civil_stat_id || null;
  };

  const getEducationIdByName = (name: string) => {
    if (!educationOptions || educationOptions.length === 0) return null;
    const item = educationOptions.find((ed: any) => ed.educational_attain_name === name);
    return item?.educational_attain_id || null;
  };

  const getReligionIdByName = (name: string) => {
    if (!religionOptions || religionOptions.length === 0) return null;
    const item = religionOptions.find((rel: any) => rel.religion_name === name);
    return item?.religion_cat_id || null;
  };

  // Add a loading state for when options are not available
  if (!registerContext || (civilStatusOptions.length === 0 && educationOptions.length === 0 && religionOptions.length === 0)) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#FF3D33" />
        <Text style={{ marginTop: 10, color: '#666' }}>Loading options...</Text>
      </View>
    );
  }

  // Rest of your component code remains the same...
  const pickImage = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to upload profile images.');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], // Square aspect ratio
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage({
          uri: result.assets[0].uri,
          type: 'image/jpeg',
          fileName: `profile_${Date.now()}.jpg`,
        });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleSave = async () => {
    try {
      setUpdating(true);
      
      const updateData: ProfileUpdateData = {
        email: editData.email,
        phone_number: editData.phone_number,
        house_number: editData.house_number,
        street: editData.street,
      };
      
      // Add resident-specific fields (excluding voter status)
      if (!isNonResident) {
        updateData.civil_stat_id = editData.civil_stat_id;
        updateData.educational_attain_id = editData.educational_attain_id;
        updateData.religion_cat_id = editData.religion_cat_id;
        updateData.gender = editData.gender;
      }
      
      // Add non-resident-specific address fields (excluding country)
      if (isNonResident) {
        updateData.barangay = editData.barangay;
        updateData.city_municipality = editData.city_municipality;
        // Removed country assignment - it should remain static
      }
      
      // Add profile image if selected
      if (selectedImage) {
        updateData.profile_image = selectedImage;
      }
      
      const result = await updateResidentProfile(updateData);
      
      if (result.success) {
        Alert.alert('Success', 'Profile updated successfully!', [
          {
            text: 'OK',
            onPress: () => {
              setModalVisible(false);
              setSelectedImage(null);
              loadProfile(); // Reload profile data
            }
          }
        ]);
      } else {
        Alert.alert('Error', result.message || 'Failed to update profile');
      }
      
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#FF3D33" />
        <Text style={{ marginTop: 10, color: '#666' }}>Loading profile...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <MaterialIcons name="error" size={48} color="#666" />
        <Text style={{ marginTop: 10, color: '#666', textAlign: 'center' }}>
          Failed to load profile data
        </Text>
        <Pressable 
          style={[styles.editBtn, { marginTop: 20 }]} 
          onPress={loadProfile}
        >
          <Text style={styles.editBtnText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        
        {/* Header with profile image and resident code */}
        <View style={styles.headerSection}>
          <View style={styles.profileImageContainer}>
            {profile.profile_image_path && !imageError ? (
              <Image 
                source={{ uri: profile.profile_image_path }} 
                style={styles.profileImage}
                onLoadStart={() => setImageLoading(true)}
                onLoadEnd={() => setImageLoading(false)}
                onError={(error) => {
                  console.log('Image load error:', error);
                  setImageError(true);
                  setImageLoading(false);
                }}
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <MaterialIcons name="person" size={50} color="#ccc" />
              </View>
            )}
          </View>
          <Text style={styles.residentCode}>#{profile.resident_code}</Text>
          <Text style={styles.fullName}>
            {profile.first_name} {profile.middle_name} {profile.last_name} {profile.suffix}
          </Text>
        </View>

        {/* Personal Info Section - READ ONLY */}
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <View style={[styles.section, styles.readOnlySection]}>
          <View style={styles.detailRow}>
            <View style={styles.detailCol}>
              <Text style={styles.label}>First Name</Text>
              <Text style={styles.value}>{profile.first_name}</Text>
            </View>
            <View style={styles.detailCol}>
              <Text style={styles.label}>Middle Name</Text>
              <Text style={styles.value}>{profile.middle_name || 'N/A'}</Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <View style={styles.detailCol}>
              <Text style={styles.label}>Last Name</Text>
              <Text style={styles.value}>{profile.last_name}</Text>
            </View>
            <View style={styles.detailCol}>
              <Text style={styles.label}>Suffix</Text>
              <Text style={styles.value}>{profile.suffix || 'N/A'}</Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <View style={styles.detailCol}>
              <Text style={styles.label}>Date of Birth</Text>
              <Text style={styles.value}>{profile.dob}</Text>
            </View>
            <View style={styles.detailCol}>
              <Text style={styles.label}>Sex</Text>
              <Text style={styles.value}>{profile.sex}</Text>
            </View>
          </View>
        </View>

        {/* Contact Information - EDITABLE */}
        <Text style={styles.sectionTitle}>Contact Information</Text>
        <View style={styles.section}>
          <View style={styles.detailRow}>
            <View style={styles.detailCol}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>{profile.email || 'N/A'}</Text>
            </View>
            <View style={styles.detailCol}>
              <Text style={styles.label}>Phone Number</Text>
              <Text style={styles.value}>{profile.phone_number || 'N/A'}</Text>
            </View>
          </View>
        </View>

        {/* Status Information - EDITABLE for residents only (hiding voter status) */}
        {!isNonResident && (
          <>
            <Text style={styles.sectionTitle}>Status Information</Text>
            <View style={styles.section}>
              <View style={styles.detailRow}>
                <View style={styles.detailCol}>
                  <Text style={styles.label}>Civil Status</Text>
                  <Text style={styles.value}>{profile.civil_status}</Text>
                </View>
                <View style={styles.detailCol}>
                  <Text style={styles.label}>Religion</Text>
                  <Text style={styles.value}>{profile.religion}</Text>
                </View>
              </View>
              <View style={styles.detailRow}>
                <View style={styles.detailCol}>
                  <Text style={styles.label}>Educational Attainment</Text>
                  <Text style={styles.value}>{profile.educational_attainment}</Text>
                </View>
                <View style={styles.detailCol}>
                  {profile.gender && (
                    <>
                      <Text style={styles.label}>Gender</Text>
                      <Text style={styles.value}>{profile.gender}</Text>
                    </>
                  )}
                </View>
              </View>
            </View>
          </>
        )}

        {/* Address Section */}
        <Text style={styles.sectionTitle}>
          Address {/* Address {isNonResident ? '(Barangay & City Editable)' : '(House & Street Editable)'} */}
        </Text>
        <View style={[styles.section, !isNonResident && styles.partialEditSection]}>
          <View style={styles.detailRow}>
            <View style={styles.detailCol}>
              <Text style={styles.label}>House Number</Text>
              <Text style={styles.value}>{profile.house_number || 'N/A'}</Text>
            </View>
            <View style={styles.detailCol}>
              <Text style={styles.label}>Street</Text>
              <Text style={styles.value}>{profile.street || 'N/A'}</Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <View style={styles.detailCol}>
              <Text style={styles.label}>Sitio {!isNonResident && '(Fixed)'}</Text>
              <Text style={styles.value}>{profile.sitio || 'N/A'}</Text>
            </View>
            <View style={styles.detailCol}>
              <Text style={styles.label}>Barangay {isNonResident ? '✏️' : '(Fixed)'}</Text>
              <Text style={styles.value}>{profile.barangay}</Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <View style={styles.detailCol}>
              <Text style={styles.label}>City/Municipality {isNonResident ? '✏️' : '(Fixed)'}</Text>
              <Text style={styles.value}>{profile.city_municipality || 'N/A'}</Text>
            </View>
            <View style={styles.detailCol}>
              <Text style={styles.label}>Country (Fixed)</Text>
              <Text style={styles.value}>{profile.country || 'Philippines'}</Text>
            </View>
          </View>
        </View>

        {/* Account Information */}
        <Text style={styles.sectionTitle}>Account Information</Text>
        <View style={[styles.section, styles.readOnlySection]}>
          <View style={styles.detailRow}>
            <View style={styles.detailCol}>
              <Text style={styles.label}>Username</Text>
              <Text style={styles.value}>{profile.username}</Text>
            </View>
            <View style={styles.detailCol}>
              <Text style={styles.label}>Resident Status</Text>
              <Text style={styles.value}>{profile.resident_status}</Text>
            </View>
          </View>
        </View>

        <Pressable style={styles.editBtn} onPress={() => setModalVisible(true)}>
          <MaterialIcons name="edit" size={20} color="#fff" style={{ marginRight: 6 }} />
          <Text style={styles.editBtnText}>Edit Profile</Text>
        </Pressable>
      </View>

      {/* Edit Profile Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            
            <ScrollView style={{ maxHeight: '80%' }}>
              
              {/* Profile Image Section */}
              <View style={styles.imageSection}>
                <Text style={styles.sectionTitle}>Profile Picture</Text>
                <View style={styles.imageContainer}>
                  {selectedImage ? (
                    <Image source={{ uri: selectedImage.uri }} style={styles.selectedImage} />
                  ) : profile.profile_image_path && !imageError ? (
                    <Image 
                      source={{ uri: profile.profile_image_path }} 
                      style={styles.selectedImage}
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <MaterialIcons name="person" size={40} color="#ccc" />
                      <Text style={styles.imagePlaceholderText}>No Image</Text>
                    </View>
                  )}
                </View>
                <Pressable style={styles.imagePickerBtn} onPress={pickImage}>
                  <Ionicons name="camera" size={20} color="#FF3D33" />
                  <Text style={styles.imagePickerBtnText}>
                    {selectedImage || (profile.profile_image_path && !imageError) ? 'Change Photo' : 'Add Photo'}
                  </Text>
                </Pressable>
              </View>

              {/* Contact Information */}
              <Text style={styles.modalSectionTitle}>Contact Information</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={editData.email || ''}
                  onChangeText={(text) => setEditData({...editData, email: text})}
                  placeholder="Enter email"
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <TextInput
                  style={styles.input}
                  value={editData.phone_number || ''}
                  onChangeText={(text) => setEditData({...editData, phone_number: text})}
                  placeholder="09XXXXXXXXX"
                  keyboardType="phone-pad"
                />
              </View>

              {/* Address Information - Always Editable */}
              <Text style={styles.modalSectionTitle}>Address Information</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>House Number</Text>
                <TextInput
                  style={styles.input}
                  value={editData.house_number || ''}
                  onChangeText={(text) => setEditData({...editData, house_number: text})}
                  placeholder="Enter house number"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Street</Text>
                <TextInput
                  style={styles.input}
                  value={editData.street || ''}
                  onChangeText={(text) => setEditData({...editData, street: text})}
                  placeholder="Enter street"
                />
              </View>

              {/* Non-Resident Additional Address Fields (excluding country) */}
              {isNonResident && (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Barangay</Text>
                    <TextInput
                      style={styles.input}
                      value={editData.barangay || ''}
                      onChangeText={(text) => setEditData({...editData, barangay: text})}
                      placeholder="Enter barangay"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>City/Municipality</Text>
                    <TextInput
                      style={styles.input}
                      value={editData.city_municipality || ''}
                      onChangeText={(text) => setEditData({...editData, city_municipality: text})}
                      placeholder="Enter city/municipality"
                    />
                  </View>
                </>
              )}

              {/* Status Information (Residents Only) - Hiding Voter Status */}
              {!isNonResident && (
                <>
                  <Text style={styles.modalSectionTitle}>Status Information</Text>
                  
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Civil Status</Text>
                    <View style={styles.picker}>
                      <Picker
                        selectedValue={editData.civil_stat_id}
                        onValueChange={(value) => setEditData({...editData, civil_stat_id: value})}
                      >
                        <Picker.Item label="Select Civil Status" value={null} />
                        {civilStatusOptions.map((cs: any) => (
                          <Picker.Item key={cs.civil_stat_id} label={cs.civil_name} value={cs.civil_stat_id} />
                        ))}
                      </Picker>
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Educational Attainment</Text>
                    <View style={styles.picker}>
                      <Picker
                        selectedValue={editData.educational_attain_id}
                        onValueChange={(value) => setEditData({...editData, educational_attain_id: value})}
                      >
                        <Picker.Item label="Select Educational Attainment" value={null} />
                        {educationOptions.map((ed: any) => (
                          <Picker.Item key={ed.educational_attain_id} label={ed.educational_attain_name} value={ed.educational_attain_id} />
                        ))}
                      </Picker>
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Religion</Text>
                    <View style={styles.picker}>
                      <Picker
                        selectedValue={editData.religion_cat_id}
                        onValueChange={(value) => setEditData({...editData, religion_cat_id: value})}
                      >
                        <Picker.Item label="Select Religion" value={null} />
                        {religionOptions.map((rel: any) => (
                          <Picker.Item key={rel.religion_cat_id} label={rel.religion_name} value={rel.religion_cat_id} />
                        ))}
                      </Picker>
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Gender (Optional)</Text>
                    <TextInput
                      style={styles.input}
                      value={editData.gender || ''}
                      onChangeText={(text) => setEditData({...editData, gender: text})}
                      placeholder="Enter gender"
                    />
                  </View>
                </>
              )}
              
            </ScrollView>

            {/* Modal Buttons */}
            <View style={styles.modalButtons}>
              <Pressable 
                style={styles.cancelBtn} 
                onPress={() => {
                  setModalVisible(false);
                  setSelectedImage(null);
                }}
                disabled={updating}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>
              
              <Pressable 
                style={[styles.saveBtn, updating && styles.saveBtnDisabled]} 
                onPress={handleSave}
                disabled={updating}
              >
                {updating ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.saveBtnText}>Save Changes</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

// ... rest of the styles remain the same
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
  headerSection: {
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  profileImageContainer: {
    marginBottom: 10,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  residentCode: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  fullName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginTop: 5,
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
  readOnlySection: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#6b7280',
  },
  partialEditSection: {
    backgroundColor: '#f0f9ff',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#0ea5e9',
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    width: '95%',
    maxHeight: '95%',
    elevation: 4,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FF3D33',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginTop: 15,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 5,
  },
  imageSection: {
    alignItems: 'center',
    marginBottom: 15,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  selectedImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#FF3D33',
  },
  imagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  imagePlaceholderText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  imagePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FF3D33',
  },
  imagePickerBtnText: {
    color: '#FF3D33',
    fontWeight: '600',
    marginLeft: 5,
    fontSize: 14,
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    backgroundColor: '#fff',
  },
  picker: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#fff',
    height: 50,
    justifyContent: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#374151',
    fontWeight: 'bold',
    fontSize: 15,
  },
  saveBtn: {
    flex: 1,
    backgroundColor: '#FF3D33',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveBtnDisabled: {
    backgroundColor: '#9ca3af',
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  imageLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 40,
  },
});