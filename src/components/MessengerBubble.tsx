import React from 'react';
import { ChatMessage, User, UserRole } from '../types';
import { MathRenderer } from './MathRenderer';
import { 
  CheckCircle2, 
  XCircle, 
  Share2, 
  Check, 
  Maximize2 
} from 'lucide-react';

interface MessengerBubbleProps {
  message: ChatMessage;
  viewerRole: UserRole;
  isSelf: boolean;
  senderAvatar?: string;
  senderInitials?: string;
  candidateUser?: User;
  showTimeHeader?: boolean;
  showDeliveredStatus?: boolean;
  onImageClick?: (url: string) => void;
  onMarkMessage?: (messageId: string, status: 'vrai' | 'faux') => void;
  onShareMedia?: (message: ChatMessage) => void;
}

export const MessengerBubble: React.FC<MessengerBubbleProps> = ({
  message,
  viewerRole,
  isSelf,
  senderAvatar,
  senderInitials = 'U',
  candidateUser,
  showTimeHeader = false,
  showDeliveredStatus = false,
  onImageClick,
  onMarkMessage,
  onShareMedia,
}) => {
  const formatMessageTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="w-full flex flex-col mb-1.5 select-text">
      {/* Centered Timestamp */}
      {showTimeHeader && (
        <div className="flex justify-center my-3">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-200/70 dark:bg-slate-900/60 backdrop-blur-sm px-2.5 py-0.5 rounded-full border border-slate-300/60 dark:border-white/5">
            {formatMessageTime(message.createdAt)}
          </span>
        </div>
      )}

      {/* Bubble Row */}
      <div className={`flex items-end gap-2 ${isSelf ? 'justify-end' : 'justify-start'}`}>
        {/* Partner Avatar on the left for incoming messages */}
        {!isSelf && (
          <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-slate-800 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-[11px] shrink-0 mb-1 border border-blue-200 dark:border-white/10 shadow-sm overflow-hidden">
            {senderAvatar ? (
              <img src={senderAvatar} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              senderInitials
            )}
          </div>
        )}

        {/* Bubble & Floating Actions wrapper */}
        <div className={`flex items-center gap-2 max-w-[85%] sm:max-w-[75%] ${isSelf ? 'flex-row-reverse' : 'flex-row'}`}>
          {/* Main Bubble */}
          <div className="flex flex-col">
            {/* Sender small name if not self */}
            {!isSelf && (
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium ml-3 mb-0.5">
                {message.senderName}
              </span>
            )}

            {/* Bubble Content Body in White & Blue */}
            <div
              className={`relative overflow-hidden transition-all shadow-sm ${
                isSelf
                  ? 'bg-blue-600 hover:bg-blue-500 text-white rounded-[20px] rounded-br-[4px] px-4 py-2.5'
                  : 'bg-slate-100 hover:bg-slate-200/80 dark:bg-[#242526] dark:hover:bg-[#2a2b2d] text-slate-900 dark:text-slate-100 rounded-[20px] rounded-bl-[4px] px-4 py-2.5 border border-slate-200/70 dark:border-white/5'
              }`}
            >
              {/* Optional Attached Image */}
              {message.imageUrl && (
                <div className="relative mb-2 -mx-2 -mt-1 rounded-2xl overflow-hidden group cursor-pointer border border-black/10 dark:border-white/10">
                  <img
                    src={message.imageUrl}
                    alt="Feuille de calcul mathématique"
                    className="w-full max-h-72 object-cover transition-transform group-hover:scale-[1.02]"
                    referrerPolicy="no-referrer"
                    onClick={() => onImageClick?.(message.imageUrl!)}
                  />
                  <button
                    type="button"
                    onClick={() => onImageClick?.(message.imageUrl!)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition"
                    title="Agrandir l'image"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Text content with KaTeX rendering */}
              <div className="text-[14px] leading-relaxed break-words">
                <MathRenderer content={message.content} />
              </div>

              {/* Evaluation Status Tag if message was graded */}
              {message.markedStatus && (
                <div className="mt-2 pt-1.5 border-t border-white/20 dark:border-white/15 flex items-center gap-1.5">
                  {message.markedStatus === 'vrai' ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-500/20 text-emerald-300 dark:text-emerald-300 border border-emerald-400/40 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      Raisonnement Validé (Vrai)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-rose-500/20 text-rose-200 dark:text-rose-200 border border-rose-400/40 px-2 py-0.5 rounded-full">
                      <XCircle className="w-3 h-3 text-rose-400" />
                      Erreur Signalée (Faux)
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Admin evaluation controls (Only shown to admin on candidate messages) */}
            {viewerRole === 'admin' && message.senderRole === 'user' && onMarkMessage && (
              <div className="flex items-center gap-1 mt-1 ml-1">
                <button
                  type="button"
                  onClick={() => onMarkMessage(message.id, 'vrai')}
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition cursor-pointer flex items-center gap-1 ${
                    message.markedStatus === 'vrai'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-200 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 border border-emerald-500/30'
                  }`}
                >
                  <Check className="w-3 h-3" /> Vrai
                </button>
                <button
                  type="button"
                  onClick={() => onMarkMessage(message.id, 'faux')}
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition cursor-pointer flex items-center gap-1 ${
                    message.markedStatus === 'faux'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-slate-200 dark:bg-slate-800 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/60 border border-rose-500/30'
                  }`}
                >
                  <XCircle className="w-3 h-3" /> Faux
                </button>
              </div>
            )}
          </div>

          {/* Floating Share button */}
          <button
            type="button"
            onClick={() => onShareMedia?.(message)}
            title="Partager ou citer"
            className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/80 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-white/10 transition cursor-pointer shrink-0 shadow-sm active:scale-95"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Delivered Status Indicator */}
      {isSelf && showDeliveredStatus && (
        <div className="flex items-center justify-end gap-1 mt-1 mr-1 text-[11px] text-slate-400 font-sans">
          <span>Distribué</span>
          <div className="w-3.5 h-3.5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[8px] font-bold overflow-hidden ml-0.5">
            ✓
          </div>
        </div>
      )}
    </div>
  );
};
