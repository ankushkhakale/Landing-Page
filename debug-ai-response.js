// Debug script to identify exactly where the Video Learn problem occurs
// Run with: node debug-ai-response.js

const testVideos = [
  { id: 'dQw4w9WgXcQ', name: 'Rick Roll', expectedContent: ['rick astley', 'never gonna give you up', '1987', 'meme'] },
  { id: '9bZkp7q19f0', name: 'Gangnam Style', expectedContent: ['psy', 'k-pop', 'gangnam', 'dance', '2012'] },
  { id: 'kJQP7kiw5Fk', name: 'Despacito', expectedContent: ['luis fonsi', 'daddy yankee', 'spanish', 'reggaeton', '2017'] }
];

const SERVER_PORT = 3002;

async function debugTranscriptExtraction(videoId, videoName) {
  console.log(`\n🔍 DEBUGGING TRANSCRIPT EXTRACTION: ${videoName} (${videoId})`);
  console.log('='.repeat(60));
  
  try {
    const response = await fetch(`http://localhost:${SERVER_PORT}/api/youtube-transcript`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoId })
    });
    
    const data = await response.json();
    
    console.log('📊 TRANSCRIPT API RESPONSE:');
    console.log('- Status:', response.status);
    console.log('- Success:', response.ok);
    console.log('- Method used:', data.method);
    console.log('- Transcript length:', data.transcript?.length || 0);
    console.log('- Has transcript:', !!data.transcript);
    
    if (response.ok && data.transcript) {
      console.log('\n📝 TRANSCRIPT PREVIEW (first 500 chars):');
      console.log('"' + data.transcript.substring(0, 500) + '..."');
      
      console.log('\n🔍 CONTENT ANALYSIS:');
      const transcriptLower = data.transcript.toLowerCase();
      
      // Check for expected content
      const expectedContent = testVideos.find(v => v.id === videoId)?.expectedContent || [];
      console.log('- Expected content check:');
      expectedContent.forEach(content => {
        const found = transcriptLower.includes(content.toLowerCase());
        console.log(`  ${found ? '✅' : '❌'} "${content}": ${found ? 'FOUND' : 'NOT FOUND'}`);
      });
      
      // Check for generic/dummy indicators
      const genericIndicators = [
        'sample transcript',
        'educational purposes',
        'test the video analysis',
        'various topics',
        'technology, education, and innovation'
      ];
      
      console.log('\n- Generic content check:');
      genericIndicators.forEach(indicator => {
        const found = transcriptLower.includes(indicator.toLowerCase());
        console.log(`  ${found ? '⚠️' : '✅'} "${indicator}": ${found ? 'GENERIC CONTENT DETECTED' : 'OK'}`);
      });
      
      return data.transcript;
    } else {
      console.log('\n❌ TRANSCRIPT EXTRACTION FAILED:');
      console.log('- Error:', data.error);
      console.log('- Details:', data.details);
      if (data.troubleshooting) {
        console.log('- Troubleshooting tips:');
        data.troubleshooting.forEach(tip => console.log(`  • ${tip}`));
      }
      return null;
    }
  } catch (error) {
    console.error('❌ TRANSCRIPT API ERROR:', error.message);
    return null;
  }
}

async function debugAIAnalysis(transcript, videoName) {
  console.log(`\n🤖 DEBUGGING AI ANALYSIS: ${videoName}`);
  console.log('='.repeat(60));
  
  try {
    const response = await fetch(`http://localhost:${SERVER_PORT}/api/video-learn-analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        transcript: transcript,
        videoTitle: videoName
      })
    });
    
    const data = await response.json();
    
    console.log('📊 AI ANALYSIS API RESPONSE:');
    console.log('- Status:', response.status);
    console.log('- Success:', response.ok);
    console.log('- Has parsed content:', !!data.parsed);
    console.log('- Has raw response:', !!data.rawResponse);
    
    if (response.ok && data.parsed) {
      console.log('\n📋 PARSED CONTENT ANALYSIS:');
      console.log('- Title:', data.parsed.title);
      console.log('- Summary length:', data.parsed.summary?.length || 0);
      console.log('- Quiz questions:', data.parsed.quiz?.questions?.length || 0);
      
      console.log('\n📝 SUMMARY PREVIEW (first 300 chars):');
      console.log('"' + (data.parsed.summary || '').substring(0, 300) + '..."');
      
      console.log('\n🔍 GENERIC CONTENT DETECTION:');
      const summaryLower = (data.parsed.summary || '').toLowerCase();
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
      
      let genericCount = 0;
      genericIndicators.forEach(indicator => {
        const found = summaryLower.includes(indicator.toLowerCase());
        if (found) genericCount++;
        console.log(`  ${found ? '⚠️' : '✅'} "${indicator}": ${found ? 'GENERIC CONTENT' : 'OK'}`);
      });
      
      console.log(`\n📊 GENERIC CONTENT SCORE: ${genericCount}/${genericIndicators.length}`);
      if (genericCount > 2) {
        console.log('🚨 HIGH GENERIC CONTENT DETECTED - AI may not be analyzing actual video content!');
      }
      
      console.log('\n❓ QUIZ QUESTIONS ANALYSIS:');
      if (data.parsed.quiz?.questions) {
        data.parsed.quiz.questions.forEach((q, i) => {
          console.log(`\nQ${i + 1}: ${q.question}`);
          console.log(`  Options: ${q.options.join(' | ')}`);
          console.log(`  Correct: ${q.correctAnswer + 1}`);
          console.log(`  Explanation: ${q.explanation}`);
          
          // Check if question seems generic
          const questionLower = q.question.toLowerCase();
          const genericQuestionIndicators = [
            'what type of content',
            'how would you describe',
            'what is the main purpose',
            'general content',
            'various topics'
          ];
          
          const isGenericQuestion = genericQuestionIndicators.some(indicator => 
            questionLower.includes(indicator)
          );
          
          console.log(`  ${isGenericQuestion ? '⚠️' : '✅'} Question type: ${isGenericQuestion ? 'GENERIC' : 'SPECIFIC'}`);
        });
      }
      
      return true;
    } else {
      console.log('\n❌ AI ANALYSIS FAILED:');
      console.log('- Error:', data.error);
      console.log('- Details:', data.details);
      if (data.suggestions) {
        console.log('- Suggestions:');
        data.suggestions.forEach(suggestion => console.log(`  • ${suggestion}`));
      }
      if (data.rawResponse) {
        console.log('\n📄 RAW AI RESPONSE PREVIEW:');
        console.log(data.rawResponse.substring(0, 500) + '...');
      }
      return false;
    }
  } catch (error) {
    console.error('❌ AI ANALYSIS ERROR:', error.message);
    return false;
  }
}

async function debugEnvironment() {
  console.log('🔧 DEBUGGING ENVIRONMENT');
  console.log('='.repeat(60));
  
  try {
    // Test server health
    const healthResponse = await fetch(`http://localhost:${SERVER_PORT}/api/youtube-transcript`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoId: 'test' })
    });
    
    console.log('✅ Server is running and responding');
    console.log('- Server port:', SERVER_PORT);
    console.log('- Health check status:', healthResponse.status);
    
  } catch (error) {
    console.log('❌ Server not reachable:', error.message);
    console.log('- Make sure your development server is running on port', SERVER_PORT);
    return false;
  }
  
  return true;
}

async function runDebugAnalysis() {
  console.log('🚀 STARTING DEBUG ANALYSIS FOR VIDEO LEARN SYSTEM');
  console.log('='.repeat(80));
  
  // Check environment first
  const serverHealthy = await debugEnvironment();
  if (!serverHealthy) {
    console.log('\n❌ Cannot proceed - server is not running');
    return;
  }
  
  let totalTests = 0;
  let successfulTests = 0;
  
  for (const video of testVideos) {
    totalTests++;
    
    console.log(`\n🎬 TESTING VIDEO: ${video.name} (${video.id})`);
    console.log('='.repeat(80));
    
    // Step 1: Debug transcript extraction
    const transcript = await debugTranscriptExtraction(video.id, video.name);
    
    if (transcript) {
      // Step 2: Debug AI analysis
      const aiSuccess = await debugAIAnalysis(transcript, video.name);
      if (aiSuccess) {
        successfulTests++;
      }
    }
  }
  
  // Final summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 DEBUG ANALYSIS SUMMARY');
  console.log('='.repeat(80));
  console.log(`Tests completed: ${totalTests}`);
  console.log(`Successful tests: ${successfulTests}`);
  console.log(`Success rate: ${((successfulTests / totalTests) * 100).toFixed(1)}%`);
  
  if (successfulTests === totalTests) {
    console.log('\n🎉 ALL TESTS PASSED! Your Video Learn system is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the output above for specific issues.');
    console.log('\n🔧 TROUBLESHOOTING TIPS:');
    console.log('1. Check your GEMINI_API_KEY environment variable');
    console.log('2. Verify the API key is valid and has quota remaining');
    console.log('3. Check if transcripts contain actual video content (not dummy data)');
    console.log('4. Look for generic content indicators in the AI responses');
    console.log('5. Ensure your development server is running on the correct port');
  }
}

// Run the debug analysis
runDebugAnalysis().catch(console.error); 