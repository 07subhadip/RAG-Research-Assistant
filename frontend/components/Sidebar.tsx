"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import React, { useEffect, useState, useRef } from "react";
import { FileUpload } from "./FileUpload";
import { Plus, MessageSquare, Trash2 } from "lucide-react";
import { ChatSession } from "@/types/chat";
import { getSessions, deleteSession, createSession } from "@/lib/api";

interface SidebarProps {
    isOpen: boolean;
    onNewChat: () => void;
    onUploadSuccess: () => void;
    onSelectSession: (id: string) => void;
    currentSessionId: string | null;
    needsRefresh?: boolean; // triggering refresh
}

export function Sidebar({
    isOpen,
    onSelectSession,
    currentSessionId,
    onNewChat,
    onUploadSuccess,
    needsRefresh,
}: SidebarProps) {
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const sidebarRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (isOpen) {
            gsap.to(sidebarRef.current, {
                width: "20rem",
                duration: 0.8,
                ease: "power2.inOut",
            });
        } else {
            gsap.to(sidebarRef.current, {
                width: 0,
                duration: 0.8,
                ease: "power2.inOut",
            });
        }
    }, [isOpen]);

    const loadSessions = async () => {
        try {
            const data = await getSessions();
            setSessions(data.sessions || []);
        } catch (err) {
            console.error("Failed to load sessions", err);
        }
    };

    useEffect(() => {
        loadSessions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [needsRefresh, currentSessionId]); // Also reload when session changes to update titles if needed

    const handleDeleteSession = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!confirm("Delete this chat?")) return;
        try {
            await deleteSession(id);
            await loadSessions();
            if (id === currentSessionId) {
                onNewChat();
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div
            ref={sidebarRef}
            className="w-0 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex-shrink-0 overflow-hidden flex flex-col h-full"
        >
            <div className="w-80 min-w-80 flex flex-col h-full">
                <div className="p-4 flex-1 overflow-y-auto">
                    <button
                        onClick={onNewChat}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg transition-colors mb-6 border border-gray-200 dark:border-gray-700 shadow-sm font-medium text-sm"
                    >
                        <Plus size={16} />
                        New Research
                    </button>

                    <div className="mb-8">
                        <FileUpload onUploadSuccess={onUploadSuccess} />
                    </div>

                    <div>
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 px-2">
                            History
                        </h3>
                        <div className="space-y-1">
                            {sessions.map((session) => (
                                <div
                                    key={session.id}
                                    onClick={() => onSelectSession(session.id)}
                                    className={`px-3 py-2 rounded-md cursor-pointer text-sm truncate flex items-center justify-between group
                                ${
                                    currentSessionId === session.id
                                        ? "bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium"
                                        : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
                                }
                            `}
                                >
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <MessageSquare
                                            size={14}
                                            className="shrink-0"
                                        />
                                        <span className="truncate">
                                            {session.title}
                                        </span>
                                    </div>

                                    <button
                                        onClick={(e) =>
                                            handleDeleteSession(e, session.id)
                                        }
                                        className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-opacity"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            ))}
                            {sessions.length === 0 && (
                                <div className="px-3 py-2 text-xs text-gray-400 italic">
                                    No previous chats
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                    <div className="flex items-center gap-3 px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer transition-colors">
                        <div className="relative">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-sm" />
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500 text-[8px] items-center justify-center text-white font-bold">
                                    β
                                </span>
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                User
                            </span>
                            <span className="text-xs text-gray-500">
                                Demo User
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
