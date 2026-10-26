import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Loader2,
  Mail,
  Plus,
  Send,
  Trash2,
  Users,
  X,
  XCircle,
  type LucideIcon,
} from 'lucide-react';
import {
  REFERRAL_STATUSES,
  type Application,
  type ApplicationStatus,
  type Referral,
  type ReferralStatus,
  type Scholarship,
} from '@/lib/supabase';
import { useScholarshipManagement } from '@/hooks/useScholarshipManagement';
import { useReferrals } from '@/hooks/useReferrals';
import { formatDate } from '@/utils/dates';

const STATUS_CONFIG: Record<
  ApplicationStatus,
  { color: string; icon: LucideIcon; label: string }
> = {
  Submitted: { color: 'bg-base-200 text-brand-600', icon: Clock, label: 'Submitted' },
  'In Review': { color: 'bg-teal-50 text-teal-700', icon: Clock, label: 'In Review' },
  Approved: { color: 'bg-teal-50 text-teal-700', icon: CheckCircle2, label: 'Approved' },
  Rejected: { color: 'bg-gold-50 text-gold-700', icon: XCircle, label: 'Rejected' },
  Withdrawn: { color: 'bg-base-200 text-brand-400', icon: XCircle, label: 'Withdrawn' },
};

const REFERRAL_CONFIG: Record<ReferralStatus, { color: string; label: string }> = {
  Pending: { color: 'bg-base-200 text-brand-600', label: 'Pending' },
  Contacted: { color: 'bg-teal-50 text-teal-700', label: 'Contacted' },
  Accepted: { color: 'bg-teal-50 text-teal-700', label: 'Accepted' },
  Declined: { color: 'bg-gold-50 text-gold-700', label: 'Declined' },
};

const STATUS_OPTIONS: ApplicationStatus[] = [
  'Submitted',
  'In Review',
  'Approved',
  'Rejected',
  'Withdrawn',
];

type AdminApplication = Application & {
  scholarship: Scholarship;
  applicant: { full_name: string; school: string; birthdate: string };
};

export type { AdminApplication };

export function RequestDetailPanel({
  application,
  onReview,
}: {
  application: AdminApplication;
  onReview: (
    id: string,
    status: ApplicationStatus,
    reviewNotes: string,
  ) => Promise<{ error: string | null }>;
}) {
  const { scholarships } = useScholarshipManagement();
  const { referrals, loading: referralsLoading, addReferral, updateReferral, removeReferral } =
    useReferrals(application.id);

  const [status, setStatus] = useState<ApplicationStatus>(application.status);
  const [reviewNotes, setReviewNotes] = useState(application.review_notes ?? '');
  const [saving, setSaving] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSaved, setReviewSaved] = useState(false);

  // Local referral creation state
  const [showReferForm, setShowReferForm] = useState(false);
  const [selectedScholarshipId, setSelectedScholarshipId] = useState('');
  const [followUp, setFollowUp] = useState('');
  const [referring, setReferring] = useState(false);
  const [referralError, setReferralError] = useState<string | null>(null);

  // Programs already referred (to avoid duplicates in the picker)
  const referredIds = useMemo(
    () => new Set(referrals.map((r) => r.scholarship_id)),
    [referrals],
  );
  const availablePrograms = useMemo(
    () => scholarships.filter((s) => !referredIds.has(s.id)),
    [scholarships, referredIds],
  );

  useEffect(() => {
    setStatus(application.status);
    setReviewNotes(application.review_notes ?? '');
    setReviewSaved(false);
  }, [application.id, application.status, application.review_notes]);

  const reviewDirty =
    status !== application.status || reviewNotes !== (application.review_notes ?? '');

  async function handleSaveReview() {
    setReviewError(null);
    setSaving(true);
    const res = await onReview(application.id, status, reviewNotes);
    setSaving(false);
    if (res.error) {
      setReviewError(res.error);
    } else {
      setReviewSaved(true);
      setTimeout(() => setReviewSaved(false), 1800);
    }
  }

  async function handleCreateReferral(e: React.FormEvent) {
    e.preventDefault();
    setReferralError(null);
    if (!selectedScholarshipId) {
      setReferralError('Pick an assistance program.');
      return;
    }
    setReferring(true);
    const res = await addReferral(selectedScholarshipId, followUp);
    setReferring(false);
    if (res.error) {
      setReferralError(res.error);
    } else {
      setSelectedScholarshipId('');
      setFollowUp('');
      setShowReferForm(false);
    }
  }

  return (
    <div className="space-y-5">
          {/* Applicant + request summary */}
          <section className="rounded-2xl bg-base-100 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                <Users className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-bold text-brand">
                  {application.applicant?.full_name ?? 'Unknown applicant'}
                </h4>
                <p className="text-xs text-brand-500">
                  {application.applicant?.school ?? 'No school listed'}
                </p>
                {application.applicant?.birthdate && (
                  <p className="mt-0.5 text-[10px] text-brand-400">
                    Born {formatDate(application.applicant.birthdate)}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-3 rounded-xl bg-white p-3">
              <p className="text-xs font-bold text-brand">
                {application.scholarship?.name ?? 'Program'}
              </p>
              <p className="mt-0.5 text-[11px] text-brand-500">
                {application.scholarship?.provider}
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-semibold text-teal-700">
                  {application.scholarship?.amount}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-base-200 px-2 py-0.5 text-[10px] font-semibold text-brand-600">
                  <Calendar className="h-3 w-3" />
                  Deadline {formatDate(application.scholarship?.deadline ?? '')}
                </span>
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-brand-500">
                {application.scholarship?.description}
              </p>
              <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-wide text-brand-400">
                Eligibility
              </p>
              <p className="text-[11px] leading-relaxed text-brand-500">
                {application.scholarship?.eligibility}
              </p>
            </div>

            {application.scholarship?.contact && (
              <div className="mt-2 flex items-center gap-1.5 text-[11px] text-brand-500">
                <Mail className="h-3.5 w-3.5" />
                {application.scholarship.contact}
              </div>
            )}

            {application.scholarship?.apply_url && (
              <a
                href={application.scholarship.apply_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-brand-100 py-2 text-[11px] font-semibold text-brand transition-colors hover:bg-brand-50"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Official portal
              </a>
            )}

            {application.notes && (
              <div className="mt-3 border-t border-brand-100 pt-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-400">
                  Student note
                </p>
                <p className="mt-0.5 text-[11px] italic text-brand-600">
                  &ldquo;{application.notes}&rdquo;
                </p>
              </div>
            )}
          </section>

          {/* Review notes + status */}
          <section>
            <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-brand-400">
              Coordinator Review
            </h4>

          <div className="mb-3">
            <label className="label-field">Status</label>
            <div className="flex flex-wrap gap-1.5">
              {STATUS_OPTIONS.map((s) => {
                const sc = STATUS_CONFIG[s];
                const SI = sc.icon;
                const active = status === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all ${
                      active
                        ? sc.color + ' ring-1 ring-brand-200'
                        : 'bg-white text-brand-500 border border-brand-100 hover:border-brand-300'
                    }`}
                  >
                    <SI className="h-3 w-3" />
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="label-field">Review notes</label>
            <textarea
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              rows={4}
              placeholder="Eligibility assessment, follow-up reminders, referral rationale…"
              className="input-field resize-none"
            />
          </div>

          {application.reviewed_at && (
            <p className="mt-1.5 text-[10px] text-brand-400">
              Last reviewed {formatDate(application.reviewed_at)}
            </p>
          )}

          {reviewError && (
            <div className="mt-2 flex items-start gap-2 rounded-lg border border-gold-200 bg-gold-50 p-2.5 text-xs text-gold-700">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{reviewError}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleSaveReview}
            disabled={saving || !reviewDirty}
            className="btn-primary mt-3 w-full py-2.5 text-sm disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : reviewSaved ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Saved
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Save review
              </>
            )}
          </button>
          </section>

          {/* Referrals */}
          <section>
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wide text-brand-400">
                Referrals
              </h4>
              {!showReferForm && (
                <button
                  type="button"
                  onClick={() => setShowReferForm(true)}
                  className="flex items-center gap-1 rounded-lg bg-teal-700 px-2.5 py-1 text-[11px] font-semibold text-white transition-colors hover:bg-teal-800"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Refer
                </button>
              )}
            </div>

            {showReferForm && (
              <form
                onSubmit={handleCreateReferral}
                className="mb-3 space-y-2.5 rounded-2xl border border-teal-100 bg-teal-50/40 p-3"
              >
                <div>
                  <label className="label-field">Assistance program</label>
                  {availablePrograms.length === 0 ? (
                    <p className="text-[11px] text-brand-400">
                      All programs have been referred.
                    </p>
                  ) : (
                    <select
                      value={selectedScholarshipId}
                      onChange={(e) => setSelectedScholarshipId(e.target.value)}
                      className="input-field"
                    >
                      <option value="">Select a program…</option>
                      {availablePrograms.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} — {s.provider}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <div>
                  <label className="label-field">Follow-up notes</label>
                  <textarea
                    value={followUp}
                    onChange={(e) => setFollowUp(e.target.value)}
                    rows={2}
                    placeholder="Reason for referral, contact made, next steps…"
                    className="input-field resize-none"
                  />
                </div>
                {referralError && (
                  <div className="flex items-start gap-2 rounded-lg border border-gold-200 bg-gold-50 p-2 text-[11px] text-gold-700">
                    <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                    <span>{referralError}</span>
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={referring || !selectedScholarshipId}
                    className="btn-primary flex-1 py-2 text-xs disabled:opacity-50"
                  >
                    {referring ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Create referral'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowReferForm(false);
                      setReferralError(null);
                      setSelectedScholarshipId('');
                      setFollowUp('');
                    }}
                    className="rounded-xl border border-brand-100 px-3 py-2 text-xs font-semibold text-brand-500 hover:bg-base-100"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {referralsLoading ? (
              <div className="space-y-2">
                {[0, 1].map((i) => (
                  <div key={i} className="h-20 animate-pulse rounded-2xl bg-base-200" />
                ))}
              </div>
            ) : referrals.length === 0 ? (
              <div className="rounded-2xl bg-base-100 p-4 text-center text-xs text-brand-400">
                No referrals yet. Refer this request to a matching program.
              </div>
            ) : (
              <div className="space-y-2.5">
                {referrals.map((r) => (
                  <ReferralCard
                    key={r.id}
                    referral={r}
                    onStatusChange={(s) => updateReferral(r.id, { status: s })}
                    onNotesChange={(notes) =>
                      updateReferral(r.id, { follow_up_notes: notes })
                    }
                    onDelete={() => removeReferral(r.id)}
                  />
                ))}
              </div>
            )}
          </section>
    </div>
  );
}

export function RequestDetailModal({
  application,
  onClose,
  onReview,
}: {
  application: AdminApplication;
  onClose: () => void;
  onReview: (
    id: string,
    status: ApplicationStatus,
    reviewNotes: string,
  ) => Promise<{ error: string | null }>;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-brand-900/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-md overflow-hidden rounded-t-3xl bg-white shadow-2xl animate-slide-up sm:rounded-3xl max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-brand-100 bg-white px-5 py-4">
          <div className="min-w-0">
            <h3 className="text-base font-bold text-brand">Request Review</h3>
            <p className="truncate text-[11px] text-brand-400">
              {application.applicant?.full_name ?? 'Unknown applicant'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 rounded-lg p-1.5 text-brand-400 hover:bg-base-100 hover:text-brand"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5">
          <RequestDetailPanel application={application} onReview={onReview} />
        </div>
      </div>
    </div>
  );
}

function ReferralCard({
  referral,
  onStatusChange,
  onNotesChange,
  onDelete,
}: {
  referral: Referral;
  onStatusChange: (s: ReferralStatus) => void;
  onNotesChange: (notes: string) => void;
  onDelete: () => void;
}) {
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState(referral.follow_up_notes ?? '');

  useEffect(() => {
    setNotesDraft(referral.follow_up_notes ?? '');
  }, [referral.follow_up_notes]);

  function saveNotes() {
    onNotesChange(notesDraft);
    setEditingNotes(false);
  }

  return (
    <div className="rounded-2xl border border-brand-50 bg-white p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-bold text-brand">
            {referral.scholarship?.name ?? 'Program'}
          </p>
          <p className="text-[10px] text-brand-400">
            {referral.scholarship?.provider}
          </p>
        </div>
        <button
          onClick={onDelete}
          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-base-100 text-gold-600 transition-colors hover:bg-gold-50"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {REFERRAL_STATUSES.map((s) => {
          const cfg = REFERRAL_CONFIG[s];
          const active = referral.status === s;
          return (
            <button
              key={s}
              type="button"
              onClick={() => onStatusChange(s)}
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold transition-all ${
                active
                  ? cfg.color + ' ring-1 ring-brand-200'
                  : 'bg-white text-brand-500 border border-brand-100 hover:border-brand-300'
              }`}
            >
              {cfg.label}
            </button>
          );
        })}
      </div>

      <div className="mt-2">
        {editingNotes ? (
          <div className="space-y-1.5">
            <textarea
              value={notesDraft}
              onChange={(e) => setNotesDraft(e.target.value)}
              rows={2}
              className="input-field resize-none text-[11px]"
              placeholder="Follow-up notes…"
            />
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={saveNotes}
                className="rounded-lg bg-brand px-2.5 py-1 text-[10px] font-semibold text-white"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => {
                  setNotesDraft(referral.follow_up_notes ?? '');
                  setEditingNotes(false);
                }}
                className="rounded-lg border border-brand-100 px-2.5 py-1 text-[10px] font-semibold text-brand-500"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setEditingNotes(true)}
            className="w-full rounded-lg bg-base-100 px-2.5 py-1.5 text-left text-[11px] text-brand-500 hover:bg-brand-50"
          >
            {referral.follow_up_notes ? (
              <span>&ldquo;{referral.follow_up_notes}&rdquo;</span>
            ) : (
              <span className="text-brand-400">Add follow-up notes…</span>
            )}
          </button>
        )}
      </div>

      <p className="mt-1.5 text-[9px] text-brand-400">
        Referred {formatDate(referral.created_at)}
      </p>
    </div>
  );
}
