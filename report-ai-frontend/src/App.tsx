import React, { useState, useCallback, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import Header from './components/Header';
import SearchSection from './components/SearchSection';
import SearchResults from './components/SearchResults';
import ResearchReport from './components/ResearchReport';
import { TokenResult, SearchTag, ResearchReport as ResearchReportType } from './types';
import { searchTokens, getResearchReport } from './services/api';
import { toggleFavorite } from './services/auth';

function App() {
  const [currentView, setCurrentView] = useState<'search' | 'results'>('search');
  const [searchResults, setSearchResults] = useState<TokenResult[]>([]);
  const [currentQuery, setCurrentQuery] = useState('');
  const [currentTags, setCurrentTags] = useState<SearchTag[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // 研究报告相关状态
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [currentReport, setCurrentReport] = useState<ResearchReportType | null>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);

  const handleSearch = useCallback(async (query: string, tags: SearchTag[]) => {
    setIsSearching(true);
    try {
      const response = await searchTokens({ query, tags });
      if (response.success && response.data) {
        setSearchResults(response.data.tokens);
        setCurrentQuery(query);
        setCurrentTags(tags);
        setCurrentView('results');
      } else {
        console.error('搜索失败:', response.error);
        // 这里可以添加错误提示
      }
    } catch (error) {
      console.error('搜索出错:', error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleBack = () => {
    setCurrentView('search');
  };

  const handleToggleFavorite = async (tokenId: string) => {
    try {
      console.log('尝试切换收藏状态:', tokenId);
      const response = await toggleFavorite(tokenId);
      console.log('收藏切换响应:', response);

      if (response.success && response.data) {
        setSearchResults(prev =>
          prev.map(token =>
            token.id === tokenId
              ? { ...token, isFavorited: response.data!.isFavorited }
              : token
          )
        );
        console.log('收藏状态已更新');
      } else {
        console.error('收藏切换失败:', response.error);
        alert(response.error || '收藏操作失败，请先登录');
      }
    } catch (error) {
      console.error('切换收藏状态失败:', error);
      alert('收藏操作失败，请检查网络连接或先登录');
    }
  };

  const handleResearchReport = async (tokenId: string) => {
    setIsLoadingReport(true);
    setIsReportOpen(true);
    setCurrentReport(null);

    try {
      const response = await getResearchReport(tokenId);
      if (response.success && response.data) {
        setCurrentReport(response.data);
      } else {
        console.error('获取研究报告失败:', response.error);
      }
    } catch (error) {
      console.error('获取研究报告出错:', error);
    } finally {
      setIsLoadingReport(false);
    }
  };

  const handleCloseReport = () => {
    setIsReportOpen(false);
    setCurrentReport(null);
  };

  return (
    <LanguageProvider>
      <AuthProvider>
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 relative overflow-hidden">
      {/* 背景装饰层 */}
      <div className="absolute inset-0 overflow-hidden">
        {/* 右上角光圈 */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-indigo-600/20 rounded-full blur-3xl"></div>

        {/* 左下角光圈 */}
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>

        {/* 中心光圈 */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-indigo-300/10 to-purple-300/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        <Header />

        <AnimatePresence mode="wait">
          {currentView === 'search' ? (
            <SearchSection
              key="search"
              onSearch={handleSearch}
              isLoading={isSearching}
            />
          ) : (
            <SearchResults
              key="results"
              tokens={searchResults}
              query={currentQuery}
              selectedTags={currentTags}
              onBack={handleBack}
              onToggleFavorite={handleToggleFavorite}
              onResearchReport={handleResearchReport}
              onSearch={handleSearch}
            />
          )}
        </AnimatePresence>
      </div>

      {/* 研究报告弹窗 */}
      <ResearchReport
        report={currentReport}
        isOpen={isReportOpen}
        onClose={handleCloseReport}
        isLoading={isLoadingReport}
      />
        </div>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
