// src/lib/api.ts
import axios from 'axios';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ModelConfig, ModelResponse } from '@/types';

// 创建一个 Map 来存储 Gemini 实例，避免重复创建
const geminiInstances = new Map();

interface ApiError extends Error {
  response?: {
    data?: {
      error?: {
        message?: string;
      };
    };
    status?: number;
  };
}

async function getGeminiResponse(
  apiKey: string, 
  modelName: string, 
  systemPrompt: string, 
  userInput: string, 
  temperature: number,
  maxTokens: number
) {
  let geminiInstance = geminiInstances.get(apiKey);
  
  if (!geminiInstance) {
    geminiInstance = new GoogleGenerativeAI(apiKey);
    geminiInstances.set(apiKey, geminiInstance);
  }

  const model = geminiInstance.getGenerativeModel({ 
    model: modelName,
    generationConfig: {
      temperature,
      maxOutputTokens: maxTokens,
    },
  });

  const prompt = systemPrompt ? `${systemPrompt}\n\n${userInput}` : userInput;
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

async function callModel(
  model: ModelConfig, 
  systemPrompt: string, 
  userInput: string
): Promise<ModelResponse> {
  try {
    if (!model.id || !model.apiKey) {
      throw new Error('Missing required model configuration');
    }

    let content = '';

    // 使用不同的处理逻辑，基于provider
    if (model.provider === 'google') {
      // 获取正确的模型名称
      const modelName = model.id === 'gemini-2-flash' ? 'gemini-pro' : 'gemini-1.5-pro';
      
      content = await getGeminiResponse(
        model.apiKey,
        modelName,
        systemPrompt,
        userInput,
        model.temperature,
        model.maxTokens
      );
    } else if (model.provider === 'zhipu') {
      const config = {
        baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
        route: '/chat/completions',
        model: model.id === 'glm-4-plus' ? 'glm-4' : 'glm-4v'
      };

      const response = await axios.post(
        `${config.baseUrl}${config.route}`,
        {
          model: config.model,
          messages: [
            ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
            { role: "user", content: userInput }
          ],
          temperature: model.temperature,
          max_tokens: model.maxTokens,
          top_p: 0.7,
          stream: false
        },
        {
          headers: {
            'Authorization': `Bearer ${model.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 120000
        }
      );

      content = response.data.choices[0].message.content;
    }

    return {
      modelId: model.name,
      content
    };
    
  } catch (error: unknown) {
    const err = error as ApiError;
    console.error(`${model.id} error:`, {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status
    });
    
    const errorMessage = 
      err.response?.data?.error?.message || 
      err.message || 
      'Unknown error occurred';
                      
    return {
      modelId: model.name,
      content: '',
      error: errorMessage
    };
  }
}

async function callJudge(
  judge: ModelConfig,
  systemPrompt: string,
  responses: ModelResponse[]
): Promise<ModelResponse> {
  const judgePrompt = `你是一位公正的评委。请根据以下系统提示词和多个模型的回答，给每个模型打分（满分10分）并解释原因。请严格按照JSON格式输出，不要包含任何其他内容。

系统提示词：
${systemPrompt}

模型回答：
${responses.map(r => `
模型：${r.modelId}
回答：${r.content}
`).join('\n')}

请输出以下JSON格式：
{
  "scores": [
    {
      "modelId": "模型ID",
      "score": 分数,
      "reasoning": "评分理由"
    }
  ]
}`;

  return callModel(judge, '', judgePrompt);
}

export { callModel, callJudge };