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
  console.log('Received chat API request');
  try {
    const body = await request.json();
    console.log('Request body:', {
      models: body.models?.map(m => ({ id: m.id, provider: m.provider, hasKey: !!m.apiKey })),
      hasJudge: !!body.judge,
      hasSystemPrompt: !!body.systemPrompt,
      hasUserInput: !!body.userInput
    });
    
    const { models, judge, systemPrompt, userInput } = body;

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
      console.error('Model response error:', response);
      return {
        modelId: validModels[index].id,
        content: '',
        error: 'Failed to get response'
      };
    });

    // 如果提供了裁判模型，调用裁判评分
    let judgeResponse = null;
    if (judge?.apiKey && judge?.id && modelResponses.some(r => !r.error)) {
      console.log('Calling judge model');
      const validResponses = modelResponses.filter(r => !r.error);
      judgeResponse = await callJudge(judge, systemPrompt || '', validResponses);
      console.log('Judge response received:', judgeResponse);
    }

    console.log('Returning responses:', {
      responsesCount: modelResponses.length,
      hasJudgeResponse: !!judgeResponse
    });

    return NextResponse.json({
      responses: modelResponses,
      judgeResponse
    });
  } catch (error: unknown) {
    const err = error as ApiError;
    console.error('API Error:', {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status,
      stack: err.stack
    });
    
    return NextResponse.json(
      { 
        error: err.response?.data?.error || err.message || 'Internal server error' 
      },
      { status: err.response?.status || 500 }
    );
  }
}