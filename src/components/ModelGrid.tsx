// src/components/ModelGrid.tsx
import React from 'react';
import { ModelSelect } from './ModelSelect';
import { ModelConfig, ModelResponse } from '@/types';

interface ModelGridProps {
  models: ModelConfig[];
  responses: ModelResponse[];
  onModelChange: (index: number, config: ModelConfig) => void;
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

export function ModelGrid({ models, responses, onModelChange }: ModelGridProps) {
  const getErrorMessage = (error: unknown): string => {
    if (isErrorWithMessage(error)) return error.message;
    return 'Unknown error occurred';
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">竞技场</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="relative">
            <ModelSelect
              value={models[index] || {
                id: '',
                name: '',
                apiKey: '',
                temperature: 0.7,
                maxTokens: 1000,
                provider: 'openai'
              }}
              onChange={(config) => onModelChange(index, config)}
              label={`模型 ${index + 1}`}
            />
            
            {/* Response Display */}
            {responses[index] && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                {responses[index].error ? (
                  <div className="text-red-500">
                    错误: {getErrorMessage(responses[index].error)}
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap">
                    {responses[index].content}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}