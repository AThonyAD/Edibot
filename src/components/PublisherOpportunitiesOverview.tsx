import { useEffect, useMemo, useState } from 'react';
import { Calendar, ChevronRight, Edit2, ExternalLink, Filter, Tag, Trash2 } from 'lucide-react';
import { OpportunityListItem, OpportunityOptions, User } from '../types';

interface PublisherOpportunitiesOverviewProps {
  user: User;
  refreshKey: number;
  onEdit: (opportunity: OpportunityListItem) => void;
}

export default function PublisherOpportunitiesOverview({ user, refreshKey, onEdit }: PublisherOpportunitiesOverviewProps) {
  const [opportunities, setOpportunities] = useState<OpportunityListItem[]>([]);
  const [options, setOptions] = useState<OpportunityOptions | null>(null);
  const [typeFilter, setTypeFilter] = useState('');
  const [channelFilter, setChannelFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOptions();
  }, []);

  useEffect(() => {
    fetchOpportunities();
  }, [user.id, refreshKey]);

  const fetchOptions = async () => {
    const res = await fetch('/api/opportunity-options');
    if (res.ok) {
      setOptions(await res.json());
    }
  };

  const fetchOpportunities = async () => {
    setLoading(true);
    const params = new URLSearchParams({ owner_user_id: String(user.id) });
    const res = await fetch(`/api/opportunities?${params.toString()}`);
    if (res.ok) {
      setOpportunities(await res.json());
    }
    setLoading(false);
  };

  const filteredOpportunities = useMemo(() => {
    return opportunities.filter(opportunity => {
      if (typeFilter && opportunity.type !== typeFilter) return false;
      if (channelFilter && opportunity.format !== channelFilter) return false;
      if (categoryFilter && opportunity.category !== categoryFilter) return false;
      return true;
    });
  }, [opportunities, typeFilter, channelFilter, categoryFilter]);

  const topLevelOpportunities = filteredOpportunities.filter(opportunity => !opportunity.parent_opportunity_id);
  const childOpportunities = filteredOpportunities.filter(opportunity => opportunity.parent_opportunity_id);
  const childrenByParent = childOpportunities.reduce<Record<number, OpportunityListItem[]>>((acc, opportunity) => {
    const parentId = opportunity.parent_opportunity_id;
    if (!parentId) return acc;
    acc[parentId] = acc[parentId] || [];
    acc[parentId].push(opportunity);
    return acc;
  }, {});

  const orphans = childOpportunities.filter(opportunity => {
    const parentId = opportunity.parent_opportunity_id;
    return parentId && !topLevelOpportunities.some(parent => parent.id === parentId);
  });

  const handleDelete = async (opportunity: OpportunityListItem) => {
    if (!window.confirm(`Smazat příležitost "${opportunity.title}"?`)) return;
    await fetch(`/api/opportunities/${opportunity.id}`, { method: 'DELETE' });
    fetchOpportunities();
  };

  const visibleCount = topLevelOpportunities.length + childOpportunities.length;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-900">Moje příležitosti</h3>
          <p className="text-sm text-slate-500">{visibleCount} záznamů napříč medii, eventy, outdoor a dalšími kanály</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <SelectFilter label="Typ" value={typeFilter} onChange={setTypeFilter} options={options?.types || []} />
          <SelectFilter label="Kanál" value={channelFilter} onChange={setChannelFilter} options={options?.channels || []} />
          <SelectFilter label="Kategorie" value={categoryFilter} onChange={setCategoryFilter} options={options?.categories || []} />
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-500">Načítám příležitosti...</div>
      ) : visibleCount === 0 ? (
        <div className="p-8 text-center text-slate-500">Zatím tu nejsou žádné příležitosti pro vybrané filtry.</div>
      ) : (
        <div className="divide-y divide-slate-100">
          {topLevelOpportunities.map(opportunity => (
            <div key={opportunity.id}>
              <OpportunityRow
                opportunity={opportunity}
                childOpportunities={childrenByParent[opportunity.id] || []}
                onEdit={onEdit}
                onDelete={handleDelete}
              />
            </div>
          ))}
          {orphans.map(opportunity => (
            <div key={opportunity.id}>
              <OpportunityRow
                opportunity={opportunity}
                childOpportunities={[]}
                onEdit={onEdit}
                onDelete={handleDelete}
                isOrphan
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SelectFilter({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: { id: number; value: string; label: string; is_active: number | boolean }[] }) {
  return (
    <label className="relative min-w-40">
      <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-8 py-2 text-sm text-slate-700"
      >
        <option value="">{label}: vše</option>
        {options.filter(option => option.is_active === 1 || option.is_active === true).map(option => (
          <option key={option.id} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}

function OpportunityRow({ opportunity, childOpportunities, onEdit, onDelete, isOrphan = false }: { opportunity: OpportunityListItem; childOpportunities: OpportunityListItem[]; onEdit: (opportunity: OpportunityListItem) => void; onDelete: (opportunity: OpportunityListItem) => void; isOrphan?: boolean }) {
  return (
    <div className="p-5">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700 border border-indigo-100">
              {opportunity.type}
            </span>
            {opportunity.format && (
              <span className="inline-flex items-center rounded-md bg-sky-50 px-2 py-1 text-xs font-semibold text-sky-700 border border-sky-100">
                {opportunity.format}
              </span>
            )}
            {opportunity.category && (
              <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                <Tag size={12} /> {opportunity.category}
              </span>
            )}
            {isOrphan && (
              <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">
                Balíček mimo zobrazený parent
              </span>
            )}
          </div>
          <h4 className="font-bold text-slate-900">{opportunity.title}</h4>
          {opportunity.parent_opportunity_title && (
            <div className="text-xs text-slate-500 mt-1">Součást: {opportunity.parent_opportunity_title}</div>
          )}
          {opportunity.description && (
            <p className="text-sm text-slate-500 mt-1 line-clamp-2 max-w-3xl">{opportunity.description}</p>
          )}
          <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-500">
            <span>{opportunity.organization_name || 'Bez organizace'}</span>
            {opportunity.location && <span>{opportunity.location}</span>}
            {(opportunity.publication_date || opportunity.start_date) && (
              <span className="inline-flex items-center gap-1">
                <Calendar size={12} />
                {formatDate(opportunity.publication_date || opportunity.start_date)}
              </span>
            )}
            {opportunity.deadline_date && <span>Uzávěrka: {formatDate(opportunity.deadline_date)}</span>}
          </div>
        </div>
        <div className="flex items-center gap-3 lg:justify-end">
          <div className="text-right">
            <div className="text-lg font-bold text-emerald-600">{(opportunity.price || 0).toLocaleString('cs-CZ')} Kč</div>
            <div className="text-xs text-slate-500">Dosah: {(opportunity.reach || 0).toLocaleString('cs-CZ')}</div>
          </div>
          {opportunity.website && (
            <a href={opportunity.website} target="_blank" rel="noreferrer" className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg">
              <ExternalLink size={18} />
            </a>
          )}
          <button onClick={() => onEdit(opportunity)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg" title="Upravit příležitost">
            <Edit2 size={18} />
          </button>
          <button onClick={() => onDelete(opportunity)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {childOpportunities.length > 0 && (
        <div className="mt-4 ml-0 lg:ml-6 border-l border-slate-200 pl-4 space-y-3">
          {childOpportunities.map(child => (
            <div key={child.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 border border-slate-100 rounded-xl p-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <ChevronRight size={16} className="text-slate-400" />
                  {child.title}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {[child.type, child.format, child.category].filter(Boolean).join(' / ')}
                </div>
              </div>
              <div className="flex items-center gap-3 sm:justify-end">
                <div className="text-sm font-bold text-emerald-600">{(child.price || 0).toLocaleString('cs-CZ')} Kč</div>
                <button onClick={() => onEdit(child)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg" title="Upravit příležitost">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => onDelete(child)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function formatDate(value?: string) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('cs-CZ');
}
