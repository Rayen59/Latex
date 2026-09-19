import React, { useState } from 'react';
import { User, UserGender } from '../types';
import { 
  ShieldCheck, 
  User as UserIcon, 
  Lock, 
  Mail, 
  Globe, 
  CheckCircle2, 
  LogIn, 
  UserPlus,
  Eye,
  EyeOff,
  AlertTriangle,
  ArrowRight,
  Moon,
  Sun
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface AuthModalProps {
  onLoginSuccess: (user: User) => void;
}

const COUNTRIES = [
  { name: 'Tunisie', flag: '🇹🇳' },
  { name: 'France', flag: '🇫🇷' },
  { name: 'Algérie', flag: '🇩🇿' },
  { name: 'Maroc', flag: '🇲🇦' },
  { name: 'Sénégal', flag: '🇸🇳' },
  { name: 'Canada', flag: '🇨🇦' },
  { name: 'Belgique', flag: '🇧🇪' },
  { name: 'Suisse', flag: '🇨🇭' },
  { name: 'Liban', flag: '🇱🇧' },
  { name: 'Côte d\'Ivoire', flag: '🇨🇮' },
  { name: 'Cameroun', flag: '🇨🇲' },
  { name: 'Égypte', flag: '🇪🇬' },
  { name: 'Autre', flag: '🌍' },
];

export const AuthModal: React.FC<AuthModalProps> = ({ onLoginSuccess }) => {
  const { isDark, toggleTheme } = useTheme();
  // Start on register as requested: "a l'entrée afficher la création de compte"
  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [country, setCountry] = useState('Tunisie');
  const [customCountry, setCustomCountry] = useState('');
  const [gender, setGender] = useState<UserGender>('Masculin');
  const [error, setError] = useState<string | null>(null);
  const [emailConflict, setEmailConflict] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setEmailConflict(null);
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    const finalCountry = country === 'Autre' && customCountry.trim() ? customCountry.trim() : country;

    try {
      if (mode === 'register') {
        if (!name.trim()) {
          setError('Le nom complet ou pseudonyme est obligatoire.');
          setLoading(false);
          return;
        }
        if (!cleanEmail || !password) {
          setError('Email et mot de passe obligatoires.');
          setLoading(false);
          return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(cleanEmail)) {
          setError('Veuillez renseigner une adresse email valide (ex: candidat@domaine.com).');
          setLoading(false);
          return;
        }

        if (!finalCountry) {
          setError('Le choix du pays est obligatoire.');
          setLoading(false);
          return;
        }
        if (!gender) {
          setError('Le choix du sexe (Masculin ou Féminin) est obligatoire.');
          setLoading(false);
          return;
        }

        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            email: cleanEmail,
            password,
            country: finalCountry,
            gender,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          if (data.emailAlreadyExists) {
            setEmailConflict(cleanEmail);
            throw new Error(data.error || 'Cette adresse email est déjà enregistrée.');
          }
          throw new Error(data.error || 'Erreur lors de la création de compte.');
        }

        onLoginSuccess(data.user);
      } else {
        // Login mode
        if (!cleanEmail || !password) {
          setError('Email et mot de passe obligatoires.');
          setLoading(false);
          return;
        }

        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: cleanEmail,
            password,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Identifiants invalides.');
        }

        onLoginSuccess(data.user);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Une erreur est survenue.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchToLoginWithEmail = () => {
    if (emailConflict) {
      setEmail(emailConflict);
    }
    setMode('login');
    setError(null);
    setEmailConflict(null);
  };

  const handleFillAdmin = () => {
    setMode('login');
    setEmail('admin891@gmail.com');
    setPassword('sfaxmed981');
    setError(null);
    setEmailConflict(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07090e] text-slate-900 dark:text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden transition-colors duration-200">
      {/* Top Bar with Dark Mode switch */}
      <div className="absolute top-4 right-4 z-20">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Basculer le mode sombre/clair"
          className="p-2.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-blue-600 dark:text-blue-400 shadow-md hover:bg-blue-50 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          {isDark ? (
            <Sun className="w-5 h-5 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5 text-blue-600" />
          )}
        </button>
      </div>

      {/* Subtle Blue Glow in the background */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl z-10">
        {/* Brand Header in White & Blue */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-400 p-0.5 shadow-xl shadow-blue-500/20 mb-3">
            <div className="w-full h-full bg-white dark:bg-slate-950 rounded-[14px] flex items-center justify-center text-blue-600 dark:text-blue-400 font-serif font-bold text-2xl shadow-inner">
              $\pi$
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            MathMessenger
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1 max-w-md mx-auto">
            Plateforme de Messagerie Mathématique & Concours LaTeX avec notation officielle par le Jury
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden transition-colors">
          {/* Mode Switch Tabs */}
          <div className="grid grid-cols-2 p-1.5 bg-slate-100 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800/80">
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError(null);
                setEmailConflict(null);
              }}
              className={`py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
                mode === 'register'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Créer un Compte (Candidat)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
                setEmailConflict(null);
              }}
              className={`py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
                mode === 'login'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Connexion</span>
            </button>
          </div>

          <div className="p-6 sm:p-8">
            {/* Email Uniqueness Conflict Notice */}
            {emailConflict && (
              <div className="mb-5 p-4 bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-500/50 rounded-xl text-amber-800 dark:text-amber-200 text-xs sm:text-sm shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-amber-900 dark:text-amber-300 font-semibold">
                      Adresse email déjà utilisée !
                    </strong>
                    <span>
                      Règle stricte : un email ne peut être utilisé qu'une seule fois. Ce compte existe déjà.
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSwitchToLoginWithEmail}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition shrink-0 cursor-pointer shadow-sm"
                >
                  <span>Se connecter</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Standard Error Notice */}
            {error && !emailConflict && (
              <div className="mb-5 p-3.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-500/40 rounded-xl text-rose-700 dark:text-rose-300 text-xs sm:text-sm flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name / Pseudonym (Only in register mode) */}
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Nom complet ou Pseudonyme mathématique <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: Yassine Karray ou Marie Curie"
                      required
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl py-2.5 pl-9 pr-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 transition outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Email Address with Single-Use Rule */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <span>Adresse Email</span> <span className="text-rose-500">*</span>
                  </label>
                  {mode === 'register' && (
                    <span className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800/40">
                      🔒 Unique (1 seule fois)
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailConflict) setEmailConflict(null);
                    }}
                    placeholder="votre.email@domaine.com"
                    required
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl py-2.5 pl-9 pr-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 transition outline-none font-sans"
                  />
                </div>
                {mode === 'register' && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Chaque candidat possède un seul compte lié à son adresse email.
                  </p>
                )}
              </div>

              {/* Password with visibility toggle */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Mot de passe <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl py-2.5 pl-9 pr-10 text-sm text-slate-900 dark:text-white placeholder-slate-400 transition outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 dark:hover:text-white transition cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Country & Gender (Only on register mode) */}
              {mode === 'register' && (
                <>
                  {/* Country Selection */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Pays de résidence <span className="text-rose-500">*</span>
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      <div className="relative">
                        <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <select
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl py-2.5 pl-9 pr-3 text-sm text-slate-900 dark:text-white transition outline-none cursor-pointer appearance-none"
                        >
                          {COUNTRIES.map((c) => (
                            <option key={c.name} value={c.name} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                              {c.flag} {c.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {country === 'Autre' && (
                        <input
                          type="text"
                          value={customCountry}
                          onChange={(e) => setCustomCountry(e.target.value)}
                          placeholder="Indiquez le nom de votre pays..."
                          required
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl py-2.5 px-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none"
                        />
                      )}
                    </div>
                  </div>

                  {/* Gender Selection */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Sexe (pour les classements statistiques) <span className="text-rose-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setGender('Masculin')}
                        className={`py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
                          gender === 'Masculin'
                            ? 'bg-blue-50 dark:bg-blue-600/20 border-blue-500 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/30'
                            : 'bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700/80 text-slate-600 dark:text-slate-400 hover:border-slate-400'
                        }`}
                      >
                        <span className="text-base">👨</span>
                        <span>Masculin</span>
                        {gender === 'Masculin' && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => setGender('Féminin')}
                        className={`py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
                          gender === 'Féminin'
                            ? 'bg-blue-50 dark:bg-blue-600/20 border-blue-500 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/30'
                            : 'bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700/80 text-slate-600 dark:text-slate-400 hover:border-slate-400'
                        }`}
                      >
                        <span className="text-base">👩</span>
                        <span>Féminin</span>
                        {gender === 'Féminin' && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Submit Button in White & Blue */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/25 transition active:scale-[0.99] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : mode === 'register' ? (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Créer mon Compte & Accéder au Chat</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Se Connecter</span>
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Credentials Footer */}
            <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800/80">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
                <span className="text-xs text-slate-500 dark:text-slate-400">Accès rapide Jury / Démo :</span>
                <button
                  type="button"
                  onClick={handleFillAdmin}
                  className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/70 hover:bg-blue-100 dark:hover:bg-blue-900 border border-blue-300 dark:border-blue-700/70 text-blue-700 dark:text-blue-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                  title="Connecter le compte Administrateur officiel"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-amber-400" />
                  <span>Compte Admin (admin891@gmail.com)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
