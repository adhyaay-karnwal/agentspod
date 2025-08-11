/**
 * Wind Authentication Library
 * 
 * Provides authentication functionality for the Wind platform including
 * user registration, login, logout, and session management.
 */

/**
 * User interface representing authenticated user data
 */
export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
  lastLogin: string;
}

/**
 * Authentication error interface
 */
export interface AuthError {
  code: string;
  message: string;
}

// Local storage keys
const USER_STORAGE_KEY = 'wind_user';
const AUTH_TOKEN_KEY = 'wind_auth_token';

/**
 * Validates email format
 * @param email - Email address to validate
 * @returns Boolean indicating if email is valid
 */
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates password strength
 * @param password - Password to validate
 * @returns Boolean indicating if password meets requirements
 */
const isValidPassword = (password: string): boolean => {
  // At least 8 characters, containing at least one number and one letter
  return password.length >= 8 && /[0-9]/.test(password) && /[a-zA-Z]/.test(password);
};

/**
 * Generates a unique user ID
 * @returns Unique ID string
 */
const generateUserId = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

/**
 * Simulates an API call with artificial delay
 * @param success - Whether the API call should succeed
 * @param data - Data to return on success
 * @param error - Error to return on failure
 * @returns Promise resolving to data or rejecting with error
 */
const simulateApiCall = <T>(
  success: boolean, 
  data: T, 
  error: AuthError
): Promise<T> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (success) {
        resolve(data);
      } else {
        reject(error);
      }
    }, 800); // Simulate network delay
  });
};

/**
 * Saves user data to local storage
 * @param user - User object to save
 * @param token - Authentication token
 */
const saveUserSession = (user: User, token: string): void => {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  localStorage.setItem(AUTH_TOKEN_KEY, token);
};

/**
 * Clears user session from local storage
 */
const clearUserSession = (): void => {
  localStorage.removeItem(USER_STORAGE_KEY);
  localStorage.removeItem(AUTH_TOKEN_KEY);
};

/**
 * Registers a new user with email and password
 * 
 * @param email - User's email address
 * @param password - User's password
 * @returns Promise resolving to User object
 * @throws AuthError if registration fails
 */
export const signUp = async (email: string, password: string): Promise<User> => {
  // Validate inputs
  if (!email || !password) {
    throw { code: 'auth/missing-fields', message: 'Email and password are required' } as AuthError;
  }
  
  if (!isValidEmail(email)) {
    throw { code: 'auth/invalid-email', message: 'Please enter a valid email address' } as AuthError;
  }
  
  if (!isValidPassword(password)) {
    throw { 
      code: 'auth/weak-password', 
      message: 'Password must be at least 8 characters and contain at least one number and one letter'
    } as AuthError;
  }
  
  // Check if user already exists (simulated)
  const existingUsers = localStorage.getItem('wind_users');
  const users = existingUsers ? JSON.parse(existingUsers) : {};
  
  if (users[email]) {
    return simulateApiCall(
      false, 
      null as unknown as User, 
      { code: 'auth/email-already-in-use', message: 'This email is already registered' }
    );
  }
  
  // Create new user
  const now = new Date().toISOString();
  const newUser: User = {
    id: generateUserId(),
    email,
    createdAt: now,
    lastLogin: now
  };
  
  // Store user (simulated database)
  users[email] = { ...newUser, passwordHash: btoa(password) }; // Simple encoding, not secure
  localStorage.setItem('wind_users', JSON.stringify(users));
  
  // Generate token and save session
  const token = btoa(`${newUser.id}:${Date.now()}`);
  saveUserSession(newUser, token);
  
  return simulateApiCall(
    true, 
    newUser, 
    { code: 'auth/unknown', message: 'An unknown error occurred' }
  );
};

/**
 * Signs in an existing user with email and password
 * 
 * @param email - User's email address
 * @param password - User's password
 * @returns Promise resolving to User object
 * @throws AuthError if authentication fails
 */
export const signIn = async (email: string, password: string): Promise<User> => {
  // Validate inputs
  if (!email || !password) {
    throw { code: 'auth/missing-fields', message: 'Email and password are required' } as AuthError;
  }
  
  if (!isValidEmail(email)) {
    throw { code: 'auth/invalid-email', message: 'Please enter a valid email address' } as AuthError;
  }
  
  // Retrieve users (simulated database)
  const existingUsers = localStorage.getItem('wind_users');
  const users = existingUsers ? JSON.parse(existingUsers) : {};
  
  // Check if user exists and password matches
  const user = users[email];
  if (!user || btoa(password) !== user.passwordHash) {
    return simulateApiCall(
      false, 
      null as unknown as User, 
      { code: 'auth/invalid-credentials', message: 'Invalid email or password' }
    );
  }
  
  // Update last login
  const now = new Date().toISOString();
  user.lastLogin = now;
  users[email] = user;
  localStorage.setItem('wind_users', JSON.stringify(users));
  
  // Create user object without password hash
  const { passwordHash: _passwordHash, ...userWithoutPassword } = user;
  const authenticatedUser = userWithoutPassword as User;
  
  // Generate token and save session
  const token = btoa(`${authenticatedUser.id}:${Date.now()}`);
  saveUserSession(authenticatedUser, token);
  
  return simulateApiCall(
    true, 
    authenticatedUser, 
    { code: 'auth/unknown', message: 'An unknown error occurred' }
  );
};

/**
 * Signs out the current user
 * 
 * @returns Promise that resolves when sign out is complete
 */
export const signOut = async (): Promise<void> => {
  clearUserSession();
  return Promise.resolve();
};

/**
 * Gets the currently authenticated user
 * 
 * @returns User object if authenticated, null otherwise
 */
export const getCurrentUser = (): User | null => {
  const userJson = localStorage.getItem(USER_STORAGE_KEY);
  if (!userJson) return null;
  
  try {
    const user = JSON.parse(userJson) as User;
    return user;
  } catch (_error) {
    clearUserSession();
    return null;
  }
};

/**
 * Checks if a user is currently authenticated
 * 
 * @returns Boolean indicating if a user is logged in
 */
export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null && localStorage.getItem(AUTH_TOKEN_KEY) !== null;
};

/**
 * Updates user profile information
 * 
 * @param userData - Partial user data to update
 * @returns Promise resolving to updated User object
 * @throws AuthError if update fails
 */
export const updateUserProfile = async (userData: Partial<User>): Promise<User> => {
  const currentUser = getCurrentUser();
  
  if (!currentUser) {
    throw { code: 'auth/not-authenticated', message: 'User is not authenticated' } as AuthError;
  }
  
  // Retrieve users (simulated database)
  const existingUsers = localStorage.getItem('wind_users');
  const users = existingUsers ? JSON.parse(existingUsers) : {};
  
  // Update user data
  const user = users[currentUser.email];
  if (!user) {
    throw { code: 'auth/user-not-found', message: 'User not found' } as AuthError;
  }
  
  const updatedUser = { ...user, ...userData };
  users[currentUser.email] = updatedUser;
  localStorage.setItem('wind_users', JSON.stringify(users));
  
  // Update session
  const { passwordHash: _passwordHash, ...userWithoutPassword } = updatedUser;
  const authenticatedUser = userWithoutPassword as User;
  saveUserSession(authenticatedUser, localStorage.getItem(AUTH_TOKEN_KEY) || '');
  
  return simulateApiCall(
    true, 
    authenticatedUser, 
    { code: 'auth/unknown', message: 'An unknown error occurred' }
  );
};
