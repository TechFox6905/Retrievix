import { useState } from "react";
import { fetchArticles, aiStream, aiNonStream } from "../api/backend";
import { createMessage } from "../utils/messageFactory.ts";
import type { Message } from "../types";

export const useChat = (mode: "AI" | "Search") => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const handleSubmit = async (payload: any) => {
    if (!payload.query_text.trim()) {
      setFormError("Please enter a query.");
      return;
    }

    setLoading(true);

    // USER MESSAGE
    setMessages((prev) => [
      ...prev,
      createMessage("user", payload.query_text),
    ]);

    try {
      if (mode === "Search") {
        const results = await fetchArticles(payload);

        setMessages((prev) => [
          ...prev,
          createMessage("search", results),
        ]);
      } else {
        // AI placeholder
        setMessages((prev) => [
          ...prev,
          createMessage("ai", "", { done: false }),
        ]);

        if (payload.streamingMode === "Streaming") {
          await aiStream(payload, (text: string, err: any, done?: boolean) => {
            if (err) {
              setFormError("Streaming failed");
              return;
            }

            setMessages((prev) =>
              prev.map((msg, i) =>
                i === prev.length - 1
                  ? { ...msg, content: text, done: done || false }
                  : msg
              )
            );
          });
        } else {
          const { answer } = await aiNonStream(payload);

          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              content: answer,
              done: true,
            };
            return updated;
          });
        }
      }
    } catch {
      setFormError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return {
    messages,
    loading,
    formError,
    handleSubmit,
  };
};