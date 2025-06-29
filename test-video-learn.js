// Test script for improved Video Learn functionality
// Run with: node test-video-learn.js

const testVideoId = '9bZkp7q19f0'; // PSY - GANGNAM STYLE - has captions
const testVideoUrl = 'https://www.youtube.com/watch?v=9bZkp7q19f0';
const SERVER_PORT = 3001; // Updated to match the actual server port

async function testTranscriptAPI() {
  console.log('🧪 Testing improved YouTube Transcript API...');
  console.log(`Testing video: ${testVideoUrl}`);
  
  try {
    const response = await fetch(`http://localhost:${SERVER_PORT}/api/youtube-transcript`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoId: testVideoId })
    });
    
    const data = await response.json();
    console.log('Transcript API Response:', {
      status: response.status,
      success: response.ok,
      hasTranscript: !!data.transcript,
      transcriptLength: data.transcript?.length || 0,
      method: data.method,
      error: data.error,
      details: data.details
    });
    
    if (response.ok && data.transcript) {
      console.log('✅ Transcript API working!');
      console.log('Method used:', data.method);
      console.log('Transcript preview:', data.transcript.substring(0, 200) + '...');
    return data.transcript;
    } else {
      console.log('❌ Transcript API failed:', data.error);
      if (data.details) {
        console.log('Error details:', data.details);
      }
      return null;
    }
  } catch (error) {
    console.error('❌ Transcript API Error:', error.message);
    return null;
  }
}

async function testVideoAnalysisAPI(transcript) {
  console.log('\n🧪 Testing Video Learn Analysis API...');
  try {
    const response = await fetch(`http://localhost:${SERVER_PORT}/api/video-learn-analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        transcript: transcript,
        videoTitle: 'Test Video'
      })
    });
    
    const data = await response.json();
    console.log('Analysis API Response:', {
      status: response.status,
      success: response.ok,
      hasResult: !!data.result,
      hasParsed: !!data.parsed,
      error: data.error,
      details: data.details
    });
    
    if (response.ok && data.parsed) {
      console.log('✅ Analysis API working!');
      console.log('Summary length:', data.parsed.summary?.length || 0);
      console.log('Quiz questions:', data.parsed.quiz?.questions?.length || 0);
      console.log('Title:', data.parsed.title);
      
      // Show a preview of the summary
      if (data.parsed.summary) {
        console.log('\n📝 Summary Preview:');
        console.log(data.parsed.summary.substring(0, 300) + '...');
      }
      
      // Show quiz questions
      if (data.parsed.quiz?.questions) {
        console.log('\n❓ Quiz Questions:');
        data.parsed.quiz.questions.forEach((q, i) => {
          console.log(`Q${i + 1}: ${q.question}`);
          console.log(`  Options: ${q.options.join(', ')}`);
          console.log(`  Correct: ${q.correctAnswer + 1}`);
        });
      }
      
      return true;
    } else {
      console.log('❌ Analysis API failed:', data.error);
      if (data.details) {
        console.log('Details:', data.details);
      }
      if (data.rawResponse) {
        console.log('Raw response preview:', data.rawResponse);
      }
      return false;
    }
  } catch (error) {
    console.error('❌ Analysis API Error:', error.message);
    return false;
  }
}

async function testURLInput() {
  console.log('\n🧪 Testing URL input functionality...');
  try {
    const response = await fetch(`http://localhost:${SERVER_PORT}/api/youtube-transcript`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: testVideoUrl })
    });
    
    const data = await response.json();
    console.log('URL Input Test:', {
      status: response.status,
      success: response.ok,
      hasTranscript: !!data.transcript,
      videoId: data.videoId,
      error: data.error
    });
    
    if (response.ok && data.transcript) {
      console.log('✅ URL input working!');
      return true;
    } else {
      console.log('❌ URL input failed:', data.error);
      return false;
    }
  } catch (error) {
    console.error('❌ URL Input Error:', error.message);
    return false;
  }
}

async function testWithDummyTranscript() {
  console.log('\n🧪 Testing with dummy transcript (no Gemini API needed)...');
  try {
    const dummyTranscript = `This is a test transcript for the video analysis API. 
    The video discusses various topics including technology, education, and innovation. 
    The speaker explains key concepts and provides examples throughout the presentation. 
    This transcript is used to test the video analysis functionality without requiring 
    actual YouTube video processing.`;
    
    const response = await fetch(`http://localhost:${SERVER_PORT}/api/video-learn-analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        transcript: dummyTranscript,
        videoTitle: 'Dummy Test Video'
      })
    });
    
    const data = await response.json();
    console.log('Dummy Test Response:', {
      status: response.status,
      success: response.ok,
      hasResult: !!data.result,
      hasParsed: !!data.parsed,
      error: data.error
    });
    
    if (response.ok && data.parsed) {
      console.log('✅ Dummy test working!');
      return true;
    } else {
      console.log('❌ Dummy test failed:', data.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Dummy Test Error:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting Improved Video Learn API Tests...\n');
  console.log(`Make sure your development server is running on http://localhost:${SERVER_PORT}\n`);
  
  let testsPassed = 0;
  let totalTests = 4;
  
  // Test 1: Transcript API
  const transcript = await testTranscriptAPI();
  if (transcript) {
    testsPassed++;
    
    // Test 2: Analysis API
    const analysisSuccess = await testVideoAnalysisAPI(transcript);
    if (analysisSuccess) {
      testsPassed++;
    }
  }
  
  // Test 3: URL Input
  const urlSuccess = await testURLInput();
  if (urlSuccess) {
    testsPassed++;
  }
  
  // Test 4: Dummy transcript (no Gemini API needed)
  const dummySuccess = await testWithDummyTranscript();
  if (dummySuccess) {
    testsPassed++;
  }
  
  console.log(`\n📊 Test Results:`);
  console.log(`✅ Passed: ${testsPassed}/${totalTests}`);
  console.log(`❌ Failed: ${totalTests - testsPassed}/${totalTests}`);
  
  if (testsPassed === totalTests) {
    console.log('\n🎉 All tests passed! The Video Learn functionality is working perfectly.');
    console.log('\n💡 You can now:');
    console.log('   - Paste YouTube URLs in the Video Learn tab');
    console.log('   - Watch videos and get automatic summaries');
    console.log('   - Take quizzes generated from video content');
  } else if (testsPassed > 0) {
    console.log('\n⚠️  Some tests passed. The functionality works but may have limitations.');
    console.log('\n🔧 Troubleshooting tips:');
    console.log('   - Check your GEMINI_API_KEY in .env.local');
    console.log('   - Ensure the development server is running');
    console.log('   - Try different YouTube videos with captions');
  } else {
    console.log('\n💥 All tests failed. Check your configuration and server setup.');
    console.log('\n🔧 Setup checklist:');
    console.log('   - GEMINI_API_KEY in .env.local');
    console.log(`   - Development server running on port ${SERVER_PORT}`);
    console.log('   - All dependencies installed (pnpm install)');
  }
}

// Run tests if this file is executed directly
if (typeof window === 'undefined') {
  runTests().catch(console.error);
} 