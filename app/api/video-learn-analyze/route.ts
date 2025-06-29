import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

function withTimeout(promise: Promise<any>, ms: number) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Gemini API timed out')), ms)),
  ]);
}

// Helper function to parse the AI response more robustly
function parseAIResponse(aiResponse: string): { summary: string; quiz: any; title: string; keyPoints: string[]; difficulty: string; estimatedReadTime: string; tags: string[] } {
  console.log('Parsing AI response, length:', aiResponse.length);
  
  // Clean the response - remove any markdown formatting or extra text
  let cleanResponse = aiResponse.trim();
  
  console.log('Raw AI response preview:', cleanResponse.substring(0, 200));
  
  // Remove markdown code blocks if present
  cleanResponse = cleanResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '');
  cleanResponse = cleanResponse.replace(/```/g, '');
  
  // Remove any text before the first { and after the last }
  const firstBrace = cleanResponse.indexOf('{');
  const lastBrace = cleanResponse.lastIndexOf('}');
  
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleanResponse = cleanResponse.substring(firstBrace, lastBrace + 1);
  }
  
  console.log('Cleaned response preview:', cleanResponse.substring(0, 200));
  
  try {
    const parsed = JSON.parse(cleanResponse);
    
    // Validate required fields
    if (!parsed.title || !parsed.summary || !parsed.quiz || !parsed.quiz.questions) {
      throw new Error('Missing required fields in AI response');
    }
    
    // Check if content seems generic (fallback indicators)
    const genericIndicators = [
      'this video content covers various topics',
      'the transcript contains valuable information',
      'main concepts presented in the video',
      'general content analysis',
      'based on the general content',
      'this is a sample transcript',
      'educational purposes',
      'test the video analysis'
    ];
    
    const summaryLower = parsed.summary.toLowerCase();
    const isGeneric = genericIndicators.some(indicator => summaryLower.includes(indicator));
    
    if (isGeneric) {
      console.warn('AI generated generic content, this may indicate transcript processing issues');
      console.warn('Generic indicators found in summary');
    }
    
    // Validate quiz structure
    if (!Array.isArray(parsed.quiz.questions) || parsed.quiz.questions.length < 3) {
      throw new Error('Quiz must have at least 3 questions');
    }
    
    // Validate each question
    parsed.quiz.questions.forEach((q: any, i: number) => {
      if (!q.question || !Array.isArray(q.options) || q.options.length !== 4) {
        throw new Error(`Question ${i + 1} is invalid`);
      }
      if (typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer >= 4) {
        throw new Error(`Question ${i + 1} has invalid correctAnswer`);
      }
    });
    
    console.log('Successfully parsed AI response:', {
      title: parsed.title,
      summaryLength: parsed.summary.length,
      questionCount: parsed.quiz.questions.length,
      isGeneric: isGeneric
    });
    
    return {
      summary: parsed.summary,
      quiz: {
        id: 'video-quiz-' + Date.now(),
        title: parsed.title,
        questions: parsed.quiz.questions,
        difficulty_level: parsed.difficulty || 'medium',
        total_questions: parsed.quiz.questions.length,
        created_at: new Date().toISOString()
      },
      title: parsed.title,
      keyPoints: parsed.keyPoints || [],
      difficulty: parsed.difficulty || 'medium',
      estimatedReadTime: parsed.estimatedReadTime || '3-5 minutes',
      tags: parsed.tags || []
    };
    
  } catch (parseError) {
    console.error('JSON parsing failed:', parseError);
    console.error('Raw response that failed to parse:', cleanResponse);
    throw new Error(`Failed to parse AI response: ${parseError.message}`);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { transcript, videoTitle } = await req.json();
    
    if (!transcript || typeof transcript !== 'string' || transcript.length < 50) {
      return NextResponse.json({ 
        error: 'Transcript is missing or too short. Please provide a transcript with at least 50 characters.',
        details: `Received transcript length: ${transcript?.length || 0}`
      }, { status: 400 });
    }
    
    if (!genAI) {
      return NextResponse.json({ 
        error: 'Gemini API key not set. Please configure GEMINI_API_KEY in your environment variables.',
        details: 'Check your .env.local file and ensure GEMINI_API_KEY is properly set. You can get a free API key from https://makersuite.google.com/app/apikey'
      }, { status: 500 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // MUCH MORE SPECIFIC prompt that forces AI to analyze actual content
    const prompt = `You are an expert educational content creator. I will provide you with a video transcript, and you must create educational content based EXCLUSIVELY on what is actually said in that transcript.

CRITICAL INSTRUCTIONS:
1. READ THE ENTIRE TRANSCRIPT CAREFULLY
2. Base ALL content ONLY on what is actually discussed in the video
3. Do NOT use generic or placeholder content
4. Create specific questions about the actual topics mentioned
5. Write a summary that reflects the real content discussed

VIDEO TRANSCRIPT TO ANALYZE:
"""
${transcript}
"""

TASK: Create educational content based on the above transcript. Return ONLY a JSON object with this exact structure:

{
  "title": "Write a specific title based on the actual video content - what is this video really about?",
  "summary": "Write a detailed 3-4 paragraph summary of what is ACTUALLY discussed in this video. Include specific details, concepts, and information that are mentioned in the transcript. Do not write generic content.",
  "keyPoints": [
    "Extract 5 specific key points that are actually mentioned in the video",
    "These should be real takeaways from the transcript, not generic points",
    "Include actual details and concepts discussed",
    "Reference specific information from the video",
    "Make each point substantive and video-specific"
  ],
  "quiz": {
    "questions": [
      {
        "question": "Ask about something specifically mentioned in the video transcript",
        "options": ["Include the correct answer from the video", "Add plausible but incorrect option", "Add another incorrect option", "Add a final incorrect option"],
        "correctAnswer": 0,
        "explanation": "Explain why this is correct based on what was actually said in the video"
      },
      {
        "question": "Ask about a different specific topic from the transcript",
        "options": ["Wrong answer", "Correct answer based on video content", "Wrong answer", "Wrong answer"],
        "correctAnswer": 1,
        "explanation": "Reference the specific part of the video that supports this answer"
      },
      {
        "question": "Test understanding of a concept actually explained in the video",
        "options": ["Wrong answer", "Wrong answer", "Correct answer from transcript", "Wrong answer"],
        "correctAnswer": 2,
        "explanation": "Explain the concept as it was presented in the video"
      },
      {
        "question": "Ask about details or examples given in the video",
        "options": ["Wrong answer", "Wrong answer", "Wrong answer", "Correct answer from video"],
        "correctAnswer": 3,
        "explanation": "Reference the specific example or detail mentioned"
      },
      {
        "question": "Test comprehension of the main message or conclusion",
        "options": ["Correct answer reflecting video's main point", "Plausible but wrong", "Clearly wrong", "Unrelated wrong answer"],
        "correctAnswer": 0,
        "explanation": "Summarize why this captures the video's main message"
      }
    ]
  },
  "difficulty": "beginner|intermediate|advanced",
  "estimatedReadTime": "3-5 minutes",
  "tags": ["tag1", "tag2", "tag3"]
}

MANDATORY REQUIREMENTS:
- Extract real information from the transcript
- All questions must test knowledge of content actually in the video
- Summary must describe what the video is actually about
- Key points must be specific to this video's content
- Do NOT generate generic educational content
- Return ONLY the JSON, no other text
- Ensure correctAnswer values are integers 0-3`;

    let aiResponse = '';
    let parsed = null;
    
    try {
      console.log('Sending request to Gemini API...');
      console.log('Transcript length:', transcript.length);
      console.log('Transcript preview:', transcript.substring(0, 200) + '...');
      
      const result = await withTimeout(model.generateContent(prompt), 45000);
      const response = await result.response;
      aiResponse = await response.text();
      
      if (!aiResponse || aiResponse.trim().length === 0) {
        throw new Error('Gemini returned empty response');
      }
      
      console.log('Received response from Gemini API, length:', aiResponse.length);
      console.log('Raw AI response preview:', aiResponse.substring(0, 500) + '...');
      
      // Parse the AI response
      parsed = parseAIResponse(aiResponse);
      
    } catch (err) {
      console.error('AI Generation Error:', err);
      console.error('Error details:', {
        message: err instanceof Error ? err.message : String(err),
        transcriptLength: transcript.length,
        transcriptPreview: transcript.substring(0, 100)
      });
      
      // Instead of fallback, return the error so we can debug
      return NextResponse.json({
        error: 'AI content generation failed',
        details: err instanceof Error ? err.message : String(err),
        transcriptReceived: transcript.length > 0,
        transcriptLength: transcript.length,
        transcriptPreview: transcript.substring(0, 200) + '...',
        suggestions: [
          'Check if transcript contains meaningful content',
          'Verify GEMINI_API_KEY is valid',
          'Try with a different video',
          'Check Gemini API quota and rate limits'
        ]
      }, { status: 500 });
    }
    
    // Return the parsed content
    return NextResponse.json({
      success: true,
      parsed,
      rawResponse: aiResponse.substring(0, 1000) + '...', // Include first 1000 chars for debugging
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Video learn analyze API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 