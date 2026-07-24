import { useEffect, useState } from 'react';
import api from '../services/api';
import JobCard from '../components/JobCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

export default function JobBoard() {
  const [jobs, setJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ keyword: '', location: '', categoryId: '' });

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchJobs(activeFilters = filters) {
    setLoading(true);
    try {
      const params = {};
      if (activeFilters.keyword) params.keyword = activeFilters.keyword;
      if (activeFilters.location) params.location = activeFilters.location;
      if (activeFilters.categoryId) params.categoryId = activeFilters.categoryId;
      const { data } = await api.get('/jobs', { params });
      setJobs(data);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    fetchJobs(filters);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-[var(--color-ink)]">Open positions</h1>
        <p className="mt-1 text-[var(--color-ink-soft)]">Freshly pinned vacancies, updated as employers post them.</p>
      </div>

      <form onSubmit={handleSubmit} className="mb-8 flex flex-wrap gap-3 rounded-lg border border-[var(--color-ink)]/10 bg-[var(--color-card)] p-4">
        <input
          value={filters.keyword}
          onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
          placeholder="Search job title…"
          className="min-w-[180px] flex-1 rounded-md border border-[var(--color-ink)]/15 px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
        />
        <input
          value={filters.location}
          onChange={(e) => setFilters({ ...filters, location: e.target.value })}
          placeholder="Location…"
          className="min-w-[140px] flex-1 rounded-md border border-[var(--color-ink)]/15 px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
        />
        <select
          value={filters.categoryId}
          onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}
          className="min-w-[160px] rounded-md border border-[var(--color-ink)]/15 px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-md bg-[var(--color-primary)] px-5 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-light)]"
        >
          Search
        </button>
      </form>

      {loading ? (
        <LoadingSpinner label="Fetching listings…" />
      ) : jobs.length === 0 ? (
        <EmptyState title="No jobs match your search" message="Try clearing a filter or checking back later." />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
