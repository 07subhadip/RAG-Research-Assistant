'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, StopCircle } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  onStop?: () => void;
}

export function ChatInput({ onSend, isLoading, onStop }: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSend(input);
      setInput('');
      if (textareaRef.current) textareaRef.current.style.height = '48px';
    }
  };

  return (
    <div className="relative max-w-4xl mx-auto w-full group">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white dark:to-gray-950 pointer-events-none -top-10 h-10" />
      <div className="relative flex items-end gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-2 shadow-lg dark:shadow-gray-950/50 transition-shadow focus-within:shadow-xl focus-within:ring-1 focus-within:ring-indigo-500/20">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything about your research papers..."
          className="w-full bg-transparent border-none focus:ring-0 resize-none max-h-32 min-h-[44px] py-2.5 px-3 text-gray-800 dark:text-gray-100 placeholder-gray-400 text-sm sm:text-base scrollbar-hide"
          rows={1}
        />
        <button
          onClick={isLoading ? onStop : handleSend}
          disabled={!input.trim() && !isLoading}
          className={`shrink-0 p-2.5 rounded-xl transition-all duration-200 flex items-center justify-center 
            ${isLoading 
              ? 'bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40' 
              : input.trim() 
                ? 'bg-indigo-600 text-white shadow-md hover:bg-indigo-700' 
                : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
            }`}
        >
          {isLoading ? <StopCircle size={18} /> : <Send size={18} />}
        </button>
      </div>
      <p className="text-center text-xs text-gray-400 mt-2 pb-2">
        AI can make mistakes. Verify important information.
      </p>
    </div>
  );
}
