// Automatically use the Render URL when deployed, otherwise localhost for local development
const isProd = typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || (isProd ? "https://rag-research-assistant-abz0.onrender.com" : "http://127.0.0.1:8000");

export async function uploadPDFs(formData: FormData) {
    const response = await fetch(`${BASE_URL}/upload-pdfs`, {
        method: "POST",
        body: formData,
    });
    if (!response.ok) {
        const errorData = await response
            .json()
            .catch(() => ({ detail: "Unknown error" }));
        throw new Error(errorData.detail || "Failed to upload files");
    }
    return response.json();
}

export async function fetchFiles() {
    const response = await fetch(`${BASE_URL}/files`);
    if (!response.ok) {
        throw new Error("Failed to fetch files");
    }
    return response.json();
}

export async function clearFiles() {
    const response = await fetch(`${BASE_URL}/files`, {
        method: "DELETE",
    });
    if (!response.ok) {
        throw new Error("Failed to clear files");
    }
    return response.json();
}

export async function checkHealth() {
    const response = await fetch(`${BASE_URL}/health`);
    return response.json();
}

// Session API
export async function createSession(title = "New Chat") {
    const response = await fetch(`${BASE_URL}/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
    });
    return response.json();
}

export async function getSessions() {
    const response = await fetch(`${BASE_URL}/sessions`);
    return response.json();
}

export async function getSession(id: string) {
    const response = await fetch(`${BASE_URL}/sessions/${id}`);
    if (!response.ok) throw new Error("Session not found");
    return response.json();
}

export async function deleteSession(id: string) {
    const response = await fetch(`${BASE_URL}/sessions/${id}`, {
        method: "DELETE",
    });
    return response.json();
}
