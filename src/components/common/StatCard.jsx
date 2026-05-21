export function StatCard({ title, value, note, tone }) {
  return (
    <article className={`stat-card ${tone || ""}`}>
      <span>{title}</span>
      <strong>{value}</strong>
      {note ? <small>{note}</small> : null}
    </article>
  );
}
