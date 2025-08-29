import { SearchRequest, SearchResponse, ResearchReport, ApiResponse, TokenResult } from '../types';
import { getAuthHeaders } from './auth';

// API基础URL - 根据实际后端地址修改
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// 模拟数据 - 在实际API集成前使用
const mockTokens: TokenResult[] = [
  {
    id: '1',
    rank: 1,
    symbol: 'BTC',
    name: 'Bitcoin',
    description: '世界上第一个去中心化数字货币，被誉为数字黄金。比特币采用工作量证明共识机制，具有稀缺性和抗通胀特性。',
    circulatingSupply: '19,500,000',
    totalSupply: '21,000,000',
    logo: '₿',
    whitepaperUrl: 'https://bitcoin.org/bitcoin.pdf',
    twitterUrl: 'https://twitter.com/bitcoin',
    website: 'https://bitcoin.org',
    isFavorited: false
  },
  {
    id: '2',
    rank: 2,
    symbol: 'ETH',
    name: 'Ethereum',
    description: '领先的智能合约平台，支持去中心化应用(DApps)和DeFi生态系统。以太坊正在向权益证明机制转型。',
    circulatingSupply: '120,000,000',
    totalSupply: '120,000,000',
    logo: 'Ξ',
    whitepaperUrl: 'https://ethereum.org/whitepaper/',
    twitterUrl: 'https://twitter.com/ethereum',
    website: 'https://ethereum.org',
    isFavorited: true
  },
  {
    id: '3',
    rank: 3,
    symbol: 'SOL',
    name: 'Solana',
    description: '高性能区块链平台，支持快速交易和低费用。Solana采用历史证明和权益证明混合共识机制。',
    circulatingSupply: '400,000,000',
    totalSupply: '500,000,000',
    logo: '◎',
    whitepaperUrl: 'https://solana.com/solana-whitepaper.pdf',
    twitterUrl: 'https://twitter.com/solana',
    website: 'https://solana.com',
    isFavorited: false
  }
];

// 搜索代币
export async function searchTokens(request: SearchRequest): Promise<ApiResponse<SearchResponse>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/search`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('搜索API错误:', error);

    // 如果API失败，回退到模拟数据
    const filteredTokens = mockTokens.filter(token =>
      token.name.toLowerCase().includes(request.query.toLowerCase()) ||
      token.symbol.toLowerCase().includes(request.query.toLowerCase()) ||
      token.description.toLowerCase().includes(request.query.toLowerCase())
    );

    const fallbackResponse: SearchResponse = {
      tokens: filteredTokens,
      total: filteredTokens.length,
      query: request.query,
      matchedTags: request.tags
    };

    return {
      success: true,
      data: fallbackResponse
    };
  }
}

// 获取研究报告
export async function getResearchReport(tokenId: string): Promise<ApiResponse<ResearchReport>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/research/${tokenId}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('获取研究报告API错误:', error);

    // 如果API失败，回退到模拟数据
    const token = mockTokens.find(t => t.id === tokenId);
    if (!token) {
      return {
        success: false,
        error: '代币不存在'
      };
    }

    const report: ResearchReport = {
      tokenId: token.id,
      tokenSymbol: token.symbol,
      tokenName: token.name,
      content: `## ${token.name} (${token.symbol}) 深度研究报告

### 项目概述
${token.description}

### 技术分析
${token.symbol}采用先进的区块链技术，具有以下特点：
- 高度去中心化的网络架构
- 强大的安全性保障
- 优秀的可扩展性设计

### 市场表现
- 流通供应量：${token.circulatingSupply}
- 总供应量：${token.totalSupply}
- 市场排名：#${token.rank}

### 团队背景
项目团队具有丰富的区块链开发经验，核心成员来自知名科技公司。

### 发展路线图
项目具有清晰的发展规划，包括技术升级、生态建设和社区发展等方面。

### 风险评估
投资需谨慎，数字货币市场存在较高波动性。

### 投资建议
建议投资者根据自身风险承受能力进行投资决策。`,
      generatedAt: new Date().toISOString(),
      disclaimer: '本报告仅供参考，不构成投资建议。数字货币投资存在风险，请谨慎决策。'
    };

    return {
      success: true,
      data: report
    };
  }
}

// 切换收藏状态
export async function toggleFavorite(tokenId: string): Promise<ApiResponse<boolean>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/favorite/${tokenId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('切换收藏状态API错误:', error);

    // 如果API失败，回退到模拟数据
    const tokenIndex = mockTokens.findIndex(t => t.id === tokenId);
    if (tokenIndex === -1) {
      return {
        success: false,
        error: '代币不存在'
      };
    }

    mockTokens[tokenIndex].isFavorited = !mockTokens[tokenIndex].isFavorited;

    return {
      success: true,
      data: mockTokens[tokenIndex].isFavorited
    };
  }
}
