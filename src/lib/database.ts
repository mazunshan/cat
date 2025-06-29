// Mock database implementation for browser compatibility
// This replaces the PostgreSQL connection which cannot run in browsers

export const testConnection = async (): Promise<boolean> => {
  // Always return false in browser environment since we can't connect to PostgreSQL directly
  console.log('🔄 Running in browser mode - using mock data');
  return false;
};

export const query = async (text: string, params?: any[]) => {
  // Mock query function that throws an error to indicate database is not available
  throw new Error('Database not available in browser environment');
};

export const transaction = async (callback: (client: any) => Promise<any>) => {
  throw new Error('Database transactions not available in browser environment');
};

export const closePool = async () => {
  // No-op in browser environment
};

export default null;