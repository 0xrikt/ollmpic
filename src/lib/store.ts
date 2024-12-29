// src/lib/store.ts
import { create } from 'zustand';
import { AppState, ModelConfig, ModelResponse, JudgeScore } from '@/types';

const createDefaultModel = (id: string, name: string, provider: 'google' | 'zhipu'): ModelConfig => ({
  id,
  name,
  apiKey: '',
  temperature: 0.7,
  maxTokens: 1000,
  provider
});

// 预设四个默认模型
const initialModels: ModelConfig[] = [
  createDefaultModel('gemini-2-flash', 'Gemini 2.0 Flash Thinking Experimental (free)', 'google'),
  createDefaultModel('gemini-1.5-flash', 'GEMINI 1.5 FLASH-8B', 'google'),
  createDefaultModel('glm-4-plus', 'GLM-4-PLUS', 'zhipu'),
  createDefaultModel('glm-4-flash', 'GLM-4-FLASH', 'zhipu')
];

const useStore = create<AppState>((set) => ({
  systemPrompt: '',
  userInput: '',
  models: initialModels,
  judge: null,
  responses: [],
  scores: [],
  isLoading: false,
  error: null,

  // Actions
  setSystemPrompt: (prompt: string) => 
    set({ systemPrompt: prompt }),

  setUserInput: (input: string) => 
    set({ userInput: input }),

  setModel: (index: number, model: ModelConfig) =>
    set((state) => ({
      models: state.models.map((m, i) => i === index ? model : m)
    })),

  setJudge: (judge: ModelConfig | null) =>
    set({ judge }),

  setResponses: (responses: ModelResponse[]) =>
    set({ responses }),

  setScores: (scores: JudgeScore[]) =>
    set({ scores }),

  setLoading: (isLoading: boolean) =>
    set({ isLoading }),

  setError: (error: string | null) =>
    set({ error }),

  // Reset state
  reset: () => set({
    systemPrompt: '',
    userInput: '',
    models: initialModels,
    judge: null,
    responses: [],
    scores: [],
    isLoading: false,
    error: null
  }),

  // Run models
  runModels: async () => {
    set({ isLoading: true, error: null, responses: [], scores: [] });
    
    try {
      const state = useStore.getState();
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          models: state.models,
          judge: state.judge,
          systemPrompt: state.systemPrompt,
          userInput: state.userInput
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get responses');
      }

      set({ responses: data.responses || [] });

      if (data.judgeResponse?.content) {
        try {
          const judgeContent = JSON.parse(data.judgeResponse.content);
          set({ scores: judgeContent.scores || [] });
        } catch (jsonError) {
          console.error('Failed to parse judge response:', jsonError);
          set({ 
            scores: [],
            error: 'Failed to parse judge scores'
          });
        }
      }
    } catch (error) {
      console.error('Run models error:', error);
      set({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        responses: [],
        scores: []
      });
    } finally {
      set({ isLoading: false });
    }
  }
}));

export default useStore;