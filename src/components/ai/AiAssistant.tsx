import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, PregnancyPhase } from '../../types';
import { sendAiMessage } from '../../lib/aiService';

interface AiAssistantProps {
  currentUser?: UserProfile | null;
  phase?: PregnancyPhase;
  currentWeek?: number;
  postpartumDay?: number;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

const EXAMPLE_PROMPTS = [
  'What changes are common around this stage of pregnancy?',
  'How can I prepare questions for my next OB-GYN appointment?',
  'What are some general nutrition principles during pregnancy?',
  'What should I organize before a hospital visit?'
];

/**
 * Safe React Markdown inline formatter for bold text and inline code.
 * Prevents using dangerouslySetInnerHTML.
 */
function parseInlineFormatting(text: string): React.ReactNode[] {
  const boldParts = text.split(/(\*\*.*?\*\*)/g);
  return boldParts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return (
        <strong key={i} className="font-bold text-[#192231]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    const codeParts = part.split(/(`.*?`)/g);
    return codeParts.map((sub, j) => {
      if (sub.startsWith('`') && sub.endsWith('`') && sub.length >= 2) {
        return (
          <code key={`${i}-${j}`} className="px-1 py-0.5 bg-[#E8EFF7] rounded text-[11px] font-mono">
            {sub.slice(1, -1)}
          </code>
        );
      }
      return sub;
    });
  });
}

/**
 * Safe React Markdown block renderer for headings, bold, bullet & numbered lists, and paragraphs.
 * Completely safe without dangerouslySetInnerHTML.
 */

const SafeMarkdownText: React.FC<{ text: string }> = ({ text }) => {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let currentList: React.ReactNode[] | null = null;
  let isNumbered = false;

  const flushList = () => {
    if (currentList && currentList.length > 0) {
      if (isNumbered) {
        elements.push(
          <ol key={`ol-${elements.length}`} className="list-decimal list-inside space-y-1 my-1.5 pl-1 text-xs">
            {currentList}
          </ol>
        );
      } else {
        elements.push(
          <ul key={`ul-${elements.length}`} className="list-disc list-inside space-y-1 my-1.5 pl-1 text-xs">
            {currentList}
          </ul>
        );
      }
      currentList = null;
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushList();
      return;
    }

    // Headings
    if (trimmed.startsWith('### ')) {
      flushList();
      elements.push(
        <h4 key={index} className="font-black text-xs text-[#192231] mt-2 mb-1">
          {parseInlineFormatting(trimmed.slice(4))}
        </h4>
      );
      return;
    }
    if (trimmed.startsWith('## ')) {
      flushList();
      elements.push(
        <h3 key={index} className="font-black text-xs text-[#192231] mt-2.5 mb-1">
          {parseInlineFormatting(trimmed.slice(3))}
        </h3>
      );
      return;
    }
    if (trimmed.startsWith('# ')) {
      flushList();
      elements.push(
        <h2 key={index} className="font-black text-sm text-[#192231] mt-3 mb-1">
          {parseInlineFormatting(trimmed.slice(2))}
        </h2>
      );
      return;
    }

    // Bullet List Items (* or -)
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      if (currentList && isNumbered) flushList();
      if (!currentList) {
        currentList = [];
        isNumbered = false;
      }
      currentList.push(
        <li key={index} className="leading-relaxed">
          {parseInlineFormatting(trimmed.slice(2))}
        </li>
      );
      return;
    }

    // Numbered List Items (1. 2. etc)
    const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numberedMatch) {
      if (currentList && !isNumbered) flushList();
      if (!currentList) {
        currentList = [];
        isNumbered = true;
      }
      currentList.push(
        <li key={index} className="leading-relaxed">
          {parseInlineFormatting(numberedMatch[2])}
        </li>
      );
      return;
    }

    // Regular Paragraph
    flushList();
    elements.push(
      <p key={index} className="leading-relaxed my-0.5">
        {parseInlineFormatting(trimmed)}
      </p>
    );
  });

  flushList();

  return <div className="space-y-1 text-xs text-[#192231]">{elements}</div>;
};

export const AiAssistant: React.FC<AiAssistantProps> = ({
  currentUser,
  phase = 'pregnancy',
  currentWeek = 24,
  postpartumDay = 8
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [previousResponseId, setPreviousResponseId] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Derived minimal non-sensitive pregnancy stage context
  const stageContext =
    phase === 'postpartum'
      ? `Postpartum Day ${postpartumDay}`
      : `Week ${currentWeek}, ${
          currentWeek <= 13
            ? 'First Trimester'
            : currentWeek <= 27
            ? 'Second Trimester'
            : 'Third Trimester'
        }`;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isLoading) return;

    setError(null);
    setInputMessage('');

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const result = await sendAiMessage({
        message: query,
        stageContext,
        previousResponseId
      });

      if (!result.success || !result.answer) {
        setError(result.error || 'Failed to receive a response. Please try again.');
      } else {
        const assistantMessage: ChatMessage = {
          id: `ast-${Date.now()}`,
          sender: 'assistant',
          text: result.answer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, assistantMessage]);
        if (result.responseId) {
          setPreviousResponseId(result.responseId);
        }
      }
    } catch (err: any) {
      console.error('AiAssistant UI Error:', err);
      setError('An unexpected error occurred while communicating with the assistant.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetConversation = () => {
    setMessages([]);
    setPreviousResponseId(undefined);
    setError(null);
    setInputMessage('');
  };

  // Restrict interactive access to authenticated patients/mothers
  const isMother = currentUser?.role === 'patient';

  if (!currentUser) {
    return (
      <div className="p-4 rounded-3xl bg-white border border-[#E8EFF7] shadow-xs space-y-2">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-2xl bg-[#FDF2F7] text-base">✨</span>
          <div>
            <h3 className="text-xs font-black text-[#192231]">Hi Mumma AI Assistant</h3>
            <p className="text-[10px] text-[#8F9EB3]">Educational support for your pregnancy journey</p>
          </div>
        </div>
        <div className="p-3 rounded-2xl bg-[#FAFBFD] border border-[#EBF1F9] text-xs text-[#5A677D]">
          🔒 Please sign in as an expecting mother to interact with the Gemini AI Educational Assistant.
        </div>
      </div>
    );
  }

  if (!isMother) {
    return (
      <div className="p-4 rounded-3xl bg-white border border-[#E8EFF7] shadow-xs space-y-2">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-2xl bg-[#FDF2F7] text-base">✨</span>
          <div>
            <h3 className="text-xs font-black text-[#192231]">Hi Mumma AI Assistant</h3>
            <p className="text-[10px] text-[#8F9EB3]">Educational support for your pregnancy journey</p>
          </div>
        </div>
        <div className="p-3 rounded-2xl bg-[#FAFBFD] border border-[#EBF1F9] text-xs text-[#5A677D]">
          ℹ️ The Gemini Educational Assistant is designed for expecting mothers. Caregiver accounts can view shared tasks and care summaries granted by the mother.
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-3xl bg-white border border-[#E8EFF7] shadow-xs space-y-3.5">
      {/* Header & Title */}
      <div className="flex items-center justify-between border-b border-[#F0F4FA] pb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-gradient-to-br from-[#EA81AA] to-[#6FAFED] text-white shadow-xs">
            ✨
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-xs font-black text-[#192231]">Hi Mumma AI Assistant</h3>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-[#FDF2F7] text-[#EA81AA] border border-[#FCE7F3]">
                Gemini 3.6 Flash
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#EBF5FF] text-[#0284C7] border border-[#BAE6FD]">
                {stageContext}
              </span>
            </div>
            <p className="text-[10px] text-[#8F9EB3]">Educational support for your pregnancy journey</p>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            onClick={handleResetConversation}
            className="text-[10px] font-bold text-[#8F9EB3] hover:text-[#EA81AA] px-2.5 py-1 rounded-xl bg-[#FAFBFD] border border-[#E2ECF7] transition-all cursor-pointer"
            title="Start new conversation"
          >
            🔄 New Chat
          </button>
        )}
      </div>

      {/* Mandatory Safety & Non-Diagnostic Disclaimer */}
      <div className="p-2.5 rounded-2xl bg-[#F0F7FF] border border-[#C7DFF9] flex items-start gap-2 text-[10px] text-[#475569] leading-relaxed">
        <span className="text-xs shrink-0">ℹ️</span>
        <div>
          <span className="font-bold text-[#0284C7]">Educational Disclaimer:</span> For general education and organization only. It does not diagnose, prescribe, or replace your doctor.
        </div>
      </div>

      {/* Error Alert Display */}
      {error && (
        <div className="p-3 rounded-2xl bg-[#FFF5F5] border border-[#FED7D7] text-xs text-[#C53030] flex items-start justify-between">
          <span>⚠️ {error}</span>
          <button
            onClick={() => setError(null)}
            className="text-xs font-bold text-[#C53030] hover:opacity-75 cursor-pointer ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Conversation Window */}
      <div className="min-h-[160px] max-h-[380px] overflow-y-auto space-y-3 pr-1 no-scrollbar">
        {messages.length === 0 ? (
          <div className="p-4 rounded-2xl bg-[#FAFBFD] border border-[#EBF1F9] text-center space-y-2.5">
            <div className="text-xl">🌸</div>
            <div>
              <p className="text-xs font-bold text-[#192231]">Ask Gemini AI anything about your journey</p>
              <p className="text-[10px] text-[#8F9EB3] mt-0.5">
                Explore pregnancy concepts, nutrition principles, or organize questions for your next OB-GYN visit.
              </p>
            </div>

            {/* Example Educational Prompts */}
            <div className="pt-2 text-left space-y-1.5">
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-[#8F9EB3]">
                Try asking:
              </span>
              <div className="grid grid-cols-1 gap-1.5">
                {EXAMPLE_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(prompt)}
                    disabled={isLoading}
                    className="p-2 rounded-xl bg-white border border-[#E2ECF7] text-[11px] font-semibold text-[#5A677D] hover:text-[#192231] hover:border-[#6FAFED] text-left transition-all cursor-pointer shadow-2xs active:scale-[0.99]"
                  >
                    💡 {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-1.5 mb-1 px-1">
                <span className="text-[9px] font-bold text-[#8F9EB3]">
                  {msg.sender === 'user' ? 'You' : 'Hi Mumma AI'}
                </span>
                <span className="text-[9px] text-[#A0B0C4]">• {msg.timestamp}</span>
              </div>

              <div
                className={`p-3 rounded-2xl text-xs leading-relaxed max-w-[88%] ${
                  msg.sender === 'user'
                    ? 'bg-[#192231] text-white rounded-tr-xs shadow-xs'
                    : 'bg-[#FAFBFD] text-[#192231] border border-[#E2ECF7] rounded-tl-xs shadow-2xs'
                }`}
              >
                {msg.sender === 'user' ? (
                  msg.text
                ) : (
                  <SafeMarkdownText text={msg.text} />
                )}
              </div>
            </div>
          ))
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-[#FAFBFD] border border-[#E2ECF7] text-xs text-[#5A677D] w-fit">
            <span className="animate-spin text-sm">✨</span>
            <span className="font-semibold text-[11px]">Hi Mumma AI is thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center gap-2 pt-1"
      >
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Ask an educational or preparation question..."
          disabled={isLoading}
          className="flex-1 bg-[#FAFBFD] border border-[#E2ECF7] rounded-2xl py-2.5 px-3.5 text-xs text-[#192231] placeholder-[#A0B0C4] focus:outline-none focus:border-[#6FAFED] transition-all"
        />
        <button
          type="submit"
          disabled={isLoading || !inputMessage.trim()}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#EA81AA] to-[#6FAFED] text-white text-xs font-black shadow-xs hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer shrink-0"
        >
          {isLoading ? '...' : 'Send 🚀'}
        </button>
      </form>
    </div>
  );
};
