import React, { useState, useEffect, useRef, ChangeEvent, FormEvent } from 'react';
import { User, Topic, MediaTitle } from '../types';
import { Plus, Edit2, Trash2, Calendar, FileUp, Loader2, CheckCircle2, AlertCircle, Layout, Newspaper } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

export default function PublisherDashboard({ user, onUserUpdate }: { user: User, onUserUpdate: (user: User) => void }) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [mediaTitles, setMediaTitles] = useState<MediaTitle[]>([]);
  const [isEditing, setIsEditing] = useState<Topic | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isAddingTitle, setIsAddingTitle] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState<MediaTitle | null>(null);
  const [isEditingPublisher, setIsEditingPublisher] = useState(false);
  const [newPublisherName, setNewPublisherName] = useState(user.name);
  const [newTitleName, setNewTitleName] = useState('');
  const [newTitleContact, setNewTitleContact] = useState('');
  const [newTitlePrice, setNewTitlePrice] = useState<number>(0);
  const [newTitleReach, setNewTitleReach] = useState<number>(0);
  const [newTitleTargetAudience, setNewTitleTargetAudience] = useState('');
  const [newTitleCollaborationType, setNewTitleCollaborationType] = useState('Klasická inzerce');
  const [editingTitleId, setEditingTitleId] = useState<number | null>(null);
  const [editingTitleData, setEditingTitleData] = useState<Partial<MediaTitle>>({});
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedTopics, setExtractedTopics] = useState<Partial<Topic>[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user?.id) {
      fetchTopics();
      fetchMediaTitles();
    }
  }, [user?.id]);

  const handleUpdatePublisherName = async (e: FormEvent) => {
    e.preventDefault();
    if (!newPublisherName.trim()) return;

    await fetch(`/api/users/${user.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newPublisherName }),
    });

    const updatedUser = { ...user, name: newPublisherName };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    onUserUpdate(updatedUser);
    setIsEditingPublisher(false);
  };

  const fetchTopics = async () => {
    const res = await fetch(`/api/publishers/${user.id}/topics`);
    const data = await res.json();
    setTopics(data);
  };

  const fetchMediaTitles = async () => {
    try {
      console.log("Fetching media titles for publisher_id:", user.id);
      const res = await fetch(`/api/media-titles?publisher_id=${user.id}`);
      if (!res.ok) throw new Error('Failed to fetch titles');
      const data = await res.json();
      console.log("Fetched titles:", data);
      setMediaTitles(data);
      return data;
    } catch (err) {
      console.error("Error fetching titles:", err);
      setError("Nepodařilo se načíst seznam titulů.");
      return [];
    }
  };

  const handleAddTitle = async (e: FormEvent) => {
    e.preventDefault();
    if (!newTitleName.trim()) return;
    setError(null);

    try {
      const res = await fetch('/api/media-titles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          publisher_id: user.id, 
          name: newTitleName,
          contact: newTitleContact,
          default_price: newTitlePrice,
          default_reach: newTitleReach,
          default_target_audience: newTitleTargetAudience,
          default_collaboration_type: newTitleCollaborationType
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Server error adding title:", errorData);
        throw new Error(errorData.error || 'Failed to add title');
      }

      const result = await res.json();
      console.log("Title added successfully, ID:", result.id);

      setNewTitleName('');
      setNewTitleContact('');
      setNewTitlePrice(0);
      setNewTitleReach(0);
      setNewTitleTargetAudience('');
      setNewTitleCollaborationType('Placené PR');
      setIsAddingTitle(false);
      await fetchMediaTitles();
    } catch (err) {
      console.error("Error adding title:", err);
      setError("Nepodařilo se přidat nový titul. Zkuste to prosím znovu.");
    }
  };

  const handleDeleteTitle = async (id: number) => {
    if (!confirm('Opravdu chcete smazat tento titul a všechna jeho témata?')) return;
    try {
      await fetch(`/api/media-titles/${id}`, { method: 'DELETE' });
      await fetchMediaTitles();
      await fetchTopics();
    } catch (err) {
      console.error("Error deleting title:", err);
    }
  };

  const handleEditTitle = (title: MediaTitle) => {
    setEditingTitleId(title.id);
    setEditingTitleData({ ...title });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateTitle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTitleId || !editingTitleData.name) return;

    try {
      const res = await fetch(`/api/media-titles/${editingTitleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingTitleData),
      });

      if (res.ok) {
        setEditingTitleId(null);
        setEditingTitleData({});
        const updatedTitles = await fetchMediaTitles();
        await fetchTopics(); // Refresh topics as they might have been updated
        
        // If the updated title is the selected one, update it
        if (selectedTitle && selectedTitle.id === editingTitleId) {
          const updated = updatedTitles.find((t: MediaTitle) => t.id === editingTitleId);
          if (updated) setSelectedTitle(updated);
        }
      }
    } catch (err) {
      console.error("Error updating title:", err);
    }
  };

  const handleDelete = async (id: number) => {
    await fetch(`/api/topics/${id}`, { method: 'DELETE' });
    fetchTopics();
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsExtracting(true);
    setExtractedTopics([]);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        const mimeType = file.type;

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: [
            {
              parts: [
                {
                  text: `Extract editorial topics from this ${mimeType === 'application/pdf' ? 'PDF' : 'image'}. 
                  For each topic, extract: title, description, publication_date (YYYY-MM-DD), deadline_date (YYYY-MM-DD), price (number), format, collaboration_type, target_audience, reach (number), and labels (array of strings).
                  
                  CRITICAL PRICE RULE: If the document contains a price list (ceník), extract the price for a "1/1 page" (celostránková inzerce).
                  
                  Generate 3-5 relevant keywords/tags as 'labels' based on the topic's content (e.g., "zdraví", "sport", "bio", "životní styl").
                  
                  If a date is missing, guess based on context or leave empty.
                  If price is missing, use 0.
                  If format is missing, use 'Print'.
                  If collaboration_type is missing, use 'Klasická inzerce'.
                  Return a JSON array of objects.`,
                },
                {
                  inlineData: {
                    data: base64Data,
                    mimeType: mimeType,
                  },
                },
              ],
            },
          ],
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  publication_date: { type: Type.STRING },
                  deadline_date: { type: Type.STRING },
                  price: { type: Type.NUMBER },
                  format: { type: Type.STRING },
                  collaboration_type: { type: Type.STRING },
                  target_audience: { type: Type.STRING },
                  reach: { type: Type.NUMBER },
                  labels: { 
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                },
                required: ["title", "description", "publication_date", "deadline_date", "price"],
              },
            },
          },
        });

        const extracted = JSON.parse(response.text || '[]');
        setExtractedTopics(extracted);
        setIsExtracting(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Extraction error:", error);
      setError("Nepodařilo se extrahovat data z PDF. Zkuste to prosím znovu nebo ručně.");
      setIsExtracting(false);
    }
  };

  const saveExtractedTopic = async (topicData: Partial<Topic>, index: number) => {
    const titleToUse = selectedTitle || mediaTitles.find(t => t.id === topicData.media_title_id) || mediaTitles[0];
    
    await fetch('/api/topics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...topicData,
        publisher_id: user.id,
        media_title_id: titleToUse?.id,
        media_name: titleToUse?.name || user.name,
        contact: topicData.contact || titleToUse?.contact || user.email,
        price: topicData.price || titleToUse?.default_price || 0,
        reach: topicData.reach || titleToUse?.default_reach || 0,
        target_audience: topicData.target_audience || titleToUse?.default_target_audience || '',
        collaboration_type: topicData.collaboration_type || titleToUse?.default_collaboration_type || 'Klasická inzerce'
      }),
    });
    
    // Remove from extracted list
    const newExtracted = [...extractedTopics];
    newExtracted.splice(index, 1);
    setExtractedTopics(newExtracted);
    
    if (newExtracted.length === 0) {
      fetchTopics();
      fetchMediaTitles(); // Refresh counts on cards
    } else {
      // Also refresh counts periodically or after each save to be sure
      fetchMediaTitles();
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 group">
            {isEditingPublisher ? (
              <form onSubmit={handleUpdatePublisherName} className="flex items-center gap-2">
                <input
                  type="text"
                  value={newPublisherName}
                  onChange={(e) => setNewPublisherName(e.target.value)}
                  className="text-2xl font-bold text-slate-900 border-b-2 border-indigo-600 outline-none bg-transparent"
                  autoFocus
                />
                <button type="submit" className="text-indigo-600 hover:text-indigo-800 font-bold text-sm">Uložit</button>
                <button type="button" onClick={() => setIsEditingPublisher(false)} className="text-slate-400 hover:text-slate-600 text-sm">Zrušit</button>
              </form>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-slate-900">{user.name}</h2>
                <button 
                  onClick={() => setIsEditingPublisher(true)}
                  className="text-slate-400 hover:text-indigo-600 transition-colors opacity-0 group-hover:opacity-100"
                  title="Upravit název vydavatelství"
                >
                  <Edit2 size={18} />
                </button>
              </>
            )}
          </div>
          <p className="text-slate-500 text-sm mt-1">Správa edičních plánů a témat</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {selectedTitle && (
            <button
              onClick={() => setSelectedTitle(null)}
              className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl font-medium hover:bg-slate-50 transition-colors shadow-sm"
            >
              Zpět na přehled titulů
            </button>
          )}
          <button
            onClick={() => setIsAddingTitle(true)}
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl font-medium hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Plus size={18} />
            Nový titul
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">Zavřít</button>
        </div>
      )}

      {isAddingTitle && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-slate-900">Přidat nový titul</h3>
            <button onClick={() => setIsAddingTitle(false)} className="text-slate-400 hover:text-slate-600">Zrušit</button>
          </div>
            <form onSubmit={handleAddTitle} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Název titulu</label>
                  <input 
                    required 
                    type="text" 
                    placeholder="např. Tech Magazín" 
                    value={newTitleName} 
                    onChange={e => setNewTitleName(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Kontaktní e-mail / info</label>
                  <input 
                    required 
                    type="text" 
                    placeholder="např. redakce@techmagazin.cz" 
                    value={newTitleContact} 
                    onChange={e => setNewTitleContact(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cena za 1/1 stranu (Kč)</label>
                  <input 
                    type="number" 
                    placeholder="0" 
                    value={newTitlePrice} 
                    onChange={e => setNewTitlePrice(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Dosah (čtenost/návštěvnost)</label>
                  <input 
                    type="number" 
                    placeholder="0" 
                    value={newTitleReach} 
                    onChange={e => setNewTitleReach(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cílová skupina</label>
                  <input 
                    type="text" 
                    placeholder="např. Ženy 25-45" 
                    value={newTitleTargetAudience} 
                    onChange={e => setNewTitleTargetAudience(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Typ spolupráce</label>
                  <select 
                    value={newTitleCollaborationType} 
                    onChange={e => setNewTitleCollaborationType(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  >
                    <option value="Redakční obsah">Redakční obsah</option>
                    <option value="Placené PR">Placené PR</option>
                    <option value="Klasická inzerce">Klasická inzerce</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-indigo-700 transition-colors">
                Uložit titul
              </button>
            </form>
        </div>
      )}

      {!selectedTitle ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Titul</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Detaily</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Cílovka & Typ</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Akce</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {mediaTitles.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500 border-dashed">
                    Zatím nemáte žádné tituly. Přidejte svůj první magazín nebo noviny.
                  </td>
                </tr>
              ) : (
                mediaTitles.map(title => (
                  <tr 
                    key={title.id} 
                    onClick={() => !editingTitleId && setSelectedTitle(title)}
                    className={`transition-all ${editingTitleId === title.id ? 'bg-indigo-50' : 'hover:bg-slate-50 cursor-pointer group'}`}
                  >
                    {editingTitleId === title.id ? (
                      <td colSpan={4} className="px-6 py-4">
                        <form onSubmit={handleUpdateTitle} onClick={e => e.stopPropagation()} className="space-y-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-bold text-slate-900">Upravit titul</h4>
                            <div className="flex gap-2">
                              <button 
                                type="button" 
                                onClick={() => setEditingTitleId(null)}
                                className="text-sm text-slate-500 hover:text-slate-700 px-3 py-1.5"
                              >
                                Zrušit
                              </button>
                              <button 
                                type="submit"
                                className="text-sm bg-indigo-600 text-white px-4 py-1.5 rounded-lg hover:bg-indigo-700 font-medium"
                              >
                                Uložit
                              </button>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1">
                              <label className="text-xs font-medium text-slate-500">Název titulu</label>
                              <input 
                                className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2"
                                value={editingTitleData.name || ''}
                                onChange={e => setEditingTitleData({...editingTitleData, name: e.target.value})}
                                placeholder="Název titulu"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-medium text-slate-500">Kontakt</label>
                              <input 
                                className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2"
                                value={editingTitleData.contact || ''}
                                onChange={e => setEditingTitleData({...editingTitleData, contact: e.target.value})}
                                placeholder="Kontakt"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-medium text-slate-500">Cena 1/1</label>
                              <input 
                                type="number"
                                className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2"
                                value={editingTitleData.default_price || 0}
                                onChange={e => setEditingTitleData({...editingTitleData, default_price: Number(e.target.value)})}
                                placeholder="Cena 1/1"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-medium text-slate-500">Dosah</label>
                              <input 
                                type="number"
                                className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2"
                                value={editingTitleData.default_reach || 0}
                                onChange={e => setEditingTitleData({...editingTitleData, default_reach: Number(e.target.value)})}
                                placeholder="Dosah"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-medium text-slate-500">Cílová skupina</label>
                              <input 
                                className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2"
                                value={editingTitleData.default_target_audience || ''}
                                onChange={e => setEditingTitleData({...editingTitleData, default_target_audience: e.target.value})}
                                placeholder="Cílová skupina"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-medium text-slate-500">Typ spolupráce</label>
                              <select 
                                className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white"
                                value={editingTitleData.default_collaboration_type || 'Placené PR'}
                                onChange={e => setEditingTitleData({...editingTitleData, default_collaboration_type: e.target.value})}
                              >
                                <option value="Redakční obsah">Redakční obsah</option>
                                <option value="Placené PR">Placené PR</option>
                                <option value="Klasická inzerce">Klasická inzerce</option>
                              </select>
                            </div>
                          </div>
                          <p className="text-xs text-slate-500 italic mt-2">
                            * Změny se propíší do všech témat tohoto titulu.
                          </p>
                        </form>
                      </td>
                    ) : (
                      <>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="bg-indigo-50 p-2.5 rounded-xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors shrink-0">
                              <Layout size={20} />
                            </div>
                            <div>
                              <h3 className="text-base font-bold text-slate-900 mb-0.5">{title.name}</h3>
                              <div className="flex items-center gap-1.5 text-sm text-slate-500">
                                <AlertCircle size={14} className="text-indigo-400" /> {title.contact}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-600 space-y-1">
                            <div><span className="font-medium text-slate-500">Cena 1/1:</span> <strong className="text-slate-900">{title.default_price?.toLocaleString('cs-CZ')} Kč</strong></div>
                            <div><span className="font-medium text-slate-500">Dosah:</span> <strong className="text-slate-900">{title.default_reach?.toLocaleString('cs-CZ')}</strong></div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-600 space-y-1">
                            <div><span className="font-medium text-slate-500">Cílovka:</span> <strong className="text-slate-900">{title.default_target_audience || 'Neuvedeno'}</strong></div>
                            <div><span className="font-medium text-slate-500">Typ:</span> <strong className="text-slate-900">{title.default_collaboration_type || 'Neuvedeno'}</strong></div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-4">
                            <div className="flex items-center gap-1.5 text-indigo-600 font-semibold text-sm bg-indigo-50 px-2.5 py-1 rounded-lg">
                              <Newspaper size={14} />
                              <span>{(title as any).topic_count || 0} témat</span>
                            </div>
                            <div className="flex gap-2">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditTitle(title);
                                }}
                                className="text-slate-400 hover:text-indigo-600 p-1.5 transition-colors"
                                title="Upravit titul"
                              >
                                <Edit2 size={18} />
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteTitle(title.id);
                                }}
                                className="text-slate-400 hover:text-red-600 p-1.5 transition-colors"
                                title="Smazat titul"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-indigo-600 p-3 rounded-2xl text-white">
                  <Layout size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">{selectedTitle.name}</h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500 mt-1">
                    <span className="flex items-center gap-1"><AlertCircle size={14} /> {selectedTitle.contact}</span>
                    <span><span className="font-medium text-slate-700">Cena:</span> {selectedTitle.default_price?.toLocaleString('cs-CZ')} Kč</span>
                    <span><span className="font-medium text-slate-700">Dosah:</span> {selectedTitle.default_reach?.toLocaleString('cs-CZ')}</span>
                    <span><span className="font-medium text-slate-700">Cílovka:</span> {selectedTitle.default_target_audience || 'Neuvedeno'}</span>
                    <span><span className="font-medium text-slate-700">Typ:</span> {selectedTitle.default_collaboration_type || 'Neuvedeno'}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  className="hidden" 
                  accept=".pdf,image/*"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isExtracting}
                  className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl font-medium hover:bg-indigo-100 transition-colors disabled:opacity-50"
                >
                  {isExtracting ? <Loader2 className="animate-spin" size={18} /> : <FileUp size={18} />}
                  Importovat ediční plán (AI)
                </button>
                <button
                  onClick={() => setIsAdding(true)}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  <Plus size={18} />
                  Přidat téma ručně
                </button>
              </div>
            </div>
          </div>

          {isExtracting && (
            <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-2xl flex items-center gap-4 animate-pulse">
              <div className="bg-indigo-600 p-3 rounded-full text-white">
                <Loader2 className="animate-spin" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-indigo-900">AI analyzuje ediční plán pro {selectedTitle.name}...</h3>
                <p className="text-indigo-700 text-sm">Hledáme témata a ceny za 1/1 stránku.</p>
              </div>
            </div>
          )}

          {extractedTopics.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-indigo-900 font-bold">
                <CheckCircle2 size={20} />
                AI našla {extractedTopics.length} témat. Zkontrolujte je a uložte:
              </div>
              <div className="grid grid-cols-1 gap-4">
                {extractedTopics.map((topic, idx) => (
                  <div key={idx} className="bg-white border-2 border-indigo-100 rounded-2xl p-4 shadow-sm relative">
                    <div className="absolute -top-3 -left-3 bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                      {idx + 1}
                    </div>
                    <TopicForm
                      user={user}
                      topic={topic as Topic}
                      mediaTitles={mediaTitles}
                      selectedTitleId={selectedTitle.id}
                      isDraft={true}
                      onClose={() => {
                        const newExtracted = [...extractedTopics];
                        newExtracted.splice(idx, 1);
                        setExtractedTopics(newExtracted);
                      }}
                      onSaved={(updatedTopic) => {
                        const newExtracted = [...extractedTopics];
                        newExtracted[idx] = updatedTopic;
                        setExtractedTopics(newExtracted);
                        saveExtractedTopic(updatedTopic, idx);
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {(isAdding || isEditing) && (
            <TopicForm
              user={user}
              topic={isEditing}
              mediaTitles={mediaTitles}
              selectedTitleId={selectedTitle.id}
              onClose={() => {
                setIsAdding(false);
                setIsEditing(null);
              }}
              onSaved={() => {
                fetchTopics();
                fetchMediaTitles(); // Refresh counts
              }}
            />
          )}

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-900">Seznam témat v titulu</h3>
              <span className="text-sm text-slate-500">{topics.filter(t => t.media_title_id === selectedTitle.id).length} témat</span>
            </div>
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Téma</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Vydání</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Uzávěrka</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Cena (Kč)</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Akce</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {topics.filter(t => t.media_title_id === selectedTitle.id).length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                      V tomto titulu zatím nejsou žádná témata.
                    </td>
                  </tr>
                ) : (
                  topics.filter(t => t.media_title_id === selectedTitle.id).map((topic) => (
                    <tr key={topic.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{topic.title}</div>
                        <div className="text-sm text-slate-500 truncate max-w-xs">{topic.description}</div>
                        <div className="flex gap-2 mt-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">{topic.format}</span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">{topic.collaboration_type}</span>
                        </div>
                        {topic.labels && topic.labels.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {topic.labels.map((label, idx) => (
                              <span key={idx} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                {label}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        <div className="flex items-center gap-1.5"><Calendar size={14}/> {new Date(topic.publication_date).toLocaleDateString('cs-CZ')}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {new Date(topic.deadline_date).toLocaleDateString('cs-CZ')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-emerald-600">
                        {topic.price.toLocaleString('cs-CZ')} Kč
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => { 
                            setIsEditing(topic); 
                            window.scrollTo({ top: 0, behavior: 'smooth' }); 
                          }} 
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(topic.id)} className="text-red-600 hover:text-red-900">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function TopicForm({ user, topic, mediaTitles, selectedTitleId, onClose, onSaved, isDraft = false }: { user: User, topic: Topic | null, mediaTitles: MediaTitle[], selectedTitleId?: number, onClose: () => void, onSaved: (topic?: any) => void, isDraft?: boolean }) {
  const selectedTitle = mediaTitles.find(t => t.id === selectedTitleId);
  
  const [formData, setFormData] = useState({
    media_title_id: selectedTitleId || topic?.media_title_id || (mediaTitles.length > 0 ? mediaTitles[0].id : 0),
    title: topic?.title || '',
    description: topic?.description || '',
    publication_date: topic?.publication_date || '',
    deadline_date: topic?.deadline_date || '',
    price: topic?.price || selectedTitle?.default_price || 0,
    format: topic?.format || 'Print',
    collaboration_type: topic?.collaboration_type || selectedTitle?.default_collaboration_type || 'Klasická inzerce',
    contact: topic?.contact || selectedTitle?.contact || '',
    target_audience: topic?.target_audience || selectedTitle?.default_target_audience || '',
    reach: topic?.reach || selectedTitle?.default_reach || 0,
    labelsInput: topic?.labels ? topic.labels.join(', ') : '',
  });

  // Update form if topic changes (important for bulk extraction review)
  useEffect(() => {
    if (topic) {
      setFormData({
        media_title_id: topic.media_title_id || selectedTitleId || (mediaTitles.length > 0 ? mediaTitles[0].id : 0),
        title: topic.title || '',
        description: topic.description || '',
        publication_date: topic.publication_date || '',
        deadline_date: topic.deadline_date || '',
        price: topic.price || selectedTitle?.default_price || 0,
        format: topic.format || 'Print',
        collaboration_type: topic.collaboration_type || selectedTitle?.default_collaboration_type || 'Klasická inzerce',
        contact: topic.contact || selectedTitle?.contact || '',
        target_audience: topic.target_audience || selectedTitle?.default_target_audience || '',
        reach: topic.reach || selectedTitle?.default_reach || 0,
        labelsInput: topic.labels ? topic.labels.join(', ') : '',
      });
    } else if (selectedTitle) {
      // If adding new, use defaults from selected title
      setFormData(prev => ({
        ...prev,
        media_title_id: selectedTitle.id,
        contact: selectedTitle.contact || '',
        price: selectedTitle.default_price || 0,
        reach: selectedTitle.default_reach || 0,
        target_audience: selectedTitle.default_target_audience || '',
        collaboration_type: selectedTitle.default_collaboration_type || 'Klasická inzerce',
      }));
    }
  }, [topic, mediaTitles, selectedTitle]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    const selectedTitle = mediaTitles.find(t => t.id === Number(formData.media_title_id));
    const finalData = {
      ...formData,
      labels: formData.labelsInput.split(',').map(l => l.trim()).filter(Boolean),
      media_title_id: selectedTitle?.id,
      media_name: selectedTitle?.name || user.name,
      publisher_id: user.id,
    };

    if (isDraft) {
      onSaved(finalData);
      return;
    }

    const url = topic ? `/api/topics/${topic.id}` : '/api/topics';
    const method = topic ? 'PUT' : 'POST';

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(finalData),
    });

    onSaved();
    onClose();
  };

  return (
    <div className={`${isDraft ? '' : 'bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-6'}`}>
      {!isDraft && <h3 className="text-lg font-bold text-slate-900 mb-4">{topic ? 'Upravit téma' : 'Nové téma'}</h3>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Titul (Magazín / Noviny)</label>
            <select 
              required 
              value={formData.media_title_id} 
              onChange={e => setFormData({...formData, media_title_id: Number(e.target.value)})} 
              className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            >
              <option value="" disabled>Vyberte titul...</option>
              {mediaTitles.map(title => (
                <option key={title.id} value={title.id}>{title.name}</option>
              ))}
            </select>
            {mediaTitles.length === 0 && (
              <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> Nejdříve přidejte titul v sekci "Spravovat tituly"
              </p>
            )}
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Název tématu</label>
            <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Popis / Anotace</label>
            <textarea required rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Datum vydání</label>
            <input required type="date" value={formData.publication_date} onChange={e => setFormData({...formData, publication_date: e.target.value})} className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Uzávěrka podkladů</label>
            <input required type="date" value={formData.deadline_date} onChange={e => setFormData({...formData, deadline_date: e.target.value})} className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Cena (Kč)</label>
            <input required type="number" min="0" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Formát</label>
            <select value={formData.format} onChange={e => setFormData({...formData, format: e.target.value})} className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white">
              <option value="Print">Print</option>
              <option value="On-line">On-line</option>
              <option value="Podcast">Podcast</option>
              <option value="TV">TV</option>
              <option value="Rádio">Rádio</option>
              <option value="Sociální sítě">Sociální sítě</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Typ spolupráce</label>
            <select value={formData.collaboration_type} onChange={e => setFormData({...formData, collaboration_type: e.target.value})} className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white">
              <option value="Redakční obsah">Redakční obsah</option>
              <option value="Placené PR">Placené PR</option>
              <option value="Klasická inzerce">Klasická inzerce</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Cílová skupina</label>
            <input required type="text" value={formData.target_audience} onChange={e => setFormData({...formData, target_audience: e.target.value})} className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="např. B2B, IT manažeři" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Dosah (počet oslovených)</label>
            <input required type="number" min="0" value={formData.reach} onChange={e => setFormData({...formData, reach: Number(e.target.value)})} className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Kontakt (e-mail / jméno)</label>
            <input required type="text" value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="např. redakce@magazin.cz" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Štítky (oddělené čárkou)</label>
            <input type="text" value={formData.labelsInput} onChange={e => setFormData({...formData, labelsInput: e.target.value})} className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="např. zdraví, sport, bio" />
            {formData.labelsInput.split(',').map(l => l.trim()).filter(Boolean).length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.labelsInput.split(',').map(l => l.trim()).filter(Boolean).map((label, idx) => (
                  <span key={idx} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {label}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50">
            {isDraft ? 'Zahodit' : 'Zrušit'}
          </button>
          <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700">
            {isDraft ? 'Uložit do databáze' : 'Uložit téma'}
          </button>
        </div>
      </form>
    </div>
  );
}
