import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Search } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { SearchTag } from '../types';

interface SearchSectionProps {
  onSearch: (query: string, tags: SearchTag[]) => void;
  isLoading?: boolean;
}

const searchTags: SearchTag[] = [
  '有叙事背景',
  '实力团队', 
  '技术创新',
  '热门领域',
  '代币启动公平',
  '代币分配公平',
  '代币通缩',
  '有清晰发展路径',
  '社区质量高'
];

const SearchSection: React.FC<SearchSectionProps> = React.memo(({ onSearch, isLoading = false }) => {
  const [query, setQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<SearchTag[]>([]);
  const { t } = useLanguage();

  const handleSearch = useCallback(() => {
    if (query.trim() || selectedTags.length > 0) {
      onSearch(query.trim(), selectedTags);
    }
  }, [query, selectedTags, onSearch]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const toggleTag = useCallback((tag: SearchTag) => {
    // 将标签内容添加到输入框（使用当前语言的翻译）
    const translatedTag = t(tag) || tag;
    setQuery(prev => {
      const currentQuery = prev.trim();
      if (currentQuery === '') {
        return translatedTag;
      } else if (!currentQuery.includes(translatedTag)) {
        const separator = t('language') === '中文' ? '，' : ', ';
        return currentQuery + separator + translatedTag;
      }
      return prev;
    });

    // 同时更新选中的标签状态
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  }, [t]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center min-h-[70vh] px-6"
    >
      <div className="max-w-4xl mx-auto text-center space-y-6">
        {/* 主标题区域 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-purple-500" />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent leading-tight" style={{ fontFamily: 'SimSun, "宋体", serif' }}>
            {t('title')}
          </h1>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {t('subtitle')}
          </p>
        </motion.div>

        {/* 搜索框区域 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="relative max-w-2xl mx-auto"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t('searchPlaceholder')}
            className="w-full h-16 pl-6 pr-32 text-lg bg-white/80 backdrop-blur-sm border-2 border-gray-200/50 rounded-2xl shadow-lg hover:shadow-xl focus:shadow-xl focus:border-purple-300 focus:outline-none transition-all duration-300"
            disabled={isLoading}
          />
          
          <motion.button
            onClick={handleSearch}
            disabled={isLoading}
            whileHover={{ scale: isLoading ? 1 : 1.05 }}
            whileTap={{ scale: isLoading ? 1 : 0.95 }}
            className="absolute right-2 top-2 h-12 px-6 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium rounded-xl transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Search className="w-4 h-4" />
            {isLoading ? `${t('searchButton')}中...` : t('searchButton')}
          </motion.button>
        </motion.div>

        {/* 标签按钮区域 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto"
        >
          {searchTags.map((tag, index) => (
            <motion.button
              key={tag}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
              onClick={() => toggleTag(tag)}
              className={`px-6 py-3 rounded-xl border-2 shadow-sm hover:shadow-md transition-all duration-300 ${
                selectedTags.includes(tag)
                  ? 'bg-purple-50/80 border-purple-300 text-purple-700'
                  : 'bg-white/60 backdrop-blur-sm border-gray-200/50 hover:border-purple-300 hover:bg-purple-50/80 text-gray-700'
              }`}
              disabled={isLoading}
            >
              {t(tag) || tag}
            </motion.button>
          ))}
        </motion.div>


      </div>
    </motion.div>
  );
});

export default SearchSection;
