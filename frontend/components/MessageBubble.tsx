"use client";

import React from "react";

import { MarkdownRenderer } from "./MarkdownRenderer";
import { User, Sparkles, ThumbsUp, ThumbsDown, Copy } from "lucide-react";

interface Message {
    role: "user" | "assistant";
    content: string;
}

export function MessageBubble({ message }: { message: Message }) {
    const isUser = message.role === "user";

    if (isUser) {
        return (
            <div className="flex w-full justify-end mb-8">
                <div className="flex max-w-[85%] md:max-w-[75%] flex-row-reverse items-start gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm bg-gray-900 dark:bg-gray-100">
                        <User
                            size={16}
                            className="text-gray-100 dark:text-gray-900"
                        />
                    </div>

                    <div className="relative px-5 py-3 rounded-2xl shadow-sm bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tr-sm">
                        <div className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                            {message.content}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Assistant Layout (Wider, no container bubble background mainly, just content)
    return (
        <div className="flex w-full justify-start mb-10 group">
            <div className="flex w-full flex-row items-start gap-4 md:gap-6">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm bg-gradient-to-br from-indigo-500 to-purple-600 mt-1">
                    <Sparkles size={16} className="text-white" />
                </div>

                <div className="flex-1 min-w-0 overflow-hidden">
                    {/* Main content area */}
                    <div className="prose dark:prose-invert prose-base max-w-none">
                        {!message.content ? (
                            <div className="flex items-center gap-4 mt-1">
                                <div className="relative flex items-center justify-center p-1 rounded-full bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800">
                                    <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                                <span className="text-sm font-medium text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600 animate-pulse">
                                    Thinking...
                                </span>
                            </div>
                        ) : (
                            <MarkdownRenderer content={message.content} />
                        )}
                    </div>

                    {/* Action Buttons Footer for Assistant */}
                    {!isUser && message.content && (
                        <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button
                                className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-all"
                                title="Good response"
                            >
                                <ThumbsUp size={14} />
                            </button>
                            <button
                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-all"
                                title="Bad response"
                            >
                                <ThumbsDown size={14} />
                            </button>
                            <button
                                onClick={() =>
                                    navigator.clipboard.writeText(
                                        message.content,
                                    )
                                }
                                className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-all ml-1"
                                title="Copy to clipboard"
                            >
                                <Copy size={14} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
