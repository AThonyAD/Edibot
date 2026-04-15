import React, { useState, useEffect } from 'react';
import { User, Topic } from '../types';
import { Users, BookOpen, Shield, Trash2, AlertCircle } from 'lucide-react';

export default function AdminDashboard({ user }: { user: User }) {
  const [stats, setStats] = useState({ users: 0, topics: 0 });
  const [allTopics, setAllTopics] = useState<Topic[]>([]);

  useEffect(() => {
    fetchStats();
    fetchAllTopics();
  }, []);

  const fetchStats = async () => {
    // In a real app, we'd have a specific stats endpoint
    const res = await fetch('/api/topics');
    const topics = await res.json();
    setStats(prev => ({ ...prev, topics: topics.length }));
  };

  const fetchAllTopics = async () => {
    const res = await fetch('/api/topics');
    const data = await res.json();
    setAllTopics(data);
  };

  const handleDeleteTopic = async (id: number) => {
    await fetch(`/api/topics/${id}`, { method: 'DELETE' });
    fetchAllTopics();
    fetchStats();
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="bg-red-100 p-3 rounded-2xl text-red-600">
          <Shield size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Administrátorský panel</h2>
          <p className="text-slate-500">Přehled a správa celé platformy</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600">
              <BookOpen size={20} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Celkem témat</p>
              <p className="text-2xl font-bold text-slate-900">{stats.topics}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-50 p-3 rounded-xl text-emerald-600">
              <Users size={20} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Aktivní uživatelé</p>
              <p className="text-2xl font-bold text-slate-900">5</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4 text-amber-600">
            <AlertCircle size={20} />
            <p className="text-sm font-medium">Systém běží v pořádku</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h3 className="font-bold text-slate-900">Všechna témata v systému</h3>
        </div>
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Médium</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Téma</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Cena</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Akce</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {allTopics.map((topic) => (
              <tr key={topic.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                  {topic.media_name}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-slate-900 font-medium">{topic.title}</div>
                  <div className="text-xs text-slate-500 truncate max-w-xs">{topic.description}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                  {topic.price.toLocaleString('cs-CZ')} Kč
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    onClick={() => handleDeleteTopic(topic.id)}
                    className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
