const isDevelopment = __DEV__;

// Automatic environment switching
export const API_BASE_URL = isDevelopment 
  ? 'http://10.107.112.20:8000/'                    //  current development server
  : 'https://lambo-web-5mka.onrender.com/';  // future production server

// export const API_BASE_URL = 'https://lambo-web-5mka.onrender.com';


// All API endpoints
export const API_ENDPOINTS = {
  // Authentication
  MOBILE_LOGIN: '/api/mobile-login/',
  CHANGE_PERSONNEL_PASSWORD: '/api/change-personnel-password/',
  
  // Registration 
  RESIDENT_REGISTER: '/api/register/',
  VERIFY_ID_FIELDS: '/api/verify-id-fields/',
  VERIFY_GUARDIAN: '/api/verify-guardian/',

  // Profile
  RESIDENT_PROFILE: '/api/resident-profile/',
  UPDATE_RESIDENT_PROFILE: '/api/update-resident-profile/',
  
  // Data endpoints 
  CIVIL_STATUSES: '/api/civil-statuses/',
  EDUCATIONAL_ATTAINMENTS: '/api/educational-attainments/',
  SITIOS: '/api/sitios/',
  RELIGIONS: '/api/religions/',
  
  // Certificate/Document requests
  DOCUMENT_TYPES: '/certificate_api/document-types/',
  CLEARANCE_PURPOSES: '/certificate_api/clearance-purposes/',
  APPLICATION_STATUS: '/certificate_api/application-status/',
};

// API settings
export const API_CONFIG = {
  timeout: 10000, // 10 seconds - adjust if server is slow
  headers: {
    'Content-Type': 'application/json',
  },
};