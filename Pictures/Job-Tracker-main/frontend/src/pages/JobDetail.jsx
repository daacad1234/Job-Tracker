import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api, { extractErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';

const TYPE_LABEL = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  CONTRACT: 'Contract',
  INTERNSHIP: 'Internship',
  REMOTE: 'Remote',
};

export default function JobDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applyForm, setApplyForm] = useState({ resumeUrl: '', coverLetter: '' });
  const [applyOpen, setApplyOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [, setSavedJobRecordId] = useState(null);

  useEffect(() => {
    api.get(`/jobs/${id}`).then((res) => setJob(res.data)).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (user?.role !== 'APPLICANT') return;
    api.get('/saved-jobs').then(({ data }) => {
      const match = data.find((s) => String(s.job.id) === String(id));
      if (match) {
        setSaved(true);
        setSavedJobRecordId(match.id);
      }
    }).catch(() => {});
  }, [id, user]);

  async function toggleSave() {
    try {
      if (saved) {
        await api.delete(`/saved-jobs/${id}`);
        setSaved(false);
        setSavedJobRecordId(null);
      } else {
        const { data } = await api.post(`/saved-jobs/${id}`);
        setSaved(true);
        setSavedJobRecordId(data.id);
      }
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  async function handleApply(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);
    try {
      await api.post('/applications', { jobId: Number(id), ...applyForm });
      setMessage('Application submitted! Track its status under "My Applications".');
      setApplyOpen(false);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingSpinner label="Loading job…" />;
  if (!job) return <p className="mx-auto max-w-2xl px-4 py-16 text-center">Job not found.</p>;

  const salary = job.salaryMin || job.salaryMax
    ? `$${Number(job.salaryMin || 0).toLocaleString()} – $${Number(job.salaryMax || 0).toLocaleString()}`
    : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link to="/" className="text-sm text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]">← Back to listings</Link>

      <div className="pin-card mt-4 rounded-lg border border-[var(--color-ink)]/10 bg-[var(--color-card)] p-8 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-[var(--color-ink)]">{job.title}</h1>
            <p className="mt-1 text-[var(--color-ink-soft)]">{job.companyName}</p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={job.status} />
            {user?.role === 'APPLICANT' && (
              <button
                onClick={toggleSave}
                title={saved ? 'Remove bookmark' : 'Save this job'}
                className={`rounded-md border px-2.5 py-1.5 text-sm ${
                  saved
                    ? 'border-accent bg-accent-soft text-ink'
                    : 'border-[var(--color-ink)]/15 text-[var(--color-ink-soft)] hover:bg-[var(--color-ink)]/5'
                }`}
              >
                {saved ? '★ Saved' : '☆ Save'}
              </button>
            )}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2 font-mono text-xs text-[var(--color-ink-soft)]">
          <span className="rounded border border-[var(--color-ink)]/10 bg-[var(--color-paper)] px-2 py-1">📍 {job.location}</span>
          <span className="rounded border border-[var(--color-ink)]/10 bg-[var(--color-paper)] px-2 py-1">{TYPE_LABEL[job.employmentType]}</span>
          <span className="rounded border border-[var(--color-ink)]/10 bg-[var(--color-paper)] px-2 py-1">{job.categoryName}</span>
          {salary && <span className="rounded border border-[var(--color-accent)]/40 bg-[var(--color-accent-soft)] px-2 py-1 text-[var(--color-ink)]">{salary}</span>}
          {job.deadline && <span className="rounded border border-[var(--color-ink)]/10 bg-[var(--color-paper)] px-2 py-1">Apply by {job.deadline}</span>}
        </div>

        <div className="mt-6 space-y-4 text-[var(--color-ink)]">
          <div>
            <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-[var(--color-ink-soft)]">Description</h2>
            <p className="mt-1 whitespace-pre-line leading-relaxed">{job.description}</p>
          </div>
          {job.requirements && (
            <div>
              <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-[var(--color-ink-soft)]">Requirements</h2>
              <p className="mt-1 whitespace-pre-line leading-relaxed">{job.requirements}</p>
            </div>
          )}
        </div>

        {message && (
          <p className="mt-6 rounded-md bg-[var(--color-success)]/10 px-3 py-2 text-sm text-[var(--color-success)]">{message}</p>
        )}

        {job.status === 'CLOSED' && (
          <p className="mt-6 rounded-md bg-[var(--color-ink)]/5 px-3 py-2 text-sm text-[var(--color-ink-soft)]">
            This posting is closed and no longer accepting applications.
          </p>
        )}

        {job.status === 'OPEN' && !message && (
          <div className="mt-6">
            {!user && (
              <Link
                to="/login"
                className="inline-block rounded-md bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-primary-light)]"
              >
                Log in to apply
              </Link>
            )}

            {user?.role === 'APPLICANT' && !applyOpen && (
              <button
                onClick={() => setApplyOpen(true)}
                className="rounded-md bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-primary-light)]"
              >
                Apply now
              </button>
            )}

            {user?.role === 'APPLICANT' && applyOpen && (
              <form onSubmit={handleApply} className="mt-2 space-y-3 rounded-md border border-[var(--color-ink)]/10 bg-[var(--color-paper)] p-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-[var(--color-ink)]">Resume URL</label>
                  <input
                    required
                    value={applyForm.resumeUrl}
                    onChange={(e) => setApplyForm({ ...applyForm, resumeUrl: e.target.value })}
                    placeholder="https://…/your-resume.pdf"
                    className="w-full rounded-md border border-[var(--color-ink)]/15 px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-[var(--color-ink)]">Cover letter (optional)</label>
                  <textarea
                    rows={4}
                    value={applyForm.coverLetter}
                    onChange={(e) => setApplyForm({ ...applyForm, coverLetter: e.target.value })}
                    className="w-full rounded-md border border-[var(--color-ink)]/15 px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
                  />
                </div>
                {error && <p className="rounded-md bg-[var(--color-danger)]/10 px-3 py-2 text-sm text-[var(--color-danger)]">{error}</p>}
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-md bg-[var(--color-primary)] px-5 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-light)] disabled:opacity-60"
                  >
                    {submitting ? 'Submitting…' : 'Submit application'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setApplyOpen(false)}
                    className="rounded-md border border-[var(--color-ink)]/15 px-5 py-2 text-sm text-[var(--color-ink)] hover:bg-[var(--color-ink)]/5"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {(user?.role === 'EMPLOYER' || user?.role === 'ADMIN') && (
              <p className="text-sm text-[var(--color-ink-soft)]">Employer accounts can't apply to jobs.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
