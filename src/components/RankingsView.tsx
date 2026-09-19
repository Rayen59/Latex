import React, { useState, useEffect } from 'react';
import { User, RankingsData, CountryStat, GenderStat } from '../types';
import {
  Trophy,
  ArrowLeft,
  Users,
  TrendingUp,
  Globe,
  Award,
  Search,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Moon,
  Sun
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface RankingsViewProps {
  currentUser: User;
  onBack: () => void;
}

export const RankingsView: React.FC<RankingsViewProps> = ({ currentUser, onBack }) => {
  const { isDark, toggleTheme } = useTheme();

  // Initialize with cached rankings if available for instant rendering
  const [rankingsData, setRankingsData] = useState<RankingsData | null>(() => {
    try {
      const cached = localStorage.getItem('math_prep_rankings_cache');
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {
      // Ignore parse error
    }
    return null;
  });

  const [loading, setLoading] = useState(() => rankingsData === null);
  const [activeTab, setActiveTab] = useState<'general' | 'countries' | 'gender'>('general');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<string>('all');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchRankings = async () => {
    try {
      const res = await fetch('/api/rankings');
      if (res.ok) {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data: RankingsData = await res.json();
          setRankingsData(data);
          setErrorMsg(null);
          try {
            localStorage.setItem('math_prep_rankings_cache', JSON.stringify(data));
          } catch {
            // Storage quota ignore
          }
          return;
        }
      }

      // Fallback: fetch users and stats separately if /api/rankings is not yet available
      const [usersRes, statsRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/stats'),
      ]);

      if (usersRes.ok && statsRes.ok) {
        const users = await usersRes.json();
        const stats = await statsRes.json();
        const combined = { users, stats };
        setRankingsData(combined);
        setErrorMsg(null);
        try {
          localStorage.setItem('math_prep_rankings_cache', JSON.stringify(combined));
        } catch {
          // Storage quota ignore
        }
      } else {
        throw new Error('Données temporairement indisponibles.');
      }
    } catch (err: unknown) {
      // Graceful warn instead of error to avoid polluting console during transient network reconnects
      console.warn('Rankings refresh note:', err);
      setRankingsData((prev) => {
        if (!prev) {
          setErrorMsg('Connexion en cours avec le serveur de classement...');
        }
        return prev;
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRankings();
    const interval = setInterval(fetchRankings, 4000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !rankingsData) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#07090e] text-slate-900 dark:text-slate-100 flex items-center justify-center transition-colors">
        <div className="flex flex-col items-center gap-3">
          {errorMsg ? (
            <div className="text-center p-6 max-w-sm space-y-3">
              <p className="text-sm text-rose-500 font-medium">{errorMsg}</p>
              <button
                type="button"
                onClick={() => {
                  setLoading(true);
                  fetchRankings();
                }}
                className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition cursor-pointer"
              >
                Réessayer
              </button>
            </div>
          ) : (
            <>
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-slate-500 dark:text-slate-400">Chargement des classements...</span>
            </>
          )}
        </div>
      </div>
    );
  }

  const { users, stats } = rankingsData;

  // Filter candidates
  const filteredUsers = users.filter((u: User) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.country.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCountry = selectedCountry === 'all' || u.country === selectedCountry;
    const matchesGender = selectedGender === 'all' || u.gender === selectedGender;
    return matchesSearch && matchesCountry && matchesGender;
  });

  const uniqueCountries: string[] = Array.from(new Set(users.map((u: User) => u.country))).sort();
  const myRank = users.findIndex((u: User) => u.id === currentUser.id) + 1;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07090e] text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      {/* Top Header */}
      <header className="bg-white/95 dark:bg-slate-950/95 backdrop-blur border-b border-slate-200 dark:border-white/10 px-4 py-3 sticky top-0 z-20 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onBack}
            title="Retour en arrière"
            aria-label="Retour en arrière"
            className="p-1.5 -ml-1 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 rounded-full transition cursor-pointer active:scale-95 flex items-center justify-center shrink-0"
          >
            <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-sm">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Classements & Statistiques Mathématiques
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Résultats officiels mis à jour en temps réel
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Current user rank pill */}
          {currentUser.role === 'user' && myRank > 0 && (
            <div className="bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-700/60 rounded-xl px-3 py-1.5 flex items-center gap-2 text-xs">
              <Award className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <div>
                <span className="text-slate-500 dark:text-slate-400">Votre rang : </span>
                <span className="font-bold text-blue-600 dark:text-blue-300 font-mono">#{myRank}</span>
                <span className="text-slate-400 text-[11px]"> ({currentUser.score} pts)</span>
              </div>
            </div>
          )}

          {/* Theme Switch Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 rounded-full transition cursor-pointer"
            title={isDark ? "Mode clair" : "Mode sombre"}
          >
            {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-blue-600" />}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* KPI Overview Cards */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between mb-1">
                <span>Total Candidats</span>
                <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">{stats.totalUsers}</div>
              <div className="text-[11px] text-slate-400 mt-1">Inscrits au concours</div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between mb-1">
                <span>Moyenne Générale</span>
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {stats.avgScore} <span className="text-sm font-normal text-slate-400">/100</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Note globale des participants</div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between mb-1">
                <span>Comptes Validés (Vert)</span>
                <CheckCircle className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                {stats.greenCount}
                <span className="text-xs text-slate-400 font-normal ml-1">
                  ({stats.totalUsers > 0 ? Math.round((stats.greenCount / stats.totalUsers) * 100) : 0}%)
                </span>
              </div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400/80 mt-1">Démonstrations approuvées</div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between mb-1">
                <span>En attente / À revoir</span>
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-300">
                {stats.orangeCount + stats.redCount}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {stats.orangeCount} en attente • {stats.redCount} faux
              </div>
            </div>
          </div>
        )}

        {/* View Switcher Tabs */}
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-semibold max-w-md shadow-sm">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`flex-1 py-2 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'general'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Trophy className="w-4 h-4" />
            Classement Général
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('countries')}
            className={`flex-1 py-2 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'countries'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Globe className="w-4 h-4" />
            Par Pays & Pourcentages
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('gender')}
            className={`flex-1 py-2 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'gender'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            Par Sexe
          </button>
        </div>

        {/* Tab 1: Classement Général */}
        {activeTab === 'general' && (
          <div className="space-y-4">
            {/* Podium (Top 3) */}
            {users.length >= 3 && (
              <div className="grid grid-cols-3 gap-3 max-w-2xl mx-auto pt-4 pb-2 items-end">
                {/* #2 Silver */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-2xl text-center flex flex-col items-center order-1 shadow-sm">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-400/20 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-sm mb-1.5">
                    🥈
                  </div>
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-slate-400 flex items-center justify-center font-bold text-xs text-slate-900 dark:text-white mb-1">
                    {users[1].name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-full">{users[1].name}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">{users[1].countryCode} {users[1].country}</div>
                  <div className="text-sm font-mono font-bold text-slate-700 dark:text-slate-300 mt-1">{users[1].score} pts</div>
                </div>

                {/* #1 Gold */}
                <div className="bg-gradient-to-b from-amber-50 to-white dark:from-amber-950/40 dark:to-slate-900 border-2 border-amber-400 dark:border-amber-500/60 p-4 rounded-2xl text-center flex flex-col items-center order-2 shadow-xl shadow-amber-500/10 -translate-y-2">
                  <div className="w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-300 flex items-center justify-center font-bold text-base mb-1.5">
                    👑
                  </div>
                  <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 border-2 border-amber-400 flex items-center justify-center font-bold text-sm text-slate-900 dark:text-white mb-1 shadow">
                    {users[0].name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-200 truncate max-w-full">{users[0].name}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">{users[0].countryCode} {users[0].country}</div>
                  <div className="text-base font-mono font-bold text-amber-600 dark:text-amber-400 mt-1">{users[0].score} pts</div>
                </div>

                {/* #3 Bronze */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-2xl text-center flex flex-col items-center order-3 shadow-sm">
                  <div className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-500 flex items-center justify-center font-bold text-sm mb-1.5">
                    🥉
                  </div>
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-amber-600 flex items-center justify-center font-bold text-xs text-slate-900 dark:text-white mb-1">
                    {users[2].name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-full">{users[2].name}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">{users[2].countryCode} {users[2].country}</div>
                  <div className="text-sm font-mono font-bold text-amber-700 dark:text-amber-500 mt-1">{users[2].score} pts</div>
                </div>
              </div>
            )}

            {/* Filter Bar */}
            <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap gap-2 items-center justify-between shadow-sm">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-blue-600 dark:text-blue-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filtrer par nom ou pays..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="all">Tous les pays</option>
                  {uniqueCountries.map((c: string) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedGender}
                  onChange={(e) => setSelectedGender(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="all">Tous les sexes</option>
                  <option value="Masculin">👨 Masculin</option>
                  <option value="Féminin">👩 Féminin</option>
                </select>
              </div>
            </div>

            {/* Leaderboard Table */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider">
                      <th className="py-3 px-4 text-center w-14">Rang</th>
                      <th className="py-3 px-4">Candidat</th>
                      <th className="py-3 px-4">Pays</th>
                      <th className="py-3 px-4">Sexe</th>
                      <th className="py-3 px-4">Statut Compte</th>
                      <th className="py-3 px-4 text-right">Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                    {filteredUsers.map((u: User) => {
                      const isMe = u.id === currentUser.id;
                      const globalRank = users.findIndex((x: User) => x.id === u.id) + 1;

                      return (
                        <tr
                          key={u.id}
                          className={`transition ${
                            isMe
                              ? 'bg-blue-50/70 dark:bg-blue-950/60 font-bold border-l-4 border-l-blue-600'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                          }`}
                        >
                          <td className="py-3 px-4 text-center font-mono font-bold">
                            {globalRank === 1 ? (
                              <span className="text-base">🥇</span>
                            ) : globalRank === 2 ? (
                              <span className="text-base">🥈</span>
                            ) : globalRank === 3 ? (
                              <span className="text-base">🥉</span>
                            ) : (
                              <span className="text-slate-500 dark:text-slate-400">#{globalRank}</span>
                            )}
                          </td>

                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`w-8 h-8 rounded-full border-2 p-0.5 flex items-center justify-center shrink-0 ${
                                  u.status === 'vert'
                                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-300'
                                    : u.status === 'rouge'
                                    ? 'border-rose-500 text-rose-600 dark:text-rose-300'
                                    : 'border-amber-500 text-amber-600 dark:text-amber-300'
                                }`}
                              >
                                <div className="w-full h-full rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-800 dark:text-white">
                                  {u.name.substring(0, 2).toUpperCase()}
                                </div>
                              </div>
                              <div>
                                <div className="text-slate-900 dark:text-white flex items-center gap-1.5">
                                  <span>{u.name}</span>
                                  {isMe && (
                                    <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.2 rounded-full">
                                      Vous
                                    </span>
                                  )}
                                </div>
                                {u.evaluationNote && (
                                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-xs italic">
                                    "{u.evaluationNote}"
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                            <span className="mr-1">{u.countryCode}</span>
                            {u.country}
                          </td>

                          <td className="py-3 px-4 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                            {u.gender === 'Féminin' ? '👩 Féminin' : '👨 Masculin'}
                          </td>

                          <td className="py-3 px-4 whitespace-nowrap">
                            {u.status === 'vert' ? (
                              <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 flex items-center gap-1 w-max font-semibold">
                                <CheckCircle className="w-3 h-3" /> Validé (Vert)
                              </span>
                            ) : u.status === 'rouge' ? (
                              <span className="px-2 py-0.5 rounded-full text-xs bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-700 flex items-center gap-1 w-max font-semibold">
                                <XCircle className="w-3 h-3" /> Erreur (Rouge)
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-xs bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700 flex items-center gap-1 w-max font-semibold">
                                <AlertTriangle className="w-3 h-3" /> En attente (Orange)
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-4 text-right">
                            <span className="font-mono font-bold text-sm text-blue-600 dark:text-white">
                              {u.score}
                            </span>
                            <span className="text-slate-400 text-xs">/100</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Statistiques par Pays */}
        {activeTab === 'countries' && stats && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Répartition Géographique & Pourcentages par Pays
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                Chaque candidat a obligatoirement renseigné son pays de résidence lors de la création de compte.
              </p>

              <div className="space-y-4">
                {stats.countryStats.map((cs: CountryStat) => (
                  <div
                    key={cs.country}
                    className="p-3 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2 hover:border-blue-400 dark:hover:border-blue-700 transition"
                  >
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                        <span className="text-lg">{cs.flag}</span>
                        <span>{cs.country}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                          ({cs.count} candidat{cs.count > 1 ? 's' : ''})
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs">
                        <span className="text-slate-500 dark:text-slate-400">
                          Moyenne : <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{cs.avgScore} pts</strong>
                        </span>
                        <span className="text-slate-500 dark:text-slate-400">
                          Top score : <strong className="text-blue-600 dark:text-blue-400 font-mono">{cs.topScore} pts</strong>
                        </span>
                        <span className="font-mono font-bold text-blue-700 dark:text-blue-300 text-sm bg-blue-100 dark:bg-blue-950 px-2 py-0.5 rounded border border-blue-300 dark:border-blue-800">
                          {cs.percentage}%
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar in Blue */}
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 dark:bg-blue-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(cs.percentage, 4)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Statistiques par Sexe */}
        {activeTab === 'gender' && stats && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Participation & Performance par Sexe (Masculin / Féminin)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                Statistiques comparatives de participation et de scores moyens selon le sexe obligatoire renseigné.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stats.genderStats.map((gs: GenderStat) => {
                  const isMale = gs.gender === 'Masculin';
                  return (
                    <div
                      key={gs.gender}
                      className={`p-5 rounded-2xl border ${
                        isMale
                          ? 'bg-blue-50/50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/40'
                          : 'bg-sky-50/50 dark:bg-sky-950/30 border-sky-200 dark:border-sky-800/40'
                      } space-y-4 shadow-sm`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{isMale ? '👨' : '👩'}</span>
                          <div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">{gs.gender}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{gs.count} participants</p>
                          </div>
                        </div>
                        <div className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">
                          {gs.percentage}%
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-slate-200 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-blue-600 dark:bg-blue-500"
                          style={{ width: `${Math.max(gs.percentage, 5)}%` }}
                        />
                      </div>

                      <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs">
                        <span className="text-slate-500 dark:text-slate-400">Score Moyen Concours :</span>
                        <span className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400">
                          {gs.avgScore} / 100 pts
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
