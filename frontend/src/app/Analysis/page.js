// app/page.js
'use client';

import { useState, useEffect } from "react";
import { useSearchParams } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import LiveNewsSection from "./Components/LiveNewsSection";

export default function AnalysisPage() {
  const [topicData, setTopicData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLeaning, setSelectedLeaning] = useState('left');
  const [historicalAnalysis, setHistoricalAnalysis] = useState('');
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const topicId = searchParams.get('topic');

        if (topicId) {
          const response = await fetch(`/api/auth/topics/${topicId}`);
          const data = await response.json();
          if (data.topic) {
            setTopicData(data.topic);
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchParams]);

  useEffect(() => {
    const fetchHistoricalAnalysis = async () => {
      try {
        if (!topicData?.query) return;

        const response = await fetch(`/api/auth/historical-analysis?query=${encodeURIComponent(topicData.query)}`);
        const data = await response.json();
        if (data.analysis) {
          setHistoricalAnalysis(data.analysis);
        }
      } catch (error) {
        console.error('Failed to fetch historical analysis:', error);
      }
    };

    fetchHistoricalAnalysis();
  }, [topicData?.query]);

  const getFilteredTweets = (leaning) => {
    if (!topicData?.tweets) return [];
    return topicData.tweets.filter(tweet => tweet.leaning.toLowerCase() === leaning);
  };

  const getTweetCount = (leaning) => {
    if (!topicData?.tweets) return 0;
    return topicData.tweets.filter(tweet => tweet.leaning.toLowerCase() === leaning).length;
  };

  const TweetCard = ({ tweet }) => (
    <Card className="mb-4 hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <img
            src={tweet["Profile Image"]}
            alt={tweet.Name}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <div className="font-semibold text-[#112D4E]">{tweet.Name}</div>
            <div className="text-sm text-gray-500">{tweet.Handle}</div>
          </div>
          {tweet.Verified && (
            <span className="ml-1 text-blue-500">✓</span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-[#3F72AF] mb-3">{tweet.Content}</p>
        <div className="flex gap-6 text-sm text-gray-500">
          <span>💬 {tweet.Comments}</span>
          <span>🔄 {tweet.Retweets}</span>
          <span>❤️ {tweet.Likes}</span>
        </div>
        {Array.isArray(tweet.Tags) && tweet.Tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {tweet.Tags.map((tag, idx) => (
              <span
                key={idx}
                className="text-xs bg-[#DBE2EF] text-[#3F72AF] px-2 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const getSummaryForLeaning = (leaning) => {
    if (!topicData?.ideological_summaries) return null;
    return topicData.ideological_summaries[leaning] || `No summary available for ${leaning}-leaning tweets. This could be due to insufficient data or processing in progress.`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F9F7F7]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3F72AF]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F9F7F7]">
        <Card className="p-6">
          <CardTitle className="text-red-500 mb-4">Error</CardTitle>
          <CardDescription>{error}</CardDescription>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F7F7] p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-[#112D4E] mb-8">{topicData?.query || 'Analysis'}</h1>

        {/* Classification Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-[#112D4E]">Tweet Classification</CardTitle>
            <CardDescription>
              Analyze tweets based on their political leaning
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="left" className="w-full" onValueChange={setSelectedLeaning}>
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger
                  value="left"
                  className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                >
                  Left ({getTweetCount('left')})
                </TabsTrigger>
                <TabsTrigger
                  value="centre"
                  className="data-[state=active]:bg-purple-500 data-[state=active]:text-white"
                >
                  Centre ({getTweetCount('centre')})
                </TabsTrigger>
                <TabsTrigger
                  value="right"
                  className="data-[state=active]:bg-red-500 data-[state=active]:text-white"
                >
                  Right ({getTweetCount('right')})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="left">
                <Card className="mb-4 bg-blue-50">
                  <CardContent className="pt-6">
                    <p className="text-[#3F72AF] italic">{getSummaryForLeaning('left')}</p>
                  </CardContent>
                </Card>
                <ScrollArea className="h-[600px]">
                  {getFilteredTweets('left').map((tweet, index) => (
                    <TweetCard key={index} tweet={tweet} />
                  ))}
                  {getFilteredTweets('left').length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      No left-leaning tweets found
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="centre">
                <Card className="mb-4 bg-purple-50">
                  <CardContent className="pt-6">
                    <p className="text-[#3F72AF] italic">{getSummaryForLeaning('centre')}</p>
                  </CardContent>
                </Card>
                <ScrollArea className="h-[600px]">
                  {getFilteredTweets('centre').map((tweet, index) => (
                    <TweetCard key={index} tweet={tweet} />
                  ))}
                  {getFilteredTweets('centre').length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      No centre-leaning tweets found
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="right">
                <Card className="mb-4 bg-red-50">
                  <CardContent className="pt-6">
                    <p className="text-[#3F72AF] italic">{getSummaryForLeaning('right')}</p>
                  </CardContent>
                </Card>
                <ScrollArea className="h-[600px]">
                  {getFilteredTweets('right').map((tweet, index) => (
                    <TweetCard key={index} tweet={tweet} />
                  ))}
                  {getFilteredTweets('right').length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      No right-leaning tweets found
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Historical Analysis Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-[#112D4E]">Historical Analysis</CardTitle>
            <CardDescription>
              Historical context and development of the topic
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-blue max-w-none">
              {historicalAnalysis ? (
                <div className="whitespace-pre-line text-[#3F72AF]">
                  {historicalAnalysis}
                </div>
              ) : (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3F72AF]"></div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Live News Feed Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-[#112D4E]">Live News Feed</CardTitle>
            <CardDescription>
              Latest news and updates related to this topic
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LiveNewsSection query={topicData?.query} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}