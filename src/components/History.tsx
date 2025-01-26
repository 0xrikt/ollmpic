// src/components/History.tsx
import React, { useState } from 'react';
import useStore from '@/lib/store';

export function History() {
  const { history, clearHistory } = useStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (history.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">历史记录</h2>
        <button
          onClick={clearHistory}
          className="px-4 py-2 text-sm text-red-600 hover:text-red-800"
        >
          清空历史
        </button>
      </div>

      <div className="space-y-4">
        {history.map((record) => (
          <div 
            key={record.id} 
            className="bg-white rounded-lg shadow overflow-hidden"
          >
            <div 
              className="p-4 cursor-pointer hover:bg-gray-50"
              onClick={() => setExpandedId(expandedId === record.id ? null : record.id)}
            >
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <p className="text-sm text-gray-600">
                    {new Date(record.timestamp).toLocaleString()}
                  </p>
                  <p className="mt-1 font-medium line-clamp-1">{record.userInput}</p>
                </div>
                <svg
                  className={`w-5 h-5 transform transition-transform ${
                    expandedId === record.id ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>

            {expandedId === record.id && (
              <div className="border-t border-gray-200 p-4">
                <div className="space-y-4">
                  {record.systemPrompt && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">系统提示词</h4>
                      <p className="mt-1 text-sm text-gray-600">{record.systemPrompt}</p>
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm font-medium text-gray-700">模型回答</h4>
                    <div className="mt-2 space-y-3">
                      {record.responses.map((response, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">{response.modelId}</span>
                            {record.scores.find(s => s.modelId === response.modelId) && (
                              <span className="text-blue-600 font-medium">
                                {record.scores.find(s => s.modelId === response.modelId)?.score}分
                              </span>
                            )}
                          </div>
                          {response.error ? (
                            <p className="text-red-500">{response.error}</p>
                          ) : (
                            <p className="text-sm whitespace-pre-wrap">{response.content}</p>
                          )}
                          {record.scores.find(s => s.modelId === response.modelId)?.reasoning && (
                            <p className="mt-2 text-sm text-gray-600">
                              评分理由：{record.scores.find(s => s.modelId === response.modelId)?.reasoning}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}