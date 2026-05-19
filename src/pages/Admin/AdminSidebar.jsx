const adminTabs = [
  ["dashboard", "Resumo"],
  ["solicitacoes", "Solicitacoes"],
  ["alteracoes", "Auditoria"],
  ["notificacoes", "Alertas"],
  ["financeiro", "Financeiro"],
  ["voos", "Voos"],
];

export function AdminSidebar({ activeTab, onTab, onExport, onLogout }) {
  return (
    <aside className="dashboard-sidebar" aria-label="Menu administrativo">
      <div className="sidebar-logo">
        <span>
          Admin
          <small>NUGB</small>
        </span>
      </div>

      <nav className="sidebar-nav">
        {adminTabs.map(([tab, label]) => (
          <button
            type="button"
            key={tab}
            className={activeTab === tab ? "active" : ""}
            onClick={() => onTab(tab)}
          >
            <span className="sidebar-nav-label">{label}</span>
          </button>
        ))}

        <div className="sidebar-action-group">
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
