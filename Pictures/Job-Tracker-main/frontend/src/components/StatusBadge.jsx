const COLORS = {
  OPEN: 'text-success',
  CLOSED: 'text-danger',
  PENDING: 'text-ink-soft',
  REVIEWED: 'text-primary',
  SHORTLISTED: 'text-accent',
  ACCEPTED: 'text-success',
  REJECTED: 'text-danger',
};

export default function StatusBadge({ status }) {
  const color = COLORS[status] || 'text-ink-soft';
  return <span className={`stamp ${color}`}>{status}</span>;
}
