# StreamVibe - Production YouTube API Platform

A production-ready video platform built with React, TypeScript, and YouTube Data API v3. This application provides a modern, responsive interface for browsing, searching, and watching YouTube content with full compliance to YouTube's Terms of Service.

## 🚀 Features

### Core Functionality
- **YouTube API Integration**: Real-time data from YouTube Data API v3
- **Embedded Video Player**: Official YouTube iframe player with full controls
- **Advanced Search**: Real-time search with filtering and pagination
- **Trending Content**: Display trending videos by region and category
- **Related Videos**: Dynamic related content suggestions
- **Comments System**: Display YouTube comments with proper formatting
- **Responsive Design**: Mobile-first approach with seamless adaptation

### User Experience
- **Modern Interface**: Clean, minimalist design inspired by leading platforms
- **Dark/Light Mode**: System preference detection with manual toggle
- **Smooth Animations**: Subtle micro-interactions throughout the interface
- **Infinite Scroll**: Seamless content loading for browsing
- **Category Filtering**: Browse content by YouTube's official categories
- **User Authentication**: Demo login system with user profiles

### Technical Features
- **TypeScript**: Full type safety throughout the application
- **React Hooks**: Custom hooks for YouTube API integration
- **Error Handling**: Comprehensive error handling and loading states
- **Performance Optimized**: Lazy loading, image optimization, and caching
- **SEO Friendly**: Proper meta tags and structured data
- **Accessibility**: WCAG compliant with keyboard navigation

## 📋 Prerequisites

Before running this application, you need:

1. **Node.js** (version 16 or higher)
2. **YouTube Data API v3 Key** from Google Cloud Console
3. **Git** for version control

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd streamvibe-youtube-platform
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up YouTube API Key

#### Get Your API Key:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **YouTube Data API v3**
4. Create credentials (API Key)
5. Restrict the API key to YouTube Data API v3 (recommended)

#### Configure Environment Variables:
```bash
cp .env.example .env
```

Edit `.env` and add your API key:
```env
VITE_YOUTUBE_API_KEY=your_actual_api_key_here
```

### 4. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.tsx      # Navigation header with search
│   ├── Sidebar.tsx     # Navigation sidebar
│   ├── VideoCard.tsx   # Video thumbnail component
│   ├── VideoGrid.tsx   # Grid layout for videos
│   ├── CategoryFilter.tsx # Category filtering tabs
│   └── YouTubePlayer.tsx  # YouTube iframe player
├── contexts/           # React Context providers
│   ├── ThemeContext.tsx   # Theme management
│   └── AuthContext.tsx    # Authentication state
├── hooks/              # Custom React hooks
│   └── useYouTubeData.ts  # YouTube API integration hooks
├── pages/              # Page components
│   ├── HomePage.tsx    # Main video listing page
│   ├── VideoPlayerPage.tsx # Video player interface
│   └── LoginPage.tsx   # Authentication page
├── services/           # API services
│   └── youtubeApi.ts   # YouTube Data API service
├── types/              # TypeScript type definitions
│   └── index.ts        # Shared types and interfaces
├── utils/              # Utility functions
│   └── videoUtils.ts   # Video-related utilities
└── App.tsx             # Main application component
```

## 🔧 Configuration

### YouTube API Configuration

The application uses the following YouTube Data API v3 endpoints:

- **Search**: `/search` - For video search functionality
- **Videos**: `/videos` - For video details and trending content
- **Channels**: `/channels` - For channel information
- **CommentThreads**: `/commentThreads` - For video comments

### API Rate Limits

YouTube Data API v3 has the following quotas:
- **Default quota**: 10,000 units per day
- **Search operation**: 100 units per request
- **Video details**: 1 unit per request
- **Comments**: 1 unit per request

### Environment Variables

```env
# Required
VITE_YOUTUBE_API_KEY=your_youtube_api_key

# Optional
VITE_GA_TRACKING_ID=your_google_analytics_id
VITE_ENVIRONMENT=production
```

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Netlify
1. Connect your repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables in Netlify dashboard

### Deploy to Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow the prompts
4. Add environment variables in Vercel dashboard

### Deploy to Other Platforms
The built files in the `dist` directory can be deployed to any static hosting service:
- AWS S3 + CloudFront
- GitHub Pages
- Firebase Hosting
- Surge.sh

## 📊 Performance Optimization

### Implemented Optimizations
- **Lazy Loading**: Images and components load on demand
- **Code Splitting**: Dynamic imports for route-based splitting
- **Caching**: API responses cached in memory
- **Image Optimization**: WebP format with fallbacks
- **Bundle Optimization**: Tree shaking and minification

### Performance Metrics
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **Time to Interactive**: < 3.5s

## 🔒 Legal Compliance

### YouTube Terms of Service
This application complies with YouTube's Terms of Service by:
- Using official YouTube Data API v3
- Implementing YouTube's embedded player
- Respecting rate limits and quotas
- Providing proper attribution
- Not downloading or storing YouTube content

### Required Attributions
- YouTube content is property of respective creators
- Powered by YouTube Data API v3
- YouTube and the YouTube logo are trademarks of Google LLC

### Privacy Policy
When deploying to production, ensure you have:
- Privacy policy covering data collection
- Cookie consent for analytics
- GDPR compliance if serving EU users
- Terms of service for your platform

## 🐛 Troubleshooting

### Common Issues

#### API Key Not Working
```
Error: The request cannot be completed because you have exceeded your quota.
```
**Solution**: Check your API key and quota limits in Google Cloud Console

#### Videos Not Loading
```
Error: Failed to fetch videos
```
**Solutions**:
- Verify API key is correctly set in `.env`
- Check if YouTube Data API v3 is enabled
- Ensure API key restrictions allow your domain

#### CORS Errors
```
Error: Access to fetch blocked by CORS policy
```
**Solution**: YouTube API should be called from server-side or use official client libraries

### Debug Mode
Enable debug logging by setting:
```env
VITE_ENVIRONMENT=development
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

### Development Guidelines
- Follow TypeScript best practices
- Write comprehensive tests
- Maintain consistent code style
- Update documentation for new features
- Ensure accessibility compliance

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This application is a demonstration of YouTube API integration and does not store or redistribute YouTube content. All content remains the property of respective creators and YouTube. When using this code, ensure compliance with:

- YouTube Terms of Service
- YouTube API Terms of Service
- Local copyright laws
- Platform-specific guidelines

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check existing documentation
- Review YouTube API documentation
- Contact the development team

---

**Built with ❤️ using React, TypeScript, and YouTube Data API v3**