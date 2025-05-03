// api/analyze/route.ts
import { exec } from 'child_process';
import { promisify } from 'util';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text } = body;
    
    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Get the absolute path to the analyze_sentiment.py script
    const scriptPath = path.join(process.cwd(), 'analyze_sentiment.py');
    
    // Use the full path to the Python script
    const command = `python3 "${scriptPath}" "${text.replace(/"/g, '\\"')}"`;
    console.log(`Executing command: ${command}`);
    
    const { stdout, stderr } = await execAsync(command);
    
    if (stderr && !stderr.includes('UserWarning')) {
      console.error('Error from Python script:', stderr);
      return NextResponse.json({ error: 'Error analyzing sentiment' }, { status: 500 });
    }
    
    console.log('Python script output:', stdout);
    const result = JSON.parse(stdout);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}