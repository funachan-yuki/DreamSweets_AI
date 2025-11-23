import React, { useState } from 'react';
import { DessertConcept } from '../types';
import { Clock, ChefHat, AlertCircle, RefreshCw, MessageCircle, Coins } from 'lucide-react';

interface DessertDisplayProps {
  data: DessertConcept;
  imageUrl?: string;
  imageError?: string;
  onRefine: (feedback: string) => void;
  isRefining: boolean;
}

const DessertDisplay: React.FC<DessertDisplayProps> = ({ data, imageUrl, imageError, onRefine, isRefining }) => {
  const [feedback, setFeedback] = useState('');

  const handleRefineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (feedback.trim()) {
      onRefine(feedback);
      setFeedback(''); // Clear input after submit (optional, depends on UX preference)
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-white rounded-3xl overflow-hidden shadow-xl border border-stone-100 animate-fade-in mb-12">
      
      {/* Hero Section */}
      <div className="flex flex-col md:block md:relative md:h-[500px] group">
        
        {/* Image Container */}
        {/* Mobile: Aspect ratio 4:3 to show full generated image without cropping. Desktop: Full height/width absolute. */}
        <div className="w-full aspect-[4/3] md:aspect-auto md:h-full bg-stone-200 relative">
            {imageUrl ? (
            <img 
                src={imageUrl} 
                alt={data.title} 
                className="w-full h-full object-cover object-center"
            />
            ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-stone-100 text-stone-400 p-6 text-center">
                {imageError ? (
                    <>
                        <AlertCircle size={48} className="text-rose-300 mb-2" />
                        <p className="text-stone-500 font-medium">{imageError}</p>
                        <p className="text-sm text-stone-400 mt-1">※テキストレシピは下記の通り生成されました</p>
                    </>
                ) : (
                    <div className="flex flex-col items-center">
                        <span className="text-4xl mb-2">📸</span>
                        <span>Image generation unavailable</span>
                    </div>
                )}
            </div>
            )}
            
            {/* Desktop Gradient Overlay - Only visible on md+ */}
            <div className="hidden md:block absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none"></div>
        </div>

        {/* Text Content */}
        {/* Mobile: Below image, white bg, dark text. Desktop: Overlay, transparent bg, white text. */}
        <div className="
            relative bg-white p-6 
            md:absolute md:bottom-0 md:left-0 md:right-0 md:bg-transparent md:p-8
        ">
          <h2 className="text-2xl md:text-5xl font-serif font-bold mb-3 md:drop-shadow-sm text-stone-800 md:text-white">
              {data.title}
          </h2>
          <p className="text-stone-600 md:text-white/90 text-sm md:text-lg font-light max-w-3xl leading-relaxed md:drop-shadow-sm">
            {data.description}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-12 gap-0">
        
        {/* Left Column: Ingredients & Economics */}
        <div className="md:col-span-4 bg-[#FAF7F2] p-8 border-r border-stone-100">
          
          {/* Economics Card */}
          <div className="mb-8 p-4 bg-white rounded-xl shadow-sm border border-stone-100">
             <div className="flex items-center gap-2 mb-3 text-stone-700">
                <Coins size={20} />
                <h3 className="font-bold">Business Metrics</h3>
             </div>
             <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                   <span className="text-stone-500">想定原価</span>
                   <span className="font-mono font-bold text-stone-800">{data.estimatedCost}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                   <span className="text-stone-500">推奨売価</span>
                   <span className="font-mono font-bold text-rose-600">{data.recommendedPrice}</span>
                </div>
             </div>
          </div>

          <div className="flex items-center gap-2 mb-6 text-rose-800">
            <ChefHat size={24} />
            <h3 className="text-2xl font-serif font-bold">Materials</h3>
          </div>
          
          <ul className="space-y-3">
            {data.ingredients.map((ing, idx) => (
              <li key={idx} className="flex justify-between items-center py-2 border-b border-stone-200 last:border-0">
                <span className="font-medium text-stone-700">{ing.name}</span>
                <span className="text-stone-500 text-sm font-mono">{ing.amount}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Roadmap Column */}
        <div className="md:col-span-8 p-8 bg-white">
          <div className="flex items-center gap-2 mb-8 text-rose-800">
            <Clock size={24} />
            <h3 className="text-2xl font-serif font-bold">Roadmap to Sweetness</h3>
          </div>

          <div className="space-y-8 relative pl-4 mb-8">
             {/* Vertical Line */}
            <div className="absolute left-4 top-2 bottom-4 w-0.5 bg-rose-100"></div>

            {data.roadmap.map((step, idx) => (
              <div key={idx} className="relative pl-8 break-inside-avoid">
                {/* Dot */}
                <div className="absolute left-[-5px] top-1 w-5 h-5 rounded-full bg-rose-400 border-4 border-white shadow-sm flex items-center justify-center z-10">
                </div>
                
                <h4 className="text-lg font-bold text-stone-800 mb-2">
                  Step {step.step}: {step.title}
                </h4>
                <p className="text-stone-600 leading-relaxed">
                  {step.instruction}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Refinement Section */}
      <div className="bg-stone-50 p-8 border-t border-stone-200">
        <div className="flex items-start gap-4 max-w-3xl mx-auto">
            <div className="bg-white p-3 rounded-full shadow-sm text-rose-400">
                <MessageCircle size={24} />
            </div>
            <div className="flex-1">
                <h3 className="text-lg font-bold text-stone-800 mb-2 font-serif">Chef's Consultation</h3>
                <p className="text-stone-500 text-sm mb-4">
                    「もっとフルーティーに」「色は青系で」など、ご要望があれば再考案します。
                </p>
                <form onSubmit={handleRefineSubmit} className="relative">
                    <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="例：チョコレートを減らして、抹茶の要素を加えてください。"
                        className="w-full p-4 pr-16 rounded-xl border border-stone-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none text-stone-700 bg-white min-h-[100px] resize-none shadow-sm"
                        disabled={isRefining}
                    />
                    <button
                        type="submit"
                        disabled={!feedback.trim() || isRefining}
                        className="absolute bottom-3 right-3 bg-stone-800 hover:bg-stone-700 text-white p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                    >
                        {isRefining ? (
                             <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        ) : (
                            <>
                                <RefreshCw size={16} />
                                <span>再生成</span>
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DessertDisplay;