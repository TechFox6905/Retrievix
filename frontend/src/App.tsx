import { useState } from "react";
import { useChat } from "./hooks/useChat";
import { useAutoScroll } from "./hooks/useAutoScroll";
import ChatMessage from "./components/ChatMessage";
import UnifiedForm from "./components/UnifiedForm";

import { providers, getModelsForProvider } from "./data/modelRegistry";
import { feeds } from "./data/feedsAndProviders";
import type { FormState } from "./types";
import EmptyState from "./components/EmptyState";

const App: React.FC = () => {
  const [mode, setMode] = useState<"Search" | "AI">("AI");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [formState, setFormState] = useState<FormState>({
    query_text: "",
    provider: providers[0],
    model: "",
    streamingMode: "Streaming",
  });

  const { messages, loading, formError, handleSubmit } = useChat(mode);

  const chatEndRef = useAutoScroll(messages);

  const handleFormChange = (newState: FormState) => {
    setFormState(newState);
  };

  const feedNames = feeds.map((f) => f.name);
  const feedAuthors = feeds.map((f) => f.author);

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">

      {/* SIDEBAR */}
      <div className="w-64 bg-gray-800 border-r border-gray-700 p-4 hidden md:block">
        <h2 className="font-bold mb-4">📰 Feeds</h2>
        {feeds.map((f, i) => (
          <div key={i} className="p-2 hover:bg-gray-700 rounded cursor-pointer text-sm">
            {f.name}
          </div>
        ))}
      </div>

      {/* CHAT AREA */}
      <div className="flex flex-col flex-1">

        <div className="flex justify-center mt-4 gap-2">
          {["AI", "Search"].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m as "AI" | "Search")}
              className={`px-4 py-1 rounded-full text-sm ${
                mode === m
                  ? "bg-orange-500 text-white"
                  : "bg-gray-700 text-gray-300"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* CHAT */}
        <div className="flex-1 overflow-y-auto p-6">
          {messages.length === 0 ? (
            <EmptyState
              formState={formState}
              handleFormChange={handleFormChange}
              handleSubmit={handleSubmit}
            />
          ) : (
            <div className="space-y-6">
              {messages.map((msg) => (
                <ChatMessage key={msg.id} msg={msg} />
              ))}
              {/* Loading */}
              {loading && (
                <div className="max-w-3xl mx-auto text-gray-400 text-sm animate-pulse">
                  AI is thinking...
                </div>
              )}

              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        {/* INPUT */}
        <div className="p-4 border-t border-gray-700 bg-gray-900">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(formState);
          }}
          className="max-w-3xl mx-auto"
        >
          <div className="flex items-center bg-gray-800 rounded-2xl px-4 py-3 shadow border border-gray-700 focus-within:border-orange-500">

            <input
              type="text"
              placeholder="Ask anything..."
              value={formState.query_text}
              onChange={(e) =>
                handleFormChange({ ...formState, query_text: e.target.value })
              }
              className="flex-1 bg-transparent outline-none text-white placeholder-gray-400"
              autoFocus
            />

            <button
              type="button"
              className="ml-3 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
              onClick={() => setShowAdvanced(true)}
            >
              ⚙️ 
            </button>

            <button
              type="submit"
              className="ml-3 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg"
            >
              ➤
            </button>
          </div>
        </form>
        
        {formError && (
          <div className="text-red-400 text-sm mt-2">
            {formError}
          </div>
        )}
      </div>
      
      {/* ADVANCED SETTINGS MODAL */}
      {showAdvanced && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-xl w-full max-w-xl">

            <UnifiedForm
              mode={mode}
              formState={formState}
              onFormChange={handleFormChange}
              onSubmit={(payload) => {
                handleSubmit(payload);
                setShowAdvanced(false);
              }}
              providers={providers}
              models={getModelsForProvider(formState.provider)}
              feedNames={feedNames}
              feedAuthors={feedAuthors}
              hideQueryField
            />

            <button
              onClick={() => setShowAdvanced(false)}
              className="mt-4 text-red-400"
            >
              Close
            </button>
          </div>
        </div>
      )}
      

      </div>
    </div>
  );
};

export default App;