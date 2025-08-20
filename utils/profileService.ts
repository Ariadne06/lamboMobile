import { API_BASE_URL, API_ENDPOINTS} from '@/constants/apiConfig';
import {getUserSession} from './session';

export interface ResidentProfile {
    resident_id: number;
    resident_code: string;

    first_name: string;
    middle_name: string;
    last_name: string;
    suffix: string;
    dob: string;
    sex: string;
    gender: string;
    is_voter: boolean;
    email: string;
    phone_number: string;
    profile_image_path: string | null;

    civil_status: string;
    religion: string;
    educational_attainment: string;
    resident_status: string;

    house_number: string;
    street: string;
    barangay: string;
    sitio: string;
    city_municipality: string;
    country: string;

    username: string;
}

export const fetchResidentProfile = async (): Promise<ResidentProfile | null> => {
    try {
        // get current user session to get user_Id
        const session = await getUserSession();

        if (!session || session.account_type !== 'resident') {
            console.error(' No resident session found');
            return null;
        }

    console.log(`Fetching profile for resident_id: ${session.user_id}`);

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.RESIDENT_PROFILE}${session.user_id}/`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            // Add session token for authentication if needed
            // 'Authorization': `Bearer ${session.session_token}`,
        },
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Profile data received:', data);

//     if (data.success) {
//         return data.profile;
//     } else {
//         console.error('Profile fetch failed:', data.message);
//         return null;
//     }

//     } catch (error) {
//         return null;
//     }
// };

    if (data.success && data.profile) {
        return {
            ...data.profile,
            // Ensure profile_image_path is properly handled
            profile_image_path: data.profile.profile_image_path || null,
        };
    }

    return null;
  } catch (error) {
    console.error('Error fetching resident profile:', error);
    throw error;
  }
};


