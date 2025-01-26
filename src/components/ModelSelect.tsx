// src/components/ModelSelect.tsx
import React from 'react';
import { ModelConfig, ModelProvider } from '@/types';

// 更新支持的模型列表
const AVAILABLE_MODELS = [
  { id: 'deepseek-chat', name: 'DeepSeek Chat v3' },
  { id: 'deepseek-coder', name: 'DeepSeek Coder v2.5' },
  { id: 'deepseek-reasoner', name: 'DeepSeek Reasoner R1' },
  { id: 'glm-4-plus', name: 'GLM-4-PLUS' },
  { id: 'glm-4-flash', name: 'GLM-4-FLASH' }
];

interface ModelSelectProps {
  value: ModelConfig;
  onChange: (config: ModelConfig) => void;
  label?: string;
}

export function ModelSelect({ value, onChange, label = '选择模型' }: ModelSelectProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4 w-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">{label}</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            模型
          </label>
          <select
            value={value.id || ''}
            onChange={(e) => {
              const model = AVAILABLE_MODELS.find(m => m.id === e.target.value);
              if (model) {
                onChange({
                  ...value,
                  id: model.id,
                  name: model.name,
                  provider: getModelProvider(model.id)
                });
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">选择模型</option>
            {AVAILABLE_MODELS.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            API Key
          </label>
          <input
            type="password"
            value={value.apiKey}
            onChange={(e) => onChange({...value, apiKey: e.target.value})}
            placeholder="输入 API Key"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Temperature ({value.temperature})
          </label>
          <input
            type="range"
            min={0}
            max={2}
            step={0.1}
            value={value.temperature}
            onChange={(e) => onChange({...value, temperature: parseFloat(e.target.value)})}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Maximum Tokens ({value.maxTokens})
          </label>
          <input
            type="range"
            min={100}
            max={4000}
            step={100}
            value={value.maxTokens}
            onChange={(e) => onChange({...value, maxTokens: parseInt(e.target.value, 10)})}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}

// 根据模型ID获取对应的provider
function getModelProvider(modelId: string): ModelProvider {
  if (modelId.startsWith('deepseek')) return 'deepseek';
  if (modelId.startsWith('glm')) return 'zhipu';
  if (modelId.startsWith('gemini')) return 'google';
  return 'openai'; // fallback
}