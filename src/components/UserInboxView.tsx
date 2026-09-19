import React from 'react';
import { User, ChatMessage } from '../types';
import { 
  MessageCircle, 
  ShieldCheck, 
  Trophy, 
  LogOut, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ChevronRight,
  ArrowRight,
  Moon,
  Sun
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface UserInboxViewProps {
  currentUser: User;
  lastMessage?: ChatMessage;
  onOpenChat: () => void;
  onOpenRankings: () => void;
  onLogout: () => void;
}

export const UserInboxView: React.FC<UserInboxViewProps> = ({
  currentUser,
  lastMessage,
  onOpenChat,
  onOpenRankings,
  onLogout,
}) => {
  const { isDark, toggleTheme } = useTheme();

  const getStatusDetails = () => {
    switch (currentUser.status) {
      case 'vert':
        return {
          ring: 'ring-2 ring-emerald-500',
          text: 'text-emerald-600 dark:text-emerald-400',
          bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-500/40',
          label: '🟢 Compte Validé (Vrai)',
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
        };
      case 'rouge':
        return {
          ring: 'ring-2 ring-rose-500',
          text: 'text-rose-600 dark:text-rose-400',
          bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-500/40',
          label: '🔴 Erreurs à corriger (Faux)',
          icon: <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />,
        };
      case 'orange':
      default:
        return {
          ring: 'ring-2 ring-amber-500',
          text: 'text-amber-600 dark:text-amber-400',
          bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-500/40',
          label: '🟠 Manque de Vérification',
          icon: <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
        };
    }
  };

  const statusDetails = getStatusDetails();

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col max-w-2xl mx-auto border-x border-slate-200 dark:border-white/5 shadow-2xl transition-colors duration-200">
      {/* Top Header matching Messenger home in White & Blue */}
      <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={`w-11 h-11 rounded-full bg-blue-100 dark:bg-slate-800 flex items-center justify-center font-bold text-blue-700 dark:text-blue-300 shadow-sm ${statusDetails.ring}`}>
              {currentUser.name.substring(0, 2).toUpperCase()}
            </div>
            <span className="absolute -bottom-1 -right-1 text-sm">
              {currentUser.countryCode || '🌍'}
            </span>
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Discussions</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {currentUser.name} • <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">{currentUser.score} pts</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          {/* Dark mode switch */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 rounded-full transition cursor-pointer"
            title={isDark ? "Mode clair" : "Mode sombre"}
          >
            {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-blue-600" />}
          </button>
          <button
            type="button"
            onClick={onOpenRankings}
            className="p-2 text-amber-500 hover:bg-amber-400/10 rounded-full transition cursor-pointer"
            title="Classements & Statistiques"
          >
            <Trophy className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition cursor-pointer"
            title="Se déconnecter"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Account Status Card */}
      <div className="p-4">
        <div className={`p-4 rounded-2xl border ${statusDetails.bg} shadow-sm flex items-center justify-between gap-3`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-current shadow-sm shrink-0">
              {statusDetails.icon}
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold uppercase tracking-wider block text-slate-900 dark:text-white">
                Statut de votre compte
              </span>
              <span className={`text-xs font-semibold ${statusDetails.text}`}>
                {statusDetails.label}
              </span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Note attribuée</span>
            <span className="text-base font-bold font-mono text-blue-600 dark:text-amber-300">
              {currentUser.score} <span className="text-xs text-slate-400">/100</span>
            </span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 pb-3">
        <div className="bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-white/5 rounded-full px-4 py-2 flex items-center gap-2.5 text-xs text-slate-400">
          <Search className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
          <input
            type="text"
            placeholder="Rechercher dans les discussions..."
            className="bg-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none w-full text-xs"
          />
        </div>
      </div>

      {/* Official Conversation Item with Jury */}
      <div className="flex-1 p-2 space-y-1">
        <button
          type="button"
          onClick={onOpenChat}
          className="w-full p-3.5 rounded-2xl hover:bg-blue-50/60 dark:hover:bg-white/5 active:bg-blue-100/50 dark:active:bg-white/10 transition flex items-center gap-3.5 cursor-pointer text-left group"
        >
          {/* Avatar with Jury Badge */}
          <div className="relative shrink-0">
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-400 p-0.5 shadow-md">
              <div className="w-full h-full bg-white dark:bg-slate-950 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
                <ShieldCheck className="w-7 h-7" />
              </div>
            </div>
            <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-slate-950 rounded-full" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                  Prof. Administrateur
                </h3>
                <span className="text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700/50 px-2 py-0.2 rounded-full">
                  Jury
                </span>
              </div>
              <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">En ligne</span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 truncate leading-relaxed">
              {lastMessage ? lastMessage.content : 'Cliquez pour ouvrir la discussion mathématique en LaTeX...'}
            </p>
          </div>

          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition shrink-0" />
        </button>
      </div>

      {/* Action Button to enter chat in Blue & White */}
      <div className="p-4 border-t border-slate-200 dark:border-white/10 bg-white/95 dark:bg-slate-950/80 backdrop-blur-sm">
        <button
          type="button"
          onClick={onOpenChat}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition cursor-pointer active:scale-98"
        >
          <MessageCircle className="w-5 h-5" />
          <span>Accéder au Chat Messenger</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
