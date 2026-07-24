import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';

const TYPE_LABEL = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  CONTRACT: 'Contract',
  INTERNSHIP: 'Internship',
  REMOTE: 'Remote',
};

function formatSalary(min, max) {
  if (!min && !max) return null;
  const fmt = (n) => `$${Number(n).toLocaleString()}`;
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  return fmt(min || max);
}

export default function JobCard({ job }) {
  const salary = formatSalary(job.salaryMin, job.salaryMax);

  return (
    <Link
      to={`/jobs/${job.id}`}
      className="pin-card block rounded-lg border border-[var(--color-ink)]/10 bg-[var(--color-card)] p-5 shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-semibold text-[var(--color-ink)]">{job.title}</h3>
          <p className="mt-0.5 text-sm text-[var(--color-ink-soft)]">{job.companyName}</p>
        </div>
        <StatusBadge status={job.status} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2 font-mono text-xs text-[var(--color-ink-soft)]">
        <span className="rounded border border-[var(--color-ink)]/10 bg-[var(--color-paper)] px-2 py-1">
          📍 {job.location}
        </span>
        <span className="rounded border border-[var(--color-ink)]/10 bg-[var(--color-paper)] px-2 py-1">
          {TYPE_LABEL[job.employmentType] || job.employmentType}
        </span>
        <span className="rounded border border-[var(--color-ink)]/10 bg-[var(--color-paper)] px-2 py-1">
          {job.categoryName}
        </span>
        {salary && (
          <span className="rounded border border-[var(--color-accent)]/40 bg-[var(--color-accent-soft)] px-2 py-1 text-[var(--color-ink)]">
            {salary}
          </span>
        )}
      </div>
    </Link>
  );
}
