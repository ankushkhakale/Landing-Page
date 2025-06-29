import { NextRequest, NextResponse } from 'next/server';

// Import the correct YouTube transcript package
let YoutubeTranscript: any = null;
try {
  // Try the new youtube-transcript package first
  YoutubeTranscript = require('youtube-transcript');
} catch (error) {
  console.warn('youtube-transcript not available, trying youtube-transcript-api');
  try {
    YoutubeTranscript = require('youtube-transcript-api');
  } catch (error2) {
    console.warn('youtube-transcript-api not available, will use fallback methods');
  }
}

// Helper function to extract video ID from various YouTube URL formats
function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
    /youtu\.be\/([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
}

// Method 1: Use youtube-transcript package (newer, more reliable)
async function extractTranscriptWithPackage(videoId: string): Promise<string> {
  if (!YoutubeTranscript) {
    throw new Error('YouTube transcript package not available');
  }
  
  try {
    console.log(`Using youtube-transcript package for video: ${videoId}`);
    
    // Try different methods to call the API
    let transcriptList;
    
    if (YoutubeTranscript.fetchTranscript) {
      // New youtube-transcript package
      transcriptList = await YoutubeTranscript.fetchTranscript(videoId);
    } else if (YoutubeTranscript.default && YoutubeTranscript.default.fetchTranscript) {
      // youtube-transcript-api package
      transcriptList = await YoutubeTranscript.default.fetchTranscript(videoId, {
        lang: 'en',
        country: 'US'
      });
    } else if (typeof YoutubeTranscript === 'function') {
      // Direct function call
      transcriptList = await YoutubeTranscript(videoId, {
        lang: 'en',
        country: 'US'
      });
    } else {
      throw new Error('fetchTranscript method not found in YouTube transcript package');
    }
    
    if (!transcriptList || transcriptList.length === 0) {
      throw new Error('No transcript found with YouTube transcript package');
    }
    
    // Combine all transcript parts
    const transcript = transcriptList
      .map((item: any) => item.text || item)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    if (!transcript || transcript.length < 20) {
      throw new Error('Extracted transcript is too short');
    }
    
    console.log(`Successfully extracted transcript with package (${transcript.length} characters)`);
    return transcript;
    
  } catch (error) {
    console.error('YouTube transcript package failed:', error);
    throw error;
  }
}

// Method 2: Fallback to manual extraction (improved version)
async function extractTranscriptManual(videoId: string): Promise<string> {
  try {
    console.log(`Using manual extraction for video: ${videoId}`);
    
    const res = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0'
      }
    });
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    
    const html = await res.text();
    
    // Try multiple patterns to find the player response
    const patterns = [
      /ytInitialPlayerResponse\s*=\s*({.+?})\s*;/,
      /ytInitialPlayerResponse\s*=\s*({.+?});/,
      /ytInitialPlayerResponse\s*=\s*({.+?})\s*$/m,
      /var\s+ytInitialPlayerResponse\s*=\s*({.+?});/,
      /window\["ytInitialPlayerResponse"\]\s*=\s*({.+?});/
    ];
    
    let playerResponse = null;
    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match) {
        try {
          playerResponse = JSON.parse(match[1]);
          break;
        } catch (e) {
          console.log('Failed to parse player response with pattern:', pattern);
          continue;
        }
      }
    }
    
    if (!playerResponse) {
      throw new Error('Could not extract player response from YouTube page');
    }
    
    // Extract caption tracks
    const tracks = playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
    if (!tracks || !tracks.length) {
      throw new Error('No caption tracks found in player response');
    }
    
    console.log(`Found ${tracks.length} caption tracks`);
    
    // Prefer English, then auto-generated, then any available
    let track = tracks.find((t: any) => t.languageCode === 'en' && !t.kind?.includes('asr'));
    if (!track) {
      track = tracks.find((t: any) => t.languageCode === 'en');
    }
    if (!track) {
      track = tracks.find((t: any) => !t.kind?.includes('asr'));
    }
    if (!track) {
      track = tracks[0];
    }
    
    console.log(`Selected track: ${track.languageCode} (${track.kind || 'manual'})`);
    
    // Fetch the transcript
    const transcriptUrl = track.baseUrl + '&fmt=json3';
    const transcriptRes = await fetch(transcriptUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    if (!transcriptRes.ok) {
      throw new Error(`Failed to fetch transcript: ${transcriptRes.status}`);
    }
    
    const transcriptJson = await transcriptRes.json();
    
    if (!transcriptJson.events || !Array.isArray(transcriptJson.events)) {
      throw new Error('Invalid transcript JSON structure');
    }
    
    // Extract text from events
    const transcript = transcriptJson.events
      .filter((x: any) => x.segs && Array.isArray(x.segs))
      .map((x: any) => 
        x.segs
          .filter((seg: any) => seg.utf8)
          .map((seg: any) => seg.utf8)
          .join('')
      )
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    if (!transcript || transcript.length < 20) {
      throw new Error('Extracted transcript is too short');
    }
    
    console.log(`Successfully extracted transcript manually (${transcript.length} characters)`);
    return transcript;
    
  } catch (error) {
    console.error('Manual extraction failed:', error);
    throw error;
  }
}

// Method 3: XML endpoint fallback
async function extractTranscriptXML(videoId: string): Promise<string> {
  try {
    console.log(`Using XML endpoint for video: ${videoId}`);
    
    const res = await fetch(`https://www.youtube.com/api/timedtext?v=${videoId}&lang=en`);
    
    if (!res.ok) {
      throw new Error(`XML endpoint failed: ${res.status}`);
    }
    
    const xml = await res.text();
    
    if (!xml.includes('<text')) {
      throw new Error('No transcript data in XML response');
    }
    
    // Simple XML parsing
    const textMatches = xml.match(/<text[^>]*>(.*?)<\/text>/g);
    if (!textMatches || textMatches.length === 0) {
      throw new Error('No text elements found in XML');
    }
    
    const transcript = textMatches
      .map(match => match.replace(/<text[^>]*>(.*?)<\/text>/, '$1'))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    if (!transcript || transcript.length < 20) {
      throw new Error('Extracted transcript is too short');
    }
    
    console.log(`Successfully extracted transcript via XML (${transcript.length} characters)`);
    return transcript;
    
  } catch (error) {
    console.error('XML extraction failed:', error);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { videoId, url } = body;
    
    // Extract video ID from URL if provided
    let finalVideoId = videoId;
    if (url && !videoId) {
      finalVideoId = extractVideoId(url);
      if (!finalVideoId) {
        return NextResponse.json({ 
          error: 'Invalid YouTube URL. Please provide a valid YouTube video URL.',
          details: 'Supported formats: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID'
        }, { status: 400 });
      }
    }
    
    if (!finalVideoId) {
      return NextResponse.json({ 
        error: 'Video ID is required. Please provide either videoId or url parameter.',
        details: 'Example: { "videoId": "dQw4w9WgXcQ" } or { "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ" }'
      }, { status: 400 });
    }
    
    console.log(`Processing video ID: ${finalVideoId}`);
    
    let transcript = '';
    let method = '';
    let errors: string[] = [];
    
    // Try Method 1: YouTube transcript package
    try {
      transcript = await extractTranscriptWithPackage(finalVideoId);
      method = 'package';
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.log('Method 1 failed:', errorMsg);
      errors.push(`Package method: ${errorMsg}`);
    }
    
    // Try Method 2: Manual extraction
    if (!transcript) {
      try {
        transcript = await extractTranscriptManual(finalVideoId);
        method = 'manual';
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.log('Method 2 failed:', errorMsg);
        errors.push(`Manual method: ${errorMsg}`);
      }
    }
    
    // Try Method 3: XML endpoint
    if (!transcript) {
      try {
        transcript = await extractTranscriptXML(finalVideoId);
        method = 'xml';
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.log('Method 3 failed:', errorMsg);
        errors.push(`XML method: ${errorMsg}`);
      }
    }
    
    if (!transcript) {
      return NextResponse.json({ 
        error: 'Failed to extract transcript from video',
        details: 'All transcript extraction methods failed',
        videoId: finalVideoId,
        attemptedMethods: errors,
        troubleshooting: [
          'Ensure the video has captions/subtitles enabled',
          'Try a different video with English captions',
          'Check if the video is publicly accessible',
          'Verify the video ID is correct',
          'Some videos may not have available transcripts due to YouTube restrictions'
        ]
      }, { status: 404 });
    }
    
    // Count segments (approximate)
    const segmentCount = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    
    return NextResponse.json({
      success: true,
      transcript,
      method,
      videoId: finalVideoId,
      segmentCount,
      length: transcript.length
    });
    
  } catch (error) {
    console.error('YouTube transcript API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 