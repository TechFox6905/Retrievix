export const createMessage = (
  role: "user" | "ai" | "search",
  content: string | any[],
  extra: Partial<{ done: boolean }> = {}
) => ({
  id: crypto.randomUUID(),
  role,
  content,
  ...extra,
});