import React from 'react';
import { X, ZoomIn, Download } from 'lucide-react';

interface ImageModalProps {
  imageUrl: string | null;
  onClose: () => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({ imageUrl, onClose }) => {
  if (!imageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl p-2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-2 border-b border-slate-800 text-slate-300 text-xs">
          <span className="flex items-center gap-1.5 font-medium">
            <ZoomIn className="w-4 h-4 text-indigo-400" />
            Aperçu haute définition de l'image
          </span>
          <div className="flex items-center gap-2">
            <a
              href={imageUrl}
              download="math_proof_image.png"
              className="p-1 hover:text-white transition"
              title="Télécharger l'image"
            >
              <Download className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition"
              title="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="p-2 flex items-center justify-center max-h-[80vh] overflow-auto">
          <img
            src={imageUrl}
            alt="Math illustration"
            className="max-h-[75vh] w-auto object-contain rounded"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
    </div>
  );
};
