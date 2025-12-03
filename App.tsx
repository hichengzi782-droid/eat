import React, { useState, useCallback, useEffect, useRef } from 'react';
import Wheel from './components/Wheel';
import { WheelItem, GeminiStatus } from './types';
import { generateFoodIdeas, getCheekyComment } from './services/geminiService';
import { Check, Trash2, Plus, Sparkles, AlertCircle, Utensils, RefreshCw, PartyPopper } from 'lucide-react';

// Preset colors to cycle through
const COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#FFD93D', // Yellow
  '#95A5A6', // Gray
  '#FF8C42', // Orange
  '#6A0572', // Purple
  '#AB83A1', // Pinkish
  '#2C3E50', // Dark Blue
  '#2ECC71', // Emerald Green
  '#E67E22', // Carrot Orange
  '#9B59B6', // Amethyst
  '#1ABC9C', // Green Sea
];

const DEFAULT_ITEMS = [
  "🥘 麻辣烫", "🍔 汉堡包", "🍣 寿司", "🥗 轻食沙拉", 
  "🍛 咖喱饭", "🍜 拉面", "🍕 披萨", "🍗 炸鸡", 
  "🥟 饺子", "🍱 鳗鱼饭", "🍝 意大利面", "🍲 小火锅"
];

const App: React.FC = () => {
  const [items, setItems] = useState<WheelItem[]>(() => 
    DEFAULT_ITEMS.map((text, i) => ({
      id: crypto.randomUUID(),
      text,
      color: COLORS[i % COLORS.length]
    }))
  );
  
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<WheelItem | null>(null);
  const [winningComment, setWinningComment] = useState<string>("");
  
  const [newItemText, setNewItemText] = useState("");
  
  // Gemini States
  const [aiStatus, setAiStatus] = useState<GeminiStatus>(GeminiStatus.IDLE);
  const [isCommentLoading, setIsCommentLoading] = useState(false);

  // Spin Logic
  const handleSpin = useCallback(() => {
    if (isSpinning || items.length < 2) return;

    setWinner(null);
    setWinningComment("");
    setIsSpinning(true);

    // Calculate a new rotation
    // Must rotate at least 5 full circles (360 * 5)
    // Add a random amount of extra rotation (0 - 360)
    const spins = 5;
    const degrees = 360 * spins + Math.floor(Math.random() * 360);
    
    // We add to the existing rotation so it spins forward continuously
    setRotation(prev => prev + degrees);
  }, [isSpinning, items.length]);

  const handleSpinEnd = useCallback(async () => {
    setIsSpinning(false);
    
    // Calculate winner
    // Normalize rotation to 0-360
    const finalRotation = rotation % 360;
    
    // In our SVG, 0 degrees is at the top (after -90 transform).
    // However, the wheel rotates clockwise.
    // The pointer is at the top (0 degrees visual).
    // If we rotate +90 degrees, the slice at 270 degrees (original) is now at the top.
    // Formula: (360 - (rotation % 360)) % 360 gives the angle under the pointer relative to the start of the wheel.
    const pointerAngle = (360 - finalRotation) % 360;
    
    const sliceAngle = 360 / items.length;
    const winningIndex = Math.floor(pointerAngle / sliceAngle);
    
    // Safe check
    const winningItem = items[winningIndex] || items[0];
    setWinner(winningItem);

    // Fetch comment from Gemini
    if (process.env.API_KEY) {
      setIsCommentLoading(true);
      try {
        const comment = await getCheekyComment(winningItem.text);
        setWinningComment(comment);
      } catch (e) {
        console.error(e);
      } finally {
        setIsCommentLoading(false);
      }
    }
  }, [rotation, items]);

  // List Management
  const addItem = () => {
    if (!newItemText.trim()) return;
    const newItem: WheelItem = {
      id: crypto.randomUUID(),
      text: newItemText.trim(),
      color: COLORS[items.length % COLORS.length]
    };
    setItems(prev => [...prev, newItem]);
    setNewItemText("");
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const handleGenerateIdeas = async () => {
    setAiStatus(GeminiStatus.LOADING);
    try {
      const ideas = await generateFoodIdeas("午餐/晚餐");
      const newItems = ideas.map((text, i) => ({
        id: crypto.randomUUID(),
        text,
        color: COLORS[i % COLORS.length]
      }));
      setItems(newItems);
      setAiStatus(GeminiStatus.SUCCESS);
    } catch (error) {
      setAiStatus(GeminiStatus.ERROR);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFBE6] text-brand-dark flex flex-col items-center pb-20 overflow-x-hidden">
      
      {/* Header */}
      <header className="w-full bg-brand-yellow text-brand-dark p-6 text-center shadow-lg relative overflow-hidden rounded-b-[40px] border-b-4 border-orange-200">
        <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/food.png')]"></div>
        <div className="relative z-10 flex flex-col items-center">
           <div className="bg-white/80 p-3 rounded-full mb-2 shadow-sm">
             <Utensils className="text-brand-red w-8 h-8" />
           </div>
           <h1 className="text-3xl font-heading font-black tracking-wide text-brand-dark drop-shadow-sm">今天吃什么呀?</h1>
           <p className="text-sm font-body font-bold text-gray-700 mt-1">✨ 让命运来决定你的胃 ✨</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-lg px-4 pt-6 flex flex-col items-center">
        
        {/* The Wheel */}
        <div className="w-full relative filter drop-shadow-xl">
          <Wheel 
            items={items} 
            rotation={rotation} 
            isSpinning={isSpinning} 
            onSpinEnd={handleSpinEnd}
          />
          {/* Cute mascot or decoration near wheel */}
          <div className="absolute -bottom-4 -right-2 text-4xl animate-bounce-slow z-10 select-none">
            😋
          </div>
          <div className="absolute -top-2 -left-2 text-4xl animate-bounce-slow z-10 select-none" style={{animationDelay: '1.5s'}}>
            🍩
          </div>
        </div>

        {/* Spin Button */}
        <button
          onClick={handleSpin}
          disabled={isSpinning || items.length < 2}
          className={`
            mt-8 px-10 py-4 rounded-full text-xl font-black tracking-wider shadow-[0_6px_0_rgba(0,0,0,0.2)] transition-all active:shadow-none active:translate-y-1.5 border-4 border-white
            ${isSpinning || items.length < 2 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none translate-y-1' 
              : 'bg-brand-red text-white hover:bg-red-400'
            }
          `}
        >
          {isSpinning ? '转转转...😵‍💫' : '帮我选一个! 🎲'}
        </button>

        {/* Controls Section */}
        <div className="w-full mt-10 bg-white p-6 rounded-3xl shadow-xl border-2 border-brand-teal/20">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold font-heading text-brand-dark flex items-center gap-2">
              <span>📜</span> 菜单列表 ({items.length})
            </h2>
            <button 
              onClick={handleGenerateIdeas}
              disabled={aiStatus === GeminiStatus.LOADING}
              className="text-xs flex items-center gap-1 bg-brand-light text-brand-teal font-bold border-2 border-brand-teal px-3 py-1.5 rounded-xl hover:bg-brand-teal hover:text-white transition-all active:scale-95"
            >
              {aiStatus === GeminiStatus.LOADING ? (
                 <RefreshCw size={14} className="animate-spin" />
              ) : (
                <Sparkles size={14} />
              )}
              AI 帮我想想
            </button>
          </div>

          {/* Add Item Input */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addItem()}
              placeholder="加点好吃的... (比如: 🍦 冰淇淋)"
              className="flex-1 bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-transparent transition-all"
            />
            <button 
              onClick={addItem}
              className="bg-brand-teal text-white p-3 rounded-xl hover:bg-teal-500 transition-colors shadow-sm"
            >
              <Plus size={24} />
            </button>
          </div>

          {/* List of Items */}
          <div className="max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {items.length === 0 && (
              <div className="text-center text-gray-400 py-6 flex flex-col items-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <AlertCircle size={32} className="mb-2 opacity-50 text-brand-yellow"/>
                <p className="font-bold">空空如也哦~</p>
                <p className="text-xs mt-1">快加点好吃的，或者问问 AI 吧！</p>
              </div>
            )}
            {items.map((item) => (
              <div key={item.id} className="group flex items-center justify-between bg-white hover:bg-gray-50 p-3 rounded-2xl border-2 border-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="font-bold text-gray-700">{item.text}</span>
                </div>
                <button 
                  onClick={() => removeItem(item.id)}
                  className="text-gray-300 hover:text-brand-red transition-colors p-1"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Winner Modal */}
      {winner && !isSpinning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full text-center shadow-2xl transform animate-in zoom-in-95 duration-300 relative overflow-hidden border-4 border-brand-yellow">
             {/* Confetti-ish background decoration */}
             <div className="absolute top-0 left-0 w-full h-4 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iMiIgZmlsbD0iI0ZGRDkzRCIgb3BhY2l0eT0iMC41Ii8+PC9zdmc+')] opacity-50"></div>
             
             <div className="mb-6 flex justify-center relative">
               <div className="absolute -top-4 -right-4 text-4xl animate-bounce">✨</div>
               <div className="absolute -bottom-2 -left-4 text-4xl animate-bounce" style={{animationDelay: '0.2s'}}>🎉</div>
               <div className="w-24 h-24 rounded-full bg-brand-light border-4 border-brand-yellow flex items-center justify-center text-5xl shadow-inner animate-bounce-slow">
                 {winner.text.match(/\p{Emoji}/u)?.[0] || '🍽️'}
               </div>
             </div>
             
             <h3 className="text-brand-teal text-sm font-black tracking-widest mb-2 uppercase">今天的主角是</h3>
             <h2 className="text-3xl font-heading font-black text-brand-dark mb-6 break-words leading-tight" style={{color: winner.color}}>
               {winner.text.replace(/\p{Emoji}/u, '').trim()}
             </h2>

             {winningComment ? (
               <div className="bg-yellow-50 text-yellow-800 p-4 rounded-2xl text-sm font-medium mb-6 border-2 border-yellow-100 relative text-left">
                 <PartyPopper size={20} className="absolute -top-3 -right-2 text-brand-red fill-current" />
                 “{winningComment}”
               </div>
             ) : isCommentLoading ? (
                <div className="h-16 flex flex-col items-center justify-center mb-6 gap-2">
                  <RefreshCw className="animate-spin text-brand-teal" size={24} />
                  <span className="text-xs text-gray-400 font-bold">AI 大厨正在锐评中...</span>
                </div>
             ) : null}

             <button 
               onClick={() => setWinner(null)}
               className="w-full bg-brand-teal text-white py-3.5 rounded-xl font-bold text-lg hover:bg-teal-500 transition-colors shadow-lg shadow-teal-200"
             >
               好耶！就吃这个！😍
             </button>
             <button 
               onClick={() => { setWinner(null); handleSpin(); }}
               className="mt-4 text-sm font-bold text-gray-400 hover:text-brand-dark underline decoration-2 decoration-dotted underline-offset-4"
             >
               不满意？再转一次
             </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="fixed bottom-0 w-full p-3 text-center text-xs text-gray-400 bg-white/80 backdrop-blur-md border-t border-gray-100">
        Powered by React & Gemini AI 🤖
      </footer>
    </div>
  );
};

export default App;