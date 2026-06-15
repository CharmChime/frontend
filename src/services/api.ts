const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

type ApiEnvelope<T> = {
  statusCode?: number;
  data: T;
  message?: string;
  success?: boolean;
  errors?: unknown[];
  code?: string;
};

type QueryValue = string | number | boolean | undefined | null;
type UserType = "parent" | "child";

export class ApiRequestError extends Error {
  statusCode?: number;
  errors: unknown[];
  code?: string;

  constructor(message: string, statusCode?: number, errors: unknown[] = [], code?: string) {
    super(message);
    this.name = "ApiRequestError";
    this.statusCode = statusCode;
    this.errors = errors;
    this.code = code;
  }
}

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

const getStoredToken = (userType: UserType) => {
  const key = userType === "parent" ? "charmchime_parent_token" : "charmchime_child_token";
  return localStorage.getItem(key) || "";
};

const authHeaders = (userType: UserType) => {
  const token = getStoredToken(userType);
  return token ? { Authorization: `Bearer ${token}` } : {};
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
    throw new ApiRequestError(message, response.status, payload?.errors || [], payload?.code);
  }

  return payload?.data as T;
}

const audioPayloadToBlob = async (payload: any): Promise<Blob> => {
  const audioData = payload?.data || payload;
  const audioBase64 = audioData?.audioBase64 || audioData?.base64 || audioData?.audio;
  const audioUrl = audioData?.audioUrl || audioData?.url;

  if (audioBase64) {
    const normalized = String(audioBase64).includes(",")
      ? String(audioBase64).split(",").pop() || ""
      : String(audioBase64);
    const binary = atob(normalized);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new Blob([bytes], { type: audioData?.mimeType || "audio/mpeg" });
  }

  if (audioUrl) {
    const audioResponse = await fetch(audioUrl);
    if (!audioResponse.ok) {
      throw new Error("Audio request failed");
    }
    return audioResponse.blob();
  }

  throw new Error(payload?.message || "Audio response was not playable");
};

async function requestAudio(path: string, body: Record<string, unknown>): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new ApiRequestError(
      payload?.message || response.statusText || "Audio request failed",
      response.status,
      payload?.errors || [],
      payload?.code
    );
  }

  const contentType = response.headers.get("Content-Type") || "";
  if (contentType.includes("application/json")) {
    const payload = await response.json();
    return audioPayloadToBlob(payload);
  }

  return response.blob();
}

async function requestBlob(
  path: string,
  options: RequestInit = {},
  params?: Record<string, QueryValue>
): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}${path}${buildQuery(params)}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new ApiRequestError(
      payload?.message || response.statusText || "Download failed",
      response.status,
      payload?.errors || [],
      payload?.code
    );
  }

  return response.blob();
}

export type Child = {
  id: string;
  parentId?: string;
  name: string;
  nickname?: string;
  email?: string;
  age: number;
  avatar?: string;
  preferences?: Record<string, unknown>;
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type Parent = {
  id: string;
  name?: string;
  fullName: string;
  email: string;
  phone?: string;
  notificationPreferences?: Record<string, unknown>;
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type ChildProfileUpdate = {
  name?: string;
  nickname?: string;
  age?: number;
  avatar?: string;
  preferences?: Record<string, unknown>;
};

export type ParentProfileUpdate = {
  name?: string;
  phone?: string;
  notificationPreferences?: Record<string, unknown>;
};

export type OtpUserType = "parent" | "child";

export type OtpContext = {
  userType: OtpUserType;
  email: string;
};

export type OtpResponse = {
  otp: {
    id: string;
    userType: OtpUserType;
    userId: string;
    destination: string;
    expiresAt: string;
    maxAttempts: number;
  };
};

export type Journal = {
  id: string;
  childId: string;
  title: string;
  content: string;
  inputType: "text" | "voice";
  source: "manual" | "speech-to-text";
  moodStatus?: string;
  moodAnalysisId?: string;
  moodSentiment?: string;
  moodConfidence?: number | null;
  moodAnalyzedAt?: string;
  aiFeedback?: JournalFeedback;
  storyStatus?: string;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
};

export type JournalFeedback = {
  message: string;
  reflectionPrompt: string;
  suggestedAction: string;
  source?: string;
  reason?: string;
  mood?: string;
  confidence?: number | null;
  generatedAt?: string;
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
  status?: string;
  reason?: string;
  sentiment?: string;
  confidence?: number;
  emotions?: Record<string, number>;
  allScores?: { label: string; score: number }[];
  createdAt?: string;
  analyzedAt?: string;
};

export type JournalCreateResponse = {
  journal: Journal;
  mood?: MoodAnalysis | null;
  aiFeedback?: JournalFeedback | null;
  feedback?: JournalFeedback | null;
};

export const api = {
  auth: {
    childLogin: (body: { name: string; pin: string }) =>
      request<{ child: Child; token: string }>("/v1/auth/child/login", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    childSignup: (body: { name: string; email: string; age: string; pin: string; confirmPin: string }) =>
      request<{ child: Child }>("/v1/auth/child/signup", {
        method: "POST",
        headers: authHeaders("parent"),
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
    verifyOtp: (body: OtpContext & { otp: string }) =>
      request<{ userType: OtpUserType; user: Parent | Child; isVerified: boolean }>(
        "/v1/auth/verify-otp",
        {
          method: "POST",
          body: JSON.stringify(body),
        }
      ),
    resendOtp: (body: OtpContext) =>
      request<OtpResponse>("/v1/auth/resend-otp", {
        method: "POST",
        body: JSON.stringify(body),
      }),
  },
  children: {
    me: () =>
      request<{ child: Child }>("/v1/children/me", {
        headers: authHeaders("child"),
      }),
    updateMe: (body: ChildProfileUpdate) =>
      request<{ child: Child }>("/v1/children/me", {
        method: "PATCH",
        headers: authHeaders("child"),
        body: JSON.stringify(body),
      }),
  },
  parents: {
    me: () =>
      request<{ parent: Parent }>("/v1/parents/me", {
        headers: authHeaders("parent"),
      }),
    updateMe: (body: ParentProfileUpdate) =>
      request<{ parent: Parent }>("/v1/parents/me", {
        method: "PATCH",
        headers: authHeaders("parent"),
        body: JSON.stringify(body),
      }),
    children: () =>
      request<{ children: Child[]; count: number }>("/v1/parents/me/children", {
        headers: authHeaders("parent"),
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
      request<JournalCreateResponse>("/v1/journals", {
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
    storyTts: (body: { text: string; voiceId?: string }) =>
      requestAudio("/v1/voice/story-tts", body),
    feedbackTts: (body: { text: string; voiceId?: string }) =>
      requestAudio("/v1/voice/feedback-tts", body),
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
    overview: (_parentId?: string, params: { childId?: string } = {}) =>
      request<any>("/v1/dashboard/overview", { headers: authHeaders("parent") }, params),
    analytics: (_parentId?: string, params: { childId?: string } = {}) =>
      request<any>("/v1/dashboard/analytics", { headers: authHeaders("parent") }, params),
    insights: (_parentId?: string, params: { childId?: string } = {}) =>
      request<any>("/v1/dashboard/ai-insights", { headers: authHeaders("parent") }, params),
    activity: (
      _parentId?: string,
      params: { type?: string; childId?: string; limit?: number } = {}
    ) => request<any>("/v1/dashboard/activity-log", { headers: authHeaders("parent") }, params),
    reports: (
      _parentId?: string,
      params: { range?: string; childId?: string; from?: string; to?: string } = {}
    ) => request<any>("/v1/dashboard/reports", { headers: authHeaders("parent") }, params),
    children: (_parentId?: string) =>
      request<{ children: Child[] }>("/v1/dashboard/children", { headers: authHeaders("parent") }),
  },
  reports: {
    summary: (params: { childId?: string; from?: string; to?: string; range?: string } = {}) =>
      request<any>("/v1/reports/summary", { headers: authHeaders("parent") }, params),
    pdf: (params: { childId?: string; from?: string; to?: string; range?: string } = {}) =>
      requestBlob("/v1/reports/pdf", { headers: authHeaders("parent") }, params),
  },
};
