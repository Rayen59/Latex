import React, { useState } from 'react';
import { User } from './types';
import { AuthModal } from './components/AuthModal';
import { UserChatView } from './components/UserChatView';
import { UserInboxView } from './components/UserInboxView';
import { AdminChatView } from './components/AdminChatView';
import { RankingsView } from './components/RankingsView';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('mathmessenger_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [currentView, setCurrentView] = useState<'chat' | 'inbox' | 'rankings'>('chat');

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('mathmessenger_user', JSON.stringify(user));
    } catch (e) {
      console.error(e);
    }
    setCurrentView('chat');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('mathmessenger_user');
    } catch (e) {
      console.error(e);
    }
    setCurrentView('chat');
  };

  const handleUserUpdate = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    try {
      localStorage.setItem('mathmessenger_user', JSON.stringify(updatedUser));
    } catch (e) {
      console.error(e);
    }
  };

  // If no user is logged in, show AuthModal
  if (!currentUser) {
    return <AuthModal onLoginSuccess={handleLoginSuccess} />;
  }

  // If viewing Leaderboards & Global Statistics
  if (currentView === 'rankings') {
    return (
      <RankingsView
        currentUser={currentUser}
        onBack={() => setCurrentView('chat')}
      />
    );
  }

  // If logged in as Admin (`admin891@gmail.com`)
  if (currentUser.role === 'admin') {
    return (
      <AdminChatView
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenRankings={() => setCurrentView('rankings')}
      />
    );
  }

  // If in user's Messenger Inbox view
  if (currentView === 'inbox') {
    return (
      <UserInboxView
        currentUser={currentUser}
        onOpenChat={() => setCurrentView('chat')}
        onOpenRankings={() => setCurrentView('rankings')}
        onLogout={handleLogout}
      />
    );
  }

  // Contestant User Chat view (Exact Messenger UI with prominent Back Arrow ←)
  return (
    <UserChatView
      currentUser={currentUser}
      onBack={() => setCurrentView('inbox')}
      onLogout={handleLogout}
      onOpenRankings={() => setCurrentView('rankings')}
      onUserUpdate={handleUserUpdate}
    />
  );
}
