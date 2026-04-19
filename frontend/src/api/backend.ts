const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export interface SearchPayload {
  query_text: string;
  feed_name?: string;
  feed_author?: string;
  title_keywords?: string;
  limit: number;
}

export interface AIRequestPayload extends SearchPayload {
  provider: string;
  model?: string;
}

// ------------------------
// Helper: clean payload
// ------------------------
const cleanPayload = (payload: AIRequestPayload) => {
  const adjusted: any = { ...payload, provider: payload.provider.toLowerCase() };
  if (!adjusted.model || adjusted.model === "Automatic Model Selection (Model Routing)") {
    delete adjusted.model;
  }
  return adjusted;
};

// ------------------------
// Fetch articles
// ------------------------
export const fetchArticles = async (payload: SearchPayload) => {
  const url = `${VITE_BACKEND_URL}/search/unique-titles`;
  console.log("Fetching URL:", url, "Payload:", payload);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    console.log("Response status:", res.status, "Response body:", text);

    // Attempt to parse JSON, fallback to raw text
    try {
      const data = JSON.parse(text);
      return data.results || [];
    } catch {
      console.warn("Failed to parse JSON, returning raw text");
      return text;
    }
  } catch (err) {
    console.error("Fetch error:", err);
    throw err;
  }
};

// ------------------------
// AI Streaming
// ------------------------
export const aiStream = async (

  payload: AIRequestPayload,
  onUpdate: (text: string, errorMsg?: string, done?: boolean) => void,
  onModelInfo?: (info: string) => void
) => {
  const adjustedPayload = cleanPayload(payload);

  const res = await fetch(`${VITE_BACKEND_URL}/search/ask/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(adjustedPayload),
  });

  if (!res.body) return;

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let done = false;
  let accumulated = "";
  let errorOrTruncateMsg = "";

  while (!done) {
    const { value, done: doneReading } = await reader.read();
    done = doneReading;
    if (value) {
      const chunk = decoder.decode(value, { stream: true });

      // Handle special messages
      if (chunk.startsWith("__model_used__:")) {
        onModelInfo?.(chunk.replace("__model_used__:", "").trim());
      } else if (chunk.startsWith("__error__")) {
        errorOrTruncateMsg = "error";
      } else if (chunk.startsWith("__truncated__")) {
        errorOrTruncateMsg = "truncated";
      } else {
        accumulated += chunk; // normal AI text
      }

      onUpdate(accumulated, errorOrTruncateMsg, false);
    }
  }
  onUpdate(accumulated, errorOrTruncateMsg, true);
};

// ------------------------
// AI Non-Streaming
// ------------------------
export const aiNonStream = async (payload: AIRequestPayload) => {
  const adjustedPayload = cleanPayload(payload);

  const res = await fetch(`${VITE_BACKEND_URL}/search/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(adjustedPayload),
  });

  const data = await res.json();

  return {
    answer: data.answer || "",
    modelUsed: data.model || "",
  };
};
