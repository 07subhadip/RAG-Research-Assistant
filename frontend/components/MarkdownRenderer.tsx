"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css"; // Import highlight.js styles

interface MarkdownRendererProps {
    content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
    return (
        <div className="prose dark:prose-invert prose-base max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:leading-relaxed prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-code:text-pink-600 dark:prose-code:text-pink-400 prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-800 prose-th:px-4 prose-th:py-2 prose-td:px-4 prose-td:py-2">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                    code({ node, inline, className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || "");
                        return !inline ? (
                            <div className="relative my-6 rounded-lg overflow-hidden bg-gray-950 border border-gray-800 shadow-md">
                                <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800 text-xs text-gray-400 font-mono">
                                    <span>{match?.[1] || "code"}</span>
                                </div>
                                <div className="overflow-x-auto">
                                    <pre className="!m-0 !p-4 !bg-transparent overflow-x-auto text-sm">
                                        <code className={className} {...props}>
                                            {children}
                                        </code>
                                    </pre>
                                </div>
                            </div>
                        ) : (
                            <code
                                className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-1.5 py-0.5 rounded text-sm font-mono text-pink-600 dark:text-pink-400"
                                {...props}
                            >
                                {children}
                            </code>
                        );
                    },
                    // Table components override for better styling control if needed,
                    // though remark-gfm + prose usually handles it well.
                    table({ children }: any) {
                        return (
                            <div className="overflow-x-auto my-6 rounded-lg border border-gray-200 dark:border-gray-700">
                                <table className="w-full text-left text-sm">
                                    {children}
                                </table>
                            </div>
                        );
                    },
                    thead({ children }: any) {
                        return (
                            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 uppercase tracking-wider font-semibold">
                                {children}
                            </thead>
                        );
                    },
                    th({ children }: any) {
                        return <th className="px-6 py-3">{children}</th>;
                    },
                    td({ children }: any) {
                        return (
                            <td className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                                {children}
                            </td>
                        );
                    },
                    a({ children, href }: any) {
                        return (
                            <a
                                href={href}
                                className="text-blue-600 dark:text-blue-400 hover:underline font-medium break-all"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {children}
                            </a>
                        );
                    },
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
