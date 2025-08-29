const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const pineconeService = require('./pinecone');
const geminiService = require('./gemini');
const authRoutes = require('./routes/auth');
const favoritesRoutes = require('./routes/favorites');
const { optionalAuthenticate } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 8001;

// 中间件
app.use(cors());
app.use(express.json());

// 连接MongoDB
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/report-ai';
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB 连接成功');
  } catch (error) {
    console.error('❌ MongoDB 连接失败:', error);
    // 不退出进程，允许应用在没有数据库的情况下运行（使用模拟数据）
  }
};

// 初始化服务
const initializeServices = async () => {
  await connectDB();
  await pineconeService.initialize();
  await geminiService.initialize();
};

initializeServices();

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/favorites', favoritesRoutes);

// 模拟代币数据 - 与前端保持一致
const mockTokens = [
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
  },
  {
    id: '4',
    rank: 4,
    symbol: 'ADA',
    name: 'Cardano',
    description: '基于科学研究的区块链平台，专注于可持续性和可扩展性。采用权益证明共识机制。',
    circulatingSupply: '35,000,000,000',
    totalSupply: '45,000,000,000',
    logo: '₳',
    whitepaperUrl: 'https://cardano.org/whitepaper/',
    twitterUrl: 'https://twitter.com/cardano',
    website: 'https://cardano.org',
    isFavorited: false
  },
  {
    id: '5',
    rank: 5,
    symbol: 'DOT',
    name: 'Polkadot',
    description: '多链区块链平台，支持不同区块链之间的互操作性。具有创新的平行链架构。',
    circulatingSupply: '1,200,000,000',
    totalSupply: '1,200,000,000',
    logo: '●',
    whitepaperUrl: 'https://polkadot.network/whitepaper/',
    twitterUrl: 'https://twitter.com/polkadot',
    website: 'https://polkadot.network',
    isFavorited: false
  }
];

// 搜索API
app.post('/api/search', optionalAuthenticate, async (req, res) => {
  try {
    const { query, tags } = req.body;
    let searchResults = [];

    // 尝试使用Pinecone搜索
    try {
      if (query && query.trim()) {
        console.log('🔍 使用Gemini提炼搜索关键词');
        // 使用Gemini提炼关键词
        const enhancedQuery = await geminiService.extractSearchKeywords(query.trim());
        console.log('🔍 使用Pinecone进行向量搜索');
        const pineconeResults = await pineconeService.searchSimilarTokens(
          enhancedQuery,
          20,
          tags || []
        );

        if (pineconeResults.length > 0) {
          searchResults = pineconeService.formatSearchResults(pineconeResults);
          console.log(`✅ Pinecone搜索返回 ${searchResults.length} 个结果`);
        }
      }
    } catch (pineconeError) {
      console.log('⚠️ Pinecone搜索失败，回退到模拟数据:', pineconeError.message);
    }

    // 如果Pinecone搜索失败或没有结果，使用模拟数据
    if (searchResults.length === 0) {
      console.log('📝 使用模拟数据进行搜索');
      let filteredTokens = mockTokens;

      if (query && query.trim()) {
        const searchTerm = query.toLowerCase();
        filteredTokens = mockTokens.filter(token =>
          token.name.toLowerCase().includes(searchTerm) ||
          token.symbol.toLowerCase().includes(searchTerm) ||
          token.description.toLowerCase().includes(searchTerm)
        );
      }

      searchResults = filteredTokens;
    }

    // 如果用户已登录，更新收藏状态
    if (req.user) {
      searchResults = searchResults.map(token => ({
        ...token,
        isFavorited: req.user.isFavorited(token.id)
      }));
    }

    const response = {
      tokens: searchResults,
      total: searchResults.length,
      query: query || '',
      matchedTags: tags || []
    };

    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('搜索错误:', error);
    res.status(500).json({
      success: false,
      error: '搜索失败，请稍后重试'
    });
  }
});

// 获取研究报告API
app.get('/api/research/:tokenId', async (req, res) => {
  try {
    const { tokenId } = req.params;

    const token = mockTokens.find(t => t.id === tokenId);
    if (!token) {
      return res.status(404).json({
        success: false,
        error: '代币不存在'
      });
    }

    console.log(`📊 开始为${token.name}生成研究报告`);

    // 使用Gemini生成深度研究报告
    let reportContent;
    try {
      reportContent = await geminiService.generateResearchReport(token);
    } catch (geminiError) {
      console.log('⚠️ Gemini报告生成失败，使用回退模板:', geminiError.message);
      // 回退到基础模板
      reportContent = `# ${token.name} 投资分析报告

## 项目概述
${token.description}

## 代币经济学
- **流通供应量**: ${token.circulatingSupply}
- **总供应量**: ${token.totalSupply}
- **代币符号**: ${token.symbol}

## 技术分析
${token.symbol}采用先进的区块链技术，具有以下特点：
- 高度去中心化的网络架构
- 强大的安全性保障
- 优秀的可扩展性设计

## 风险分析
数字货币投资存在高风险，价格波动较大，请谨慎投资。

## 总结
建议投资者根据自身风险承受能力进行投资决策。

---
**免责声明**: 本报告仅供参考，不构成投资建议。数字货币投资存在风险，请谨慎决策。`;
    }

    const report = {
      tokenId: token.id,
      tokenSymbol: token.symbol,
      tokenName: token.name,
      content: reportContent,
      generatedAt: new Date().toISOString(),
      disclaimer: '本报告仅供参考，不构成投资建议。数字货币投资存在风险，请谨慎决策。'
    };

    // TODO: 将报告存储到Pinecone数据库
    console.log(`✅ ${token.name}研究报告生成完成`);

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('获取研究报告错误:', error);
    res.status(500).json({
      success: false,
      error: '获取研究报告失败，请稍后重试'
    });
  }
});

// 切换收藏状态API（兼容旧版本）
app.post('/api/favorite/:tokenId', optionalAuthenticate, async (req, res) => {
  try {
    const { tokenId } = req.params;

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: '请先登录'
      });
    }

    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 300));

    const isFavorited = req.user.isFavorited(tokenId);

    if (isFavorited) {
      req.user.removeFavorite(tokenId);
    } else {
      req.user.addFavorite(tokenId);
    }

    await req.user.save();

    res.json({
      success: true,
      data: !isFavorited
    });
  } catch (error) {
    console.error('切换收藏状态错误:', error);
    res.status(500).json({
      success: false,
      error: '操作失败，请稍后重试'
    });
  }
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Report AI Backend 服务器运行在 http://localhost:${PORT}`);
});
