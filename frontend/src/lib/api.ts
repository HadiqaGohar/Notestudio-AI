const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const MAX_RETRIES = 3;
const BASE_DELAY = 3000;

async function fetchWithRetry(
  url: string,
  init: RequestInit,
  retries = MAX_RETRIES
): Promise<Response> {
  const res = await fetch(url, init);
  if (res.status === 429 && retries > 0) {
    const retryAfter = res.headers.get("retry-after");
    const delay = retryAfter
      ? parseInt(retryAfter, 10) * 1000
      : BASE_DELAY * (2 ** (MAX_RETRIES - retries));
    await new Promise((r) => setTimeout(r, delay));
    return fetchWithRetry(url, init, retries - 1);
  }
  return res;
}

export async function postChat(sourceText: string, question: string) {
  try {
    const res = await fetchWithRetry(`${API_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source_text: sourceText, question }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { error: true, detail: data.detail || "Something went wrong." };
    }
    return data;
  } catch {
    return { error: true, detail: "Could not connect to the backend server." };
  }
}

export async function postAudio(sourceText: string) {
  try {
    const res = await fetchWithRetry(`${API_URL}/api/audio`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source_text: sourceText }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { error: true, detail: data.detail || "Audio generation failed." };
    }
    return data;
  } catch {
    return { error: true, detail: "Could not connect to the backend server." };
  }
}

export async function postImage(sourceText: string) {
  const res = await fetchWithRetry(`${API_URL}/api/image`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ source_text: sourceText }),
  });
  return res.blob();
}

export async function postVideo(sourceText: string) {
  try {
    const res = await fetchWithRetry(`${API_URL}/api/video`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source_text: sourceText }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { error: true, detail: data.detail || "Video generation failed." };
    }
    return data;
  } catch {
    return { error: true, detail: "Could not connect to the backend server." };
  }
}
