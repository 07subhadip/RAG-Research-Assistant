"use client";

import React, { useRef, useEffect, useState } from "react";
import { MessageBubble } from "./MessageBubble";
import { Message } from "../types/chat";
import { ArrowDown } from "lucide-react";

interface ChatWindowProps {
    messages: Message[];
    isLoading: boolean;
}

export function ChatWindow({
    messages,
    isLoading,
}: ChatWindowProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [showScrollButton, setShowScrollButton] = useState(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleScroll = () => {
        if (!scrollContainerRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } =
            scrollContainerRef.current;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
        setShowScrollButton(!isNearBottom);
    };

    return (
        <div 
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth relative"
        >
            <div className="max-w-5xl mx-auto space-y-8 min-h-full">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-6">
                            <span className="text-3xl">🤖</span>
                        </div>
                        <h2 className="text-2xl font-semibold mb-2 text-gray-800 dark:text-gray-100">
                            Research Assistant
                        </h2>
                        <p className="text-gray-500 max-w-md">
                            Upload your research papers and ask technical
                            questions.
                        </p>
                    </div>
                ) : (
                    messages.map((msg, idx) => (
                        <MessageBubble key={idx} message={msg} />
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {showScrollButton && (
                <button
                    onClick={scrollToBottom}
                    className="fixed bottom-24 right-8 p-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-full shadow-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 z-50 animate-in fade-in zoom-in"
                    aria-label="Scroll to bottom"
                >
                    <ArrowDown size={20} />
                </button>
            )}
        </div>
    );
}
