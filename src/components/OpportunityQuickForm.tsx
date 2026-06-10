import { FormEvent, useEffect, useMemo, useState } from 'react';
import { OpportunityListItem, OpportunityOptions, User, MediaTitle } from '../types';

interface OpportunityQuickFormProps {
  user: User;
  mediaTitles: MediaTitle[];
  opportunityId?: number;
  onClose: () => void;
  onSaved: () => void;
}

const defaultForm = {
  title: '',
  description: '',
  type: 'media',
  parent_opportunity_id: '',
  organization_id: '',
  category: '',
  channel: '',
  media_title_id: '',
  audience: '',
  location: '',
  reach: 0,
  price: 0,
  collaboration_type: '',
  contact: '',
  website: '',
  publication_date: '',
  start_date: '',
  end_date: '',
  deadline_date: '',
  deadline_type: 'advertising',
  tagsInput: '',
};

interface OpportunityDetail extends OpportunityListItem {
  occurrences?: { publication_date?: string; start_date?: string; end_date?: string }[];
  deadlines?: { deadline_type?: string; deadline_date?: string }[];
}

export default function OpportunityQuickForm({ user, mediaTitles, opportunityId, onClose, onSaved }: OpportunityQuickFormProps) {
  const [options, setOptions] = useState<OpportunityOptions | null>(null);
  const [parentOpportunities, setParentOpportunities] = useState<OpportunityListItem[]>([]);
  const [formData, setFormData] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState('');
  const isEditing = Boolean(opportunityId);

  useEffect(() => {
    fetch('/api/opportunity-options')
      .then(res => res.json())
      .then(setOptions)
      .catch(() => setError('Nepodařilo se načíst slovníky.'));

    fetch(`/api/opportunities?owner_user_id=${user.id}`)
      .then(res => res.json())
      .then(setParentOpportunities)
      .catch(() => setParentOpportunities([]));
  }, [user.id]);

  useEffect(() => {
    if (!opportunityId) {
      setFormData(defaultForm);
      return;
    }

    setLoadingDetail(true);
    setError('');

    fetch(`/api/opportunities/${opportunityId}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load opportunity');
        return res.json();
      })
      .then((detail: OpportunityDetail) => {
        const occurrence = detail.occurrences?.[0];
        const deadline = detail.deadlines?.[0];

        setFormData({
          title: detail.title || '',
          description: detail.description || '',
          type: detail.type || 'media',
          parent_opportunity_id: detail.parent_opportunity_id ? String(detail.parent_opportunity_id) : '',
          organization_id: detail.organization_id ? String(detail.organization_id) : '',
          category: detail.category || '',
          channel: detail.format || '',
          media_title_id: detail.media_title_id ? String(detail.media_title_id) : '',
          audience: detail.audience || '',
          location: detail.location || '',
          reach: detail.reach || 0,
          price: detail.price || 0,
          collaboration_type: detail.collaboration_type || '',
          contact: detail.contact || '',
          website: detail.website || '',
          publication_date: toDateInput(occurrence?.publication_date || detail.publication_date),
          start_date: toDateInput(occurrence?.start_date || detail.start_date),
          end_date: toDateInput(occurrence?.end_date || detail.end_date),
          deadline_date: toDateInput(deadline?.deadline_date || detail.deadline_date),
          deadline_type: deadline?.deadline_type || detail.deadline_type || 'advertising',
          tagsInput: detail.tags?.join(', ') || '',
        });
      })
      .catch(() => setError('Nepodařilo se načíst příležitost k úpravě.'))
      .finally(() => setLoadingDetail(false));
  }, [opportunityId]);

  const selectedMediaTitle = useMemo(
    () => mediaTitles.find(title => title.id === Number(formData.media_title_id)),
    [formData.media_title_id, mediaTitles],
  );

  useEffect(() => {
    if (isEditing) return;
    if (!selectedMediaTitle) return;

    setFormData(prev => ({
      ...prev,
      contact: prev.contact || selectedMediaTitle.contact || '',
      price: prev.price || selectedMediaTitle.default_price || 0,
      reach: prev.reach || selectedMediaTitle.default_reach || 0,
      audience: prev.audience || selectedMediaTitle.default_target_audience || '',
      collaboration_type: prev.collaboration_type || selectedMediaTitle.default_collaboration_type || '',
    }));
  }, [selectedMediaTitle, isEditing]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const tags = formData.tagsInput
      .split(',')
      .map(tag => tag.trim())
      .filter(Boolean);

    const res = await fetch(isEditing ? `/api/opportunities/${opportunityId}` : '/api/opportunities', {
      method: isEditing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        owner_user_id: user.id,
        parent_opportunity_id: formData.parent_opportunity_id ? Number(formData.parent_opportunity_id) : undefined,
        organization_id: selectedMediaTitle?.organization_id || (formData.organization_id ? Number(formData.organization_id) : undefined),
        media_title_id: formData.media_title_id ? Number(formData.media_title_id) : undefined,
        title: formData.title,
        description: formData.description,
        type: formData.type,
        category: formData.category,
        channel: formData.channel,
        audience: formData.audience,
        location: formData.location,
        reach: Number(formData.reach) || 0,
        price: Number(formData.price) || 0,
        collaboration_type: formData.collaboration_type,
        contact: formData.contact,
        website: formData.website,
        publication_date: formData.publication_date,
        start_date: formData.start_date,
        end_date: formData.end_date,
        deadline_date: formData.deadline_date,
        deadline_type: formData.deadline_type,
        tags,
      }),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'Příležitost se nepodařilo uložit.');
      return;
    }

    onSaved();
    onClose();
  };

  const parentOptions = parentOpportunities.filter(opportunity => opportunity.id !== opportunityId);
  const typeOptions = options?.types.filter(item => item.is_active === 1 || item.is_active === true) || [];
  const channelOptions = options?.channels.filter(item => item.is_active === 1 || item.is_active === true) || [];
  const categoryOptions = options?.categories.filter(item => item.is_active === 1 || item.is_active === true) || [];

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">{isEditing ? 'Upravit příležitost' : 'Nová příležitost'}</h3>
          <p className="text-sm text-slate-500">Vytvořte media, event, outdoor, indoor nebo jiný typ z řízených slovníků.</p>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">Zrušit</button>
      </div>

      {loadingDetail && <div className="text-sm text-slate-500 mb-4">Načítám detail příležitosti...</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Typ</label>
            <select
              required
              value={formData.type}
              onChange={e => setFormData({ ...formData, type: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 bg-white"
            >
              {typeOptions.map(option => (
                <option key={option.id} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Kanál</label>
            <select
              required
              value={formData.channel}
              onChange={e => setFormData({ ...formData, channel: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 bg-white"
            >
              <option value="">Vyberte kanál...</option>
              {channelOptions.map(option => (
                <option key={option.id} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Kategorie</label>
            <select
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 bg-white"
            >
              <option value="">Bez kategorie</option>
              {categoryOptions.map(option => (
                <option key={option.id} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Nadřazená příležitost</label>
            <select
              value={formData.parent_opportunity_id}
              onChange={e => setFormData({ ...formData, parent_opportunity_id: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 bg-white"
            >
              <option value="">Samostatná příležitost</option>
              {parentOptions.map(opportunity => (
                <option key={opportunity.id} value={opportunity.id}>
                  {opportunity.title} ({opportunity.type}{opportunity.format ? ` / ${opportunity.format}` : ''})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Název</label>
            <input
              required
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mediální titul</label>
            <select
              value={formData.media_title_id}
              onChange={e => setFormData({ ...formData, media_title_id: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 bg-white"
            >
              <option value="">Bez vazby na titul</option>
              {mediaTitles.map(title => (
                <option key={title.id} value={title.id}>{title.name}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Popis</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Cílová skupina</label>
            <input
              value={formData.audience}
              onChange={e => setFormData({ ...formData, audience: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Lokalita</label>
            <input
              value={formData.location}
              onChange={e => setFormData({ ...formData, location: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
            />
          </div>
          <NumberField label="Dosah" value={formData.reach} onChange={reach => setFormData({ ...formData, reach })} />
          <NumberField label="Cena" value={formData.price} onChange={price => setFormData({ ...formData, price })} />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Typ spolupráce</label>
            <input
              value={formData.collaboration_type}
              onChange={e => setFormData({ ...formData, collaboration_type: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
              placeholder="např. sponsorship, partnerství, inzerce"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Kontakt</label>
            <input
              value={formData.contact}
              onChange={e => setFormData({ ...formData, contact: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Web</label>
            <input
              value={formData.website}
              onChange={e => setFormData({ ...formData, website: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Štítky</label>
            <input
              value={formData.tagsInput}
              onChange={e => setFormData({ ...formData, tagsInput: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
              placeholder="oddělené čárkou"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <DateField label="Datum vydání" value={formData.publication_date} onChange={publication_date => setFormData({ ...formData, publication_date })} />
          <DateField label="Začátek" value={formData.start_date} onChange={start_date => setFormData({ ...formData, start_date })} />
          <DateField label="Konec" value={formData.end_date} onChange={end_date => setFormData({ ...formData, end_date })} />
          <DateField label="Uzávěrka" value={formData.deadline_date} onChange={deadline_date => setFormData({ ...formData, deadline_date })} />
        </div>

        {error && <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl p-3">{error}</div>}

        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50">
            Zrušit
          </button>
          <button disabled={saving} type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-50">
            {saving ? 'Ukládám...' : (isEditing ? 'Uložit změny' : 'Uložit příležitost')}
          </button>
        </div>
      </form>
    </div>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <input
        type="number"
        min="0"
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full rounded-xl border border-slate-300 px-3 py-2"
      />
    </div>
  );
}

function DateField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <input
        type="date"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-300 px-3 py-2"
      />
    </div>
  );
}

function toDateInput(value?: string) {
  if (!value) return '';
  return value.slice(0, 10);
}
