export interface Message {
    role: "user" | "assistant";
    content: string;
}

export interface UploadStatus {
    status: "idle" | "success" | "error";
    message?: string;
    files?: string[];
}

export interface ChatSession {
    id: string;
    title: string;
    created_at: string;
    updated_at: string;
}
