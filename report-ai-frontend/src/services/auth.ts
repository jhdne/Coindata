import { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  User, 
  ApiResponse,
  FavoritesResponse 
} from '../types';

// API基础URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// 本地存储键名
const TOKEN_KEY = 'report_ai_token';
const USER_KEY = 'report_ai_user';

// 获取存储的令牌
export const getStoredToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

// 存储令牌
export const setStoredToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

// 移除令牌
export const removeStoredToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

// 获取存储的用户信息
export const getStoredUser = (): User | null => {
  const userStr = localStorage.getItem(USER_KEY);
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
  return null;
};

// 存储用户信息
export const setStoredUser = (user: User): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

// 获取认证头
export const getAuthHeaders = (): Record<string, string> => {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  return headers;
};

// 用户注册
export async function register(request: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const data = await response.json();
    
    if (data.success && data.data) {
      // 存储令牌和用户信息
      setStoredToken(data.data.token);
      setStoredUser(data.data.user);
    }
    
    return data;
  } catch (error) {
    console.error('注册API错误:', error);
    return {
      success: false,
      error: '注册失败，请稍后重试'
    };
  }
}

// 用户登录
export async function login(request: LoginRequest): Promise<ApiResponse<AuthResponse>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const data = await response.json();
    
    if (data.success && data.data) {
      // 存储令牌和用户信息
      setStoredToken(data.data.token);
      setStoredUser(data.data.user);
    }
    
    return data;
  } catch (error) {
    console.error('登录API错误:', error);
    return {
      success: false,
      error: '登录失败，请稍后重试'
    };
  }
}

// 获取当前用户信息
export async function getCurrentUser(): Promise<ApiResponse<{ user: User }>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    
    if (data.success && data.data) {
      // 更新存储的用户信息
      setStoredUser(data.data.user);
    }
    
    return data;
  } catch (error) {
    console.error('获取用户信息API错误:', error);
    return {
      success: false,
      error: '获取用户信息失败'
    };
  }
}

// 更新用户信息
export async function updateProfile(updates: Partial<User>): Promise<ApiResponse<{ user: User }>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });

    const data = await response.json();
    
    if (data.success && data.data) {
      // 更新存储的用户信息
      setStoredUser(data.data.user);
    }
    
    return data;
  } catch (error) {
    console.error('更新用户信息API错误:', error);
    return {
      success: false,
      error: '更新用户信息失败'
    };
  }
}

// 修改密码
export async function changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<void>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/password`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        currentPassword,
        newPassword
      }),
    });

    return await response.json();
  } catch (error) {
    console.error('修改密码API错误:', error);
    return {
      success: false,
      error: '修改密码失败'
    };
  }
}

// 用户注销
export async function logout(): Promise<ApiResponse<void>> {
  try {
    await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    // 清除本地存储
    removeStoredToken();
    
    return {
      success: true,
      message: '注销成功'
    };
  } catch (error) {
    console.error('注销API错误:', error);
    // 即使API调用失败，也要清除本地存储
    removeStoredToken();
    return {
      success: true,
      message: '注销成功'
    };
  }
}

// 获取用户收藏列表
export async function getFavorites(page = 1, limit = 20): Promise<ApiResponse<FavoritesResponse>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/favorites?page=${page}&limit=${limit}`, {
      headers: getAuthHeaders(),
    });

    return await response.json();
  } catch (error) {
    console.error('获取收藏列表API错误:', error);
    return {
      success: false,
      error: '获取收藏列表失败'
    };
  }
}

// 切换收藏状态
export async function toggleFavorite(tokenId: string): Promise<ApiResponse<{ isFavorited: boolean; favoritesCount: number }>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/favorites/toggle/${tokenId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    
    if (data.success) {
      // 更新本地用户信息中的收藏数量
      const user = getStoredUser();
      if (user) {
        user.favoritesCount = data.data.favoritesCount;
        setStoredUser(user);
      }
    }
    
    return data;
  } catch (error) {
    console.error('切换收藏状态API错误:', error);
    return {
      success: false,
      error: '操作失败，请稍后重试'
    };
  }
}

// 检查是否已登录
export const isAuthenticated = (): boolean => {
  const token = getStoredToken();
  const user = getStoredUser();
  return !!(token && user);
};
