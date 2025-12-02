import { API_BASE_URL, API_ENDPOINTS } from '../constants/apiConfig';

export interface BHWDashboardData {
  total_households: number;
  total_families: number;
  total_active_maternal: number;
  total_active_maternal_by_bhw: number;
  total_children_upcoming_immun_5d: number;
  households_visited_today_by_bhw: number;
  total_male: number;
  total_female: number;
  age_group_0_5: number;
  age_group_6_12: number;
  age_group_13_17: number;
  age_group_18_59: number;
  age_group_60_plus: number;
  hh_visited_count: number;
  hh_not_visited_count: number;
  hh_visited_percent: number;
  fam_visited_count: number;
  fam_not_visited_count: number;
  fam_visited_percent: number;
  households_per_purok: Array<{
    sitio_id: number;
    sitio_name: string;
    total_households: number;
  }>;
  quarter_id: number;
}

export interface BHWDashboardResponse {
  success: boolean;
  data: BHWDashboardData;
  error?: string;
}

/**
 * Fetch BHW dashboard statistics
 * @param personnelId - The personnel ID of the BHW
 * @param quarterId - Optional specific quarter ID. Defaults to current quarter.
 */
export const fetchBHWDashboard = async (
  personnelId: number,
  quarterId?: number
): Promise<BHWDashboardData> => {
  try {
    const params = new URLSearchParams({
      personnel_id: personnelId.toString(),
    });

    if (quarterId) {
      params.append('quarter_id', quarterId.toString());
    }

    const url = `${API_BASE_URL}${API_ENDPOINTS.BHW_DASHBOARD}?${params.toString()}`;
    console.log('📊 Fetching BHW dashboard from:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: BHWDashboardResponse = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch dashboard data');
    }

    // Fix: Parse households_per_purok if it's a string
    if (result.data.households_per_purok && typeof result.data.households_per_purok === 'string') {
      try {
        result.data.households_per_purok = JSON.parse(result.data.households_per_purok);
      } catch (e) {
        console.error('Failed to parse households_per_purok:', e);
        result.data.households_per_purok = [];
      }
    }

    console.log('✅ BHW Dashboard data received:', result.data);
    return result.data;
  } catch (error) {
    console.error('❌ Error fetching BHW dashboard:', error);
    throw error;
  }
};
