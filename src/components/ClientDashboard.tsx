import { useState, useEffect } from 'react';
import { User, Topic, MediaTitle } from '../types';
import { Search, Filter, Calendar, Building2, Download, Mail, Tag, Layout, Users, Target } from 'lucide-react';

export default function ClientDashboard({ user }: { user: User }) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [mediaTitles, setMediaTitles] = useState<MediaTitle[]>([]);
  const [search, setSearch] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [formatFilter, setFormatFilter] = useState('');
  const [collabFilter, setCollabFilter] = useState('');
  const [deadlineFrom, setDeadlineFrom] = useState('');
  const [deadlineTo, setDeadlineTo] = useState('');
  const [mediaTitleFilter, setMediaTitleFilter] = useState('');

  useEffect(() => {
    fetchTopics();
  }, [search, maxPrice, formatFilter, collabFilter, deadlineFrom, deadlineTo, mediaTitleFilter]);

  useEffect(() => {
    fetchMediaTitles();
  }, []);

  const fetchTopics = async () => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (maxPrice) params.append('maxPrice', maxPrice);
    if (formatFilter) params.append('format', formatFilter);
    if (collabFilter) params.append('collaboration_type', collabFilter);
    if (deadlineFrom) params.append('deadlineFrom', deadlineFrom);
    if (deadlineTo) params.append('deadlineTo', deadlineTo);
    if (mediaTitleFilter) params.append('media_title_id', mediaTitleFilter);
    
    const res = await fetch(`/api/topics?${params.toString()}`);
    const data = await res.json();
    setTopics(data);
  };

  const fetchMediaTitles = async () => {
    const res = await fetch('/api/media-titles');
    const data = await res.json();
    setMediaTitles(data);
  };

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Médium,Téma,Popis,Formát,Spolupráce,Cílová skupina,Dosah,Kontakt,Datum vydání,Uzávěrka,Cena\n"
      + topics.map(t => `"${t.media_name}","${t.title}","${t.description}","${t.format}","${t.collaboration_type}","${t.target_audience}",${t.reach},"${t.contact}","${t.publication_date}","${t.deadline_date}",${t.price}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "edicni_plany.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Vyhledávání témat</h2>
          <p className="text-slate-500 mt-1">Najděte ideální prostor pro vaši kampaň</p>
        </div>
        <button onClick={handleExport} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl font-medium hover:bg-slate-50 transition-colors shadow-sm">
          <Download size={18} />
          Exportovat CSV
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4 flex-wrap">
        <div className="flex-1 min-w-[250px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Hledat štítky, témata (např. zdraví, sport)..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
          />
        </div>
        <div className="w-full sm:w-48 relative">
          <select 
            value={mediaTitleFilter}
            onChange={(e) => setMediaTitleFilter(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white appearance-none"
          >
            <option value="">Všechny tituly</option>
            {mediaTitles.map(title => (
              <option key={title.id} value={title.id}>{title.name}</option>
            ))}
          </select>
        </div>
        <div className="w-full sm:w-40 relative">
          <select 
            value={formatFilter}
            onChange={(e) => setFormatFilter(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white appearance-none"
          >
            <option value="">Všechny formáty</option>
            <option value="Print">Print</option>
            <option value="On-line">On-line</option>
            <option value="Podcast">Podcast</option>
            <option value="TV">TV</option>
            <option value="Rádio">Rádio</option>
            <option value="Sociální sítě">Sociální sítě</option>
          </select>
        </div>
        <div className="w-full sm:w-48 relative">
          <select 
            value={collabFilter}
            onChange={(e) => setCollabFilter(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white appearance-none"
          >
            <option value="">Všechny spolupráce</option>
            <option value="Redakční obsah">Redakční obsah</option>
            <option value="Placené PR">Placené PR</option>
            <option value="Klasická inzerce">Klasická inzerce</option>
          </select>
        </div>
        <div className="w-full sm:w-40 relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="number" 
            placeholder="Max. cena" 
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="w-full sm:w-36 relative" title="Uzávěrka od">
            <span className="absolute -top-2 left-3 bg-white px-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Uzávěrka od</span>
            <input 
              type="date" 
              value={deadlineFrom}
              onChange={(e) => setDeadlineFrom(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm text-slate-600 bg-white"
            />
          </div>
          <div className="w-full sm:w-36 relative" title="Uzávěrka do">
            <span className="absolute -top-2 left-3 bg-white px-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Uzávěrka do</span>
            <input 
              type="date" 
              value={deadlineTo}
              onChange={(e) => setDeadlineTo(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm text-slate-600 bg-white"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Titul & Téma</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Detaily</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Termíny</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Cena</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {topics.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-500 border-dashed">
                  Žádná témata neodpovídají vašemu hledání.
                </td>
              </tr>
            ) : (
              topics.map(topic => (
                <tr key={topic.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs font-medium text-indigo-600 mb-1">
                      <Building2 size={14} />
                      {topic.media_name}
                    </div>
                    <div className="font-bold text-slate-900 mb-1">{topic.title}</div>
                    <div className="text-sm text-slate-500 line-clamp-2 max-w-md">{topic.description}</div>
                    {topic.labels && topic.labels.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {topic.labels.map((label, idx) => (
                          <span key={idx} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                            {label}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                        <Layout size={12} /> {topic.format}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                        <Tag size={12} /> {topic.collaboration_type}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 space-y-1">
                      <div className="flex items-center gap-1.5"><Target size={12} className="text-blue-400" /> <span className="truncate max-w-[150px]" title={topic.target_audience}>Cílovka: {topic.target_audience}</span></div>
                      <div className="flex items-center gap-1.5"><Users size={12} className="text-orange-400" /> Dosah: {topic.reach.toLocaleString('cs-CZ')}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-slate-400" />
                      Vydání: <strong className="text-slate-900">{new Date(topic.publication_date).toLocaleDateString('cs-CZ')}</strong>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-red-400" />
                      Uzávěrka: <strong className="text-slate-900">{new Date(topic.deadline_date).toLocaleDateString('cs-CZ')}</strong>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-lg font-bold text-emerald-600 mb-1">{topic.price.toLocaleString('cs-CZ')} Kč</div>
                    <div className="flex items-center justify-end gap-1.5 text-xs text-slate-500">
                      <Mail size={12} className="text-slate-400" />
                      <a href={`mailto:${topic.contact}`} className="text-indigo-600 hover:underline">{topic.contact}</a>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
