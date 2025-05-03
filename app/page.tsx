//app/page.tsx
'use client';

import { useState, ChangeEvent } from 'react';
import Link from 'next/link';
import AdvancedAnalysis from '../components/AdvancedAnalysis';

interface SentimentResult {
  sentiment: 'Positive' | 'Negative' | 'Neutral';
  confidence: number;
  confidence_level: string;
}

export default function Home() {
  const [text, setText] = useState<string>('');
  const [result, setResult] = useState<SentimentResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [examples] = useState<string[]>([
    "This product exceeded my expectations. Highly recommend!",
    "Waste of money. Don't buy this garbage.",
    "It was okay, nothing special."
  ]);
  
  const analyzeText = async (inputText: string) => {
    if (!inputText.trim()) {
      setError('Please enter some text to analyze');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: inputText }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to analyze text');
      }
      
      const data = await response.json();
      setResult(data as SentimentResult);
    } catch (err) {
      setError((err as Error).message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };
  
  return (
    <div className="container">
      <main className="main">
        <div className="header">
          <h1 className="title">
            Welcome to <span className="highlight">SentiScope</span>
          </h1>
          
          {/* Batch analysis link positioned below the title */}
          <div className="batchLink">
            <Link href="/batch-analysis">
              Go to Batch Analysis →
            </Link>
          </div>
        </div>
        
        <p className="description">
          Analyze the sentiment of any text using AI
        </p>
        
        <div className="card">
          <textarea
            className="textarea"
            value={text}
            onChange={handleTextChange}
            placeholder="Enter text to analyze..."
            rows={5}
          />
          
          <button
            className="button"
            onClick={() => analyzeText(text)}
            disabled={isLoading}
          >
            {isLoading ? 'Analyzing...' : 'Analyze Sentiment'}
          </button>
          
          {error && <div className="error">{error}</div>}
          
          {result && (
            <div className={`result ${
              result.sentiment === 'Positive' ? 'positive' : 'negative'
            }`}>
              <h3>Analysis Result</h3>
              <p><strong>Sentiment:</strong> {result.sentiment}</p>
              <p><strong>Confidence:</strong> {(result.confidence * 100).toFixed(2)}% ({result.confidence_level})</p>
              <div className="progressContainer">
                <div
                  className={`progressBar ${
                    result.sentiment === 'Positive' ? 'positiveBar' : 'negativeBar'
                  }`}
                  style={{ width: `${result.confidence * 100}%` }}
                ></div>
              </div>
              
              {/* Add the AdvancedAnalysis component */}
              <AdvancedAnalysis text={text} result={result} />
            </div>
          )}
        </div>
        
        <div className="examples">
          <h3>Try these examples:</h3>
          <div className="exampleButtons">
            {examples.map((example, index) => (
              <button
                key={index}
                className="exampleButton"
                onClick={() => {
                  setText(example);
                  analyzeText(example);
                }}
              >
                {example.length > 40 ? example.substring(0, 40) + '...' : example}
              </button>
            ))}
          </div>
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