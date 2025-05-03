// app/batch-analysis/page.tsx
'use client';

import Link from 'next/link';
import { useState, ChangeEvent } from 'react';

interface SentimentResult {
  sentiment: 'Positive' | 'Negative' | 'Neutral';
  confidence: number;
  confidence_level: string;
  text: string; // Store the original text
}

interface SummaryData {
  total: number;
  positive: number;
  negative: number;
  positivePercentage: number;
  negativePercentage: number;
}

export default function BatchAnalysis() {
  const [texts, setTexts] = useState<string>('');
  const [results, setResults] = useState<SentimentResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<SummaryData | null>(null);

  const analyzeBatch = async () => {
    if (!texts.trim()) {
      setError('Please enter some texts to analyze');
      return;
    }

    // Split the text by new lines, filtering out empty lines
    const textArray = texts.split('\n').filter(t => t.trim());
    
    if (textArray.length === 0) {
      setError('No valid texts found');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults([]);

    try {
      const batchResults: SentimentResult[] = [];
      
      // Process each text sequentially
      for (const text of textArray) {
        if (!text.trim()) continue;
        
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text }),
        });

        if (!response.ok) {
          throw new Error(`Failed to analyze text: ${text}`);
        }

        const data = await response.json();
        // Add the original text to the result
        batchResults.push({
          ...data,
          text: text
        });
      }

      setResults(batchResults);
      
      // Generate summary
      const positiveCount = batchResults.filter(r => r.sentiment === 'Positive').length;
      const negativeCount = batchResults.filter(r => r.sentiment === 'Negative').length;
      
      setSummary({
        total: batchResults.length,
        positive: positiveCount,
        negative: negativeCount,
        positivePercentage: (positiveCount / batchResults.length) * 100,
        negativePercentage: (negativeCount / batchResults.length) * 100,
      });
      
    } catch (err) {
      setError((err as Error).message || 'An error occurred during batch analysis');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setTexts(e.target.value);
  };

  return (
    <div className="container">
      <main className="main">
        <h1 className="title">
          <span className="highlight">Batch Analysis</span>
        </h1>

        <div className="navigation">
          <Link href="/">
            &larr; Back to Single Analysis
          </Link>
        </div>

        <p className="description">
          Analyze multiple texts at once (one per line)
        </p>

        <div className="card">
          <textarea
            className="textarea"
            value={texts}
            onChange={handleTextChange}
            placeholder="Enter multiple texts to analyze (one per line)..."
            rows={10}
          />
          
          <button
            className="button"
            onClick={analyzeBatch}
            disabled={isLoading}
          >
            {isLoading ? 'Analyzing...' : 'Analyze Batch'}
          </button>

          {error && <div className="error">{error}</div>}
          
          {summary && (
            <div className="summary">
              <h3>Batch Analysis Summary</h3>
              <div className="summaryContent">
                <div className="summaryItem">
                  <span>Total Texts:</span>
                  <strong>{summary.total}</strong>
                </div>
                <div className="summaryItem">
                  <span>Positive:</span>
                  <strong>{summary.positive} ({summary.positivePercentage.toFixed(1)}%)</strong>
                </div>
                <div className="summaryItem">
                  <span>Negative:</span>
                  <strong>{summary.negative} ({summary.negativePercentage.toFixed(1)}%)</strong>
                </div>
              </div>
              
              <div className="chartContainer">
                <div className="chartBar">
                  <div 
                    className="positiveBar"
                    style={{ width: `${summary.positivePercentage}%` }}
                  ></div>
                  <div 
                    className="negativeBar"
                    style={{ width: `${summary.negativePercentage}%` }}
                  ></div>
                </div>
                <div className="chartLabels">
                  <span>Positive</span>
                  <span>Negative</span>
                </div>
              </div>
            </div>
          )}

          {results.length > 0 && (
            <div className="results">
              <h3>Individual Results</h3>
              <div className="resultsList">
                {results.map((result, index) => (
                  <div 
                    key={index} 
                    className={`resultItem ${
                      result.sentiment === 'Positive' ? 'positiveResult' : 'negativeResult'
                    }`}
                  >
                    <p className="resultText">{result.text}</p>
                    <div className="resultDetails">
                      <span className="sentiment">{result.sentiment}</span>
                      <span className="confidence">
                        {(result.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="footer">
        <p>
          SentiScope v1.0 - Sentiment Analysis Agent
        </p>
      </footer>
    </div>
  );
}