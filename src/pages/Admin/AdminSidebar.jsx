import logo from "../../assets/Captura de tela 2026-04-14 121940.png";

const adminTabs = [
  ["dashboard", "Visão geral", "▦"],
  ["solicitacoes", "Solicitações", "◷"],
  ["alteracoes", "Auditoria", "▥"],
  ["notificacoes", "Alertas", "△"],
  ["financeiro", "Financeiro", "$"],
  ["voos", "Logística", "⌁"],
];

const overviewLinks = [
  ["Resumo", "admin-overview-summary"],
  ["Indicadores", "admin-overview-indicators"],
  ["Prioridades", "admin-overview-priorities"],
];

export function AdminSidebar({ activeTab, onTab, onExport, onLogout }) {
  function goToOverviewSection(targetId) {
    onTab("dashboard");
    window.setTimeout(() => {
      document.getElementById(targetId)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 80);
  }

  return (
    <aside className="dashboard-sidebar" aria-label="Menu administrativo">
      <div className="sidebar-window-dots" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <div className="sidebar-logo">
        <span className="logo-mark sidebar-logo-mark">
          <img src={logo} alt="Fiocruz Brasília" />
        </span>
        <span>
          NUGB
          <small>Painel administrativo</small>
        </span>
        <b aria-hidden="true">‹‹</b>
      </div>

      <nav className="sidebar-nav">
        <span className="sidebar-section-label">Menu</span>
        {adminTabs.map(([tab, label, icon]) => (
          <div className="sidebar-nav-block" key={tab}>
            <button
              type="button"
              className={activeTab === tab ? "active" : ""}
              onClick={() => onTab(tab)}
            >
              <span className="sidebar-nav-icon" aria-hidden="true">
                {icon}
              </span>
              <span className="sidebar-nav-label">{label}</span>
              {tab === "dashboard" && <span className="sidebar-caret">⌃</span>}
              {tab === "notificacoes" && <span className="sidebar-badge">3</span>}
            </button>
            {tab === "dashboard" && activeTab === "dashboard" && (
              <div className="sidebar-subnav">
                {overviewLinks.map(([item, targetId], index) => (
                  <button
                    type="button"
                    key={item}
                    onClick={() => goToOverviewSection(targetId)}
                  >
                    <span className={`sidebar-subdot dot-${index + 1}`} />
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        <div className="sidebar-action-group">
          <span className="sidebar-section-label">Operações</span>
          <button type="button" onClick={onExport}>
            Exportar Excel
          </button>
          <button type="button" onClick={onLogout}>
            Sair
          </button>
        </div>
      </nav>
    </aside>
  );
}
