// 代币结果接口
export interface TokenResult {
  id: string;           // 唯一标识符
  rank: number;         // 排名
  symbol: string;       // 代币符号
  name: string;         // 代币全名
  description: string;  // 描述信息
  circulatingSupply: string; // 流通量
  totalSupply: string;  // 总供应量
  logo: string;         // 头像字符
  whitepaperUrl: string; // 白皮书链接
  twitterUrl: string;   // 推特链接
  website: string;      // 官网链接
  isFavorited?: boolean; // 是否收藏
}

// 搜索标签
export type SearchTag = 
  | '有叙事背景'
  | '实力团队'
  | '技术创新'
  | '热门领域'
  | '代币启动公平'
  | '代币分配公平'
  | '代币通缩'
  | '有清晰发展路径'
  | '社区质量高';

// 搜索请求接口
export interface SearchRequest {
  query: string;
  tags: SearchTag[];
}

// 搜索响应接口
export interface SearchResponse {
  tokens: TokenResult[];
  total: number;
  query: string;
  matchedTags: SearchTag[];
}

// 研究报告接口
export interface ResearchReport {
  tokenId: string;
  tokenSymbol: string;
  tokenName: string;
  content: string;
  generatedAt: string;
  disclaimer: string;
}

// 用户接口
export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    language: 'zh' | 'en';
    notifications: {
      email: boolean;
      browser: boolean;
    };
  };
  favoritesCount: number;
  createdAt: string;
  lastLogin?: string;
}

// 认证请求接口
export interface LoginRequest {
  identifier: string; // 用户名或邮箱
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

// 认证响应接口
export interface AuthResponse {
  user: User;
  token: string;
}

// 收藏接口
export interface Favorite {
  tokenId: string;
  addedAt: string;
}

export interface FavoritesResponse {
  favorites: Favorite[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// API响应基础接口
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
