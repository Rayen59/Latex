import React from 'react';
import { User } from '../types';
import { 
  X, 
  Trophy, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Globe, 
  User as UserIcon, 
  Award,
  LogOut,
  Calendar,
  BookOpen
} from 'lucide-react';

interface MessengerInfoDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  candidateUser: User;
  isViewerAdmin: boolean;
  onOpenRankings?: () => void;
  onLogout?: () => void;
}

export const MessengerInfoDrawer: React.FC<MessengerInfoDrawerProps> = ({
  isOpen,
  onClose,
  candidateUser,
  isViewerAdmin,
  onOpenRankings,
  onLogout,
}) => {
  if (!isOpen) return null;

  const getStatusBadge = () => {
    switch (candidateUser.status) {
      case 'vert':
        return {
          bg: 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-500/50 text-emerald-800 dark:text-emerald-300',
          dot: 'bg-emerald-500',
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
          label: 'Compte Validé (Vrai)',
          desc: 'Toutes vos démonstrations mathématiques ont été certifiées par le jury.',
        };
      case 'rouge':
        return {
          bg: 'bg-rose-50 dark:bg-rose-950/80 border-rose-300 dark:border-rose-500/50 text-rose-800 dark:text-rose-300',
          dot: 'bg-rose-500',
          icon: <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />,
          label: 'Erreurs Signalées (Faux)',
          desc: 'Le jury a relevé des erreurs dans vos calculs. Vous pouvez les corriger dans la discussion.',
        };
      case 'orange':
      default:
        return {
          bg: 'bg-amber-50 dark:bg-amber-950/80 border-amber-300 dark:border-amber-500/50 text-amber-800 dark:text-amber-300',
          dot: 'bg-amber-500',
          icon: <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
          label: 'Manque de Vérification',
          desc: 'Votre dossier et vos réponses sont en cours d\'examen par l\'administrateur.',
        };
    }
  };

  const statusInfo = getStatusBadge();

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in select-none">
      <div 
        className="w-full max-w-sm bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-white/10 h-full flex flex-col shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-200 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Fiche Concours & Profil</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 flex-1 space-y-5">
          {/* Avatar & Name */}
          <div className="text-center">
            <div className="relative inline-block mx-auto mb-3">
              <div className={`w-20 h-20 rounded-full bg-blue-100 dark:bg-slate-800 flex items-center justify-center font-bold text-2xl text-blue-700 dark:text-blue-300 shadow-md ring-4 ${
                candidateUser.status === 'vert'
                  ? 'ring-emerald-500'
                  : candidateUser.status === 'rouge'
                  ? 'ring-rose-500'
                  : 'ring-amber-500'
              }`}>
                {candidateUser.name.substring(0, 2).toUpperCase()}
              </div>
              <span className="absolute bottom-0 right-0 text-xl">
                {candidateUser.countryCode || '🌍'}
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{candidateUser.name}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{candidateUser.email}</p>
          </div>

          {/* Account Status Card ("dessine son compte en rouge / orange / vert") */}
          <div className={`p-4 rounded-2xl border ${statusInfo.bg} shadow-sm space-y-2`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                {statusInfo.icon}
                <span>{statusInfo.label}</span>
              </span>
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-white/80 dark:bg-black/40 border border-current/20 text-slate-900 dark:text-white">
                Score : <strong className="text-blue-600 dark:text-amber-300 text-sm">{candidateUser.score}</strong> / 100
              </span>
            </div>
            <p className="text-xs leading-relaxed opacity-90">{statusInfo.desc}</p>
            {candidateUser.evaluationNote && (
              <div className="mt-2 pt-2 border-t border-current/20 text-xs">
                <span className="text-[11px] font-bold block mb-0.5 text-blue-600 dark:text-blue-300">Note du Jury :</span>
                <p className="italic font-serif">"{candidateUser.evaluationNote}"</p>
              </div>
            )}
          </div>

          {/* Details List */}
          <div className="bg-slate-50 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-white/10 divide-y divide-slate-200/80 dark:divide-white/5 overflow-hidden">
            <div className="p-3.5 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Pays</span>
              </span>
              <span className="font-medium text-slate-900 dark:text-white">
                {candidateUser.countryCode} {candidateUser.country}
              </span>
            </div>

            <div className="p-3.5 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Genre</span>
              </span>
              <span className="font-medium text-slate-900 dark:text-white">
                {candidateUser.gender === 'Féminin' ? '👩 Féminin' : '👨 Masculin'}
              </span>
            </div>

            <div className="p-3.5 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Inscrit le</span>
              </span>
              <span className="font-medium text-slate-900 dark:text-white">
                {new Date(candidateUser.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Quick LaTeX Reminder */}
          <div className="bg-blue-50 dark:bg-slate-900/60 p-3.5 rounded-2xl border border-blue-200 dark:border-white/10 text-xs text-slate-700 dark:text-slate-300 space-y-1.5">
            <span className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" />
              Syntaxe LaTeX dans la discussion
            </span>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Utilisez <code className="text-blue-700 dark:text-blue-300 font-bold bg-blue-100 dark:bg-blue-950/60 px-1 py-0.5 rounded">$formule$</code> pour une formule en ligne, ou <code className="text-blue-700 dark:text-blue-300 font-bold bg-blue-100 dark:bg-blue-950/60 px-1 py-0.5 rounded">$$formule$$</code> pour un bloc centré.
            </p>
          </div>

          {/* Navigation Action Buttons */}
          <div className="space-y-2 pt-2">
            {onOpenRankings && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenRankings();
                }}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-md shadow-blue-600/20 cursor-pointer active:scale-95"
              >
                <Trophy className="w-4 h-4" />
                <span>Voir les Classements & Statistiques</span>
              </button>
            )}

            {onLogout && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onLogout();
                }}
                className="w-full py-2.5 px-4 bg-slate-100 dark:bg-slate-900 hover:bg-rose-100 dark:hover:bg-rose-950/60 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-300 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Se déconnecter</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
