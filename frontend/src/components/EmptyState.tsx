import type { FormState } from "../types";

type Props = {
  formState: FormState;
  handleFormChange: (state: FormState) => void;
  handleSubmit: (payload: FormState) => void;
};

const suggestions = [
  "Summarize latest RAG trends",
  "Compare vLLM vs TGI",
  "Best AI newsletters this week",
  "Explain MCP architecture",
];

export default function EmptyState({
  formState,
  handleFormChange,
  handleSubmit,
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 text-center">

      <h1 className="text-4xl font-bold text-white mb-4">
        AI Research Assistant
      </h1>

      <p className="text-gray-400 max-w-2xl mb-10">
        Search across curated AI feeds and get streaming,
        source-grounded answers instantly.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl">

        {suggestions.map((item, i) => (
          <button
            key={i}
            onClick={() => {
              const payload = {
                ...formState,
                query_text: item,
              };

              handleFormChange(payload);
              handleSubmit(payload);
            }}
            className="
              bg-gray-800/70
              hover:bg-gray-700
              border border-gray-700
              hover:border-orange-500
              rounded-2xl
              p-5
              text-left
              transition
            "
          >
            <div className="text-white font-medium">
              {item}
            </div>

            <div className="text-sm text-gray-400 mt-2">
              Click to try this query
            </div>
          </button>
        ))}

      </div>
    </div>
  );
}

