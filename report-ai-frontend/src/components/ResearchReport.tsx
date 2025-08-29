import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Download, Share2, AlertTriangle, Target, Cpu, Coins, Shield, TrendingUp, Users } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { ResearchReport as ResearchReportType } from '../types';

interface ResearchReportProps {
  report: ResearchReportType | null;
  isOpen: boolean;
  onClose: () => void;
  isLoading?: boolean;
}

const ResearchReport: React.FC<ResearchReportProps> = ({
  report,
  isOpen,
  onClose,
  isLoading = false
}) => {
  const { t, translateDescription } = useLanguage();

  // 格式化报告内容的函数 - 按照报告模板要求
  const formatReportContent = (content: string) => {
    // 删除所有主标题（以 # 开头的行，包括报告名字）
    let processedContent = content.replace(/^#[^#].*$/gm, '');

    // 处理模块标题（以 ## 开头的行）- 图标和标题同行，无背景，字体颜色修饰
    processedContent = processedContent.replace(/^##\s*(.+)$/gm, (match, title) => {
      const trimmedTitle = title.trim();
      let icon = '📊'; // 默认图标

      // 根据标题选择图标 - 按照报告模板
      if (trimmedTitle.includes('项目概述') || trimmedTitle.includes('Project Overview')) icon = '🎯';
      else if (trimmedTitle.includes('产品和业务') || trimmedTitle.includes('Product')) icon = '🏢';
      else if (trimmedTitle.includes('创始人和团队') || trimmedTitle.includes('Team') || trimmedTitle.includes('Founder')) icon = '👥';
      else if (trimmedTitle.includes('技术分析') || trimmedTitle.includes('Technical Analysis')) icon = '⚙️';
      else if (trimmedTitle.includes('代币经济学') || trimmedTitle.includes('Tokenomics')) icon = '💰';
      else if (trimmedTitle.includes('社区分析') || trimmedTitle.includes('Community')) icon = '🌐';
      else if (trimmedTitle.includes('生态分析') || trimmedTitle.includes('Ecosystem')) icon = '🌱';
      else if (trimmedTitle.includes('风险分析') || trimmedTitle.includes('Risk Analysis')) icon = '🛡️';
      else if (trimmedTitle.includes('总结') || trimmedTitle.includes('Summary') || trimmedTitle.includes('Conclusion')) icon = '📈';

      // 图标和标题同行，无背景，渐变字体颜色
      return `<div style="margin: 28px 0 18px 0; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">
        <h2 style="display: flex; align-items: center; gap: 10px; margin: 0; font-size: 20px; font-weight: bold; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
          <span style="font-size: 22px;">${icon}</span>
          ${trimmedTitle}
        </h2>
      </div>`;
    });

    // 处理子标题（以 ### 开头的行）- 简洁的副标题样式
    processedContent = processedContent.replace(/^###\s*(.+)$/gm, (match, title) => {
      const trimmedTitle = title.trim();
      return `<div style="margin: 20px 0 12px 0;">
        <h3 style="margin: 0; font-size: 16px; font-weight: 600; color: #374151; padding-left: 16px; border-left: 3px solid #6366f1;">${trimmedTitle}</h3>
      </div>`;
    });

    // 删除所有剩余的 # 标记
    processedContent = processedContent.replace(/^#+\s*/gm, '');

    // 优化段落间距
    processedContent = processedContent.replace(/\n\n/g, '<div style="margin: 16px 0;"></div>');

    return processedContent;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* 背景遮罩 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* 弹窗内容 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3 }}
          className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* 头部 */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200/50 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 text-center">
                {isLoading ? (
                  <div className="space-y-2 flex flex-col items-center">
                    <div className="h-6 bg-gray-200 rounded animate-pulse w-48"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                  </div>
                ) : report ? (
                  <>
                    <h2 className="text-2xl font-bold text-gray-800">
                      {t('reportTitle').replace('{name}', report.tokenName)}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {t('generatedAt')}：{new Date(report.generatedAt).toLocaleString(t('language') === '中文' ? 'zh-CN' : 'en-US')}
                    </p>
                  </>
                ) : (
                  <h2 className="text-2xl font-bold text-gray-800">{t('researchReport')}</h2>
                )}
              </div>

              <div className="flex items-center gap-2">
                {!isLoading && report && (
                  <>
                    <button className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                      <Download className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                      <Share2 className="w-5 h-5" />
                    </button>
                  </>
                )}
                <button
                  onClick={onClose}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* 内容区域 */}
          <div className="flex-1 overflow-y-auto p-8">
            {isLoading ? (
              <div className="space-y-6">
                <div className="flex items-center justify-center py-12">
                  <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                </div>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                </div>
              </div>
            ) : report ? (
              <div className="max-w-none">
                <div
                  className="text-gray-700 leading-relaxed"
                  style={{
                    fontFamily: 'FangSong, STFangSong, "仿宋", serif',
                    lineHeight: '1.9',
                    fontSize: '15px',
                    color: '#374151'
                  }}
                  dangerouslySetInnerHTML={{
                    __html: formatReportContent(translateDescription(report.content))
                      .replace(/\n\s*\n/g, '<div style="margin: 12px 0;"></div>')
                      .replace(/\n/g, '<br/>')
                  }}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center py-12 text-gray-500">
                <div className="text-center">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>{t('language') === '中文' ? '暂无报告内容' : 'No report content'}</p>
                </div>
              </div>
            )}
          </div>

          {/* 底部免责声明 */}
          {!isLoading && report && (
            <div className="bg-amber-50 border-t border-amber-200 px-8 py-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium mb-1">{t('disclaimer')}</p>
                  <p>{translateDescription(report.disclaimer)}</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ResearchReport;
