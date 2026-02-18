"use client";

import React, { useState, useEffect } from "react";

import { Sidebar } from "@/components/Sidebar";
import { ChatWindow } from "@/components/ChatWindow";
import { ChatInput } from "@/components/ChatInput";
import { GripHorizontal, Github } from "lucide-react";
import { Message } from "@/types/chat";
import { createSession, getSession } from "@/lib/api";

export default function Home() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(
        null,
    );
    const [sidebarRefreshTrigger, setSidebarRefreshTrigger] = useState(false);

    // Initial load
    useEffect(() => {
        // If no session, create one
        const initSession = async () => {
            // Check URL params or localstorage if wanted, but for now just create new if null
            // Actually better UX: Don't create on load, wait for user?
            // Or create one immediately so they can chat.
            // Let's create one.
            try {
                // Check if we have a last session ID in local storage?
                const lastId = localStorage.getItem("lastSessionId");
                if (lastId) {
                    await loadSession(lastId);
                } else {
                    await handleNewChat();
                }
            } catch (e) {
                console.error("Failed init", e);
                await handleNewChat();
            }
        };
        initSession();
    }, []);

    const loadSession = async (id: string) => {
        try {
            setIsLoading(true);
            const data = await getSession(id);
            setMessages(data.messages || []);
            setCurrentSessionId(id);
            localStorage.setItem("lastSessionId", id);
        } catch (e) {
            console.error("Failed to load", e);
            // If 404, maybe create new?
            await handleNewChat();
        } finally {
            setIsLoading(false);
        }
    };

    const handleNewChat = async () => {
        try {
            const session = await createSession();
            setCurrentSessionId(session.id);
            setMessages([]);
            localStorage.setItem("lastSessionId", session.id);
            setSidebarRefreshTrigger((prev) => !prev);
        } catch (e) {
            console.error("Failed create", e);
        }
    };

    const handleSend = async (query: string) => {
        if (!currentSessionId) return;

        const userMsg: Message = { role: "user", content: query };
        const assistantMsgPlaceholder: Message = {
            role: "assistant",
            content: "",
        };

        // Optimistically add user message AND empty assistant message (for thinking state)
        setMessages((prev) => [...prev, userMsg, assistantMsgPlaceholder]);
        setIsLoading(true);

        try {
            const response = await fetch("http://localhost:8000/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query, session_id: currentSessionId }),
            });

            if (!response.body) throw new Error("No response body");

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            let buffer = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop() || "";

                for (const line of lines) {
                    if (line.startsWith("data: ")) {
                        const dataStr = line.replace("data: ", "").trim();
                        if (dataStr === "[DONE]") break;

                        try {
                            const data = JSON.parse(dataStr);
                            if (data.token) {
                                // Update state directly - finding last assistant message
                                setMessages((prev) => {
                                    const newMessages = [...prev];
                                    const lastIndex = newMessages.length - 1;
                                    const lastMsg = newMessages[lastIndex];

                                    if (lastMsg.role === "assistant") {
                                        newMessages[lastIndex] = {
                                            ...lastMsg,
                                            content:
                                                lastMsg.content + data.token,
                                        };
                                    }
                                    return newMessages;
                                });
                            } else if (data.error) {
                                setMessages((prev) => {
                                    const newMessages = [...prev];
                                    const lastIndex = newMessages.length - 1;
                                    const lastMsg = newMessages[lastIndex];
                                    if (lastMsg.role === "assistant") {
                                        newMessages[lastIndex] = {
                                            ...lastMsg,
                                            content: `Error: ${data.error}`,
                                        };
                                    }
                                    return newMessages;
                                });
                            }
                        } catch (e) {
                            console.error("Error parsing JSON chunk", e);
                        }
                    }
                }
            }
            // Trigger sidebar refresh to update title if it was new chat
            setSidebarRefreshTrigger((prev) => !prev);
        } catch (err) {
            console.error(err);
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: "Failed to connect to the server.",
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 overflow-hidden font-sans">
            {isSidebarOpen && (
                <Sidebar
                    isOpen={isSidebarOpen}
                    onNewChat={handleNewChat}
                    onUploadSuccess={() => {}}
                    onSelectSession={loadSession}
                    currentSessionId={currentSessionId}
                    needsRefresh={sidebarRefreshTrigger}
                />
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full relative border-l border-gray-200 dark:border-gray-800">
                {/* Header */}
                <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-gray-950/80 backdrop-blur-sm z-10 sticky top-0 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500 transition-colors"
                        >
                            <GripHorizontal size={20} />
                        </button>
                        <h1 className="font-bold text-lg text-gray-800 dark:text-gray-100 tracking-tight">
                            RAG Research Assistant
                        </h1>
                        {isLoading && (
                            <div className="flex items-center gap-2 ml-4 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 rounded-full">
                                <div className="w-3 h-3 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                                    Processing
                                </span>
                            </div>
                        )}
                    </div>
                    <a
                        href="https://github.com/07subhadip"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        title="View on GitHub"
                    >
                        <Github size={20} />
                    </a>
                </header>

                {/* Chat Window */}
                <ChatWindow
                    messages={messages}
                    isLoading={isLoading}
                    onScrollToBottom={() => {}}
                />

                {/* Input */}
                <div className="p-6 bg-white dark:bg-gray-950">
                    <ChatInput onSend={handleSend} isLoading={isLoading} />
                </div>
            </div>
        </div>
    );
}
