import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { extractErrorMessage } from '../services/api';
import JobCard from '../components/JobCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

export default function SavedJobs() {
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/saved-jobs')
      .then(({ data }) => setSaved(data))
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner label="Loading saved jobs" />;

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <h1 className="font-display text-2xl font-bold text-ink">Saved jobs</h1>
      <p className="mt-1 text-ink-soft">Jobs you've bookmarked for later.</p>

      {error && <p className="mt-4 rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

      {saved.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="Nothing saved yet"
            message="Bookmark a job from its detail page to find it here."
            action={<Link to="/" className="text-primary hover:underline">Browse open jobs</Link>}
          />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {saved.map((s) => <JobCard key={s.id} job={s.job} />)}
        </div>
      )}
    </div>
  );
}
