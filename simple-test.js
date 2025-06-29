// Simple test to check if the server is running and APIs are accessible
import fetch from 'node-fetch';

const SERVER_PORT = 3001; // Updated to match the actual server port

async function testServer() {
  console.log('Testing server connectivity...');
  
  try {
    // Test basic connectivity
    const response = await fetch(`http://localhost:${SERVER_PORT}`);
    console.log('Server is running, status:', response.status);
    
    // Test transcript API with a different video
    console.log('\nTesting transcript API with different video...');
    const testVideos = [
      'kJQP7kiw5Fk', // Despacito
      'dQw4w9WgXcQ', // Rick Roll
      '9bZkp7q19f0'  // Gangnam Style
    ];
    
    for (const videoId of testVideos) {
      console.log(`\nTrying video: ${videoId}`);
      const transcriptResponse = await fetch(`http://localhost:${SERVER_PORT}/api/youtube-transcript`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId })
      });
      
      console.log(`Status: ${transcriptResponse.status}`);
      const transcriptData = await transcriptResponse.text();
      
      if (transcriptResponse.ok) {
        console.log('✅ Success! Transcript extracted.');
        const data = JSON.parse(transcriptData);
        console.log('Method used:', data.method);
        console.log('Transcript length:', data.length);
        console.log('Preview:', data.transcript.substring(0, 100) + '...');
        
        // Test analysis API with the extracted transcript
        console.log('\nTesting analysis API with extracted transcript...');
        const analysisResponse = await fetch(`http://localhost:${SERVER_PORT}/api/video-learn-analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            transcript: data.transcript,
            videoTitle: 'Test Video'
          })
        });
        
        console.log('Analysis API status:', analysisResponse.status);
        const analysisData = await analysisResponse.text();
        console.log('Analysis response (first 200 chars):', analysisData.substring(0, 200));
        
        return; // Success, exit early
      } else {
        console.log('❌ Failed:', transcriptData.substring(0, 200));
      }
    }
    
    console.log('\nAll test videos failed. This might be due to:');
    console.log('- No captions available on these videos');
    console.log('- Network connectivity issues');
    console.log('- YouTube API changes');
    console.log('- Missing Gemini API key (for analysis)');
    
  } catch (error) {
    console.error('Error testing server:', error.message);
  }
}

testServer(); 