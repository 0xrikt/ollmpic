// src/components/JudgePanel.tsx
import React from 'react';
import { ModelSelect } from './ModelSelect';
import { ModelConfig, ModelResponse, JudgeScore } from '@/types';

interface JudgePanelProps {
  judge: ModelConfig | null;
  onJudgeChange: (config: ModelConfig) => void;
  judgeResponse: ModelResponse | null;
  scores: JudgeScore[];
}

interface ErrorWithMessage {
  message: string;
}

function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
}

export function JudgePanel({ 
  judge, 
  onJudgeChange, 
  judgeResponse,
  scores 
}: JudgePanelProps) {
  const defaultJudge: ModelConfig = {
    id: '',
    name: '',
    apiKey: '',
    temperature: 0.7,
    maxTokens: 2000,
    provider: 'openai'
  };

  const getErrorMessage = (error: unknown): string => {
    if (isErrorWithMessage(error)) return error.message;
    return 'Unknown error occurred';
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">裁判评分</h2>
      
      <div className="bg-gray-50 p-6 rounded-lg">
        <ModelSelect
          value={judge || defaultJudge}
          onChange={onJudgeChange}
          label="选择裁判模型"
        />

        {judgeResponse?.error ? (
          <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg">
            评分错误: {getErrorMessage(judgeResponse.error)}
          </div>
        ) : scores.length > 0 ? (
          <div className="mt-6 space-y-4">
            {scores.map((score, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{score.modelId}</span>
                  <span className="text-lg font-bold text-blue-600">
                    {score.score.toFixed(1)}分
                  </span>
                </div>
                <p className="text-gray-600 text-sm">{score.reasoning}</p>
              </div>
            ))}
          </div>
        ) : judgeResponse?.content ? (
          <div className="mt-4 p-4 bg-white rounded-lg">
            <pre className="whitespace-pre-wrap text-sm">
              {judgeResponse.content}
            </pre>
          </div>
        ) : null}
      </div>
    </div>
  );
}