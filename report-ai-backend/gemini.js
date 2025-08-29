const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor() {
    this.client = null;
    this.model = null;
    this.embeddingModel = null;
  }

  async initialize() {
    try {
      if (!process.env.GEMINI_API_KEY) {
        console.log('⚠️ GEMINI_API_KEY 未设置，Gemini功能将不可用');
        return false;
      }

      this.client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      // 修改：将模型名称更新为 gemini-2.0-flash
      this.model = this.client.getGenerativeModel({ model: 'gemini-2.0-flash' }); 
      this.embeddingModel = this.client.getGenerativeModel({ model: 'embedding-001' });
      
      console.log('✅ Gemini AI 客户端初始化成功');
      return true;
    } catch (error) {
      console.error('❌ Gemini AI 初始化失败:', error);
      return false;
    }
  }

  // 新增：用于将文本转换为向量的函数
  async embedQuery(query) {
    try {
      if (!this.embeddingModel) {
        throw new Error('Gemini 向量嵌入模型未初始化');
      }
      console.log(`🔍 正在使用Gemini对查询文本进行向量化: "${query}"`);
      const result = await this.embeddingModel.embedContent(query);
      const embedding = result.embedding;
      return embedding.values;
    } catch (error) {
      console.error('❌ Gemini 向量化失败:', error);
      throw error;
    }
  }

  // 提炼用户输入的关键信息用于搜索
  async extractSearchKeywords(userInput) {
    try {
      if (!this.model) {
        throw new Error('Gemini 客户端未初始化');
      }

      const prompt = `
请分析以下用户对代币的要求，提炼出关键的搜索词汇，用于在代币数据库中进行向量搜索。

用户输入：${userInput}

请提取以下类型的关键词：
1. 技术特征（如：DeFi、NFT、Layer2、创新、唯一、跨链等）
2. 应用场景（如：支付、游戏、元宇宙、存储等）
3. 特殊属性（如：通缩、治理、质押等）
4. 项目背景（如：叙事等）
5. 项目领域（如：热门、趋势、新兴、成熟、高增长等）
6. 团队特征（如：实力、成熟、经验等）
7. 社区特征（如：规模、质量、潜力等）
8. 代币经济（如：通缩、启动、分配、公平、价值等）


请只返回关键词，用逗号分隔，不要解释。
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const keywords = response.text().trim();
      
      console.log(`✅ Gemini提炼的搜索关键词: ${keywords}`);
      return keywords;
    } catch (error) {
      console.error('❌ Gemini关键词提取失败:', error);
      // 回退：直接返回用户输入
      return userInput;
    }
  }

  // 生成深度研究报告
  async generateResearchReport(tokenData) {
    try {
      if (!this.model) {
        throw new Error('Gemini 客户端未初始化');
      }

      const enhancedPrompt = this.buildEnhancedPrompt(tokenData);
      
      const prompt = `
${enhancedPrompt}

请按照以下模板生成专业的投资分析报告：

# ${tokenData.name} 投资分析报告

## 项目概述
项目的基本情况、发展历程和主要特点

## 产品和业务
项目的核心产品、业务模式和商业价值

## 创始人和团队
创始人和核心团队成员的背景信息（姓名、国籍、职业背景、学历背景、主要技能、职业品德等）

## 技术分析
项目采用的技术方案、技术创新点和技术优势

## 代币经济学
- 代币启动和分配原则
- 分配公平性分析
- 代币功能和用途
- 代币稀缺性分析

## 社区分析
社区规模、质量、发展潜力和主要宣传方式

## 生态分析
项目所在生态的规模和发展潜力

## 风险分析
投资风险评估和注意事项

## 总结
综合评价和投资建议

注意：
1. 如果某个模块缺乏相关数据，可以省略该模块
2. 报告要客观、专业、有条理
3. 使用markdown格式，主标题用#，次标题用##
4. 内容要详实，避免空泛的描述
5. 最后必须包含风险提示
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const report = response.text().trim();
      
      console.log(`📊 Gemini生成了${tokenData.name}的研究报告`);
      return report;
    } catch (error) {
      console.error('❌ Gemini报告生成失败:', error);
      // 回退：返回基础报告模板
      return this.generateFallbackReport(tokenData);
    }
  }

  // 构建增强提示词
  buildEnhancedPrompt(tokenData) {
    let prompt = `请为以下代币生成详细的投资分析报告：

代币基本信息：
- 名称：${tokenData.name}
- 符号：${tokenData.symbol}
- 描述：${tokenData.description}
- 流通供应量：${tokenData.circulatingSupply}
- 总供应量：${tokenData.totalSupply}
`;

    if (tokenData.website && tokenData.website !== '#') {
      prompt += `- 官方网站：${tokenData.website}\n`;
    }
    if (tokenData.whitepaperUrl && tokenData.whitepaperUrl !== '#') {
      prompt += `- 白皮书：${tokenData.whitepaperUrl}\n`;
    }
    if (tokenData.twitterUrl && tokenData.twitterUrl !== '#') {
      prompt += `- 推特：${tokenData.twitterUrl}\n`;
    }
    if (tokenData.score) {
      prompt += `- 匹配度评分：${tokenData.score}\n`;
    }

    return prompt;
  }

  // 生成回退报告
  generateFallbackReport(tokenData) {
    return `# ${tokenData.name} 投资分析报告

## 项目概述
${tokenData.description}

## 代币经济学
- **流通供应量**: ${tokenData.circulatingSupply}
- **总供应量**: ${tokenData.totalSupply}
- **代币符号**: ${tokenData.symbol}

## 技术分析
${tokenData.name}采用区块链技术，具有去中心化的特点。

## 风险分析
数字货币投资存在高风险，价格波动较大，请谨慎投资。

## 总结
本报告基于有限的公开信息生成，投资前请进行更深入的研究。

---
**免责声明**: 本报告仅供参考，不构成投资建议。数字货币投资存在风险，请谨慎决策。`;
  }
}

module.exports = new GeminiService();