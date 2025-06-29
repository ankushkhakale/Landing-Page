require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { YoutubeTranscript } = require('youtube-transcript');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error('Error: GEMINI_API_KEY not set in environment variables.');
  process.exit(1);
}
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const geminiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

function extractVideoId(url) {
  const regex = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([\w-]{11})/;
  const match = url.match(regex);
  if (match && match[1]) return match[1];
  throw new Error('Invalid YouTube URL or unable to extract video ID.');
}

async function fetchTranscript(videoId) {
  try {
    const transcriptArr = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'en' });
    if (!transcriptArr || transcriptArr.length === 0) throw new Error('Transcript not found or empty.');
    // Join all text segments into a single string
    let transcript = transcriptArr.map(seg => seg.text).join(' ').replace(/\s+/g, ' ').trim();
    if (transcript.length < 50) throw new Error('Transcript is too short or empty.');
    console.log(`Transcript fetched successfully (${transcript.length} characters).`);
    return transcript;
  } catch (err) {
    throw new Error(`Failed to fetch transcript: ${err.message}`);
  }
}

function chunkText(text, maxLen = 4000) {
  if (text.length <= maxLen) return [text];
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    let end = start + maxLen;
    if (end < text.length) {
      const lastPeriod = text.lastIndexOf('.', end);
      if (lastPeriod > start + 100) end = lastPeriod + 1;
    }
    chunks.push(text.slice(start, end).trim());
    start = end;
  }
  return chunks;
}

async function generateSummary(transcript) {
  const chunks = chunkText(transcript, 4000);
  const summaries = [];
  for (let i = 0; i < chunks.length; i++) {
    const prompt = `Using ONLY the transcript below, write a clear, concise summary for a 15-year-old. Do NOT add or assume any information not present in the transcript.\n\nTranscript:\n${chunks[i]}`;
    console.log(`==== PROMPT TO GEMINI (SUMMARY CHUNK ${i + 1}) ====`);
    console.log(prompt);
    let text;
    try {
      const response = await geminiModel.generateContent({ prompt, temperature: 0.2, maxTokens: 800 });
      text = response.text;
    } catch (err) {
      throw new Error('Gemini API error (summary): ' + err.message);
    }
    console.log(`==== RAW GEMINI RESPONSE (SUMMARY CHUNK ${i + 1}) ====`);
    console.log(text);
    summaries.push(text.trim());
  }
  if (summaries.length === 1) return summaries[0];
  // Combine summaries if multiple chunks
  const combinePrompt = `Combine the following summaries into a single, clear, concise summary for a 15-year-old.\n\n${summaries.join('\n\n')}`;
  console.log('==== PROMPT TO GEMINI (COMBINE SUMMARIES) ====');
  console.log(combinePrompt);
  let combined;
  try {
    const response = await geminiModel.generateContent({ prompt: combinePrompt, temperature: 0.2, maxTokens: 800 });
    combined = response.text;
  } catch (err) {
    throw new Error('Gemini API error (combine summaries): ' + err.message);
  }
  console.log('==== RAW GEMINI RESPONSE (COMBINED SUMMARY) ====');
  console.log(combined);
  return combined.trim();
}

async function generateQuiz(transcriptOrSummary) {
  const prompt = `Using ONLY the transcript (or summary) below, create exactly 10 multiple-choice questions, each with 4 options and exactly one correct answer. For each question, indicate the index (0-3) of the correct answer and provide a brief explanation (1-2 sentences) referencing the transcript content. Format the quiz strictly as a JSON array of objects with properties: "question", "options", "correctAnswer", and "explanation". Do NOT add or assume any information not present in the transcript.\n\nTranscript or summary:\n${transcriptOrSummary}`;
  console.log('==== PROMPT TO GEMINI (QUIZ) ====');
  console.log(prompt);
  let text;
  try {
    const response = await geminiModel.generateContent({ prompt, temperature: 0.2, maxTokens: 1200 });
    text = response.text;
  } catch (err) {
    throw new Error('Gemini API error (quiz): ' + err.message);
  }
  console.log('==== RAW GEMINI RESPONSE (QUIZ) ====');
  console.log(text);
  // Attempt to extract JSON array from the response
  const jsonMatch = text.match(/\[.*\]/s);
  if (!jsonMatch) throw new Error('No JSON array found in Gemini quiz response.');
  let quiz;
  try {
    quiz = JSON.parse(jsonMatch[0]);
  } catch (err) {
    throw new Error('Failed to parse Gemini quiz JSON: ' + err.message);
  }
  if (!Array.isArray(quiz) || quiz.length !== 10) {
    throw new Error('Gemini quiz JSON is missing or does not have 10 questions.');
  }
  for (const q of quiz) {
    if (
      typeof q.question !== 'string' ||
      !Array.isArray(q.options) ||
      q.options.length !== 4 ||
      typeof q.correctAnswer !== 'number' ||
      typeof q.explanation !== 'string'
    ) {
      throw new Error('Quiz question format invalid.');
    }
  }
  return quiz;
}

async function main() {
  const url = process.argv[2];
  if (!url) {
    console.error('Usage: node youtube_gemini.js <YouTube URL>');
    process.exit(1);
  }

  try {
    const videoId = extractVideoId(url);
    console.log(`Video ID extracted: ${videoId}`);

    console.log('Fetching transcript...');
    const transcript = await fetchTranscript(videoId);

    if (!transcript || transcript.length < 50) {
      console.error('Transcript is too short or unavailable. Here is what was fetched:');
      console.error(transcript);
      throw new Error('Transcript is too short or unavailable.');
    }

    // Debug: print the first 1000 characters of the transcript
    console.log('Transcript preview:', transcript.slice(0, 1000));
    console.log('Transcript length:', transcript.length);

    const summary = await generateSummary(transcript);
    // For quiz, use full transcript if <= 4000 chars, else use summary
    const quiz = transcript.length <= 4000 ? await generateQuiz(transcript) : await generateQuiz(summary);

    const output = { summary, quiz };

    console.log('\n=== OUTPUT JSON ===\n');
    console.log(JSON.stringify(output, null, 2));
  } catch (err) {
    console.error('Fatal error:', err.message);
    process.exit(1);
  }
}

if (require.main === module) main();
