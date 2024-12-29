// src/app/page.tsx
'use client';

import { useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { PromptInput } from '@/components/PromptInput';
import { ModelGrid } from '@/components/ModelGrid';
import { UserInput } from '@/components/UserInput';
import { JudgePanel } from '@/components/JudgePanel';
import useStore from '../lib/store';  // 使用相对路径

export default function Home() {
  const {
    systemPrompt,
    userInput,
    models,
    judge,
    responses,
    scores,
    isLoading,
    error,
    setSystemPrompt,
    setUserInput,
    setModel,
    setJudge,
    runModels,
  } = useStore();

  useEffect(() => {
    // Reset scores when models or system prompt changes
    useStore.setState({ scores: [], responses: [] });
  }, [models, systemPrompt]);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold">Ollmpic</h1>
            <p className="mt-2 text-gray-600">大模型竞技场</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg">
              {error}
            </div>
          )}

          {/* System Prompt */}
          <PromptInput
            value={systemPrompt}
            onChange={setSystemPrompt}
          />

          {/* Model Grid */}
          <ModelGrid
            models={models}
            responses={responses}
            onModelChange={setModel}
          />

          {/* Judge Panel */}
          <JudgePanel
            judge={judge}
            onJudgeChange={setJudge}
            judgeResponse={responses.find(r => r.modelId === judge?.id) || null}
            scores={scores}
          />

          {/* User Input */}
          <UserInput
            value={userInput}
            onChange={setUserInput}
            onSubmit={runModels}
            isLoading={isLoading}
          />
        </div>
      </div>
      <Analytics />
    </main>
  );
}