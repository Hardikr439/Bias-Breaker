'use client';
import React, { useState, useEffect } from 'react';
import { ExternalLink, Clock, RefreshCcw } from 'lucide-react';

const LiveNewsSection = ({ query }) => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchNews = async () => {
    try {
      setLoading(true);
      console.log('Initiating news fetch for:', query);

      const response = await fetch(`/api/auth/newsapi?query=${encodeURIComponent(query)}`);
      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response body:', errorText);

        let parsedError;
        try {
          parsedError = JSON.parse(errorText);
        } catch (e) {
          console.error('Failed to parse error response:', e);
        }

        throw new Error(
          parsedError?.error ||
          `Failed to fetch news: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log('Received news data:', data);

      if (!data.news || !Array.isArray(data.news)) {
        console.error('Invalid news data format:', data);
        throw new Error('Invalid news data format received');
      }

      setNews(data.news);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error('News fetch error:', err);
      setError(err.message);
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (query) {
      fetchNews();
      const interval = setInterval(fetchNews, 60 * 60 * 1000); // Refresh every hour
      return () => clearInterval(interval);
    }
  }, [query]);

  const formatTime = (date) => {
    const now = new Date();
    const diff = Math.floor((now - new Date(date)) / 1000 / 60);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-[#112D4E]">
          Live News Channel
        </h2>
        <div className="flex items-center space-x-2 text-sm text-[#3F72AF]">
          <span className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            Updated {formatTime(lastUpdated)}
          </span>
          <button
            onClick={fetchNews}
            className="flex items-center hover:text-[#112D4E] transition-colors"
          >
            <RefreshCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3F72AF]"></div>
        </div>
      )}

      {error && (
        <div className="text-red-500 text-center py-4 space-y-2">
          <p>{error}</p>
          <button
            onClick={fetchNews}
            className="px-4 py-2 bg-[#3F72AF] text-white rounded hover:bg-[#112D4E] transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
        {news.map((item, index) => (
          <div
            key={index}
            className="flex flex-col sm:flex-row gap-4 p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {item.imageUrl && (
              <div className="sm:w-48 h-32">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover rounded-lg"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-2">
                <span className="inline-block px-2 py-1 text-xs font-medium bg-[#DBE2EF] text-[#112D4E] rounded">
                  {item.source}
                </span>
                <span className="text-sm text-gray-500">
                  {formatTime(item.publishedAt)}
                </span>
              </div>

              <h3 className="text-[#112D4E] font-medium mb-2 line-clamp-2">
                {item.title}
              </h3>

              <p className="text-[#3F72AF] text-sm mb-2 line-clamp-2">
                {item.description}
              </p>

              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-[#3F72AF] hover:text-[#112D4E] transition-colors"
              >
                Read more
                <ExternalLink className="w-4 h-4 ml-1" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default LiveNewsSection;