import { useState, useRef, useEffect } from 'react';
import { Loader2, MessageSquare, Send, Trash2 } from 'lucide-react';
import { ChatMessage, VentureProject } from '../types/venture';

interface VentureAssistantViewProps {
  project: VentureProject;
  onUpdateChatHistory: (messages: ChatMessage[]) => void;
}

const SUGGESTED_PROMPTS = [
  'Explain my business model',
  'Summarize my venture plan',
  'Explain TAM, SAM and SOM',
  'Explain my financial projections',
  'Identify weaknesses in my business assumptions',
  'Generate an academic SWOT analysis',
  'Explain my business model in simple language',
  'Prepare questions for my university viva',
  'Generate an executive summary',
];

export function VentureAssistantView({
  project,
  onUpdateChatHistory,
}: VentureAssistantViewProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [project.chatHistory.length, isLoading]);

  const sendMessage = async (questionText: string) => {
    const trimmed = questionText.trim();
    if (!trimmed || isLoading) return;

    setError(null);
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-u`,
      role: 'user',
      content: trimmed,
      timestamp: new Date().toISOString(),
    };

    const nextHistory = [...project.chatHistory, userMsg];
    onUpdateChatHistory(nextHistory);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project: {
            fileName: project.fileName,
            pages: project.pages,
          },
          messages: nextHistory,
          question: trimmed,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Venture Assistant could not respond.');
      }

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now()}-a`,
        role: 'assistant',
        content: data.answer,
        timestamp: new Date().toISOString(),
      };
      onUpdateChatHistory([...nextHistory, assistantMsg]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chat request failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] min-h-[560px] flex-col gap-4">
      <div className="flex flex-col justify-between gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-medium text-teal-700">Document-Grounded AI Analyst</p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-slate-900">
            Venture Assistant
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Primary source: {project.fileName} ({project.pageCount} pages). Explicitly flags when
            information is not present in the document.
          </p>
        </div>

        {project.chatHistory.length > 0 && (
          <button
            type="button"
            onClick={() => onUpdateChatHistory([])}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 self-start"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear Conversation
          </button>
        )}
      </div>

      {/* Suggested Academic Questions */}
      <div className="flex flex-wrap gap-1.5">
        {SUGGESTED_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            disabled={isLoading}
            onClick={() => sendMessage(prompt)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-teal-600 hover:text-slate-900 disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto rounded-xl border border-slate-200 bg-white p-5">
        {project.chatHistory.length === 0 ? (
          <div className="mx-auto flex h-full max-w-lg flex-col items-center justify-center text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
              <MessageSquare className="h-5 w-5" />
            </div>
            <h2 className="mt-4 font-display text-base font-bold text-slate-900">
              Ask Venture Assistant About {project.extraction.businessName}
            </h2>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
              Select any prompt above or ask your own question about financials, TAM/SAM/SOM,
              competitors, assumptions, or MBA viva preparation. Responses cite source page numbers
              and never invent missing data.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {project.chatHistory.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-slate-900 text-white'
                      : 'border border-slate-200 bg-slate-50 text-slate-800'
                  }`}
                >
                  <p className="mb-1 text-[11px] font-semibold opacity-75">
                    {msg.role === 'user' ? 'You' : 'Venture Assistant'}
                  </p>
                  <div className="whitespace-pre-wrap text-xs sm:text-sm">{msg.content}</div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
                  <Loader2 className="h-4 w-4 animate-spin text-teal-700" />
                  Analyzing document pages with Gemini...
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-xs text-red-800">
          {error}
        </div>
      )}

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage(input);
        }}
        className="flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask a question grounded in ${project.fileName}...`}
          disabled={isLoading}
          className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:border-teal-600 focus:outline-none"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:opacity-50 whitespace-nowrap shrink-0"
        >
          <Send className="h-4 w-4" />
          Ask
        </button>
      </form>
    </div>
  );
}
