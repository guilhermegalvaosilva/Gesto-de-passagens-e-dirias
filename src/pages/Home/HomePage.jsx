function Feature({ number, title, text }) {
  return (
    <div className="feature-item">
      <span className="feature-icon">{number}</span>
      <div>
        <strong>{title}</strong>
        <p className="mini-note">{text}</p>
      </div>
    </div>
  );
}

export function HomePage({ onAdmin, onForm, storageMode }) {
  return (
    <section className="landing-card launchpad-card">
      <div className="premium-hero launchpad-hero">
        <div className="hero-copy">
          <span className="badge">Fiocruz Brasília | NUGB</span>
          <h2>Solicitação de passagens e diárias</h2>
          <p>
            Ambiente institucional para registrar viagens vinculadas a projetos,
            eventos e atividades da Fiocruz, com comprovante e acompanhamento
            administrativo.
          </p>
          <div className="home-buttons choice-buttons">
            <button className="btn btn-admin" type="button" onClick={onForm}>
              Nova solicitação
            </button>
            <button className="btn btn-secondary" type="button" onClick={onAdmin}>
              Abrir painel
            </button>
          </div>
          <div className="hero-inline-status">
            <span />
            {storageMode}
          </div>
        </div>
        <div className="hero-panel route-panel" aria-label="Resumo do sistema">
          <div className="route-card-top">
            <span className="chip">Servico digital</span>
            <strong>NUGB / Fiocruz Brasília</strong>
          </div>
          <div className="route-map" aria-hidden="true">
            <span className="node origin" />
            <span className="node stop" />
            <span className="node destination" />
            <span className="route-line" />
          </div>
          <div className="institutional-note">
            <span>Fluxo NUGB</span>
            <strong>Registro único para conferência, comprovante e auditoria.</strong>
          </div>
          <div className="metric-stack route-metrics">
            <article>
              <small>01</small>
              <strong>Cadastro</strong>
              <span>Evento, projeto e viajante</span>
            </article>
            <article>
              <small>02</small>
              <strong>Conferencia</strong>
              <span>Passagens, diárias e datas</span>
            </article>
            <article>
              <small>03</small>
              <strong>Comprovante</strong>
              <span>PDF e trilha administrativa</span>
            </article>
          </div>
        </div>
      </div>
      <div className="service-strip" aria-label="Informações do serviço">
        <div>
          <span>Unidade</span>
          <strong>Fiocruz Brasília</strong>
        </div>
        <div>
          <span>Area responsavel</span>
          <strong>NUGB</strong>
        </div>
        <div>
          <span>Finalidade</span>
          <strong>Passagens e diárias</strong>
        </div>
      </div>
      <div className="feature-list premium-features runway-features">
        <Feature number="01" title="Evento" text="Contexto, datas, local e justificativa em uma entrada clara." />
        <Feature number="02" title="Projeto" text="Vínculo com ID FIOTEC, coordenação e setor Fiocruz." />
        <Feature number="03" title="Administração" text="Painel com fila, auditoria, financeiro, voos e exportação." />
      </div>
    </section>
  );
}
