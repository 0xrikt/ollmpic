// src/lib/api.ts
import axios from 'axios';
import { ModelConfig, ModelResponse } from '@/types';

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

async function callDeepSeek(
  apiKey: string,
  modelId: string,
  systemPrompt: string,
  userInput: string,
  temperature: number,
  maxTokens: number
) {
  const response = await axios.post(
    'https://api.deepseek.com/v1/chat/completions',
    {
      model: modelId,
      messages: [
        ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
        { role: "user", content: userInput }
      ],
      temperature,
      max_tokens: maxTokens,
      stream: false
    },
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'api-key': apiKey,
        'Content-Type': 'application/json'
      },
      timeout: 120000
    }
  );

  return response.data.choices[0].message.content;
}

async function callModel(
  model: ModelConfig, 
  systemPrompt: string, 
  userInput: string
): Promise<ModelResponse> {
  try {
    console.log('Starting model call:', { 
      provider: model.provider, 
      modelId: model.id, 
      hasApiKey: !!model.apiKey 
    });

    if (!model.id || !model.apiKey) {
      throw new Error('Missing required model configuration');
    }

    let content = '';

    if (model.provider === 'deepseek') {
      content = await callDeepSeek(
        model.apiKey,
        model.id,
        systemPrompt,
        userInput,
        model.temperature,
        model.maxTokens
      );
    } else if (model.provider === 'google') {
      console.log('Starting Gemini API call setup');
      
      // 构造完整的提示文本
      const prompt = systemPrompt ? `${systemPrompt}\n\n${userInput}` : userInput;
      console.log('Constructed prompt:', { prompt, length: prompt.length });
    
      try {
        console.log('Importing GoogleGenerativeAI');
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        console.log('Successfully imported GoogleGenerativeAI');
          
        console.log('Initializing GoogleGenerativeAI with API key');
        const genAI = new GoogleGenerativeAI(model.apiKey);
        console.log('GoogleGenerativeAI initialized');

        const modelId = model.id;
        console.log('Getting generative model:', { modelId });
        const geminiModel = genAI.getGenerativeModel({ model: modelId });
        console.log('Generative model instance created');
    
        console.log('Calling generateContent');
        const result = await geminiModel.generateContent(prompt);
        console.log('Content generated successfully', { result });

        content = result.response.text();
        console.log('Content extracted:', { contentLength: content.length });
      } catch (error) {
        console.error('Detailed Gemini API error:', {
          name: error.name,
          message: error.message,
          stack: error.stack,
          cause: error.cause,
          raw: error
        });
        throw error;
      }
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

    console.log('Model call completed successfully');
    return {
      modelId: model.name,
      content
    };
    
  } catch (error: unknown) {
    const err = error as ApiError;
    console.error(`${model.id} error - Detailed:`, {
      name: err.name,
      message: err.message,
      response: err.response?.data,
      status: err.response?.status,
      stack: err.stack,
      raw: err
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
  // 将评分指南作为系统提示词
  const judgeSystemPrompt = `你是一位公正的评委。你的任务是根据系统提示词和多个模型的回答，给每个模型打分（满分10分）并解释原因。
你必须严格按照JSON格式输出，不要包含任何其他内容。输出格式如下：
{
  "scores": [
    {
      "modelId": "模型ID",
      "score": 分数,
      "reasoning": "评分理由"
    }
  ]
}

原始系统提示词是：${systemPrompt}`;

  // 将模型回答作为用户输入
  const userPrompt = responses.map(r => `
模型：${r.modelId}
回答：${r.content}
`).join('\n');

  return callModel(judge, judgeSystemPrompt, userPrompt);
}

export { callModel, callJudge };