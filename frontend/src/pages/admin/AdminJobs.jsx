import { useEffect, useState } from 'react';
import api, { extractErrorMessage } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';

export default function AdminJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState(null);

  function load() {
    setLoading(true);
    setError('');
    api.get('/jobs')
      .then(({ data }) => setJobs(Array.isArray(data) ? data : data.content || []))
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleClose(jobId) {
    setSavingId(jobId);
    setError('');
    try {
      const { data } = await api.patch(`/jobs/${jobId}/close`);
      setJobs((prev) => prev.map((j) => (j.id === jobId ? data : j)));
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSavingId(null);
    }
  }

  async function handleDelete(jobId) {
    if (!window.confirm('Delete this job posting permanently?')) return;
    setSavingId(jobId);
    setError('');
    try {
      await api.delete(`/jobs/${jobId}`);
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="font-display text-2xl font-semibold text-slate-900">Manage jobs</h1>
        <p className="mt-1 text-sm text-slate-500">Monitor live postings, close inactive listings, and review questionable content.</p>

        {error && <p className="mt-4 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>}

        {loading ? (
          <LoadingSpinner label="Loading jobs…" />
        ) : jobs.length === 0 ? (
          <div className="mt-8">
            <EmptyState title="No jobs available" message="Post jobs from the employer flow or seed the backend data to populate this list." />
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {jobs.map((job) => (
              <div key={job.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-900">{job.title}</h3>
                    <StatusBadge status={job.status || 'OPEN'} />
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{job.companyName || 'Company not listed'}</p>
                  <p className="mt-1 text-xs text-slate-400">{job.applicationCount ?? 0} applicant(s) · {job.location}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                    {job.categoryName || 'General'}
                  </span>
                  <button
                    type="button"
                    disabled={savingId === job.id || job.status === 'CLOSED'}
                    onClick={() => handleClose(job.id)}
                    className="rounded-full border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-white disabled:opacity-40"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    disabled={savingId === job.id}
                    onClick={() => handleDelete(job.id)}
                    className="rounded-full border border-rose-200 px-3 py-1.5 text-sm font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-40"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
