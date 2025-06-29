// Test script with a video that definitely has captions
// This will help us verify if the AI analysis works with real content

const testVideo = {
  id: 'kJQP7q19f0', // "Gangnam Style" - very popular video, likely has captions
  name: 'Gangnam Style',
  expectedContent: ['psy', 'k-pop', 'gangnam', 'dance', '2012']
};

const SERVER_PORT = 3000;

async function testRealVideo() {
  console.log('🎬 TESTING WITH REAL VIDEO: Gangnam Style');
  console.log('='.repeat(60));
  
  try {
    // Step 1: Extract transcript
    console.log('📝 STEP 1: Extracting transcript...');
    const transcriptResponse = await fetch(`http://localhost:${SERVER_PORT}/api/youtube-transcript`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoId: testVideo.id })
    });
    
    const transcriptData = await transcriptResponse.json();
    
    if (!transcriptResponse.ok) {
      console.log('❌ Transcript extraction failed:');
      console.log('- Error:', transcriptData.error);
      console.log('- Details:', transcriptData.details);
      if (transcriptData.attemptedMethods) {
        console.log('- Attempted methods:');
        transcriptData.attemptedMethods.forEach(method => console.log(`  • ${method}`));
      }
      return;
    }
    
    console.log('✅ Transcript extracted successfully!');
    console.log('- Method used:', transcriptData.method);
    console.log('- Length:', transcriptData.length, 'characters');
    console.log('- Preview:', transcriptData.transcript.substring(0, 200) + '...');
    
    // Step 2: Analyze with AI
    console.log('\n🤖 STEP 2: Analyzing with AI...');
    const aiResponse = await fetch(`http://localhost:${SERVER_PORT}/api/video-learn-analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        transcript: transcriptData.transcript,
        videoTitle: testVideo.name
      })
    });
    
    const aiData = await aiResponse.json();
    
    if (!aiResponse.ok) {
      console.log('❌ AI analysis failed:');
      console.log('- Error:', aiData.error);
      console.log('- Details:', aiData.details);
      if (aiData.suggestions) {
        console.log('- Suggestions:');
        aiData.suggestions.forEach(suggestion => console.log(`  • ${suggestion}`));
      }
      return;
    }
    
    console.log('✅ AI analysis successful!');
    console.log('- Title:', aiData.parsed.title);
    console.log('- Summary length:', aiData.parsed.summary.length, 'characters');
    console.log('- Quiz questions:', aiData.parsed.quiz.questions.length);
    
    // Step 3: Check for generic content
    console.log('\n🔍 STEP 3: Checking for generic content...');
    const summaryLower = aiData.parsed.summary.toLowerCase();
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
    
    if (genericCount === 0) {
      console.log('🎉 SUCCESS! No generic content detected - AI is analyzing real video content!');
    } else {
      console.log('⚠️  Some generic content detected - AI may not be analyzing actual video content');
    }
    
    // Step 4: Show sample content
    console.log('\n📋 STEP 4: Sample generated content...');
    console.log('\n📝 SUMMARY PREVIEW:');
    console.log(aiData.parsed.summary.substring(0, 400) + '...');
    
    console.log('\n❓ SAMPLE QUIZ QUESTIONS:');
    aiData.parsed.quiz.questions.slice(0, 2).forEach((q, i) => {
      console.log(`\nQ${i + 1}: ${q.question}`);
      console.log(`  Options: ${q.options.join(' | ')}`);
      console.log(`  Correct: ${q.correctAnswer + 1}`);
      console.log(`  Explanation: ${q.explanation}`);
    });
    
    // Step 5: Check if content is video-specific
    console.log('\n🎯 STEP 5: Video-specific content check...');
    const contentLower = (aiData.parsed.summary + ' ' + aiData.parsed.quiz.questions.map(q => q.question).join(' ')).toLowerCase();
    
    testVideo.expectedContent.forEach(content => {
      const found = contentLower.includes(content.toLowerCase());
      console.log(`  ${found ? '✅' : '❌'} "${content}": ${found ? 'FOUND' : 'NOT FOUND'}`);
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 TEST COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testRealVideo(); 