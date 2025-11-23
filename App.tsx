
import React, { useState, useEffect } from 'react';
import { Search, Sparkles, KeyRound } from 'lucide-react';
import { generateDessertConcept, generateDessertImage, refineDessertConcept } from './services/geminiService';
import { GenerationState, DessertConcept } from './types';
import LoadingOverlay from './components/LoadingOverlay';
import DessertDisplay from './components/DessertDisplay';

const App: React.FC = () => {
  const [keyword, setKeyword] = useState('');
  const [targetCost, setTargetCost] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [state, setState] = useState<GenerationState>({ status: 'idle' });

  // Assume API Key is ready from environment
  const [apiKeyReady] = useState(true);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;

    setState({ status: 'generating_text' });

    let currentConceptData: DessertConcept | undefined;

    try {
      // 1. Generate Concept (Text)
      currentConceptData = await generateDessertConcept(keyword, {
        targetCost: targetCost.trim() || undefined,
        targetPrice: targetPrice.trim() || undefined
      });
      
      setState({ 
        status: 'generating_image', 
        data: currentConceptData 
      });

      // 2. Generate Image
      await executeImageGeneration(currentConceptData);

    } catch (error: any) {
      console.error(error);
      setState({ status: 'error', error: "アイデアの生成中にエラーが発生しました。もう一度お試しください。" });
    }
  };

  const handleRefine = async (feedback: string) => {
    if (!state.data) return;

    // Keep the current image visible but show loading status overlay or indicate processing
    setState({ ...state, status: 'generating_text' }); // Re-use generating_text to show spinner

    try {
        // 1. Refine Concept (Text)
        const refinedConceptData = await refineDessertConcept(state.data, feedback);
        
        setState({ 
            status: 'generating_image', 
            data: refinedConceptData 
        });

        // 2. Generate Image for new concept
        await executeImageGeneration(refinedConceptData);

    } catch (error: any) {
        console.error(error);
        // If refinement fails, revert to completed with error but keep old data
        setState({ 
            status: 'completed', 
            data: state.data, 
            imageUrl: state.imageUrl,
            imageError: "修正の反映中にエラーが発生しました。" 
        });
    }
  };

  const executeImageGeneration = async (concept: DessertConcept) => {
    try {
        const imageUrl = await generateDessertImage(concept.imagePromptEn);
        setState({
            status: 'completed',
            data: concept,
            imageUrl: imageUrl,
            imageError: undefined
        });
    } catch (imgError: any) {
        console.error("Image generation failed", imgError);
        
        let errorMsg = "画像の生成に失敗しました。もう一度お試しください。";
        
        // Check for common error patterns
        const errMsg = imgError.message || "";
        if (errMsg.includes("Requested entity was not found") || errMsg.includes("404")) {
            errorMsg = "APIキーのセッションが切れました。再接続してください。";
        } else if (errMsg.includes("SAFETY")) {
             errorMsg = "安全フィルタにより画像が生成されませんでした。";
        }

         setState({
            status: 'completed',
            data: concept,
            imageUrl: undefined,
            imageError: errorMsg
        });
    }
  };

  return (
    <div className="min-h-screen pb-20">
      
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-stone-100 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-rose-400 rounded-full flex items-center justify-center text-white text-xl shadow-lg shadow-rose-200">
              🍬
            </div>
            <h1 className="text-2xl font-serif font-bold text-stone-800 tracking-tight">
              DreamSweets <span className="text-rose-400">AI</span>
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Intro Section (only show when idle or error) */}
        {(state.status === 'idle' || state.status === 'error' || state.status === 'checking_key') && (
          <div className="text-center mb-16 max-w-2xl mx-auto animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-stone-800 mb-6 leading-tight">
              未知のスイーツ体験を<br/>デザインする
            </h2>
            <p className="text-lg text-stone-500 mb-10 leading-relaxed">
              キーワードひとつで、AIが世界に一つだけのスイーツレシピと完成予想図を作成します。
            </p>

            <form onSubmit={handleGenerate} className="max-w-lg mx-auto bg-white p-6 rounded-3xl shadow-lg border border-stone-100">
               <div className="relative mb-4">
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="キーワード (例: 夕焼け、初恋...)"
                    className="w-full pl-6 pr-14 py-4 rounded-full bg-stone-50 border-2 border-transparent focus:bg-white focus:border-rose-400 focus:ring-4 focus:ring-rose-100 outline-none text-lg transition-all text-stone-700 placeholder:text-stone-300"
                    disabled={state.status !== 'idle'}
                  />
                  <button 
                    type="submit"
                    disabled={!keyword || state.status === 'checking_key'}
                    className="absolute right-2 top-2 bottom-2 aspect-square bg-rose-500 hover:bg-rose-600 text-white rounded-full flex items-center justify-center transition-transform hover:scale-105 disabled:bg-stone-300 disabled:scale-100"
                  >
                    {state.status === 'checking_key' ? <span className="animate-spin">⌛</span> : <Sparkles size={20} />}
                  </button>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-400 mb-1 ml-2">目標原価 (任意)</label>
                    <input 
                      type="text" 
                      value={targetCost}
                      onChange={(e) => setTargetCost(e.target.value)}
                      placeholder="例: 300円" 
                      className="w-full px-4 py-2 rounded-xl bg-stone-50 border border-stone-100 focus:border-rose-300 outline-none text-sm text-stone-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-400 mb-1 ml-2">目標売値 (任意)</label>
                    <input 
                      type="text" 
                      value={targetPrice}
                      onChange={(e) => setTargetPrice(e.target.value)}
                      placeholder="例: 800円" 
                      className="w-full px-4 py-2 rounded-xl bg-stone-50 border border-stone-100 focus:border-rose-300 outline-none text-sm text-stone-600"
                    />
                  </div>
               </div>
            </form>

            {state.status === 'error' && (
              <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm">
                {state.error}
              </div>
            )}
          </div>
        )}

        {/* Loading State */}
        {(state.status === 'generating_text' || state.status === 'generating_image') && (
          <LoadingOverlay status={state.status} />
        )}

        {/* Results */}
        {state.status === 'completed' && state.data && (
          <div className="space-y-12">
             {/* Back Button / New Search - Hidden on Print */}
             <div className="flex justify-center print:hidden">
                <button 
                    onClick={() => { setState({status: 'idle'}); setKeyword(''); setTargetCost(''); setTargetPrice(''); }}
                    className="flex items-center gap-2 text-stone-500 hover:text-stone-800 transition-colors"
                >
                    <Search size={16} />
                    <span>新しいアイデアを探す</span>
                </button>
             </div>
             
             <DessertDisplay 
                data={state.data} 
                imageUrl={state.imageUrl} 
                imageError={state.imageError} 
                onRefine={handleRefine}
                isRefining={false}
             />
          </div>
        )}

      </main>

      <footer className="text-center py-8 text-stone-400 text-sm print:hidden">
        <p>Powered by Google Gemini 2.5 Flash Image & Flash 2.5</p>
        <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="hover:text-rose-400 underline">
          Billing Documentation
        </a>
      </footer>
    </div>
  );
};

export default App;
