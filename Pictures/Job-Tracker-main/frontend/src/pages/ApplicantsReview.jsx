import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api, { extractErrorMessage } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';

const NEXT_STATUSES = ['PENDING', 'REVIEWED', 'SHORTLISTED', 'ACCEPTED', 'REJECTED'];

export default function ApplicantsReview() {
  const { jobId } = useParams();
  const [applications, setApplications] = useState([]);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  function load() {
    setLoading(true);
    Promise.all([
      api.get(`/applications/job/${jobId}`),
      api.get(`/jobs/${jobId}`),
    ])
      .then(([appsRes, jobRes]) => {
        setApplications(appsRes.data);
        setJob(jobRes.data);
      })
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  async function handleStatusChange(applicationId, status) {
    setError('');
    try {
      await api.put(`/applications/${applicationId}/status`, { status });
      setApplications((prev) =>
        prev.map((a) => (a.id === applicationId ? { ...a, status } : a))
      );
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  if (loading) return <LoadingSpinner label="Loading applicants…" />;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Link to="/employer" className="text-sm text-ink-soft hover:text-ink">← Back to dashboard</Link>

      <h1 className="mt-2 font-display text-3xl font-bold text-ink">
        Applicants{job ? ` for ${job.title}` : ''}
      </h1>
      <p className="mt-1 text-ink-soft">Review resumes and move each candidate through your pipeline.</p>

      {error && <p className="mt-4 rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

      {applications.length === 0 ? (
        <div className="mt-8">
          <EmptyState title="No applicants yet" message="Check back once candidates start applying." />
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {applications.map((app) => (
            <div key={app.id} className="pin-card rounded-lg border border-ink/10 bg-card p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-display font-semibold text-ink">{app.applicantName}</p>
                  <p className="text-sm text-ink-soft">{app.applicantEmail}</p>
                  <p className="mt-1 font-mono text-xs text-ink-soft">
                    Applied {new Date(app.appliedAt).toLocaleDateString()}
                  </p>
                </div>
                <StatusBadge status={app.status} />
              </div>

              {app.coverLetter && (
                <p className="mt-3 whitespace-pre-line rounded-md bg-paper px-3 py-2 text-sm text-ink">
                  {app.coverLetter}
                </p>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <a
                  href={app.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  View resume ↗
                </a>

                <select
                  value={app.status}
                  onChange={(e) => handleStatusChange(app.id, e.target.value)}
                  className="ml-auto rounded-md border border-ink/15 bg-paper px-3 py-1.5 text-sm outline-none focus:border-primary"
                >
                  {NEXT_STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
