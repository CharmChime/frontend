const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

type ApiEnvelope<T> = {
  statusCode?: number;
  data: T;
  message?: string;
  success?: boolean;
};

type QueryValue = string | number | boolean | undefined | null;

const buildQuery = (params?: Record<string, QueryValue>) => {
  if (!params) return "";

  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });

  const queryString = query.toString();
  return queryString ? `?${queryString}` : "";
};

async function request<T>(
  path: string,
  options: RequestInit = {},
  params?: Record<string, QueryValue>
): Promise<T> {
  const isFormData = options.body instanceof FormData;
  const response = await fetch(`${API_BASE_URL}${path}${buildQuery(params)}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(options.headers || {}),
    },
  });

  const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;

  if (!response.ok) {
    const message =
      payload?.message ||
      (payload as any)?.detail?.message ||
      response.statusText ||
      "Request failed";
    throw new Error(message);
  }

  return payload?.data as T;
}

async function requestAudio(path: string, body: Record<string, unknown>): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.message || response.statusText || "Audio request failed");
  }

  return response.blob();
}

export type Child = {
  id: string;
  name: string;
  age: number;
  createdAt?: string;
};

export type Parent = {
  id: string;
  fullName: string;
  email: string;
  createdAt?: string;
};

export type Journal = {
  id: string;
  childId: string;
  title: string;
  content: string;
  inputType: "text" | "voice";
  source: "manual" | "speech-to-text";
  moodStatus?: string;
  storyStatus?: string;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Story = {
  id: string;
  childId: string;
  journalId: string;
  title: string;
  content: string;
  theme?: string;
  length?: string;
  createdAt: string;
  updatedAt?: string;
};

export type MoodAnalysis = {
  id?: string;
  journalId?: string;
  childId?: string;
  mood?: string;
  emotion?: string;
  label?: string;
  sentiment?: string;
  confidence?: number;
  emotions?: Record<string, number>;
  allScores?: { label: string; score: number }[];
  createdAt?: string;
  analyzedAt?: string;
};

export const api = {
  auth: {
    childLogin: (body: { name: string; pin: string }) =>
      request<{ child: Child; token: string }>("/v1/auth/child/login", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    childSignup: (body: { name: string; age: string; pin: string; confirmPin: string }) =>
      request<{ child: Child }>("/v1/auth/child/signup", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    parentLogin: (body: { email: string; password: string }) =>
      request<{ parent: Parent; token: string }>("/v1/auth/parent/login", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    parentSignup: (body: {
      fullName: string;
      email: string;
      password: string;
      confirmPassword: string;
    }) =>
      request<{ parent: Parent }>("/v1/auth/parent/signup", {
        method: "POST",
        body: JSON.stringify(body),
      }),
  },
  journals: {
    list: (params: { childId?: string; search?: string; inputType?: string } = {}) =>
      request<{ journals: Journal[]; count: number }>("/v1/journals", {}, params),
    get: (journalId: string) => request<{ journal: Journal }>(`/v1/journals/${journalId}`),
    create: (body: {
      childId: string;
      title?: string;
      content: string;
      inputType: "text" | "voice";
      source: "manual" | "speech-to-text";
    }) =>
      request<{ journal: Journal }>("/v1/journals", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    remove: (journalId: string) =>
      request<{ journal: Journal }>(`/v1/journals/${journalId}`, { method: "DELETE" }),
  },
  mood: {
    analyze: (journalId: string) =>
      request<{ moodAnalysis?: MoodAnalysis; analysis?: MoodAnalysis }>(
        `/v1/mood/analyze/${journalId}`,
        { method: "POST" }
      ),
    byChild: (childId: string) =>
      request<{ moods?: MoodAnalysis[]; moodAnalyses?: MoodAnalysis[]; analyses?: MoodAnalysis[] }>(
        `/v1/mood/child/${childId}`
      ),
  },
  voice: {
    speechToText: (audio: Blob) => {
      const formData = new FormData();
      const extension = audio.type.includes("mp4") ? "mp4" : "webm";
      formData.append("audio", audio, `journal-recording.${extension}`);

      return request<{ transcript: string }>("/v1/voice/speech-to-text", {
        method: "POST",
        body: formData,
      });
    },
    textToSpeech: (body: { text: string; voiceId?: string }) =>
      requestAudio("/v1/voice/text-to-speech", body),
    funVoice: (body: { text: string; voiceStyle: "normal" | "fun" | "story" }) =>
      requestAudio("/v1/voice/fun-voice", body),
  },
  stories: {
    list: (params: { childId?: string; journalId?: string; theme?: string; search?: string } = {}) =>
      request<{ stories: Story[]; count: number }>("/v1/stories", {}, params),
    generate: (body: { journalId: string; theme?: string; length?: "short" | "medium" }) =>
      request<{ story: Story }>("/v1/stories/generate", {
        method: "POST",
        body: JSON.stringify(body),
      }),
  },
  dashboard: {
    overview: (parentId: string) => request<any>(`/v1/dashboard/parent/${parentId}/overview`),
    analytics: (parentId: string) => request<any>(`/v1/dashboard/parent/${parentId}/analytics`),
    insights: (parentId: string) => request<any>(`/v1/dashboard/parent/${parentId}/ai-insights`),
    activity: (parentId: string, params: { type?: string } = {}) =>
      request<any>(`/v1/dashboard/parent/${parentId}/activity-log`, {}, params),
    reports: (parentId: string, params: { range?: string } = {}) =>
      request<any>(`/v1/dashboard/parent/${parentId}/reports`, {}, params),
    children: (parentId: string) =>
      request<{ children: Child[] }>(`/v1/dashboard/parent/${parentId}/children`),
  },
};
