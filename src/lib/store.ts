// src/lib/store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppState, ModelConfig, ModelResponse, JudgeScore } from '@/types';

interface HistoryRecord {
  id: string;
  timestamp: number;
  systemPrompt: string;
  userInput: string;
  responses: ModelResponse[];
  scores: JudgeScore[];
  models: Array<{
    id: string;
    name: string;
  }>;
  judge: {
    id: string;
    name: string;
  } | null;
}

interface ExtendedAppState extends AppState {
  history: HistoryRecord[];
  addToHistory: () => void;
  clearHistory: () => void;
}

const createDefaultModel = (id: string, name: string, provider: 'deepseek' | 'zhipu' | 'google'): ModelConfig => ({
  id,
  name,
  apiKey: '',
  temperature: 0.7,
  maxTokens: 1000,
  provider
});

const initialModels: ModelConfig[] = [
  createDefaultModel('deepseek-chat', 'DeepSeek Chat v3', 'deepseek'),
  createDefaultModel('deepseek-coder', 'DeepSeek Coder v2.5', 'deepseek'),
  createDefaultModel('deepseek-reasoner', 'DeepSeek Reasoner R1', 'deepseek'),
  createDefaultModel('glm-4-plus', 'GLM-4-PLUS', 'zhipu'),
  createDefaultModel('glm-4-flash', 'GLM-4-FLASH', 'zhipu'),
  createDefaultModel('gemini-2-flash', 'Gemini 2.0 Flash', 'google'),
  createDefaultModel('gemini-1-5-flash', 'Gemini 1.5 Flash', 'google')
];

const useStore = create<ExtendedAppState>()(
  persist(
    (set, get) => ({
      systemPrompt: '',
      userInput: '',
      models: initialModels,
      judge: null,
      responses: [],
      scores: [],
      isLoading: false,
      error: null,
      history: [],

      addToHistory: () => {
        const state = get();
        if (state.responses.length === 0) return;

        const newRecord: HistoryRecord = {
          id: new Date().getTime().toString(),
          timestamp: new Date().getTime(),
          systemPrompt: state.systemPrompt,
          userInput: state.userInput,
          responses: state.responses,
          scores: state.scores,
          models: state.models.map(m => ({
            id: m.id,
            name: m.name
          })),
          judge: state.judge ? {
            id: state.judge.id,
            name: state.judge.name
          } : null
        };

        set((state) => ({
          history: [newRecord, ...state.history].slice(0, 50)
        }));
      },

      clearHistory: () => set({ history: [] }),

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

      reset: () => set({
        systemPrompt: '',
        userInput: '',
        models: initialModels,
        judge: null,
        responses: [],
        scores: [],
        isLoading: false,
        error: null,
        history: []
      }),

      runModels: async () => {
        console.log('Starting runModels');
        set({ isLoading: true, error: null });
        
        try {
          const state = get();
          console.log('Current state:', {
            models: state.models.map(m => ({ id: m.id, provider: m.provider, hasKey: !!m.apiKey })),
            hasJudge: !!state.judge,
            systemPrompt: !!state.systemPrompt,
            userInput: !!state.userInput
          });
      
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
            signal: AbortSignal.timeout(60000)
          });
      
          console.log('API Response status:', response.status);
          const data = await response.json();
          console.log('API Response data:', data);
      
          if (!response.ok) {
            console.error('API Error:', data.error);
            throw new Error(data.error || 'Failed to get responses');
          }
      
          set({ responses: data.responses || [] });
      
          if (data.judgeResponse?.content) {
            try {
              // 清理可能的 markdown 代码块标记
              const cleanContent = data.judgeResponse.content
                .replace(/^```json\n/, '')    // 移除开头的 ```json
                .replace(/^```\n/, '')        // 或者移除开头的 ```
                .replace(/\n```$/, '')        // 移除结尾的 ```
                .trim();                      // 清理前后空白
      
              const judgeContent = JSON.parse(cleanContent);
              set({ scores: judgeContent.scores || [] });
            } catch (jsonError) {
              console.error('Failed to parse judge response:', jsonError);
              console.log('Raw content:', data.judgeResponse.content); // 添加日志输出原始内容
              set({ 
                scores: [],
                error: 'Failed to parse judge scores'
              });
            }
          }
        } catch (error) {
          console.error('Run models error:', error);
          set({ 
            error: error instanceof Error ? error.message : 'An unknown error occurred'
          });
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'ollmpic-storage',
      partialize: (state) => ({
        systemPrompt: state.systemPrompt,
        userInput: state.userInput,
        models: state.models.map(model => ({
          ...model,
          apiKey: '',
        })),
        judge: state.judge ? {
          ...state.judge,
          apiKey: '',
        } : null,
        responses: state.responses,
        scores: state.scores,
        history: state.history,
      })
    }
  )
);

export default useStore;