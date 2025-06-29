// Mock authentication for browser compatibility
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'sales' | 'after_sales';
  name: string;
  is_active: boolean;
  created_at: string;
}

// Mock user authentication - always returns null to indicate database not available
export const authenticateUser = async (username: string, password: string): Promise<User | null> => {
  console.log('🔄 Database not available - using mock authentication');
  return null;
};

// Mock user creation
export const createUser = async (userData: {
  username: string;
  email: string;
  name: string;
  role: string;
  password: string;
}): Promise<User> => {
  throw new Error('Database not available in browser environment');
};

// Mock get all users
export const getAllUsers = async (): Promise<User[]> => {
  throw new Error('Database not available in browser environment');
};

// Mock update user status
export const updateUserStatus = async (userId: string, isActive: boolean): Promise<void> => {
  throw new Error('Database not available in browser environment');
};

// Mock delete user
export const deleteUser = async (userId: string): Promise<void> => {
  throw new Error('Database not available in browser environment');
};