// src/app/api/chat/route.ts
import { NextResponse } from 'next/server';
import { callModel, callJudge } from '@/lib/api';
import { ModelConfig, ModelResponse } from '@/types';

interface ApiError extends Error {
  response?: {
    data?: {
      error?: string;
    };
    status?: number;
  };
}

export async function POST(request: Request) {
  try {
    const { models, judge, systemPrompt, userInput } = await request.json();

    // 验证必要的输入
    if (!Array.isArray(models) || !models.length) {
      return NextResponse.json(
        { error: 'No models provided' },
        { status: 400 }
      );
    }

    if (!userInput?.trim()) {
      return NextResponse.json(
        { error: 'No user input provided' },
        { status: 400 }
      );
    }

    // 过滤掉没有设置apiKey或id的模型
    const validModels = models.filter(m => m.apiKey && m.id);

    if (!validModels.length) {
      return NextResponse.json(
        { error: 'No valid models (with API keys) provided' },
        { status: 400 }
      );
    }

    // 并发调用所有模型
    const modelPromises = validModels.map((model: ModelConfig) => 
      callModel(model, systemPrompt || '', userInput)
    );

    const responses = await Promise.allSettled(modelPromises);
    
    // 处理模型响应
    const modelResponses: ModelResponse[] = responses.map((response, index) => {
      if (response.status === 'fulfilled') {
        return response.value;
      }
      return {
        modelId: validModels[index].id,
        content: '',
        error: 'Failed to get response'
      };
    });

    // 如果提供了裁判模型，调用裁判评分
    let judgeResponse = null;
    if (judge?.apiKey && judge?.id && modelResponses.some(r => !r.error)) {
      const validResponses = modelResponses.filter(r => !r.error);
      judgeResponse = await callJudge(judge, systemPrompt || '', validResponses);
    }

    return NextResponse.json({
      responses: modelResponses,
      judgeResponse
    });
  } catch (error: unknown) {
    const err = error as ApiError;
    console.error('API Error:', err);
    return NextResponse.json(
      { 
        error: err.response?.data?.error || err.message || 'Internal server error' 
      },
      { status: err.response?.status || 500 }
    );
  }
}