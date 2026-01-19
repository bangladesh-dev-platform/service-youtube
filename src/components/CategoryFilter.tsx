import React from 'react';
import { VIDEO_CATEGORIES } from '../types';

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ selectedCategory, onCategoryChange }) => {
  const categories = [
    { id: 'all', name: 'All' },
    { id: '10', name: 'Music' },
    { id: '20', name: 'Gaming' },
    { id: '24', name: 'Entertainment' },
    { id: '28', name: 'Science & Technology' },
    { id: '27', name: 'Education' },
    { id: '17', name: 'Sports' },
    { id: '25', name: 'News & Politics' },
    { id: '26', name: 'Howto & Style' },
    { id: '23', name: 'Comedy' }
  ];

  return (
    <div className="flex overflow-x-auto scrollbar-hide gap-3 py-4 px-4 border-b border-gray-200 dark:border-gray-700">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selectedCategory === category.id
              ? 'bg-red-500 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;