import { Video } from '../types';

export const mockVideos: Video[] = [
  {
    id: '1',
    title: 'Amazing Nature Documentary: Wildlife in 4K',
    description: 'Explore the incredible world of wildlife captured in stunning 4K resolution.',
    thumbnail: 'https://images.pexels.com/photos/33109/fall-autumn-red-season.jpg?auto=compress&cs=tinysrgb&w=800',
    duration: '42:15',
    views: '2.1M',
    uploadDate: '2 days ago',
    channelName: 'Nature Explorer',
    channelAvatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100',
    category: 'Documentary',
    tags: ['nature', 'wildlife', '4k', 'documentary']
  },
  {
    id: '2',
    title: 'Modern Web Development: React Best Practices 2024',
    description: 'Learn the latest React patterns and best practices for building scalable applications.',
    thumbnail: 'https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg?auto=compress&cs=tinysrgb&w=800',
    duration: '28:33',
    views: '847K',
    uploadDate: '1 week ago',
    channelName: 'Code Academy',
    channelAvatar: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=100',
    category: 'Technology',
    tags: ['react', 'javascript', 'programming', 'tutorial']
  },
  {
    id: '3',
    title: 'Incredible Time-lapse: City Life in Motion',
    description: 'Watch the bustling energy of city life captured in beautiful time-lapse photography.',
    thumbnail: 'https://images.pexels.com/photos/374870/pexels-photo-374870.jpeg?auto=compress&cs=tinysrgb&w=800',
    duration: '15:42',
    views: '1.5M',
    uploadDate: '3 days ago',
    channelName: 'Urban Lens',
    channelAvatar: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=100',
    category: 'Art',
    tags: ['timelapse', 'city', 'photography', 'urban']
  },
  {
    id: '4',
    title: 'Healthy Cooking: Mediterranean Diet Recipes',
    description: 'Discover delicious and healthy Mediterranean recipes that are easy to make at home.',
    thumbnail: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800',
    duration: '35:20',
    views: '623K',
    uploadDate: '5 days ago',
    channelName: 'Healthy Kitchen',
    channelAvatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
    category: 'Lifestyle',
    tags: ['cooking', 'healthy', 'mediterranean', 'recipes']
  },
  {
    id: '5',
    title: 'Space Exploration: Journey to Mars',
    description: 'An in-depth look at humanitys quest to reach Mars and establish a presence on the Red Planet.',
    thumbnail: 'https://images.pexels.com/photos/73873/star-clusters-rosette-nebula-star-galaxies-73873.jpeg?auto=compress&cs=tinysrgb&w=800',
    duration: '52:08',
    views: '3.2M',
    uploadDate: '1 day ago',
    channelName: 'Cosmic Ventures',
    channelAvatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100',
    category: 'Science',
    tags: ['space', 'mars', 'exploration', 'science']
  },
  {
    id: '6',
    title: 'Relaxing Piano Music for Study and Work',
    description: 'Beautiful piano compositions to help you focus and relax during work or study sessions.',
    thumbnail: 'https://images.pexels.com/photos/164938/pexels-photo-164938.jpeg?auto=compress&cs=tinysrgb&w=800',
    duration: '2:15:30',
    views: '4.7M',
    uploadDate: '1 week ago',
    channelName: 'Peaceful Sounds',
    channelAvatar: 'https://images.pexels.com/photos/1181346/pexels-photo-1181346.jpeg?auto=compress&cs=tinysrgb&w=100',
    category: 'Music',
    tags: ['piano', 'relaxing', 'study', 'instrumental']
  }
];

export const categories = [
  'All',
  'Technology',
  'Science',
  'Music',
  'Art',
  'Documentary',
  'Lifestyle',
  'Education',
  'Entertainment',
  'Gaming'
];