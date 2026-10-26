import { useState } from 'react';
import { AlertCircle, Calendar, CheckCircle2, ExternalLink, Loader2, Send, X } from 'lucide-react';
import { type Scholarship } from '@/lib/supabase';
import { useApplications } from '@/hooks/useApplications';
import { formatDate, deadlineLabel, daysUntil } from '@/utils/dates';

export function ApplyModal({
  scholarship,
  onClose,
}: {
  scholarship: Scholarship;
  onClose: () => void;
}) {
  const { addApplication } = useApplications();
  const [submittedDate, setSubmittedDate] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await addApplication(
      scholarship.id,
      submittedDate || null,
      notes.trim(),
    );
    setLoading(false);
    if (error) {
      setError(error);
    } else {
      setSuccess(true);
    }
  }

  const deadlineDays = daysUntil(scholarship.deadline);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-brand-900/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-md overflow-hidden rounded-t-3xl bg-white shadow-2xl animate-slide-up sm:rounded-3xl max-h-[90vh] overflow-y-auto">
        {success ? (
          <div className="p-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-teal-50">
              <CheckCircle2 className="h-8 w-8 text-teal-700" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-brand">Application tracked!</h3>
            <p className="mt-1 text-sm text-brand-500">
              You can update its status and dates anytime in the Applications tab.
            </p>
            <button onClick={onClose} className="btn-primary mt-6 w-full">
              Done
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-brand-100 bg-white px-5 py-4">
              <h3 className="text-base font-bold text-brand">Track this application</h3>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-brand-400 hover:bg-base-100 hover:text-brand"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-5">
              {/* Program summary */}
              <div className="rounded-xl bg-base-100 p-4">
                <p className="text-sm font-bold text-brand">{scholarship.name}</p>
                <p className="text-xs text-brand-500">{scholarship.provider}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-full bg-gold-50 px-2 py-0.5 text-[10px] font-semibold text-gold-700">
                    <Calendar className="h-3 w-3" />
                    Deadline {formatDate(scholarship.deadline)} ({deadlineLabel(scholarship.deadline)})
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-semibold text-teal-700">
                    {scholarship.amount}
                  </span>
                </div>
                {deadlineDays >= 0 && deadlineDays <= 7 && (
                  <p className="mt-2 text-xs font-medium text-gold-700">
                    Approaching deadline — apply soon.
                  </p>
                )}
              </div>

              <div>
                <label className="label-field" htmlFor="submittedDate">
                  Date you submitted (or will submit)
                </label>
                <input
                  id="submittedDate"
                  type="date"
                  value={submittedDate}
                  onChange={(e) => setSubmittedDate(e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label className="label-field" htmlFor="notes">
                  Notes <span className="font-normal text-brand-300">(optional)</span>
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Reference number, documents attached, follow-up reminders…"
                  className="input-field resize-none"
                />
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-lg border border-gold-200 bg-gold-50 p-3 text-sm text-gold-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {scholarship.apply_url && (
                <a
                  href={scholarship.apply_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-brand py-2.5 text-sm font-semibold text-brand transition-colors hover:bg-brand-50"
                >
                  <ExternalLink className="h-4 w-4" />
                  Go to official portal
                </a>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Add to my applications
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
