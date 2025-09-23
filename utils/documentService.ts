import { API_BASE_URL, API_CONFIG, API_ENDPOINTS } from '@/constants/apiConfig';

export interface DocumentType {
  document_type_id: number;
  document_type_name: string;
  description?: string;
  cost?: number;
}

export interface ClearancePurpose {
  clearance_purpose_id: number;
  purpose_name: string;
  fee: string;
  description?: string;
}

export interface ApplicationStatus {
  id: number;
  name: string;
  description?: string;
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

// Fetch application status
export const fetchApplicationStatus = async (): Promise<ApplicationStatus[]> => {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}${API_ENDPOINTS.APPLICATION_STATUS}`, {
      method: 'GET',
      headers: API_CONFIG.headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching application status:', error);
    throw error;
  }
};