const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface ApiOptions {
    method?: string;
    body?: any;
    token?: string;
    headers?: Record<string, string>;
}

export async function api<T = any>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const { method = 'GET', body, token, headers = {} } = options;

    const config: RequestInit = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...headers,
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    const res = await fetch(`${API_URL}${endpoint}`, config);

    if (!res.ok) {
        const error = await res.json().catch(() => ({ error: 'Request failed' }));
        const message = Array.isArray(error.details)
            ? error.details.map((d: any) => `${d.field}: ${d.message}`).join(', ')
            : error.details || error.error || `HTTP ${res.status}`;
        throw new Error(message);
    }

    return res.json();
}

// Auth-specific API calls
export async function googleAuth(credential: string) {
    return api<{
        user: { id: string; email: string; full_name: string; avatar_url?: string };
        token: string;
        onboarding_done: boolean;
    }>('/auth/google', {
        method: 'POST',
        body: { credential },
    });
}

// Onboarding API calls
export async function getOnboardingProfile(token: string) {
    return api('/onboarding/profile', { token });
}

export async function saveOnboardingProfile(token: string, data: any) {
    return api('/onboarding/profile', { method: 'POST', token, body: data });
}

export async function getResumeUploadUrl(token: string, contentType: string) {
    return api<{ upload_url: string; storage_key: string }>('/onboarding/resume-url', {
        method: 'POST',
        token,
        body: { content_type: contentType },
    });
}

export async function uploadFileToS3(uploadUrl: string, file: File | Blob) {
    const res = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type || 'audio/webm' },
        body: file,
    });
    if (!res.ok) throw new Error('File upload failed');
}

// ── Interview API ───────────────────────────────────────────

export interface Interview {
    id: string;
    user_id: string;
    name: string;
    company?: string;
    round?: string;
    interview_type: string;
    status: string;
    failure_reason?: string;
    interviewed_at: string;
    created_at: string;
}

export async function createInterview(token: string, data: {
    name: string;
    company?: string;
    round?: string;
    interview_type: string;
}) {
    return api<Interview>('/interviews', { method: 'POST', token, body: data });
}

export async function getInterview(token: string, id: string) {
    return api<Interview & { metrics?: any[] }>(`/interviews/${id}`, { token });
}

export async function listInterviews(token: string) {
    return api<Interview[]>('/interviews', { token });
}

export async function getMediaUploadUrl(token: string, interviewId: string, mediaType: string, contentType: string) {
    return api<{ upload_url: string; storage_key: string }>(`/interviews/${interviewId}/media-url`, {
        method: 'POST',
        token,
        body: { media_type: mediaType, content_type: contentType },
    });
}

export async function triggerAnalysis(token: string, interviewId: string) {
    return api<{ message: string; status: string }>(`/interviews/${interviewId}/analyze`, {
        method: 'POST',
        token,
    });
}
