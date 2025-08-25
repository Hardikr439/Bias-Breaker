"use client"; // Mark this file as a Client Component

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { AiOutlineLeft, AiOutlineRight } from "react-icons/ai";
import { Card } from "@/components/ui/card"; // ShadCN Card component
import Image from "next/image";

export default function Content() {
  const [showOverlay, setShowOverlay] = useState(false);
  const carouselRef = useRef(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [similarTopics, setSimilarTopics] = useState([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const [showDecision, setShowDecision] = useState(false);
  const [decisionData, setDecisionData] = useState({ exact: null, similar: [] });

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/auth/topics');
        const data = await response.json();
        if (data.topics) {
          setTopics(data.topics);
        }
      } catch (error) {
        console.error('Failed to fetch topics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, []);

  const searchTopic = async (query) => {
    try {
      setSearching(true);
      const response = await fetch('/api/search-topic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSimilarTopics(data.similar_topics || []);

      // If exact match exists, return the query_id
      if (data.query_id) {
        return { query_id: data.query_id, existing: data.existing };
      }
      return null;
    } catch (err) {
      console.error('Failed to search topics:', err);
      return null;
    } finally {
      setSearching(false);
    }
  };

  const fetchTopicById = async (query_id) => {
    try {
      const response = await fetch(`/api/auth/topics/${query_id}`);
      if (!response.ok) throw new Error('Failed to fetch topic');
      const data = await response.json();
      return data.topic;
    } catch (err) {
      setError('Failed to fetch topic data.');
      return null;
    }
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setError("");
    setShowDecision(false);
    setDecisionData({ exact: null, similar: [] });

    try {
      const existingTopicResult = await searchTopic(query);

      // Check for exact and similar topics
      const hasExact = existingTopicResult && existingTopicResult.existing;
      const hasSimilar = (similarTopics && similarTopics.length > 0);

      if (hasExact || hasSimilar) {
        setDecisionData({
          exact: hasExact ? existingTopicResult : null,
          similar: similarTopics,
        });
        setShowDecision(true);
        setLoading(false);
        return;
      }

      // If no exact and no similar, create new immediately
      await createNewTopic();
    } catch (err) {
      setError(err.message || "Failed to analyze query. Please try again.");
      setLoading(false);
    }
  };

  const createNewTopic = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, forceNew: true }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      const topicData = await fetchTopicById(data.query_id);
      if (topicData) setTopics(prevTopics => [topicData, ...prevTopics]);
      setQuery("");
      setSimilarTopics([]);
      setDecisionData({ exact: null, similar: [] });
      setShowDecision(false);
    } catch (err) {
      setError(err.message || "Failed to analyze query. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#F9F7F7] min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#112D4E] mb-4">Analyze Social Media Discourse</h2>
          <div className="flex flex-col space-y-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Enter your query..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="p-2 border rounded-md w-full"
              />
              {searching && (
                <div className="absolute right-2 top-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#3F72AF]"></div>
                </div>
              )}
            </div>

            {/* Similar Topics Section
            {similarTopics.length > 0 && (
              <div className="bg-white p-4 rounded-md shadow-sm">
                <h3 className="text-sm font-semibold text-[#112D4E] mb-2">Similar Topics:</h3>
                <div className="space-y-2">
                  {similarTopics.map((topic) => (
                    <div
                      key={topic._id}
                      className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md"
                    >
                      <span className="text-[#3F72AF]">{topic.query}</span>
                      <Link
                        href={`/Analysis?topic=${topic._id}`}
                        className="text-sm text-[#3F72AF] hover:text-[#112D4E]"
                      >
                        View Analysis
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )} */}

            <button
              onClick={handleAnalyze}
              disabled={loading || searching}
              className="bg-[#112D4E] text-white px-4 py-2 rounded-md hover:bg-[#3F72AF] transition-colors disabled:opacity-50"
            >
              {loading ? 'Analyzing...' : searching ? 'Searching...' : 'Analyze'}
            </button>
          </div>
        </div>

        {error && (
          <div className="text-red-500 mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((topic) => (
            <div key={topic._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-[#112D4E] mb-4">
                  {topic.query}
                </h3>
                <p className="text-[#3F72AF] mb-4 flex-grow">
                  Analysis based on {topic.tweets?.length || 0} tweets
                </p>
                <div className="mt-4">
                  <Link
                    href={`/Analysis?topic=${topic._id}`}
                    className="text-[#3F72AF] hover:text-[#112D4E] font-semibold inline-flex items-center"
                  >
                    View Analysis
                    <svg
                      className="w-4 h-4 ml-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showDecision && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg">
            <h2 className="text-lg font-bold mb-2">Topics Found</h2>
            {decisionData.exact && (
              <div className="mb-2">
                <span className="font-semibold text-green-700">Exact match:</span>
                <div className="flex justify-between items-center mt-1">
                  <span>{query}</span>
                  <Link href={`/Analysis?topic=${decisionData.exact.query_id}`} className="text-blue-600 underline">View</Link>
                </div>
              </div>
            )}
            {similarTopics.length > 0 && (
              <div className="mb-2">
                <span className="font-semibold text-yellow-700">Similar topics:</span>
                <ul className="list-disc ml-5">
                  {similarTopics.map(topic => (
                    <li key={topic._id} className="flex justify-between items-center">
                      <span>{topic.query}</span>
                      <Link href={`/Analysis?topic=${topic._id}`} className="text-blue-600 underline">View</Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex gap-2 mt-4">
              <button
                className="bg-[#112D4E] text-white px-4 py-2 rounded hover:bg-[#3F72AF]"
                onClick={createNewTopic}
              >
                Create New Anyway
              </button>
              <button
                className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
                onClick={() => setShowDecision(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
