import React, { useState } from 'react';

export default function ClassificationToggle() {
  const [activeSection, setActiveSection] = useState('center');

  const getButtonStyles = (section) => {
    const baseStyle = "flex items-center justify-center w-1/3 py-2 font-semibold transition-colors duration-300";
    
    switch(section) {
      case 'left':
        return activeSection === 'left' 
          ? `${baseStyle} bg-blue-500 text-white` 
          : `${baseStyle} bg-gray-200 text-gray-600`;
      case 'center':
        return activeSection === 'center' 
          ? `${baseStyle} bg-gray-500 text-white` 
          : `${baseStyle} bg-gray-200 text-gray-600`;
      case 'right':
        return activeSection === 'right' 
          ? `${baseStyle} bg-red-500 text-white` 
          : `${baseStyle} bg-gray-200 text-gray-600`;
    }
  };

  const getSummaryBoxStyles = (section) => {
    switch(section) {
      case 'left':
        return "border-2 border-blue-500 rounded-lg p-4 mb-6 bg-blue-50 text-blue-900";
      case 'center':
        return "border-2 border-gray-500 rounded-lg p-4 mb-6 bg-gray-50 text-gray-900";
      case 'right':
        return "border-2 border-red-500 rounded-lg p-4 mb-6 bg-red-50 text-red-900";
    }
  };

  const sectionData = {
    left: {
      summary: "Binary classification represents a fundamental machine learning technique that divides data into two distinct categories, enabling precise decision-making in scenarios like spam detection, medical diagnosis, and fraud identification.",
      tweets: [
        {
          id: 1,
          text: "Binary classification: Transforming complex data into clear-cut decisions with remarkable precision.",
          author: "@MLExpert"
        },
        {
          id: 2,
          text: "Two-class models provide powerful insights by simplifying complex data into definitive outcomes.",
          author: "@DataScientist"
        }
      ]
    },
    center: {
      summary: "Multi-class classification expands computational capabilities by categorizing data into more than two groups, offering nuanced insights across diverse domains like image recognition, sentiment analysis, and document categorization.",
      tweets: [
        {
          id: 1,
          text: "Multi-class models unlock deeper understanding by enabling sophisticated data categorization.",
          author: "@AIResearcher"
        },
        {
          id: 2,
          text: "Beyond binary: Exploring the rich landscape of complex classification techniques.",
          author: "@TechInnovator"
        }
      ]
    },
    right: {
      summary: "Multi-label classification represents an advanced approach allowing data points to belong to multiple categories simultaneously, reflecting real-world complexity in domains like document tagging, image annotation, and social media content analysis.",
      tweets: [
        {
          id: 1,
          text: "Multi-label classification: Embracing the nuanced reality of interconnected data characteristics.",
          author: "@MachineLearningPro"
        },
        {
          id: 2,
          text: "Breaking traditional boundaries: When data defies single-category constraints.",
          author: "@DataInnovator"
        }
      ]
    }
  };

  const currentSection = sectionData[activeSection];

  return (
    <>
      <h2 className="text-2xl font-semibold text-[#112D4E] mb-4">Classification</h2>
      
      {/* Summary Box */}
      <div className={getSummaryBoxStyles(activeSection)}>
        <div className="text-center font-medium">
          {currentSection.summary}
        </div>
      </div>

      {/* Toggle Button - Centered */}
      <div className="flex w-1/2 mx-auto mb-6">
        <button 
          onClick={() => setActiveSection('left')} 
          className={getButtonStyles('left')}
        >
          Left
        </button>
        <button 
          onClick={() => setActiveSection('center')} 
          className={getButtonStyles('center')}
        >
          Center
        </button>
        <button 
          onClick={() => setActiveSection('right')} 
          className={getButtonStyles('right')}
        >
          Right
        </button>
      </div>

      {/* Tweet Sections */}
      <div className="space-y-4">
        {currentSection.tweets.map((tweet) => (
          <div 
            key={tweet.id} 
            className="border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <p className="text-gray-800 mb-2">{tweet.text}</p>
            <div className="text-sm text-gray-500">{tweet.author}</div>
          </div>
        ))}
      </div>
    </>
  );
}