import React, { useState, useEffect, useRef } from 'react';
import { User, ChatMessage } from '../types';
import { MessengerHeader } from './MessengerHeader';
import { MessengerBubble } from './MessengerBubble';
import { MessengerBottomBar } from './MessengerBottomBar';
import { MessengerInfoDrawer } from './MessengerInfoDrawer';
import { ImageModal } from './ImageModal';
import confetti from 'canvas-confetti';

interface UserChatViewProps {
  currentUser: User;
  onBack: () => void;
  onLogout: () => void;
  onOpenRankings: () => void;
  onUserUpdate: (updatedUser: User) => void;
}

export const UserChatView: React.FC<UserChatViewProps> = ({
  currentUser,
  onBack,
  onLogout,
  onOpenRankings,
  onUserUpdate,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [infoDrawerOpen, setInfoDrawerOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const previousStatusRef = useRef(currentUser.status);

  // Trigger celebration confetti when account turns green!
  useEffect(() => {
    if (previousStatusRef.current !== 'vert' && currentUser.status === 'vert') {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#10B981', '#3B82F6', '#60A5FA', '#F59E0B', '#2563EB'],
      });
    }
    previousStatusRef.current = currentUser.status;
  }, [currentUser.status]);

  // Load messages
  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/messages/${currentUser.id}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  // Sync user profile to check score and status updates from admin
  const fetchCurrentUser = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const users: User[] = await res.json();
        const me = users.find((u) => u.id === currentUser.id);
        if (me) {
          onUserUpdate(me);
        }
      }
    } catch (err) {
      console.error('Error syncing user info:', err);
    }
  };

  useEffect(() => {
    fetchMessages();
    fetchCurrentUser();

    // Instant SSE listener
    const eventSource = new EventSource('/api/events');
    eventSource.addEventListener('new_message', (e: MessageEvent) => {
      try {
        const newMsg: ChatMessage = JSON.parse(e.data);
        if (newMsg.userId === currentUser.id) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      } catch (err) {
        console.error(err);
      }
    });

    eventSource.addEventListener('user_evaluated', (e: MessageEvent) => {
      try {
        const payload = JSON.parse(e.data);
        if (payload.user?.id === currentUser.id) {
          onUserUpdate(payload.user);
        }
      } catch (err) {
        console.error(err);
      }
    });

    const pollInterval = setInterval(() => {
      fetchMessages();
      fetchCurrentUser();
    }, 2500);

    return () => {
      eventSource.close();
      clearInterval(pollInterval);
    };
  }, [currentUser.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (content: string, imageUrl?: string) => {
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          senderId: currentUser.id,
          senderName: currentUser.name,
          senderRole: 'user',
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
      console.error('Failed to send message:', err);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-[#07090e] text-slate-900 dark:text-slate-100 overflow-hidden relative transition-colors duration-200">
      {/* Authentic Messenger Wallpaper in Blue/White */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Soft horizontal glowing blue band in the middle */}
        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-48 bg-gradient-to-r from-transparent via-blue-500/10 dark:via-blue-600/15 to-transparent blur-3xl opacity-60" />
        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
      </div>

      {/* Top Messenger Header with prominent Back Arrow ← */}
      <div className="z-10 shrink-0">
        <MessengerHeader
          onBack={onBack}
          title="Prof. Administrateur"
          subtitle="En ligne • Jury Concours"
          isAdminInterlocutor={true}
          userStatus={currentUser.status}
          score={currentUser.score}
          onOpenInfo={() => setInfoDrawerOpen(false)}
        />
      </div>

      {/* Chat Messages Stream with Messenger styling */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 max-w-3xl mx-auto w-full space-y-1 z-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400 text-xs gap-3">
            <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span>Chargement des échanges avec le Jury...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 px-4 max-w-md mx-auto my-auto">
            {/* Round Avatar of Interlocutor in Blue */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-400 p-0.5 mx-auto mb-3 shadow-xl">
              <div className="w-full h-full bg-white dark:bg-slate-950 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 text-2xl font-bold font-serif shadow-inner">
                $\pi$
              </div>
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Prof. Administrateur</h2>
            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-0.5">Jury Officiel du Concours Mathématique</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
              Vous êtes connecté. Vous pouvez envoyer vos réponses, équations en LaTeX ou photos de vos démonstrations via la barre Messenger ci-dessous.
            </p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isSelf = msg.senderId === currentUser.id;
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
                viewerRole="user"
                isSelf={isSelf}
                senderInitials={msg.senderName.substring(0, 2).toUpperCase()}
                candidateUser={currentUser}
                showTimeHeader={showTime}
                showDeliveredStatus={isSelf && isLastMessage}
                onImageClick={(url) => setLightboxImage(url)}
              />
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Messenger Bottom Bar with +, 📷, 🖼️, pill input and ❤️ / ➤ in White and Blue */}
      <div className="z-10">
        <MessengerBottomBar
          onSendMessage={handleSendMessage}
          senderRole="user"
          placeholder="Message"
        />
      </div>

      {/* Details / Contest Info Drawer (opened via ℹ️ icon) */}
      <MessengerInfoDrawer
        isOpen={infoDrawerOpen}
        onClose={() => setInfoDrawerOpen(false)}
        candidateUser={currentUser}
        isViewerAdmin={false}
        onOpenRankings={onOpenRankings}
        onLogout={onLogout}
      />

      {/* Lightbox for zoom on exam pictures */}
      <ImageModal imageUrl={lightboxImage} onClose={() => setLightboxImage(null)} />
    </div>
  );
};
