import { API_BASE_URL, API_CONFIG, API_ENDPOINTS } from '@/constants/apiConfig';

export interface DocumentType {
  document_type_id: number;
  document_type_name: string;
  description?: string;
  cost?: number;
}

export interface ClearancePurpose {
  other_clearance_id: number;
  purpose_name: string;
  fee_amount: string;
  description?: string;
}

export interface Application {
  application_id: number;
  application_code: string;
  request: string;
  fee_type: string;
  application_status: string;
  payment_status: string;
  date_submitted: string;
  updated_at: string;
  total_amount: string;
  or_number: string | null;
  date_paid: string | null;
  is_business: boolean;
  business_id: number | null;
  business_name: string | null;
}

export interface ApplicationDetail extends Application {
  total_amount_details: any;
  applicant_id: number;
  applicant_name: string;
  requested_by: string;
  requested_by_id: number;
  requested_by_full_name: string;
  cancel_reason: string | null;
  canceled_at: string | null;
  canceled_by_type: string | null;
  canceled_by_id: number | null;
  canceled_by_full_name: string | null;
  reject_reason: string | null;
  rejected_at: string | null;
  rejected_by_type: string | null;
  rejected_by_id: number | null;
  rejected_by_full_name: string | null;
}

// Helper function to create timeout for fetch requests
const fetchWithTimeout = (url: string, options: RequestInit) => {
  return Promise.race([
    fetch(url, options),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), API_CONFIG.timeout)
    )
  ]);
};

// Fetch document types
export const fetchDocumentTypes = async (): Promise<DocumentType[]> => {
  try {
    console.log('🔄 Fetching document types from:', `${API_BASE_URL}${API_ENDPOINTS.DOCUMENT_TYPES}`);
    
    const response = await fetchWithTimeout(`${API_BASE_URL}${API_ENDPOINTS.DOCUMENT_TYPES}`, {
      method: 'GET',
      headers: API_CONFIG.headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('📥 Raw document types data:', JSON.stringify(data, null, 2));
    
    // Check if data is an array or if it's wrapped in a results property
    const documentTypes = Array.isArray(data) ? data : (data.results || data.data || []);
    console.log('📋 Processed document types:', documentTypes);
    
    return documentTypes;
  } catch (error) {
    console.error('Error fetching document types:', error);
    throw error;
  }
};

// Fetch clearance purposes
export const fetchClearancePurposes = async (): Promise<ClearancePurpose[]> => {
  try {
    console.log('🔄 Fetching clearance purposes from:', `${API_BASE_URL}${API_ENDPOINTS.CLEARANCE_PURPOSES}`);
    
    const response = await fetchWithTimeout(`${API_BASE_URL}${API_ENDPOINTS.CLEARANCE_PURPOSES}`, {
      method: 'GET',
      headers: API_CONFIG.headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('📥 Raw clearance purposes data:', JSON.stringify(data, null, 2));
    
    // Check if data is an array or if it's wrapped in a results property
    const purposes = Array.isArray(data) ? data : (data.results || data.data || []);
    console.log('📋 Processed clearance purposes:', purposes);
    
    return purposes;
  } catch (error) {
    console.error('Error fetching clearance purposes:', error);
    throw error;
  }
};

// Fetch resident applications
export const fetchResidentApplications = async (
  residentId: number,
  options?: {
    query?: string;
    app_status?: string;
    pay_status?: string;
    limit?: number;
    offset?: number;
  }
): Promise<{ data: Application[]; count: number; limit: number; offset: number }> => {
  try {
    const queryParams = new URLSearchParams();
    if (options?.query) queryParams.append('query', options.query);
    if (options?.app_status) queryParams.append('app_status', options.app_status);
    if (options?.pay_status) queryParams.append('pay_status', options.pay_status);
    if (options?.limit) queryParams.append('limit', options.limit.toString());
    if (options?.offset) queryParams.append('offset', options.offset.toString());

    const endpoint = API_ENDPOINTS.RESIDENT_APPLICATIONS.replace('<int:resident_id>', residentId.toString());
    const url = `${API_BASE_URL}${endpoint}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    
    console.log('🔄 Fetching resident applications from:', url);
    
    const response = await fetchWithTimeout(url, {
      method: 'GET',
      headers: API_CONFIG.headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('📥 Resident applications response:', result);
    
    return {
      data: result.data || [],
      count: result.count || 0,
      limit: result.limit || 50,
      offset: result.offset || 0,
    };
  } catch (error) {
    console.error('Error fetching resident applications:', error);
    throw error;
  }
};

// Fetch specific application detail
export const fetchApplicationDetail = async (
  residentId: number,
  applicationId: number
): Promise<ApplicationDetail> => {
  try {
    const endpoint = API_ENDPOINTS.RESIDENT_APPLICATION_DETAIL
      .replace('<int:resident_id>', residentId.toString())
      .replace('<int:application_id>', applicationId.toString());
    const url = `${API_BASE_URL}${endpoint}`;
    
    console.log('🔄 Fetching application detail from:', url);
    
    const response = await fetchWithTimeout(url, {
      method: 'GET',
      headers: API_CONFIG.headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('📥 Application detail response:', result);
    
    return result.data;
  } catch (error) {
    console.error('Error fetching application detail:', error);
    throw error;
  }
};

// Cancel clearance application
export const cancelClearanceApplication = async (
  residentId: number,
  applicationId: number,
  reason?: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const endpoint = API_ENDPOINTS.CANCEL_CLEARANCE
      .replace('<int:resident_id>', residentId.toString())
      .replace('<int:application_id>', applicationId.toString());
    const url = `${API_BASE_URL}${endpoint}`;
    
    console.log('🔄 Cancelling application:', url);
    
    const response = await fetchWithTimeout(url, {
      method: 'POST',
      headers: API_CONFIG.headers,
      body: JSON.stringify({ reason }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('📥 Cancel application response:', result);
    
    return result;
  } catch (error) {
    console.error('Error cancelling application:', error);
    throw error;
  }
};

