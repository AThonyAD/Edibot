import React, { useState, useEffect, FormEvent } from 'react';
import { User, OpportunityOptions, TaxonomyItem } from '../types';
import { Users, Shield, Building2, BookOpen, Trash2, Power, PowerOff, Tags, Plus, Edit2, X } from 'lucide-react';

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

type AdminTab = 'publishers' | 'titles' | 'users' | 'taxonomy';
type TaxonomyKind = 'types' | 'channels' | 'categories';

const createEmptyUserForm = () => ({
  name: '',
  email: '',
  password: '',
  role: 'publisher',
  organization_type: 'publisher',
  website: '',
  contact_email: '',
});

const createEmptyTaxonomyForm = () => ({
  value: '',
  label: '',
  description: '',
  sort_order: 0,
  is_active: true,
});

const taxonomyLabels: Record<TaxonomyKind, string> = {
  types: 'Typy',
  channels: 'Kanály',
  categories: 'Kategorie',
};

export default function AdminDashboard({ user }: { user: User }) {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [titlesList, setTitlesList] = useState<any[]>([]);
  const [taxonomy, setTaxonomy] = useState<OpportunityOptions | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>('publishers');
  const [activeTaxonomyKind, setActiveTaxonomyKind] = useState<TaxonomyKind>('types');
  const [userForm, setUserForm] = useState(createEmptyUserForm());
  const [userFormError, setUserFormError] = useState('');
  const [taxonomyForm, setTaxonomyForm] = useState(createEmptyTaxonomyForm());
  const [editingTaxonomyItem, setEditingTaxonomyItem] = useState<TaxonomyItem | null>(null);
  const [taxonomyError, setTaxonomyError] = useState('');

  useEffect(() => {
    fetchStats();
    fetchUsers();
    fetchTitles();
    fetchTaxonomy();
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

  const fetchTaxonomy = async () => {
    const res = await fetch('/api/opportunity-options?includeInactive=true');
    if (res.ok) {
      setTaxonomy(await res.json());
    }
  };

  const handleToggleUser = async (id: number) => {
    await fetch(`/api/admin/users/${id}/toggle`, { method: 'PUT' });
    fetchUsers();
  };

  const handleDeleteUser = async (id: number) => {
    if (!window.confirm('Opravdu chcete smazat tohoto uživatele? Všechna jeho média a témata budou smazána.')) return;
    await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
    fetchUsers();
    fetchStats();
  };

  const handleCreateUser = async (e: FormEvent) => {
    e.preventDefault();
    setUserFormError('');

    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': String(user.id),
      },
      body: JSON.stringify({
        ...userForm,
        admin_user_id: user.id,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setUserFormError(data.error || 'Uživatele se nepodařilo založit.');
      return;
    }

    setUserForm(createEmptyUserForm());
    fetchUsers();
    fetchStats();
    fetchTitles();
  };

  const resetTaxonomyForm = () => {
    setEditingTaxonomyItem(null);
    setTaxonomyForm(createEmptyTaxonomyForm());
    setTaxonomyError('');
  };

  const handleEditTaxonomyItem = (item: TaxonomyItem) => {
    setEditingTaxonomyItem(item);
    setTaxonomyForm({
      value: item.value,
      label: item.label,
      description: item.description || '',
      sort_order: item.sort_order || 0,
      is_active: item.is_active === 1 || item.is_active === true,
    });
    setTaxonomyError('');
  };

  const handleSaveTaxonomyItem = async (e: FormEvent) => {
    e.preventDefault();
    setTaxonomyError('');

    const payload = {
      ...taxonomyForm,
      sort_order: Number(taxonomyForm.sort_order) || 0,
      is_active: taxonomyForm.is_active ? 1 : 0,
      admin_user_id: user.id,
    };

    const url = editingTaxonomyItem
      ? `/api/admin/opportunity-taxonomy/${activeTaxonomyKind}/${editingTaxonomyItem.id}`
      : `/api/admin/opportunity-taxonomy/${activeTaxonomyKind}`;

    const res = await fetch(url, {
      method: editingTaxonomyItem ? 'PUT' : 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': String(user.id),
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setTaxonomyError(data.error || 'Položku se nepodařilo uložit.');
      return;
    }

    resetTaxonomyForm();
    fetchTaxonomy();
  };

  const handleDeactivateTaxonomyItem = async (item: TaxonomyItem) => {
    if (!window.confirm(`Deaktivovat položku "${item.label}"?`)) return;

    await fetch(`/api/admin/opportunity-taxonomy/${activeTaxonomyKind}/${item.id}`, {
      method: 'DELETE',
      headers: { 'x-user-id': String(user.id) },
    });
    fetchTaxonomy();
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
          <p className="text-slate-500">Správa uživatelů, slovníků a přehled platformy</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <SummaryCard
          active={activeTab === 'publishers'}
          icon={<Building2 size={24} />}
          label="Vydavatelství"
          value={stats.publishersCount}
          color="indigo"
          onClick={() => setActiveTab('publishers')}
        />
        <SummaryCard
          active={activeTab === 'titles'}
          icon={<BookOpen size={24} />}
          label="Mediální tituly"
          value={stats.titlesCount}
          color="emerald"
          onClick={() => setActiveTab('titles')}
        />
        <SummaryCard
          active={activeTab === 'users'}
          icon={<Users size={24} />}
          label="Uživatelé"
          value={stats.usersCount}
          color="amber"
          onClick={() => setActiveTab('users')}
        />
        <SummaryCard
          active={activeTab === 'taxonomy'}
          icon={<Tags size={24} />}
          label="Slovníky"
          value={(taxonomy?.types.length || 0) + (taxonomy?.channels.length || 0) + (taxonomy?.categories.length || 0)}
          color="sky"
          onClick={() => setActiveTab('taxonomy')}
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-4 gap-6 overflow-x-auto">
          <TabButton active={activeTab === 'publishers'} onClick={() => setActiveTab('publishers')}>Přehled vydavatelství</TabButton>
          <TabButton active={activeTab === 'titles'} onClick={() => setActiveTab('titles')}>Mediální tituly</TabButton>
          <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')}>Správa uživatelů</TabButton>
          <TabButton active={activeTab === 'taxonomy'} onClick={() => setActiveTab('taxonomy')}>Slovníky</TabButton>
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
              {titlesList.map((title, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{title.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{title.publisher_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{title.contact || '-'}</td>
                  <td className="px-6 py-4 text-right whitespace-nowrap text-sm text-slate-600">{title.count_topics}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'users' && (
          <div className="p-6 space-y-6">
            <form onSubmit={handleCreateUser} className="grid grid-cols-1 lg:grid-cols-4 gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Název / jméno</label>
                <input
                  required
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  placeholder="např. Royal Golf & Polo"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">E-mail</label>
                <input
                  required
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  placeholder="kontakt@example.cz"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Heslo</label>
                <input
                  required
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  placeholder="dočasné heslo"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Role</label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white"
                >
                  <option value="publisher">Vydavatel / pořadatel</option>
                  <option value="client">Klient</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {userForm.role === 'publisher' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Typ organizace</label>
                    <select
                      value={userForm.organization_type}
                      onChange={(e) => setUserForm({ ...userForm, organization_type: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white"
                    >
                      <option value="publisher">Vydavatelství</option>
                      <option value="event_organizer">Pořadatel eventu</option>
                      <option value="agency">Agentura</option>
                      <option value="venue">Venue / prostor</option>
                      <option value="other">Jiné</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Web</label>
                    <input
                      value={userForm.website}
                      onChange={(e) => setUserForm({ ...userForm, website: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Kontaktní e-mail</label>
                    <input
                      type="email"
                      value={userForm.contact_email}
                      onChange={(e) => setUserForm({ ...userForm, contact_email: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                      placeholder="volitelně"
                    />
                  </div>
                </>
              )}

              <div className="flex items-end">
                <button type="submit" className="inline-flex h-10 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700">
                  <Plus size={16} />
                  Přidat účet
                </button>
              </div>
              {userFormError && <div className="lg:col-span-4 text-sm text-red-600">{userFormError}</div>}
            </form>

            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
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
              {usersList.map((listedUser) => {
                const isActive = listedUser.is_active === 1 || listedUser.is_active === true || listedUser.is_active === undefined;
                return (
                  <tr key={listedUser.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{listedUser.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{listedUser.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {listedUser.role === 'publisher' ? 'Vydavatel' : listedUser.role === 'client' ? 'Klient' : 'Admin'}
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {isActive ? 'Aktivní' : 'Vypnuto'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex items-center justify-end gap-2">
                        {listedUser.id !== user.id ? (
                          <>
                            <button
                              onClick={() => handleToggleUser(listedUser.id)}
                              title={isActive ? 'Vypnout uživatele' : 'Zapnout uživatele'}
                              className={`p-2 rounded-lg transition-colors ${isActive ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                            >
                              {isActive ? <PowerOff size={18} /> : <Power size={18} />}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(listedUser.id)}
                              title="Smazat uživatele"
                              className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-slate-400 italic">To jste vy</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'taxonomy' && (
          <div className="p-6 space-y-6">
            <div className="flex flex-wrap gap-2">
              {(Object.keys(taxonomyLabels) as TaxonomyKind[]).map((kind) => (
                <button
                  key={kind}
                  onClick={() => {
                    setActiveTaxonomyKind(kind);
                    resetTaxonomyForm();
                  }}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${activeTaxonomyKind === kind ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {taxonomyLabels[kind]}
                </button>
              ))}
            </div>

            <form onSubmit={handleSaveTaxonomyItem} className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_1fr_120px_auto_auto] gap-3 items-end bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Hodnota</label>
                <input
                  required
                  value={taxonomyForm.value}
                  onChange={(e) => setTaxonomyForm({ ...taxonomyForm, value: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  placeholder="např. sport"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Název</label>
                <input
                  required
                  value={taxonomyForm.label}
                  onChange={(e) => setTaxonomyForm({ ...taxonomyForm, label: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  placeholder="Sport"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Popis</label>
                <input
                  value={taxonomyForm.description}
                  onChange={(e) => setTaxonomyForm({ ...taxonomyForm, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  placeholder="Volitelně"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Pořadí</label>
                <input
                  type="number"
                  value={taxonomyForm.sort_order}
                  onChange={(e) => setTaxonomyForm({ ...taxonomyForm, sort_order: Number(e.target.value) })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 h-10">
                <input
                  type="checkbox"
                  checked={taxonomyForm.is_active}
                  onChange={(e) => setTaxonomyForm({ ...taxonomyForm, is_active: e.target.checked })}
                />
                Aktivní
              </label>
              <div className="flex gap-2">
                <button type="submit" className="inline-flex h-10 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700">
                  {editingTaxonomyItem ? <Edit2 size={16} /> : <Plus size={16} />}
                  {editingTaxonomyItem ? 'Uložit' : 'Přidat'}
                </button>
                {editingTaxonomyItem && (
                  <button type="button" onClick={resetTaxonomyForm} className="inline-flex h-10 items-center rounded-xl border border-slate-300 px-3 text-slate-600 hover:bg-white">
                    <X size={16} />
                  </button>
                )}
              </div>
              {taxonomyError && <div className="lg:col-span-6 text-sm text-red-600">{taxonomyError}</div>}
            </form>

            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Hodnota</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Název</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Popis</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Pořadí</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Stav</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Akce</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {(taxonomy?.[activeTaxonomyKind] || []).map((item) => {
                    const isActive = item.is_active === 1 || item.is_active === true;
                    return (
                      <tr key={item.id} className={isActive ? 'hover:bg-slate-50' : 'bg-slate-50 text-slate-400'}>
                        <td className="px-4 py-3 text-sm font-mono">{item.value}</td>
                        <td className="px-4 py-3 text-sm font-medium">{item.label}</td>
                        <td className="px-4 py-3 text-sm">{item.description || '-'}</td>
                        <td className="px-4 py-3 text-sm text-right">{item.sort_order}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                            {isActive ? 'Aktivní' : 'Neaktivní'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => handleEditTaxonomyItem(item)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg">
                            <Edit2 size={16} />
                          </button>
                          {isActive && (
                            <button onClick={() => handleDeactivateTaxonomyItem(item)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                              <Trash2 size={16} />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`pb-4 font-semibold text-sm whitespace-nowrap transition-colors ${active ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
    >
      {children}
    </button>
  );
}

function SummaryCard({ active, icon, label, value, color, onClick }: { active: boolean; icon: React.ReactNode; label: string; value: number; color: 'indigo' | 'emerald' | 'amber' | 'sky'; onClick: () => void }) {
  const inactiveColors = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    sky: 'bg-sky-50 text-sky-600',
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white p-6 rounded-2xl shadow-sm border cursor-pointer transition-all hover:shadow-md ${active ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-slate-200 hover:border-indigo-300'}`}
    >
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl transition-colors ${active ? 'bg-indigo-600 text-white' : inactiveColors[color]}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-slate-500 font-medium">{label}</p>
          <p className="text-3xl font-bold text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  );
}
