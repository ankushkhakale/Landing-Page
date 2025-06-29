import os
import re
import sys
import json
from typing import List, Dict, Optional
try:
    from youtube_transcript_api import YouTubeTranscriptApi, TranscriptsDisabled, NoTranscriptFound, VideoUnavailable
except ImportError:
    print("Error: youtube_transcript_api module not found. Please install it with 'pip install youtube-transcript-api'.")
    sys.exit(1)

try:
    from google.generativeai import configure, GenerativeModel
except ImportError:
    print("Error: google-generativeai module not found. Please install it with 'pip install google-generativeai'.")
    sys.exit(1)

try:
    from dotenv import load_dotenv
except ImportError:
    print("Error: python-dotenv module not found. Please install it with 'pip install python-dotenv'.")
    sys.exit(1)

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    print("Error: GEMINI_API_KEY not found in environment variables.")
    sys.exit(1)

configure(api_key=GEMINI_API_KEY)

def extract_video_id(url: str) -> Optional[str]:
    """Extracts the YouTube video ID from a URL."""
    patterns = [
        r"(?:v=|youtu\.be/|embed/|shorts/)([\w-]{11})",
        r"youtube\.com/watch\?v=([\w-]{11})"
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return None

def fetch_transcript(video_id: str) -> str:
    """Fetches and joins the transcript for a YouTube video."""
    try:
        transcript = YouTubeTranscriptApi.get_transcript(video_id)
        text = " ".join([entry['text'] for entry in transcript])
        return text
    except (TranscriptsDisabled, NoTranscriptFound):
        raise RuntimeError("Transcript not available for this video.")
    except VideoUnavailable:
        raise RuntimeError("Video unavailable.")
    except Exception as e:
        raise RuntimeError(f"Error fetching transcript: {e}")

def chunk_text(text: str, max_tokens: int = 2000) -> List[str]:
    """Splits text into chunks of approximately max_tokens words."""
    words = text.split()
    chunks = []
    for i in range(0, len(words), max_tokens):
        chunk = " ".join(words[i:i+max_tokens])
        chunks.append(chunk)
    return chunks

def generate_summary(text: str, model: GenerativeModel) -> str:
    prompt = (
        "Summarize the following transcript in a clear, concise, and student-friendly way. "
        "Highlight the main points and key takeaways.\n\nTranscript:\n" + text
    )
    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        raise RuntimeError(f"Gemini API error during summary: {e}")

def generate_quiz(text: str, model: GenerativeModel, num_questions: int = 10) -> List[Dict]:
    prompt = (
        f"Generate a quiz of at least {num_questions} multiple-choice questions based on the following transcript. "
        "Each question should have 4 options, with one correct answer clearly marked. "
        "Format the output as a JSON array of objects with fields: 'question', 'options' (list of 4), and 'answer' (the correct option as text). "
        "Do not include any explanations.\n\nTranscript:\n" + text
    )
    try:
        response = model.generate_content(prompt)
        # Try to extract JSON from the response
        match = re.search(r'\[.*\]', response.text, re.DOTALL)
        if match:
            quiz = json.loads(match.group(0))
        else:
            quiz = json.loads(response.text)
        return quiz
    except Exception as e:
        raise RuntimeError(f"Gemini API error during quiz generation: {e}")

def main():
    print("Enter YouTube video URL:")
    url = input().strip()
    video_id = extract_video_id(url)
    if not video_id:
        print("Could not extract video ID from the URL.")
        sys.exit(1)
    print(f"Video ID: {video_id}")
    try:
        transcript = fetch_transcript(video_id)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)
    print(f"Transcript fetched. Length: {len(transcript)} characters.")

    # Chunk transcript if too long
    chunks = chunk_text(transcript, max_tokens=2000)
    model = GenerativeModel("gemini-pro")

    # Generate summary (across all chunks if needed)
    summaries = []
    for i, chunk in enumerate(chunks):
        print(f"Generating summary for chunk {i+1}/{len(chunks)}...")
        try:
            summary = generate_summary(chunk, model)
            summaries.append(summary)
        except Exception as e:
            print(f"Error generating summary for chunk {i+1}: {e}")
            sys.exit(1)
    full_summary = "\n\n".join(summaries)

    # Generate quiz (use full transcript if possible, else first chunk)
    quiz_text = transcript if len(chunks) == 1 else transcript[:min(len(transcript), 2000*10)]
    print("Generating quiz...")
    try:
        quiz = generate_quiz(quiz_text, model)
    except Exception as e:
        print(f"Error generating quiz: {e}")
        sys.exit(1)

    # Output
    print("\n===== SUMMARY =====\n")
    print(full_summary)
    print("\n===== QUIZ (JSON) =====\n")
    print(json.dumps(quiz, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    main()

# ----------------------
# Installation Instructions:
#
# 1. Install required packages:
#    pip install youtube-transcript-api google-generativeai python-dotenv
#
# 2. Create a .env file in the same directory with the line:
#    GEMINI_API_KEY=your_gemini_api_key_here
#
# 3. Run the script:
#    python youtube_gemini_quiz.py
#
# The script will prompt for a YouTube URL and output the summary and quiz. 