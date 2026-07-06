const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function postChat(sourceText: string, question: string) {
  try {
    const res = await fetch(`${API_URL}/api/chat`, {
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
  const res = await fetch(`${API_URL}/api/audio`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ source_text: sourceText }),
  });
  return res.blob();
}

export async function postImage(sourceText: string) {
  const res = await fetch(`${API_URL}/api/image`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ source_text: sourceText }),
  });
  return res.blob();
}

export async function postVideo(sourceText: string) {
  const res = await fetch(`${API_URL}/api/video`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ source_text: sourceText }),
  });
  return res.blob();
}
