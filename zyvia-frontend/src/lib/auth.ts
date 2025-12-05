/**
 * A simple authentication manager for handling multiple user sessions in localStorage.
 */

// Define the structure for a user's session data
interface UserSession {
  accessToken: string;
  // You could add refreshToken, userDetails, etc. here in the future
}

// Define the overall structure of our auth data in localStorage
interface AuthStorage {
  users: Record<string, UserSession>; // An object mapping usernames to their session data
  currentUser: string | null;         // The username of the currently active user
}

const AUTH_KEY = 'zyviaAuthData';

/**
 * Retrieves the entire auth data object from localStorage.
 * @returns {AuthStorage} The parsed auth data or a default structure if not found.
 */
function getAuthData(): AuthStorage {
  try {
    const data = localStorage.getItem(AUTH_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('[AuthHelper] Failed to parse auth data from localStorage:', error);
    // If parsing fails, it's safer to clear it and start fresh
    localStorage.removeItem(AUTH_KEY);
  }
  // Return a default structure if no data is found or if an error occurred
  return { users: {}, currentUser: null };
}

/**
 * Saves the provided auth data object to localStorage.
 * @param {AuthStorage} data The auth data to save.
 */
function saveAuthData(data: AuthStorage): void {
  try {
    localStorage.setItem(AUTH_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('[AuthHelper] Failed to save auth data to localStorage:', error);
  }
}

/**
 * Gets the session details for the currently active user.
 * @returns {{ username: string; accessToken: string } | null} The current user's data or null if no one is logged in.
 */


/**
 * Call this function when a user successfully logs in.
 * It stores their token and sets them as the current user.
 *
 * @param {string} username The username of the logged-in user.
 * @param {string} accessToken The JWT access token.
 */
export function loginUser(username: string, accessToken: string) {
  localStorage.setItem('user', JSON.stringify({ username, accessToken }));
}

export function getCurrentUser() {
  if (typeof window === 'undefined') return null;
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
}




/**
 * Call this function to log out the current user.
 * It clears the 'currentUser' but keeps the user's token for easy re-login.
 */
export function logoutUser(): void {
  const data = getAuthData();
  const currentUser = data.currentUser;
  data.currentUser = null;
  saveAuthData(data);
  if (currentUser) {
    console.log(`[AuthHelper] User '${currentUser}' logged out.`);
  }
}

/**
 * Completely removes a user's data from the browser.
 * @param {string} username The username to remove.
 */
export function forgetUser(username: string): void {
    const data = getAuthData();
    if (data.users[username]) {
        delete data.users[username];
        if (data.currentUser === username) {
            data.currentUser = null;
        }
        saveAuthData(data);
        console.log(`[AuthHelper] Forgot user '${username}' and removed their data.`);
    }
}