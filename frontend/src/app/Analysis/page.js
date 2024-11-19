'use client';
import { useState, useEffect } from "react";

export default function AnalysisPage() {
  const [historicalAnalysis, setHistoricalAnalysis] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('Fetching analysis...');
        const response = await fetch('/api/auth/historical-analysis');
        console.log('Response status:', response.status);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Received data:', data);
        
        if (!data.analysis) {
          throw new Error("No analysis data received");
        }

        setHistoricalAnalysis(data.analysis);
      } catch (err) {
        console.error("Error fetching analysis:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, []);

  return (
    <div className="min-h-screen bg-[#F9F7F7] p-8 flex flex-col lg:flex-row gap-4">
      {/* Left Side: Classification */}
      <div className="flex-1 bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-[#112D4E] mb-4">
          Classification
        </h2>
        <p className="text-[#3F72AF]">
          This is the classification section. Add your content related to classification here.
        </p>
      </div>

      {/* Right Side: Historical Analysis and Live News Channel */}
      <div className="flex flex-col gap-4 w-full lg:w-1/3">
        {/* Top Right: Historical Analysis */}
        <div className="flex-1 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-[#112D4E] mb-4">
            Historical Analysis
          </h2>

          <div className="text-[#3F72AF]">
            {loading && (
              <div className="flex items-center justify-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3F72AF]"></div>
              </div>
            )}
            {error && (
              <div className="text-red-600 p-4">
                <p>Error: {error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Retry
                </button>
              </div>
            )}
            {!loading && !error && historicalAnalysis && (
              <div className="whitespace-pre-line">{historicalAnalysis}</div>
            )}
          </div>
        </div>

        {/* Bottom Right: Live News Channel */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-[#112D4E] mb-4">
            Live News Channel
          </h2>
          <p className="text-[#3F72AF]">
            This is the live news channel section. Add live feeds or content here.
          </p>
        </div>
      </div>
    </div>
  );
}