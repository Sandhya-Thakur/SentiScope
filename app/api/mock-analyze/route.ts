// api/mock-analyze/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text } = body;
    
    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }
    
    // Mock sentiment analysis based on simple word matching
    const isPositive = /good|great|excellent|amazing|love|recommend/i.test(text);
    const isNegative = /bad|terrible|awful|hate|waste|garbage/i.test(text);
    
    let sentiment = 'Neutral';
    let confidence = 0.6;
    let confidence_level = 'moderate';
    
    if (isPositive && !isNegative) {
      sentiment = 'Positive';
      confidence = 0.85;
      confidence_level = 'high';
    } else if (isNegative && !isPositive) {
      sentiment = 'Negative';
      confidence = 0.85;
      confidence_level = 'high';
    }
    
    return NextResponse.json({
      text,
      sentiment,
      confidence,
      confidence_level
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}