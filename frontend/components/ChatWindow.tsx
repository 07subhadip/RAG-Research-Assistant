"use client";

import React, { useRef, useEffect } from "react";
import { MessageBubble } from "./MessageBubble";
import { Message } from "../types/chat";

interface ChatWindowProps {
    messages: Message[];
    isLoading: boolean;
}

export function ChatWindow({
    messages,
    isLoading,
}: ChatWindowProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    return (
        <div className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
            <div className="max-w-5xl mx-auto space-y-8">
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
        </div>
    );
}
