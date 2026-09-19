import React, { useState, useRef } from 'react';
import { Send, Image as ImageIcon, X, Sparkles, AlertCircle, Eye, EyeOff, PlusCircle } from 'lucide-react';
import { MathRenderer } from './MathRenderer';

interface LiveMathInputProps {
  onSendMessage: (content: string, imageUrl?: string) => Promise<void> | void;
  disabled?: boolean;
  placeholder?: string;
  senderRole?: 'admin' | 'user';
}

interface ShortcutGroup {
  name: string;
  items: { label: string; insert: string; desc: string }[];
}

const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    name: 'Essentiels',
    items: [
      { label: '$x$', insert: '$x$', desc: 'Variable' },
      { label: '$\\frac{a}{b}$', insert: '$\\frac{a}{b}$', desc: 'Fraction' },
      { label: '$\\sqrt{x}$', insert: '$\\sqrt{x}$', desc: 'Racine carrée' },
      { label: '$x^n$', insert: '$x^{n}$', desc: 'Puissance / Exposant' },
      { label: '$x_n$', insert: '$x_{n}$', desc: 'Indice' },
    ],
  },
  {
    name: 'Calcul & Analyse',
    items: [
      { label: '$\\int$', insert: '$$\\int_{a}^{b} f(x) \\, dx$$', desc: 'Intégrale' },
      { label: '$\\sum$', insert: '$$\\sum_{n=1}^{+\\infty} u_n$$', desc: 'Somme / Série' },
      { label: '$\\lim$', insert: '$\\lim_{x \\to 0} f(x)$', desc: 'Limite' },
      { label: '$\\infty$', insert: '$\\infty$', desc: 'Infini' },
    ],
  },
  {
    name: 'Algèbre & Ensembles',
    items: [
      { label: '$\\mathbb{R}$', insert: '$\\mathbb{R}$', desc: 'Ensemble des Réels' },
      { label: '$\\mathbb{N}$', insert: '$\\mathbb{N}$', desc: 'Entiers naturels' },
      { label: 'Matrice', insert: '$$\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$$', desc: 'Matrice 2x2' },
      { label: '$\\vec{u}$', insert: '$\\vec{u}$', desc: 'Vecteur' },
    ],
  },
  {
    name: 'Symboles',
    items: [
      { label: '$\\alpha, \\beta$', insert: '$\\alpha, \\beta$', desc: 'Lettres grecques' },
      { label: '$\\pi$', insert: '$\\pi$', desc: 'Pi' },
      { label: '$\\le, \\ge$', insert: '$\\le, \\ge$', desc: 'Inégalités' },
      { label: '$\\neq$', insert: '$\\neq$', desc: 'Différent' },
      { label: '$\\forall, \\exists$', insert: '$\\forall x, \\exists y$', desc: 'Quantificateurs' },
    ],
  },
];

export const LiveMathInput: React.FC<LiveMathInputProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = 'Écrivez votre message ou équation LaTeX avec $ (ex: $x^2 + 2x + 1 = 0$)...',
  senderRole = 'user',
}) => {
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('Essentiels');
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Unclosed dollar check
  const dollarCount = (content.match(/(?<!\\)\$/g) || []).length;
  const hasUnclosedDollar = dollarCount % 2 !== 0;

  const handleInsertShortcut = (textToInsert: string) => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const newContent = content.substring(0, start) + textToInsert + content.substring(end);
    setContent(newContent);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const cursor = start + textToInsert.length;
        textareaRef.current.setSelectionRange(cursor, cursor);
      }
    }, 40);
  };

  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner un fichier image valide (PNG, JPG, JPEG).');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageFile(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          handleImageFile(file);
          e.preventDefault();
          break;
        }
      }
    }
  };

  const handleSend = async () => {
    if ((!content.trim() && !selectedImage) || isSending || disabled) return;
    setIsSending(true);
    try {
      await onSendMessage(content.trim(), selectedImage || undefined);
      setContent('');
      setSelectedImage(null);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSend();
    }
  };

  const currentGroup = SHORTCUT_GROUPS.find((g) => g.name === activeCategory) || SHORTCUT_GROUPS[0];

  return (
    <div className="bg-slate-900/95 backdrop-blur-md border-t border-slate-800 p-3 sm:p-4 rounded-b-2xl shadow-2xl">
      {/* Category selector & Shortcuts bar */}
      <div className="flex flex-col gap-2 mb-3">
        <div className="flex items-center justify-between gap-2">
          {/* Categories */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-xs">
            <span className="text-amber-400 font-semibold flex items-center gap-1 mr-1 text-[11px] shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              LaTeX Rapide :
            </span>
            {SHORTCUT_GROUPS.map((g) => (
              <button
                key={g.name}
                type="button"
                onClick={() => setActiveCategory(g.name)}
                className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer shrink-0 text-xs ${
                  activeCategory === g.name
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {g.name}
              </button>
            ))}
          </div>

          {/* Toggle Live Preview */}
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className={`px-2.5 py-1 rounded-lg text-xs flex items-center gap-1.5 shrink-0 transition cursor-pointer border font-medium ${
              showPreview
                ? 'bg-indigo-950 text-indigo-300 border-indigo-700/60'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title="Activer / Désactiver la prévisualisation"
          >
            {showPreview ? <Eye className="w-3.5 h-3.5 text-indigo-400" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Rendu Direct</span>
          </button>
        </div>

        {/* Shortcuts in chosen category */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-thin scrollbar-thumb-slate-700">
          {currentGroup.items.map((sc, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleInsertShortcut(sc.insert)}
              title={sc.desc}
              className="px-2.5 py-1 bg-slate-800/90 hover:bg-indigo-900/60 hover:text-indigo-200 hover:border-indigo-500/50 border border-slate-700/90 rounded-lg text-xs font-mono text-slate-200 transition shrink-0 cursor-pointer shadow-xs active:scale-95 flex items-center gap-1"
            >
              <PlusCircle className="w-3 h-3 text-indigo-400 opacity-60" />
              <span>{sc.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Live LaTeX Real-time Preview Area */}
      {showPreview && content.trim() && (
        <div className="mb-3 p-3.5 bg-slate-950/90 border border-indigo-500/30 rounded-xl shadow-inner animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-xs text-indigo-300 mb-2 font-semibold pb-1.5 border-b border-indigo-950">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              Aperçu KaTeX Instantané :
            </span>
            {hasUnclosedDollar ? (
              <span className="text-amber-400 flex items-center gap-1 text-[11px] font-normal bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/50">
                <AlertCircle className="w-3 h-3 text-amber-400" />
                Symbole $ non fermé (fermez avec $)
              </span>
            ) : (
              <span className="text-emerald-400 text-[11px] font-normal">
                ✓ Syntaxe LaTeX valide
              </span>
            )}
          </div>
          <div className="max-h-40 overflow-y-auto pr-1">
            <MathRenderer content={content} className="text-sm text-slate-100" />
          </div>
        </div>
      )}

      {/* Uploaded Image Preview */}
      {selectedImage && (
        <div className="relative inline-block mb-3 rounded-xl overflow-hidden border-2 border-indigo-500/50 max-w-xs group shadow-xl">
          <img
            src={selectedImage}
            alt="Pièce jointe"
            className="max-h-36 object-contain bg-slate-950"
            referrerPolicy="no-referrer"
          />
          <button
            type="button"
            onClick={() => setSelectedImage(null)}
            className="absolute top-1.5 right-1.5 p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full transition shadow-lg cursor-pointer"
            title="Supprimer cette image"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Textarea + Action buttons */}
      <div className="flex items-end gap-2.5">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            rows={2}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={placeholder}
            disabled={disabled || isSending}
            className="w-full bg-slate-950 border border-slate-700/80 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 resize-none transition outline-none font-sans"
          />
          <div className="text-[11px] text-slate-400 px-1 mt-1 flex flex-col sm:flex-row justify-between gap-1">
            <span>
              Entourez vos formules de <code className="text-indigo-300 font-bold">$...$</code> (en ligne) ou <code className="text-indigo-300 font-bold">$$...$$</code> (centré)
            </span>
            <span className="text-slate-500 font-mono text-[10px]">Ctrl + Entrée pour envoyer</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pb-5 shrink-0">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isSending}
            title="Ajouter une photo de votre feuille de calcul"
            className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded-xl transition active:scale-95 cursor-pointer disabled:opacity-50 shadow-sm"
          >
            <ImageIcon className="w-4 h-4 text-indigo-300" />
          </button>

          <button
            type="button"
            onClick={handleSend}
            disabled={(!content.trim() && !selectedImage) || disabled || isSending}
            className={`p-3 rounded-xl flex items-center justify-center transition active:scale-95 cursor-pointer font-medium text-sm ${
              senderRole === 'admin'
                ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-500 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-900/30'
                : 'bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 hover:from-indigo-500 hover:to-blue-500 text-white shadow-indigo-900/30'
            } shadow-lg disabled:opacity-40 disabled:cursor-not-allowed`}
            title="Envoyer"
          >
            {isSending ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
