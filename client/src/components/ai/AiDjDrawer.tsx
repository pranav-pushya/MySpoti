import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  Play, 
  Film, 
  Music, 
  Loader2
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { usePlayerStore } from '../../store/usePlayerStore';
import { Track } from '../../types';

interface Message {
  id: string;
  sender: 'user' | 'dj';
  text: string;
  suggestedTrackIds?: string[];
  suggestedTracks?: Track[];
  moodDetected?: string;
  provider?: string;
  timestamp: string;
}

const QUICK_PROMPTS = [
  { label: '⚡ Workout Energy', prompt: 'I am heading to the gym, pick high-energy tracks from my library!' },
  { label: '🌧️ Cozy Chill', prompt: 'I want something soothing and calm to relax.' },
  { label: '🌙 Late Night Focus', prompt: 'Give me deep focus and study beats from my tracks.' },
  { label: '🎥 Video Tracks', prompt: 'What MP4 music videos do I have uploaded? Queue them up!' },
  { label: '❓ How to use Video Mode?', prompt: 'How do I upload MP4s and watch them in Video Theater mode?' }
];

export const AiDjDrawer: React.FC<{ tracks: Track[] }> = ({ tracks }) => {
  const { isAiDrawerOpen, toggleAiDrawer } = useAppStore();
  const { playTrack, setQueue } = usePlayerStore();

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'dj',
      text: "Yo! I'm your MySpoti AI DJ powered by Groq. Tell me your mood, what you're doing, or ask me any question about the webapp and I'll spin the right tracks from your library!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [activeProvider, setActiveProvider] = useState<string>('Groq LLaMA 3.3');

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!isAiDrawerOpen) return null;

  const sendMessage = async (promptText: string) => {
    if (!promptText.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: promptText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText
        })
      });

      const data = await res.json();

      if (data.success) {
        if (data.provider) {
          setActiveProvider(data.provider);
        }

        const suggestedTracks = (data.suggestedTrackIds || [])
          .map((id: string) => tracks.find(t => t.id === id))
          .filter(Boolean) as Track[];

        const djMsg: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'dj',
          text: data.reply,
          suggestedTrackIds: data.suggestedTrackIds,
          suggestedTracks,
          moodDetected: data.moodDetected,
          provider: data.provider,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, djMsg]);
      } else {
        throw new Error(data.message || 'AI request failed');
      }
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'dj',
          text: "I hit a snag connecting to the AI deck! Ensure GROQ_API_KEY is configured in your .env file.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayQueue = (suggestedTracks: Track[]) => {
    if (!suggestedTracks || suggestedTracks.length === 0) return;
    playTrack(suggestedTracks[0], suggestedTracks);
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-96 md:w-[420px] bg-spotify-base/95 backdrop-blur-2xl border-l border-white/10 z-50 flex flex-col shadow-2xl animate-slide-left text-white select-none">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-spotify-card/80">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-purple-600 via-pink-500 to-spotify-green flex items-center justify-center shadow-md shadow-purple-600/30">
            <Sparkles className="h-5 w-5 text-black" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight flex items-center gap-1.5">
              <span>MySpoti AI DJ</span>
              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300">
                {activeProvider.includes('Groq') ? 'Groq LLaMA 3.3' : 'AI Powered'}
              </span>
            </h3>
            <p className="text-[11px] text-spotify-muted">Mood curation & Webapp support</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={toggleAiDrawer}
            className="p-2 rounded-full hover:bg-spotify-highlight text-spotify-muted hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-spotify-green text-black font-medium rounded-br-none shadow-md shadow-spotify-green/10'
                  : 'bg-spotify-card border border-white/10 text-white rounded-bl-none shadow-lg'
              }`}
            >
              <p>{msg.text}</p>

              {/* Actionable Track Recommendations */}
              {msg.suggestedTracks && msg.suggestedTracks.length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-spotify-green">
                      {msg.suggestedTracks.length} Curated Tracks
                    </span>
                    <button
                      onClick={() => handlePlayQueue(msg.suggestedTracks!)}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-spotify-green text-black font-bold text-[11px] hover:scale-105 transition-all shadow-md"
                    >
                      <Play className="h-3 w-3 fill-black" />
                      <span>Play Queue</span>
                    </button>
                  </div>

                  <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                    {msg.suggestedTracks.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => playTrack(t, msg.suggestedTracks)}
                        className="flex items-center justify-between p-1.5 rounded-lg bg-black/40 hover:bg-black/70 cursor-pointer transition-colors border border-white/5"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="h-7 w-7 rounded bg-spotify-elevated flex items-center justify-center shrink-0">
                            {t.format === 'mp4' ? (
                              <Film className="h-3.5 w-3.5 text-purple-400" />
                            ) : (
                              <Music className="h-3.5 w-3.5 text-spotify-green" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold truncate text-[11px] text-white">{t.title}</p>
                            <p className="text-[9px] text-spotify-muted truncate">{t.artist}</p>
                          </div>
                        </div>
                        <Play className="h-3 w-3 text-spotify-muted hover:text-white shrink-0 ml-2" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-1.5 text-[9px] text-spotify-muted mt-1 px-1">
              <span>{msg.timestamp}</span>
              {msg.provider && (
                <>
                  <span>•</span>
                  <span className="text-purple-300/80">{msg.provider}</span>
                </>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-purple-300 p-2">
            <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
            <span>AI DJ is reviewing your library...</span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Quick Starter Chips */}
      <div className="px-4 py-2 border-t border-white/5 overflow-x-auto custom-scrollbar flex items-center gap-1.5">
        {QUICK_PROMPTS.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => sendMessage(qp.prompt)}
            disabled={isLoading}
            className="text-[11px] px-2.5 py-1 rounded-full bg-spotify-highlight hover:bg-spotify-elevated text-spotify-subtext hover:text-white shrink-0 border border-white/5 transition-all"
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage(input);
        }}
        className="p-3 border-t border-white/10 bg-spotify-card/60 flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask for a mood mix or app question..."
          className="flex-1 h-9 px-3.5 rounded-full bg-spotify-highlight border border-white/10 focus:border-purple-400 text-xs text-white placeholder-spotify-muted outline-none transition-all"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className={`h-9 w-9 rounded-full flex items-center justify-center transition-all ${
            input.trim() && !isLoading
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 hover:scale-105 active:scale-95'
              : 'bg-spotify-highlight text-spotify-muted cursor-not-allowed'
          }`}
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
};
