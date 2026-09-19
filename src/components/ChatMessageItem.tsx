import React from 'react';
import { ChatMessage, User } from '../types';
import { MathRenderer } from './MathRenderer';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  ZoomIn, 
  Check, 
  X,
  User as UserIcon,
  Sparkles
} from 'lucide-react';

interface ChatMessageItemProps {
  message: ChatMessage;
  viewerRole: 'user' | 'admin';
  candidateUser: User;
  onImageClick: (imageUrl: string) => void;
  onMarkMessage?: (messageId: string, status: 'vrai' | 'faux') => void;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  viewerRole,
  candidateUser,
  onImageClick,
  onMarkMessage,
}) => {
  const isAdminSender = message.senderRole === 'admin';
  
  // Is this message sent by the person currently viewing the screen?
  const isMine = (viewerRole === 'user' && !isAdminSender) || (viewerRole === 'admin' && isAdminSender);

  // Time formatted nicely
  const timeFormatted = new Date(message.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Candidate status ring color
  const getCandidateRing = () => {
    switch (candidateUser.status) {
      case 'vert':
        return 'ring-2 ring-emerald-500 text-emerald-300';
      case 'rouge':
        return 'ring-2 ring-rose-500 text-rose-300';
      case 'orange':
      default:
        return 'ring-2 ring-amber-500 text-amber-300';
    }
  };

  return (
    <div
      className={`flex items-start gap-3 my-3 w-full transition-all ${
        isMine ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      {/* Sender Avatar */}
      <div className="shrink-0 flex flex-col items-center">
        {isAdminSender ? (
          <div className="relative group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-700 via-indigo-700 to-amber-500 p-0.5 shadow-md shadow-purple-900/40">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-amber-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
            <span className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 text-[9px] font-bold px-1 rounded-full border border-slate-900">
              JURY
            </span>
          </div>
        ) : (
          <div className="relative group">
            <div
              className={`w-10 h-10 rounded-2xl bg-slate-800 p-0.5 flex items-center justify-center text-sm font-bold shadow-md ${getCandidateRing()}`}
            >
              <span className="text-white font-mono">
                {candidateUser.name.substring(0, 2).toUpperCase()}
              </span>
            </div>
            <span
              className="absolute -bottom-1 -right-1 text-xs"
              title={`${candidateUser.country} (${candidateUser.gender})`}
            >
              {candidateUser.countryCode || '🌍'}
            </span>
          </div>
        )}
      </div>

      {/* Message Content Container */}
      <div className={`flex flex-col max-w-[85%] sm:max-w-xl md:max-w-2xl ${isMine ? 'items-end' : 'items-start'}`}>
        {/* Sender Identity Label + Timestamp */}
        <div className="flex items-center gap-2 mb-1 px-1 text-xs">
          {isAdminSender ? (
            <div className="flex items-center gap-1.5 font-semibold text-purple-300">
              <span className="bg-purple-950/80 border border-purple-800 text-purple-200 px-2 py-0.5 rounded-full text-[10px] tracking-wide flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                {viewerRole === 'admin' ? 'Vous (Jury Administrateur)' : 'Jury Officiel (Prof. Admin)'}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 font-semibold text-slate-300">
              <span className="text-slate-200">
                {viewerRole === 'user' ? 'Vous (Candidat)' : `Candidat : ${candidateUser.name}`}
              </span>
              <span className="text-slate-400 text-[11px] font-normal">
                {candidateUser.countryCode} {candidateUser.country}
              </span>
            </div>
          )}
          <span className="text-slate-400 text-[11px]">{timeFormatted}</span>
        </div>

        {/* Message Bubble Card */}
        <div
          className={`rounded-2xl p-4 sm:p-5 text-sm shadow-xl transition-all ${
            isAdminSender
              ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-purple-950/40 text-slate-100 border-2 border-purple-600/40 shadow-purple-950/25 rounded-tl-sm'
              : isMine
              ? 'bg-gradient-to-br from-indigo-700 via-indigo-800 to-blue-900 text-white border border-indigo-400/30 shadow-indigo-950/30 rounded-tr-sm'
              : 'bg-slate-900/95 text-slate-100 border border-slate-700/80 shadow-slate-950/40 rounded-tl-sm'
          }`}
        >
          {/* Official Jury Banner inside bubble for Admin messages */}
          {isAdminSender && (
            <div className="flex items-center gap-1.5 text-xs text-amber-300 font-semibold mb-2.5 pb-2 border-b border-purple-500/30">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Instruction & Avis Officiel du Jury</span>
            </div>
          )}

          {/* Attached Image (Photo of written math proof) */}
          {message.imageUrl && (
            <div className="mb-3.5 relative group rounded-xl overflow-hidden border border-white/10 bg-slate-950/80">
              <img
                src={message.imageUrl}
                alt="Feuille de calcul mathématique"
                className="max-h-72 w-full object-contain cursor-pointer transition-transform duration-200 group-hover:scale-[1.01]"
                onClick={() => onImageClick(message.imageUrl!)}
                referrerPolicy="no-referrer"
              />
              <button
                type="button"
                onClick={() => onImageClick(message.imageUrl!)}
                className="absolute bottom-2 right-2 px-2.5 py-1.5 bg-slate-950/85 hover:bg-slate-900 text-white rounded-lg text-xs flex items-center gap-1.5 backdrop-blur border border-white/20 shadow-lg cursor-pointer transition"
              >
                <ZoomIn className="w-3.5 h-3.5 text-indigo-300" />
                <span>Plein écran</span>
              </button>
            </div>
          )}

          {/* Rendered Math and Text */}
          {message.content && (
            <div className="text-[0.95rem] leading-relaxed">
              <MathRenderer content={message.content} />
            </div>
          )}

          {/* Message Evaluation Status (Vrai / Faux) */}
          {message.markedStatus && (
            <div
              className={`mt-3.5 pt-2.5 border-t flex items-center gap-2 text-xs font-semibold ${
                message.markedStatus === 'vrai'
                  ? 'border-emerald-500/30 text-emerald-300 bg-emerald-950/30 -mx-4 sm:-mx-5 -mb-4 sm:-mb-5 p-3 rounded-b-2xl'
                  : 'border-rose-500/30 text-rose-300 bg-rose-950/30 -mx-4 sm:-mx-5 -mb-4 sm:-mb-5 p-3 rounded-b-2xl'
              }`}
            >
              {message.markedStatus === 'vrai' ? (
                <>
                  <div className="p-1 bg-emerald-500/20 rounded-full text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold uppercase tracking-wider text-[11px] block">
                      Raisonnement Validé (VRAI)
                    </span>
                    <span className="text-[11px] font-normal opacity-90">
                      Ce calcul ou démonstration est rigoureux et conforme.
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-1 bg-rose-500/20 rounded-full text-rose-400">
                    <XCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold uppercase tracking-wider text-[11px] block">
                      Erreur Signalée (FAUX)
                    </span>
                    <span className="text-[11px] font-normal opacity-90">
                      Une inexactitude mathématique a été relevée par l'administrateur.
                    </span>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Admin Inline Action: Grade this single message (only shown to admin on candidate messages) */}
          {viewerRole === 'admin' && !isAdminSender && onMarkMessage && (
            <div className="mt-3.5 pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs gap-2">
              <span className="text-[11px] text-slate-400">Juger ce message :</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onMarkMessage(message.id, 'vrai')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer border ${
                    message.markedStatus === 'vrai'
                      ? 'bg-emerald-600 text-white border-emerald-500 ring-2 ring-emerald-500/30'
                      : 'bg-slate-800/90 text-emerald-300 border-slate-700 hover:bg-emerald-950 hover:border-emerald-500'
                  }`}
                  title="Valider ce message comme VRAI"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Vrai</span>
                </button>
                <button
                  type="button"
                  onClick={() => onMarkMessage(message.id, 'faux')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer border ${
                    message.markedStatus === 'faux'
                      ? 'bg-rose-600 text-white border-rose-500 ring-2 ring-rose-500/30'
                      : 'bg-slate-800/90 text-rose-300 border-slate-700 hover:bg-rose-950 hover:border-rose-500'
                  }`}
                  title="Marquer ce message comme FAUX"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Faux</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
