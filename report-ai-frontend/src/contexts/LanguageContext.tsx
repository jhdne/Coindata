import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'zh' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  translateDescription: (description: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// 翻译字典
const translations = {
  zh: {
    // 主标题
    'title': '智能的代币挖掘引擎',
    'subtitle': '输入您的代币要求，让AI为您寻找',
    'searchPlaceholder': '输入您的代币要求...',
    'searchButton': '挖掘',
    
    // 标签
    '有叙事背景': '有叙事背景',
    'narrativebackground': '有叙事背景',
    '技术创新': '技术创新',
    'techinnovation': '技术创新',
    '实力团队': '实力团队',
    'strongteam': '实力团队',
    '热门领域': '热门领域',
    'hotfield': '热门领域',
    '低市值': '低市值',
    'lowmarketcap': '低市值',
    '高增长': '高增长',
    'highgrowth': '高增长',
    '社区驱动': '社区驱动',
    'communitydriven': '社区驱动',
    '跨链': '跨链',
    'crosschain': '跨链',
    'defi': 'DeFi',
    '代币启动公平': '代币启动公平',
    'tokenfairlaunch': '代币启动公平',
    '代币分配公平': '代币分配公平',
    'fairdistribution': '代币分配公平',
    '代币通缩': '代币通缩',
    'deflationary': '代币通缩',
    '有清晰发展路径': '有清晰发展路径',
    'clearroadmap': '有清晰发展路径',
    '社区质量高': '社区质量高',
    'highqualitycommunity': '社区质量高',
    
    // 结果页面
    'recommendTitle': '为您推荐 {count} 个代币，基于"{query}"的深度挖掘结果',
    'backToSearch': '返回搜索',
    'highMatch': '高匹配度',
    'rank': '序号',
    'token': '代币',
    'name': '名称',
    'description': '描述',
    'circulatingSupply': '流通量',
    'totalSupply': '总量',
    'website': '官网',
    'whitepaper': '白皮书',
    'twitter': '推特',
    'deepResearch': '深度研究',
    'searchResults': '搜索结果',
    'noResults': '暂无结果',
    'loading': '加载中...',
    
    // 用户相关
    'login': '登录',
    'register': '注册',
    'logout': '退出登录',
    'myFavorites': '我的收藏',
    'settings': '个人设置',
    'favorites': '收藏',
    'username': '用户名',
    'email': '邮箱',
    'password': '密码',
    'confirmPassword': '确认密码',
    'loginSuccess': '登录成功',
    'registerSuccess': '注册成功',
    'loginFailed': '登录失败',
    'registerFailed': '注册失败',
    'alreadyHaveAccount': '已有账户？',
    'noAccount': '还没有账户？',
    'clickToLogin': '点击登录',
    'clickToRegister': '点击注册',
    'close': '关闭',
    'submit': '提交',
    'cancel': '取消',

    // 收藏相关
    'addToFavorites': '添加收藏',
    'removeFromFavorites': '取消收藏',
    'favoritesList': '收藏列表',
    'noFavorites': '暂无收藏',
    'manageFavorites': '管理收藏',

    // 研究报告相关
    'researchReport': '研究报告',
    'generateReport': '生成报告',
    'reportLoading': '报告生成中...',
    'reportError': '报告生成失败',
    'projectOverview': '项目概述',
    'technicalAnalysis': '技术分析',
    'tokenomics': '代币经济学',
    'riskAnalysis': '风险分析',
    'investmentAdvice': '投资建议',
    'disclaimer': '免责声明',
    'reportTitle': '{name} 投资分析报告',
    'generatedAt': '生成时间',
    'reportDisclaimer': '本报告仅供参考，不构成投资建议。数字货币投资存在风险，请谨慎决策。',

    // 通用描述翻译
    'decentralizedFinance': '去中心化金融',
    'smartContract': '智能合约',
    'blockchain': '区块链',
    'cryptocurrency': '加密货币',
    'digitalAsset': '数字资产',
    'tradingPlatform': '交易平台',
    'liquidityMining': '流动性挖矿',
    'stakingRewards': '质押奖励',
    'crossChainBridge': '跨链桥',
    'nftMarketplace': 'NFT市场',
    'gamefi': '游戏金融',
    'metaverse': '元宇宙',
    'web3': 'Web3',
    'dao': 'DAO',

    // 语言切换
    'language': '中文',
    'switchLanguage': '切换语言'
  },
  en: {
    // 主标题
    'title': 'Smart Token Mining Engine',
    'subtitle': 'Enter your token requirements, let AI find for you',
    'searchPlaceholder': 'Enter your token requirements...',
    'searchButton': 'Mine',
    
    // 标签
    '有叙事背景': 'Narrative Background',
    'narrativebackground': 'Narrative Background',
    '技术创新': 'Tech Innovation',
    'techinnovation': 'Tech Innovation',
    '实力团队': 'Strong Team',
    'strongteam': 'Strong Team',
    '热门领域': 'Hot Field',
    'hotfield': 'Hot Field',
    '低市值': 'Low Market Cap',
    'lowmarketcap': 'Low Market Cap',
    '高增长': 'High Growth',
    'highgrowth': 'High Growth',
    '社区驱动': 'Community Driven',
    'communitydriven': 'Community Driven',
    '跨链': 'Cross Chain',
    'crosschain': 'Cross Chain',
    'defi': 'DeFi',
    '代币启动公平': 'Fair Launch',
    'tokenfairlaunch': 'Fair Launch',
    '代币分配公平': 'Fair Distribution',
    'fairdistribution': 'Fair Distribution',
    '代币通缩': 'Deflationary',
    'deflationary': 'Deflationary',
    '有清晰发展路径': 'Clear Roadmap',
    'clearroadmap': 'Clear Roadmap',
    '社区质量高': 'High Quality Community',
    'highqualitycommunity': 'High Quality Community',
    
    // 结果页面
    'recommendTitle': 'Recommend {count} tokens for you, based on "{query}" deep mining results',
    'backToSearch': 'Back to Search',
    'highMatch': 'High Match',
    'rank': 'Rank',
    'token': 'Token',
    'name': 'Name',
    'description': 'Description',
    'circulatingSupply': 'Circulating Supply',
    'totalSupply': 'Total Supply',
    'website': 'Website',
    'whitepaper': 'Whitepaper',
    'twitter': 'Twitter',
    'deepResearch': 'Deep Research',
    'searchResults': 'Search Results',
    'noResults': 'No Results',
    'loading': 'Loading...',
    
    // 用户相关
    'login': 'Login',
    'register': 'Register',
    'logout': 'Logout',
    'myFavorites': 'My Favorites',
    'settings': 'Settings',
    'favorites': 'Favorites',
    'username': 'Username',
    'email': 'Email',
    'password': 'Password',
    'confirmPassword': 'Confirm Password',
    'loginSuccess': 'Login Successful',
    'registerSuccess': 'Registration Successful',
    'loginFailed': 'Login Failed',
    'registerFailed': 'Registration Failed',
    'alreadyHaveAccount': 'Already have an account?',
    'noAccount': "Don't have an account?",
    'clickToLogin': 'Click to Login',
    'clickToRegister': 'Click to Register',
    'close': 'Close',
    'submit': 'Submit',
    'cancel': 'Cancel',

    // 收藏相关
    'addToFavorites': 'Add to Favorites',
    'removeFromFavorites': 'Remove from Favorites',
    'favoritesList': 'Favorites List',
    'noFavorites': 'No Favorites',
    'manageFavorites': 'Manage Favorites',

    // 研究报告相关
    'researchReport': 'Research Report',
    'generateReport': 'Generate Report',
    'reportLoading': 'Generating Report...',
    'reportError': 'Report Generation Failed',
    'projectOverview': 'Project Overview',
    'technicalAnalysis': 'Technical Analysis',
    'tokenomics': 'Tokenomics',
    'riskAnalysis': 'Risk Analysis',
    'investmentAdvice': 'Investment Advice',
    'disclaimer': 'Disclaimer',
    'reportTitle': '{name} Investment Analysis Report',
    'generatedAt': 'Generated At',
    'reportDisclaimer': 'This report is for reference only and does not constitute investment advice. Cryptocurrency investment involves risks, please make decisions carefully.',

    // 通用描述翻译
    'decentralizedFinance': 'Decentralized Finance',
    'smartContract': 'Smart Contract',
    'blockchain': 'Blockchain',
    'cryptocurrency': 'Cryptocurrency',
    'digitalAsset': 'Digital Asset',
    'tradingPlatform': 'Trading Platform',
    'liquidityMining': 'Liquidity Mining',
    'stakingRewards': 'Staking Rewards',
    'crossChainBridge': 'Cross-Chain Bridge',
    'nftMarketplace': 'NFT Marketplace',
    'gamefi': 'GameFi',
    'metaverse': 'Metaverse',
    'web3': 'Web3',
    'dao': 'DAO',

    // 语言切换
    'language': 'English',
    'switchLanguage': 'Switch Language'
  }
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('zh');

  const t = (key: string): string => {
    const translation = translations[language][key as keyof typeof translations['zh']];
    return translation || key;
  };

  // 翻译描述内容的函数
  const translateDescription = (description: string): string => {
    if (language === 'zh') return description;

    // 简单的关键词替换翻译
    let translated = description;
    const keywordMap: Record<string, string> = {
      '去中心化金融': 'Decentralized Finance',
      '智能合约': 'Smart Contract',
      '区块链': 'Blockchain',
      '加密货币': 'Cryptocurrency',
      '数字资产': 'Digital Asset',
      '交易平台': 'Trading Platform',
      '流动性挖矿': 'Liquidity Mining',
      '质押奖励': 'Staking Rewards',
      '跨链桥': 'Cross-Chain Bridge',
      'NFT市场': 'NFT Marketplace',
      '游戏金融': 'GameFi',
      '元宇宙': 'Metaverse',
      '代币': 'Token',
      '项目': 'Project',
      '平台': 'Platform',
      '协议': 'Protocol',
      '网络': 'Network',
      '生态系统': 'Ecosystem',
      '社区': 'Community',
      '治理': 'Governance',
      '挖矿': 'Mining',
      '质押': 'Staking',
      '收益': 'Yield',
      '流动性': 'Liquidity',
      '交易': 'Trading',
      '投资': 'Investment',
      '金融': 'Finance',
      '技术': 'Technology',
      '创新': 'Innovation',
      '安全': 'Security',
      '透明': 'Transparent',
      '开源': 'Open Source'
    };

    Object.entries(keywordMap).forEach(([chinese, english]) => {
      translated = translated.replace(new RegExp(chinese, 'g'), english);
    });

    return translated;
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
    translateDescription
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
