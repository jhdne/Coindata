const { Pinecone } = require('@pinecone-database/pinecone');

class PineconeService {
  constructor() {
    this.client = null;
    this.index = null;
    this.indexName = process.env.PINECONE_INDEX_NAME || 'coindata';
  }

  async initialize() {
    try {
      if (!process.env.PINECONE_API_KEY) {
        console.log('⚠️ PINECONE_API_KEY 未设置，使用模拟数据');
        return false;
      }

      this.client = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY
      });

      this.index = this.client.index(this.indexName);
      console.log('✅ Pinecone 客户端初始化成功');
      return true;
    } catch (error) {
      console.error('❌ Pinecone 初始化失败:', error);
      return false;
    }
  }

  async embedQuery(query) {
    try {
      if (!this.client) {
        throw new Error('Pinecone 客户端未初始化');
      }

      console.log(`🔍 正在对查询文本进行向量化: "${query}"`);
      
      const response = await this.client.inference.embed(
        'llama-text-embed-v2',
        [query],
        { inputType: 'query', truncate: 'END' }
      );

      if (response && response.data && response.data.length > 0) {
        const embedding = response.data[0].values;
        console.log(`✅ 查询向量化成功，维度: ${embedding.length}`);
        return embedding;
      } else {
        throw new Error('向量化响应格式错误');
      }
    } catch (error) {
      console.error('❌ 查询向量化失败:', error);
      throw error;
    }
  }

  async searchSimilarTokens(query, topK = 10, tags = []) {
    try {
      if (!this.index) {
        throw new Error('Pinecone 索引未初始化');
      }

      // 向量化查询
      const queryVector = await this.embedQuery(query);

      // 构建过滤条件
      let filter = {};
      if (tags && tags.length > 0) {
        filter.tags = { $in: tags };
      }

      console.log(`🔍 正在搜索相似代币，top_k=${topK}`);
      
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
      console.error('❌ 搜索失败:', error);
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
      'BTC': '₿',
      'ETH': 'Ξ',
      'SOL': '◎',
      'ADA': '₳',
      'DOT': '●',
      'MATIC': '⬟',
      'AVAX': '🔺',
      'LINK': '🔗',
      'UNI': '🦄',
      'ATOM': '⚛️'
    };
    return logoMap[symbol.toUpperCase()] || (symbol ? symbol[0] : '?');
  }

  extractUrl(urlsDict, urlType) {
    if (!urlsDict || typeof urlsDict !== 'object') {
      return this.getDefaultUrl(urlType);
    }
    
    const possibleKeys = {
      'website': ['website', 'homepage', 'official'],
      'whitepaper': ['whitepaper', 'technical_doc', 'paper'],
      'twitter': ['twitter', 'x', 'social_twitter']
    };
    
    const keysToTry = possibleKeys[urlType] || [urlType];
    
    for (const key of keysToTry) {
      if (urlsDict[key]) {
        const url = urlsDict[key];
        if (Array.isArray(url) && url.length > 0) {
          return url[0];
        } else if (typeof url === 'string') {
          return url;
        }
      }
    }
    
    return this.getDefaultUrl(urlType);
  }

  getDefaultUrl(urlType) {
    const defaults = {
      'website': 'https://example.com',
      'whitepaper': 'https://example.com/whitepaper',
      'twitter': 'https://twitter.com'
    };
    
    return defaults[urlType] || '#';
  }
}

module.exports = new PineconeService();
