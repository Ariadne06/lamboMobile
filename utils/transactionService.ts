import { API_BASE_URL, API_CONFIG, API_ENDPOINTS } from '@/constants/apiConfig';

export interface Transaction {
  transaction_id: number;
  transaction_code: string;
  application_id: number | null;
  fee_type: string;
  request: string;
  total_amount: number;
  payment_status: string;
  date_submitted: string;
  date_paid: string | null;
  or_number: string | null;
  updated_at: string;
  is_business: boolean;
  business_id: number | null;
  business_name: string | null;
}

export interface TransactionDetail extends Transaction {
  applicant_id?: number;
  applicant_name?: string;
  cancel_reason?: string | null;
  canceled_at?: string | null;
  canceled_by_id?: number | null;
  canceled_by_type?: string | null;
  canceled_by_full_name?: string | null;
  total_amount_details?: string;
  resident_id?: number;
  resident_name?: string;
  paid_by?: string | null;
  paid_by_id?: number | null;
  paid_by_full_name?: string | null;
  notes?: string | null;
  processed_by?: string | null;
  processed_by_id?: number | null;
  processed_by_full_name?: string | null;
  payment_method?: string | null;
  reference_number?: string | null;
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

// Fetch resident transactions
export const fetchResidentTransactions = async (
  residentId: number,
  options?: {
    query?: string;
    payment_status?: string;
    transaction_type?: string;
    limit?: number;
    offset?: number;
  }
): Promise<{ data: Transaction[]; count: number; limit: number; offset: number }> => {
  try {
    const queryParams = new URLSearchParams();
    if (options?.query) queryParams.append('query', options.query);
    if (options?.payment_status) queryParams.append('payment_status', options.payment_status);
    if (options?.transaction_type) queryParams.append('transaction_type', options.transaction_type);
    if (options?.limit) queryParams.append('limit', options.limit.toString());
    if (options?.offset) queryParams.append('offset', options.offset.toString());

    const endpoint = API_ENDPOINTS.RESIDENT_TRANSACTIONS.replace('<int:resident_id>', residentId.toString());
    const url = `${API_BASE_URL}${endpoint}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    
    console.log('🔄 Fetching resident transactions from:', url);
    
    const response = await fetchWithTimeout(url, {
      method: 'GET',
      headers: API_CONFIG.headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('📥 Resident transactions response:', result);
    
    return {
      data: result.data || [],
      count: result.count || 0,
      limit: result.limit || 50,
      offset: result.offset || 0,
    };
  } catch (error) {
    console.error('Error fetching resident transactions:', error);
    throw error;
  }
};

// Fetch specific transaction detail
export const fetchTransactionDetail = async (
  residentId: number,
  transactionId: number
): Promise<TransactionDetail> => {
  try {
    const endpoint = API_ENDPOINTS.RESIDENT_TRANSACTION_DETAIL
      .replace('<int:resident_id>', residentId.toString())
      .replace('<int:transaction_id>', transactionId.toString());
    const url = `${API_BASE_URL}${endpoint}`;
    
    console.log('🔄 Fetching transaction detail from:', url);
    
    const response = await fetchWithTimeout(url, {
      method: 'GET',
      headers: API_CONFIG.headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('📥 Transaction detail response:', result);
    
    return result.data;
  } catch (error) {
    console.error('Error fetching transaction detail:', error);
    throw error;
  }
};
