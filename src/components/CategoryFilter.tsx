import React from 'react';
import { useI18n } from '../i18n';

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ selectedCategory, onCategoryChange }) => {
  const { t } = useI18n();
  const categories = [
    { id: 'all', key: 'category.all' },
    { id: '10', key: 'category.music' },
    { id: '20', key: 'category.gaming' },
    { id: '24', key: 'category.entertainment' },
    { id: '28', key: 'category.science' },
    { id: '27', key: 'category.education' },
    { id: '17', key: 'category.sports' },
    { id: '25', key: 'category.news' },
    { id: '26', key: 'category.howto' },
    { id: '23', key: 'category.comedy' }
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
          {t(category.key)}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;
