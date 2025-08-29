import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Star, 
  ChevronUp, 
  ChevronDown, 
  ExternalLink, 
  FileText, 
  Twitter,
  DollarSign,
  Search,
  ArrowLeft,
  Sparkles,
  Coins,
  Trophy
} from 'lucide-react';
import { TokenResult, SearchTag } from '../types';
import { cn } from '../utils/cn';
import { useLanguage } from '../contexts/LanguageContext';

interface SearchResultsProps {
  tokens: TokenResult[];
  query: string;
  selectedTags: SearchTag[];
  onBack: () => void;
  onToggleFavorite: (tokenId: string) => void;
  onResearchReport: (tokenId: string) => void;
  onSearch: (query: string, tags: SearchTag[]) => void;
}

const SearchResults: React.FC<SearchResultsProps> = React.memo(({
  tokens,
  query,
  selectedTags,
  onBack,
  onToggleFavorite,
  onResearchReport,
  onSearch
}) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState(query);
  const { t, translateDescription } = useLanguage();

  const toggleRowExpansion = (tokenId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tokenId)) {
        newSet.delete(tokenId);
      } else {
        newSet.add(tokenId);
      }
      return newSet;
    });
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim(), selectedTags);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen px-6 pt-4"
    >
      <div className="max-w-7xl mx-auto space-y-4">
        {/* 搜索区域 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-6"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent" style={{ fontFamily: 'SimSun, "宋体", serif' }}>
            {t('title')}
          </h1>

          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed mt-2">
            {t('subtitle')}
          </p>
          
          {/* 搜索框 */}
          <div className="relative max-w-2xl mx-auto">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t('searchPlaceholder')}
              className="w-full h-14 pl-6 pr-28 text-lg bg-white/80 backdrop-blur-sm border-2 border-gray-200/50 rounded-2xl shadow-lg focus:shadow-xl focus:border-purple-300 focus:outline-none transition-all duration-300"
            />
            
            <button
              onClick={handleSearch}
              className="absolute right-2 top-2 h-10 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium rounded-xl transition-all duration-300 flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              {t('searchButton')}
            </button>
          </div>
        </motion.div>

        {/* 搜索结果卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white/80 backdrop-blur-sm border-2 border-gray-200/50 shadow-xl rounded-3xl overflow-hidden"
        >
          {/* 结果头部 */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200/50 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                  <Coins className="w-4 h-4 text-white" />
                </div>
                <div className="bg-yellow-50 px-4 py-2 rounded-lg border border-yellow-200">
                  <h2 className="text-sm font-medium text-gray-700" style={{ fontFamily: 'FangSong, STFangSong, "仿宋", serif' }}>
                    {t('recommendTitle').replace('{count}', tokens.length.toString()).replace('{query}', query)}
                  </h2>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                {t('highMatch')}
              </div>
            </div>
          </div>

          {/* 表格内容 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="overflow-x-auto"
          >
            <table className="w-full min-w-[800px]">
              <thead className="bg-gradient-to-r from-indigo-50 via-purple-50 to-blue-50 border-b-2 border-gradient-to-r from-indigo-200 to-purple-200">
                <tr>
                  <th className="w-20 px-3 md:px-6 py-2 text-center text-xs md:text-sm font-medium text-gray-700">{t('rank')}</th>
                  <th className="w-32 px-3 md:px-6 py-2 text-center text-xs md:text-sm font-medium text-gray-700">{t('token')}</th>
                  <th className="w-32 px-3 md:px-6 py-2 text-center text-xs md:text-sm font-medium text-gray-700">{t('name')}</th>
                  <th className="px-3 md:px-6 py-2 text-center text-xs md:text-sm font-medium text-gray-700">{t('description')}</th>
                  <th className="w-24 px-3 md:px-6 py-2 text-center text-xs md:text-sm font-medium text-gray-700">{t('circulatingSupply')}</th>
                  <th className="w-24 px-3 md:px-6 py-2 text-center text-xs md:text-sm font-medium text-gray-700">{t('totalSupply')}</th>
                  <th className="w-20 px-3 md:px-6 py-2 text-center text-xs md:text-sm font-medium text-gray-700">{t('website')}</th>
                  <th className="w-20 px-3 md:px-6 py-2 text-center text-xs md:text-sm font-medium text-gray-700 whitespace-nowrap">{t('whitepaper')}</th>
                  <th className="w-20 px-3 md:px-6 py-2 text-left text-xs md:text-sm font-medium text-gray-700 pl-8">{t('twitter')}</th>
                </tr>
              </thead>
              <tbody>
                {tokens.slice(0, 50).map((token, index) => (
                  <motion.tr
                    key={token.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: Math.min(index * 0.02, 0.5) }}
                    className="border-b border-gray-200/30 hover:bg-gray-50/30 transition-all duration-200"
                  >
                    {/* 序号列 */}
                    <td className="px-6 py-2 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onToggleFavorite(token.id)}
                          className="text-gray-400 hover:text-yellow-500 transition-colors"
                        >
                          <Star className={cn("w-4 h-4", token.isFavorited && "fill-yellow-500 text-yellow-500")} />
                        </button>
                        <div className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-sm font-medium">
                          {token.rank}
                        </div>
                      </div>
                    </td>

                    {/* 代币列 */}
                    <td className="px-6 py-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                          {token.logo}
                        </div>
                        <span className="font-medium text-gray-800">{token.symbol}</span>
                      </div>
                    </td>

                    {/* 名称列 */}
                    <td className="px-6 py-2">
                      <span className="text-gray-700">{token.name}</span>
                    </td>

                    {/* 描述列 */}
                    <td className="px-6 py-2">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "text-gray-600 text-sm",
                          !expandedRows.has(token.id) && "truncate max-w-md"
                        )}>
                          {translateDescription(token.description)}
                        </span>
                        <button
                          onClick={() => toggleRowExpansion(token.id)}
                          className="text-purple-600 hover:text-purple-700 flex-shrink-0"
                        >
                          {expandedRows.has(token.id) ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* 流通量列 */}
                    <td className="px-6 py-2">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <DollarSign className="w-4 h-4" />
                        {token.circulatingSupply}
                      </div>
                    </td>

                    {/* 总量列 */}
                    <td className="px-6 py-2">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <DollarSign className="w-4 h-4" />
                        {token.totalSupply}
                      </div>
                    </td>

                    {/* 官网列 */}
                    <td className="px-6 py-2">
                      <a
                        href={token.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-blue-100 flex items-center justify-center text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </td>

                    {/* 白皮书列 */}
                    <td className="px-6 py-2 text-center">
                      <a
                        href={token.whitepaperUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-green-100 text-gray-600 hover:text-green-600 transition-colors"
                      >
                        <FileText className="w-4 h-4" />
                      </a>
                    </td>

                    {/* 推特列 */}
                    <td className="px-6 py-2 pl-8">
                      <div className="flex items-center gap-3">
                        <a
                          href={token.twitterUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-sky-100 text-gray-600 hover:text-sky-600 transition-colors"
                        >
                          <Twitter className="w-4 h-4" />
                        </a>

                        {/* 深度研究按钮 */}
                        <button
                          onClick={() => onResearchReport(token.id)}
                          className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-1 whitespace-nowrap"
                        >
                          <FileText className="w-3 h-3" />
                          {t('deepResearch')}
                        </button>
                      </div>
                    </td>


                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </motion.div>

        {/* 返回按钮 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex justify-center"
        >
          <button
            onClick={onBack}
            className="bg-white/80 backdrop-blur-sm border-2 border-gray-200/50 hover:border-purple-300 hover:bg-purple-50/80 px-6 py-3 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-2 text-gray-700"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('backToSearch')}
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
});

export default SearchResults;
