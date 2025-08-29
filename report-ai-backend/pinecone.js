const { Pinecone } = require('@pinecone-database/pinecone');

class PineconeService {
  constructor() {
    this.client = null;
    this.index = null;
    this.indexName = process.env.PINECONE_INDEX_NAME || 'coindata';
  }

  async initialize() {
    try {
      if (!process.env.PINECONE_API_KEY || !process.env.PINECONE_ENVIRONMENT) {
        console.log('⚠️ PINECONE 环境变量未完全设置，将使用模拟数据');
        return false;
      }

      this.client = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY,
        environment: process.env.PINECONE_ENVIRONMENT
      });

      this.index = this.client.index(this.indexName);
      console.log('✅ Pinecone 客户端初始化成功');
      return true;
    } catch (error) {
      console.error('❌ Pinecone 初始化失败:', error);
      return false;
    }
  }

  async searchSimilarTokens(queryVector, topK = 10, tags = []) {
    try {
      if (!this.index) {
        throw new Error('Pinecone 索引未初始化');
      }

      // 构建过滤条件
      let filter = {};
      if (tags && tags.length > 0) {
        filter.tags = { $in: tags };
      }

      console.log(`🔍 正在使用向量在Pinecone中搜索，top_k=${topK}`);
      
      const searchResponse = await this.index.query({
        vector: queryVector,
        topK: topK,
        includeMetadata: true,
        filter: Object.keys(filter).length > 0 ? filter : undefined
      });

      const results = [];
      if (searchResponse.matches && searchResponse.matches.length > 0) {
        console.log(`✅ 找到 ${searchResponse.matches.length} 个相似结果`);
        
        for (const match of searchResponse.matches) {
          results.push({
            id: match.id,
            score: match.score,
            metadata: match.metadata || {}
          });
        }
      } else {
        console.log('⚠️ 没有找到匹配的结果');
      }

      return results;
    } catch (error) {
      console.error('❌ Pinecone搜索失败:', error);
      throw error;
    }
  }

  formatSearchResults(searchResults) {
    const formatted = [];
    
    for (let i = 0; i < searchResults.length; i++) {
      const result = searchResults[i];
      const metadata = result.metadata || {};
      
      const formattedResult = {
        id: result.id || String(i + 1),
        rank: i + 1,
        symbol: metadata.symbol || 'UNKNOWN',
        name: metadata.name || 'Unknown Token',
        description: metadata.description || '暂无描述',
        circulatingSupply: this.formatSupply(metadata.circulating_supply),
        totalSupply: this.formatSupply(metadata.total_supply),
        logo: this.getLogoFromSymbol(metadata.symbol || 'UNKNOWN'),
        whitepaperUrl: this.extractUrl(metadata.urls, 'whitepaper'),
        twitterUrl: this.extractUrl(metadata.urls, 'twitter'),
        website: this.extractUrl(metadata.urls, 'website'),
        isFavorited: false,
        score: result.score || 0.0
      };
      
      formatted.push(formattedResult);
    }
    
    return formatted;
  }

  formatSupply(supplyValue) {
    if (supplyValue === null || supplyValue === undefined) {
      return "未知";
    }
    
    try {
      let value = supplyValue;
      if (typeof value === 'string') {
        value = parseFloat(value.replace(/,/g, ''));
      }
      
      if (value >= 1e12) {
        return `${(value / 1e12).toFixed(2)}T`;
      } else if (value >= 1e9) {
        return `${(value / 1e9).toFixed(2)}B`;
      } else if (value >= 1e6) {
        return `${(value / 1e6).toFixed(2)}M`;
      } else if (value >= 1e3) {
        return `${(value / 1e3).toFixed(2)}K`;
      } else {
        return value.toLocaleString();
      }
    } catch {
      return String(supplyValue);
    }
  }

  getLogoFromSymbol(symbol) {
    const logoMap = {
      'BTC': '₿', 'ETH': 'Ξ', 'SOL': '◎', 'ADA': '₳', 'DOT': '●',
      'MATIC': '⬟', 'AVAX': '🔺', 'LINK': '🔗', 'UNI': '🦄', 'ATOM': '⚛️'
    };
    return logoMap[symbol.toUpperCase()] || (symbol ? symbol[0] : '?');
  }

  extractUrl(urlsDict, urlType) {
    if (!urlsDict || typeof urlsDict !== 'object') return '#';
    const possibleKeys = {
      'website': ['website', 'homepage', 'official'],
      'whitepaper': ['whitepaper', 'technical_doc', 'paper'],
      'twitter': ['twitter', 'x', 'social_twitter']
    };
    const keysToTry = possibleKeys[urlType] || [urlType];
    for (const key of keysToTry) {
      if (urlsDict[key]) {
        const url = urlsDict[key];
        return Array.isArray(url) && url.length > 0 ? url[0] : typeof url === 'string' ? url : '#';
      }
    }
    return '#';
  }
}

module.exports = new PineconeService();