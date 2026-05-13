export function PlaceholderView({ label, route }: { label: string; route: string }) {
  return (
    <section className="placeholder-view" aria-label={label}>
      <p className="eyebrow">Relay / {route}</p>
      <h1>{label.toLowerCase()}</h1>
    </section>
  );
}
