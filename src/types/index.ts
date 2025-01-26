// src/types/index.ts
export type ModelProvider = 'deepseek' | 'zhipu' | 'openai' | 'anthropic' | 'google';

export interface ModelConfig {
  id: string;
  name: string;
  apiKey: string;
  temperature: number;
  maxTokens: number;
  provider: ModelProvider;
}

export interface ModelResponse {
  modelId: string;
  content: string;
  error?: string;
}

export interface JudgeScore {
  modelId: string;
  score: number;
  reasoning: string;
}

export interface AppState {
  // State
  systemPrompt: string;
  userInput: string;
  models: ModelConfig[];
  judge: ModelConfig | null;
  responses: ModelResponse[];
  scores: JudgeScore[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setSystemPrompt: (prompt: string) => void;
  setUserInput: (input: string) => void;
  setModel: (index: number, model: ModelConfig) => void;
  setJudge: (judge: ModelConfig | null) => void;
  setResponses: (responses: ModelResponse[]) => void;
  setScores: (scores: JudgeScore[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
  runModels: () => Promise<void>;
}