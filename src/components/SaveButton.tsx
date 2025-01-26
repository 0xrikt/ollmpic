// src/components/SaveButton.tsx
import React from 'react';
import useStore from '@/lib/store';

export function SaveButton() {
  const { responses, addToHistory } = useStore();

  // 只有当有响应结果时才显示按钮
  if (responses.length === 0) {
    return null;
  }

  return (
    <button
      onClick={addToHistory}
      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
    >
      <svg 
        className="w-5 h-5" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" 
        />
      </svg>
      保存此次结果
    </button>
  );
}