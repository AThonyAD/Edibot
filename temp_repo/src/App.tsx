/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { User } from './types';
import Login from './components/Login';
import PublisherDashboard from './components/PublisherDashboard';
import ClientDashboard from './components/ClientDashboard';
import AdminDashboard from './components/AdminDashboard';
import { LogOut, BookOpen, Shield } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'publisher': return 'Vydavatel';
      case 'client': return 'Klient';
      case 'admin': return 'Administrátor';
      default: return role;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <BookOpen size={20} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">EdičníPlány.cz</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-600 flex items-center gap-2">
              {user.role === 'admin' && <Shield size={16} className="text-red-600" />}
              Přihlášen jako <span className="font-semibold text-slate-900">{user.name}</span> ({getRoleLabel(user.role)})
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              <LogOut size={16} />
              Odhlásit
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {user.role === 'publisher' ? (
          <PublisherDashboard user={user} onUserUpdate={setUser} />
        ) : user.role === 'admin' ? (
          <AdminDashboard user={user} />
        ) : (
          <ClientDashboard user={user} />
        )}
      </main>
    </div>
  );
}
