import { useState } from 'react';
import {
  AlertCircle,
  Calendar,
  Edit3,
  Loader2,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { useScholarshipManagement } from '@/hooks/useScholarshipManagement';
import { SCHOLARSHIP_CATEGORIES, type Scholarship } from '@/lib/supabase';
import { formatDate } from '@/utils/dates';

type FormState = {
  name: string;
  category: string;
  provider: string;
  description: string;
  eligibility: string;
  amount: string;
  deadline: string;
  slots_available: number;
  slots_total: number;
  contact: string;
  apply_url: string;
};

const EMPTY_FORM: FormState = {
  name: '',
  category: SCHOLARSHIP_CATEGORIES[0],
  provider: '',
  description: '',
  eligibility: '',
  amount: '',
  deadline: '',
  slots_available: 0,
  slots_total: 0,
  contact: '',
  apply_url: '',
};

export function AdminScholarships() {
  const { scholarships, loading, createScholarship, updateScholarship, deleteScholarship } =
    useScholarshipManagement();
  const [editing, setEditing] = useState<Scholarship | null>(null);
  const [showForm, setShowForm] = useState(false);

  function openCreate() {
    setEditing(null);
    setShowForm(true);
  }

  function openEdit(s: Scholarship) {
    setEditing(s);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    const { error } = await deleteScholarship(id);
    if (error) alert(error);
  }

  return (
    <div className="px-4 pb-6 pt-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-brand">Programs</h2>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 rounded-xl bg-teal-700 px-3 py-2 text-xs font-semibold text-white transition-all hover:bg-teal-800"
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-base-200" />
          ))}
        </div>
      ) : scholarships.length === 0 ? (
        <div className="rounded-2xl bg-base-100 p-8 text-center text-sm text-brand-400">
          No programs yet. Tap "Add" to create one.
        </div>
      ) : (
        <div className="space-y-3">
          {scholarships.map((s, i) => (
            <div
              key={s.id}
              className="card animate-slide-up p-4"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold leading-tight text-brand">{s.name}</h3>
                  <p className="mt-0.5 text-[11px] text-brand-500">{s.provider}</p>
                </div>
                <div className="flex flex-shrink-0 gap-1">
                  <button
                    onClick={() => openEdit(s)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-base-100 text-brand-500 transition-colors hover:bg-brand-50 hover:text-brand"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(s.id, s.name)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-base-100 text-gold-600 transition-colors hover:bg-gold-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand">
                  {s.category}
                </span>
                <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-semibold text-teal-700">
                  {s.amount}
                </span>
                <span className="flex items-center gap-1 rounded-full bg-base-200 px-2 py-0.5 text-[10px] font-semibold text-brand-600">
                  <Calendar className="h-3 w-3" />
                  {formatDate(s.deadline)}
                </span>
                <span className="rounded-full bg-base-200 px-2 py-0.5 text-[10px] font-semibold text-brand-600">
                  {s.slots_available}/{s.slots_total} slots
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <ScholarshipForm
          existing={editing}
          onClose={closeForm}
          onCreate={createScholarship}
          onUpdate={updateScholarship}
        />
      )}
    </div>
  );
}

function ScholarshipForm({
  existing,
  onClose,
  onCreate,
  onUpdate,
}: {
  existing: Scholarship | null;
  onClose: () => void;
  onCreate: (input: Omit<Scholarship, 'id' | 'created_at'>) => Promise<{ error: string | null }>;
  onUpdate: (
    id: string,
    input: Partial<Omit<Scholarship, 'id' | 'created_at'>>,
  ) => Promise<{ error: string | null }>;
}) {
  const [form, setForm] = useState<FormState>(
    existing
      ? {
          name: existing.name,
          category: existing.category,
          provider: existing.provider,
          description: existing.description,
          eligibility: existing.eligibility,
          amount: existing.amount,
          deadline: existing.deadline,
          slots_available: existing.slots_available,
          slots_total: existing.slots_total,
          contact: existing.contact,
          apply_url: existing.apply_url ?? '',
        }
      : EMPTY_FORM,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const payload = {
      ...form,
      apply_url: form.apply_url.trim() || null,
    };
    const res = existing
      ? await onUpdate(existing.id, payload)
      : await onCreate(payload);
    setLoading(false);
    if (res.error) {
      setError(res.error);
    } else {
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 animate-fade-in" onClick={onClose}>
      <div
        className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-5 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-bold text-brand">
            {existing ? 'Edit Program' : 'New Program'}
          </h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-base-100 text-brand-400 hover:text-brand"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-3 flex items-start gap-2 rounded-lg border border-gold-200 bg-gold-50 p-2.5 text-sm text-gold-700">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <Field label="Program name">
            <input
              type="text"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. CHED Merit Scholarship"
              className="input-field"
              required
            />
          </Field>

          <Field label="Category">
            <select
              value={form.category}
              onChange={(e) => set('category', e.target.value)}
              className="input-field"
            >
              {SCHOLARSHIP_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Provider / Organization">
            <input
              type="text"
              value={form.provider}
              onChange={(e) => set('provider', e.target.value)}
              placeholder="e.g. Commission on Higher Education"
              className="input-field"
              required
            />
          </Field>

          <Field label="Amount">
            <input
              type="text"
              value={form.amount}
              onChange={(e) => set('amount', e.target.value)}
              placeholder="e.g. Up to ₱60,000/year"
              className="input-field"
              required
            />
          </Field>

          <Field label="Deadline">
            <input
              type="date"
              value={form.deadline}
              onChange={(e) => set('deadline', e.target.value)}
              className="input-field"
              required
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Slots available">
              <input
                type="number"
                min={0}
                value={form.slots_available}
                onChange={(e) => set('slots_available', Number(e.target.value))}
                className="input-field"
                required
              />
            </Field>
            <Field label="Total slots">
              <input
                type="number"
                min={0}
                value={form.slots_total}
                onChange={(e) => set('slots_total', Number(e.target.value))}
                className="input-field"
                required
              />
            </Field>
          </div>

          <Field label="Contact email">
            <input
              type="email"
              value={form.contact}
              onChange={(e) => set('contact', e.target.value)}
              placeholder="info@agency.gov.ph"
              className="input-field"
              required
            />
          </Field>

          <Field label="Application URL (optional)">
            <input
              type="url"
              value={form.apply_url}
              onChange={(e) => set('apply_url', e.target.value)}
              placeholder="https://..."
              className="input-field"
            />
          </Field>

          <Field label="Description">
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Brief description of the program…"
              className="input-field min-h-[80px] resize-none"
              required
            />
          </Field>

          <Field label="Eligibility">
            <textarea
              value={form.eligibility}
              onChange={(e) => set('eligibility', e.target.value)}
              placeholder="Who can apply…"
              className="input-field min-h-[60px] resize-none"
              required
            />
          </Field>

          <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 text-sm">
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : existing ? (
              'Save changes'
            ) : (
              'Create program'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label-field">{label}</label>
      {children}
    </div>
  );
}
