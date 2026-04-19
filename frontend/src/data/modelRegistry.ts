// List of available providers
export const providers = ["OpenRouter"];
export interface ModelRegistryEntry {
  primary_model: string;
  candidate_models?: string[];
}

export const MODEL_REGISTRY: Record<string, ModelRegistryEntry> = {
  openrouter: {
    primary_model: "openai/gpt-oss-20b:free",
    candidate_models: [
      // "meta-llama/llama-4-scout:free",
      "cognitivecomputations/dolphin-mistral-24b-venice-edition:free",
      // "openai/gpt-oss-120b:free",
      "nvidia/nemotron-nano-9b-v2:free",
    ],
  },
  // "openrouter sonoma": {
  //   primary_model: "openrouter/sonoma-sky-alpha",
  //   candidate_models: ["openrouter/sonoma-dusk-alpha"],
  // },
  // openai: {
  //   primary_model: "gpt-4o-mini",
  // },
};

export const getModelsForProvider = (provider: string) => {
  const config = MODEL_REGISTRY[provider.toLowerCase()];
  if (!config) return ["Automatic Model Selection (Model Routing)"];
  return [
    "Automatic Model Selection (Model Routing)",
    config.primary_model,
    ...(config.candidate_models || []),
  ];
};