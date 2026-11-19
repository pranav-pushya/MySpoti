import { Router, Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { getAllTracks, getCategoriesWithCount } from '../db.js';

const router = Router();

// Webapp Knowledge Base for Q&A
const WEBAPP_FAQ = `
MySpoti Webapp Capabilities & Guide:
1. Uploading Media: Click "+ Upload" in header or sidebar, or drag & drop. Supports MP4 videos, MP3, WAV, FLAC, M4A, OGG, and WebM (up to 250MB).
2. Categories: Users can assign existing categories or type a new category name on the fly during upload.
3. MP4 Video Playback: When an MP4 track is played, click the "Video View" button on the bottom player bar or click its thumbnail to open the Video Theater. Supports 16:9 widescreen and 9:16 vertical videos.
4. Audio Mode vs Video Mode: In the Video Theater, click "Audio Mode" to minimize video and keep the audio playing in the background while browsing.
5. Scrubbing & Seeking: Instant scrub/seek is powered by HTTP 206 Partial Content streaming without buffering the full file.
6. Filtering & Searching: Use the top Category Pills to filter by category or view "Videos (MP4)" only. Use the top search bar to find songs by title, artist, category, or mood tag.
`;

// Helper for heuristic fallback when Gemini API key is not configured
function getHeuristicRecommendation(prompt: string, tracks: any[]) {
  const lowerPrompt = prompt.toLowerCase();
  
  // App doubts
  if (lowerPrompt.includes('upload') || lowerPrompt.includes('how to upload')) {
    return {
      reply: 'To upload music or video files, click the "+ Upload" button in the top navigation bar or sidebar. You can drag and drop MP4, MP3, WAV, FLAC, or OGG files up to 250MB, name your track, and assign or create a category!',
      suggestedTrackIds: []
    };
  }

  if (lowerPrompt.includes('video') || lowerPrompt.includes('theater') || lowerPrompt.includes('mp4')) {
    const videoTracks = tracks.filter(t => t.format === 'mp4' || t.format === 'webm');
    return {
      reply: 'You can upload and watch MP4 videos directly! When an MP4 track is playing, click "Video View" on the bottom player or click the track thumbnail to open Video Theater mode. It preserves both 16:9 widescreen and 9:16 vertical/reels aspect ratios!',
      suggestedTrackIds: videoTracks.slice(0, 3).map(t => t.id)
    };
  }

  if (lowerPrompt.includes('category') || lowerPrompt.includes('categories')) {
    return {
      reply: 'You can filter your songs by category using the category pills at the top. You can also create new custom categories anytime right from the Upload modal!',
      suggestedTrackIds: []
    };
  }

  // Mood scoring
  let matchedTracks = tracks.filter(t => {
    const moodStr = (t.mood_tags || '').toLowerCase();
    const catStr = (t.category_name || '').toLowerCase();
    const titleStr = t.title.toLowerCase();

    if (lowerPrompt.includes('workout') || lowerPrompt.includes('gym') || lowerPrompt.includes('energy') || lowerPrompt.includes('hype')) {
      return moodStr.includes('workout') || moodStr.includes('energetic') || catStr.includes('workout') || moodStr.includes('party');
    }
    if (lowerPrompt.includes('chill') || lowerPrompt.includes('relax') || lowerPrompt.includes('calm') || lowerPrompt.includes('stress')) {
      return moodStr.includes('relaxed') || moodStr.includes('chill') || catStr.includes('chill') || moodStr.includes('cozy');
    }
    if (lowerPrompt.includes('focus') || lowerPrompt.includes('study') || lowerPrompt.includes('work') || lowerPrompt.includes('code')) {
      return moodStr.includes('focus') || moodStr.includes('lo-fi') || catStr.includes('lo-fi') || catStr.includes('focus');
    }
    if (lowerPrompt.includes('rain') || lowerPrompt.includes('sad') || lowerPrompt.includes('melanchol')) {
      return moodStr.includes('melancholic') || moodStr.includes('cozy') || moodStr.includes('relaxed');
    }
    if (lowerPrompt.includes('night') || lowerPrompt.includes('late')) {
      return moodStr.includes('late night') || moodStr.includes('chill');
    }
    return false;
  });

  if (matchedTracks.length === 0) {
    matchedTracks = tracks.slice(0, 4);
  }

  const trackNames = matchedTracks.slice(0, 3).map(t => `"${t.title}" by ${t.artist}`).join(', ');

  return {
    reply: `Here's a curated selection from your library to match your mood: ${trackNames}. Hit "Play Suggested Queue" below to start listening!`,
    suggestedTrackIds: matchedTracks.slice(0, 5).map(t => t.id),
    moodDetected: 'Smart Mood Match'
  };
}

// POST /api/ai/chat
router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { prompt, customApiKey } = req.body;

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({ success: false, message: 'Prompt is required' });
    }

    const trimmedPrompt = prompt.trim();
    const apiKey = customApiKey || process.env.GEMINI_API_KEY;

    // Fetch user catalog from SQLite
    const rawTracks = getAllTracks();
    const categories = getCategoriesWithCount();

    const catalogSummary = rawTracks.map(t => ({
      id: t.id,
      title: t.title,
      artist: t.artist,
      format: t.format,
      category: t.category_name || 'Uncategorized',
      moodTags: JSON.parse(t.mood_tags || '[]'),
      durationSeconds: Math.round(t.duration)
    }));

    // If no API key provided, utilize smart local heuristic assistant
    if (!apiKey) {
      const fallback = getHeuristicRecommendation(trimmedPrompt, rawTracks);
      return res.json({
        success: true,
        reply: fallback.reply,
        suggestedTrackIds: fallback.suggestedTrackIds,
        moodDetected: fallback.moodDetected,
        isFallback: true
      });
    }

    // Call Gemini API via @google/genai SDK
    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `
You are the official AI DJ and in-app specialist for "MySpoti", a personal cloud Spotify clone web app.
The user has their own uploaded library of music and MP4 videos.

Web App Knowledge Base:
${WEBAPP_FAQ}

User's Uploaded Library Catalog:
${JSON.stringify(catalogSummary, null, 2)}

User's Categories:
${categories.map(c => `${c.name} (${c.track_count} tracks)`).join(', ')}

Your Responsibilities:
1. If the user mentions a mood, activity, vibe, or asks for music recommendations:
   - Select the best matching tracks EXCLUSIVELY from the user's uploaded library above.
   - Mention the selected tracks by name with an upbeat, charismatic DJ vibe commentary.
   - List the matching track IDs in the JSON 'suggestedTrackIds' array.
2. If the user asks a question or has doubts about the webapp (e.g. uploading MP4 videos, Video Theater mode, categories, streaming, scrubbing, shortcuts):
   - Answer accurately based on the Web App Knowledge Base above.
3. Always respond strictly in valid JSON format matching this schema:
{
  "reply": "Your conversational DJ commentary or app help explanation here.",
  "suggestedTrackIds": ["track-id-1", "track-id-2"],
  "moodDetected": "Short mood tag or topic (e.g. High Energy, Late Night, App Help)"
}
Do NOT include markdown backticks around the JSON if possible, or use standard json blocks.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: trimmedPrompt }] }
      ],
      config: {
        systemInstruction,
        responseMimeType: 'application/json'
      }
    });

    const responseText = response.text?.trim() || '';

    try {
      const parsed = JSON.parse(responseText);
      res.json({
        success: true,
        reply: parsed.reply || 'Here is your custom DJ mix!',
        suggestedTrackIds: Array.isArray(parsed.suggestedTrackIds) ? parsed.suggestedTrackIds : [],
        moodDetected: parsed.moodDetected || 'Custom Vibe',
        isFallback: false
      });
    } catch {
      // Fallback clean extraction
      res.json({
        success: true,
        reply: responseText,
        suggestedTrackIds: [],
        isFallback: false
      });
    }

  } catch (error: any) {
    console.error('Gemini AI API Error:', error);
    // If Gemini API fails (quota or bad key), gracefully fallback to local recommendation
    const rawTracks = getAllTracks();
    const fallback = getHeuristicRecommendation(req.body.prompt || '', rawTracks);
    res.json({
      success: true,
      reply: fallback.reply,
      suggestedTrackIds: fallback.suggestedTrackIds,
      moodDetected: fallback.moodDetected,
      isFallback: true
    });
  }
});

export default router;
