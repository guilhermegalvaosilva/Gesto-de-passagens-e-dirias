export function HomePage({ onAdmin, onForm, storageMode }) {
  return (
    <section className="landing-card launchpad-card">
      <div className="premium-hero launchpad-hero">
        <div className="hero-copy">
          <span className="badge">NUGB</span>
          <h2>Solicitacao de passagens e diarias</h2>
          <p>
            Registre uma viagem institucional e acompanhe o fluxo pelo painel
            administrativo.
          </p>
          <div className="home-buttons choice-buttons">
            <button className="btn btn-admin" type="button" onClick={onForm}>
              Nova solicitacao
            </button>
            <button className="btn btn-secondary" type="button" onClick={onAdmin}>
              Painel admin
            </button>
          </div>
          <div className="hero-inline-status">
            <span />
            {storageMode}
          </div>
        </div>
      </div>
    </section>
  );
}
