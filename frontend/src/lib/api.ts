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

// ─── NotebookLM Integration ──────────────────────────────────────────

export async function nlmStatus() {
  const res = await fetch(`${API_URL}/api/nlm/status`);
  return res.json();
}

export async function nlmListNotebooks() {
  const res = await fetch(`${API_URL}/api/nlm/notebooks`);
  return res.json();
}

export async function nlmCreateNotebook(title: string) {
  const res = await fetch(`${API_URL}/api/nlm/notebooks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  return res.json();
}

export async function nlmDeleteNotebook(notebookId: string) {
  const res = await fetch(`${API_URL}/api/nlm/notebooks`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ notebook_id: notebookId }),
  });
  return res.json();
}

export async function nlmAddTextSource(
  notebookId: string,
  title: string,
  content: string
) {
  const res = await fetch(`${API_URL}/api/nlm/sources/text`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      notebook_id: notebookId,
      title,
      content,
    }),
  });
  return res.json();
}

export async function nlmListSources(notebookId: string) {
  const res = await fetch(`${API_URL}/api/nlm/sources/${notebookId}`);
  return res.json();
}

export async function nlmChat(notebookId: string, question: string) {
  const res = await fetchWithRetry(`${API_URL}/api/nlm/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ notebook_id: notebookId, question }),
  });
  return res.json();
}

export async function nlmGenerateAudio(
  notebookId: string,
  instructions?: string
) {
  const res = await fetch(`${API_URL}/api/nlm/generate/audio`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ notebook_id: notebookId, instructions }),
  });
  return res.json();
}

export async function nlmGenerateVideo(
  notebookId: string,
  instructions?: string,
  style?: string
) {
  const res = await fetch(`${API_URL}/api/nlm/generate/video`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      notebook_id: notebookId,
      instructions,
      style,
    }),
  });
  return res.json();
}

export async function nlmGenerateQuiz(
  notebookId: string,
  difficulty?: string
) {
  const res = await fetch(`${API_URL}/api/nlm/generate/quiz`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ notebook_id: notebookId, difficulty }),
  });
  return res.json();
}

export async function nlmGenerateReport(
  notebookId: string,
  customPrompt?: string
) {
  const res = await fetch(`${API_URL}/api/nlm/generate/report`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ notebook_id: notebookId, custom_prompt: customPrompt }),
  });
  return res.json();
}

export async function nlmGenerateMindMap(notebookId: string) {
  const res = await fetch(`${API_URL}/api/nlm/generate/mindmap`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ notebook_id: notebookId }),
  });
  return res.json();
}

export async function nlmGenerateSlides(
  notebookId: string,
  instructions?: string
) {
  const res = await fetch(`${API_URL}/api/nlm/generate/slides`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ notebook_id: notebookId, instructions }),
  });
  return res.json();
}

export async function nlmGenerateInfographic(
  notebookId: string,
  instructions?: string,
  orientation?: string
) {
  const res = await fetch(`${API_URL}/api/nlm/generate/infographic`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      notebook_id: notebookId,
      instructions,
      orientation,
    }),
  });
  return res.json();
}
