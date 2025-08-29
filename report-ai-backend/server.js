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

// 模拟代币数据
const mockTokens = [
  // ... (mockTokens 数组保持不变) ...
];

// 搜索API
app.post('/api/search', optionalAuthenticate, async (req, res) => {
  try {
    const { query, tags } = req.body;
    let searchResults = [];

    // 尝试使用AI服务进行搜索
    try {
      if (query && query.trim()) {
        // 1. 使用 Gemini 提炼关键词
        const enhancedQuery = await geminiService.extractSearchKeywords(query.trim());
        
        // 2. 使用 Gemini 将关键词转换为向量
        const queryVector = await geminiService.embedQuery(enhancedQuery);

        // 3. 将向量传递给 Pinecone 进行搜索
        const pineconeResults = await pineconeService.searchSimilarTokens(
          queryVector,
          20,
          tags || []
        );

        if (pineconeResults.length > 0) {
          searchResults = pineconeService.formatSearchResults(pineconeResults);
          console.log(`✅ Pinecone搜索返回 ${searchResults.length} 个结果`);
        }
      }
    } catch (aiError) {
      console.log('⚠️ AI服务搜索失败，回退到模拟数据:', aiError.message);
    }

    // 如果AI搜索失败或没有结果，使用模拟数据
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
      const favoriteTokenIds = new Set(req.user.favorites.map(fav => fav.tokenId));
      searchResults = searchResults.map(token => ({
        ...token,
        isFavorited: favoriteTokenIds.has(token.id)
      }));
    }

    const response = {
      tokens: searchResults,
      total: searchResults.length,
      query: query || '',
      matchedTags: tags || []
    };

    res.json({ success: true, data: response });
  } catch (error) {
    console.error('搜索API顶层错误:', error);
    res.status(500).json({ success: false, error: '搜索失败，请稍后重试' });
  }
});

// ... (获取研究报告API及其他路由保持不变) ...

app.listen(PORT, () => {
  console.log(`🚀 Report AI Backend 服务器运行在 http://localhost:${PORT}`);
});