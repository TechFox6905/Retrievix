type Role = "user" | "ai" | "search";

export interface Message {
  id: string;
  role: Role;
  content: string | any[];
  done?: boolean;
}

export interface FormState {
  query_text: string;
  provider: string;
  model: string;
  streamingMode: "Streaming" | "Non-Streaming";
}
