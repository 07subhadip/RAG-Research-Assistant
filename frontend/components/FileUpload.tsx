"use client";

import React, { useState, useRef, useEffect } from "react";
import {
    Upload,
    X,
    FileText,
    Loader2,
    CheckCircle2,
    Trash2,
    Database,
} from "lucide-react";
import { uploadPDFs, fetchFiles, clearFiles } from "../lib/api";

interface FileUploadProps {
    onUploadSuccess: () => void;
}

export function FileUpload({ onUploadSuccess }: FileUploadProps) {
    const [files, setFiles] = useState<File[]>([]);
    const [serverFiles, setServerFiles] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
    const [errorMsg, setErrorMsg] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const loadServerFiles = async () => {
        try {
            const data = await fetchFiles();
            setServerFiles(data.files || []);
        } catch (err) {
            console.error("Failed to load files", err);
        }
    };

    useEffect(() => {
        loadServerFiles();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files);
            const pdfs = selectedFiles.filter(
                (f) => f.type === "application/pdf",
            );

            if (pdfs.length !== selectedFiles.length) {
                setErrorMsg("Only PDF files are allowed.");
                setStatus("error");
                return;
            }

            // Total limit check (server files + current staged files + new files)
            if (serverFiles.length + files.length + pdfs.length > 5) {
                setErrorMsg(
                    `Total limit is 5 files. You have ${serverFiles.length} uploaded.`,
                );
                setStatus("error");
                return;
            }

            setStatus("idle");
            setErrorMsg("");
            setFiles((prev) => [...prev, ...pdfs]);
        }
    };

    const removeFile = (index: number) => {
        setFiles(files.filter((_, i) => i !== index));
        setStatus("idle");
    };

    const handleClearSession = async () => {
        if (
            !confirm(
                "Are you sure you want to delete all files and reset the RAG index?",
            )
        )
            return;

        setIsUploading(true);
        try {
            await clearFiles();
            setFiles([]);
            setServerFiles([]);
            setStatus("idle");
            onUploadSuccess(); // Trigger reset in parent if needed
        } catch (e) {
            console.error(e);
            setErrorMsg("Failed to clear files.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleUpload = async () => {
        if (files.length === 0) return;

        setIsUploading(true);
        setStatus("idle");
        setErrorMsg("");

        const formData = new FormData();
        files.forEach((file) => {
            formData.append("files", file);
        });

        try {
            await uploadPDFs(formData);
            setStatus("success");
            setFiles([]); // Clear staged files
            await loadServerFiles(); // Refresh server list
            onUploadSuccess();
            setTimeout(() => setStatus("idle"), 3000);
        } catch (error: any) {
            console.error(error);
            setStatus("error");
            setErrorMsg(error.message || "Upload failed");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    Knowledge Base
                </h2>
                <span
                    className={`text-xs ${serverFiles.length + files.length >= 5 ? "text-orange-500 font-bold" : "text-gray-500"}`}
                >
                    {serverFiles.length + files.length}/5
                </span>
            </div>

            {serverFiles.length > 0 && (
                <div className="mb-4 space-y-2">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-tighter mb-1">
                        Indexed Files
                    </div>
                    {serverFiles.map((fname, i) => (
                        <div
                            key={i}
                            className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded text-xs text-blue-700 dark:text-blue-300"
                        >
                            <Database className="w-3 h-3 shrink-0" />
                            <span className="truncate">{fname}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Upload Area */}
            {serverFiles.length < 5 && (
                <div
                    className={`border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer transition-colors mb-4
                ${status === "error" ? "border-red-300 bg-red-50 dark:bg-red-900/10" : "border-gray-300 dark:border-gray-700 hover:border-blue-500 bg-gray-50 dark:bg-gray-800/50"}
            `}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <Upload className="w-5 h-5 text-gray-400 mb-1" />
                    <p className="text-xs text-gray-500 text-center">
                        Click to upload PDF
                    </p>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".pdf"
                        multiple
                        className="hidden"
                    />
                </div>
            )}

            {status === "error" && (
                <div className="mb-2 text-xs text-red-500 text-center bg-red-100 dark:bg-red-900/20 p-2 rounded">
                    {errorMsg}
                </div>
            )}

            {/* Staged Files */}
            {files.length > 0 && (
                <div className="space-y-2">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-tighter">
                        Ready to Index
                    </div>
                    {files.map((file, i) => (
                        <div
                            key={i}
                            className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs group"
                        >
                            <div className="flex items-center gap-2 overflow-hidden">
                                <FileText className="w-3 h-3 text-gray-500 shrink-0" />
                                <span className="truncate text-gray-700 dark:text-gray-300">
                                    {file.name}
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => removeFile(i)}
                                className="text-gray-400 hover:text-red-500"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}

                    <button
                        type="button"
                        onClick={handleUpload}
                        disabled={isUploading}
                        className="w-full mt-2 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-medium text-xs flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isUploading ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                            "Index New Files"
                        )}
                    </button>
                </div>
            )}

            {serverFiles.length > 0 && !files.length && (
                <button
                    type="button"
                    onClick={handleClearSession}
                    disabled={isUploading}
                    className="w-full mt-4 py-2 border border-gray-200 dark:border-gray-700 hover:bg-red-50 dark:hover:bg-red-900/10 text-red-500 rounded text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                    <Trash2 className="w-3 h-3" />
                    Clear Knowledge Base
                </button>
            )}

            {status === "success" && (
                <div className="mt-2 p-2 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs rounded flex items-center gap-2 justify-center">
                    <CheckCircle2 className="w-3 h-3" />
                    Updated!
                </div>
            )}
        </div>
    );
}
