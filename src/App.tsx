import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeProvider';
import { AuthProvider } from './contexts/AuthProvider';
import { BookmarkProvider } from './contexts/BookmarkProvider';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import HomePage from './pages/HomePage';
import VideoPlayerPage from './pages/VideoPlayerPage';
import LoginPage from './pages/LoginPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import BookmarksPage from './pages/BookmarksPage';
import HistoryPage from './pages/HistoryPage';
import { useI18n } from './i18n';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { lang } = useI18n();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleMenuToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  return (
    <ThemeProvider>
      <AuthProvider>
        <BookmarkProvider>
          <Router>
            <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white" data-lang={lang}>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<LoginPage />} />
                <Route path="/auth/callback" element={<AuthCallbackPage />} />
              <Route path="*" element={
                <div className="flex flex-col h-screen">
                  <Header onSearch={handleSearch} onMenuToggle={handleMenuToggle} />
                  <div className="flex flex-1 overflow-hidden">
                    <Sidebar isOpen={sidebarOpen} onClose={handleSidebarClose} />
                    <main className="flex-1 overflow-y-auto">
                      <Routes>
                        <Route path="/" element={<HomePage searchQuery={searchQuery} />} />
                        <Route path="/trending" element={<HomePage searchQuery={searchQuery} />} />
                        <Route path="/subscriptions" element={<HomePage searchQuery={searchQuery} />} />
                        <Route path="/watch/:id" element={<VideoPlayerPage />} />
                        <Route path="/channel/:name" element={<HomePage searchQuery={searchQuery} />} />
                        <Route path="/category/:category" element={<HomePage searchQuery={searchQuery} />} />
                        <Route path="/bookmarks" element={<BookmarksPage />} />
                        <Route path="/history" element={<HistoryPage />} />
                        <Route path="/profile" element={<HomePage searchQuery={searchQuery} />} />
                        <Route path="/settings" element={<HomePage searchQuery={searchQuery} />} />
                      </Routes>
                    </main>
                  </div>
                </div>
              } />
            </Routes>
          </div>
        </Router>
        </BookmarkProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
