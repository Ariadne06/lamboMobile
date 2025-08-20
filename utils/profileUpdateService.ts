import { API_BASE_URL, API_ENDPOINTS } from '@/constants/apiConfig';
import { getUserSession } from './session';

export interface ProfileUpdateData {
  // Contact Information (always editable)
  email?: string;
  phone_number?: string;
  
  // Status Information (editable for residents)
  civil_stat_id?: number;
  educational_attain_id?: number;
  religion_cat_id?: number;
  other_religion?: string;
  gender?: string;
  
  // Address (editable for both residents and non-residents)
  house_number?: string;
  street?: string;
  
  // Address (editable for non-residents only)
  barangay?: string;
  city_municipality?: string;
  
  // Profile image
  profile_image?: any; // File/blob for upload
}

export const updateResidentProfile = async (updateData: ProfileUpdateData): Promise<any> => {
  try {
    // Get current user session
    const session = await getUserSession();
    
    if (!session || session.account_type !== 'resident') {
      throw new Error('No resident session found');
    }
    
    console.log(`📝 Updating profile for resident_id: ${session.user_id}`);
    console.log(`📝 Update data:`, updateData);
    
    // Create FormData for multipart request (needed for image upload)
    const formData = new FormData();
    
    // Add all non-image fields with type-safe approach
    // Define the keys we want to include (excluding profile_image and country)
    const fieldsToInclude: (keyof ProfileUpdateData)[] = [
      'email', 'phone_number', 'civil_stat_id', 'educational_attain_id', 
      'religion_cat_id', 'other_religion', 'gender', 'house_number', 
      'street', 'barangay', 'city_municipality'
      
    ];
    
    fieldsToInclude.forEach(key => {
      const value = updateData[key];
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });
    
    // Add profile image if provided
    if (updateData.profile_image) {
      formData.append('profile_image', {
        uri: updateData.profile_image.uri,
        type: updateData.profile_image.type || 'image/jpeg',
        name: updateData.profile_image.fileName || `profile_${session.user_id}_${Date.now()}.jpg`,
      } as any);
    }
    
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.UPDATE_RESIDENT_PROFILE}${session.user_id}/`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        // Don't set Content-Type for FormData - let the browser set it with boundary
      },
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('📝 Profile update response:', data);
    
    if (data.success) {
      return data;
    } else {
      throw new Error(data.message || 'Failed to update profile');
    }
    
  } catch (error) {
    console.error('📝 Error updating profile:', error);
    throw error;
  }
};