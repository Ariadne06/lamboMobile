import AsyncStorage from '@react-native-async-storage/async-storage';

// Define what user information we want to save
export interface UserSession {
  account_type: 'personnel' | 'resident';
  user_id: number;
  username: string;
  role_name?: string;  // Only for personnel (nurse, admin, etc.)
  role_id?: number;    // Only for personnel
  session_token: string;
  login_time: string;  // When they logged in
}

// SAVE user login info to phone storage
export const storeUserSession = async (session: UserSession): Promise<void> => {
  try {
    const sessionWithTime = {
      ...session,
      login_time: new Date().toISOString() // Save when they logged in
    };
    
    await AsyncStorage.setItem('user_session', JSON.stringify(sessionWithTime));
    console.log(' User session saved to phone storage');
  } catch (error) {
    console.error(' Error saving session:', error);
  }
};

// GET user login info from phone storage
export const getUserSession = async (): Promise<UserSession | null> => {
  try {
    const session = await AsyncStorage.getItem('user_session');
    if (session) {
      const parsedSession = JSON.parse(session);
      // console.log(' User session found:', parsedSession.username);
      return parsedSession;
    } else {
      // console.log(' No user session found');
      return null;
    }
  } catch (error) {
    console.error(' Error getting session:', error);
    return null;
  }
};

// DELETE user login info (for logout)
export const clearUserSession = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem('user_session');
    console.log(' User session cleared from phone storage');
  } catch (error) {
    console.error(' Error clearing session:', error);
  }
};

// CHECK if user is logged in
export const isLoggedIn = async (): Promise<boolean> => {
  const session = await getUserSession();
  const loggedIn = session !== null;
  console.log(`User logged in status: ${loggedIn}`);
  return loggedIn;
};

// CHECK if session is expired (optional - for security)
export const isSessionExpired = async (): Promise<boolean> => {
  const session = await getUserSession();
  if (!session) return true;
  
  const loginTime = new Date(session.login_time);
  const now = new Date();
  const hoursSinceLogin = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60);
  
  // Expire after 24 hours
  const expired = hoursSinceLogin > 24;
  
  if (expired) {
    console.log(' Session expired, clearing...');
    await clearUserSession();
  }
  
  return expired;
};