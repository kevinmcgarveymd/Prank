import { SITE, KIDS, APPS } from "@/lib/site";
import { Mascot } from "@/components/Mascot";

export default function Landing() {
  return (
    <main className="container landing">
      <header className="landing-hero">
        <h1>{SITE.name}</h1>
        <p className="tagline">{SITE.tagline}</p>
      </header>

      <section className="bio">
        <h2>Meet the builders</h2>
        <div className="kid-grid">
          {KIDS.map((kid) => (
            <article
              className="kid-card"
              key={kid.name}
              style={{ borderTopColor: kid.color }}
            >
              <div className="kid-mascot">
                <Mascot variant={kid.mascot} size={140} />
              </div>
              <h3>
                {kid.name}
                <span className="kid-age">age {kid.age}</span>
              </h3>
              <p className="kid-loves-label">Loves:</p>
              <ul className="kid-loves">
                {kid.loves.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <p className="bio-text">
          Rowan and Mae are building apps that make everyday life a little more
          fun — for themselves, their family, and other kids. Every app here
          starts as one of their ideas.
        </p>
      </section>

      <section className="apps">
        <h2>Their apps</h2>
        <div className="app-grid">
          {APPS.map((app) => (
            <a className="app-card" href={app.href} key={app.slug}>
              <div className="app-emoji" aria-hidden>
                {app.emoji}
              </div>
              <h3>{app.title}</h3>
              <p>{app.blurb}</p>
              <span className="app-cta">Open →</span>
            </a>
          ))}
        </div>
      </section>

      <footer className="landing-footer">
        <p>Made with kindness. More apps coming soon.</p>
      </footer>
    </main>
  );
}
