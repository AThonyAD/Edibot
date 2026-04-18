import React, { useState, FormEvent } from 'react';
import { User } from '../types';
import { BookOpen, ArrowRight } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('user', JSON.stringify(data.user));
        onLogin(data.user);
      } else {
        setError(data.error || 'Chyba přihlášení');
      }
    } catch (err) {
      setError('Nepodařilo se připojit k serveru.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="bg-indigo-600 p-3 rounded-xl text-white shadow-lg">
            <BookOpen size={32} />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-slate-900">
          EdičníPlány.cz
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Databáze mediálních témat pro PR a inzerci
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-slate-700">E-mail</label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full appearance-none rounded-xl border border-slate-300 px-3 py-2 placeholder-slate-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm transition-colors"
                  placeholder="vydavatel@test.cz nebo klient@test.cz"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Heslo</label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full appearance-none rounded-xl border border-slate-300 px-3 py-2 placeholder-slate-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm transition-colors"
                  placeholder="heslo123"
                />
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center items-center gap-2 rounded-xl border border-transparent bg-indigo-600 py-2.5 px-4 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all disabled:opacity-50"
              >
                {loading ? 'Přihlašování...' : 'Přihlásit se'}
                {!loading && <ArrowRight size={16} />}
              </button>
            </div>
          </form>

          <div className="mt-6 border-t border-slate-200 pt-6">
            <h3 className="text-sm font-medium text-slate-900 mb-3">Testovací účty:</h3>
            <div className="space-y-3 text-sm text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div>
                <p className="font-semibold text-slate-800">Vydavatelé (heslo123):</p>
                <p>vydavatel1@test.cz (Tech Magazín)</p>
                <p>vydavatel2@test.cz (Lifestyle Revue)</p>
              </div>
              <div>
                <p className="font-semibold text-slate-800">Klienti (heslo123):</p>
                <p>klient1@test.cz (PR Agentura X)</p>
                <p>klient2@test.cz (Marketing Pro)</p>
              </div>
              <div>
                <p className="font-semibold text-slate-800">Administrátor:</p>
                <p>admin@test.cz / admin123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
