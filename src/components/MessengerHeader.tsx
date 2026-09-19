import React from 'react';
import { ArrowLeft, Info, ShieldCheck, Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface MessengerHeaderProps {
  onBack: () => void;
  title: string;
  subtitle?: string;
  avatarText?: string;
  avatarUrl?: string;
  isAdminInterlocutor?: boolean;
  userStatus?: 'vert' | 'orange' | 'rouge';
  score?: number;
  onOpenInfo?: () => void;
}

export const MessengerHeader: React.FC<MessengerHeaderProps> = ({
  onBack,
  title,
  subtitle = 'En ligne',
  avatarText,
  avatarUrl,
  isAdminInterlocutor = false,
  userStatus,
  score,
  onOpenInfo,
}) => {
  const { isDark, toggleTheme } = useTheme();

  const getStatusBorder = () => {
    if (!userStatus) return 'ring-2 ring-blue-500/50';
    switch (userStatus) {
      case 'vert':
        return 'ring-2 ring-emerald-500';
      case 'rouge':
        return 'ring-2 ring-rose-500';
      case 'orange':
      default:
        return 'ring-2 ring-amber-500';
    }
  };

  return (
    <header className="bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200/80 dark:border-white/10 px-3 py-2.5 flex items-center justify-between shrink-0 z-20 select-none transition-colors duration-200">
      {/* Left section: Back Arrow + Avatar + Contact Info */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Back Arrow (Always visible as requested: "je veux toujours un flèche pour revenir en arrière") */}
        <button
          type="button"
          onClick={onBack}
          aria-label="Retour en arrière"
          title="Retour en arrière"
          className="p-1.5 -ml-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-500/10 rounded-full transition cursor-pointer active:scale-95 flex items-center justify-center shrink-0"
        >
          <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
        </button>

        {/* Contact Avatar */}
        <div className="relative shrink-0 cursor-pointer" onClick={onOpenInfo}>
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={title}
              className={`w-10 h-10 rounded-full object-cover ${getStatusBorder()}`}
              referrerPolicy="no-referrer"
            />
          ) : (
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-md ${
                isAdminInterlocutor
                  ? 'bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-500 text-white'
                  : 'bg-blue-100 dark:bg-slate-800 text-blue-700 dark:text-blue-300'
              } ${getStatusBorder()}`}
            >
              {isAdminInterlocutor ? (
                <ShieldCheck className="w-5 h-5 text-white" />
              ) : (
                avatarText?.substring(0, 2).toUpperCase() || 'U'
              )}
            </div>
          )}

          {/* Online green indicator dot */}
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-950 rounded-full" />
        </div>

        {/* Contact Name & Subtitle */}
        <div className="min-w-0 flex flex-col justify-center cursor-pointer" onClick={onOpenInfo}>
          <div className="flex items-center gap-1.5">
            <h1 className="text-[15px] font-bold text-slate-900 dark:text-white tracking-tight truncate leading-tight">
              {title}
            </h1>
            {isAdminInterlocutor && (
              <span className="bg-blue-500/15 border border-blue-500/30 text-blue-600 dark:text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-full hidden sm:inline-block">
                Jury
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 leading-tight truncate">
            <span className="text-emerald-500 font-medium">●</span>
            <span className="truncate">{subtitle}</span>
            {typeof score === 'number' && (
              <>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">{score} pts</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right section: Dark Mode Toggle + Info ℹ️ in White & Blue (Audio/Video calls removed as requested) */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {/* Dark Mode Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          title={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
          aria-label="Basculer le mode sombre/clair"
          className="p-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-500/10 rounded-full transition cursor-pointer active:scale-95 flex items-center justify-center"
        >
          {isDark ? (
            <Sun className="w-5 h-5 stroke-[2.2] text-amber-400" />
          ) : (
            <Moon className="w-5 h-5 stroke-[2.2] text-blue-600" />
          )}
        </button>

        {/* Info Button */}
        <button
          type="button"
          onClick={onOpenInfo}
          title="Détails du compte & concours"
          aria-label="Informations"
          className="p-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-500/10 rounded-full transition cursor-pointer active:scale-95"
        >
          <Info className="w-5 h-5 stroke-[2.2]" />
        </button>
      </div>
    </header>
  );
};
