import React, { useState } from 'react';
import CategoryFilter from '../components/CategoryFilter';
import VideoGrid from '../components/VideoGrid';
import { useTrendingVideos, useVideoSearch, useVideosByCategory } from '../hooks/useYouTubeData';
import { useI18n } from '../i18n';

interface HomePageProps {
  searchQuery: string;
}

const HomePage: React.FC<HomePageProps> = ({ searchQuery }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { t } = useI18n();
  const PAGE_SIZE = 24;

  const trimmedQuery = searchQuery.trim();
  const searchActive = trimmedQuery.length > 0;
  const categoryActive = !searchActive && selectedCategory !== 'all';

  const trending = useTrendingVideos(PAGE_SIZE);
  const search = useVideoSearch(trimmedQuery, searchActive, PAGE_SIZE);
  const category = useVideosByCategory(
    selectedCategory,
    categoryActive,
    PAGE_SIZE
  );

  const activeSource = searchActive ? search : categoryActive ? category : trending;
  const { videos, loading, loadingMore, hasMore, loadMore } = activeSource;

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const categoryLabelMap: Record<string, string> = {
    '10': t('category.music'),
    '20': t('category.gaming'),
    '24': t('category.entertainment'),
    '28': t('category.science'),
    '27': t('category.education'),
    '17': t('category.sports'),
    '25': t('category.news'),
    '26': t('category.howto'),
    '23': t('category.comedy'),
  };

  const selectedCategoryName = categoryLabelMap[selectedCategory] || t('category.generic');

  return (
    <div className="flex-1">
      <CategoryFilter
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
      />
       
      {searchActive && (
        <div className="px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {t('home.searchHeading', { term: trimmedQuery })}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {videos.length === 1
              ? t('home.resultsSingle', { count: videos.length })
              : t('home.resultsMany', { count: videos.length })}
          </p>
        </div>
      )}

      {!searchActive && selectedCategory === 'all' && (
        <div className="px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {t('home.trendingTitle')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('home.trendingSubtitle')}
          </p>
        </div>
      )}

      {!searchActive && selectedCategory !== 'all' && (
        <div className="px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {t('home.categoryTitle', { category: selectedCategoryName })}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('home.categorySubtitle')}
          </p>
        </div>
      )}

      <VideoGrid
        videos={videos}
        loading={loading && videos.length === 0}
        onLoadMore={hasMore ? loadMore : undefined}
        hasMore={hasMore}
        isLoadingMore={loadingMore}
      />

      {videos.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-400 dark:text-gray-600 mb-4">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {t('home.emptyTitle')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {searchActive 
              ? t('home.emptySearch')
              : t('home.emptyDefault')}
          </p>
        </div>
      )}
    </div>
  );
};

export default HomePage;
