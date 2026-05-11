import { PRANK_CATALOG } from "@/lib/catalog";

export function CodeOfHonor() {
  return (
    <aside className="code-of-honor" aria-label="Prank Master's Code of Honor">
      <h2>🛡️ The Prank Master&apos;s Code of Honor</h2>
      <ul>
        {PRANK_CATALOG.ethics_rules.map((rule) => (
          <li key={rule}>{rule}</li>
        ))}
      </ul>
    </aside>
  );
}
