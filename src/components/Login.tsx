import React, { useState, FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { User } from '../types';
import { BookOpen, ArrowRight } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const { t, i18n } = useTranslation();
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
        setError(data.error || t('login.error_login'));
      }
    } catch (err) {
      setError(t('login.error_network'));
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
          {t('app.title')}
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          {t('login.subtitle')}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-100">
          <div className="flex justify-end mb-6">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg inline-flex">
              <button 
                onClick={() => i18n.changeLanguage('cs')} 
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${i18n.language === 'cs' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                CS
              </button>
              <button 
                onClick={() => i18n.changeLanguage('en')} 
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${i18n.language.startsWith('en') ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                EN
              </button>
            </div>
          </div>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-slate-700">{t('login.email')}</label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full appearance-none rounded-xl border border-slate-300 px-3 py-2 placeholder-slate-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm transition-colors"
                  placeholder={t('login.email_placeholder')}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">{t('login.password')}</label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full appearance-none rounded-xl border border-slate-300 px-3 py-2 placeholder-slate-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm transition-colors"
                  placeholder={t('login.password_placeholder')}
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
                {loading ? t('login.button_logging_in') : t('login.button_login')}
                {!loading && <ArrowRight size={16} />}
              </button>
            </div>
          </form>

          <div className="mt-6 border-t border-slate-200 pt-6">
            <h3 className="text-sm font-medium text-slate-900 mb-3">{t('login.test_accounts_title')}</h3>
            <div className="space-y-3 text-sm text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div>
                <p className="font-semibold text-slate-800">{t('login.test_publishers')} (heslo123):</p>
                <p>vydavatel1@test.cz (Tech Magazín)</p>
                <p>vydavatel2@test.cz (Lifestyle Revue)</p>
              </div>
              <div>
                <p className="font-semibold text-slate-800">{t('login.test_clients')} (heslo123):</p>
                <p>klient1@test.cz (PR Agentura X)</p>
                <p>klient2@test.cz (Marketing Pro)</p>
              </div>
              <div>
                <p className="font-semibold text-slate-800">{t('login.test_admin')}:</p>
                <p>admin@test.cz / admin123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
