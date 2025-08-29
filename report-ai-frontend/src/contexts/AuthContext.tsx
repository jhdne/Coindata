import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginRequest, RegisterRequest } from '../types';
import * as authService from '../services/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (request: LoginRequest) => Promise<{ success: boolean; error?: string }>;
  register: (request: RegisterRequest) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 初始化时检查本地存储的用户信息
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = authService.getStoredUser();
        const storedToken = authService.getStoredToken();
        
        if (storedUser && storedToken) {
          // 验证令牌是否仍然有效
          const response = await authService.getCurrentUser();
          if (response.success && response.data) {
            setUser(response.data.user);
          } else {
            // 令牌无效，清除本地存储
            authService.removeStoredToken();
            setUser(null);
          }
        }
      } catch (error) {
        console.error('初始化认证状态失败:', error);
        authService.removeStoredToken();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (request: LoginRequest) => {
    try {
      setIsLoading(true);
      const response = await authService.login(request);
      
      if (response.success && response.data) {
        setUser(response.data.user);
        return { success: true };
      } else {
        return { 
          success: false, 
          error: response.error || '登录失败' 
        };
      }
    } catch (error) {
      console.error('登录失败:', error);
      return { 
        success: false, 
        error: '登录过程中发生错误' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (request: RegisterRequest) => {
    try {
      setIsLoading(true);
      const response = await authService.register(request);
      
      if (response.success && response.data) {
        setUser(response.data.user);
        return { success: true };
      } else {
        return { 
          success: false, 
          error: response.error || '注册失败' 
        };
      }
    } catch (error) {
      console.error('注册失败:', error);
      return { 
        success: false, 
        error: '注册过程中发生错误' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('注销失败:', error);
      // 即使API调用失败，也要清除本地状态
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    try {
      const response = await authService.updateProfile(updates);
      
      if (response.success && response.data) {
        setUser(response.data.user);
        return { success: true };
      } else {
        return { 
          success: false, 
          error: response.error || '更新用户信息失败' 
        };
      }
    } catch (error) {
      console.error('更新用户信息失败:', error);
      return { 
        success: false, 
        error: '更新过程中发生错误' 
      };
    }
  };

  const refreshUser = async () => {
    try {
      if (!authService.isAuthenticated()) {
        setUser(null);
        return;
      }

      const response = await authService.getCurrentUser();
      if (response.success && response.data) {
        setUser(response.data.user);
      } else {
        // 如果获取用户信息失败，可能是令牌过期
        authService.removeStoredToken();
        setUser(null);
      }
    } catch (error) {
      console.error('刷新用户信息失败:', error);
      authService.removeStoredToken();
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateUser,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
