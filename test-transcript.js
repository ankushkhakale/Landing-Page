// Test script for improved YouTube transcript extraction
// Run with: node test-transcript.js

const testVideos = [
  'dQw4w9WgXcQ', // Rick Roll - has captions
  '9bZkp7q19f0', // PSY - GANGNAM STYLE - has captions
  'kJQP7kiw5Fk', // Luis Fonsi - Despacito - has captions
];

async function testTranscriptAPI(videoId) {
  console.log(`\n🧪 Testing transcript extraction for video: ${videoId}`);
  console.log(`URL: https://www.youtube.com/watch?v=${videoId}`);
  
  try {
    const response = await fetch('http://localhost:3000/api/youtube-transcript', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoId })
    });
    
    const data = await response.json();
    
    console.log('Response Status:', response.status);
    console.log('Response OK:', response.ok);
    
    if (response.ok) {
      console.log('✅ Success!');
      console.log('Method used:', data.method);
      console.log('Transcript length:', data.length);
      console.log('Transcript preview:', data.transcript.substring(0, 150) + '...');
    } else {
      console.log('❌ Failed!');
      console.log('Error:', data.error);
      if (data.details) {
        console.log('Details:', data.details);
      }
    }
    
    return response.ok;
  } catch (error) {
    console.error('❌ Network error:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Testing Improved YouTube Transcript Extraction\n');
  console.log('Make sure your development server is running on http://localhost:3000\n');
  
  let successCount = 0;
  let totalTests = testVideos.length;
  
  for (const videoId of testVideos) {
    const success = await testTranscriptAPI(videoId);
    if (success) successCount++;
    
    // Wait a bit between tests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\n📊 Test Results:`);
  console.log(`✅ Successful: ${successCount}/${totalTests}`);
  console.log(`❌ Failed: ${totalTests - successCount}/${totalTests}`);
  
  if (successCount === totalTests) {
    console.log('\n🎉 All tests passed! The transcript extraction is working well.');
  } else if (successCount > 0) {
    console.log('\n⚠️  Some tests passed. The extraction works but may have limitations.');
  } else {
    console.log('\n💥 All tests failed. Check your server and API configuration.');
  }
}

// Run tests if this file is executed directly
if (typeof window === 'undefined') {
  runTests().catch(console.error);
} 