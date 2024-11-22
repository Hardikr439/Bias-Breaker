'use client';
import { useState, useEffect } from "react";
import LiveNewsSection from "./Components/LiveNewsSection";
import ClassificationToggle from "./Components/ClassificationToggle";

export default function AnalysisPage() {
  const [historicalAnalysis, setHistoricalAnalysis] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch("/api/auth/historical-analysis");

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || `HTTP error! status: ${response.status}`
          );
        }

        const data = await response.json();

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
    <div className="min-h-screen bg-gradient-to-br from-[#E4F0F6] to-[#D1E8F0] p-8 flex flex-col lg:flex-row gap-4">
      {/* Left Side: Classification */}
      <div className="flex-1 bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/30 p-6 transform transition-all hover:scale-[1.02]">
       <ClassificationToggle/>
      </div>

      {/* Right Side: Historical Analysis and Live News Channel */}
      <div className="flex flex-col gap-4 w-full lg:w-1/3">
        {/* Top Right: Historical Analysis */}
        <div className="flex-1 bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/30 p-6 transform transition-all hover:scale-[1.02]">
          <h2 className="text-3xl font-extrabold text-[#1A5F7A] mb-4 tracking-wide">
            Historical Analysis
          </h2>
          
          <div className="text-[#2C7DA0] font-medium">
            {loading && (
              <div className="flex items-center justify-center p-4">
                <div className="animate-spin rounded-full h-10 w-10 border-b-3 border-[#2C7DA0]"></div>
              </div>
            )}
            {error && (
              <div className="text-red-600 p-4 bg-red-50 rounded-lg">
                <p className="font-semibold">Error: {error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-2 px-4 py-2 bg-[#2C7DA0] text-white rounded-md hover:bg-[#1A5F7A] transition-colors"
                >
                  Retry
                </button>
              </div>
            )}
            {!loading && !error && historicalAnalysis && (
              <div className="whitespace-pre-line leading-relaxed">
                {historicalAnalysis}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Right: Live News Channel */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/30 p-6 transform transition-all hover:scale-[1.02]">
          <LiveNewsSection />
        </div>
      </div>
    </div>
  );
}