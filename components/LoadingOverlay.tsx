import React from 'react';

interface LoadingOverlayProps {
  status: 'generating_text' | 'generating_image';
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ status }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-6 text-center animate-pulse">
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 border-4 border-rose-200 rounded-full opacity-25"></div>
        <div className="absolute inset-0 border-4 border-rose-400 rounded-full border-t-transparent animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center text-3xl">
          🍰
        </div>
      </div>
      
      <h3 className="text-xl font-medium text-stone-600 font-serif">
        {status === 'generating_text' 
          ? "シェフがアイデアを構想中 (Gemini Flash)..." 
          : "Gemini 2.5 Flash Image で画像を生成中..."}
      </h3>
      <p className="text-stone-400 text-sm max-w-md">
        最高のスイーツ体験をお届けするために、AIパティシエが全力を尽くしています。
      </p>
    </div>
  );
};

export default LoadingOverlay;