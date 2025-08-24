import { API_BASE_URL, API_ENDPOINTS } from '@/constants/apiConfig';

export interface PasswordChangeData {
  personnel_id: number;
  old_password: string;
  new_password: string;
}

export const changePersonnelPassword = async (data: PasswordChangeData): Promise<any> => {
  try {
    console.log('Changing personnel password...');
    
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CHANGE_PERSONNEL_PASSWORD}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    // if (!response.ok) {
    //   throw new Error(`HTTP error! status: ${response.status}`);
    // }

    const result = await response.json();
    console.log('Password change response:', result);

    // check if the request was successful
    if(response.ok) {
      return result;
    } else {
      // for non-200 responses, throw an error with the specific message from backend
      throw new Error(result.message || `HTTP error! status: ${response.status}`);
    }
    
    // return result;
    
  } catch (error) {
    // console log message
    // console.error('Error changing password:', error);
    throw error;
  }
};