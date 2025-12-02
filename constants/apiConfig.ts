// const isDevelopment = __DEV__;
const isDevelopment = process.env.NODE_ENV === 'development';
// use __DEV__ for development set to false for production api testing

const DEV_API_URL = process.env.EXPO_PUBLIC_DEV_API_URL || 'http://127.0.0.1:8000';
const PROD_API_URL = process.env.EXPO_PUBLIC_PROD_API_URL || 'https://lambo-web-5mka.onrender.com';

// Automatic environment switching
export const API_BASE_URL = isDevelopment ? DEV_API_URL : PROD_API_URL;
// export const API_BASE_URL = isDevelopment 
//   ? 'http://192.168.1.10:8000'                    //  current development server
//   : 'https://lambo-web-5mka.onrender.com';  // future production server

// All API endpoints
export const API_ENDPOINTS = {
  // Authentication
  MOBILE_LOGIN: '/api/mobile-login/',
  CHANGE_PERSONNEL_PASSWORD: '/api/change-personnel-password/',
  CHECK_USERNAME: '/api/check-username/',
  
  // Registration 
  RESIDENT_REGISTER: '/api/register/',
  VERIFY_ID_FIELDS: '/api/verify-id-fields/',
  VERIFY_GUARDIAN: '/api/verify-guardian/',


  // Profile
  RESIDENT_PROFILE: '/api/resident-profile/',
  UPDATE_RESIDENT_PROFILE: '/api/update-resident-profile/',
  SUBMIT_PROFILE_VERIFICATION: '/api/submit-profile-verification/',

  // Household Profiling
  HOUSEHOLD_INSERT: '/household_api/households/insert/',
  HOUSEHOLD_OWNERSHIP_TYPE: '/household_api/house-ownership-types/',
  HOUSEHOLD_TYPE: '/household_api/household-types/',
  HOUSEHOLD_RELATIONSHIP: '/household_api/relationships/',
  HOUSE_TYPE: '/household_api/house-types/',
  HOUSEHOLD_DETAIL: '/household_api/households/',  
  HOUSEHOLD_FAMILIES: '/household_api/households/', 

  //GEN HEALTH
  MEDICAL_HISTORY_TYPES: '/household_api/medical-history-types/',
  CLASSES: '/household_api/classes/',
  FP_METHODS: '/household_api/fp-methods/',
  FP_STATUSES: '/household_api/fp-statuses/',
  GENERAL_HEALTH_CREATE: '/household_api/family-members/<family_member_id>/general-health/create/',

  GENERAL_HEALTH_LIST: '/household_api/general-health/',
  GENERAL_HEALTH_DETAIL: (familyMemberId: number) => 
    `/household_api/general-health/${familyMemberId}/`,

  // CHILD HEALTH
  CHILD_HEALTH_FEEDING_METHODS: '/household_api/feeding-methods/',
  CHILD_HEALTH_MONTHS: '/household_api/months/',
  CHILD_HEALTH_TT_STATUSES: '/household_api/tt-statuses/',
  // CHILD_HEALTH_VACCINE_TYPES: '/household_api/vaccine-types/',
  // CHILD_HEALTH_DOSE_TYPES: '/household_api/dose-types/',
  VACCINE_TYPES: '/household_api/vaccine-types/',
  DOSE_TYPES: '/household_api/dose-types/',
  CHILD_HEALTH_SUPPLEMENTS: '/household_api/supplements/',
  CHILD_HEALTH_SEARCH: '/household_api/search-child/',
  CHILD_HEALTH_CREATE: '/household_api/child-health-records/create/',
  CHILD_HEALTH_DETAIL: '/household_api/child-health-records/',
  CHILD_HEALTH_UPDATE: '/household_api/child-health-records/',

   // CHILD HEALTH - IMMUNIZATION
CHILD_IMMUNIZATIONS_LIST: (childHealthId: number) =>
    `/household_api/child-health-records/${childHealthId}/immunizations/`,

  CHILD_IMMUNIZATIONS_ADD: (childHealthId: number) =>
    `/household_api/child-health-records/${childHealthId}/immunizations/add/`,
bhwDashboard: "/household_api/bhw-dashboard/",

  // CHILD HEALTH - SUPPLEMENTS
  CHILD_SUPPLEMENTS_LIST: (childHealthId: number) => 
    `/household_api/child-health-records/${childHealthId}/supplements/`,
  CHILD_SUPPLEMENTS_ADD: (childHealthId: number) => 
    `/household_api/child-health-records/${childHealthId}/supplements/add/`,

  // CHILD HEALTH - MEDICAL CONDITIONS
  CHILD_MEDICAL_CONDITIONS_LIST: (childHealthId: number) => 
    `/household_api/child-health-records/${childHealthId}/medical-conditions/`,
  CHILD_MEDICAL_CONDITIONS_ADD: (childHealthId: number) => 
    `/household_api/child-health-records/${childHealthId}/medical-conditions/add/`,

  // CHILD HEALTH - SURGICAL HISTORY
  CHILD_SURGICAL_HISTORY_LIST: (childHealthId: number) => 
    `/household_api/child-health-records/${childHealthId}/surgical-history/`,
  CHILD_SURGICAL_HISTORY_ADD: (childHealthId: number) => 
    `/household_api/child-health-records/${childHealthId}/surgical-history/add/`,


  // CHILD HEALTH - GROWTH MONITORING
  CHILD_GROWTH_MONITORING_LIST: '/household_api/child-health-records/',
  CHILD_GROWTH_MONITORING_ADD: '/household_api/child-health-records/',

  // CHILD HEALTH - EXCLUSIVE BREASTFEEDING
  CHILD_EXCLUSIVE_BREASTFEED_LIST: (childHealthId: number) => 
    `/household_api/child-health-records/${childHealthId}/exclusive-breastfeed/`,
  CHILD_EXCLUSIVE_BREASTFEED_ADD: (childHealthId: number) => 
    `/household_api/child-health-records/${childHealthId}/exclusive-breastfeed/add/`,
  
  // MONTHS LIST (for dropdown)
  MONTHS_LIST: `/household_api/months/`,
  
  
  // Household/Family Visitation
  HOUSEHOLD_MARK_VISITED: '/household_api/households/',
  FAMILY_MARK_VISITED: '/household_api/families/',
  FAMILY_GH_READINESS: '/household_api/families/',

  // Data endpoints 
  CIVIL_STATUSES: '/api/civil-statuses/',
  EDUCATIONAL_ATTAINMENTS: '/api/educational-attainments/',
  SITIOS: '/api/sitios/',
  RELIGIONS: '/api/religions/',

  QUARTERS: '/household_api/quarters/',

      // Certificate Requests
  DOCUMENT_TYPES: '/certificate_api/document-types/',
  CLEARANCE_PURPOSES: '/certificate_api/clearance-purposes/',
  CREATE_CLEARANCE_APPLICATION: '/certificate_api/create-clearance-application/',
  
  // Resident Applications & Transactions
  RESIDENT_APPLICATIONS: '/certificate_api/residents/<int:resident_id>/applications/',
  RESIDENT_APPLICATION_DETAIL: '/certificate_api/residents/<int:resident_id>/applications/<int:application_id>/',
  RESIDENT_TRANSACTIONS: '/certificate_api/residents/<int:resident_id>/transactions/',
  RESIDENT_TRANSACTION_DETAIL: '/certificate_api/residents/<int:resident_id>/transactions/<int:transaction_id>/',
  CANCEL_CLEARANCE: '/certificate_api/residents/<int:resident_id>/applications/<int:application_id>/cancel/',

    // ========================================
  // MATERNAL HEALTH - LOOKUP DATA
  // ========================================
  MATERNAL_DISEASE_TYPES: '/household_api/disease-types/',
  MATERNAL_TRIMESTERS: '/household_api/trimesters/',
  MATERNAL_TEST_TYPES: '/household_api/test-types/',
  MATERNAL_SUPPLEMENT_TYPES: '/household_api/supplement-types/',
  MATERNAL_DEWORMING_TYPES: '/household_api/deworming-types/',
  MATERNAL_OUTCOME_TYPES: '/household_api/outcome-types/',
  MATERNAL_DELIVERY_TYPES: '/household_api/delivery-types/',
  MATERNAL_PLACE_DELIVERY_TYPES: '/household_api/place-delivery-types/',
  MATERNAL_OWNERSHIP_TYPES: '/household_api/ownership-types/',
  MATERNAL_BIRTH_ATTENDANTS: '/household_api/birth-attendants/',
  MATERNAL_RECORD_STATUSES: '/household_api/record-statuses/',

  // ========================================
  // MATERNAL HEALTH - SEARCH & LIST
  // ========================================
  MATERNAL_SEARCH_MOTHER: '/household_api/search-mother/',
  MATERNAL_RECORDS_LIST: '/household_api/maternal-health-records/',
  
  // ========================================
  // MATERNAL HEALTH - RECORD CRUD
  // ========================================
  MATERNAL_RECORD_CREATE: '/household_api/maternal-health-records/create/',
  MATERNAL_RECORD_DETAIL: (maternalHealthId: number) =>
    `/household_api/maternal-health-records/${maternalHealthId}/`,
  MATERNAL_RECORD_UPDATE: (maternalHealthId: number) =>
    `/household_api/maternal-health-records/${maternalHealthId}/update/`,

  // MATERNAL HEALTH - OBSTETRICAL HISTORY
  OBSTETRICAL_HISTORY_CREATE: (maternalHealthId: number) =>
    `/household_api/maternal-health-records/${maternalHealthId}/obstetrical-history/create/`,
  
  OBSTETRICAL_HISTORY_LIST: (maternalHealthId: number) =>
    `/household_api/maternal-health-records/${maternalHealthId}/obstetrical-history/`,

  // ========================================
  // MATERNAL HEALTH - MEDICAL/SURGICAL HISTORY
  // ========================================
  MATERNAL_MEDICAL_CONDITIONS_LIST: (maternalHealthId: number) =>
    `/household_api/maternal-health-records/${maternalHealthId}/medical-conditions/`,
  MATERNAL_MEDICAL_CONDITIONS_ADD: (maternalHealthId: number) =>
    `/household_api/maternal-health-records/${maternalHealthId}/medical-conditions/add/`,
  
  MATERNAL_SURGICAL_HISTORY_LIST: (maternalHealthId: number) =>
    `/household_api/maternal-health-records/${maternalHealthId}/surgical-history/`,
  MATERNAL_SURGICAL_HISTORY_ADD: (maternalHealthId: number) =>
    `/household_api/maternal-health-records/${maternalHealthId}/surgical-history/add/`,

  // ========================================
  // MATERNAL HEALTH - IMMUNIZATION (TT)
  // ========================================
  MATERNAL_IMMUNIZATION_TRACK: (maternalHealthId: number) =>
    `/household_api/maternal-health-records/${maternalHealthId}/immunization/track/`,
  MATERNAL_IMMUNIZATION_ADD: (maternalHealthId: number) =>
    `/household_api/maternal-health-records/${maternalHealthId}/immunization/add/`,

  // ========================================
  // MATERNAL HEALTH - DISEASE SURVEILLANCE
  // ========================================
  MATERNAL_DISEASE_SURVEILLANCE_LIST: (maternalHealthId: number) =>
    `/household_api/maternal-health-records/${maternalHealthId}/disease-surveillance/`,

  MATERNAL_DISEASE_SURVEILLANCE_ADD: (maternalHealthId: number) =>
    `/household_api/maternal-health-records/${maternalHealthId}/disease-surveillance/add/`,

  // ========================================
  // MATERNAL HEALTH - LABORATORY SCREENING
  // ========================================
  MATERNAL_LAB_SCREENING_LIST: (maternalHealthId: number) =>
    `/household_api/maternal-health-records/${maternalHealthId}/laboratory-screening/`,
  MATERNAL_LAB_SCREENING_ADD: (maternalHealthId: number) =>
    `/household_api/maternal-health-records/${maternalHealthId}/laboratory-screening/add/`,

  // ========================================
  // MATERNAL HEALTH - CHECKUP RECORDS
  // ========================================
  CHECKUP_LIST: (maternalHealthId: number) =>
    `/household_api/maternal-health-records/${maternalHealthId}/checkups/`,
  CHECKUP_ADD: (maternalHealthId: number) =>
    `/household_api/maternal-health-records/${maternalHealthId}/checkups/add/`,
  CHECKUP_TRACK: (maternalHealthId: number) =>
    `/household_api/maternal-health-records/${maternalHealthId}/checkups/track/`,

  // ========================================
  // MATERNAL HEALTH - SUPPLEMENTS
  // ========================================
  MATERNAL_SUPPLEMENTS_LIST: (maternalHealthId: number) =>
    `/household_api/maternal-health-records/${maternalHealthId}/supplements/`,
  MATERNAL_SUPPLEMENTS_ADD: (maternalHealthId: number) =>
    `/household_api/maternal-health-records/${maternalHealthId}/supplements/add/`,

  // ========================================
  // MATERNAL HEALTH - DEWORMING
  // ========================================
  MATERNAL_DEWORMING_LIST: (maternalHealthId: number) =>
    `/household_api/maternal-health-records/${maternalHealthId}/deworming/`,
  MATERNAL_DEWORMING_ADD: (maternalHealthId: number) =>
    `/household_api/maternal-health-records/${maternalHealthId}/deworming/add/`,

  // ========================================
  // MATERNAL HEALTH - PREGNANCY OUTCOME
  // ========================================
  MATERNAL_DELIVERY_OUTCOME_VIEW: (maternalHealthId: number) =>
    `/household_api/maternal-health-records/${maternalHealthId}/delivery-outcome/`,
  MATERNAL_DELIVERY_OUTCOME_ADD: (maternalHealthId: number) =>
    `/household_api/maternal-health-records/${maternalHealthId}/delivery-outcome/add/`,

  // ========================================
  // MATERNAL HEALTH - POSTPARTUM
  // ========================================
  MATERNAL_POSTPARTUM_LIST: (maternalHealthId: number) =>
    `/household_api/maternal-health-records/${maternalHealthId}/postpartum/`,
  MATERNAL_POSTPARTUM_ADD: (maternalHealthId: number) =>
    `/household_api/maternal-health-records/${maternalHealthId}/postpartum/add/`,
  
};

// API settings
export const API_CONFIG = {
  timeout: 30000, // 30 seconds - adjust if server is slow
  headers: {
    'Content-Type': 'application/json',
  },
};


export const fetchWithTimeout = async (
  url: string,
  options: RequestInit = {},
  timeoutMs: number = 30000
): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - server took too long to respond');
    }
    throw error;
  }
};