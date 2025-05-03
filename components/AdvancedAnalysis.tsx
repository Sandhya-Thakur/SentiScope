// components/AdvancedAnalysis.tsx
'use client';

import { useState } from 'react';

interface AdvancedAnalysisProps {
  text: string;
  result: {
    sentiment: 'Positive' | 'Negative' | 'Neutral';
    confidence: number;
    confidence_level: string;
  } | null;
}

export default function AdvancedAnalysis({ text, result }: AdvancedAnalysisProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!result) return null;
  
  // This would be replaced with actual data from your model
  const getKeywords = () => {
    if (!text) return [];
    
    // Simple implementation - split cleaned text and get unique words
    // In a real app, you'd use your model to identify influential words
    const words = text.toLowerCase()
      .replace(/[^a-z\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter((word, index, self) => self.indexOf(word) === index)
      .slice(0, 5);
    
    return words;
  };
  
  const keywords = getKeywords();
  
  return (
    <div className="advancedContainer">
      <button 
        className="expandButton"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? 'Hide' : 'Show'} Advanced Analysis
      </button>
      
      {isExpanded && (
        <div className="advancedContent">
          <div className="section">
            <h4>Key Words</h4>
            <div className="keywordContainer">
              {keywords.length > 0 ? (
                keywords.map((word, index) => (
                  <span 
                    key={index} 
                    className={`keyword ${
                      result.sentiment === 'Positive' ? 'positiveKeyword' : 'negativeKeyword'
                    }`}
                  >
                    {word}
                  </span>
                ))
              ) : (
                <p>No significant keywords found.</p>
              )}
            </div>
          </div>
          
          <div className="section">
            <h4>Analysis Explanation</h4>
            <p>
              {result.sentiment === 'Positive' 
                ? result.confidence > 0.8 
                  ? "This text contains strongly positive language patterns." 
                  : "This text appears to be somewhat positive, but may contain mixed sentiments."
                : result.confidence > 0.8 
                  ? "This text contains strongly negative language patterns." 
                  : "This text appears to be somewhat negative, but may contain mixed sentiments."
              }
            </p>
          </div>
        </div>
      )}
    </div>
  );
}