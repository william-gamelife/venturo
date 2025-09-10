// 本地認證系統 (臨時存根檔案)
// TODO: 待實作完整認證系統

export interface LocalUser {
  id: string;
  email: string;
  name: string;
  display_name?: string;
  username?: string;
  role?: string;
}

export const localAuth = {
  getCurrentUser: (): LocalUser | null => {
    if (typeof window === 'undefined') return null;
    
    try {
      const stored = localStorage.getItem('venturo_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  login: (email: string, password: string): Promise<LocalUser | null> => {
    return Promise.resolve({
      id: '1',
      email: email,
      name: 'Test User'
    });
  },

  logout: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('venturo_user');
    }
  },

  isAuthenticated: (): boolean => {
    return localAuth.getCurrentUser() !== null;
  }
};

export default localAuth;