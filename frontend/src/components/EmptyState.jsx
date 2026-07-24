export default function EmptyState({ title, message, action }) {
  return (
    <div className="rounded-lg border-2 border-dashed border-ink/15 bg-card/60 px-6 py-14 text-center">
      <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
      {message && <p className="mx-auto mt-2 max-w-sm text-sm text-ink-soft">{message}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
