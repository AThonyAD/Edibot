import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { Users, Shield, Building2, BookOpen, Trash2, Power, PowerOff } from 'lucide-react';

interface AdminStats {
  usersCount: number;
  publishersCount: number;
  titlesCount: number;
  topicsCount: number;
  publishers: {
    id: number;
    name: string;
    titles_count: number;
    topics_count: number;
  }[];
}

export default function AdminDashboard({ user }: { user: User }) {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [titlesList, setTitlesList] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'publishers' | 'titles' | 'users'>('publishers');

  useEffect(() => {
    fetchStats();
    fetchUsers();
    fetchTitles();
  }, []);

  const fetchTitles = async () => {
    const res = await fetch('/api/admin/titles');
    if (res.ok) {
      setTitlesList(await res.json());
    }
  };

  const fetchStats = async () => {
    const res = await fetch('/api/admin/stats');
    if (res.ok) {
      setStats(await res.json());
    }
  };

  const fetchUsers = async () => {
    const res = await fetch('/api/admin/users');
    if (res.ok) {
      setUsersList(await res.json());
    }
  };

  const handleToggleUser = async (id: number) => {
    await fetch(`/api/admin/users/${id}/toggle`, { method: 'PUT' });
    fetchUsers(); // Refresh
  };

  const handleDeleteUser = async (id: number) => {
    if (!window.confirm('Opravdu chcete smazat tohoto uživatele? Všechna jeho média a témata budou smazána.')) return;
    await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
    fetchUsers();
    fetchStats();
  };

  if (!stats) return <div className="p-8 text-center text-slate-500">Načítám data...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="bg-red-100 p-3 rounded-2xl text-red-600">
          <Shield size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Administrátorský panel</h2>
          <p className="text-slate-500">Správa uživatelů a přehled platformy</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          onClick={() => setActiveTab('publishers')}
          className={`bg-white p-6 rounded-2xl shadow-sm border cursor-pointer transition-all hover:shadow-md ${activeTab === 'publishers' ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-slate-200 hover:border-indigo-300'}`}
        >
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl transition-colors ${activeTab === 'publishers' ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600'}`}>
              <Building2 size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Vydavatelství</p>
              <p className="text-3xl font-bold text-slate-900">{stats.publishersCount}</p>
            </div>
          </div>
        </div>
        <div 
          onClick={() => setActiveTab('titles')}
          className={`bg-white p-6 rounded-2xl shadow-sm border cursor-pointer transition-all hover:shadow-md ${activeTab === 'titles' ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-slate-200 hover:border-indigo-300'}`}
        >
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl transition-colors ${activeTab === 'titles' ? 'bg-indigo-600 text-white' : 'bg-emerald-50 text-emerald-600'}`}>
              <BookOpen size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Mediální tituly</p>
              <p className="text-3xl font-bold text-slate-900">{stats.titlesCount}</p>
            </div>
          </div>
        </div>
        <div 
          onClick={() => setActiveTab('users')}
          className={`bg-white p-6 rounded-2xl shadow-sm border cursor-pointer transition-all hover:shadow-md ${activeTab === 'users' ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-slate-200 hover:border-indigo-300'}`}
        >
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl transition-colors ${activeTab === 'users' ? 'bg-indigo-600 text-white' : 'bg-amber-50 text-amber-600'}`}>
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Celkem uživatelů</p>
              <p className="text-3xl font-bold text-slate-900">{stats.usersCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-4 gap-6">
          <button
            onClick={() => setActiveTab('publishers')}
            className={`pb-4 font-semibold text-sm transition-colors ${activeTab === 'publishers' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Přehled vydavatelství
          </button>
          <button
            onClick={() => setActiveTab('titles')}
            className={`pb-4 font-semibold text-sm transition-colors ${activeTab === 'titles' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Mediální tituly
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-4 font-semibold text-sm transition-colors ${activeTab === 'users' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Správa uživatelů
          </button>
        </div>

        {activeTab === 'publishers' && (
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Vydavatelství</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Počet titulů</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Počet témat</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {stats.publishers.map((pub) => (
                <tr key={pub.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{pub.name}</td>
                  <td className="px-6 py-4 text-right whitespace-nowrap text-sm text-slate-600">{pub.titles_count}</td>
                  <td className="px-6 py-4 text-right whitespace-nowrap text-sm text-slate-600">{pub.topics_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'titles' && (
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Titul</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Vydavatelství</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Kontakt</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Počet témat</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {titlesList.map((t, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{t.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{t.publisher_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{t.contact || '-'}</td>
                  <td className="px-6 py-4 text-right whitespace-nowrap text-sm text-slate-600">{t.count_topics}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'users' && (
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Jméno</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">E-mail</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Stav</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Akce</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {usersList.map((u) => {
                const isActive = u.is_active === 1 || u.is_active === true || u.is_active === undefined;
                return (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{u.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{u.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {u.role === 'publisher' ? 'Vydavatel' : u.role === 'client' ? 'Klient' : 'Admin'}
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {isActive ? 'Aktivní' : 'Vypnuto'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex items-center justify-end gap-2">
                        {u.id !== user.id && (
                          <>
                            <button
                              onClick={() => handleToggleUser(u.id)}
                              title={isActive ? 'Vypnout uživatele' : 'Zapnout uživatele'}
                              className={`p-2 rounded-lg transition-colors ${isActive ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                            >
                              {isActive ? <PowerOff size={18} /> : <Power size={18} />}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              title="Smazat uživatele"
                              className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </>
                        )}
                        {u.id === user.id && (
                          <span className="text-xs text-slate-400 italic">To jste vy</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
