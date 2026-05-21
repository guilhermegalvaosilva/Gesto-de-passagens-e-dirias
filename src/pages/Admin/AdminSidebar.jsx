const navGroups = [
  [
    "Principal",
    [
      ["dashboard", "Dashboard", "📊"],
      ["solicitacoes", "Solicitações", "📝"],
    ],
  ],
  [
    "Operacional",
    [
      ["passagens", "Passagens", "✈️"],
      ["diarias", "Diárias", "🏨"],
      ["alertas", "Alertas", "⚠️"],
      ["alteracoes", "Alterações", "A"],
    ],
  ],
  [
    "Gestão",
    [["financeiro", "Financeiro", "💰"]],
  ],
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
        {navGroups.map(([groupLabel, items]) => (
          <div className="sidebar-group" key={groupLabel}>
            <p className="sidebar-group-title">{groupLabel}</p>
            {items.map(([tab, label, icon]) => (
              <button
                type="button"
                key={tab}
                className={activeTab === tab ? "active" : ""}
                onClick={() => onTab(tab)}
              >
                <span className="sidebar-nav-icon">{icon}</span>
                <span className="sidebar-nav-label">{label}</span>
              </button>
            ))}
          </div>
        ))}

        <div className="sidebar-group sidebar-group-actions">
          <p className="sidebar-group-title">Gestão</p>
          <button type="button" className="sidebar-action-button" onClick={onExport}>
            <span className="sidebar-nav-icon">📄</span>
            <span>Exportar Excel</span>
          </button>
        </div>

        <div className="sidebar-group sidebar-group-actions">
          <p className="sidebar-group-title">Conta</p>
          <button type="button" className="sidebar-action-button sidebar-logout" onClick={onLogout}>
            <span className="sidebar-nav-icon">🔒</span>
            <span>Sair</span>
          </button>
        </div>
      </nav>
    </aside>
  );
}
