import React, { useState, useEffect, useRef } from 'react';
import { User, ChatMessage, UserStatus } from '../types';
import { MessengerHeader } from './MessengerHeader';
import { MessengerBubble } from './MessengerBubble';
import { MessengerBottomBar } from './MessengerBottomBar';
import { MessengerInfoDrawer } from './MessengerInfoDrawer';
import { ImageModal } from './ImageModal';
import {
  ShieldCheck,
  Trophy,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Search,
  LogOut,
  ChevronRight,
  Save,
  Check,
  Minus,
  Plus,
  Moon,
  Sun,
  Users
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface AdminChatViewProps {
  currentUser: User;
  onLogout: () => void;
  onOpenRankings: () => void;
}

export const AdminChatView: React.FC<AdminChatViewProps> = ({
  currentUser,
  onLogout,
  onOpenRankings,
}) => {
  const { isDark, toggleTheme } = useTheme();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | UserStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [infoDrawerOpen, setInfoDrawerOpen] = useState(false);

  // Quick evaluation state for the active candidate
  const [editScore, setEditScore] = useState<number>(0);
  const [editStatus, setEditStatus] = useState<UserStatus>('orange');
  const [editNote, setEditNote] = useState<string>('');
  const [isSavingEval, setIsSavingEval] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load all candidates
  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data: User[] = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Load messages for selected user
  const fetchMessages = async (userId: string) => {
    setLoadingMessages(true);
    try {
      const res = await fetch(`/api/messages/${userId}`);
      if (res.ok) {
        const data: ChatMessage[] = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    fetchUsers();

    // SSE connection for real-time messages & updates
    const eventSource = new EventSource('/api/events');

    eventSource.addEventListener('new_message', (e: MessageEvent) => {
      try {
        const newMsg: ChatMessage = JSON.parse(e.data);
        if (newMsg.userId === selectedUserId) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
        // Update candidate list activity
        setUsers((prev) =>
          prev.map((u) => (u.id === newMsg.userId ? { ...u, lastActive: newMsg.createdAt } : u))
        );
      } catch (err) {
        console.error(err);
      }
    });

    eventSource.addEventListener('user_registered', (e: MessageEvent) => {
      try {
        const payload = JSON.parse(e.data);
        setUsers((prev) => {
          if (prev.some((u) => u.id === payload.user.id)) return prev;
          return [payload.user, ...prev];
        });
      } catch (err) {
        console.error(err);
      }
    });

    eventSource.addEventListener('user_evaluated', (e: MessageEvent) => {
      try {
        const payload = JSON.parse(e.data);
        setUsers((prev) =>
          prev.map((u) => (u.id === payload.user.id ? payload.user : u))
        );
      } catch (err) {
        console.error(err);
      }
    });

    const interval = setInterval(fetchUsers, 3500);

    return () => {
      eventSource.close();
      clearInterval(interval);
    };
  }, [selectedUserId]);

  // When selected user changes, load messages and pre-populate evaluation controls
  useEffect(() => {
    if (selectedUserId) {
      fetchMessages(selectedUserId);
      const targetUser = users.find((u) => u.id === selectedUserId);
      if (targetUser) {
        setEditScore(targetUser.score || 0);
        setEditStatus(targetUser.status || 'orange');
        setEditNote(targetUser.evaluationNote || '');
      }
    }
  }, [selectedUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle Admin sending message
  const handleSendMessage = async (content: string, imageUrl?: string) => {
    if (!selectedUserId) return;
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUserId,
          senderId: currentUser.id,
          senderName: 'Prof. Administrateur',
          senderRole: 'admin',
          content,
          imageUrl,
        }),
      });

      if (res.ok) {
        const sentMsg: ChatMessage = await res.json();
        setMessages((prev) => {
          if (prev.some((m) => m.id === sentMsg.id)) return prev;
          return [...prev, sentMsg];
        });
      }
    } catch (err) {
      console.error('Failed to send admin message:', err);
    }
  };

  // Quick grading save for candidate
  const handleSaveEvaluation = async () => {
    if (!selectedUserId) return;
    setIsSavingEval(true);
    setSaveSuccessMsg(false);

    try {
      const res = await fetch(`/api/users/${selectedUserId}/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: editStatus,
          score: editScore,
          evaluationNote: editNote,
        }),
      });

      if (res.ok) {
        const updated: User = await res.json();
        setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
        setSaveSuccessMsg(true);
        setTimeout(() => setSaveSuccessMsg(false), 3000);
      }
    } catch (err) {
      console.error('Evaluation update failed:', err);
    } finally {
      setIsSavingEval(false);
    }
  };

  // Mark message directly as true / false
  const handleMarkMessage = async (messageId: string, status: 'vrai' | 'faux') => {
    try {
      const res = await fetch(`/api/messages/${messageId}/mark`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markedStatus: status }),
      });

      if (res.ok) {
        const updatedMsg: ChatMessage = await res.json();
        setMessages((prev) =>
          prev.map((m) => (m.id === updatedMsg.id ? updatedMsg : m))
        );
      }
    } catch (err) {
      console.error('Failed to mark message:', err);
    }
  };

  const selectedUser = users.find((u) => u.id === selectedUserId);

  // Filter candidates list
  const filteredUsers = users.filter((u) => {
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.country.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const greenCount = users.filter((u) => u.status === 'vert').length;
  const orangeCount = users.filter((u) => u.status === 'orange').length;
  const redCount = users.filter((u) => u.status === 'rouge').length;

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-[#07090e] text-slate-900 dark:text-slate-100 overflow-hidden relative transition-colors duration-200">
      {/* If no user is selected, show Candidates Inbox List */}
      {!selectedUser ? (
        <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full bg-white dark:bg-slate-950 border-x border-slate-200 dark:border-white/5 shadow-2xl">
          {/* Top Admin Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-400 p-0.5 shadow-md">
                <div className="w-full h-full bg-white dark:bg-slate-950 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Discussions Candidats</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Jury Admin • <span className="text-blue-600 dark:text-blue-400 font-bold">{users.length} Candidats</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Theme Toggle Button */}
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

          {/* Filter badges: Vert, Orange, Rouge */}
          <div className="p-3 border-b border-slate-200 dark:border-white/5 space-y-2.5">
            <div className="bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-white/5 rounded-full px-4 py-2 flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400">
              <Search className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher un candidat..."
                className="bg-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none w-full text-xs"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] pb-1">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 rounded-full font-semibold transition cursor-pointer shrink-0 ${
                  statusFilter === 'all'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Tous ({users.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('vert')}
                className={`px-3 py-1 rounded-full font-semibold transition cursor-pointer shrink-0 ${
                  statusFilter === 'vert'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-900 text-emerald-600 dark:text-emerald-400'
                }`}
              >
                🟢 Validés ({greenCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('orange')}
                className={`px-3 py-1 rounded-full font-semibold transition cursor-pointer shrink-0 ${
                  statusFilter === 'orange'
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-900 text-amber-600 dark:text-amber-400'
                }`}
              >
                🟠 En attente ({orangeCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('rouge')}
                className={`px-3 py-1 rounded-full font-semibold transition cursor-pointer shrink-0 ${
                  statusFilter === 'rouge'
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-900 text-rose-600 dark:text-rose-400'
                }`}
              >
                🔴 Erreurs ({redCount})
              </button>
            </div>
          </div>

          {/* Candidates List */}
          <div className="flex-1 overflow-y-auto p-2 divide-y divide-slate-100 dark:divide-white/5">
            {loadingUsers ? (
              <div className="p-8 text-center text-xs text-slate-400">Chargement des candidats...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">Aucun candidat trouvé.</div>
            ) : (
              filteredUsers.map((u) => {
                const statusBorder =
                  u.status === 'vert'
                    ? 'ring-2 ring-emerald-500'
                    : u.status === 'rouge'
                    ? 'ring-2 ring-rose-500'
                    : 'ring-2 ring-amber-500';

                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => setSelectedUserId(u.id)}
                    className="w-full p-3 rounded-2xl hover:bg-blue-50/50 dark:hover:bg-white/5 transition flex items-center justify-between cursor-pointer text-left group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative shrink-0">
                        <div
                          className={`w-12 h-12 rounded-full bg-blue-100 dark:bg-slate-800 flex items-center justify-center font-bold text-blue-700 dark:text-blue-300 shadow-sm ${statusBorder}`}
                        >
                          {u.name.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="absolute -bottom-1 -right-1 text-xs">
                          {u.countryCode || '🌍'}
                        </span>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition truncate">
                            {u.name}
                          </h3>
                          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                            • {u.country} ({u.gender === 'Féminin' ? 'F' : 'M'})
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {u.email}
                        </p>
                        <span className="text-[11px] font-semibold mt-0.5 inline-block">
                          {u.status === 'vert'
                            ? '🟢 Validé (Vrai)'
                            : u.status === 'rouge'
                            ? '🔴 Erreur (Faux)'
                            : '🟠 En attente'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                        {u.score} pts
                      </span>
                      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition shrink-0" />
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* Active Candidate Conversation Screen */
        <div className="flex-1 flex flex-col h-screen relative">
          {/* Authentic Messenger Wallpaper in Blue */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-48 bg-gradient-to-r from-transparent via-blue-500/10 dark:via-blue-600/15 to-transparent blur-3xl opacity-60" />
            <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
          </div>

          {/* Top Messenger Header with prominent Back Arrow ← */}
          <div className="z-10 shrink-0">
            <MessengerHeader
              onBack={() => setSelectedUserId(null)}
              title={selectedUser.name}
              subtitle={`${selectedUser.countryCode || ''} ${selectedUser.country} • ${selectedUser.gender}`}
              userStatus={selectedUser.status}
              score={selectedUser.score}
              onOpenInfo={() => setInfoDrawerOpen(true)}
            />

            {/* Quick Admin Grading Bar under header */}
            <div className="bg-white/95 dark:bg-slate-950/95 border-b border-slate-200 dark:border-white/10 px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
              {/* Status selectors */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-blue-600 dark:text-blue-400 font-bold mr-1">Statut :</span>
                <button
                  type="button"
                  onClick={() => setEditStatus('vert')}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer flex items-center gap-1 ${
                    editStatus === 'vert'
                      ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400'
                      : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-emerald-500'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Vert
                </button>
                <button
                  type="button"
                  onClick={() => setEditStatus('orange')}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer flex items-center gap-1 ${
                    editStatus === 'orange'
                      ? 'bg-amber-600 text-white shadow-sm ring-1 ring-amber-400'
                      : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-amber-500'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" /> Orange
                </button>
                <button
                  type="button"
                  onClick={() => setEditStatus('rouge')}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer flex items-center gap-1 ${
                    editStatus === 'rouge'
                      ? 'bg-rose-600 text-white shadow-sm ring-1 ring-rose-400'
                      : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-rose-500'
                  }`}
                >
                  <XCircle className="w-3.5 h-3.5" /> Rouge
                </button>
              </div>

              {/* Score Control & Save */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded-xl border border-slate-200 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => setEditScore((s) => Math.max(0, s - 5))}
                    className="p-0.5 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editScore}
                    onChange={(e) => setEditScore(Math.max(0, Math.min(100, Number(e.target.value))))}
                    className="w-10 text-center font-mono font-bold text-blue-600 dark:text-blue-400 bg-transparent text-xs"
                  />
                  <span className="text-[10px] text-slate-400">/100</span>
                  <button
                    type="button"
                    onClick={() => setEditScore((s) => Math.min(100, s + 5))}
                    className="p-0.5 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Save Evaluation Button in Blue */}
                <button
                  type="button"
                  onClick={handleSaveEvaluation}
                  disabled={isSavingEval}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-[11px] flex items-center gap-1.5 shadow-sm shadow-blue-600/30 cursor-pointer disabled:opacity-50 transition active:scale-95"
                >
                  {isSavingEval ? (
                    <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  <span>Enregistrer Note</span>
                </button>

                {saveSuccessMsg && (
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Enregistré !
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Message Stream */}
          <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 max-w-3xl mx-auto w-full space-y-1 z-10">
            {loadingMessages ? (
              <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-xs">
                <span>Chargement de la discussion...</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-12 px-4 max-w-md mx-auto text-slate-400 text-xs">
                <p>Aucun message encore échangé avec ce candidat. Écrivez le premier message ci-dessous.</p>
              </div>
            ) : (
              messages.map((msg, index) => {
                const isSelf = msg.senderRole === 'admin';
                const isLastMessage = index === messages.length - 1;
                const prevMsg = index > 0 ? messages[index - 1] : null;
                const showTime =
                  !prevMsg ||
                  Math.abs(new Date(msg.createdAt).getTime() - new Date(prevMsg.createdAt).getTime()) >
                    15 * 60 * 1000;

                return (
                  <MessengerBubble
                    key={msg.id}
                    message={msg}
                    viewerRole="admin"
                    isSelf={isSelf}
                    senderInitials={msg.senderName.substring(0, 2).toUpperCase()}
                    candidateUser={selectedUser}
                    showTimeHeader={showTime}
                    showDeliveredStatus={isSelf && isLastMessage}
                    onImageClick={(url) => setLightboxImage(url)}
                    onMarkMessage={handleMarkMessage}
                  />
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Bar in White and Blue */}
          <div className="z-10">
            <MessengerBottomBar
              onSendMessage={handleSendMessage}
              senderRole="admin"
              placeholder={`Répondre à ${selectedUser.name} en LaTeX...`}
            />
          </div>

          {/* Candidate Profile Details Drawer */}
          <MessengerInfoDrawer
            isOpen={infoDrawerOpen}
            onClose={() => setInfoDrawerOpen(false)}
            candidateUser={selectedUser}
            isViewerAdmin={true}
            onOpenRankings={onOpenRankings}
          />
        </div>
      )}

      {/* Image Lightbox */}
      <ImageModal imageUrl={lightboxImage} onClose={() => setLightboxImage(null)} />
    </div>
  );
};
