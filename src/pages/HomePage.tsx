import React, { useState, useEffect } from 'react';
import CategoryFilter from '../components/CategoryFilter';
import VideoGrid from '../components/VideoGrid';
import { Video } from '../types';
import { useTrendingVideos, useYouTubeSearch, useVideosByCategory } from '../hooks/useYouTubeData';

interface HomePageProps {
  searchQuery: string;
}

const HomePage: React.FC<HomePageProps> = ({ searchQuery }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [displayVideos, setDisplayVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);

  // Hooks for different data sources
  const { videos: trendingVideos, loading: trendingLoading } = useTrendingVideos();
  const { videos: searchVideos, loading: searchLoading } = useYouTubeSearch(searchQuery, !!searchQuery);
  const { videos: categoryVideos, loading: categoryLoading } = useVideosByCategory(
    selectedCategory !== 'all' ? selectedCategory : ''
  );

  useEffect(() => {
    // Determine which videos to display based on current state
    if (searchQuery) {
      setDisplayVideos(searchVideos);
      setLoading(searchLoading);
    } else if (selectedCategory !== 'all') {
      setDisplayVideos(categoryVideos);
      setLoading(categoryLoading);
    } else {
      setDisplayVideos(trendingVideos);
      setLoading(trendingLoading);
    }
  }, [
    searchQuery,
    selectedCategory,
    searchVideos,
    categoryVideos,
    trendingVideos,
    searchLoading,
    categoryLoading,
    trendingLoading
  ]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  return (
    <div className="flex-1">
      <CategoryFilter
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
      />
      
      {searchQuery && (
        <div className="px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Search results for "{searchQuery}"
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {displayVideos.length} {displayVideos.length === 1 ? 'result' : 'results'}
          </p>
        </div>
      )}

      {!searchQuery && selectedCategory === 'all' && (
        <div className="px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Trending Videos
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Popular videos from around the world
          </p>
        </div>
      )}

      {!searchQuery && selectedCategory !== 'all' && (
        <div className="px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {selectedCategory === '10' ? 'Music' :
             selectedCategory === '20' ? 'Gaming' :
             selectedCategory === '24' ? 'Entertainment' :
             selectedCategory === '28' ? 'Science & Technology' :
             selectedCategory === '27' ? 'Education' :
             selectedCategory === '17' ? 'Sports' :
             selectedCategory === '25' ? 'News & Politics' :
             selectedCategory === '26' ? 'Howto & Style' :
             selectedCategory === '23' ? 'Comedy' : 'Category'} Videos
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Popular videos in this category
          </p>
        </div>
      )}

      <VideoGrid videos={displayVideos} loading={loading} />

      {displayVideos.length === 0 && !loading && (
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
            No videos found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {searchQuery 
              ? 'Try adjusting your search terms or browse different categories'
              : 'Unable to load videos. Please check your internet connection and try again.'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default HomePage;