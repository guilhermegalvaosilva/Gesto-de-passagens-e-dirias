import { normalizedFilterText } from "../../utils/formatters";

function isCreation(log) {
  const type = normalizedFilterText(log.tipoAlteracao);
  const reason = normalizedFilterText(log.motivoAlteracao);
  return type.includes("criacao") || reason.includes("novo formulario");
}

function notificationLabel(log) {
  return isCreation(log) ? "Novo formulário" : "Edição";
}

function NotificationMetric({ label, value, note }) {
  return (
    <article className="notification-metric">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </article>
  );
}

export function NotificationsPanel({ logs }) {
  const recent = logs.slice(0, 10);
  const creationCount = logs.filter(isCreation).length;
  const editionCount = logs.length - creationCount;
  const latest = logs[0]?.dataAlteracaoClient || "-";

  return (
    <section className="dashboard-section admin-panel active">
      <div className="dashboard-card notification-panel">
        <div className="notification-hero">
          <div>
            <span className="section-kicker">Notificações</span>
            <h3>Atualizações do sistema</h3>
            <p className="table-note">
              Eventos recentes de criação e edição de formulários para
              acompanhamento administrativo.
            </p>
          </div>
          <div className="notification-latest">
            <span>Última atualização</span>
            <strong>{latest}</strong>
          </div>
        </div>

        <div className="notification-metric-grid">
          <NotificationMetric label="Eventos registrados" value={logs.length} note="Histórico total disponível." />
          <NotificationMetric label="Novos formulários" value={creationCount} note="Solicitações criadas." />
          <NotificationMetric label="Edições" value={editionCount} note="Atualizações em registros existentes." />
        </div>

        <div className="notifications-timeline">
          {recent.length ? (
            recent.map((log) => (
              <article className="notification-event" key={log.id}>
                <div className="notification-marker" aria-hidden="true" />
                <div className="notification-event-content">
                  <div className="notification-event-top">
                    <span className="notification-type">{notificationLabel(log)}</span>
                    <small>{log.dataAlteracaoClient}</small>
                  </div>
                  <strong>{log.titulo || "Registro sem título"}</strong>
                  <p>
                    {log.campoAlterado || "Formulário"}: {log.valorOriginal || "-"} →{" "}
                    {log.valorNovo || "-"}
                  </p>
                  <span className="notification-author">por {log.alteradoPor || "sistema"}</span>
                </div>
              </article>
            ))
          ) : (
            <div className="empty-records">Ainda não há notificações.</div>
          )}
        </div>
      </div>
    </section>
  );
}
