import React, { useState, useRef, useEffect } from "react";
import Select from "react-select";

interface UnifiedFormProps {
  mode: "Search" | "AI";
  feedNames: string[];
  feedAuthors: string[];
  providers?: string[];
  models?: string[];
  formState: any;
  onFormChange: (state: any) => void;
  onSubmit: (payload: any) => void;
  hideQueryField?: boolean;
}

const streamingModes = ["Streaming", "Non-Streaming"] as const;

// Tailwind-inspired react-select theme
const selectStyles = {
  control: (base: any) => ({
    ...base,
    borderRadius: "0.375rem",
    borderColor: "#D1D5DB", // Tailwind gray-300
    padding: "0.25rem",
    "&:hover": { borderColor: "#9CA3AF" }, // Tailwind gray-400
    boxShadow: "none",
    minHeight: "2.5rem",
    backgroundColor: "white",
  }),
  menu: (base: any) => ({
    ...base,
    borderRadius: "0.375rem",
    backgroundColor: "white",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    zIndex: 50,
  }),
  option: (base: any, state: any) => ({
    ...base,
    backgroundColor: state.isFocused ? "#FBBF24" : "white", // Tailwind yellow-400 on hover
    color: state.isSelected ? "white" : "#111827", // Tailwind gray-900
    cursor: "pointer",
    padding: "0.5rem 1rem",
  }),
  placeholder: (base: any) => ({
    ...base,
    color: "#9CA3AF", // Tailwind gray-400
  }),
  singleValue: (base: any) => ({
    ...base,
    color: "#111827",
  }),
};

const UnifiedForm: React.FC<UnifiedFormProps> = ({
  mode,
  feedNames,
  feedAuthors,
  providers = [],
  models = [],
  formState,
  onFormChange,
  onSubmit,
  hideQueryField,
}) => {
  const _hideQueryField = hideQueryField ?? false;
  const queryText = formState.query_text || "";
  const feedName =
    formState.feed_nameObj ||
    (formState.feed_name ? { value: formState.feed_name, label: formState.feed_name } : null);
  const feedAuthor =
    formState.feed_authorObj ||
    (formState.feed_author ? { value: formState.feed_author, label: formState.feed_author } : null);
  const titleKeywords = formState.title_keywords || "";
  const limit = formState.limit ?? 5;
  const provider = formState.provider || (providers[0] ?? "");
  const model = formState.model || "";
  const streamingMode = formState.streamingMode || "Streaming";

  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const handleChange = (field: string, value: any) => {
    onFormChange({ ...formState, [field]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = {
      query_text: queryText,
      feed_name: feedName?.value ?? "",
      feed_nameObj: feedName,
      feed_author: feedAuthor?.value ?? "",
      feed_authorObj: feedAuthor,
      title_keywords: titleKeywords,
      limit,
    };
    if (mode === "AI") {
      payload.provider = provider;
      payload.model = model;
      payload.streamingMode = streamingMode;
    }
    onSubmit(payload);
  };

  // Hide tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setShowTooltip(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col gap-4">
        {!_hideQueryField && (
          <textarea
            className="w-full p-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-800 dark:border-gray-700"
            placeholder="Type your query here..."
            value={queryText}
            onChange={(e) => handleChange("query_text", e.target.value)}
            rows={6}
          />
        )}

        {/* Author Select */}
        <Select
          options={feedAuthors.map((fa) => ({ value: fa, label: fa }))}
          value={feedAuthor}
          onChange={(option: any) => handleChange("feed_authorObj", option)}
          isClearable
          placeholder="Select Author (optional)"
          styles={selectStyles}
        />

        {/* Newsletter Select */}
        <Select
          options={feedNames.map((fn) => ({ value: fn, label: fn }))}
          value={feedName}
          onChange={(option: any) => handleChange("feed_nameObj", option)}
          isClearable
          placeholder="Select Newsletter (optional)"
          styles={selectStyles}
        />

        {mode === "Search" && (
          <>
            <div className="relative w-full" ref={tooltipRef}>
              <input
                type="text"
                className="w-full p-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-800 dark:border-gray-700"
                placeholder="Title Keywords (optional)"
                value={titleKeywords}
                onChange={(e) => handleChange("title_keywords", e.target.value)}
              />

              {/* Question mark icon */}
              <span
                className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 cursor-pointer"
                onClick={() => setShowTooltip(!showTooltip)}
              >
                ?
              </span>

              {/* Tooltip */}
              {showTooltip && (
                <div className="absolute right-6 top-1/2 -translate-y-1/2 bg-gray-700 text-white text-xs rounded py-1 px-2 w-max whitespace-nowrap z-50">
                  Keywords present in the title
                </div>
              )}
            </div>

            {/* Number of results */}
            <div>
              <label className="block text-sm font-medium mb-1">Number of results: {limit}</label>
              <input
                type="range"
                min={1}
                max={20}
                value={limit}
                onChange={(e) => handleChange("limit", Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
            </div>
          </>
        )}

        {/* AI mode options */}
        {mode === "AI" && (
          <div className="flex flex-col gap-2">
            <select
              value={provider}
              onChange={(e) => handleChange("provider", e.target.value)}
              className="w-full p-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-800 dark:border-gray-700"
            >
              {providers.map((p, idx) => (
                <option key={idx} value={p}>
                  {p}
                </option>
              ))}
            </select>

            <select
              value={model}
              onChange={(e) => handleChange("model", e.target.value)}
              className="w-full p-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-800 dark:border-gray-700"
            >
              {models.map((m, idx) => (
                <option key={idx} value={m}>
                  {m}
                </option>
              ))}
            </select>

            <div className="flex gap-4 items-center text-sm">
              <span className="font-medium">Answer:</span>
              {streamingModes.map((sm) => (
                <label key={sm} className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="streamingMode"
                    value={sm}
                    checked={streamingMode === sm}
                    onChange={() => handleChange("streamingMode", sm)}
                    className="accent-orange-500"
                  />
                  {sm}
                </label>
              ))}
            </div>
          </div>
        )}

        <button
          type="submit"
          className="w-full py-2 px-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-md shadow transition"
        >
          🤖 Submit
        </button>
      </div>
    </form>
  );
};

export default UnifiedForm;
