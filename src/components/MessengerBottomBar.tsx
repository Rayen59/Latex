import React, { useState, useRef } from 'react';
import { 
  Plus, 
  Camera, 
  Image as ImageIcon, 
  Smile, 
  Heart, 
  Send, 
  X, 
  Sparkles, 
  Calculator
} from 'lucide-react';
import { MathRenderer } from './MathRenderer';

interface MessengerBottomBarProps {
  onSendMessage: (content: string, imageUrl?: string) => void;
  senderRole: 'user' | 'admin';
  placeholder?: string;
}

const MATH_SHORTCUTS = [
  { label: 'x²', snippet: 'x^2' },
  { label: '√x', snippet: '\\sqrt{x}' },
  { label: 'a/b', snippet: '\\frac{a}{b}' },
  { label: '∫', snippet: '\\int_{0}^{1} f(x) \\, dx' },
  { label: '∑', snippet: '\\sum_{k=1}^{n} k' },
  { label: 'lim', snippet: '\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1' },
  { label: 'π', snippet: '\\pi' },
  { label: '∞', snippet: '\\infty' },
  { label: 'ℝ', snippet: '\\mathbb{R}' },
  { label: '≤', snippet: '\\le' },
  { label: '≥', snippet: '\\ge' },
  { label: '≠', snippet: '\\neq' },
  { label: '∈', snippet: '\\in' },
  { label: '±', snippet: '\\pm' },
  { label: 'Matrice', snippet: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}' },
];

export const MessengerBottomBar: React.FC<MessengerBottomBarProps> = ({
  onSendMessage,
  senderRole,
  placeholder = 'Message',
}) => {
  const [text, setText] = useState('');
  const [showMathTray, setShowMathTray] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLInputElement>(null);

  // Check if text has unclosed math delimiter
  const dollarCount = (text.match(/\$/g) || []).length;
  const isUnbalanced = dollarCount % 2 !== 0;

  const handleSend = () => {
    if (!text.trim() && !imagePreview) return;
    onSendMessage(text.trim(), imagePreview || undefined);
    setText('');
    setImagePreview(null);
    setShowMathTray(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const insertSnippet = (snippet: string) => {
    if (!text) {
      setText(`$${snippet}$ `);
    } else {
      setText((prev) => `${prev} $${snippet}$ `);
    }
    textareaRef.current?.focus();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        alert('L\'image dépasse la taille maximale de 8 Mo.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendHeart = () => {
    onSendMessage('❤️');
  };

  return (
    <div className="w-full shrink-0 bg-white/95 dark:bg-slate-950/95 border-t border-slate-200/80 dark:border-white/10 z-20 transition-colors duration-200">
      {/* Pending Image Attachment Preview */}
      {imagePreview && (
        <div className="px-4 pt-3 flex items-center gap-3">
          <div className="relative inline-block rounded-2xl overflow-hidden border-2 border-blue-500 shadow-md">
            <img
              src={imagePreview}
              alt="Prévisualisation"
              className="w-20 h-20 object-cover"
            />
            <button
              type="button"
              onClick={() => setImagePreview(null)}
              className="absolute top-1 right-1 p-1 bg-black/80 hover:bg-black text-white rounded-full transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold">Photo prête à être envoyée</span>
        </div>
      )}

      {/* Live LaTeX Realtime Preview Pill if typing formula */}
      {text.includes('$') && (
        <div className="px-4 py-2 bg-blue-50/90 dark:bg-slate-900/90 border-b border-blue-100 dark:border-white/5 flex items-center justify-between text-xs text-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1 shrink-0">
              <Sparkles className="w-3.5 h-3.5" /> KaTeX :
            </span>
            <div className="font-serif text-slate-900 dark:text-white">
              {isUnbalanced ? (
                <span className="text-amber-600 dark:text-amber-400 text-[11px] italic">
                  Fermez votre formule avec $ pour afficher le rendu KaTeX...
                </span>
              ) : (
                <MathRenderer content={text} />
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setText((t) => t + '$')}
            className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-bold ml-2 shrink-0"
          >
            Fermer avec $
          </button>
        </div>
      )}

      {/* Math Shortcuts Palette Drawer (Toggled by + button) */}
      {showMathTray && (
        <div className="p-3 bg-slate-50 dark:bg-slate-900/95 border-b border-slate-200 dark:border-white/10 max-h-48 overflow-y-auto animate-in slide-in-from-bottom-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5" />
              Raccourcis LaTeX & Symboles
            </span>
            <button
              type="button"
              onClick={() => setShowMathTray(false)}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {MATH_SHORTCUTS.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => insertSnippet(item.snippet)}
                className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-600 dark:hover:text-blue-300 hover:border-blue-400 border border-slate-200 dark:border-white/10 text-xs font-serif font-medium text-slate-800 dark:text-slate-200 transition cursor-pointer active:scale-95 shadow-sm"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Bottom Messenger Bar in White and Blue (Vocal/Video removed as requested) */}
      <div className="px-3 py-2 flex items-center gap-2 max-w-4xl mx-auto">
        {/* Hidden File & Camera Inputs */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <input
          type="file"
          ref={cameraInputRef}
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Left Action Buttons in Messenger Blue */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* + Button (Toggles Math Shortcuts) */}
          <button
            type="button"
            onClick={() => setShowMathTray(!showMathTray)}
            title="Formules mathématiques & LaTeX"
            aria-label="Ajouter une formule LaTeX"
            className={`w-9 h-9 rounded-full flex items-center justify-center transition cursor-pointer active:scale-95 ${
              showMathTray
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-blue-600 dark:text-blue-400 hover:bg-blue-500/10'
            }`}
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Camera Button 📷 */}
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            title="Prendre une photo de la feuille de calcul"
            aria-label="Prendre une photo"
            className="w-9 h-9 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 transition cursor-pointer active:scale-95"
          >
            <Camera className="w-5 h-5 fill-current stroke-none" />
          </button>

          {/* Gallery Button 🖼️ */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Envoyer une image depuis la galerie"
            aria-label="Envoyer une image"
            className="w-9 h-9 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 transition cursor-pointer active:scale-95"
          >
            <ImageIcon className="w-5 h-5 stroke-[2.2]" />
          </button>
        </div>

        {/* Center Pill Message Input */}
        <div className="flex-1 min-w-0 bg-slate-100 hover:bg-slate-200/70 dark:bg-[#242526] dark:hover:bg-[#2a2b2d] border border-slate-200/80 dark:border-white/5 rounded-full px-3.5 py-1.5 flex items-center transition shadow-inner">
          <input
            ref={textareaRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none pr-2 min-w-0"
          />

          {/* Math Pi / Smiley button */}
          <button
            type="button"
            onClick={() => insertSnippet('\\pi')}
            title="Insérer symbole mathématique ou smiley"
            aria-label="Insérer symbole"
            className="text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 rounded-full p-1 transition cursor-pointer shrink-0"
          >
            <Smile className="w-5 h-5 stroke-[2]" />
          </button>
        </div>

        {/* Right Button (Heart or Send in Blue) */}
        <div className="shrink-0">
          {text.trim() || imagePreview ? (
            <button
              type="button"
              onClick={handleSend}
              title="Envoyer"
              aria-label="Envoyer"
              className="w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center transition shadow-md shadow-blue-600/30 cursor-pointer active:scale-95"
            >
              <Send className="w-4 h-4 translate-x-0.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSendHeart}
              title="Envoyer un coeur"
              aria-label="Envoyer un coeur"
              className="w-9 h-9 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 transition cursor-pointer active:scale-95"
            >
              <Heart className="w-5 h-5 fill-current stroke-none" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
